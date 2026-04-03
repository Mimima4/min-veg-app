import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type ActiveSchoolReferralContext = {
  id: string;
  family_account_id: string;
  school_id: string;
  referral_code: string | null;
  activation_source: "school" | "kommune";
  pricing_tier: "school_basic_year" | "school_plus_year";
  discount_valid_until: string;
  discount_consumed: boolean;
  discount_consumed_at: string | null;
  created_at: string;
  updated_at: string;
};

function isReferralContextActiveNow(row: {
  discount_valid_until: string;
  discount_consumed: boolean;
}) {
  if (row.discount_consumed) {
    return false;
  }

  const validUntil = new Date(row.discount_valid_until).getTime();

  if (Number.isNaN(validUntil)) {
    return false;
  }

  return validUntil > Date.now();
}

export async function getActiveSchoolReferralContext(args: {
  familyAccountId: string;
}): Promise<ActiveSchoolReferralContext | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("school_referral_contexts")
    .select(
      [
        "id",
        "family_account_id",
        "school_id",
        "referral_code",
        "activation_source",
        "pricing_tier",
        "discount_valid_until",
        "discount_consumed",
        "discount_consumed_at",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .eq("family_account_id", args.familyAccountId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to load school referral contexts: ${error.message}`
    );
  }

  const rows =
    (((data ?? []) as unknown) as ActiveSchoolReferralContext[]) ?? [];

  const activeContext = rows.find((row) => isReferralContextActiveNow(row));

  return activeContext ?? null;
}