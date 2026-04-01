import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

function addBillingCycle(startIso: string, billingCycle: string) {
  const start = new Date(startIso);

  if (Number.isNaN(start.getTime())) {
    throw new Error(`Invalid effectiveAt: ${startIso}`);
  }

  const end = new Date(start);

  if (billingCycle === "yearly") {
    end.setUTCFullYear(end.getUTCFullYear() + 1);
  } else {
    end.setUTCMonth(end.getUTCMonth() + 1);
  }

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
    nextBillingIso: end.toISOString(),
  };
}

export async function createScheduledPlanChange(params: {
  familyAccountId: string;
  targetPlanCode: string;
  targetBillingCycle: string;
  effectiveAt: string;
  createdBy: "system" | "admin" | "user";
  source?: string;
}) {
  const admin = createAdminClient();

  const { startIso, endIso, nextBillingIso } = addBillingCycle(
    params.effectiveAt,
    params.targetBillingCycle
  );

  const { data: existingScheduledRows, error: existingScheduledRowsError } =
    await admin
      .from("billing_scheduled_plan_changes")
      .select("id")
      .eq("family_account_id", params.familyAccountId)
      .eq("status", "scheduled");

  if (existingScheduledRowsError) {
    throw new Error(
      `Failed to load existing scheduled plan changes: ${existingScheduledRowsError.message}`
    );
  }

  const existingIds = (existingScheduledRows ?? []).map((row) => row.id);

  if (existingIds.length > 0) {
    const { error: cancelExistingError } = await admin
      .from("billing_scheduled_plan_changes")
      .update({
        status: "canceled",
        canceled_at: new Date().toISOString(),
        cancel_reason: "replaced_by_new_scheduled_change",
        updated_at: new Date().toISOString(),
      })
      .eq("family_account_id", params.familyAccountId)
      .eq("status", "scheduled");

    if (cancelExistingError) {
      throw new Error(
        `Failed to cancel previous scheduled plan changes: ${cancelExistingError.message}`
      );
    }
  }

  const { data, error } = await admin
    .from("billing_scheduled_plan_changes")
    .insert({
      family_account_id: params.familyAccountId,
      target_plan_code: params.targetPlanCode,
      target_billing_cycle: params.targetBillingCycle,
      effective_at: startIso,
      target_current_period_starts_at: startIso,
      target_current_period_ends_at: endIso,
      target_next_billing_at: nextBillingIso,
      status: "scheduled",
      created_by: params.createdBy,
      source: params.source ?? "internal",
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create scheduled plan change: ${error.message}`);
  }

  return data;
}
