import "server-only";

export type TripletexExportPayload = {
  exportVersion: number;
  exportType: string;
  ledgerEntryId: string;
  externalReference: string | null;

  occurredAt: string;
  familyAccountId: string;

  entryType: string;
  direction: string;
  amount: number | null;
  currency: string | null;

  planCode: string | null;
  billingCycle: string | null;
  periodStart: string | null;
  periodEnd: string | null;

  customerType: string | null;
  customerOrgNumber: string | null;
  customerReference: string | null;

  provider: string | null;
  providerPaymentId: string | null;
  paymentIntentId: string | null;

  source: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type TripletexExportResult = {
  ok: true;
  reference: string;
};

export interface TripletexExportAdapter {
  exportLedgerEntry(
    payload: TripletexExportPayload
  ): Promise<TripletexExportResult>;
}
