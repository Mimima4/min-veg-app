import { NextResponse } from "next/server";
import { syncBillingNotificationEvents } from "@/server/billing/sync-billing-notification-events";

export const dynamic = "force-dynamic";

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

export async function POST(request: Request) {
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
    const result = await syncBillingNotificationEvents();

    return NextResponse.json({
      ok: true,
      scanned: result.scanned,
      candidates: result.candidates,
      insertedOrUpdated: result.insertedOrUpdated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown sync error.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}