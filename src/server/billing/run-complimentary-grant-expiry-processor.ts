import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function runComplimentaryGrantExpiryProcessor(args?: {
  limit?: number;
}) {
  const admin = createAdminClient();

  const limit = args?.limit ?? 50;
  const nowIso = new Date().toISOString();

  const { data, error } = await admin
    .from("complimentary_access_grants")
    .select("id, ends_at")
    .eq("status", "active")
    .not("ends_at", "is", null)
    .lte("ends_at", nowIso)
    .order("ends_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(
      `Failed to load expired complimentary grants: ${error.message}`
    );
  }

  const grants = data ?? [];

  if (grants.length === 0) {
    return {
      processed: 0,
      expired: 0,
    };
  }

  let expired = 0;

  for (const grant of grants) {
    const { error: updateError } = await admin
      .from("complimentary_access_grants")
      .update({
        status: "expired",
        updated_at: new Date().toISOString(),
      })
      .eq("id", grant.id);

    if (updateError) {
      throw new Error(
        `Failed to expire complimentary grant ${grant.id}: ${updateError.message}`
      );
    }

    expired += 1;
  }

  return {
    processed: grants.length,
    expired,
  };
}