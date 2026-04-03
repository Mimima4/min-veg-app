import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { autoReconcileSafePaymentMismatch } from "@/server/billing/auto-reconcile-safe-payment-mismatch";
import { autoSyncBillingPeriod } from "@/server/billing/auto-sync-billing-period";
import { autoSyncSuccessSubscriptionEvent } from "@/server/billing/auto-sync-success-subscription-event";
import { createScheduledPlanChange } from "@/server/billing/create-scheduled-plan-change";
import { recordBillingLedgerEntry } from "@/server/billing/record-billing-ledger-entry";
import { enqueueTripletexExport } from "@/server/billing/enqueue-tripletex-export";
import { syncBillingNotificationEvents } from "@/server/billing/sync-billing-notification-events";
import { supersedeComplimentaryAccessByPaid } from "@/server/billing/supersede-complimentary-access-by-paid";
import { consumeSchoolReferralDiscount } from "@/server/billing/consume-school-referral-discount";
import {
  inferBillingCustomerType,
  normalizeNorwayMva,
} from "@/server/billing/normalize-billing-accounting";

type ContinueProviderPaymentOrchestrationInput = {
  paymentIntentId: string;
  provider: string;
  providerPaymentId: string;
  providerEventId?: string | null;
  paidAt?: string | null;
  rawPayload?: Record<string, unknown> | null;
};

function normalizeLower(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

export async function continueProviderPaymentOrchestration(
  input: ContinueProviderPaymentOrchestrationInput
) {
  const supabase = createAdminClient();

  const { data: providerPayment, error: providerPaymentError } = await supabase
    .from("provider_payments")
    .select(
      "id, payment_intent_id, provider, provider_payment_id, provider_event_id, amount, currency, payment_status, paid_at, raw_payload"
    )
    .eq("payment_intent_id", input.paymentIntentId)
    .eq("provider", input.provider)
    .eq("provider_payment_id", input.providerPaymentId)
    .maybeSingle();

  if (providerPaymentError) {
    throw new Error(
      `Failed to load provider payment for orchestration: ${providerPaymentError.message}`
    );
  }

  if (!providerPayment) {
    throw new Error("Provider payment not found for orchestration");
  }

  if (providerPayment.payment_status !== "paid") {
    return {
      ok: true,
      skipped: true,
      reason: "provider_payment_not_paid",
    };
  }

  const { data: paymentIntentRow, error: paymentIntentRowError } = await supabase
    .from("payment_intents")
    .select("account_type, account_id, plan_code, billing_cycle, status, pricing_source, pricing_context_id, pricing_context_type")
    .eq("id", input.paymentIntentId)
    .single();

  if (paymentIntentRowError || !paymentIntentRow) {
    throw new Error(
      `Failed to read payment intent owner for orchestration: ${paymentIntentRowError?.message ?? "not found"}`
    );
  }

  if (paymentIntentRow.account_type !== "family") {
    return {
      ok: true,
      skipped: true,
      reason: "unsupported_account_type",
    };
  }

  await autoReconcileSafePaymentMismatch({
    familyAccountId: paymentIntentRow.account_id,
  });

  const { data: familyAccountBefore, error: familyAccountBeforeError } =
    await supabase
      .from("family_accounts")
      .select(
        "id, plan_code, next_billing_at, current_period_starts_at, current_period_ends_at"
      )
      .eq("id", paymentIntentRow.account_id)
      .single();

  if (familyAccountBeforeError || !familyAccountBefore) {
    throw new Error(
      `Failed to read family account before orchestration: ${familyAccountBeforeError?.message ?? "not found"}`
    );
  }

  const currentPlanCodeBefore = normalizeLower(familyAccountBefore.plan_code);
  const paidPlanCode = normalizeLower(paymentIntentRow.plan_code);
  const currentPeriodBoundary =
    familyAccountBefore.current_period_ends_at ??
    familyAccountBefore.next_billing_at ??
    null;

  const shouldDeferPlanChange =
    Boolean(currentPlanCodeBefore) &&
    Boolean(paidPlanCode) &&
    currentPlanCodeBefore !== paidPlanCode &&
    Boolean(currentPeriodBoundary);

  let scheduledPlanChange:
    | Awaited<ReturnType<typeof createScheduledPlanChange>>
    | null = null;

  let successSyncResult:
    | Awaited<ReturnType<typeof autoSyncSuccessSubscriptionEvent>>
    | null = null;

  if (shouldDeferPlanChange) {
    scheduledPlanChange = await createScheduledPlanChange({
      familyAccountId: familyAccountBefore.id,
      targetPlanCode: paidPlanCode!,
      targetBillingCycle: paymentIntentRow.billing_cycle,
      effectiveAt:
        currentPeriodBoundary ??
        input.paidAt ??
        providerPayment.paid_at ??
        new Date().toISOString(),
      createdBy: "system",
      source: "provider_payment",
    });
  } else {
    await autoSyncBillingPeriod({
      paymentIntentId: input.paymentIntentId,
      paidAt: input.paidAt ?? providerPayment.paid_at ?? null,
    });

    successSyncResult = await autoSyncSuccessSubscriptionEvent({
      paymentIntentId: input.paymentIntentId,
      provider: input.provider,
      providerPaymentId: input.providerPaymentId,
      providerEventId: input.providerEventId ?? null,
      eventAt: input.paidAt ?? providerPayment.paid_at ?? null,
      source: "provider_payment_auto_sync",
    });
  }

  const { data: familyAccountAfter, error: familyAccountAfterError } =
    await supabase
      .from("family_accounts")
      .select(
        "id, plan_code, next_billing_at, current_period_starts_at, current_period_ends_at"
      )
      .eq("id", paymentIntentRow.account_id)
      .single();

  if (familyAccountAfterError || !familyAccountAfter) {
    throw new Error(
      `Failed to read family account after orchestration: ${familyAccountAfterError?.message ?? "not found"}`
    );
  }

  await supersedeComplimentaryAccessByPaid({
    familyAccountId: familyAccountAfter.id,
  });

  if (
    paymentIntentRow.billing_cycle === "yearly" &&
    paymentIntentRow.pricing_source === "school_referral" &&
    paymentIntentRow.pricing_context_type === "school_referral_context" &&
    paymentIntentRow.pricing_context_id
  ) {
    await consumeSchoolReferralDiscount({
      referralContextId: paymentIntentRow.pricing_context_id,
    });
  }

  const customerType = inferBillingCustomerType({
    customerOrgNumber: null,
  });

  const accounting = normalizeNorwayMva({
    grossAmount: providerPayment.amount,
    customerType,
  });

  const periodStart =
    scheduledPlanChange?.target_current_period_starts_at ??
    familyAccountAfter.current_period_starts_at ??
    familyAccountAfter.next_billing_at ??
    input.paidAt ??
    providerPayment.paid_at ??
    new Date().toISOString();

  const periodEnd =
    scheduledPlanChange?.target_current_period_ends_at ??
    familyAccountAfter.current_period_ends_at ??
    familyAccountAfter.next_billing_at ??
    null;

  const ledgerExternalReference = `provider-payment:${input.provider}:${input.providerPaymentId}`;

  const { data: existingLedgerEntry, error: existingLedgerEntryError } =
    await supabase
      .from("billing_ledger_entries")
      .select("id")
      .eq("external_reference", ledgerExternalReference)
      .maybeSingle();

  if (existingLedgerEntryError) {
    throw new Error(
      `Failed to inspect existing billing ledger entry for orchestration: ${existingLedgerEntryError.message}`
    );
  }

  const ledgerEntry = existingLedgerEntry
    ? existingLedgerEntry
    : await recordBillingLedgerEntry({
        familyAccountId: familyAccountAfter.id,
        entryType: "provider_payment_received",
        direction: "credit",
        amount: providerPayment.amount,
        currency: providerPayment.currency,
        planCode: paymentIntentRow.plan_code,
        billingCycle: paymentIntentRow.billing_cycle,
        occurredAt:
          input.paidAt ?? providerPayment.paid_at ?? new Date().toISOString(),
        source: "provider_payment",
        provider: input.provider,
        providerPaymentId: input.providerPaymentId,
        paymentIntentId: input.paymentIntentId,
        externalReference: ledgerExternalReference,
        payload: {
          providerEventId: input.providerEventId ?? null,
          rawPayload: input.rawPayload ?? providerPayment.raw_payload ?? {},
          deferredPlanChangeId: scheduledPlanChange?.id ?? null,
          deferredPlanChangeEffectiveAt: scheduledPlanChange?.effective_at ?? null,
        },
        grossAmount: accounting.grossAmount,
        netAmount: accounting.netAmount,
        mvaAmount: accounting.mvaAmount,
        mvaRate: accounting.mvaRate,
        mvaCode: accounting.mvaCode,
        customerType,
        customerOrgNumber: null,
        customerReference: familyAccountAfter.id,
        periodStart,
        periodEnd,
      });

  await enqueueTripletexExport({
    ledgerEntryId: ledgerEntry.id,
  });

  await syncBillingNotificationEvents({
    familyAccountIds: [familyAccountAfter.id],
    successSubscriptionEventIds: successSyncResult?.subscriptionEventId
      ? [successSyncResult.subscriptionEventId]
      : [],
  });

  return {
    ok: true,
    familyAccountId: familyAccountAfter.id,
    deferredPlanChangeId: scheduledPlanChange?.id ?? null,
    subscriptionEventId: successSyncResult?.subscriptionEventId ?? null,
    ledgerEntryId: ledgerEntry.id,
  };
}