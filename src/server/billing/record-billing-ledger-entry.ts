import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export async function recordBillingLedgerEntry(params: {
  familyAccountId: string;
  entryType:
    | "provider_payment_received"
    | "scheduled_plan_change_applied"
    | "refund_received"
    | "adjustment";
  direction: "credit" | "debit" | "neutral";

  amount?: number | null;
  currency?: string | null;
  planCode?: string | null;
  billingCycle?: string | null;
  occurredAt: string;
  source: string;

  provider?: string | null;
  providerPaymentId?: string | null;
  paymentIntentId?: string | null;
  scheduledPlanChangeId?: string | null;
  billingSubscriptionEventId?: string | null;

  externalReference?: string | null;
  payload?: Record<string, unknown>;

  grossAmount?: number | null;
  netAmount?: number | null;
  mvaAmount?: number | null;
  mvaRate?: number | null;
  mvaCode?: string | null;
  customerType?: "b2b" | "b2c" | null;
  customerOrgNumber?: string | null;
  customerReference?: string | null;

  periodStart?: string | null;
  periodEnd?: string | null;
}) {
  const admin = createAdminClient();

  if (params.externalReference) {
    const { data: existing, error: existingError } = await admin
      .from("billing_ledger_entries")
      .select("*")
      .eq("external_reference", params.externalReference)
      .maybeSingle();

    if (existingError) {
      throw new Error(
        `Failed to lookup existing billing ledger entry: ${existingError.message}`
      );
    }

    if (existing) {
      return existing;
    }
  }

  const row = {
    family_account_id: params.familyAccountId,
    entry_type: params.entryType,
    direction: params.direction,

    amount: params.amount ?? null,
    currency: params.currency ?? null,
    plan_code: params.planCode ?? null,
    billing_cycle: params.billingCycle ?? null,
    occurred_at: params.occurredAt,
    source: params.source,

    provider: params.provider ?? null,
    provider_payment_id: params.providerPaymentId ?? null,
    payment_intent_id: params.paymentIntentId ?? null,
    scheduled_plan_change_id: params.scheduledPlanChangeId ?? null,
    billing_subscription_event_id: params.billingSubscriptionEventId ?? null,

    external_reference: params.externalReference ?? null,
    payload: params.payload ?? {},

    gross_amount: params.grossAmount ?? null,
    net_amount: params.netAmount ?? null,
    mva_amount: params.mvaAmount ?? null,
    mva_rate: params.mvaRate ?? null,
    mva_code: params.mvaCode ?? null,
    customer_type: params.customerType ?? null,
    customer_org_number: params.customerOrgNumber ?? null,
    customer_reference: params.customerReference ?? null,

    period_start: params.periodStart ?? null,
    period_end: params.periodEnd ?? null,
  };

  const { data, error } = await admin
    .from("billing_ledger_entries")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to insert billing ledger entry: ${error.message}`);
  }

  return data;
}
