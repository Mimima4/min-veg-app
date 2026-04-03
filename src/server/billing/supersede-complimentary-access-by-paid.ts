import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function supersedeComplimentaryAccessByPaid(args: {
  familyAccountId: string;
}) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("complimentary_access_grants")
    .update({
      status: "superseded",
      superseded_by_paid_access: true,
      updated_at: new Date().toISOString(),
    })
    .eq("family_account_id", args.familyAccountId)
    .in("status", ["active", "scheduled"])
    .eq("superseded_by_paid_access", false);

  if (error) {
    throw new Error(
      `Failed to supersede complimentary access grants by paid access: ${error.message}`
    );
  }

  return { ok: true };
}