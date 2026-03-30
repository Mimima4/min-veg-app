import { NextResponse } from "next/server";

import { ingestBillingSubscriptionEvent } from "@/server/billing/ingest-billing-subscription-event";
import type { BillingSubscriptionEventType } from "@/server/billing/record-billing-subscription-event";

export const dynamic = "force-dynamic";

const ALLOWED_EVENT_TYPES: BillingSubscriptionEventType[] = [
  "subscription_started_success",
  "subscription_renewed_success",
  "payment_failed",
  "payment_recovered",
  "auto_renew_disabled",
  "auto_renew_enabled",
  "cancellation_scheduled",
];

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

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function parseEventType(value: unknown): BillingSubscriptionEventType {
  if (typeof value !== "string") {
    throw new Error("eventType is required.");
  }

  if (ALLOWED_EVENT_TYPES.includes(value as BillingSubscriptionEventType)) {
    return value as BillingSubscriptionEventType;
  }

  throw new Error(`Unsupported billing subscription event type: ${value}`);
}

function parseNullableBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return null;
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

    const result = await ingestBillingSubscriptionEvent({
      email: parseNullableText(body.email) ?? "",
      eventType: parseEventType(body.eventType),
      eventAt: parseNullableText(body.eventAt),
      planCode: parseNullableText(body.planCode),
      subscriptionState: parseNullableText(body.subscriptionState),
      currentPeriodStartsAt: parseNullableText(body.currentPeriodStartsAt),
      currentPeriodEndsAt: parseNullableText(body.currentPeriodEndsAt),
      nextBillingAt: parseNullableText(body.nextBillingAt),
      billingCycle:
        body.billingCycle === "monthly" || body.billingCycle === "yearly"
          ? body.billingCycle
          : null,
      autoRenewEnabled: parseNullableBoolean(body.autoRenewEnabled),
      gracePeriodEndsAt: parseNullableText(body.gracePeriodEndsAt),
      paymentFailedAt: parseNullableText(body.paymentFailedAt),
      lastPaymentStatus: parseNullableText(body.lastPaymentStatus),
      canceledAt: parseNullableText(body.canceledAt),
      source: parseNullableText(body.source) ?? "internal_ingest",
      externalEventId: parseNullableText(body.externalEventId),
      payload: asRecord(body.payload),
    });

    return NextResponse.json({
      ok: true,
      subscriptionEventId: result.subscriptionEventId,
      familyAccountId: result.familyAccountId,
      primaryUserId: result.primaryUserId,
      projectedBillingSnapshot: result.projectedBillingSnapshot,
      sync: result.syncResult,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown ingest error.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
