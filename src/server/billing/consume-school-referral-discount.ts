import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function consumeSchoolReferralDiscount(args: {
  referralContextId: string;
}) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("school_referral_contexts")
    .update({
      discount_consumed: true,
      discount_consumed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", args.referralContextId)
    .eq("discount_consumed", false);

  if (error) {
    throw new Error(
      `Failed to consume school referral discount: ${error.message}`
    );
  }

  return { ok: true };
}