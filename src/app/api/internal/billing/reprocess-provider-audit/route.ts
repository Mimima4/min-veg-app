import { NextResponse } from "next/server";

import { reprocessProviderBillingEventAudit } from "@/server/billing/reprocess-provider-billing-event-audit";

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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function parseNullableText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
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
    const body = asRecord(await request.json());

    if (!body) {
      throw new Error("Request body must be a JSON object.");
    }

    const auditId = parseNullableText(body.auditId);

    if (!auditId) {
      throw new Error("auditId is required.");
    }

    const replay = await reprocessProviderBillingEventAudit(auditId);

    return NextResponse.json({
      ok: true,
      auditId: replay.auditId,
      replayCount: replay.replayCount,
      mappedEvent: replay.mappedEvent,
      subscriptionEventId: replay.result.subscriptionEventId,
      familyAccountId: replay.result.familyAccountId,
      primaryUserId: replay.result.primaryUserId,
      projectedBillingSnapshot: replay.result.projectedBillingSnapshot,
      sync: replay.result.syncResult,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown provider replay error.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
