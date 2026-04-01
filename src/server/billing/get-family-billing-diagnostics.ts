import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentFactsForBillingSubject } from "@/server/billing/get-payment-facts-for-billing-subject";

export type FamilyBillingDiagnostics = {
  familyAccountId: string;
  lastPaymentStatus: string | null;
  hasPaymentMismatch: boolean;
  reason: string | null;
  reconciliationStatus:
    | "consistent"
    | "payment_missing"
    | "payment_unapplied"
    | "unknown";
  reconciliationRecommendation:
    | "no_action"
    | "review_required"
    | "safe_reconcile_payment_to_billing";
  latestValidPayment: Awaited<
    ReturnType<typeof getPaymentFactsForBillingSubject>
  >["latestValidPayment"];
};

export async function getFamilyBillingDiagnostics(params: {
  familyAccountId: string;
}): Promise<FamilyBillingDiagnostics> {
  const admin = createAdminClient();

  const { data: familyAccount, error: familyError } = await admin
    .from("family_accounts")
    .select("id, last_payment_status")
    .eq("id", params.familyAccountId)
    .single();

  if (familyError || !familyAccount) {
    throw new Error(
      `Failed to load family account billing state: ${familyError?.message ?? "not found"}`
    );
  }

  const paymentFacts = await getPaymentFactsForBillingSubject({
    billingSubjectType: "family",
    billingSubjectId: params.familyAccountId,
  });

  let hasPaymentMismatch = false;
  let reason: string | null = null;
  let reconciliationStatus:
    | "consistent"
    | "payment_missing"
    | "payment_unapplied"
    | "unknown" = "consistent";
  let reconciliationRecommendation:
    | "no_action"
    | "review_required"
    | "safe_reconcile_payment_to_billing" = "no_action";

  const hasValidPayment = paymentFacts.paymentAnswers.hasValidProviderPayment;
  const lastPaymentStatus = familyAccount.last_payment_status;

  if (hasValidPayment && lastPaymentStatus === "failed") {
    hasPaymentMismatch = true;
    reason = "Valid payment exists but last_payment_status is failed";
    reconciliationStatus = "payment_unapplied";
    reconciliationRecommendation = "safe_reconcile_payment_to_billing";
  } else if (!hasValidPayment && lastPaymentStatus === "failed") {
    reconciliationStatus = "payment_missing";
    reconciliationRecommendation = "no_action";
  } else if (!hasValidPayment && lastPaymentStatus && lastPaymentStatus !== "failed") {
    reconciliationStatus = "unknown";
    reconciliationRecommendation = "review_required";
  }

  return {
    familyAccountId: familyAccount.id,
    lastPaymentStatus,
    hasPaymentMismatch,
    reason,
    reconciliationStatus,
    reconciliationRecommendation,
    latestValidPayment: paymentFacts.latestValidPayment,
  };
}
