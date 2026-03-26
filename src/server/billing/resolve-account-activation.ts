export type BillingStage =
  | "demo"
  | "trial"
  | "paid"
  | "inactive"
  | "unknown";

export type TrialState = "active" | "expired" | "not_trial";

export type SubscriptionLifecycleState =
  | "demo"
  | "trialing"
  | "trial_expired"
  | "active"
  | "grace_period"
  | "past_due"
  | "canceled"
  | "inactive"
  | "unknown";

export type FamilyActivationSnapshot = {
  plan_type: string | null;
  status: string | null;
  subscription_state: string | null;
  entry_source: string | null;
  activation_source: string | null;
  plan_code: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  trial_used: boolean | null;
  current_period_ends_at?: string | null;
  next_billing_at?: string | null;
  auto_renew_enabled?: boolean | null;
  grace_period_ends_at?: string | null;
  payment_failed_at?: string | null;
  canceled_at?: string | null;
  last_payment_status?: string | null;
};

export type AccountActivationState = {
  billingStage: BillingStage;
  subscriptionLifecycleState: SubscriptionLifecycleState;
  trialState: TrialState;
  subscriptionState: string | null;
  entrySource: string | null;
  activationSource: string | null;
  planCode: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialUsed: boolean;
  trialRemainingMs: number;
  currentPeriodEndsAt: string | null;
  nextBillingAt: string | null;
  autoRenewEnabled: boolean;
  gracePeriodEndsAt: string | null;
  paymentFailedAt: string | null;
  canceledAt: string | null;
  lastPaymentStatus: string | null;
  hasActiveAccess: boolean;
  shouldRouteToPaid: boolean;
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

function isInactiveStatus(value: string): boolean {
  return [
    "inactive",
    "canceled",
    "cancelled",
    "expired",
    "suspended",
    "past_due",
  ].includes(value);
}

function resolveSubscriptionLifecycleState(
  snapshot: FamilyActivationSnapshot,
  now: Date
): SubscriptionLifecycleState {
  const planType = normalize(snapshot.plan_type);
  const status = normalize(snapshot.status);
  const subscriptionState = normalize(snapshot.subscription_state);

  const trialEndsAtDate = parseDate(snapshot.trial_ends_at);
  const currentPeriodEndsAtDate = parseDate(snapshot.current_period_ends_at);
  const gracePeriodEndsAtDate = parseDate(snapshot.grace_period_ends_at);
  const canceledAtDate = parseDate(snapshot.canceled_at);

  const looksLikeDemo =
    subscriptionState === "demo" ||
    planType.includes("demo") ||
    status.includes("demo");

  if (looksLikeDemo) {
    return "demo";
  }

  const looksLikeTrial =
    subscriptionState === "trialing" ||
    subscriptionState === "trial_active" ||
    subscriptionState === "trial_expired" ||
    planType.includes("trial") ||
    status.includes("trial");

  if (looksLikeTrial) {
    const expired =
      subscriptionState === "trial_expired" ||
      isInactiveStatus(status) ||
      (trialEndsAtDate ? trialEndsAtDate.getTime() <= now.getTime() : false);

    return expired ? "trial_expired" : "trialing";
  }

  const looksCanceled =
    subscriptionState === "canceled" ||
    subscriptionState === "cancelled" ||
    status === "canceled" ||
    status === "cancelled" ||
    Boolean(canceledAtDate);

  if (looksCanceled) {
    const stillInPeriod =
      currentPeriodEndsAtDate?.getTime() !== undefined &&
      currentPeriodEndsAtDate.getTime() > now.getTime();

    return stillInPeriod ? "canceled" : "inactive";
  }

  const looksGrace =
    subscriptionState === "grace_period" ||
    status === "grace_period" ||
    (gracePeriodEndsAtDate ? gracePeriodEndsAtDate.getTime() > now.getTime() : false);

  if (looksGrace) {
    return "grace_period";
  }

  const looksPastDue =
    subscriptionState === "past_due" || status === "past_due";

  if (looksPastDue) {
    return "past_due";
  }

  const looksActive =
    subscriptionState === "active" ||
    subscriptionState === "paid" ||
    status === "active" ||
    planType.includes("basic") ||
    planType.includes("plus") ||
    planType.includes("young");

  if (looksActive) {
    const inactive =
      subscriptionState === "inactive" || isInactiveStatus(status);

    return inactive ? "inactive" : "active";
  }

  if (isInactiveStatus(status) || subscriptionState === "inactive") {
    return "inactive";
  }

  return "unknown";
}

export function resolveAccountActivation(
  snapshot: FamilyActivationSnapshot,
  now = new Date()
): AccountActivationState {
  const trialEndsAtDate = parseDate(snapshot.trial_ends_at);
  const rawTrialRemainingMs = trialEndsAtDate
    ? trialEndsAtDate.getTime() - now.getTime()
    : 0;

  const trialRemainingMs = Math.max(rawTrialRemainingMs, 0);

  const trialUsed =
    Boolean(snapshot.trial_used) ||
    Boolean(snapshot.trial_started_at) ||
    normalize(snapshot.plan_type).includes("trial");

  const subscriptionLifecycleState = resolveSubscriptionLifecycleState(
    snapshot,
    now
  );

  const currentPeriodEndsAt = snapshot.current_period_ends_at ?? null;
  const nextBillingAt = snapshot.next_billing_at ?? null;
  const autoRenewEnabled = Boolean(snapshot.auto_renew_enabled);
  const gracePeriodEndsAt = snapshot.grace_period_ends_at ?? null;
  const paymentFailedAt = snapshot.payment_failed_at ?? null;
  const canceledAt = snapshot.canceled_at ?? null;
  const lastPaymentStatus = snapshot.last_payment_status ?? null;

  const hasActiveAccess =
    subscriptionLifecycleState === "trialing" ||
    subscriptionLifecycleState === "active" ||
    subscriptionLifecycleState === "grace_period" ||
    (subscriptionLifecycleState === "canceled" &&
      Boolean(parseDate(currentPeriodEndsAt)) &&
      parseDate(currentPeriodEndsAt)!.getTime() > now.getTime());

  const isBlockedState =
    subscriptionLifecycleState === "trial_expired" ||
    subscriptionLifecycleState === "past_due" ||
    subscriptionLifecycleState === "inactive";

  const shouldRouteToPaid = isBlockedState;

  const trialState: TrialState =
    subscriptionLifecycleState === "trialing"
      ? "active"
      : subscriptionLifecycleState === "trial_expired"
        ? "expired"
        : trialUsed
          ? "expired"
          : "not_trial";

  const billingStage: BillingStage =
    subscriptionLifecycleState === "demo"
      ? "demo"
      : subscriptionLifecycleState === "trialing"
        ? "trial"
        : subscriptionLifecycleState === "active" ||
            subscriptionLifecycleState === "grace_period" ||
            (subscriptionLifecycleState === "canceled" && hasActiveAccess)
          ? "paid"
          : subscriptionLifecycleState === "trial_expired" ||
              subscriptionLifecycleState === "past_due" ||
              subscriptionLifecycleState === "inactive"
            ? "inactive"
            : "unknown";

  return {
    billingStage,
    subscriptionLifecycleState,
    trialState,
    subscriptionState: snapshot.subscription_state ?? null,
    entrySource: snapshot.entry_source ?? null,
    activationSource: snapshot.activation_source ?? null,
    planCode: snapshot.plan_code ?? null,
    trialStartedAt: snapshot.trial_started_at ?? null,
    trialEndsAt: snapshot.trial_ends_at ?? null,
    trialUsed,
    trialRemainingMs,
    currentPeriodEndsAt,
    nextBillingAt,
    autoRenewEnabled,
    gracePeriodEndsAt,
    paymentFailedAt,
    canceledAt,
    lastPaymentStatus,
    hasActiveAccess,
    shouldRouteToPaid,
  };
}