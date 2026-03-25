export type BillingStage =
  | "demo"
  | "trial"
  | "paid"
  | "inactive"
  | "unknown";

export type TrialState = "active" | "expired" | "not_trial";

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
};

export type AccountActivationState = {
  billingStage: BillingStage;
  trialState: TrialState;
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

export function resolveAccountActivation(
  snapshot: FamilyActivationSnapshot,
  now = new Date()
): AccountActivationState {
  const planType = normalize(snapshot.plan_type);
  const status = normalize(snapshot.status);
  const subscriptionState = normalize(snapshot.subscription_state);

  const trialEndsAtDate = parseDate(snapshot.trial_ends_at);
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
    return {
      billingStage: "demo",
      trialState: "not_trial",
      subscriptionState: snapshot.subscription_state ?? null,
      entrySource: snapshot.entry_source ?? null,
      activationSource: snapshot.activation_source ?? null,
      planCode: snapshot.plan_code ?? null,
      trialStartedAt: snapshot.trial_started_at ?? null,
      trialEndsAt: snapshot.trial_ends_at ?? null,
      trialUsed,
      trialRemainingMs,
      hasActiveAccess: false,
      shouldRouteToPaid: false,
    };
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

    return {
      billingStage: expired ? "inactive" : "trial",
      trialState: expired ? "expired" : "active",
      subscriptionState: snapshot.subscription_state ?? null,
      entrySource: snapshot.entry_source ?? null,
      activationSource: snapshot.activation_source ?? null,
      planCode: snapshot.plan_code ?? null,
      trialStartedAt: snapshot.trial_started_at ?? null,
      trialEndsAt: snapshot.trial_ends_at ?? null,
      trialUsed: true,
      trialRemainingMs,
      hasActiveAccess: !expired,
      shouldRouteToPaid: expired,
    };
  }

  const looksLikePaid =
    subscriptionState === "active" ||
    subscriptionState === "paid" ||
    planType.includes("basic") ||
    planType.includes("plus") ||
    planType.includes("young");

  if (looksLikePaid) {
    const inactive =
      subscriptionState === "inactive" || isInactiveStatus(status);

    return {
      billingStage: inactive ? "inactive" : "paid",
      trialState: "not_trial",
      subscriptionState: snapshot.subscription_state ?? null,
      entrySource: snapshot.entry_source ?? null,
      activationSource: snapshot.activation_source ?? null,
      planCode: snapshot.plan_code ?? null,
      trialStartedAt: snapshot.trial_started_at ?? null,
      trialEndsAt: snapshot.trial_ends_at ?? null,
      trialUsed,
      trialRemainingMs,
      hasActiveAccess: !inactive,
      shouldRouteToPaid: false,
    };
  }

  if (isInactiveStatus(status) || subscriptionState === "inactive") {
    return {
      billingStage: "inactive",
      trialState: trialUsed ? "expired" : "not_trial",
      subscriptionState: snapshot.subscription_state ?? null,
      entrySource: snapshot.entry_source ?? null,
      activationSource: snapshot.activation_source ?? null,
      planCode: snapshot.plan_code ?? null,
      trialStartedAt: snapshot.trial_started_at ?? null,
      trialEndsAt: snapshot.trial_ends_at ?? null,
      trialUsed,
      trialRemainingMs,
      hasActiveAccess: false,
      shouldRouteToPaid: trialUsed,
    };
  }

  return {
    billingStage: "unknown",
    trialState: trialUsed ? "expired" : "not_trial",
    subscriptionState: snapshot.subscription_state ?? null,
    entrySource: snapshot.entry_source ?? null,
    activationSource: snapshot.activation_source ?? null,
    planCode: snapshot.plan_code ?? null,
    trialStartedAt: snapshot.trial_started_at ?? null,
    trialEndsAt: snapshot.trial_ends_at ?? null,
    trialUsed,
    trialRemainingMs,
    hasActiveAccess: false,
    shouldRouteToPaid: trialUsed,
  };
}