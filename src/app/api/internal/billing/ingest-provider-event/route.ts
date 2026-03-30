import { NextResponse } from "next/server";

import { ingestBillingSubscriptionEvent } from "@/server/billing/ingest-billing-subscription-event";
import { mapProviderBillingEvent } from "@/server/billing/map-provider-billing-event";
import {
  finalizeProviderBillingEventAudit,
  recordReceivedProviderBillingEventAudit,
  type ProviderBillingEventAuditSignatureMode,
} from "@/server/billing/record-provider-billing-event-audit";
import {
  assertProviderAllowed,
  verifyProviderIngestRequestSignature,
} from "@/server/billing/verify-provider-ingest-request";
import type {
  BillingSubscriptionCycle,
  BillingSubscriptionEventType,
} from "@/server/billing/record-billing-subscription-event";

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

function parseBillingCycle(value: unknown): BillingSubscriptionCycle | null {
  return value === "monthly" || value === "yearly" ? value : null;
}

function parseInternalEventType(
  value: unknown
): BillingSubscriptionEventType | null {
  switch (value) {
    case "subscription_started_success":
    case "subscription_renewed_success":
    case "payment_failed":
    case "payment_recovered":
    case "auto_renew_disabled":
    case "auto_renew_enabled":
    case "cancellation_scheduled":
      return value;
    default:
      return null;
  }
}

function getAuditHeaders(request: Request): Record<string, string> {
  const headerNames = [
    "content-type",
    "user-agent",
    "x-provider-signature",
    "x-provider-timestamp",
    "stripe-signature",
  ];

  const result: Record<string, string> = {};

  for (const headerName of headerNames) {
    const value = request.headers.get(headerName);

    if (value) {
      result[headerName] = value;
    }
  }

  return result;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.BILLING_PROVIDER_INGEST_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "BILLING_PROVIDER_INGEST_SECRET is missing." },
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

  let auditId: string | null = null;
  let signatureMode: ProviderBillingEventAuditSignatureMode = "not_checked";
  let signatureVerified = false;
  let webhookSecretConfigured = false;

  try {
    const rawBody = await request.text();
    const parsedJson = JSON.parse(rawBody);
    const body = asRecord(parsedJson);

    if (!body) {
      throw new Error("Request body must be a JSON object.");
    }

    const providerInput = parseNullableText(body.provider) ?? "";
    const providerEventId = parseNullableText(body.providerEventId) ?? "";
    const providerEventType = parseNullableText(body.providerEventType);

    if (providerInput && providerEventId) {
      const receivedAudit = await recordReceivedProviderBillingEventAudit({
        provider: providerInput,
        providerEventId,
        providerEventType,
        receivedHeaders: getAuditHeaders(request),
        rawBody,
        parsedPayload: body,
      });

      auditId = receivedAudit.id;
    }

    const provider = assertProviderAllowed(providerInput);

    const signatureResult = verifyProviderIngestRequestSignature({
      provider,
      rawBody,
      signatureHeader:
        request.headers.get("x-provider-signature") ??
        request.headers.get(`${provider}-signature`) ??
        (provider === "stripe" ? request.headers.get("stripe-signature") : null),
      timestampHeader: request.headers.get("x-provider-timestamp"),
    });

    signatureMode = signatureResult.signatureMode;
    signatureVerified = signatureResult.signatureVerified;
    webhookSecretConfigured = signatureResult.webhookSecretConfigured;

    const mapped = mapProviderBillingEvent({
      provider,
      providerEventId,
      providerEventType: providerEventType ?? "",
      customerEmail:
        parseNullableText(body.customerEmail) ??
        parseNullableText(body.email) ??
        "",
      internalEventType: parseInternalEventType(body.internalEventType),
      planCode: parseNullableText(body.planCode),
      subscriptionState: parseNullableText(body.subscriptionState),
      billingCycle: parseBillingCycle(body.billingCycle),
      occurredAt: parseNullableText(body.occurredAt),
      currentPeriodStartsAt: parseNullableText(body.currentPeriodStartsAt),
      currentPeriodEndsAt: parseNullableText(body.currentPeriodEndsAt),
      nextBillingAt: parseNullableText(body.nextBillingAt),
      autoRenewEnabled: parseNullableBoolean(body.autoRenewEnabled),
      gracePeriodEndsAt: parseNullableText(body.gracePeriodEndsAt),
      paymentFailedAt: parseNullableText(body.paymentFailedAt),
      lastPaymentStatus: parseNullableText(body.lastPaymentStatus),
      canceledAt: parseNullableText(body.canceledAt),
      metadata: asRecord(body.metadata),
      rawPayload: asRecord(body.rawPayload),
    });

    const result = await ingestBillingSubscriptionEvent(mapped);

    if (auditId) {
      await finalizeProviderBillingEventAudit({
        auditId,
        status: "processed",
        signatureMode,
        signatureVerified,
        webhookSecretConfigured,
        mappedEvent: mapped,
        familyAccountId: result.familyAccountId,
        primaryUserId: result.primaryUserId,
        billingSubscriptionEventId: result.subscriptionEventId,
        syncResult: result.syncResult,
        error: null,
      });
    }

    return NextResponse.json({
      ok: true,
      auditId,
      security: {
        provider,
        signatureMode,
        signatureVerified,
        webhookSecretConfigured,
      },
      mappedEvent: mapped,
      subscriptionEventId: result.subscriptionEventId,
      familyAccountId: result.familyAccountId,
      primaryUserId: result.primaryUserId,
      projectedBillingSnapshot: result.projectedBillingSnapshot,
      sync: result.syncResult,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown provider ingest error.";

    if (auditId) {
      try {
        await finalizeProviderBillingEventAudit({
          auditId,
          status:
            message.includes("not allowed") ||
            message.includes("signature") ||
            message.includes("Unsupported providerEventType")
              ? "rejected"
              : "failed",
          signatureMode,
          signatureVerified,
          webhookSecretConfigured,
          error: message,
        });
      } catch {
        // keep original error response
      }
    }

    return NextResponse.json(
      { ok: false, auditId, error: message },
      { status: 500 }
    );
  }
}
