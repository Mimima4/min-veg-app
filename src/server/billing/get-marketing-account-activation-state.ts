import { createClient } from "@/lib/supabase/server";
import {
  resolveAccountActivation,
  type AccountActivationState,
} from "@/server/billing/resolve-account-activation";
import {
  resolveSubscriptionLifecycleState,
  type BillingLifecycleSnapshot,
} from "@/server/billing/resolve-subscription-lifecycle-state";

type FamilyActivationRow = {
  id: string;
  plan_type: string | null;
  status: string | null;
  subscription_state: string | null;
  entry_source: string | null;
  activation_source: string | null;
  plan_code: string | null;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  next_billing_at: string | null;
  auto_renew_enabled: boolean | null;
  grace_period_ends_at: string | null;
  payment_failed_at: string | null;
  last_payment_status: string | null;
  canceled_at: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  trial_used: boolean | null;
  max_children: number | null;
  created_at: string;
};

export type PendingEntrySource =
  | "trial"
  | "paid"
  | "school_referral"
  | "direct"
  | null;

export type MarketingAccountActivationState =
  | { kind: "anonymous" }
  | { kind: "unavailable"; userEmail: string | null }
  | {
      kind: "signed_in_no_family";
      userEmail: string;
      pendingEntrySource: PendingEntrySource;
    }
  | {
      kind: "trial_active";
      userEmail: string;
      activation: AccountActivationState;
      trialRemainingLabel: string;
    }
  | {
      kind: "trial_expired";
      userEmail: string;
      activation: AccountActivationState;
    }
  | {
      kind: "paid_active";
      userEmail: string;
      activation: AccountActivationState;
    }
  | {
      kind: "inactive";
      userEmail: string;
      activation: AccountActivationState;
    };

function normalizePendingEntrySource(
  value: string | null | undefined
): PendingEntrySource {
  const normalized = (value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "trial":
      return "trial";
    case "paid":
      return "paid";
    case "school_referral":
      return "school_referral";
    case "direct":
      return "direct";
    default:
      return null;
  }
}

function formatTrialRemainingLabel(trialRemainingMs: number): string {
  if (trialRemainingMs <= 0) {
    return "Trial expired";
  }

  const totalMinutes = Math.ceil(trialRemainingMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h left`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m left`;
  }

  return `${minutes}m left`;
}

export async function getMarketingAccountActivationState(): Promise<MarketingAccountActivationState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "anonymous" };
  }

  const userEmail = user.email ?? "Signed-in user";
  const pendingEntrySource = normalizePendingEntrySource(
    typeof user.user_metadata?.entry_source === "string"
      ? user.user_metadata.entry_source
      : null
  );

  const { data: familyAccount, error } = await supabase
    .from("family_accounts")
    .select(
      "id, plan_type, status, subscription_state, entry_source, activation_source, plan_code, current_period_starts_at, current_period_ends_at, next_billing_at, auto_renew_enabled, grace_period_ends_at, payment_failed_at, last_payment_status, canceled_at, trial_started_at, trial_ends_at, trial_used, max_children, created_at"
    )
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (error) {
    return {
      kind: "unavailable",
      userEmail: user.email ?? null,
    };
  }

  if (!familyAccount) {
    return {
      kind: "signed_in_no_family",
      userEmail,
      pendingEntrySource,
    };
  }

  const activation = resolveAccountActivation(familyAccount);
  const subscriptionLifecycle = resolveSubscriptionLifecycleState(
    familyAccount as unknown as BillingLifecycleSnapshot
  );

  if (activation.trialState === "active") {
    return {
      kind: "trial_active",
      userEmail,
      activation,
      trialRemainingLabel: formatTrialRemainingLabel(
        activation.trialRemainingMs
      ),
    };
  }

  if (activation.trialState === "expired") {
    return {
      kind: "trial_expired",
      userEmail,
      activation,
    };
  }

  if (subscriptionLifecycle.billingRecoveryRequired === true) {
    return {
      kind: "inactive",
      userEmail,
      activation,
    };
  }

  if (
    subscriptionLifecycle.standardAccessAllowed === true &&
    subscriptionLifecycle.isPaidPlan &&
    activation.billingStage === "paid" &&
    activation.hasActiveAccess
  ) {
    return {
      kind: "paid_active",
      userEmail,
      activation,
    };
  }

  return {
    kind: "inactive",
    userEmail,
    activation,
  };
}