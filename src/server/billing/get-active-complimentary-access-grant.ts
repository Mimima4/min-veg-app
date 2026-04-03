import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type ActiveComplimentaryAccessGrant = {
  id: string;
  family_account_id: string;
  grant_type: "fixed_period" | "until_date" | "permanent";
  plan_code: string | null;
  status: "active" | "scheduled" | "expired" | "revoked" | "superseded";
  starts_at: string;
  ends_at: string | null;
  issued_by_user_id: string | null;
  issued_by_type: "platform_admin" | "system";
  reason: string | null;
  notes: string | null;
  superseded_by_paid_access: boolean;
  created_at: string;
  updated_at: string;
};

function isGrantActiveNow(grant: {
  status: string;
  starts_at: string;
  ends_at: string | null;
  superseded_by_paid_access: boolean;
}) {
  if (grant.status !== "active") {
    return false;
  }

  if (grant.superseded_by_paid_access) {
    return false;
  }

  const now = Date.now();
  const startsAt = new Date(grant.starts_at).getTime();

  if (Number.isNaN(startsAt) || startsAt > now) {
    return false;
  }

  if (!grant.ends_at) {
    return true;
  }

  const endsAt = new Date(grant.ends_at).getTime();

  if (Number.isNaN(endsAt)) {
    return false;
  }

  return endsAt > now;
}

export async function getActiveComplimentaryAccessGrant(args: {
  familyAccountId: string;
}): Promise<ActiveComplimentaryAccessGrant | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("complimentary_access_grants")
    .select(
      [
        "id",
        "family_account_id",
        "grant_type",
        "plan_code",
        "status",
        "starts_at",
        "ends_at",
        "issued_by_user_id",
        "issued_by_type",
        "reason",
        "notes",
        "superseded_by_paid_access",
        "created_at",
        "updated_at",
      ].join(", ")
    )
    .eq("family_account_id", args.familyAccountId)
    .in("status", ["active", "scheduled"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to load complimentary access grants: ${error.message}`
    );
  }

  const grants =
    (((data ?? []) as unknown) as ActiveComplimentaryAccessGrant[]) ?? [];

  const activeGrant = grants.find((grant) => isGrantActiveNow(grant));

  return activeGrant ?? null;
}