import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type BillingSubscriptionEventRow = {
  id: string;
  family_account_id: string;
  event_type: string;
  event_at: string;
  plan_code: string | null;
  subscription_state: string | null;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  next_billing_at: string | null;
  billing_cycle: string | null;
  auto_renew_enabled: boolean | null;
  last_payment_status: string | null;
  source: string | null;
  external_event_id: string | null;
  created_at: string;
};

type FamilyAccountRow = {
  id: string;
  plan_type: string | null;
  plan_code: string | null;
  status: string | null;
  subscription_state: string | null;
  max_children: number | null;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  next_billing_at: string | null;
  auto_renew_enabled: boolean | null;
  last_payment_status: string | null;
};

function parseDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

function normalizeLowerText(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

function isFutureEvent(row: BillingSubscriptionEventRow, now: Date): boolean {
  const eventAt = parseDate(row.event_at);

  if (!eventAt) {
    return false;
  }

  return eventAt.getTime() > now.getTime();
}

function isScheduledPlanEvent(row: BillingSubscriptionEventRow): boolean {
  return (
    row.event_type === "subscription_started_success" ||
    row.event_type === "subscription_renewed_success" ||
    row.event_type === "payment_recovered"
  );
}

function isRiskEvent(row: BillingSubscriptionEventRow): boolean {
  return (
    row.event_type === "payment_failed" ||
    row.event_type === "cancellation_scheduled" ||
    normalizeLowerText(row.subscription_state) === "grace_period" ||
    normalizeLowerText(row.subscription_state) === "past_due"
  );
}

function mapEvent(row: BillingSubscriptionEventRow) {
  return {
    eventId: row.id,
    eventType: row.event_type,
    effectiveAt: row.event_at,
    planCode: normalizeText(row.plan_code),
    subscriptionState: normalizeText(row.subscription_state),
    currentPeriodStartsAt: normalizeText(row.current_period_starts_at),
    currentPeriodEndsAt: normalizeText(row.current_period_ends_at),
    nextBillingAt: normalizeText(row.next_billing_at),
    billingCycle: normalizeText(row.billing_cycle),
    autoRenewEnabled: row.auto_renew_enabled,
    lastPaymentStatus: normalizeText(row.last_payment_status),
    source: normalizeText(row.source),
    externalEventId: normalizeText(row.external_event_id),
  };
}

function isCommercialPlanTransition(
  row: BillingSubscriptionEventRow,
  currentPlanCode: string | null
): boolean {
  const rowPlanCode = normalizeLowerText(row.plan_code);
  const activePlanCode = normalizeLowerText(currentPlanCode);

  if (!rowPlanCode) {
    return false;
  }

  if (!activePlanCode) {
    return true;
  }

  return rowPlanCode !== activePlanCode;
}

export async function getFamilyBillingSchedule(params: {
  familyAccountId: string;
  now?: Date;
}) {
  const admin = createAdminClient();
  const now = params.now ?? new Date();

  const { data: familyAccount, error: familyAccountError } = await admin
    .from("family_accounts")
    .select(
      [
        "id",
        "plan_type",
        "plan_code",
        "status",
        "subscription_state",
        "max_children",
        "current_period_starts_at",
        "current_period_ends_at",
        "next_billing_at",
        "auto_renew_enabled",
        "last_payment_status",
      ].join(", ")
    )
    .eq("id", params.familyAccountId)
    .single();

  if (familyAccountError || !familyAccount) {
    throw new Error(
      `Failed to load family billing schedule snapshot: ${familyAccountError?.message ?? "not found"}`
    );
  }

  const { data: events, error: eventsError } = await admin
    .from("billing_subscription_events")
    .select(
      [
        "id",
        "family_account_id",
        "event_type",
        "event_at",
        "plan_code",
        "subscription_state",
        "current_period_starts_at",
        "current_period_ends_at",
        "next_billing_at",
        "billing_cycle",
        "auto_renew_enabled",
        "last_payment_status",
        "source",
        "external_event_id",
        "created_at",
      ].join(", ")
    )
    .eq("family_account_id", params.familyAccountId)
    .order("event_at", { ascending: true })
    .order("created_at", { ascending: true });

  if (eventsError) {
    throw new Error(
      `Failed to load family billing schedule events: ${eventsError.message}`
    );
  }

  const rows = ((events ?? []) as unknown) as BillingSubscriptionEventRow[];
  const currentFamilyAccount =
    (familyAccount as unknown) as FamilyAccountRow;

  const futureRows = rows.filter((row) => isFutureEvent(row, now));

  const nextRenewalSnapshot =
    futureRows.find((row) => isScheduledPlanEvent(row)) ?? null;

  const nextScheduledPlanTransition =
    futureRows.find(
      (row) =>
        isScheduledPlanEvent(row) &&
        isCommercialPlanTransition(row, currentFamilyAccount.plan_code)
    ) ?? null;

  const nextRiskEvent =
    futureRows.find((row) => isRiskEvent(row)) ?? null;

  return {
    current: {
      familyAccountId: currentFamilyAccount.id,
      planType: currentFamilyAccount.plan_type,
      planCode: currentFamilyAccount.plan_code,
      status: currentFamilyAccount.status,
      subscriptionState: currentFamilyAccount.subscription_state,
      maxChildren: currentFamilyAccount.max_children,
      currentPeriodStartsAt: currentFamilyAccount.current_period_starts_at,
      currentPeriodEndsAt: currentFamilyAccount.current_period_ends_at,
      nextBillingAt: currentFamilyAccount.next_billing_at,
      autoRenewEnabled: currentFamilyAccount.auto_renew_enabled,
      lastPaymentStatus: currentFamilyAccount.last_payment_status,
    },
    nextRenewalSnapshot: nextRenewalSnapshot
      ? mapEvent(nextRenewalSnapshot)
      : null,
    nextScheduledPlanTransition: nextScheduledPlanTransition
      ? mapEvent(nextScheduledPlanTransition)
      : null,
    nextRiskEvent: nextRiskEvent ? mapEvent(nextRiskEvent) : null,
  };
}
