import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { BillingSubscriptionEventType } from "@/server/billing/record-billing-subscription-event";

type BillingSubscriptionProjectionRow = {
  id: string;
  family_account_id: string;
  event_type: BillingSubscriptionEventType;
  event_at: string;
  plan_code: string | null;
  subscription_state: string | null;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  next_billing_at: string | null;
  auto_renew_enabled: boolean | null;
  grace_period_ends_at: string | null;
  payment_failed_at: string | null;
  last_payment_status: string | null;
  canceled_at: string | null;
  created_at: string;
};

type FamilyAccountBillingRow = {
  id: string;
  plan_type: string | null;
  plan_code: string | null;
  status: string | null;
  subscription_state: string | null;
  max_children: number | null;
  next_billing_at: string | null;
};

type StringProjectionKey =
  | "plan_code"
  | "subscription_state"
  | "current_period_starts_at"
  | "current_period_ends_at"
  | "next_billing_at"
  | "grace_period_ends_at"
  | "payment_failed_at"
  | "last_payment_status"
  | "canceled_at";

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : null;
}

function normalizeLowerText(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

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

function getLatestNonNullString(
  rows: BillingSubscriptionProjectionRow[],
  key: StringProjectionKey
): string | null {
  for (const row of rows) {
    const value = row[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getLatestNonNullBoolean(
  rows: BillingSubscriptionProjectionRow[],
  key: "auto_renew_enabled"
): boolean | null {
  for (const row of rows) {
    const value = row[key];

    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
}

function resolvePlanTypeFromPlanCode(
  planCode: string | null,
  fallbackPlanType: string | null
): string {
  const normalized = normalizeLowerText(planCode);

  switch (normalized) {
    case "demo":
      return "demo";
    case "trial":
      return "trial";
    case "family_basic":
    case "school_referred_family_basic":
      return "family_basic";
    case "family_plus":
    case "school_referred_family_plus":
      return "family_plus";
    default:
      return normalizeLowerText(fallbackPlanType) ?? "trial";
  }
}

function resolveMaxChildrenFromPlanCode(
  planCode: string | null,
  fallbackMaxChildren: number | null
): number {
  const normalized = normalizeLowerText(planCode);

  switch (normalized) {
    case "family_basic":
    case "school_referred_family_basic":
      return 4;
    case "family_plus":
    case "school_referred_family_plus":
      return 6;
    default:
      return Math.max(fallbackMaxChildren ?? 0, 0);
  }
}

function resolveLatestAutoRenewState(
  latest: BillingSubscriptionProjectionRow,
  fallback: boolean | null
): boolean | null {
  if (typeof latest.auto_renew_enabled === "boolean") {
    return latest.auto_renew_enabled;
  }

  switch (latest.event_type) {
    case "auto_renew_disabled":
    case "cancellation_scheduled":
      return false;
    case "auto_renew_enabled":
      return true;
    default:
      return fallback;
  }
}

function resolveLatestNextBillingAt(
  latest: BillingSubscriptionProjectionRow,
  fallback: string | null
): string | null {
  if (
    latest.event_type === "auto_renew_disabled" ||
    latest.event_type === "cancellation_scheduled"
  ) {
    return normalizeText(latest.next_billing_at) ?? null;
  }

  return normalizeText(latest.next_billing_at) ?? fallback;
}

function resolveLatestGracePeriodEndsAt(
  latest: BillingSubscriptionProjectionRow,
  fallback: string | null
): string | null {
  switch (latest.event_type) {
    case "subscription_started_success":
    case "subscription_renewed_success":
    case "payment_recovered":
      return normalizeText(latest.grace_period_ends_at) ?? null;
    case "payment_failed":
      return normalizeText(latest.grace_period_ends_at) ?? null;
    default:
      return normalizeText(latest.grace_period_ends_at) ?? fallback;
  }
}

function resolveLatestPaymentFailedAt(
  latest: BillingSubscriptionProjectionRow,
  fallback: string | null
): string | null {
  switch (latest.event_type) {
    case "subscription_started_success":
    case "subscription_renewed_success":
    case "payment_recovered":
      return normalizeText(latest.payment_failed_at) ?? null;
    case "payment_failed":
      return normalizeText(latest.payment_failed_at) ?? latest.event_at;
    default:
      return normalizeText(latest.payment_failed_at) ?? fallback;
  }
}

function resolveLatestCanceledAt(
  latest: BillingSubscriptionProjectionRow,
  fallback: string | null
): string | null {
  switch (latest.event_type) {
    case "subscription_started_success":
    case "subscription_renewed_success":
    case "payment_recovered":
    case "auto_renew_enabled":
      return normalizeText(latest.canceled_at) ?? null;
    case "cancellation_scheduled":
      return normalizeText(latest.canceled_at) ?? latest.event_at;
    default:
      return normalizeText(latest.canceled_at) ?? fallback;
  }
}

function resolveLatestPaymentStatus(
  latest: BillingSubscriptionProjectionRow,
  fallback: string | null
): string | null {
  const explicit = normalizeLowerText(latest.last_payment_status);

  if (explicit) {
    return explicit;
  }

  switch (latest.event_type) {
    case "subscription_started_success":
    case "subscription_renewed_success":
    case "payment_recovered":
      return "paid";
    case "payment_failed":
      return "failed";
    default:
      return normalizeLowerText(fallback);
  }
}

function resolveLatestSubscriptionState(args: {
  latest: BillingSubscriptionProjectionRow;
  fallbackState: string | null;
  currentPeriodEndsAt: string | null;
  gracePeriodEndsAt: string | null;
}): string {
  const explicit = normalizeLowerText(args.latest.subscription_state);

  if (explicit) {
    return explicit;
  }

  const now = new Date();
  const currentPeriodEndsAtDate = parseDate(args.currentPeriodEndsAt);
  const gracePeriodEndsAtDate = parseDate(args.gracePeriodEndsAt);

  switch (args.latest.event_type) {
    case "subscription_started_success":
    case "subscription_renewed_success":
    case "payment_recovered":
      return "active";
    case "payment_failed":
      return gracePeriodEndsAtDate &&
        gracePeriodEndsAtDate.getTime() > now.getTime()
        ? "grace_period"
        : "past_due";
    case "auto_renew_disabled":
    case "auto_renew_enabled":
      return "active";
    case "cancellation_scheduled":
      return "canceled";
    default:
      if (
        currentPeriodEndsAtDate &&
        currentPeriodEndsAtDate.getTime() <= now.getTime()
      ) {
        return "inactive";
      }

      return normalizeLowerText(args.fallbackState) ?? "active";
  }
}

function resolveStatusFromSubscriptionState(subscriptionState: string): string {
  switch (subscriptionState) {
    case "grace_period":
      return "grace_period";
    case "past_due":
      return "past_due";
    case "canceled":
    case "cancelled":
      return "canceled";
    case "inactive":
    case "trial_expired":
      return "inactive";
    default:
      return "active";
  }
}

function buildProjectedSnapshot(
  rows: BillingSubscriptionProjectionRow[],
  familyAccount: FamilyAccountBillingRow
) {
  const latest = rows[0];

  if (!latest) {
    return null;
  }

  const planCode =
    normalizeLowerText(getLatestNonNullString(rows, "plan_code")) ??
    normalizeLowerText(familyAccount.plan_code);

  const currentPeriodStartsAt = getLatestNonNullString(
    rows,
    "current_period_starts_at"
  );
  const currentPeriodEndsAt = getLatestNonNullString(
    rows,
    "current_period_ends_at"
  );

  const autoRenewEnabled =
    resolveLatestAutoRenewState(
      latest,
      getLatestNonNullBoolean(rows, "auto_renew_enabled")
    ) ?? false;

  const nextBillingAt =
    resolveLatestNextBillingAt(
      latest,
      getLatestNonNullString(rows, "next_billing_at") ??
        normalizeText(familyAccount.next_billing_at)
    ) ??
    (autoRenewEnabled ? currentPeriodEndsAt : null);

  const gracePeriodEndsAt = resolveLatestGracePeriodEndsAt(
    latest,
    getLatestNonNullString(rows, "grace_period_ends_at")
  );

  const paymentFailedAt = resolveLatestPaymentFailedAt(
    latest,
    getLatestNonNullString(rows, "payment_failed_at")
  );

  const canceledAt = resolveLatestCanceledAt(
    latest,
    getLatestNonNullString(rows, "canceled_at")
  );

  const lastPaymentStatus = resolveLatestPaymentStatus(
    latest,
    getLatestNonNullString(rows, "last_payment_status")
  );

  const subscriptionState = resolveLatestSubscriptionState({
    latest,
    fallbackState: familyAccount.subscription_state,
    currentPeriodEndsAt,
    gracePeriodEndsAt,
  });

  return {
    projectedFromEventId: latest.id,
    planType: resolvePlanTypeFromPlanCode(planCode, familyAccount.plan_type),
    planCode,
    status: resolveStatusFromSubscriptionState(subscriptionState),
    subscriptionState,
    maxChildren: resolveMaxChildrenFromPlanCode(
      planCode,
      familyAccount.max_children
    ),
    currentPeriodStartsAt,
    currentPeriodEndsAt,
    nextBillingAt,
    autoRenewEnabled,
    gracePeriodEndsAt,
    paymentFailedAt,
    lastPaymentStatus,
    canceledAt,
  };
}

export async function projectBillingSubscriptionSnapshotToFamilyAccount(
  familyAccountId: string
) {
  const admin = createAdminClient();

  const { data: familyAccount, error: familyAccountError } = await admin
    .from("family_accounts")
    .select("id, plan_type, plan_code, status, subscription_state, max_children, next_billing_at")
    .eq("id", familyAccountId)
    .single();

  if (familyAccountError) {
    throw new Error(
      `Failed to load family account for billing projection: ${familyAccountError.message}`
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
        "auto_renew_enabled",
        "grace_period_ends_at",
        "payment_failed_at",
        "last_payment_status",
        "canceled_at",
        "created_at",
      ].join(", ")
    )
    .eq("family_account_id", familyAccountId)
    .order("event_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(25);

  if (eventsError) {
    throw new Error(
      `Failed to load billing subscription events for projection: ${eventsError.message}`
    );
  }

  const projectionRows = ((events ?? []) as unknown) as BillingSubscriptionProjectionRow[];

  const projected = buildProjectedSnapshot(
    projectionRows,
    familyAccount as FamilyAccountBillingRow
  );

  if (!projected) {
    return null;
  }

  const { error: updateError } = await admin
    .from("family_accounts")
    .update({
      plan_type: projected.planType,
      plan_code: projected.planCode,
      status: projected.status,
      subscription_state: projected.subscriptionState,
      max_children: projected.maxChildren,
      current_period_starts_at: projected.currentPeriodStartsAt,
      current_period_ends_at: projected.currentPeriodEndsAt,
      next_billing_at: projected.nextBillingAt,
      auto_renew_enabled: projected.autoRenewEnabled,
      grace_period_ends_at: projected.gracePeriodEndsAt,
      payment_failed_at: projected.paymentFailedAt,
      last_payment_status: projected.lastPaymentStatus,
      canceled_at: projected.canceledAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", familyAccountId);

  if (updateError) {
    throw new Error(
      `Failed to project billing snapshot into family_accounts: ${updateError.message}`
    );
  }

  return projected;
}
