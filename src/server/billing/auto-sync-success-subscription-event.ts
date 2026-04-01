import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { projectBillingSubscriptionSnapshotToFamilyAccount } from "@/server/billing/project-billing-subscription-snapshot";
import { recordBillingSubscriptionEvent } from "@/server/billing/record-billing-subscription-event";

type Input = {
  paymentIntentId: string;
  provider: string;
  providerPaymentId: string;
  providerEventId?: string | null;
  eventAt?: string | null;
  source?: string | null;
};

function requireText(value: string, field: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} is required`);
  }

  return normalized;
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

function normalizeOptionalIso(value: string | null | undefined): string | null {
  if (!value || !value.trim()) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid datetime value: ${value}`);
  }

  return parsed.toISOString();
}

export async function autoSyncSuccessSubscriptionEvent(input: Input) {
  const admin = createAdminClient();

  const paymentIntentId = requireText(input.paymentIntentId, "paymentIntentId");
  const provider = requireText(input.provider, "provider").toLowerCase();
  const providerPaymentId = requireText(
    input.providerPaymentId,
    "providerPaymentId"
  );
  const providerEventId = normalizeOptionalText(input.providerEventId);
  const source = normalizeOptionalText(input.source) ?? "provider_payment_auto_sync";

  const { data: paymentIntent, error: paymentIntentError } = await admin
    .from("payment_intents")
    .select("id, account_type, account_id, plan_code, billing_cycle, status")
    .eq("id", paymentIntentId)
    .single();

  if (paymentIntentError || !paymentIntent) {
    throw new Error(
      `Failed to load payment intent for subscription sync: ${paymentIntentError?.message ?? "not found"}`
    );
  }

  if (paymentIntent.account_type !== "family") {
    return {
      ok: true,
      skipped: true,
      reason: "unsupported_account_type",
    };
  }

  if (paymentIntent.status !== "paid") {
    return {
      ok: true,
      skipped: true,
      reason: "payment_intent_not_paid",
    };
  }

  if (
    paymentIntent.billing_cycle !== "monthly" &&
    paymentIntent.billing_cycle !== "yearly"
  ) {
    throw new Error(
      `Unsupported billing cycle for subscription sync: ${paymentIntent.billing_cycle}`
    );
  }

  const { data: familyAccount, error: familyAccountError } = await admin
    .from("family_accounts")
    .select(
      "id, primary_user_id, auto_renew_enabled, current_period_starts_at, current_period_ends_at, next_billing_at"
    )
    .eq("id", paymentIntent.account_id)
    .single();

  if (familyAccountError || !familyAccount) {
    throw new Error(
      `Failed to load family account for subscription sync: ${familyAccountError?.message ?? "not found"}`
    );
  }

  if (!familyAccount.current_period_starts_at || !familyAccount.current_period_ends_at) {
    throw new Error(
      "Billing period must be synced before creating success subscription event"
    );
  }

  const { count: existingSuccessEventCount, error: existingSuccessEventCountError } =
    await admin
      .from("billing_subscription_events")
      .select("id", { count: "exact", head: true })
      .eq("family_account_id", familyAccount.id)
      .in("event_type", [
        "subscription_started_success",
        "subscription_renewed_success",
        "payment_recovered",
      ]);

  if (existingSuccessEventCountError) {
    throw new Error(
      `Failed to inspect prior billing success events: ${existingSuccessEventCountError.message}`
    );
  }

  const eventType =
    (existingSuccessEventCount ?? 0) > 0
      ? "subscription_renewed_success"
      : "subscription_started_success";

  const externalEventId =
    providerEventId ??
    `provider_payment:${provider}:${providerPaymentId}:success_snapshot`;

  const effectiveEventAt =
    normalizeOptionalIso(familyAccount.current_period_starts_at) ??
    normalizeOptionalIso(input.eventAt) ??
    new Date().toISOString();

  const event = await recordBillingSubscriptionEvent({
    familyAccountId: familyAccount.id,
    primaryUserId: familyAccount.primary_user_id,
    eventType,
    eventAt: effectiveEventAt,
    planCode: paymentIntent.plan_code,
    subscriptionState: "active",
    currentPeriodStartsAt: familyAccount.current_period_starts_at,
    currentPeriodEndsAt: familyAccount.current_period_ends_at,
    nextBillingAt: familyAccount.next_billing_at,
    billingCycle: paymentIntent.billing_cycle,
    autoRenewEnabled: familyAccount.auto_renew_enabled,
    lastPaymentStatus: "paid",
    source,
    externalEventId,
    payload: {
      trigger: "successful_provider_payment",
      paymentIntentId: paymentIntent.id,
      provider,
      providerPaymentId,
      providerEventId,
      paidAt: normalizeOptionalIso(input.eventAt),
      effectiveEventAt,
      planCode: paymentIntent.plan_code,
      billingCycle: paymentIntent.billing_cycle,
      currentPeriodStartsAt: familyAccount.current_period_starts_at,
      currentPeriodEndsAt: familyAccount.current_period_ends_at,
      nextBillingAt: familyAccount.next_billing_at,
    },
  });

  const projectedBillingSnapshot =
    await projectBillingSubscriptionSnapshotToFamilyAccount(familyAccount.id);

  return {
    ok: true,
    eventType,
    subscriptionEventId: event.id,
    familyAccountId: familyAccount.id,
    projectedBillingSnapshot,
  };
}
