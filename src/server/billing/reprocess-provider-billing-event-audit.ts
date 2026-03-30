import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { ingestBillingSubscriptionEvent } from "@/server/billing/ingest-billing-subscription-event";
import { mapProviderBillingEvent } from "@/server/billing/map-provider-billing-event";
import { assertProviderAllowed } from "@/server/billing/verify-provider-ingest-request";
import type {
  BillingSubscriptionCycle,
  BillingSubscriptionEventType,
} from "@/server/billing/record-billing-subscription-event";

type ProviderAuditRow = {
  id: string;
  provider: string;
  provider_event_id: string;
  provider_event_type: string | null;
  parsed_payload: Record<string, unknown> | null;
  raw_body: string | null;
  replay_count: number | null;
};

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

function buildFailureStatus(errorMessage: string): "rejected" | "failed" {
  if (
    errorMessage.includes("not allowed") ||
    errorMessage.includes("Unsupported providerEventType") ||
    errorMessage.includes("provider is required")
  ) {
    return "rejected";
  }

  return "failed";
}

export async function reprocessProviderBillingEventAudit(
  auditId: string,
  replayReason: string
): Promise<any>;
export async function reprocessProviderBillingEventAudit(
  auditId: string
): Promise<any>;
export async function reprocessProviderBillingEventAudit(
  auditId: string,
  replayReason?: string
) {
  const normalizedReplayReason = String(replayReason ?? "").trim();
  if (!normalizedReplayReason) {
    throw new Error("Replay reason is required.");
  }

  const admin = createAdminClient();

  const { data, error } = await admin
    .from("provider_billing_event_audits")
    .select(
      "id, provider, provider_event_id, provider_event_type, parsed_payload, raw_body, replay_count"
    )
    .eq("id", auditId)
    .single();

  if (error) {
    throw new Error(
      `Failed to load provider billing event audit: ${error.message}`
    );
  }

  const audit = data as ProviderAuditRow;
  const body = asRecord(audit.parsed_payload);

  if (!body) {
    throw new Error("Provider audit does not contain a valid parsed_payload.");
  }

  try {
    const provider = assertProviderAllowed(audit.provider);

    const mapped = mapProviderBillingEvent({
      provider,
      providerEventId: audit.provider_event_id,
      providerEventType:
        parseNullableText(body.providerEventType) ??
        audit.provider_event_type ??
        "",
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

    const { error: updateError } = await admin
      .from("provider_billing_event_audits")
      .update({
        status: "processed",
        mapped_event_type: mapped.eventType,
        mapped_external_event_id: mapped.externalEventId,
        mapped_payload: mapped,
        family_account_id: result.familyAccountId,
        primary_user_id: result.primaryUserId,
        billing_subscription_event_id: result.subscriptionEventId,
        sync_result: result.syncResult ?? {},
        error: null,
        processed_at: new Date().toISOString(),
        replay_count: (audit.replay_count ?? 0) + 1,
        last_replayed_at: new Date().toISOString(),
        last_replay_reason: normalizedReplayReason,
      })
      .eq("id", audit.id);

    if (updateError) {
      throw new Error(
        `Failed to update provider billing event audit after replay: ${updateError.message}`
      );
    }

    return {
      auditId: audit.id,
      replayCount: (audit.replay_count ?? 0) + 1,
      mappedEvent: mapped,
      result,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown replay error.";

    const { error: updateError } = await admin
      .from("provider_billing_event_audits")
      .update({
        status: buildFailureStatus(message),
        error: message,
        processed_at: new Date().toISOString(),
        replay_count: (audit.replay_count ?? 0) + 1,
        last_replayed_at: new Date().toISOString(),
        last_replay_reason: normalizedReplayReason,
      })
      .eq("id", audit.id);

    if (updateError) {
      throw new Error(
        `Replay failed with "${message}", and audit update also failed: ${updateError.message}`
      );
    }

    throw new Error(message);
  }
}
