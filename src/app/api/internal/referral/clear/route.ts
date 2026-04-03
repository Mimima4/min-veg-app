import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "school_referral_campaign_id";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true });

  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}