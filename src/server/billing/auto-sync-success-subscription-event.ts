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

type FamilyAccountSuccessSyncRow = {
  id: string;
  primary_user_id: string | null;
  auto_renew_enabled: boolean | null;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  next_billing_at: string | null;
  subscription_state: string | null;
  status: string | null;
  grace_period_ends_at: string | null;
  payment_failed_at: string | null;
  last_payment_status: string | null;
  canceled_at: string | null;
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

function normalizeLower(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : null;
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

  const { data: familyAccountRow, error: familyAccountError } = await admin
    .from("family_accounts")
    .select(
      [
        "id",
        "primary_user_id",
        "auto_renew_enabled",
        "current_period_starts_at",
        "current_period_ends_at",
        "next_billing_at",
        "subscription_state",
        "status",
        "grace_period_ends_at",
        "payment_failed_at",
        "last_payment_status",
        "canceled_at",
      ].join(", ")
    )
    .eq("id", paymentIntent.account_id)
    .single();

  if (familyAccountError || !familyAccountRow) {
    throw new Error(
      `Failed to load family account for subscription sync: ${familyAccountError?.message ?? "not found"}`
    );
  }

  const familyAccount =
    familyAccountRow as unknown as FamilyAccountSuccessSyncRow;

  if (!familyAccount.primary_user_id) {
    throw new Error(
      "Family account must have primary_user_id before creating success subscription event"
    );
  }

  if (!familyAccount.current_period_starts_at || !familyAccount.current_period_ends_at) {
    throw new Error(
      "Billing period must be synced before creating success subscription event"
    );
  }

  const normalizedSubscriptionState = normalizeLower(familyAccount.subscription_state);
  const normalizedLastPaymentStatus = normalizeLower(familyAccount.last_payment_status);

  const isRecoveryState =
    normalizedSubscriptionState === "past_due" ||
    normalizedSubscriptionState === "grace_period" ||
    normalizedLastPaymentStatus === "failed";

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

  const eventType = isRecoveryState
    ? "payment_recovered"
    : (existingSuccessEventCount ?? 0) > 0
      ? "subscription_renewed_success"
      : "subscription_started_success";

  // 🔒 Duplicate success-event guard

  const existingEventId =
    providerEventId ??
    `provider_payment:${provider}:${providerPaymentId}:success_snapshot`;

  const { data: existingEvent } = await admin
    .from("billing_subscription_events")
    .select("id, event_type")
    .eq("external_event_id", existingEventId)
    .maybeSingle();

  if (existingEvent) {
    // 🔁 Deterministic retry — возвращаем уже существующий результат
    const projectedBillingSnapshot =
      await projectBillingSubscriptionSnapshotToFamilyAccount(familyAccount.id);

    return {
      ok: true,
      eventType: existingEvent.event_type,
      subscriptionEventId: existingEvent.id,
      familyAccountId: familyAccount.id,
      projectedBillingSnapshot,
      recoveryDetected: isRecoveryState,
      reused: true,
    };
  }

  const effectiveEventAt =
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
    gracePeriodEndsAt: null,
    paymentFailedAt: null,
    canceledAt:
      eventType === "payment_recovered"
        ? null
        : familyAccount.canceled_at,
    source,
    externalEventId: existingEventId,
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
      previousSubscriptionState: familyAccount.subscription_state,
      previousStatus: familyAccount.status,
      previousGracePeriodEndsAt: familyAccount.grace_period_ends_at,
      previousPaymentFailedAt: familyAccount.payment_failed_at,
      previousLastPaymentStatus: familyAccount.last_payment_status,
      recoveryDetected: isRecoveryState,
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
    recoveryDetected: isRecoveryState,
  };
}