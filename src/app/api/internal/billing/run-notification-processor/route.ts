import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { runBillingNotificationProcessor } from "@/server/billing/run-billing-notification-processor";

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

  try {
    const result = await runBillingNotificationProcessor();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown notification processor error.",
      },
      { status: 500 }
    );
  }
}