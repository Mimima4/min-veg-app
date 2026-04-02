import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { resolveTripletexCustomerReal } from "@/server/billing/resolve-tripletex-customer-real";

type PendingTripletexCustomerLink = {
  id: string;
  family_account_id: string;
  customer_type: "b2b" | "b2c";
  organization_number: string | null;
  tripletex_customer_id: string;
  sync_status: string;
  last_error: string | null;
};

export async function syncTripletexCustomers(params?: { limit?: number }) {
  const admin = createAdminClient();
  const limit = Math.max(params?.limit ?? 20, 1);

  const { data, error } = await admin
    .from("tripletex_customer_links")
    .select("*")
    .in("sync_status", ["pending", "error"])
    .order("updated_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load Tripletex customer links: ${error.message}`);
  }

  const rows = (data ?? []) as PendingTripletexCustomerLink[];

  const resolvedIds: string[] = [];
  const errorIds: string[] = [];

  for (const row of rows) {
    try {
      const result = await resolveTripletexCustomerReal({
        familyAccountId: row.family_account_id,
        customerType: row.customer_type,
        organizationNumber: row.organization_number,
        customerReference: row.family_account_id,
      });

      const isResolved = !result.tripletexCustomerId.startsWith("pending-customer:");

      const { error: updateError } = await admin
        .from("tripletex_customer_links")
        .update({
          tripletex_customer_id: result.tripletexCustomerId,
          sync_status: isResolved ? "resolved" : "pending",
          last_error: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (updateError) {
        throw new Error(`Failed to update Tripletex customer link: ${updateError.message}`);
      }

      if (isResolved) {
        resolvedIds.push(row.id);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown Tripletex customer sync error.";

      await admin
        .from("tripletex_customer_links")
        .update({
          sync_status: "error",
          last_error: message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      errorIds.push(row.id);
    }
  }

  return {
    ok: true,
    scanned: rows.length,
    resolvedCount: resolvedIds.length,
    resolvedIds,
    errorCount: errorIds.length,
    errorIds,
  };
}
