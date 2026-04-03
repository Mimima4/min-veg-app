import "server-only";

import {
  createClient as createSupabaseClient,
} from "@supabase/supabase-js";
import {
  buildBillingNotificationEvents,
  type BillingNotificationCandidate,
  type BillingNotificationEventType,
} from "@/server/billing/build-billing-notification-events";
import {
  buildBillingSuccessNotificationEvents,
  type BillingSubscriptionHistoryRow,
} from "@/server/billing/build-billing-success-notification-events";

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
  current_period_starts_at: string | null;
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

type UserProfileRow = {
  id: string;
  display_name: string | null;
};

type ExistingNotificationRow = {
  id: string;
  family_account_id: string;
  dedupe_key: string;
  event_type: BillingNotificationEventType;
  status: "pending" | "sent" | "skipped" | "canceled" | "failed";
};

type SyncResult = {
  scanned: number;
  candidates: number;
  insertedOrUpdated: number;
  canceled: number;
};

type SyncOptions = {
  familyAccountIds?: string[];
  successSubscriptionEventIds?: string[];
};

const MANAGED_EVENT_TYPES: BillingNotificationEventType[] = [
  "trial_ending_6h",
  "trial_expired",
  "subscription_ending_3d",
  "subscription_ending_7d",
  "subscription_started_success",
  "subscription_renewed_success",
  "payment_failed",
  "grace_period_ending_24h",
];

const SUCCESS_EVENT_TYPES = [
  "subscription_started_success",
  "subscription_renewed_success",
] as const;

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
    status: "pending" as const,
  };
}

export async function syncBillingNotificationEvents(
  options: SyncOptions = {}
): Promise<SyncResult> {
  const admin = createAdminClient();
  const nowIso = new Date().toISOString();
  const sevenDaysAgoIso = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  let familyQuery = admin
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
        "current_period_starts_at",
        "current_period_ends_at",
        "next_billing_at",
        "auto_renew_enabled",
        "grace_period_ends_at",
        "payment_failed_at",
        "canceled_at",
        "last_payment_status",
      ].join(", ")
    );

  if (options.familyAccountIds && options.familyAccountIds.length > 0) {
    familyQuery = familyQuery.in("id", options.familyAccountIds);
  }

  const { data: families, error: familyError } = await familyQuery;

  if (familyError) {
    throw new Error(`Failed to load family_accounts: ${familyError.message}`);
  }

  const familyRows = ((families ?? []) as unknown) as FamilyAccountRow[];

  let successQuery = admin
    .from("billing_subscription_events")
    .select(
      "id, family_account_id, primary_user_id, event_type, event_at, current_period_starts_at, current_period_ends_at, billing_cycle, payload"
    )
    .in("event_type", [...SUCCESS_EVENT_TYPES]);

  if (
    options.successSubscriptionEventIds &&
    options.successSubscriptionEventIds.length > 0
  ) {
    successQuery = successQuery.in("id", options.successSubscriptionEventIds);
  } else {
    successQuery = successQuery
      .gte("event_at", sevenDaysAgoIso)
      .lte("event_at", nowIso);
  }

  if (options.familyAccountIds && options.familyAccountIds.length > 0) {
    successQuery = successQuery.in("family_account_id", options.familyAccountIds);
  }

  const { data: successEvents, error: successEventsError } = await successQuery
    .order("event_at", { ascending: false });

  if (successEventsError) {
    throw new Error(
      `Failed to load billing_subscription_events: ${successEventsError.message}`
    );
  }

  const successRows =
    (((successEvents ?? []) as unknown) as BillingSubscriptionHistoryRow[]) ?? [];

  const userIds = Array.from(
    new Set(
      [
        ...familyRows.map((row) => row.primary_user_id),
        ...successRows.map((row) => row.primary_user_id),
      ].filter(Boolean)
    )
  );

  const familyIds = Array.from(
    new Set([
      ...familyRows.map((row) => row.id),
      ...successRows.map((row) => row.family_account_id),
    ])
  );

  const authUserMap = new Map<string, AuthUserRow>();

  if (userIds.length > 0) {
    const { data: authUsers, error: authUsersError } =
      await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (authUsersError) {
      throw new Error(`Failed to load auth users: ${authUsersError.message}`);
    }

    for (const user of authUsers.users ?? []) {
      if (!userIds.includes(user.id)) {
        continue;
      }

      authUserMap.set(user.id, {
        id: user.id,
        email: user.email ?? null,
      });
    }
  }

  let profiles: UserProfileRow[] = [];

  if (userIds.length > 0) {
    const { data: profileRows, error: profilesError } = await admin
      .from("user_profiles")
      .select("id, display_name")
      .in("id", userIds);

    if (profilesError) {
      throw new Error(`Failed to load user_profiles: ${profilesError.message}`);
    }

    profiles = (((profileRows ?? []) as unknown) as UserProfileRow[]) ?? [];
  }

  const recipientNameByUserId = new Map<string, string | null>();

  for (const profile of profiles) {
    recipientNameByUserId.set(profile.id, profile.display_name?.trim() || null);
  }

  const emailByUserId = new Map<string, string | null>();

  for (const [userId, authUser] of authUserMap) {
    emailByUserId.set(userId, authUser.email ?? null);
  }

  const profileMap = new Map<string, UserProfileRow>(
    profiles.map((profile) => [profile.id, profile])
  );

  const stateCandidates: BillingNotificationCandidate[] = [];

  for (const family of familyRows) {
    const profile = profileMap.get(family.primary_user_id);

    const candidates = buildBillingNotificationEvents({
      familyAccountId: family.id,
      primaryUserId: family.primary_user_id,
      email: emailByUserId.get(family.primary_user_id) ?? null,
      recipientName: profile?.display_name?.trim() || null,
      snapshot: family,
    });

    stateCandidates.push(...candidates);
  }

  const successCandidates = buildBillingSuccessNotificationEvents({
    rows: successRows,
    emailByUserId,
    recipientNameByUserId,
  });

  const allCandidates = [...stateCandidates, ...successCandidates];

  const expectedDedupeKeys = new Set(allCandidates.map((item) => item.dedupeKey));

  let stalePendingEvents: ExistingNotificationRow[] = [];

  if (familyIds.length > 0) {
    const { data: existingPendingEvents, error: existingPendingEventsError } =
      await admin
        .from("billing_notification_events")
        .select("id, family_account_id, dedupe_key, event_type, status")
        .in("family_account_id", familyIds)
        .in("event_type", MANAGED_EVENT_TYPES)
        .eq("status", "pending");

    if (existingPendingEventsError) {
      throw new Error(
        `Failed to load existing billing_notification_events: ${existingPendingEventsError.message}`
      );
    }

    stalePendingEvents =
      ((((existingPendingEvents ?? []) as unknown) as ExistingNotificationRow[]))
        .filter((event) => !expectedDedupeKeys.has(event.dedupe_key));
  }

  let canceled = 0;

  if (stalePendingEvents.length > 0) {
    const staleIds = stalePendingEvents.map((event) => event.id);

    const { data: canceledRows, error: cancelError } = await admin
      .from("billing_notification_events")
      .update({
        status: "canceled",
        last_error:
          "Canceled by reconciliation: event is no longer expected for the current billing state.",
      })
      .in("id", staleIds)
      .select("id");

    if (cancelError) {
      throw new Error(
        `Failed to cancel stale billing_notification_events: ${cancelError.message}`
      );
    }

    canceled = canceledRows?.length ?? 0;
  }

  if (allCandidates.length === 0) {
    return {
      scanned: familyRows.length,
      candidates: 0,
      insertedOrUpdated: 0,
      canceled,
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
    canceled,
  };
}
