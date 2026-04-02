import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildTripletexExportPayload,
  type LedgerEntryForExport,
} from "@/server/billing/build-tripletex-export-payload";
import { isTripletexExportableLedgerEntry } from "@/server/billing/is-tripletex-exportable-ledger-entry";
import { TripletexExportAdapterReal } from "@/server/billing/tripletex-export-adapter-real";

type ExportQueueRow = {
  id: string;
  ledger_entry_id: string;
  export_type: string;
  status: string;
  attempts: number;
  last_attempt_at: string | null;
  exported_at: string | null;
  failed_at: string | null;
  tripletex_reference: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export async function processTripletexExportQueue(params?: {
  limit?: number;
}) {
  const admin = createAdminClient();
  const limit = Math.max(params?.limit ?? 20, 1);

  const { data: queueRows, error: queueError } = await admin
    .from("tripletex_export_queue")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (queueError) {
    throw new Error(
      `Failed to load Tripletex export queue: ${queueError.message}`
    );
  }

  const rows = ((queueRows ?? []) as unknown) as ExportQueueRow[];
  const exported: string[] = [];
  const failed: string[] = [];
  const skipped: string[] = [];

  for (const row of rows) {
    if (row.status === "exported") {
      continue;
    }

    try {
      const { error: markProcessingError } = await admin
        .from("tripletex_export_queue")
        .update({
          status: "processing",
          attempts: row.attempts + 1,
          last_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .eq("status", "pending");

      if (markProcessingError) {
        throw new Error(
          `Failed to mark queue row as processing: ${markProcessingError.message}`
        );
      }

      const { data: ledgerEntry, error: ledgerError } = await admin
        .from("billing_ledger_entries")
        .select("*")
        .eq("id", row.ledger_entry_id)
        .single();

      if (ledgerError || !ledgerEntry) {
        throw new Error(
          `Failed to load ledger entry for export: ${ledgerError?.message ?? "not found"}`
        );
      }

      if (
        !isTripletexExportableLedgerEntry({
          entryType: ledgerEntry.entry_type,
        })
      ) {
        await admin
          .from("tripletex_export_queue")
          .update({
            status: "failed",
            failed_at: new Date().toISOString(),
            error_message: `entry_type_not_exportable:${ledgerEntry.entry_type}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", row.id);

        skipped.push(row.id);
        continue;
      }

      const entry = ledgerEntry as unknown as LedgerEntryForExport;

      let reference: string;

      const mode = process.env.TRIPLETEX_EXPORT_MODE ?? "stub";

      if (mode === "real") {
        const adapter = new TripletexExportAdapterReal();
        const result = await adapter.exportLedgerEntry(
          buildTripletexExportPayload(entry)
        );

        reference = result.reference;
      } else {
        reference = "stub:" + entry.id;
      }

      const { error: markExportedError } = await admin
        .from("tripletex_export_queue")
        .update({
          status: "exported",
          exported_at: new Date().toISOString(),
          tripletex_reference: reference,
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (markExportedError) {
        throw new Error(
          `Failed to mark queue row as exported: ${markExportedError.message}`
        );
      }

      exported.push(row.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown Tripletex export error.";

      await admin
        .from("tripletex_export_queue")
        .update({
          status: "failed",
          failed_at: new Date().toISOString(),
          error_message: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      failed.push(row.id);
    }
  }

  return {
    ok: true,
    scanned: rows.length,
    exportedCount: exported.length,
    exportedIds: exported,
    failedCount: failed.length,
    failedIds: failed,
    skippedCount: skipped.length,
    skippedIds: skipped,
  };
}
