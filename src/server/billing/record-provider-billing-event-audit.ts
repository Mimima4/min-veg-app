import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ProviderMappedBillingEvent } from "@/server/billing/map-provider-billing-event";

export type ProviderBillingEventAuditStatus =
  | "received"
  | "processed"
  | "failed"
  | "rejected";

export type ProviderBillingEventAuditSignatureMode =
  | "not_checked"
  | "verified"
  | "not_configured";

type RecordReceivedInput = {
  provider: string;
  providerEventId: string;
  providerEventType: string | null;
  receivedHeaders: Record<string, string>;
  rawBody: string;
  parsedPayload: Record<string, unknown> | null;
};

type RecordReceivedResult = {
  id: string;
  wasReplay: boolean;
  replayCount: number;
};

type FinalizeAuditInput = {
  auditId: string;
  status: Exclude<ProviderBillingEventAuditStatus, "received">;
  signatureMode: ProviderBillingEventAuditSignatureMode;
  signatureVerified: boolean;
  webhookSecretConfigured: boolean;
  mappedEvent?: ProviderMappedBillingEvent | null;
  familyAccountId?: string | null;
  primaryUserId?: string | null;
  billingSubscriptionEventId?: string | null;
  syncResult?: Record<string, unknown> | null;
  error?: string | null;
  replayReason?: string | null;
};

function normalizeRequiredText(value: string, field: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} is required.`);
  }

  return normalized;
}

export async function recordReceivedProviderBillingEventAudit(
  input: RecordReceivedInput
): Promise<RecordReceivedResult> {
  const admin = createAdminClient();

  const provider = normalizeRequiredText(input.provider, "provider").toLowerCase();
  const providerEventId = normalizeRequiredText(
    input.providerEventId,
    "providerEventId"
  );

  const { data: existing, error: existingError } = await admin
    .from("provider_billing_event_audits")
    .select("id, replay_count")
    .eq("provider", provider)
    .eq("provider_event_id", providerEventId)
    .maybeSingle();

  if (existingError) {
    throw new Error(
      `Failed to load existing provider billing event audit: ${existingError.message}`
    );
  }

  const nowIso = new Date().toISOString();

  if (existing) {
    const replayCount = (existing.replay_count ?? 0) + 1;

    const { error: updateError } = await admin
      .from("provider_billing_event_audits")
      .update({
        provider_event_type: input.providerEventType?.trim() || null,
        received_headers: input.receivedHeaders,
        raw_body: input.rawBody,
        parsed_payload: input.parsedPayload ?? {},
        error: null,
        last_replayed_at: nowIso,
        last_replay_reason:
          "Webhook received again; keeping the same provider event row and reprocessing idempotently.",
        replay_count: replayCount,
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(
        `Failed to update replayed provider billing event audit: ${updateError.message}`
      );
    }

    return {
      id: existing.id,
      wasReplay: true,
      replayCount,
    };
  }

  const row = {
    provider,
    provider_event_id: providerEventId,
    provider_event_type: input.providerEventType?.trim() || null,
    status: "received" as const,
    signature_mode: "not_checked" as const,
    signature_verified: false,
    webhook_secret_configured: false,
    received_headers: input.receivedHeaders,
    raw_body: input.rawBody,
    parsed_payload: input.parsedPayload ?? {},
    mapped_payload: {},
    sync_result: {},
    error: null,
    processed_at: null,
    replay_count: 0,
    last_replayed_at: null,
    last_replay_reason: null,
  };

  const { data, error } = await admin
    .from("provider_billing_event_audits")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    throw new Error(
      `Failed to record received provider billing event audit: ${error.message}`
    );
  }

  return {
    id: (data as { id: string }).id,
    wasReplay: false,
    replayCount: 0,
  };
}

export async function finalizeProviderBillingEventAudit(
  input: FinalizeAuditInput
): Promise<void> {
  const admin = createAdminClient();

  const updatePayload: Record<string, unknown> = {
    status: input.status,
    signature_mode: input.signatureMode,
    signature_verified: input.signatureVerified,
    webhook_secret_configured: input.webhookSecretConfigured,
    mapped_event_type: input.mappedEvent?.eventType ?? null,
    mapped_external_event_id: input.mappedEvent?.externalEventId ?? null,
    mapped_payload: input.mappedEvent ?? {},
    family_account_id: input.familyAccountId ?? null,
    primary_user_id: input.primaryUserId ?? null,
    billing_subscription_event_id: input.billingSubscriptionEventId ?? null,
    sync_result: input.syncResult ?? {},
    error: input.error ?? null,
    processed_at: new Date().toISOString(),
  };

  if (typeof input.replayReason === "string") {
    updatePayload.last_replay_reason = input.replayReason;
  }

  const { error } = await admin
    .from("provider_billing_event_audits")
    .update(updatePayload)
    .eq("id", input.auditId);

  if (error) {
    throw new Error(
      `Failed to finalize provider billing event audit: ${error.message}`
    );
  }
}
