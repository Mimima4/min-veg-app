import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  buildBillingNotificationEvents,
  type BillingNotificationCandidate,
} from "@/server/billing/build-billing-notification-events";

type FamilyAccountRow = {
  id: string;
  primary_user_id: string;
  plan_type: string | null;
  status: string | null;
  subscription_state: string | null;
  entry_source: string | null;
  activation_source: string | null;
  plan_code: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  trial_used: boolean | null;
  current_period_ends_at: string | null;
  next_billing_at: string | null;
  auto_renew_enabled: boolean | null;
  grace_period_ends_at: string | null;
  payment_failed_at: string | null;
  canceled_at: string | null;
  last_payment_status: string | null;
};

type AuthUserRow = {
  id: string;
  email: string | null;
};

type SyncResult = {
  scanned: number;
  candidates: number;
  insertedOrUpdated: number;
};

function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function toNotificationRow(candidate: BillingNotificationCandidate) {
  return {
    family_account_id: candidate.familyAccountId,
    primary_user_id: candidate.primaryUserId,
    event_type: candidate.eventType,
    dedupe_key: candidate.dedupeKey,
    scheduled_for: candidate.scheduledFor,
    payload: candidate.payload,
    status: "pending",
  };
}

export async function syncBillingNotificationEvents(): Promise<SyncResult> {
  const admin = createAdminClient();

  const { data: families, error: familyError } = await admin
    .from("family_accounts")
    .select(
      [
        "id",
        "primary_user_id",
        "plan_type",
        "status",
        "subscription_state",
        "entry_source",
        "activation_source",
        "plan_code",
        "trial_started_at",
        "trial_ends_at",
        "trial_used",
        "current_period_ends_at",
        "next_billing_at",
        "auto_renew_enabled",
        "grace_period_ends_at",
        "payment_failed_at",
        "canceled_at",
        "last_payment_status",
      ].join(", ")
    );

  if (familyError) {
    throw new Error(
      `Failed to load family_accounts: ${familyError.message}`
    );
  }

  const familyRows = (families ?? []) as FamilyAccountRow[];

  if (familyRows.length === 0) {
    return {
      scanned: 0,
      candidates: 0,
      insertedOrUpdated: 0,
    };
  }

  const userIds = Array.from(
    new Set(familyRows.map((row) => row.primary_user_id).filter(Boolean))
  );

  const { data: authUsers, error: authUsersError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (authUsersError) {
    throw new Error(
      `Failed to load auth users: ${authUsersError.message}`
    );
  }

  const authUserMap = new Map<string, AuthUserRow>(
    (authUsers.users ?? [])
      .filter((user) => userIds.includes(user.id))
      .map((user) => [
        user.id,
        {
          id: user.id,
          email: user.email ?? null,
        },
      ])
  );

  const allCandidates: BillingNotificationCandidate[] = [];

  for (const family of familyRows) {
    const authUser = authUserMap.get(family.primary_user_id);

    const candidates = buildBillingNotificationEvents({
      familyAccountId: family.id,
      primaryUserId: family.primary_user_id,
      email: authUser?.email ?? null,
      snapshot: family,
    });

    allCandidates.push(...candidates);
  }

  if (allCandidates.length === 0) {
    return {
      scanned: familyRows.length,
      candidates: 0,
      insertedOrUpdated: 0,
    };
  }

  const rows = allCandidates.map(toNotificationRow);

  const { error: upsertError, data: upserted } = await admin
    .from("billing_notification_events")
    .upsert(rows, {
      onConflict: "dedupe_key",
      ignoreDuplicates: false,
    })
    .select("id");

  if (upsertError) {
    throw new Error(
      `Failed to upsert billing_notification_events: ${upsertError.message}`
    );
  }

  return {
    scanned: familyRows.length,
    candidates: allCandidates.length,
    insertedOrUpdated: upserted?.length ?? 0,
  };
}