import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { isTripletexExportableLedgerEntry } from "@/server/billing/is-tripletex-exportable-ledger-entry";

export async function enqueueTripletexExport(params: {
  ledgerEntryId: string;
  exportType?: "ledger_entry";
}) {
  const admin = createAdminClient();

  const { data: ledgerEntry, error: ledgerError } = await admin
    .from("billing_ledger_entries")
    .select("id, entry_type")
    .eq("id", params.ledgerEntryId)
    .single();

  if (ledgerError || !ledgerEntry) {
    throw new Error(
      `Failed to load ledger entry before Tripletex enqueue: ${ledgerError?.message ?? "not found"}`
    );
  }

  if (
    !isTripletexExportableLedgerEntry({
      entryType: ledgerEntry.entry_type,
    })
  ) {
    return {
      ok: true,
      skipped: true,
      reason: `entry_type_not_exportable:${ledgerEntry.entry_type}`,
      ledgerEntryId: ledgerEntry.id,
    };
  }

  const { data, error } = await admin
    .from("tripletex_export_queue")
    .upsert(
      {
        ledger_entry_id: params.ledgerEntryId,
        export_type: params.exportType ?? "ledger_entry",
        status: "pending",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "ledger_entry_id",
        ignoreDuplicates: false,
      }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to enqueue Tripletex export: ${error.message}`);
  }

  return data;
}
