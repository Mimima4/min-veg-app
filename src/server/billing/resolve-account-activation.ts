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
  trialState: TrialState;
  subscriptionLifecycleState: SubscriptionLifecycleState;
  subscriptionState: string | null;
  entrySource: string | null;
  activationSource: string | null;
  planCode: string | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialUsed: boolean;
  trialRemainingMs: number;
  hasActiveAccess: boolean;
  shouldRouteToPaid: boolean;
  currentPeriodEndsAt: string | null;
  nextBillingAt: string | null;
  autoRenewEnabled: boolean;
  gracePeriodEndsAt: string | null;
  paymentFailedAt: string | null;
  canceledAt: string | null;
  lastPaymentStatus: string | null;
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

function buildResult(
  snapshot: FamilyActivationSnapshot,
  params: {
    billingStage: BillingStage;
    trialState: TrialState;
    subscriptionLifecycleState: SubscriptionLifecycleState;
    hasActiveAccess: boolean;
    shouldRouteToPaid: boolean;
    trialUsed: boolean;
    trialRemainingMs: number;
  }
): AccountActivationState {
  return {
    billingStage: params.billingStage,
    trialState: params.trialState,
    subscriptionLifecycleState: params.subscriptionLifecycleState,
    subscriptionState: snapshot.subscription_state ?? null,
    entrySource: snapshot.entry_source ?? null,
    activationSource: snapshot.activation_source ?? null,
    planCode: snapshot.plan_code ?? null,
    trialStartedAt: snapshot.trial_started_at ?? null,
    trialEndsAt: snapshot.trial_ends_at ?? null,
    trialUsed: params.trialUsed,
    trialRemainingMs: params.trialRemainingMs,
    hasActiveAccess: params.hasActiveAccess,
    shouldRouteToPaid: params.shouldRouteToPaid,
    currentPeriodEndsAt: snapshot.current_period_ends_at ?? null,
    nextBillingAt: snapshot.next_billing_at ?? null,
    autoRenewEnabled: Boolean(snapshot.auto_renew_enabled),
    gracePeriodEndsAt: snapshot.grace_period_ends_at ?? null,
    paymentFailedAt: snapshot.payment_failed_at ?? null,
    canceledAt: snapshot.canceled_at ?? null,
    lastPaymentStatus: snapshot.last_payment_status ?? null,
  };
}

export function resolveAccountActivation(
  snapshot: FamilyActivationSnapshot,
  now = new Date()
): AccountActivationState {
  const planType = normalize(snapshot.plan_type);
  const status = normalize(snapshot.status);
  const subscriptionState = normalize(snapshot.subscription_state);
  const lastPaymentStatus = normalize(snapshot.last_payment_status);

  const trialEndsAtDate = parseDate(snapshot.trial_ends_at);
  const currentPeriodEndsAtDate = parseDate(snapshot.current_period_ends_at);
  const gracePeriodEndsAtDate = parseDate(snapshot.grace_period_ends_at);
  const canceledAtDate = parseDate(snapshot.canceled_at);

  const rawTrialRemainingMs = trialEndsAtDate
    ? trialEndsAtDate.getTime() - now.getTime()
    : 0;

  const trialRemainingMs = Math.max(rawTrialRemainingMs, 0);

  const trialUsed =
    Boolean(snapshot.trial_used) ||
    Boolean(snapshot.trial_started_at) ||
    planType.includes("trial");

  const looksLikeDemo =
    subscriptionState === "demo" ||
    planType.includes("demo") ||
    status.includes("demo");

  if (looksLikeDemo) {
    return buildResult(snapshot, {
      billingStage: "demo",
      trialState: "not_trial",
      subscriptionLifecycleState: "demo",
      hasActiveAccess: false,
      shouldRouteToPaid: false,
      trialUsed,
      trialRemainingMs,
    });
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
      status === "inactive" ||
      status === "expired" ||
      (trialEndsAtDate ? trialEndsAtDate.getTime() <= now.getTime() : false);

    return buildResult(snapshot, {
      billingStage: expired ? "inactive" : "trial",
      trialState: expired ? "expired" : "active",
      subscriptionLifecycleState: expired ? "trial_expired" : "trialing",
      hasActiveAccess: !expired,
      shouldRouteToPaid: expired,
      trialUsed: true,
      trialRemainingMs,
    });
  }

  const looksLikePaid =
    subscriptionState === "active" ||
    subscriptionState === "paid" ||
    subscriptionState === "grace_period" ||
    subscriptionState === "past_due" ||
    subscriptionState === "canceled" ||
    subscriptionState === "cancelled" ||
    planType.includes("basic") ||
    planType.includes("plus") ||
    planType.includes("young");

  if (looksLikePaid) {
    const currentPeriodStillActive = currentPeriodEndsAtDate
      ? currentPeriodEndsAtDate.getTime() > now.getTime()
      : false;

    const graceStillActive = gracePeriodEndsAtDate
      ? gracePeriodEndsAtDate.getTime() > now.getTime()
      : false;

    const isCanceled =
      subscriptionState === "canceled" ||
      subscriptionState === "cancelled" ||
      status === "canceled" ||
      status === "cancelled" ||
      Boolean(canceledAtDate);

    const isPastDue =
      subscriptionState === "past_due" ||
      status === "past_due" ||
      lastPaymentStatus === "failed";

    const isGracePeriod =
      subscriptionState === "grace_period" ||
      status === "grace_period" ||
      (isPastDue && graceStillActive);

    if (isCanceled) {
      if (currentPeriodStillActive) {
        return buildResult(snapshot, {
          billingStage: "paid",
          trialState: "not_trial",
          subscriptionLifecycleState: "canceled",
          hasActiveAccess: true,
          shouldRouteToPaid: false,
          trialUsed,
          trialRemainingMs,
        });
      }

      return buildResult(snapshot, {
        billingStage: "inactive",
        trialState: "not_trial",
        subscriptionLifecycleState: "inactive",
        hasActiveAccess: false,
        shouldRouteToPaid: true,
        trialUsed,
        trialRemainingMs,
      });
    }

    if (isGracePeriod) {
      return buildResult(snapshot, {
        billingStage: "paid",
        trialState: "not_trial",
        subscriptionLifecycleState: "grace_period",
        hasActiveAccess: true,
        shouldRouteToPaid: false,
        trialUsed,
        trialRemainingMs,
      });
    }

    if (isPastDue) {
      return buildResult(snapshot, {
        billingStage: "inactive",
        trialState: "not_trial",
        subscriptionLifecycleState: "past_due",
        hasActiveAccess: false,
        shouldRouteToPaid: true,
        trialUsed,
        trialRemainingMs,
      });
    }

    if (
      subscriptionState === "active" ||
      subscriptionState === "paid" ||
      status === "active"
    ) {
      return buildResult(snapshot, {
        billingStage: "paid",
        trialState: "not_trial",
        subscriptionLifecycleState: "active",
        hasActiveAccess: true,
        shouldRouteToPaid: false,
        trialUsed,
        trialRemainingMs,
      });
    }

    if (subscriptionState === "inactive" || status === "inactive") {
      return buildResult(snapshot, {
        billingStage: "inactive",
        trialState: "not_trial",
        subscriptionLifecycleState: "inactive",
        hasActiveAccess: false,
        shouldRouteToPaid: true,
        trialUsed,
        trialRemainingMs,
      });
    }
  }

  if (status === "inactive" || subscriptionState === "inactive") {
    return buildResult(snapshot, {
      billingStage: "inactive",
      trialState: trialUsed ? "expired" : "not_trial",
      subscriptionLifecycleState: "inactive",
      hasActiveAccess: false,
      shouldRouteToPaid: true,
      trialUsed,
      trialRemainingMs,
    });
  }

  return buildResult(snapshot, {
    billingStage: "unknown",
    trialState: trialUsed ? "expired" : "not_trial",
    subscriptionLifecycleState: "unknown",
    hasActiveAccess: false,
    shouldRouteToPaid: trialUsed,
    trialUsed,
    trialRemainingMs,
  });
}