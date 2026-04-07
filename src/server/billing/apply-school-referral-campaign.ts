import "server-only";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const COOKIE_NAME = "school_referral_campaign_id";

export async function applySchoolReferralCampaign(args: {
  familyAccountId: string;
}) {
  const cookieStore = await cookies();
  const campaignId = cookieStore.get(COOKIE_NAME)?.value?.trim();

  if (!campaignId) {
    return { applied: false, reason: "missing_cookie" as const };
  }

  const admin = createAdminClient();

  const { data: campaign, error: campaignError } = await admin
    .from("school_referral_campaigns")
    .select("id, school_id, activation_source, pricing_tier, valid_from, valid_until")
    .eq("id", campaignId)
    .maybeSingle();

  if (campaignError || !campaign) {
    return { applied: false, reason: "campaign_not_found" as const };
  }

  const now = Date.now();
  const validFrom = new Date(campaign.valid_from).getTime();
  const validUntil = new Date(campaign.valid_until).getTime();

  if (
    Number.isNaN(validFrom) ||
    Number.isNaN(validUntil) ||
    validFrom > now ||
    validUntil <= now
  ) {
    return { applied: false, reason: "campaign_not_active" as const };
  }

  const { data: existingContexts, error: existingContextError } = await admin
    .from("school_referral_contexts")
    .select("id, created_at")
    .eq("family_account_id", args.familyAccountId)
    .eq("campaign_id", campaign.id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existingContextError) {
    throw new Error(
      `Failed to check existing school referral context: ${existingContextError.message}`
    );
  }

  const existingContext = existingContexts?.[0] ?? null;

  if (existingContext) {
    return {
      applied: false,
      reason: "already_applied" as const,
      contextId: existingContext.id,
    };
  }

  const { data: createdContext, error: insertError } = await admin
    .from("school_referral_contexts")
    .insert({
      family_account_id: args.familyAccountId,
      campaign_id: campaign.id,
      school_id: campaign.school_id,
      activation_source: campaign.activation_source,
      pricing_tier: campaign.pricing_tier,
      discount_valid_until: campaign.valid_until,
      discount_consumed: false,
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(
      `Failed to create school referral context from campaign: ${insertError.message}`
    );
  }

  return {
    applied: true,
    contextId: createdContext.id,
    campaignId: campaign.id,
  };
}