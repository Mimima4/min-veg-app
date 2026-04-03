import "server-only";

import { getActiveSchoolReferralContext } from "@/server/billing/get-active-school-referral-context";

type ResolveSchoolReferralPricingArgs = {
  familyAccountId: string;
  billingCycle: "monthly" | "yearly";
  baseAmount: number;
};

export type ResolveSchoolReferralPricingResult = {
  finalAmount: number;
  discountApplied: boolean;
  referralContextId: string | null;
  pricingTier: string | null;
};

function getDiscountedAmount(params: {
  pricingTier: string;
  baseAmount: number;
}) {
  const { pricingTier, baseAmount } = params;

  // пока фиксируем простую модель
  // потом можно заменить на конфиг/таблицу

  if (pricingTier === "school_plus_year") {
    return Math.round(baseAmount * 0.7); // -30%
  }

  if (pricingTier === "school_basic_year") {
    return Math.round(baseAmount * 0.8); // -20%
  }

  return baseAmount;
}

export async function resolveSchoolReferralPricing(
  args: ResolveSchoolReferralPricingArgs
): Promise<ResolveSchoolReferralPricingResult> {
  const { familyAccountId, billingCycle, baseAmount } = args;

  // monthly никогда не трогает скидку
  if (billingCycle === "monthly") {
    return {
      finalAmount: baseAmount,
      discountApplied: false,
      referralContextId: null,
      pricingTier: null,
    };
  }

  const context = await getActiveSchoolReferralContext({
    familyAccountId,
  });

  if (!context) {
    return {
      finalAmount: baseAmount,
      discountApplied: false,
      referralContextId: null,
      pricingTier: null,
    };
  }

  const discountedAmount = getDiscountedAmount({
    pricingTier: context.pricing_tier,
    baseAmount,
  });

  return {
    finalAmount: discountedAmount,
    discountApplied: true,
    referralContextId: context.id,
    pricingTier: context.pricing_tier,
  };
}