import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { resolveSchoolReferralPricing } from "@/server/billing/resolve-school-referral-pricing";

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

  let resolvedAmount = amount;
  let pricingSource: string | null = null;
  let pricingContextId: string | null = null;
  let pricingContextType: string | null = null;

  if (accountType === "family") {
    const schoolReferralPricing = await resolveSchoolReferralPricing({
      familyAccountId: accountId,
      billingCycle,
      baseAmount: amount,
    });

    resolvedAmount = schoolReferralPricing.finalAmount;

    if (schoolReferralPricing.discountApplied) {
      pricingSource = "school_referral";
      pricingContextId = schoolReferralPricing.referralContextId;
      pricingContextType = "school_referral_context";
    }
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
      amount: resolvedAmount,
      currency,
      status: policyDecision.status,
      policy_block_reason: policyDecision.policyBlockReason,
      pricing_source: pricingSource,
      pricing_context_id: pricingContextId,
      pricing_context_type: pricingContextType,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }

  return data;
}
