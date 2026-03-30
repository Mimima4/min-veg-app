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
): Promise<{ id: string }> {
  const admin = createAdminClient();

  const row = {
    provider: normalizeRequiredText(input.provider, "provider").toLowerCase(),
    provider_event_id: normalizeRequiredText(
      input.providerEventId,
      "providerEventId"
    ),
    provider_event_type: input.providerEventType?.trim() || null,
    status: "received" as const,
    signature_mode: "not_checked" as const,
    signature_verified: false,
    webhook_secret_configured: false,
    received_headers: input.receivedHeaders,
    raw_body: input.rawBody,
    parsed_payload: input.parsedPayload ?? {},
    error: null,
    processed_at: null,
  };

  const { data, error } = await admin
    .from("provider_billing_event_audits")
    .upsert(row, {
      onConflict: "provider,provider_event_id",
      ignoreDuplicates: false,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(
      `Failed to record received provider billing event audit: ${error.message}`
    );
  }

  return data as { id: string };
}

export async function finalizeProviderBillingEventAudit(
  input: FinalizeAuditInput
): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin
    .from("provider_billing_event_audits")
    .update({
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
    })
    .eq("id", input.auditId);

  if (error) {
    throw new Error(
      `Failed to finalize provider billing event audit: ${error.message}`
    );
  }
}
