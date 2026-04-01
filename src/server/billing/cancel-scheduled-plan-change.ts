import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function cancelScheduledPlanChange(params: {
  scheduledPlanChangeId: string;
  reason: string;
}) {
  const admin = createAdminClient();

  const { data: row, error: rowError } = await admin
    .from("billing_scheduled_plan_changes")
    .select("*")
    .eq("id", params.scheduledPlanChangeId)
    .single();

  if (rowError || !row) {
    throw new Error(
      `Failed to load scheduled plan change: ${rowError?.message ?? "not found"}`
    );
  }

  if (row.status !== "scheduled") {
    return {
      ok: true,
      skipped: true,
      reason: `cannot_cancel_status_${row.status}`,
      scheduledPlanChangeId: row.id,
    };
  }

  const { error: updateError } = await admin
    .from("billing_scheduled_plan_changes")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      cancel_reason: params.reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  if (updateError) {
    throw new Error(
      `Failed to cancel scheduled plan change: ${updateError.message}`
    );
  }

  return {
    ok: true,
    canceled: true,
    scheduledPlanChangeId: row.id,
  };
}
