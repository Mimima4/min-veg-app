import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getFamilyBillingDiagnostics } from "@/server/billing/get-family-billing-diagnostics";

type ReconcilePaymentUnappliedInput = {
  familyAccountId: string;
  performedByUserId?: string | null;
};

export async function reconcilePaymentUnapplied(
  input: ReconcilePaymentUnappliedInput
) {
  const admin = createAdminClient();

  const diagnostics = await getFamilyBillingDiagnostics({
    familyAccountId: input.familyAccountId,
  });

  if (!diagnostics.hasPaymentMismatch) {
    throw new Error("No payment mismatch exists for this family account");
  }

  if (diagnostics.reconciliationStatus !== "payment_unapplied") {
    throw new Error("Reconciliation is only allowed for payment_unapplied cases");
  }

  if (
    diagnostics.reconciliationRecommendation !==
    "safe_reconcile_payment_to_billing"
  ) {
    throw new Error("Reconciliation recommendation is not safe for this case");
  }

  if (!diagnostics.latestValidPayment) {
    throw new Error("No latest valid payment exists for this family account");
  }

  const previousStatus = diagnostics.lastPaymentStatus;

  const { error } = await admin
    .from("family_accounts")
    .update({
      last_payment_status: "paid",
    })
    .eq("id", input.familyAccountId);

  if (error) {
    throw new Error(`Failed to reconcile family account: ${error.message}`);
  }

  const { error: auditError } = await admin
    .from("billing_reconciliation_audits")
    .insert({
      family_account_id: input.familyAccountId,
      action: "payment_unapplied_reconciled",
      previous_last_payment_status: previousStatus,
      new_last_payment_status: "paid",
      provider: diagnostics.latestValidPayment.provider,
      provider_payment_id: diagnostics.latestValidPayment.providerPaymentId,
      performed_by_user_id: input.performedByUserId ?? null,
    });

  if (auditError) {
    throw new Error(`Failed to write reconciliation audit: ${auditError.message}`);
  }

  return {
    ok: true,
    repairedField: "last_payment_status",
    repairedValue: "paid",
    familyAccountId: input.familyAccountId,
    provider: diagnostics.latestValidPayment.provider,
    providerPaymentId: diagnostics.latestValidPayment.providerPaymentId,
    paidAt: diagnostics.latestValidPayment.paidAt,
  };
}
