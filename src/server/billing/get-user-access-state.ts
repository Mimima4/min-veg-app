import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  resolveAccountActivation,
  type AccountActivationState,
} from "@/server/billing/resolve-account-activation";
import { syncFamilyPartnerLinkForUser } from "@/server/family/partner/sync-family-partner-link-for-user";

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

type AccessBase = {
  email: string | null;
  displayName: string | null;
  pendingEntrySource: PendingEntrySource;
  hasPermanentPaidAccess: boolean;
  trialUsed: boolean;
  trialAvailable: boolean;
  isFamilyPartner: boolean;
};

export type UserAccessState =
  | (AccessBase & {
      kind: "anonymous";
      email: null;
      displayName: null;
      pendingEntrySource: null;
      hasPermanentPaidAccess: false;
      trialUsed: false;
      trialAvailable: false;
      familyAccount: null;
      activation: null;
      isFamilyPartner: false;
    })
  | (AccessBase & {
      kind:
        | "no_family_paid"
        | "no_family_trial_available"
        | "no_family_no_trial"
        | "institutional_pending";
      familyAccount: null;
      activation: null;
    })
  | (AccessBase & {
      kind: "trial_active" | "trial_expired" | "paid_active" | "inactive_access";
      familyAccount: FamilyAccessRow;
      activation: AccountActivationState;
    });

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

function buildAccessStateFromFamilyAccount(args: {
  userEmail: string | null;
  displayName: string | null;
  pendingEntrySource: PendingEntrySource;
  hasPermanentPaidAccess: boolean;
  trialUsed: boolean;
  familyAccount: FamilyAccessRow;
  isFamilyPartner: boolean;
}): UserAccessState {
  const activation = resolveAccountActivation(args.familyAccount);

  const sharedBase: AccessBase = {
    email: args.userEmail,
    displayName: args.displayName,
    pendingEntrySource: args.pendingEntrySource,
    hasPermanentPaidAccess: args.hasPermanentPaidAccess,
    trialUsed: args.trialUsed,
    trialAvailable: false,
    isFamilyPartner: args.isFamilyPartner,
  };

  if (activation.trialState === "active") {
    return {
      kind: "trial_active",
      ...sharedBase,
      familyAccount: args.familyAccount,
      activation,
    };
  }

  if (activation.trialState === "expired") {
    return {
      kind: "trial_expired",
      ...sharedBase,
      trialUsed: true,
      familyAccount: args.familyAccount,
      activation,
    };
  }

  if (activation.billingStage === "paid" && activation.hasActiveAccess) {
    return {
      kind: "paid_active",
      ...sharedBase,
      familyAccount: args.familyAccount,
      activation,
    };
  }

  return {
    kind: "inactive_access",
    ...sharedBase,
    familyAccount: args.familyAccount,
    activation,
  };
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
      isFamilyPartner: false,
    };
  }

  await syncFamilyPartnerLinkForUser({
    userId: user.id,
    email: user.email,
  });
  const admin = createAdminClient();

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

  const { data: linkedPartnerRow } = await admin
    .from("family_partner_links")
    .select("family_account_id, primary_user_id, partner_user_id, status")
    .eq("partner_user_id", user.id)
    .eq("status", "linked")
    .maybeSingle();

  if (linkedPartnerRow?.family_account_id) {
    const { data: linkedFamilyAccount } = await admin
      .from("family_accounts")
      .select(
        "id, plan_type, status, subscription_state, entry_source, activation_source, plan_code, trial_started_at, trial_ends_at, trial_used, current_period_ends_at, next_billing_at, auto_renew_enabled, grace_period_ends_at, payment_failed_at, canceled_at, last_payment_status"
      )
      .eq("id", linkedPartnerRow.family_account_id)
      .maybeSingle();

    if (linkedFamilyAccount) {
      return buildAccessStateFromFamilyAccount({
        userEmail: user.email ?? null,
        displayName,
        pendingEntrySource,
        hasPermanentPaidAccess: false,
        trialUsed,
        familyAccount: linkedFamilyAccount as FamilyAccessRow,
        isFamilyPartner: true,
      });
    }
  }

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
        isFamilyPartner: false,
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
        isFamilyPartner: false,
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
        isFamilyPartner: false,
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
      isFamilyPartner: false,
    };
  }

  return buildAccessStateFromFamilyAccount({
    userEmail: user.email ?? null,
    displayName,
    pendingEntrySource,
    hasPermanentPaidAccess,
    trialUsed,
    familyAccount: familyAccount as FamilyAccessRow,
    isFamilyPartner: false,
  });
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
    case "no_family_trial_available":
    case "no_family_no_trial":
      return `/${locale}/app/family`;
    case "trial_expired":
    case "inactive_access":
    case "institutional_pending":
      return `/${locale}/resolve-access`;
    default:
      return `/${locale}/app/family`;
  }
}
