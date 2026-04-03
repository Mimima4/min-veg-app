import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  resolveAccountActivation,
  type FamilyActivationSnapshot,
} from "@/server/billing/resolve-account-activation";
import { getActiveComplimentaryAccessGrant } from "@/server/billing/get-active-complimentary-access-grant";

type FamilyAccessDiagnostics = {
  familyAccountId: string;
  accessSource: "paid" | "complimentary" | "trial" | "inactive";
  activeUntil: string | null;
  billing: {
    subscriptionState: string | null;
    currentPeriodStartsAt: string | null;
    currentPeriodEndsAt: string | null;
    nextBillingAt: string | null;
    lastPaymentStatus: string | null;
    hasActiveAccess: boolean;
    billingStage: string;
    trialState: string;
  };
  complimentary: {
    hasActiveGrant: boolean;
    grantId: string | null;
    grantType: string | null;
    startsAt: string | null;
    endsAt: string | null;
    supersededByPaidAccess: boolean;
  };
};

export async function getFamilyAccessDiagnostics(args: {
  familyAccountId: string;
}): Promise<FamilyAccessDiagnostics> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("family_accounts")
    .select(
      [
        "id",
        "plan_type",
        "status",
        "subscription_state",
        "entry_source",
        "activation_source",
        "plan_code",
        "trial_started_at",
        "trial_ends_at",
        "trial_used",
        "current_period_starts_at",
        "current_period_ends_at",
        "next_billing_at",
        "auto_renew_enabled",
        "grace_period_ends_at",
        "payment_failed_at",
        "canceled_at",
        "last_payment_status",
      ].join(", ")
    )
    .eq("id", args.familyAccountId)
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to load family account for diagnostics: ${error?.message ?? "not found"}`
    );
  }

  const familyAccount = (data as unknown) as FamilyActivationSnapshot & {
    id: string;
    current_period_starts_at: string | null;
  };

  const activation = resolveAccountActivation(familyAccount);
  const complimentaryGrant = await getActiveComplimentaryAccessGrant({
    familyAccountId: args.familyAccountId,
  });

  let accessSource: FamilyAccessDiagnostics["accessSource"] = "inactive";
  let activeUntil: string | null = null;

  if (activation.billingStage === "paid" && activation.hasActiveAccess) {
    accessSource = "paid";
    activeUntil = activation.currentPeriodEndsAt ?? null;
  } else if (complimentaryGrant) {
    accessSource = "complimentary";
    activeUntil = complimentaryGrant.ends_at ?? null;
  } else if (activation.trialState === "active") {
    accessSource = "trial";
    activeUntil = activation.trialEndsAt ?? null;
  }

  return {
    familyAccountId: args.familyAccountId,
    accessSource,
    activeUntil,
    billing: {
      subscriptionState: familyAccount.subscription_state ?? null,
      currentPeriodStartsAt: familyAccount.current_period_starts_at ?? null,
      currentPeriodEndsAt: familyAccount.current_period_ends_at ?? null,
      nextBillingAt: familyAccount.next_billing_at ?? null,
      lastPaymentStatus: familyAccount.last_payment_status ?? null,
      hasActiveAccess: activation.hasActiveAccess,
      billingStage: activation.billingStage,
      trialState: activation.trialState,
    },
    complimentary: {
      hasActiveGrant: Boolean(complimentaryGrant),
      grantId: complimentaryGrant?.id ?? null,
      grantType: complimentaryGrant?.grant_type ?? null,
      startsAt: complimentaryGrant?.starts_at ?? null,
      endsAt: complimentaryGrant?.ends_at ?? null,
      supersededByPaidAccess:
        complimentaryGrant?.superseded_by_paid_access ?? false,
    },
  };
}