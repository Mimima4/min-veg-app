import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type BillingSubscriptionEventType =
  | "subscription_started_success"
  | "subscription_renewed_success"
  | "payment_failed"
  | "payment_recovered"
  | "auto_renew_disabled"
  | "auto_renew_enabled"
  | "cancellation_scheduled";

export type BillingSubscriptionCycle = "monthly" | "yearly";

type Input = {
  familyAccountId: string;
  primaryUserId: string;
  eventType: BillingSubscriptionEventType;
  eventAt?: string;
  planCode?: string | null;
  subscriptionState?: string | null;
  currentPeriodStartsAt?: string | null;
  currentPeriodEndsAt?: string | null;
  nextBillingAt?: string | null;
  billingCycle?: BillingSubscriptionCycle | null;
  autoRenewEnabled?: boolean | null;
  gracePeriodEndsAt?: string | null;
  paymentFailedAt?: string | null;
  lastPaymentStatus?: string | null;
  canceledAt?: string | null;
  source?: string;
  externalEventId?: string | null;
  payload?: Record<string, unknown>;
};

export async function recordBillingSubscriptionEvent({
  familyAccountId,
  primaryUserId,
  eventType,
  eventAt,
  planCode = null,
  subscriptionState = null,
  currentPeriodStartsAt = null,
  currentPeriodEndsAt = null,
  nextBillingAt = null,
  billingCycle = null,
  autoRenewEnabled = null,
  gracePeriodEndsAt = null,
  paymentFailedAt = null,
  lastPaymentStatus = null,
  canceledAt = null,
  source = "system",
  externalEventId = null,
  payload = {},
}: Input) {
  const admin = createAdminClient();

  const row = {
    family_account_id: familyAccountId,
    primary_user_id: primaryUserId,
    event_type: eventType,
    event_at: eventAt ?? new Date().toISOString(),
    plan_code: planCode,
    subscription_state: subscriptionState,
    current_period_starts_at: currentPeriodStartsAt,
    current_period_ends_at: currentPeriodEndsAt,
    next_billing_at: nextBillingAt,
    billing_cycle: billingCycle,
    auto_renew_enabled: autoRenewEnabled,
    grace_period_ends_at: gracePeriodEndsAt,
    payment_failed_at: paymentFailedAt,
    last_payment_status: lastPaymentStatus,
    canceled_at: canceledAt,
    source,
    external_event_id: externalEventId,
    payload,
  };

  if (externalEventId) {
    const { data, error } = await admin
      .from("billing_subscription_events")
      .upsert(row, {
        onConflict: "external_event_id",
        ignoreDuplicates: false,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(
        `Failed to upsert billing_subscription_event: ${error.message}`
      );
    }

    return data as { id: string };
  }

  const { data, error } = await admin
    .from("billing_subscription_events")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    throw new Error(
      `Failed to insert billing_subscription_event: ${error.message}`
    );
  }

  return data as { id: string };
}
