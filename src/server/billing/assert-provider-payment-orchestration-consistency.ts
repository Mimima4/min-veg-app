import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type Input = {
  paymentIntentId: string;
  provider: string;
  providerPaymentId: string;
  familyAccountId?: string | null;
  deferredPlanChangeId?: string | null;
  subscriptionEventId?: string | null;
  ledgerEntryId?: string | null;
};

type FamilyAccountConsistencyRow = {
  id: string;
  plan_code: string | null;
  status: string | null;
  subscription_state: string | null;
  last_payment_status: string | null;
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  next_billing_at: string | null;
};

function normalizeLower(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized.length > 0 ? normalized : null;
}

export async function assertProviderPaymentOrchestrationConsistency(
  input: Input
) {
  const supabase = createAdminClient();
  const issues: string[] = [];

  const { data: providerPayment, error: providerPaymentError } = await supabase
    .from("provider_payments")
    .select(
      "id, payment_intent_id, provider, provider_payment_id, payment_status, paid_at"
    )
    .eq("payment_intent_id", input.paymentIntentId)
    .eq("provider", input.provider)
    .eq("provider_payment_id", input.providerPaymentId)
    .maybeSingle();

  if (providerPaymentError) {
    throw new Error(
      `Failed to load provider payment for orchestration consistency check: ${providerPaymentError.message}`
    );
  }

  if (!providerPayment) {
    issues.push("provider_payment_missing");
  } else if (providerPayment.payment_status !== "paid") {
    issues.push("provider_payment_not_paid");
  }

  const { data: paymentIntent, error: paymentIntentError } = await supabase
    .from("payment_intents")
    .select("id, account_type, account_id, status")
    .eq("id", input.paymentIntentId)
    .maybeSingle();

  if (paymentIntentError) {
    throw new Error(
      `Failed to load payment intent for orchestration consistency check: ${paymentIntentError.message}`
    );
  }

  if (!paymentIntent) {
    issues.push("payment_intent_missing");
  } else {
    if (paymentIntent.account_type !== "family") {
      issues.push("unsupported_account_type");
    }

    if (normalizeLower(paymentIntent.status) !== "paid") {
      issues.push("payment_intent_not_paid");
    }
  }

  const familyAccountId = input.familyAccountId ?? paymentIntent?.account_id ?? null;

  let familyAccount: FamilyAccountConsistencyRow | null = null;

  if (familyAccountId) {
    const { data: familyAccountRow, error: familyAccountError } = await supabase
      .from("family_accounts")
      .select(
        [
          "id",
          "plan_code",
          "status",
          "subscription_state",
          "last_payment_status",
          "current_period_starts_at",
          "current_period_ends_at",
          "next_billing_at",
        ].join(", ")
      )
      .eq("id", familyAccountId)
      .maybeSingle();

    if (familyAccountError) {
      throw new Error(
        `Failed to load family account for orchestration consistency check: ${familyAccountError.message}`
      );
    }

    familyAccount = (familyAccountRow ?? null) as FamilyAccountConsistencyRow | null;
  }

  if (!familyAccount) {
    issues.push("family_account_missing");
  } else {
    const subscriptionState = normalizeLower(familyAccount.subscription_state);
    const lastPaymentStatus = normalizeLower(familyAccount.last_payment_status);

    if (lastPaymentStatus !== "paid") {
      issues.push("family_account_last_payment_status_not_paid");
    }

    if (
      subscriptionState === "past_due" ||
      subscriptionState === "inactive" ||
      subscriptionState === "trial_expired"
    ) {
      issues.push("family_account_subscription_state_not_accessible");
    }

    if (!input.deferredPlanChangeId) {
      if (!familyAccount.current_period_starts_at) {
        issues.push("missing_current_period_starts_at");
      }

      if (!familyAccount.current_period_ends_at) {
        issues.push("missing_current_period_ends_at");
      }
    }
  }

  if (input.ledgerEntryId) {
    const { data: ledgerEntry, error: ledgerEntryError } = await supabase
      .from("billing_ledger_entries")
      .select("id")
      .eq("id", input.ledgerEntryId)
      .maybeSingle();

    if (ledgerEntryError) {
      throw new Error(
        `Failed to load billing ledger entry for orchestration consistency check: ${ledgerEntryError.message}`
      );
    }

    if (!ledgerEntry) {
      issues.push("ledger_entry_missing");
    }
  } else {
    issues.push("ledger_entry_not_recorded");
  }

  if (!input.deferredPlanChangeId) {
    if (!input.subscriptionEventId) {
      issues.push("success_subscription_event_missing");
    } else {
      const { data: subscriptionEvent, error: subscriptionEventError } =
        await supabase
          .from("billing_subscription_events")
          .select("id, event_type")
          .eq("id", input.subscriptionEventId)
          .maybeSingle();

      if (subscriptionEventError) {
        throw new Error(
          `Failed to load billing subscription event for orchestration consistency check: ${subscriptionEventError.message}`
        );
      }

      if (!subscriptionEvent) {
        issues.push("success_subscription_event_not_found");
      }
    }
  }

  // 🔒 Snapshot consistency check
  if (familyAccountId) {
    const { projectBillingSubscriptionSnapshotToFamilyAccount } = await import(
      "@/server/billing/project-billing-subscription-snapshot"
    );

    const projected = await projectBillingSubscriptionSnapshotToFamilyAccount(
      familyAccountId
    );

    if (!projected) {
      issues.push("snapshot_projection_failed");
    } else if (familyAccount) {
      const normalize = (v: string | null | undefined) =>
        v?.toString().trim().toLowerCase() || null;

      if (normalize(projected.planCode) !== normalize(familyAccount.plan_code)) {
        issues.push("snapshot_plan_code_mismatch");
      }

      if (
        normalize(projected.subscriptionState) !==
        normalize(familyAccount.subscription_state)
      ) {
        issues.push("snapshot_subscription_state_mismatch");
      }

      if (
        normalize(projected.currentPeriodStartsAt) !==
        normalize(familyAccount.current_period_starts_at)
      ) {
        issues.push("snapshot_period_start_mismatch");
      }

      if (
        normalize(projected.currentPeriodEndsAt) !==
        normalize(familyAccount.current_period_ends_at)
      ) {
        issues.push("snapshot_period_end_mismatch");
      }

      if (
        normalize(projected.lastPaymentStatus) !==
        normalize(familyAccount.last_payment_status)
      ) {
        issues.push("snapshot_payment_status_mismatch");
      }
    }
  }

  if (issues.length > 0) {
    throw new Error(
      `Provider payment orchestration consistency check failed: ${issues.join(", ")}`
    );
  }

  return {
    ok: true,
    familyAccountId: familyAccountId ?? null,
    providerPaymentId: providerPayment?.id ?? null,
    subscriptionEventId: input.subscriptionEventId ?? null,
    ledgerEntryId: input.ledgerEntryId ?? null,
    deferredPlanChangeId: input.deferredPlanChangeId ?? null,
  };
}