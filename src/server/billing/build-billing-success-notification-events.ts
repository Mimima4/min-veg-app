import "server-only";

import type {
  BillingNotificationCandidate,
} from "@/server/billing/build-billing-notification-events";

export type BillingSuccessNotificationEventType =
  | "subscription_started_success"
  | "subscription_renewed_success";

export type BillingSubscriptionHistoryRow = {
  id: string;
  family_account_id: string;
  primary_user_id: string;
  event_type: BillingSuccessNotificationEventType;
  event_at: string;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  billing_cycle: "monthly" | "yearly" | null;
  payload: Record<string, unknown> | null;
};

type Input = {
  rows: BillingSubscriptionHistoryRow[];
  emailByUserId: Map<string, string | null>;
  recipientNameByUserId: Map<string, string | null>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getString(
  record: Record<string, unknown> | null,
  key: string
): string | null {
  if (!record) {
    return null;
  }

  const value = record[key];

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function makeDedupeKey(
  familyAccountId: string,
  eventType: BillingSuccessNotificationEventType,
  subscriptionEventId: string
): string {
  return `${familyAccountId}:${eventType}:subscription-event:${subscriptionEventId}`;
}

export function buildBillingSuccessNotificationEvents({
  rows,
  emailByUserId,
  recipientNameByUserId,
}: Input): BillingNotificationCandidate[] {
  return rows.map((row) => {
    const payload = asRecord(row.payload);

    return {
      familyAccountId: row.family_account_id,
      primaryUserId: row.primary_user_id,
      eventType: row.event_type,
      dedupeKey: makeDedupeKey(
        row.family_account_id,
        row.event_type,
        row.id
      ),
      scheduledFor: row.event_at,
      payload: {
        email: emailByUserId.get(row.primary_user_id) ?? null,
        recipientName: recipientNameByUserId.get(row.primary_user_id) ?? null,
        currentPeriodStartsAt: row.current_period_starts_at,
        currentPeriodEndsAt: row.current_period_ends_at,
        billingCycle: row.billing_cycle,
        planCode: getString(payload, "planCode"),
      },
    };
  });
}