import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const COOKIE_NAME = "school_referral_campaign_id";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaign: string }> }
) {
  const { campaign } = await params;
  const code = campaign?.trim();

  if (!code) {
    return NextResponse.redirect(new URL("/nb", request.url));
  }

  const admin = createAdminClient();

  const { data: campaignRow, error } = await admin
    .from("school_referral_campaigns")
    .select("id, campaign_code, valid_from, valid_until")
    .eq("campaign_code", code)
    .maybeSingle();

  if (error || !campaignRow) {
    return NextResponse.redirect(new URL("/nb", request.url));
  }

  const now = Date.now();
  const validFrom = new Date(campaignRow.valid_from).getTime();
  const validUntil = new Date(campaignRow.valid_until).getTime();

  if (
    Number.isNaN(validFrom) ||
    Number.isNaN(validUntil) ||
    validFrom > now ||
    validUntil <= now
  ) {
    return NextResponse.redirect(new URL("/nb", request.url));
  }

  const ttlSeconds = Math.max(
    1,
    Math.floor((validUntil - now) / 1000)
  );

  const response = NextResponse.redirect(new URL("/nb", request.url));

  response.cookies.set({
    name: COOKIE_NAME,
    value: campaignRow.id,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: ttlSeconds,
  });

  return response;
}