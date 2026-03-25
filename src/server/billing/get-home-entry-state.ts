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

export type HomeEntryState =
  | { kind: "anonymous" }
  | {
      kind: "signed_in_no_family";
      email: string | null;
      pendingEntrySource: PendingEntrySource;
    }
  | {
      kind: "trial_active";
      email: string | null;
      trialEndsAt: string | null;
      trialRemainingLabel: string;
    }
  | {
      kind: "trial_expired";
      email: string | null;
    }
  | {
      kind: "paid_active";
      email: string | null;
    }
  | {
      kind: "inactive_access";
      email: string | null;
      entrySource: PendingEntrySource;
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

function formatTrialRemainingLabel(trialEndsAt: string | null): string {
  if (!trialEndsAt) {
    return "—";
  }

  const endsAt = new Date(trialEndsAt);
  const now = new Date();
  const diff = endsAt.getTime() - now.getTime();

  if (Number.isNaN(endsAt.getTime()) || diff <= 0) {
    return "Trial expired";
  }

  const totalMinutes = Math.ceil(diff / (1000 * 60));
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

export async function getHomeEntryState(): Promise<HomeEntryState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "anonymous" };
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

  if (error || !familyAccount) {
    return {
      kind: "signed_in_no_family",
      email: user.email ?? null,
      pendingEntrySource,
    };
  }

  const typedFamilyAccount = familyAccount as FamilyAccessRow;
  const activation = resolveAccountActivation(typedFamilyAccount);
  const entrySource = normalizePendingEntrySource(typedFamilyAccount.entry_source);

  if (activation.trialState === "active") {
    return {
      kind: "trial_active",
      email: user.email ?? null,
      trialEndsAt: activation.trialEndsAt,
      trialRemainingLabel: formatTrialRemainingLabel(activation.trialEndsAt),
    };
  }

  if (activation.trialState === "expired") {
    return {
      kind: "trial_expired",
      email: user.email ?? null,
    };
  }

  if (activation.billingStage === "paid" && activation.hasActiveAccess) {
    return {
      kind: "paid_active",
      email: user.email ?? null,
    };
  }

  return {
    kind: "inactive_access",
    email: user.email ?? null,
    entrySource,
  };
}