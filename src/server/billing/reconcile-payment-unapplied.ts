import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentFactsForBillingSubject } from "@/server/billing/get-payment-facts-for-billing-subject";
import { getAccountEntitlements } from "@/server/billing/get-account-entitlements";

type ReconcilePaymentUnappliedInput = {
  locale: string;
  familyAccountId: string;
};

export async function reconcilePaymentUnapplied(
  input: ReconcilePaymentUnappliedInput
) {
  const admin = createAdminClient();

  const entitlements = await getAccountEntitlements({
    locale: input.locale,
  });

  if (entitlements.kind !== "ok") {
    throw new Error("Account entitlements are not available for reconciliation");
  }

  const { familyAccount, billingDiagnostics } = entitlements.data;

  if (familyAccount.id !== input.familyAccountId) {
    throw new Error("Family account does not match current entitlement context");
  }

  if (!billingDiagnostics.hasPaymentMismatch) {
    throw new Error("No payment mismatch exists for this family account");
  }

  if (billingDiagnostics.reconciliationStatus !== "payment_unapplied") {
    throw new Error("Reconciliation is only allowed for payment_unapplied cases");
  }

  if (
    billingDiagnostics.reconciliationRecommendation !==
    "safe_reconcile_payment_to_billing"
  ) {
    throw new Error("Reconciliation recommendation is not safe for this case");
  }

  const paymentFacts = await getPaymentFactsForBillingSubject({
    billingSubjectType: "family",
    billingSubjectId: input.familyAccountId,
  });

  if (!paymentFacts.latestValidPayment) {
    throw new Error("No latest valid payment exists for this family account");
  }

  const previousStatus = entitlements.data.familyAccount.last_payment_status;

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
      provider: paymentFacts.latestValidPayment.provider,
      provider_payment_id: paymentFacts.latestValidPayment.providerPaymentId,
    });

  if (auditError) {
    throw new Error(`Failed to write reconciliation audit: ${auditError.message}`);
  }

  return {
    ok: true,
    repairedField: "last_payment_status",
    repairedValue: "paid",
    familyAccountId: input.familyAccountId,
    provider: paymentFacts.latestValidPayment.provider,
    providerPaymentId: paymentFacts.latestValidPayment.providerPaymentId,
    paidAt: paymentFacts.latestValidPayment.paidAt,
  };
}
