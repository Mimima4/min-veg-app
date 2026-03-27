import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  recordBillingSubscriptionEvent,
  type BillingSubscriptionEventType,
} from "@/server/billing/record-billing-subscription-event";
import { syncBillingNotificationEvents } from "@/server/billing/sync-billing-notification-events";

const ALLOWED_EVENT_TYPES: BillingSubscriptionEventType[] = [
  "subscription_started_success",
  "subscription_renewed_success",
  "payment_failed",
  "payment_recovered",
  "auto_renew_disabled",
  "auto_renew_enabled",
  "cancellation_scheduled",
];

type Input = {
  email: string;
  eventType: BillingSubscriptionEventType;
  eventAt?: string | null;
  currentPeriodStartsAt?: string | null;
  currentPeriodEndsAt?: string | null;
  billingCycle?: "monthly" | "yearly" | null;
  source?: string;
  externalEventId?: string | null;
  payload?: Record<string, unknown>;
};

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function ensureAllowedEventType(
  value: string
): BillingSubscriptionEventType {
  if (ALLOWED_EVENT_TYPES.includes(value as BillingSubscriptionEventType)) {
    return value as BillingSubscriptionEventType;
  }

  throw new Error(`Unsupported billing subscription event type: ${value}`);
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

export async function ingestBillingSubscriptionEvent(input: Input) {
  const admin = createAdminClient();

  const email = normalizeEmail(input.email);
  const eventType = ensureAllowedEventType(input.eventType);

  const { data: authUsersData, error: authUsersError } =
    await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

  if (authUsersError) {
    throw new Error(`Failed to load auth users: ${authUsersError.message}`);
  }

  const authUser = (authUsersData.users ?? []).find(
    (user) => user.email?.trim().toLowerCase() === email
  );

  if (!authUser) {
    throw new Error(`User with email ${email} was not found in auth.users.`);
  }

  const { data: familyAccount, error: familyAccountError } = await admin
    .from("family_accounts")
    .select("id, primary_user_id, plan_code")
    .eq("primary_user_id", authUser.id)
    .maybeSingle();

  if (familyAccountError) {
    throw new Error(
      `Failed to load family account: ${familyAccountError.message}`
    );
  }

  if (!familyAccount) {
    throw new Error(`No family account found for ${email}.`);
  }

  const event = await recordBillingSubscriptionEvent({
    familyAccountId: familyAccount.id,
    primaryUserId: familyAccount.primary_user_id,
    eventType,
    eventAt: normalizeOptionalIso(input.eventAt ?? null) ?? undefined,
    currentPeriodStartsAt: normalizeOptionalIso(
      input.currentPeriodStartsAt ?? null
    ),
    currentPeriodEndsAt: normalizeOptionalIso(
      input.currentPeriodEndsAt ?? null
    ),
    billingCycle: input.billingCycle ?? null,
    source: input.source ?? "internal_ingest",
    externalEventId:
      input.externalEventId && input.externalEventId.trim().length > 0
        ? input.externalEventId.trim()
        : null,
    payload: {
      planCode: familyAccount.plan_code ?? null,
      ...(input.payload ?? {}),
    },
  });

  const syncResult = await syncBillingNotificationEvents();

  return {
    subscriptionEventId: event.id,
    familyAccountId: familyAccount.id,
    primaryUserId: familyAccount.primary_user_id,
    syncResult,
  };
}