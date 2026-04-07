import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { consolidateDuplicateFamilyAccount } from "@/server/billing/consolidate-duplicate-family-account";

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return null;
}

export async function POST(request: NextRequest) {
  const authToken = getAuthToken(request);

  if (authToken !== process.env.BILLING_SYNC_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  let body: {
    canonicalFamilyAccountId?: string;
    partnerUserId?: string;
  };

  try {
    body = (await request.json()) as {
      canonicalFamilyAccountId?: string;
      partnerUserId?: string;
    };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const canonicalFamilyAccountId = body.canonicalFamilyAccountId?.trim();
  const partnerUserId = body.partnerUserId?.trim();

  if (!canonicalFamilyAccountId) {
    return NextResponse.json(
      { ok: false, error: "canonicalFamilyAccountId is required." },
      { status: 400 }
    );
  }

  if (!partnerUserId) {
    return NextResponse.json(
      { ok: false, error: "partnerUserId is required." },
      { status: 400 }
    );
  }

  try {
    await consolidateDuplicateFamilyAccount({
      canonicalFamilyAccountId,
      partnerUserId,
    });

    return NextResponse.json({
      ok: true,
      canonicalFamilyAccountId,
      partnerUserId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown duplicate family consolidation error.",
      },
      { status: 500 }
    );
  }
}