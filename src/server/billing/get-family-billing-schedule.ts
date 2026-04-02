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

type ScheduledPlanChangeRow = {
  id: string;
  family_account_id: string;
  target_plan_code: string;
  target_billing_cycle: string;
  effective_at: string;
  target_current_period_starts_at: string | null;
  target_current_period_ends_at: string | null;
  target_next_billing_at: string | null;
  status: string;
  created_by: string;
  source: string | null;
  canceled_at: string | null;
  cancel_reason: string | null;
  applied_at: string | null;
  applied_subscription_event_id: string | null;
  created_at: string;
  updated_at: string;
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

function isRiskEvent(row: BillingSubscriptionEventRow): boolean {
  return (
    row.event_type === "payment_failed" ||
    row.event_type === "cancellation_scheduled" ||
    normalizeLowerText(row.subscription_state) === "grace_period" ||
    normalizeLowerText(row.subscription_state) === "past_due"
  );
}

function mapRiskEvent(row: BillingSubscriptionEventRow) {
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

function resolveMaxChildrenFromPlanCode(planCode: string | null, fallback: number | null) {
  switch (normalizeLowerText(planCode)) {
    case "family_basic":
    case "school_referred_family_basic":
      return 4;
    case "family_plus":
    case "school_referred_family_plus":
      return 6;
    default:
      return fallback ?? 0;
  }
}

function addBillingCycle(startIso: string, billingCycle: string | null) {
  const start = new Date(startIso);

  if (Number.isNaN(start.getTime())) {
    return {
      currentPeriodStartsAt: startIso,
      currentPeriodEndsAt: null,
      nextBillingAt: null,
    };
  }

  const end = new Date(start);

  if (normalizeLowerText(billingCycle) === "yearly") {
    end.setUTCFullYear(end.getUTCFullYear() + 1);
  } else {
    end.setUTCMonth(end.getUTCMonth() + 1);
  }

  return {
    currentPeriodStartsAt: start.toISOString(),
    currentPeriodEndsAt: end.toISOString(),
    nextBillingAt: end.toISOString(),
  };
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

  const currentFamilyAccount =
    (familyAccount as unknown) as FamilyAccountRow;

  const { data: scheduledRows, error: scheduledRowsError } = await admin
    .from("billing_scheduled_plan_changes")
    .select("*")
    .eq("family_account_id", params.familyAccountId)
    .eq("status", "scheduled")
    .order("effective_at", { ascending: true });

  if (scheduledRowsError) {
    throw new Error(
      `Failed to load scheduled plan changes: ${scheduledRowsError.message}`
    );
  }

  const scheduledPlanChanges =
    ((scheduledRows ?? []) as unknown) as ScheduledPlanChangeRow[];
  const scheduled = scheduledPlanChanges[0] ?? null;

  const isRealPlanChange =
    scheduled != null &&
    normalizeLowerText(scheduled.target_plan_code) !==
      normalizeLowerText(currentFamilyAccount.plan_code);

  const nextScheduledPlanTransition =
    isRealPlanChange && scheduled
      ? {
          eventId: scheduled.id,
          eventType: "scheduled_plan_transition",
          effectiveAt: scheduled.effective_at,
          planCode: scheduled.target_plan_code,
          subscriptionState: "active",
          currentPeriodStartsAt: normalizeText(
            scheduled.target_current_period_starts_at
          ),
          currentPeriodEndsAt: normalizeText(
            scheduled.target_current_period_ends_at
          ),
          nextBillingAt: normalizeText(scheduled.target_next_billing_at),
          billingCycle: normalizeText(scheduled.target_billing_cycle),
          autoRenewEnabled: currentFamilyAccount.auto_renew_enabled,
          lastPaymentStatus: "paid",
          source: normalizeText(scheduled.source),
          externalEventId: null,
          maxChildren: resolveMaxChildrenFromPlanCode(
            scheduled.target_plan_code,
            currentFamilyAccount.max_children
          ),
        }
      : null;

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
  const futureRows = rows.filter((row) => isFutureEvent(row, now));
  const nextRiskEvent = futureRows.find((row) => isRiskEvent(row)) ?? null;

  const nextRenewalSnapshot = (() => {
    if (isRealPlanChange && scheduled) {
      return {
        eventId: scheduled.id,
        eventType: "scheduled_plan_transition",
        effectiveAt: scheduled.effective_at,
        planCode: scheduled.target_plan_code,
        subscriptionState: "active",
        currentPeriodStartsAt: normalizeText(
          scheduled.target_current_period_starts_at
        ),
        currentPeriodEndsAt: normalizeText(
          scheduled.target_current_period_ends_at
        ),
        nextBillingAt: normalizeText(scheduled.target_next_billing_at),
        billingCycle: normalizeText(scheduled.target_billing_cycle),
        autoRenewEnabled: currentFamilyAccount.auto_renew_enabled,
        lastPaymentStatus: "paid",
        source: normalizeText(scheduled.source),
        externalEventId: null,
      };
    }

    if (
      currentFamilyAccount.auto_renew_enabled &&
      currentFamilyAccount.next_billing_at
    ) {
      const billingCycle =
        normalizeLowerText(currentFamilyAccount.plan_code) === "family_plus" ||
        normalizeLowerText(currentFamilyAccount.plan_code) === "family_basic"
          ? "monthly"
          : "monthly";

      const projected = addBillingCycle(
        currentFamilyAccount.next_billing_at,
        billingCycle
      );

      return {
        eventId: null,
        eventType: "projected_renewal",
        effectiveAt: currentFamilyAccount.next_billing_at,
        planCode: currentFamilyAccount.plan_code,
        subscriptionState: "active",
        currentPeriodStartsAt: projected.currentPeriodStartsAt,
        currentPeriodEndsAt: projected.currentPeriodEndsAt,
        nextBillingAt: projected.nextBillingAt,
        billingCycle,
        autoRenewEnabled: currentFamilyAccount.auto_renew_enabled,
        lastPaymentStatus: currentFamilyAccount.last_payment_status,
        source: "projected_from_current_snapshot",
        externalEventId: null,
      };
    }

    return null;
  })();

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
    nextRenewalSnapshot,
    nextScheduledPlanTransition,
    nextRiskEvent: nextRiskEvent ? mapRiskEvent(nextRiskEvent) : null,
  };
}
