import "server-only";

import type {
  TripletexExportAdapter,
  TripletexExportPayload,
  TripletexExportResult,
} from "@/server/billing/tripletex-export-adapter";

export class TripletexExportAdapterStub implements TripletexExportAdapter {
  async exportLedgerEntry(
    payload: TripletexExportPayload
  ): Promise<TripletexExportResult> {
    return {
      ok: true,
      reference: `stub:${payload.ledgerEntryId}`,
    };
  }
}
