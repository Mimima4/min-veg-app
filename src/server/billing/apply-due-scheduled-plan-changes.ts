import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { projectBillingSubscriptionSnapshotToFamilyAccount } from "@/server/billing/project-billing-subscription-snapshot";
import { recordBillingSubscriptionEvent } from "@/server/billing/record-billing-subscription-event";
import { recordBillingLedgerEntry } from "@/server/billing/record-billing-ledger-entry";

type ScheduledPlanChangeRow = {
  id: string;
  family_account_id: string;
  target_plan_code: string;
  target_billing_cycle: string;
  effective_at: string;
  target_current_period_starts_at: string | null;
  target_current_period_ends_at: string | null;
  target_next_billing_at: string | null;
  status: string;
  created_by: string;
  source: string | null;
  canceled_at: string | null;
  cancel_reason: string | null;
  applied_at: string | null;
  applied_subscription_event_id: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeLower(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

function resolvePlanTypeFromPlanCode(planCode: string): string {
  switch (normalizeLower(planCode)) {
    case "family_basic":
    case "school_referred_family_basic":
      return "family_basic";
    case "family_plus":
    case "school_referred_family_plus":
      return "family_plus";
    default:
      return planCode;
  }
}

function resolveMaxChildrenFromPlanCode(planCode: string): number {
  switch (normalizeLower(planCode)) {
    case "family_basic":
    case "school_referred_family_basic":
      return 4;
    case "family_plus":
    case "school_referred_family_plus":
      return 6;
    default:
      return 0;
  }
}

export async function applyDueScheduledPlanChanges(params?: { now?: Date }) {
  const admin = createAdminClient();
  const nowIso = (params?.now ?? new Date()).toISOString();

  const { data: dueRows, error: dueRowsError } = await admin
    .from("billing_scheduled_plan_changes")
    .select("*")
    .eq("status", "scheduled")
    .lte("effective_at", nowIso)
    .order("effective_at", { ascending: true });

  if (dueRowsError) {
    throw new Error(
      `Failed to load due scheduled plan changes: ${dueRowsError.message}`
    );
  }

  const rows = ((dueRows ?? []) as unknown) as ScheduledPlanChangeRow[];
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const row of rows) {
    if (row.status !== "scheduled") {
      skipped.push(row.id);
      continue;
    }

    if (
      !row.target_current_period_starts_at ||
      !row.target_current_period_ends_at ||
      !row.target_next_billing_at
    ) {
      throw new Error(
        `Scheduled plan change ${row.id} is missing target billing snapshot fields`
      );
    }

    const { data: familyAccount, error: familyAccountError } = await admin
      .from("family_accounts")
      .select("id, primary_user_id, auto_renew_enabled")
      .eq("id", row.family_account_id)
      .single();

    if (familyAccountError || !familyAccount) {
      throw new Error(
        `Failed to load family account for scheduled change apply: ${familyAccountError?.message ?? "not found"}`
      );
    }

    const subscriptionEvent = await recordBillingSubscriptionEvent({
      familyAccountId: row.family_account_id,
      primaryUserId: familyAccount.primary_user_id,
      eventType: "subscription_renewed_success",
      eventAt: row.effective_at,
      planCode: row.target_plan_code,
      subscriptionState: "active",
      currentPeriodStartsAt: row.target_current_period_starts_at,
      currentPeriodEndsAt: row.target_current_period_ends_at,
      nextBillingAt: row.target_next_billing_at,
      billingCycle:
        row.target_billing_cycle === "monthly" || row.target_billing_cycle === "yearly"
          ? row.target_billing_cycle
          : null,
      autoRenewEnabled: familyAccount.auto_renew_enabled,
      lastPaymentStatus: "paid",
      source: "scheduled_plan_change_apply",
      externalEventId: `scheduled-plan-change:${row.id}:apply`,
      payload: {
        scheduledPlanChangeId: row.id,
        targetPlanCode: row.target_plan_code,
        targetBillingCycle: row.target_billing_cycle,
        effectiveAt: row.effective_at,
      },
    });

    const { error: familyUpdateError } = await admin
      .from("family_accounts")
      .update({
        plan_type: resolvePlanTypeFromPlanCode(row.target_plan_code),
        plan_code: row.target_plan_code,
        max_children: resolveMaxChildrenFromPlanCode(row.target_plan_code),
        current_period_starts_at: row.target_current_period_starts_at,
        current_period_ends_at: row.target_current_period_ends_at,
        next_billing_at: row.target_next_billing_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.family_account_id);

    if (familyUpdateError) {
      throw new Error(
        `Failed to update family account during scheduled change apply: ${familyUpdateError.message}`
      );
    }

    const { error: changeUpdateError } = await admin
      .from("billing_scheduled_plan_changes")
      .update({
        status: "applied",
        applied_at: new Date().toISOString(),
        applied_subscription_event_id: subscriptionEvent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .eq("status", "scheduled");

    if (changeUpdateError) {
      throw new Error(
        `Failed to mark scheduled plan change as applied: ${changeUpdateError.message}`
      );
    }

    const ledgerEntry = await recordBillingLedgerEntry({
      familyAccountId: row.family_account_id,
      entryType: "scheduled_plan_change_applied",
      direction: "neutral",
      amount: null,
      currency: null,
      planCode: row.target_plan_code,
      billingCycle: row.target_billing_cycle,
      occurredAt: row.effective_at,
      source: "scheduled_plan_change_apply",
      scheduledPlanChangeId: row.id,
      billingSubscriptionEventId: subscriptionEvent.id,
      externalReference: `scheduled-plan-change-apply:${row.id}`,
      payload: {
        targetCurrentPeriodStartsAt: row.target_current_period_starts_at,
        targetCurrentPeriodEndsAt: row.target_current_period_ends_at,
        targetNextBillingAt: row.target_next_billing_at,
      },
    });

    await projectBillingSubscriptionSnapshotToFamilyAccount(row.family_account_id);

    applied.push(row.id);
  }

  return {
    ok: true,
    scanned: rows.length,
    appliedCount: applied.length,
    appliedIds: applied,
    skippedCount: skipped.length,
    skippedIds: skipped,
  };
}
