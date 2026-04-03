import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type SchoolReferralCampaignSummary = {
  id: string;
  campaignCode: string;
  validUntil: string;
  pricingTier: string;
  totalContexts: number;
  activeContexts: number;
  consumedContexts: number;
};

export async function getSchoolReferralCampaignsSummary(): Promise<
  SchoolReferralCampaignSummary[]
> {
  const admin = createAdminClient();

  const { data: campaigns, error } = await admin
    .from("school_referral_campaigns")
    .select(`
      id,
      campaign_code,
      valid_until,
      pricing_tier,
      school_referral_contexts (
        id,
        discount_consumed
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(
      `Failed to load school referral campaigns: ${error.message}`
    );
  }

  const rows = campaigns ?? [];

  return rows.map((c: any) => {
    const contexts = c.school_referral_contexts ?? [];

    const total = contexts.length;
    const consumed = contexts.filter(
      (ctx: any) => ctx.discount_consumed === true
    ).length;
    const active = total - consumed;

    return {
      id: c.id,
      campaignCode: c.campaign_code,
      validUntil: c.valid_until,
      pricingTier: c.pricing_tier,
      totalContexts: total,
      activeContexts: active,
      consumedContexts: consumed,
    };
  });
}