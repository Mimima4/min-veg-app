import { createClient } from "@/lib/supabase/server";
import { resolveAccountActivation } from "@/server/billing/resolve-account-activation";

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

function getPendingDestination(
  locale: string,
  pendingEntrySource: PendingEntrySource
): string {
  switch (pendingEntrySource) {
    case "paid":
      return `/${locale}/pricing?entry=family`;
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
}: {
  locale: string;
}): Promise<string> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return `/${locale}/login`;
  }

  const pendingEntrySource = normalizePendingEntrySource(
    typeof user.user_metadata?.entry_source === "string"
      ? user.user_metadata.entry_source
      : null
  );

  const { data: familyAccount, error } = await supabase
    .from("family_accounts")
    .select(
      "id, plan_type, status, subscription_state, entry_source, activation_source, plan_code, trial_started_at, trial_ends_at, trial_used"
    )
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (error) {
    return `/${locale}/pricing?entry=family`;
  }

  if (!familyAccount) {
    return getPendingDestination(locale, pendingEntrySource);
  }

  const typedFamilyAccount = familyAccount as FamilyAccessRow;
  const activation = resolveAccountActivation(typedFamilyAccount);

  if (activation.trialState === "active") {
    return `/${locale}/app/family`;
  }

  if (activation.trialState === "expired") {
    return `/${locale}/pricing?entry=family`;
  }

  if (activation.billingStage === "paid" && activation.hasActiveAccess) {
    return `/${locale}/app/family`;
  }

  const entrySource = normalizePendingEntrySource(
    typedFamilyAccount.entry_source ?? pendingEntrySource
  );

  return getPendingDestination(locale, entrySource);
}