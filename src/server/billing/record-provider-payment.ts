import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { syncPaymentIntentFromProviderPayment } from "@/server/billing/sync-intent-from-provider";
import { autoReconcileSafePaymentMismatch } from "@/server/billing/auto-reconcile-safe-payment-mismatch";
import { autoSyncBillingPeriod } from "@/server/billing/auto-sync-billing-period";
import { autoSyncSuccessSubscriptionEvent } from "@/server/billing/auto-sync-success-subscription-event";
import { createScheduledPlanChange } from "@/server/billing/create-scheduled-plan-change";
import { recordBillingLedgerEntry } from "@/server/billing/record-billing-ledger-entry";
import { enqueueTripletexExport } from "@/server/billing/enqueue-tripletex-export";
import { inferBillingCustomerType, normalizeNorwayMva } from "@/server/billing/normalize-billing-accounting";

type ProviderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

type RecordProviderPaymentInput = {
  paymentIntentId: string;
  provider: string;
  providerPaymentId: string;
  providerEventId?: string | null;
  amount: number;
  currency?: string;
  paymentStatus: ProviderPaymentStatus;
  paidAt?: string | null;
  rawPayload?: Record<string, unknown> | null;
};

function normalizeText(value: string, field: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} is required`);
  }

  return normalized;
}

export async function recordProviderPayment(input: RecordProviderPaymentInput) {
  const supabase = createAdminClient();

  const paymentIntentId = normalizeText(input.paymentIntentId, "paymentIntentId");
  const provider = normalizeText(input.provider, "provider").toLowerCase();
  const providerPaymentId = normalizeText(
    input.providerPaymentId,
    "providerPaymentId"
  );
  const providerEventId = input.providerEventId?.trim() || null;
  const currency = (input.currency?.trim() || "NOK").toUpperCase();

  if (
    input.paymentStatus !== "pending" &&
    input.paymentStatus !== "paid" &&
    input.paymentStatus !== "failed" &&
    input.paymentStatus !== "refunded"
  ) {
    throw new Error("Invalid paymentStatus");
  }

  if (typeof input.amount !== "number" || Number.isNaN(input.amount) || input.amount <= 0) {
    throw new Error("Invalid amount");
  }

  const { data: paymentIntent, error: paymentIntentError } = await supabase
    .from("payment_intents")
    .select("id, account_type, account_id, plan_code, billing_cycle, status")
    .eq("id", paymentIntentId)
    .single();

  if (paymentIntentError || !paymentIntent) {
    throw new Error("Payment intent not found");
  }

  const { data: existingByPaymentId, error: existingByPaymentIdError } = await supabase
    .from("provider_payments")
    .select("*")
    .eq("provider", provider)
    .eq("provider_payment_id", providerPaymentId)
    .maybeSingle();

  if (existingByPaymentIdError) {
    throw new Error(
      `Failed to load existing provider payment by provider_payment_id: ${existingByPaymentIdError.message}`
    );
  }

  if (existingByPaymentId) {
    if (existingByPaymentId.payment_intent_id !== paymentIntentId) {
      throw new Error(
        "This provider payment is already linked to a different payment intent"
      );
    }

    return {
      wasReplay: true,
      providerPayment: existingByPaymentId,
    };
  }

  if (providerEventId) {
    const { data: existingByEventId, error: existingByEventIdError } = await supabase
      .from("provider_payments")
      .select("*")
      .eq("provider", provider)
      .eq("provider_event_id", providerEventId)
      .maybeSingle();

    if (existingByEventIdError) {
      throw new Error(
        `Failed to load existing provider payment by provider_event_id: ${existingByEventIdError.message}`
      );
    }

    if (existingByEventId) {
      if (existingByEventId.payment_intent_id !== paymentIntentId) {
        throw new Error(
          "This provider event is already linked to a different payment intent"
        );
      }

      return {
        wasReplay: true,
        providerPayment: existingByEventId,
      };
    }
  }

  const { data, error } = await supabase
    .from("provider_payments")
    .insert({
      payment_intent_id: paymentIntentId,
      provider,
      provider_payment_id: providerPaymentId,
      provider_event_id: providerEventId,
      amount: input.amount,
      currency,
      payment_status: input.paymentStatus,
      paid_at: input.paidAt ?? null,
      raw_payload: input.rawPayload ?? {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to record provider payment: ${error.message}`);
  }

  await syncPaymentIntentFromProviderPayment({
    paymentIntentId,
    providerPaymentStatus: input.paymentStatus,
  });

  const { data: paymentIntentRow, error: paymentIntentRowError } = await supabase
    .from("payment_intents")
    .select("account_type, account_id, plan_code, billing_cycle, status")
    .eq("id", paymentIntentId)
    .single();

  if (paymentIntentRowError) {
    throw new Error(
      `Failed to read payment intent owner after provider payment insert: ${paymentIntentRowError.message}`
    );
  }

  if (paymentIntentRow.account_type === "family" && input.paymentStatus === "paid") {
    await autoReconcileSafePaymentMismatch({
      familyAccountId: paymentIntentRow.account_id,
    });

    await autoSyncBillingPeriod({
      paymentIntentId,
      paidAt: input.paidAt ?? data.paid_at ?? null,
    });

    await autoSyncSuccessSubscriptionEvent({
      paymentIntentId,
      provider,
      providerPaymentId,
      providerEventId,
      eventAt: input.paidAt ?? data.paid_at ?? null,
      source: "provider_payment_auto_sync",
    });

    const { data: familyAccount, error: familyAccountError } = await supabase
      .from("family_accounts")
      .select(
        "id, plan_code, next_billing_at, current_period_starts_at, current_period_ends_at"
      )
      .eq("id", paymentIntentRow.account_id)
      .single();

    if (familyAccountError || !familyAccount) {
      throw new Error(
        `Failed to read family account for scheduled plan evaluation: ${familyAccountError?.message ?? "not found"}`
      );
    }

    const customerType = inferBillingCustomerType({
      customerOrgNumber: null,
    });

    const accounting = normalizeNorwayMva({
      grossAmount: input.amount,
      customerType,
    });

    const periodStart =
      familyAccount.current_period_starts_at ??
      familyAccount.next_billing_at ??
      input.paidAt ??
      data.paid_at ??
      new Date().toISOString();

    const periodEnd =
      familyAccount.current_period_ends_at ??
      familyAccount.next_billing_at ??
      null;

    const ledgerEntry = await recordBillingLedgerEntry({
      familyAccountId: familyAccount.id,
      entryType: "provider_payment_received",
      direction: "credit",
      amount: input.amount,
      currency,
      planCode: paymentIntentRow.plan_code,
      billingCycle: paymentIntentRow.billing_cycle,
      occurredAt: input.paidAt ?? data.paid_at ?? new Date().toISOString(),
      source: "provider_payment",
      provider,
      providerPaymentId,
      paymentIntentId,
      externalReference: `provider-payment:${provider}:${providerPaymentId}`,
      payload: {
        providerEventId,
        rawPayload: input.rawPayload ?? {},
      },
      grossAmount: accounting.grossAmount,
      netAmount: accounting.netAmount,
      mvaAmount: accounting.mvaAmount,
      mvaRate: accounting.mvaRate,
      mvaCode: accounting.mvaCode,
      customerType,
      customerOrgNumber: null,
      customerReference: familyAccount.id,
      periodStart,
      periodEnd,
    });

    await enqueueTripletexExport({
      ledgerEntryId: ledgerEntry.id,
    });

    const currentPlanCode = familyAccount.plan_code?.trim().toLowerCase() ?? null;
    const paidPlanCode = paymentIntentRow.plan_code?.trim().toLowerCase() ?? null;

    if (
      currentPlanCode &&
      paidPlanCode &&
      currentPlanCode !== paidPlanCode &&
      familyAccount.next_billing_at
    ) {
      await createScheduledPlanChange({
        familyAccountId: familyAccount.id,
        targetPlanCode: paidPlanCode,
        targetBillingCycle: paymentIntentRow.billing_cycle,
        effectiveAt: familyAccount.next_billing_at,
        createdBy: "system",
        source: "provider_payment",
      });
    }
  }

  return {
    wasReplay: false,
    providerPayment: data,
  };
}
