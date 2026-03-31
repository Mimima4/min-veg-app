import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type CreatePaymentIntentInput = {
  accountType: "family" | "school" | "kommune" | "fylke";
  accountId: string;
  planCode: string;
  billingCycle: "monthly" | "yearly";
  amount: number;
  currency?: string;
};

const ACTIVE_POLICY_STATUSES = ["created", "pending", "paid"] as const;

function getWindowStartIso(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function buildPolicyDecision(params: {
  billingCycle: "monthly" | "yearly";
  recentCount: number;
}): { status: "created" | "blocked"; policyBlockReason: string | null } {
  const { billingCycle, recentCount } = params;

  if (billingCycle === "yearly" && recentCount >= 1) {
    return {
      status: "blocked",
      policyBlockReason:
        "A yearly payment intent already exists in the last 24 hours for this account.",
    };
  }

  if (billingCycle === "monthly" && recentCount >= 2) {
    return {
      status: "blocked",
      policyBlockReason:
        "The daily monthly payment intent limit has been reached for this account.",
    };
  }

  return {
    status: "created",
    policyBlockReason: null,
  };
}

export async function createPaymentIntent(input: CreatePaymentIntentInput) {
  const supabase = createAdminClient();

  const {
    accountType,
    accountId,
    planCode,
    billingCycle,
    amount,
    currency = "NOK",
  } = input;

  if (!accountId) {
    throw new Error("Missing accountId");
  }

  if (!planCode) {
    throw new Error("Missing planCode");
  }

  if (
    accountType !== "family" &&
    accountType !== "school" &&
    accountType !== "kommune" &&
    accountType !== "fylke"
  ) {
    throw new Error("Invalid accountType");
  }

  if (billingCycle !== "monthly" && billingCycle !== "yearly") {
    throw new Error("Invalid billingCycle");
  }

  if (typeof amount !== "number" || Number.isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount");
  }

  const windowStartIso = getWindowStartIso(24);

  const { count, error: countError } = await supabase
    .from("payment_intents")
    .select("id", { count: "exact", head: true })
    .eq("account_type", accountType)
    .eq("account_id", accountId)
    .eq("plan_code", planCode)
    .eq("billing_cycle", billingCycle)
    .in("status", [...ACTIVE_POLICY_STATUSES])
    .gte("created_at", windowStartIso);

  if (countError) {
    throw new Error(
      `Failed to evaluate payment intent policy: ${countError.message}`
    );
  }

  const policyDecision = buildPolicyDecision({
    billingCycle,
    recentCount: count ?? 0,
  });

  const { data, error } = await supabase
    .from("payment_intents")
    .insert({
      account_type: accountType,
      account_id: accountId,
      plan_code: planCode,
      billing_cycle: billingCycle,
      amount,
      currency,
      status: policyDecision.status,
      policy_block_reason: policyDecision.policyBlockReason,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }

  return data;
}
