import "server-only";

import type {
  TripletexExportAdapter,
  TripletexExportPayload,
  TripletexExportResult,
} from "@/server/billing/tripletex-export-adapter";
import { buildTripletexDocumentMapping } from "@/server/billing/build-tripletex-document-mapping";
import { resolveTripletexCustomerReal } from "@/server/billing/resolve-tripletex-customer-real";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is missing.`);
  }

  return value;
}

function requireCustomerSyncLive() {
  const mode = process.env.TRIPLETEX_CUSTOMER_SYNC_MODE?.trim().toLowerCase() || "stub";

  if (mode !== "live") {
    throw new Error(
      "TRIPLETEX_CUSTOMER_SYNC_MODE must be live before TRIPLETEX_EXPORT_MODE=real can be used."
    );
  }
}

function classifyTripletexError(status: number) {
  if (status >= 500) {
    return {
      retryable: true,
      message: `Tripletex server error (${status})`,
    };
  }

  if (status === 429) {
    return {
      retryable: true,
      message: "Tripletex rate limit hit (429)",
    };
  }

  if (status === 401 || status === 403) {
    return {
      retryable: false,
      message: `Tripletex auth/permission error (${status})`,
    };
  }

  if (status >= 400) {
    return {
      retryable: false,
      message: `Tripletex client error (${status})`,
    };
  }

  return {
    retryable: false,
    message: `Unexpected Tripletex status (${status})`,
  };
}

type TripletexPreparedRequest = {
  method: "POST";
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
};

export class TripletexExportAdapterReal implements TripletexExportAdapter {
  async exportLedgerEntry(
    payload: TripletexExportPayload
  ): Promise<TripletexExportResult> {
    requireCustomerSyncLive();
    const token = requireEnv("TRIPLETEX_API_TOKEN");
    const baseUrl = requireEnv("TRIPLETEX_API_BASE_URL");

    const tripletexCustomer = await resolveTripletexCustomerReal({
      familyAccountId: payload.familyAccountId,
      customerType: payload.customerType === "b2b" ? "b2b" : "b2c",
      organizationNumber: payload.customerOrgNumber ?? null,
      customerReference: payload.customerReference ?? payload.familyAccountId,
    });

    const documentDraft = buildTripletexDocumentMapping(payload);

    const preparedRequest: TripletexPreparedRequest = {
      method: "POST",
      url: `${baseUrl}/tripletex/pending-customer-invoice-mapping`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        externalReference: payload.externalReference,
        provider: payload.provider,
        providerPaymentId: payload.providerPaymentId,
        paymentIntentId: payload.paymentIntentId,
        source: payload.source,
        tripletexCustomerId: tripletexCustomer.tripletexCustomerId,
        customerResolutionMode: tripletexCustomer.mode,
        documentDraft,
      },
    };

    void preparedRequest;
    void classifyTripletexError;

    return {
      ok: true,
      reference: `real-pending:${payload.externalReference ?? payload.ledgerEntryId}`,
    };
  }
}

export { classifyTripletexError };
