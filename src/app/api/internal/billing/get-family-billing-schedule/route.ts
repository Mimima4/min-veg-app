import { NextRequest, NextResponse } from "next/server";

import { getFamilyBillingSchedule } from "@/server/billing/get-family-billing-schedule";

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");

  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.BILLING_SYNC_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "BILLING_SYNC_SECRET is missing." },
      { status: 500 }
    );
  }

  const providedSecret = getBearerToken(request);

  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const familyAccountId = request.nextUrl.searchParams.get("familyAccountId");

  if (!familyAccountId) {
    return NextResponse.json(
      { ok: false, error: "familyAccountId is required." },
      { status: 400 }
    );
  }

  try {
    const schedule = await getFamilyBillingSchedule({ familyAccountId });

    return NextResponse.json({
      ok: true,
      schedule,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown schedule error.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
