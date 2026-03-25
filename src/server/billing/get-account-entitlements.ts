import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type FamilyAccountRow = {
  id: string;
  plan_type: string;
  status: string;
  max_children: number;
  created_at: string;
};

export type BillingStage =
  | "demo"
  | "trial"
  | "paid"
  | "inactive"
  | "unknown";

export type EntitlementRestrictionReason =
  | "family_inactive"
  | "child_limit_reached";

export type AccountEntitlements = {
  familyAccount: FamilyAccountRow;
  billingStage: BillingStage;
  childCount: number;
  maxChildren: number;
  remainingChildSlots: number;
  childLimitReached: boolean;
  canCreateChild: boolean;
  needsUpgradeForMoreChildren: boolean;
  restrictionReason: EntitlementRestrictionReason | null;
  restrictionMessage: string | null;
};

export type AccountEntitlementsResult =
  | { kind: "redirect"; href: string }
  | { kind: "error"; title: string; subtitle: string; message: string }
  | { kind: "no_family" }
  | { kind: "ok"; data: AccountEntitlements };

function normalize(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function inferBillingStage(planType: string, status: string): BillingStage {
  const normalizedPlanType = normalize(planType);
  const normalizedStatus = normalize(status);

  if (
    normalizedStatus.includes("inactive") ||
    normalizedStatus.includes("canceled") ||
    normalizedStatus.includes("cancelled") ||
    normalizedStatus.includes("suspended") ||
    normalizedStatus.includes("expired") ||
    normalizedStatus.includes("past_due")
  ) {
    return "inactive";
  }

  if (
    normalizedPlanType.includes("demo") ||
    normalizedStatus.includes("demo")
  ) {
    return "demo";
  }

  if (
    normalizedPlanType.includes("trial") ||
    normalizedStatus.includes("trial")
  ) {
    return "trial";
  }

  if (
    normalizedStatus.includes("active") ||
    normalizedPlanType.includes("basic") ||
    normalizedPlanType.includes("plus") ||
    normalizedPlanType.includes("young")
  ) {
    return "paid";
  }

  return "unknown";
}

function isFamilyAccessActive(status: string): boolean {
  const normalizedStatus = normalize(status);

  if (!normalizedStatus) {
    return true;
  }

  if (
    normalizedStatus.includes("inactive") ||
    normalizedStatus.includes("canceled") ||
    normalizedStatus.includes("cancelled") ||
    normalizedStatus.includes("suspended") ||
    normalizedStatus.includes("expired") ||
    normalizedStatus.includes("past_due")
  ) {
    return false;
  }

  return true;
}

export async function getAccountEntitlements({
  locale,
  supabase: providedSupabase,
}: {
  locale: string;
  supabase?: SupabaseServerClient;
}): Promise<AccountEntitlementsResult> {
  const supabase = providedSupabase ?? (await createClient());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "redirect", href: `/${locale}/login` };
  }

  const { data: familyAccount, error: familyError } = await supabase
    .from("family_accounts")
    .select("id, plan_type, status, max_children, created_at")
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

  if (!familyAccount) {
    return { kind: "no_family" };
  }

  const typedFamilyAccount = familyAccount as FamilyAccountRow;

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

  const familyAccessActive = isFamilyAccessActive(typedFamilyAccount.status);
  const childLimitReached = resolvedChildCount >= resolvedMaxChildren;

  let restrictionReason: EntitlementRestrictionReason | null = null;
  let restrictionMessage: string | null = null;

  if (!familyAccessActive) {
    restrictionReason = "family_inactive";
    restrictionMessage =
      "This family account is not currently active, so child creation is blocked.";
  } else if (childLimitReached) {
    restrictionReason = "child_limit_reached";
    restrictionMessage =
      "The current child limit has been reached for this subscription.";
  }

  return {
    kind: "ok",
    data: {
      familyAccount: typedFamilyAccount,
      billingStage: inferBillingStage(
        typedFamilyAccount.plan_type,
        typedFamilyAccount.status
      ),
      childCount: resolvedChildCount,
      maxChildren: resolvedMaxChildren,
      remainingChildSlots,
      childLimitReached,
      canCreateChild: familyAccessActive && !childLimitReached,
      needsUpgradeForMoreChildren: familyAccessActive && childLimitReached,
      restrictionReason,
      restrictionMessage,
    },
  };
}