import { createClient } from "@/lib/supabase/server";
import {
  resolveAccountActivation,
  type AccountActivationState,
} from "@/server/billing/resolve-account-activation";

export type PendingEntrySource =
  | "trial"
  | "paid"
  | "direct"
  | "school"
  | "school_referral"
  | "kommune"
  | "fylke"
  | "institutional"
  | null;

export type FamilyAccessRow = {
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
  current_period_ends_at: string | null;
  next_billing_at: string | null;
  auto_renew_enabled: boolean | null;
  grace_period_ends_at: string | null;
  payment_failed_at: string | null;
  canceled_at: string | null;
  last_payment_status: string | null;
};

export type UserAccessState =
  | {
      kind: "anonymous";
      email: null;
      displayName: null;
      pendingEntrySource: null;
      hasPermanentPaidAccess: false;
      trialUsed: false;
      trialAvailable: false;
      familyAccount: null;
      activation: null;
    }
  | {
      kind:
        | "no_family_paid"
        | "no_family_trial_available"
        | "no_family_no_trial"
        | "institutional_pending";
      email: string | null;
      displayName: string | null;
      pendingEntrySource: PendingEntrySource;
      hasPermanentPaidAccess: boolean;
      trialUsed: boolean;
      trialAvailable: boolean;
      familyAccount: null;
      activation: null;
    }
  | {
      kind: "trial_active" | "trial_expired" | "paid_active" | "inactive_access";
      email: string | null;
      displayName: string | null;
      pendingEntrySource: PendingEntrySource;
      hasPermanentPaidAccess: boolean;
      trialUsed: boolean;
      trialAvailable: boolean;
      familyAccount: FamilyAccessRow;
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

export function isInstitutionalEntrySource(
  source: PendingEntrySource
): boolean {
  return (
    source === "school" ||
    source === "school_referral" ||
    source === "kommune" ||
    source === "fylke" ||
    source === "institutional"
  );
}

export async function getUserAccessState(): Promise<UserAccessState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      kind: "anonymous",
      email: null,
      displayName: null,
      pendingEntrySource: null,
      hasPermanentPaidAccess: false,
      trialUsed: false,
      trialAvailable: false,
      familyAccount: null,
      activation: null,
    };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name ?? null;

  const pendingEntrySource = normalizePendingEntrySource(
    typeof user.user_metadata?.entry_source === "string"
      ? user.user_metadata.entry_source
      : null
  );

  const trialUsed = Boolean(user.user_metadata?.trial_used);

  const hasPermanentPaidAccess =
    user.app_metadata?.admin_access === true ||
    user.app_metadata?.role === "platform_admin";

  const trialAvailable =
    pendingEntrySource === "trial" && !trialUsed && !hasPermanentPaidAccess;

  const { data: familyAccount } = await supabase
    .from("family_accounts")
    .select(
      "id, plan_type, status, subscription_state, entry_source, activation_source, plan_code, trial_started_at, trial_ends_at, trial_used, current_period_ends_at, next_billing_at, auto_renew_enabled, grace_period_ends_at, payment_failed_at, canceled_at, last_payment_status"
    )
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (!familyAccount) {
    if (hasPermanentPaidAccess) {
      return {
        kind: "no_family_paid",
        email: user.email ?? null,
        displayName,
        pendingEntrySource,
        hasPermanentPaidAccess,
        trialUsed,
        trialAvailable: false,
        familyAccount: null,
        activation: null,
      };
    }

    if (trialAvailable) {
      return {
        kind: "no_family_trial_available",
        email: user.email ?? null,
        displayName,
        pendingEntrySource,
        hasPermanentPaidAccess,
        trialUsed,
        trialAvailable,
        familyAccount: null,
        activation: null,
      };
    }

    if (isInstitutionalEntrySource(pendingEntrySource)) {
      return {
        kind: "institutional_pending",
        email: user.email ?? null,
        displayName,
        pendingEntrySource,
        hasPermanentPaidAccess,
        trialUsed,
        trialAvailable: false,
        familyAccount: null,
        activation: null,
      };
    }

    return {
      kind: "no_family_no_trial",
      email: user.email ?? null,
      displayName,
      pendingEntrySource,
      hasPermanentPaidAccess,
      trialUsed,
      trialAvailable: false,
      familyAccount: null,
      activation: null,
    };
  }

  const typedFamilyAccount = familyAccount as FamilyAccessRow;
  const activation = resolveAccountActivation(typedFamilyAccount);

  if (activation.trialState === "active") {
    return {
      kind: "trial_active",
      email: user.email ?? null,
      displayName,
      pendingEntrySource,
      hasPermanentPaidAccess,
      trialUsed,
      trialAvailable: false,
      familyAccount: typedFamilyAccount,
      activation,
    };
  }

  if (activation.trialState === "expired") {
    return {
      kind: "trial_expired",
      email: user.email ?? null,
      displayName,
      pendingEntrySource,
      hasPermanentPaidAccess,
      trialUsed: true,
      trialAvailable: false,
      familyAccount: typedFamilyAccount,
      activation,
    };
  }

  if (activation.billingStage === "paid" && activation.hasActiveAccess) {
    return {
      kind: "paid_active",
      email: user.email ?? null,
      displayName,
      pendingEntrySource,
      hasPermanentPaidAccess,
      trialUsed,
      trialAvailable: false,
      familyAccount: typedFamilyAccount,
      activation,
    };
  }

  return {
    kind: "inactive_access",
    email: user.email ?? null,
    displayName,
    pendingEntrySource,
    hasPermanentPaidAccess,
    trialUsed,
    trialAvailable: false,
    familyAccount: typedFamilyAccount,
    activation,
  };
}

export function getDefaultHrefForAccessState(
  locale: string,
  accessState: UserAccessState
): string {
  switch (accessState.kind) {
    case "anonymous":
      return `/${locale}/login`;
    case "paid_active":
    case "trial_active":
    case "no_family_paid":
      return `/${locale}/app/family`;
    case "trial_expired":
    case "inactive_access":
      return `/${locale}/pricing?entry=family`;
    case "institutional_pending":
      return `/${locale}/pricing?entry=institutional`;
    case "no_family_trial_available":
    case "no_family_no_trial":
    default:
      return `/${locale}`;
  }
}