export type SubscriptionLifecycleState =
  | "trialing"
  | "active"
  | "renewal_due"
  | "payment_failed"
  | "grace_period"
  | "inactive"
  | "canceled"
  | "expired"
  | "unknown";

export type PaymentStatus =
  | "paid"
  | "payment_failed"
  | "refunded"
  | "chargeback"
  | "not_applicable"
  | "unknown";

export type BillingAccessMode =
  | "full_access"
  | "billing_recovery_only"
  | "no_access";

export type BillingLifecycleSnapshot = {
  subscription_state: string | null;
  plan_code: string | null;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  next_billing_at: string | null;
  auto_renew_enabled: boolean | null;
  grace_period_ends_at: string | null;
  payment_failed_at: string | null;
  last_payment_status: string | null;
  canceled_at: string | null;
};

export type ResolvedSubscriptionLifecycle = {
  lifecycleState: SubscriptionLifecycleState;
  paymentStatus: PaymentStatus;
  accessMode: BillingAccessMode;
  isPaidPlan: boolean;
  autoRenewEnabled: boolean;
  currentPeriodStartsAt: string | null;
  currentPeriodEndsAt: string | null;
  nextBillingAt: string | null;
  gracePeriodEndsAt: string | null;
  paymentFailedAt: string | null;
  renewalReminderWindow: "30d" | "7d" | "1d" | null;
  renewalDueSoon: boolean;
  billingRecoveryRequired: boolean;
  standardAccessAllowed: boolean;
};

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
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

function inferPaymentStatus(value: string | null | undefined): PaymentStatus {
  const normalized = normalize(value);

  switch (normalized) {
    case "paid":
      return "paid";
    case "payment_failed":
    case "failed":
      return "payment_failed";
    case "refunded":
      return "refunded";
    case "chargeback":
      return "chargeback";
    case "not_applicable":
      return "not_applicable";
    default:
      return "unknown";
  }
}

function inferIsPaidPlan(planCode: string | null | undefined): boolean {
  const normalized = normalize(planCode);

  return (
    normalized.includes("basic") ||
    normalized.includes("plus") ||
    normalized.includes("young") ||
    normalized.includes("school") ||
    normalized.includes("kommune") ||
    normalized.includes("fylke")
  );
}

function getRenewalReminderWindow(daysUntilEnd: number): "30d" | "7d" | "1d" | null {
  if (daysUntilEnd <= 1) {
    return "1d";
  }

  if (daysUntilEnd <= 7) {
    return "7d";
  }

  if (daysUntilEnd <= 30) {
    return "30d";
  }

  return null;
}

export function resolveSubscriptionLifecycleState(
  snapshot: BillingLifecycleSnapshot,
  now = new Date()
): ResolvedSubscriptionLifecycle {
  const normalizedSubscriptionState = normalize(snapshot.subscription_state);
  const paymentStatus = inferPaymentStatus(snapshot.last_payment_status);
  const isPaidPlan = inferIsPaidPlan(snapshot.plan_code);
  const autoRenewEnabled = Boolean(snapshot.auto_renew_enabled);

  const currentPeriodEndsAtDate = parseDate(snapshot.current_period_ends_at);
  const gracePeriodEndsAtDate = parseDate(snapshot.grace_period_ends_at);
  const canceledAtDate = parseDate(snapshot.canceled_at);
  const paymentFailedAtDate = parseDate(snapshot.payment_failed_at);

  const daysUntilEnd = currentPeriodEndsAtDate
    ? (currentPeriodEndsAtDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    : Number.POSITIVE_INFINITY;

  const renewalReminderWindow =
    Number.isFinite(daysUntilEnd) && daysUntilEnd >= 0
      ? getRenewalReminderWindow(daysUntilEnd)
      : null;

  const renewalDueSoon =
    renewalReminderWindow !== null &&
    isPaidPlan &&
    normalizedSubscriptionState === "active";

  if (normalizedSubscriptionState === "trialing") {
    return {
      lifecycleState: "trialing",
      paymentStatus,
      accessMode: "no_access",
      isPaidPlan,
      autoRenewEnabled,
      currentPeriodStartsAt: snapshot.current_period_starts_at ?? null,
      currentPeriodEndsAt: snapshot.current_period_ends_at ?? null,
      nextBillingAt: snapshot.next_billing_at ?? null,
      gracePeriodEndsAt: snapshot.grace_period_ends_at ?? null,
      paymentFailedAt: snapshot.payment_failed_at ?? null,
      renewalReminderWindow: null,
      renewalDueSoon: false,
      billingRecoveryRequired: false,
      standardAccessAllowed: false,
    };
  }

  if (normalizedSubscriptionState === "active" && isPaidPlan) {
    return {
      lifecycleState: renewalDueSoon ? "renewal_due" : "active",
      paymentStatus: paymentStatus === "unknown" ? "paid" : paymentStatus,
      accessMode: "full_access",
      isPaidPlan,
      autoRenewEnabled,
      currentPeriodStartsAt: snapshot.current_period_starts_at ?? null,
      currentPeriodEndsAt: snapshot.current_period_ends_at ?? null,
      nextBillingAt: snapshot.next_billing_at ?? null,
      gracePeriodEndsAt: snapshot.grace_period_ends_at ?? null,
      paymentFailedAt: snapshot.payment_failed_at ?? null,
      renewalReminderWindow,
      renewalDueSoon,
      billingRecoveryRequired: false,
      standardAccessAllowed: true,
    };
  }

  if (
    normalizedSubscriptionState === "payment_failed" ||
    paymentStatus === "payment_failed"
  ) {
    const graceStillOpen =
      gracePeriodEndsAtDate && gracePeriodEndsAtDate.getTime() > now.getTime();

    return {
      lifecycleState: graceStillOpen ? "grace_period" : "payment_failed",
      paymentStatus: "payment_failed",
      accessMode: "billing_recovery_only",
      isPaidPlan,
      autoRenewEnabled,
      currentPeriodStartsAt: snapshot.current_period_starts_at ?? null,
      currentPeriodEndsAt: snapshot.current_period_ends_at ?? null,
      nextBillingAt: snapshot.next_billing_at ?? null,
      gracePeriodEndsAt: snapshot.grace_period_ends_at ?? null,
      paymentFailedAt: snapshot.payment_failed_at ?? null,
      renewalReminderWindow: null,
      renewalDueSoon: false,
      billingRecoveryRequired: true,
      standardAccessAllowed: false,
    };
  }

  if (normalizedSubscriptionState === "canceled" || canceledAtDate) {
    const periodStillActive =
      currentPeriodEndsAtDate && currentPeriodEndsAtDate.getTime() > now.getTime();

    return {
      lifecycleState: periodStillActive ? "active" : "canceled",
      paymentStatus,
      accessMode: periodStillActive ? "full_access" : "billing_recovery_only",
      isPaidPlan,
      autoRenewEnabled,
      currentPeriodStartsAt: snapshot.current_period_starts_at ?? null,
      currentPeriodEndsAt: snapshot.current_period_ends_at ?? null,
      nextBillingAt: snapshot.next_billing_at ?? null,
      gracePeriodEndsAt: snapshot.grace_period_ends_at ?? null,
      paymentFailedAt: snapshot.payment_failed_at ?? null,
      renewalReminderWindow: periodStillActive ? renewalReminderWindow : null,
      renewalDueSoon: periodStillActive ? renewalDueSoon : false,
      billingRecoveryRequired: !periodStillActive,
      standardAccessAllowed: Boolean(periodStillActive),
    };
  }

  if (
    normalizedSubscriptionState === "expired" ||
    (currentPeriodEndsAtDate && currentPeriodEndsAtDate.getTime() <= now.getTime())
  ) {
    return {
      lifecycleState: "expired",
      paymentStatus,
      accessMode: "billing_recovery_only",
      isPaidPlan,
      autoRenewEnabled,
      currentPeriodStartsAt: snapshot.current_period_starts_at ?? null,
      currentPeriodEndsAt: snapshot.current_period_ends_at ?? null,
      nextBillingAt: snapshot.next_billing_at ?? null,
      gracePeriodEndsAt: snapshot.grace_period_ends_at ?? null,
      paymentFailedAt:
        paymentFailedAtDate?.toISOString() ?? snapshot.payment_failed_at ?? null,
      renewalReminderWindow: null,
      renewalDueSoon: false,
      billingRecoveryRequired: true,
      standardAccessAllowed: false,
    };
  }

  if (normalizedSubscriptionState === "inactive") {
    return {
      lifecycleState: "inactive",
      paymentStatus,
      accessMode: "no_access",
      isPaidPlan,
      autoRenewEnabled,
      currentPeriodStartsAt: snapshot.current_period_starts_at ?? null,
      currentPeriodEndsAt: snapshot.current_period_ends_at ?? null,
      nextBillingAt: snapshot.next_billing_at ?? null,
      gracePeriodEndsAt: snapshot.grace_period_ends_at ?? null,
      paymentFailedAt: snapshot.payment_failed_at ?? null,
      renewalReminderWindow: null,
      renewalDueSoon: false,
      billingRecoveryRequired: false,
      standardAccessAllowed: false,
    };
  }

  return {
    lifecycleState: "unknown",
    paymentStatus,
    accessMode: "no_access",
    isPaidPlan,
    autoRenewEnabled,
    currentPeriodStartsAt: snapshot.current_period_starts_at ?? null,
    currentPeriodEndsAt: snapshot.current_period_ends_at ?? null,
    nextBillingAt: snapshot.next_billing_at ?? null,
    gracePeriodEndsAt: snapshot.grace_period_ends_at ?? null,
    paymentFailedAt: snapshot.payment_failed_at ?? null,
    renewalReminderWindow: null,
    renewalDueSoon: false,
    billingRecoveryRequired: false,
    standardAccessAllowed: false,
  };
}