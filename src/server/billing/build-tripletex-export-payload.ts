import "server-only";

export type LedgerEntryForExport = {
  id: string;
  family_account_id: string;
  entry_type: string;
  direction: string;
  amount: number | null;
  currency: string | null;
  plan_code: string | null;
  billing_cycle: string | null;
  occurred_at: string;
  source: string;
  provider: string | null;
  provider_payment_id: string | null;
  payment_intent_id: string | null;
  external_reference: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  customer_type: string | null;
  customer_org_number: string | null;
  customer_reference: string | null;
  period_start: string | null;
  period_end: string | null;
};

export function buildTripletexExportPayload(entry: LedgerEntryForExport) {
  return {
    exportVersion: 1,
    exportType: "ledger_entry",
    ledgerEntryId: entry.id,
    externalReference: entry.external_reference,

    occurredAt: entry.occurred_at,
    familyAccountId: entry.family_account_id,

    entryType: entry.entry_type,
    direction: entry.direction,
    amount: entry.amount,
    currency: entry.currency,

    planCode: entry.plan_code,
    billingCycle: entry.billing_cycle,
    periodStart: entry.period_start,
    periodEnd: entry.period_end,

    customerType: entry.customer_type,
    customerOrgNumber: entry.customer_org_number,
    customerReference: entry.customer_reference,

    provider: entry.provider,
    providerPaymentId: entry.provider_payment_id,
    paymentIntentId: entry.payment_intent_id,

    source: entry.source,
    payload: entry.payload ?? {},
    createdAt: entry.created_at,
  };
}
