import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type BillingCycle = "monthly" | "yearly";

type AutoSyncBillingPeriodInput = {
  paymentIntentId: string;
  paidAt?: string | null;
};

function requireText(value: string, field: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} is required`);
  }

  return normalized;
}

function normalizeLower(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

function parseDateOrNull(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

function addBillingCycle(start: Date, billingCycle: BillingCycle): Date {
  const next = cloneDate(start);

  if (billingCycle === "monthly") {
    next.setUTCMonth(next.getUTCMonth() + 1);
    return next;
  }

  next.setUTCFullYear(next.getUTCFullYear() + 1);
  return next;
}

function toIso(date: Date): string {
  return date.toISOString();
}

export async function autoSyncBillingPeriod(
  input: AutoSyncBillingPeriodInput
) {
  const admin = createAdminClient();
  const paymentIntentId = requireText(input.paymentIntentId, "paymentIntentId");

  const { data: paymentIntent, error: paymentIntentError } = await admin
    .from("payment_intents")
    .select("id, account_type, account_id, plan_code, billing_cycle, status")
    .eq("id", paymentIntentId)
    .single();

  if (paymentIntentError || !paymentIntent) {
    throw new Error(
      `Failed to load payment intent for period sync: ${paymentIntentError?.message ?? "not found"}`
    );
  }

  if (paymentIntent.account_type !== "family") {
    return {
      ok: true,
      skipped: true,
      reason: "unsupported_account_type",
    };
  }

  if (paymentIntent.status !== "paid") {
    return {
      ok: true,
      skipped: true,
      reason: "payment_intent_not_paid",
    };
  }

  if (
    paymentIntent.billing_cycle !== "monthly" &&
    paymentIntent.billing_cycle !== "yearly"
  ) {
    throw new Error(
      `Unsupported billing cycle for period sync: ${paymentIntent.billing_cycle}`
    );
  }

  const billingCycle = paymentIntent.billing_cycle as BillingCycle;

  const { data: familyAccount, error: familyAccountError } = await admin
    .from("family_accounts")
    .select(
      "id, plan_code, current_period_starts_at, current_period_ends_at, next_billing_at"
    )
    .eq("id", paymentIntent.account_id)
    .single();

  if (familyAccountError || !familyAccount) {
    throw new Error(
      `Failed to load family account for period sync: ${familyAccountError?.message ?? "not found"}`
    );
  }

  const currentPlanCode = normalizeLower(familyAccount.plan_code);
  const paymentPlanCode = normalizeLower(paymentIntent.plan_code);

  const paidAtDate = parseDateOrNull(input.paidAt) ?? new Date();

  const currentPeriodEndsAtDate = parseDateOrNull(
    familyAccount.current_period_ends_at
  );

  const hasExistingPeriodBoundary =
    currentPeriodEndsAtDate !== null &&
    currentPeriodEndsAtDate.getTime() > paidAtDate.getTime();

  if (
    currentPlanCode &&
    paymentPlanCode &&
    currentPlanCode !== paymentPlanCode &&
    hasExistingPeriodBoundary
  ) {
    return {
      ok: true,
      skipped: true,
      reason: "plan_change_deferred",
      familyAccountId: familyAccount.id,
      currentPlanCode,
      paymentPlanCode,
      currentPeriodStartsAt: familyAccount.current_period_starts_at,
      currentPeriodEndsAt: familyAccount.current_period_ends_at,
      nextBillingAt: familyAccount.next_billing_at,
    };
  }

  const nextPeriodStart = hasExistingPeriodBoundary
    ? currentPeriodEndsAtDate
    : paidAtDate;

  const nextPeriodEnd = addBillingCycle(nextPeriodStart, billingCycle);

  const nextPeriodStartsAtIso = toIso(nextPeriodStart);
  const nextPeriodEndsAtIso = toIso(nextPeriodEnd);
  const nextBillingAtIso = nextPeriodEndsAtIso;

  const shouldPromotePlanImmediately =
    currentPlanCode !== null &&
    paymentPlanCode !== null &&
    currentPlanCode !== paymentPlanCode &&
    !hasExistingPeriodBoundary;

  const noChangesNeeded =
    familyAccount.current_period_starts_at === nextPeriodStartsAtIso &&
    familyAccount.current_period_ends_at === nextPeriodEndsAtIso &&
    familyAccount.next_billing_at === nextBillingAtIso;

  if (noChangesNeeded) {
    return {
      ok: true,
      skipped: true,
      reason: "already_synced",
      familyAccountId: familyAccount.id,
      currentPeriodStartsAt: nextPeriodStartsAtIso,
      currentPeriodEndsAt: nextPeriodEndsAtIso,
      nextBillingAt: nextBillingAtIso,
    };
  }

  const updatePayload: Record<string, string> = {
    current_period_starts_at: nextPeriodStartsAtIso,
    current_period_ends_at: nextPeriodEndsAtIso,
    next_billing_at: nextBillingAtIso,
  };

  if (shouldPromotePlanImmediately && paymentPlanCode) {
    updatePayload.plan_code = paymentPlanCode;
  }

  const { error: updateError } = await admin
    .from("family_accounts")
    .update(updatePayload)
    .eq("id", familyAccount.id);

  if (updateError) {
    throw new Error(
      `Failed to sync family billing period: ${updateError.message}`
    );
  }

  return {
    ok: true,
    updated: true,
    familyAccountId: familyAccount.id,
    billingCycle,
    anchor: hasExistingPeriodBoundary ? "existing_period_end" : "paid_at",
    currentPeriodStartsAt: nextPeriodStartsAtIso,
    currentPeriodEndsAt: nextPeriodEndsAtIso,
    nextBillingAt: nextBillingAtIso,
  };
}
