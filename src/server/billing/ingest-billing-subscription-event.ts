import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { projectBillingSubscriptionSnapshotToFamilyAccount } from "@/server/billing/project-billing-subscription-snapshot";
import {
  recordBillingSubscriptionEvent,
  type BillingSubscriptionCycle,
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

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

function normalizeOptionalLowerText(
  value: string | null | undefined
): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

function ensureAllowedEventType(value: string): BillingSubscriptionEventType {
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

  const normalizedPlanCode = normalizeOptionalLowerText(
    input.planCode ?? familyAccount.plan_code ?? null
  );
  const normalizedSubscriptionState = normalizeOptionalLowerText(
    input.subscriptionState ?? null
  );
  const normalizedEventAt = normalizeOptionalIso(input.eventAt ?? null);
  const normalizedCurrentPeriodStartsAt = normalizeOptionalIso(
    input.currentPeriodStartsAt ?? null
  );
  const normalizedCurrentPeriodEndsAt = normalizeOptionalIso(
    input.currentPeriodEndsAt ?? null
  );
  const normalizedNextBillingAt = normalizeOptionalIso(
    input.nextBillingAt ?? null
  );
  const normalizedGracePeriodEndsAt = normalizeOptionalIso(
    input.gracePeriodEndsAt ?? null
  );
  const normalizedPaymentFailedAt = normalizeOptionalIso(
    input.paymentFailedAt ?? null
  );
  const normalizedCanceledAt = normalizeOptionalIso(input.canceledAt ?? null);
  const normalizedLastPaymentStatus = normalizeOptionalLowerText(
    input.lastPaymentStatus ?? null
  );

  const event = await recordBillingSubscriptionEvent({
    familyAccountId: familyAccount.id,
    primaryUserId: familyAccount.primary_user_id,
    eventType,
    eventAt: normalizedEventAt ?? undefined,
    planCode: normalizedPlanCode,
    subscriptionState: normalizedSubscriptionState,
    currentPeriodStartsAt: normalizedCurrentPeriodStartsAt,
    currentPeriodEndsAt: normalizedCurrentPeriodEndsAt,
    nextBillingAt: normalizedNextBillingAt,
    billingCycle: input.billingCycle ?? null,
    autoRenewEnabled: input.autoRenewEnabled ?? null,
    gracePeriodEndsAt: normalizedGracePeriodEndsAt,
    paymentFailedAt: normalizedPaymentFailedAt,
    lastPaymentStatus: normalizedLastPaymentStatus,
    canceledAt: normalizedCanceledAt,
    source: normalizeOptionalText(input.source) ?? "internal_ingest",
    externalEventId: normalizeOptionalText(input.externalEventId) ?? null,
    payload: {
      planCode: normalizedPlanCode,
      subscriptionState: normalizedSubscriptionState,
      currentPeriodStartsAt: normalizedCurrentPeriodStartsAt,
      currentPeriodEndsAt: normalizedCurrentPeriodEndsAt,
      nextBillingAt: normalizedNextBillingAt,
      autoRenewEnabled: input.autoRenewEnabled ?? null,
      gracePeriodEndsAt: normalizedGracePeriodEndsAt,
      paymentFailedAt: normalizedPaymentFailedAt,
      lastPaymentStatus: normalizedLastPaymentStatus,
      canceledAt: normalizedCanceledAt,
      ...(input.payload ?? {}),
    },
  });

  const projectedBillingSnapshot =
    await projectBillingSubscriptionSnapshotToFamilyAccount(familyAccount.id);

  const syncResult = await syncBillingNotificationEvents();

  return {
    subscriptionEventId: event.id,
    familyAccountId: familyAccount.id,
    primaryUserId: familyAccount.primary_user_id,
    projectedBillingSnapshot,
    syncResult,
  };
}
