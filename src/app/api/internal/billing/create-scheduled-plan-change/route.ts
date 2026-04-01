import { NextRequest, NextResponse } from "next/server";

import { createScheduledPlanChange } from "@/server/billing/create-scheduled-plan-change";

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

    const result = await createScheduledPlanChange({
      familyAccountId: body.familyAccountId,
      targetPlanCode: body.targetPlanCode,
      targetBillingCycle: body.targetBillingCycle,
      effectiveAt: body.effectiveAt,
      createdBy: body.createdBy ?? "admin",
      source: body.source ?? "internal_test_route",
    });

    return NextResponse.json({
      ok: true,
      scheduledPlanChange: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown create scheduled change error.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
