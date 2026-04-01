import "server-only";

import { getFamilyBillingDiagnostics } from "@/server/billing/get-family-billing-diagnostics";
import { reconcilePaymentUnapplied } from "@/server/billing/reconcile-payment-unapplied";

export async function autoReconcileSafePaymentMismatch(params: {
  familyAccountId: string;
}) {
  const diagnostics = await getFamilyBillingDiagnostics({
    familyAccountId: params.familyAccountId,
  });

  if (
    diagnostics.hasPaymentMismatch &&
    diagnostics.reconciliationStatus === "payment_unapplied" &&
    diagnostics.reconciliationRecommendation ===
      "safe_reconcile_payment_to_billing"
  ) {
    return reconcilePaymentUnapplied({
      familyAccountId: params.familyAccountId,
      performedByUserId: null,
    });
  }

  return {
    ok: true,
    skipped: true,
    reason: diagnostics.reconciliationRecommendation,
  };
}
