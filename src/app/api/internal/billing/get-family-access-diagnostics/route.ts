import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { getFamilyAccessDiagnostics } from "@/server/billing/get-family-access-diagnostics";

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

  let body: { familyAccountId?: string };

  try {
    body = (await request.json()) as { familyAccountId?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const familyAccountId = body.familyAccountId?.trim();

  if (!familyAccountId) {
    return NextResponse.json(
      { ok: false, error: "familyAccountId is required." },
      { status: 400 }
    );
  }

  try {
    const diagnostics = await getFamilyAccessDiagnostics({
      familyAccountId,
    });

    return NextResponse.json({
      ok: true,
      diagnostics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown access diagnostics error.",
      },
      { status: 500 }
    );
  }
}