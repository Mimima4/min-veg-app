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
    case "school":
    case "school_referral":
    case "kommune":
    case "fylke":
    case "institutional":
      return `/${locale}/pricing?entry=institutional`;
    case "paid":
    case "trial":
    case "direct":
    default:
      return `/${locale}`;
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

  const hasPermanentPaidAccess =
    user.app_metadata?.admin_access === true ||
    user.app_metadata?.role === "platform_admin";

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

  let finalHref: string;

  if (!familyAccount) {
    if (hasPermanentPaidAccess) {
      finalHref = `/${locale}/app/family`;
    } else {
      finalHref = getPendingDestination(locale, pendingEntrySource);
    }

    return finalHref;
  }

  const typedFamilyAccount = familyAccount as FamilyAccessRow;
  const activation = resolveAccountActivation(typedFamilyAccount);

  if (activation.trialState === "active") {
    finalHref = `/${locale}/app/family`;
    return finalHref;
  }

  if (activation.trialState === "expired") {
    finalHref = `/${locale}/pricing?entry=family`;
    return finalHref;
  }

  if (activation.billingStage === "paid" && activation.hasActiveAccess) {
    finalHref = `/${locale}/app/family`;
    return finalHref;
  }

  const entrySource = normalizePendingEntrySource(
    typedFamilyAccount.entry_source ?? pendingEntrySource
  );
  const isInstitutionalEntrySource =
    entrySource === "school" ||
    entrySource === "school_referral" ||
    entrySource === "kommune" ||
    entrySource === "fylke" ||
    entrySource === "institutional";

  finalHref = isInstitutionalEntrySource
    ? `/${locale}/pricing?entry=institutional`
    : `/${locale}/pricing?entry=family`;

  return finalHref;
}