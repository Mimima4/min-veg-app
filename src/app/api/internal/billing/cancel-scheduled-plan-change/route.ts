import { NextRequest, NextResponse } from "next/server";

import { cancelScheduledPlanChange } from "@/server/billing/cancel-scheduled-plan-change";

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

export async function POST(request: NextRequest) {
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

  try {
    const body = await request.json();

    const result = await cancelScheduledPlanChange({
      scheduledPlanChangeId: body.scheduledPlanChangeId,
      reason: body.reason ?? "manual_cancel",
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown cancel error.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
