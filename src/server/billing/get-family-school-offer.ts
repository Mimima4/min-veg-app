import "server-only";

import { getActiveSchoolReferralContext } from "@/server/billing/get-active-school-referral-context";

export type FamilySchoolOffer = {
  active: boolean;
  pricingTier: "school_basic_year" | "school_plus_year";
  validUntil: string;
};

export async function getFamilySchoolOffer(args: {
  familyAccountId: string;
}): Promise<FamilySchoolOffer | null> {
  const context = await getActiveSchoolReferralContext({
    familyAccountId: args.familyAccountId,
  });

  if (!context) {
    return null;
  }

  return {
    active: true,
    pricingTier: context.pricing_tier,
    validUntil: context.discount_valid_until,
  };
}