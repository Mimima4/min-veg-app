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

type Input = {
  familyAccountId: string;
  primaryUserId: string;
  eventType: BillingSubscriptionEventType;
  eventAt?: string;
  currentPeriodStartsAt?: string | null;
  currentPeriodEndsAt?: string | null;
  billingCycle?: "monthly" | "yearly" | null;
  source?: string;
  externalEventId?: string | null;
  payload?: Record<string, unknown>;
};

export async function recordBillingSubscriptionEvent({
  familyAccountId,
  primaryUserId,
  eventType,
  eventAt,
  currentPeriodStartsAt = null,
  currentPeriodEndsAt = null,
  billingCycle = null,
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
    current_period_starts_at: currentPeriodStartsAt,
    current_period_ends_at: currentPeriodEndsAt,
    billing_cycle: billingCycle,
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

    return data;
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

  return data;
}