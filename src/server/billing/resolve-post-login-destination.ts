import { createClient } from "@/lib/supabase/server";
import { resolveAccountActivation } from "@/server/billing/resolve-account-activation";
import { resolveSubscriptionLifecycleState } from "@/server/billing/resolve-subscription-lifecycle-state";

export type PostLoginMode = "standard" | "continue";

type PendingEntrySource =
  | "trial"
  | "paid"
  | "direct"
  | "school"
  | "school_referral"
  | "kommune"
  | "fylke"
  | "institutional"
  | null;

type FamilyAccessRow = {
  id: string;
  plan_type: string | null;
  status: string | null;
  subscription_state: string | null;
  entry_source: string | null;
  activation_source: string | null;
  plan_code: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  trial_used: boolean | null;
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

export type PostLoginResolution =
  | { kind: "redirect"; href: string }
  | { kind: "anonymous"; href: string };

function normalizePendingEntrySource(
  value: string | null | undefined
): PendingEntrySource {
  const normalized = (value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "trial":
      return "trial";
    case "paid":
      return "paid";
    case "direct":
      return "direct";
    case "school":
      return "school";
    case "school_referral":
      return "school_referral";
    case "kommune":
      return "kommune";
    case "fylke":
      return "fylke";
    case "institutional":
      return "institutional";
    default:
      return null;
  }
}

function getContinueDestinationForPendingAccess(
  locale: string,
  pendingEntrySource: PendingEntrySource
): string {
  switch (pendingEntrySource) {
    case "paid":
      return `/${locale}/app/family/create?entry=paid`;
    case "school":
    case "school_referral":
    case "kommune":
    case "fylke":
    case "institutional":
      return `/${locale}/pricing?entry=institutional`;
    case "trial":
    case "direct":
    default:
      return `/${locale}/app/family/create?entry=trial`;
  }
}

export async function resolvePostLoginDestination({
  locale,
  mode,
}: {
  locale: string;
  mode: PostLoginMode;
}): Promise<PostLoginResolution> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "anonymous", href: `/${locale}/login` };
  }

  const pendingEntrySource = normalizePendingEntrySource(
    typeof user.user_metadata?.entry_source === "string"
      ? user.user_metadata.entry_source
      : null
  );

  const { data: familyAccount, error } = await supabase
    .from("family_accounts")
    .select(
      "id, plan_type, status, subscription_state, entry_source, activation_source, plan_code, trial_started_at, trial_ends_at, trial_used, current_period_starts_at, current_period_ends_at, next_billing_at, auto_renew_enabled, grace_period_ends_at, payment_failed_at, last_payment_status, canceled_at, created_at"
    )
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (error) {
    return {
      kind: "redirect",
      href: `/${locale}/pricing?entry=family`,
    };
  }

  if (!familyAccount) {
    if (mode === "standard") {
      return {
        kind: "redirect",
        href: `/${locale}/continue-access?mode=continue`,
      };
    }

    return {
      kind: "redirect",
      href: getContinueDestinationForPendingAccess(locale, pendingEntrySource),
    };
  }

  const typedFamilyAccount = familyAccount as FamilyAccessRow;
  const activation = resolveAccountActivation(typedFamilyAccount);
  const subscriptionLifecycle =
    resolveSubscriptionLifecycleState(typedFamilyAccount);

  if (subscriptionLifecycle.standardAccessAllowed) {
    return {
      kind: "redirect",
      href: `/${locale}/app/profile`,
    };
  }

  if (mode === "standard") {
    return {
      kind: "redirect",
      href: `/${locale}/continue-access?mode=continue`,
    };
  }

  if (activation.trialState === "active") {
    return {
      kind: "redirect",
      href: `/${locale}/app/family`,
    };
  }

  if (activation.trialState === "expired") {
    return {
      kind: "redirect",
      href: `/${locale}/pricing?entry=family`,
    };
  }

  if (subscriptionLifecycle.billingRecoveryRequired) {
    return {
      kind: "redirect",
      href: `/${locale}/pricing?entry=family`,
    };
  }

  const entrySource = normalizePendingEntrySource(
    typedFamilyAccount.entry_source ?? pendingEntrySource
  );

  return {
    kind: "redirect",
    href: getContinueDestinationForPendingAccess(locale, entrySource),
  };
}