import "server-only";

import type { TripletexExportPayload } from "@/server/billing/tripletex-export-adapter";

export type TripletexCustomerDraft = {
  customerType: "b2b" | "b2c";
  organizationNumber: string | null;
  customerReference: string | null;
  isPrivateIndividual: boolean;
  invoiceSendMethod: "EMAIL" | "EHF";
};

export type TripletexOrderLineDraft = {
  description: string;
  count: number;
  unitPriceIncludingVatCurrency: number | null;
  currency: string | null;
  servicePeriodStart: string | null;
  servicePeriodEnd: string | null;
};

export type TripletexInvoiceDraft = {
  sendToCustomer: false;
  orderDate: string;
  customer: TripletexCustomerDraft;
  lines: TripletexOrderLineDraft[];
  externalReference: string | null;
};

function toDateOnly(value: string | null): string {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

export function buildTripletexDocumentMapping(
  payload: TripletexExportPayload
): TripletexInvoiceDraft {
  const customer: TripletexCustomerDraft = {
    customerType: payload.customerType === "b2b" ? "b2b" : "b2c",
    organizationNumber: payload.customerOrgNumber ?? null,
    customerReference: payload.customerReference ?? payload.familyAccountId,
    isPrivateIndividual: payload.customerType !== "b2b",
    invoiceSendMethod: payload.customerType === "b2b" ? "EHF" : "EMAIL",
  };

  const line: TripletexOrderLineDraft = {
    description: [
      payload.planCode ?? "subscription",
      payload.billingCycle ? `(${payload.billingCycle})` : null,
      payload.periodStart && payload.periodEnd
        ? `[${payload.periodStart} → ${payload.periodEnd}]`
        : null,
    ]
      .filter(Boolean)
      .join(" "),
    count: 1,
    unitPriceIncludingVatCurrency: payload.amount,
    currency: payload.currency,
    servicePeriodStart: payload.periodStart,
    servicePeriodEnd: payload.periodEnd,
  };

  return {
    sendToCustomer: false,   orderDate: toDateOnly(payload.occurredAt),
    customer,
    lines: [line],
    externalReference: payload.externalReference,
  };
}
