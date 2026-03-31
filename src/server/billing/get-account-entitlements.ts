import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPaymentFactsForBillingSubject,
  type PaymentFactsForBillingSubject,
} from "@/server/billing/get-payment-facts-for-billing-subject";
import {
  resolveAccountActivation,
  type AccountActivationState,
  type BillingStage,
} from "@/server/billing/resolve-account-activation";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type FamilyAccountRow = {
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
  max_children: number | null;
  created_at: string;
};

export type EntitlementRestrictionReason =
  | "family_inactive"
  | "child_limit_reached";

export type AccountEntitlements = {
  familyAccount: FamilyAccountRow;
  paymentFacts: PaymentFactsForBillingSubject;
  activation: AccountActivationState;
  billingStage: BillingStage;
  childCount: number;
  maxChildren: number;
  remainingChildSlots: number;
  childLimitReached: boolean;
  canCreateChild: boolean;
  needsUpgradeForMoreChildren: boolean;
  restrictionReason: EntitlementRestrictionReason | null;
  restrictionMessage: string | null;
  billingDiagnostics: {
    hasPaymentMismatch: boolean;
    reason: string | null;
  };
};

export type AccountEntitlementsResult =
  | { kind: "redirect"; href: string }
  | { kind: "error"; title: string; subtitle: string; message: string }
  | { kind: "no_family" }
  | { kind: "ok"; data: AccountEntitlements };

export async function getAccountEntitlements({
  locale,
  supabase: providedSupabase,
}: {
  locale: string;
  supabase?: SupabaseServerClient;
}): Promise<AccountEntitlementsResult> {
  const supabase = providedSupabase ?? (await createClient());
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "redirect", href: `/${locale}/login` };
  }

  const familyAccountSelect =
    "id, plan_type, status, subscription_state, entry_source, activation_source, plan_code, trial_started_at, trial_ends_at, trial_used, current_period_ends_at, next_billing_at, auto_renew_enabled, grace_period_ends_at, payment_failed_at, canceled_at, last_payment_status, max_children, created_at";

  let familyAccount: FamilyAccountRow | null = null;

  const { data: linkedPartnerRow, error: linkedPartnerError } = await admin
    .from("family_partner_links")
    .select("family_account_id, primary_user_id, partner_user_id, status")
    .eq("partner_user_id", user.id)
    .eq("status", "linked")
    .maybeSingle();

  if (linkedPartnerError) {
    return {
      kind: "error",
      title: "Account access",
      subtitle: "There was a problem loading your account entitlements.",
      message: linkedPartnerError.message,
    };
  }

  if (linkedPartnerRow?.family_account_id) {
    const { data: linkedFamilyAccount, error: linkedFamilyError } = await admin
      .from("family_accounts")
      .select(familyAccountSelect)
      .eq("id", linkedPartnerRow.family_account_id)
      .maybeSingle();

    if (linkedFamilyError) {
      return {
        kind: "error",
        title: "Account access",
        subtitle: "There was a problem loading your account entitlements.",
        message: linkedFamilyError.message,
      };
    }

    if (!linkedFamilyAccount) {
      return { kind: "no_family" };
    }

    familyAccount = linkedFamilyAccount as FamilyAccountRow;
  }

  if (!familyAccount) {
    const { data: primaryFamilyAccount, error: familyError } = await supabase
      .from("family_accounts")
      .select(familyAccountSelect)
      .eq("primary_user_id", user.id)
      .maybeSingle();

    if (familyError) {
      return {
        kind: "error",
        title: "Account access",
        subtitle: "There was a problem loading your account entitlements.",
        message: familyError.message,
      };
    }

    familyAccount = primaryFamilyAccount as FamilyAccountRow | null;
  }

  if (!familyAccount) {
    return { kind: "no_family" };
  }

  const typedFamilyAccount = familyAccount;
  const activation = resolveAccountActivation(typedFamilyAccount);
  const paymentFacts = await getPaymentFactsForBillingSubject({
    billingSubjectType: "family",
    billingSubjectId: typedFamilyAccount.id,
  });

  let hasPaymentMismatch = false;
  let paymentMismatchReason: string | null = null;

  const hasValidPayment = paymentFacts.paymentAnswers.hasValidProviderPayment;
  const lastPaymentStatus = typedFamilyAccount.last_payment_status;

  if (hasValidPayment && lastPaymentStatus === "failed") {
    hasPaymentMismatch = true;
    paymentMismatchReason =
      "Valid payment exists but last_payment_status is failed";
  }

  const { count: childCount, error: childCountError } = await supabase
    .from("child_profiles")
    .select("id", { count: "exact", head: true })
    .eq("family_account_id", typedFamilyAccount.id);

  if (childCountError) {
    return {
      kind: "error",
      title: "Account access",
      subtitle: "There was a problem loading current child usage.",
      message: childCountError.message,
    };
  }

  const resolvedChildCount = childCount ?? 0;
  const resolvedMaxChildren = Math.max(typedFamilyAccount.max_children ?? 0, 0);
  const remainingChildSlots = Math.max(
    resolvedMaxChildren - resolvedChildCount,
    0
  );

  const familyAccessActive = activation.hasActiveAccess;
  const childLimitReached = resolvedChildCount >= resolvedMaxChildren;

  let restrictionReason: EntitlementRestrictionReason | null = null;
  let restrictionMessage: string | null = null;

  if (!familyAccessActive) {
    restrictionReason = "family_inactive";

    if (activation.trialState === "expired") {
      restrictionMessage =
        "The 3-day trial has ended. Full access is now blocked until you choose a paid family plan.";
    } else {
      restrictionMessage =
        "This family account is not currently active, so child creation is blocked.";
    }
  } else if (childLimitReached) {
    restrictionReason = "child_limit_reached";
    restrictionMessage =
      "The current child limit has been reached for this subscription.";
  }

  return {
    kind: "ok",
    data: {
      familyAccount: typedFamilyAccount,
      paymentFacts,
      activation,
      billingStage: activation.billingStage,
      childCount: resolvedChildCount,
      maxChildren: resolvedMaxChildren,
      remainingChildSlots,
      childLimitReached,
      canCreateChild: familyAccessActive && !childLimitReached,
      needsUpgradeForMoreChildren: familyAccessActive && childLimitReached,
      restrictionReason,
      restrictionMessage,
      billingDiagnostics: {
        hasPaymentMismatch,
        reason: paymentMismatchReason,
      },
    },
  };
}