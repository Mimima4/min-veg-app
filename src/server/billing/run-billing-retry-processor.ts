import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { continueProviderPaymentOrchestration } from "@/server/billing/continue-provider-payment-orchestration";

export async function runBillingRetryProcessor(args?: {
  limit?: number;
}) {
  const supabase = createAdminClient();

  const limit = args?.limit ?? 20;
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("billing_orchestration_runs")
    .select(
      "payment_intent_id, provider_payment_id, retry_count, next_retry_at"
    )
    .eq("status", "failed")
    .eq("retryable", true)
    .lte("next_retry_at", nowIso)
    .order("next_retry_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(
      `Failed to load retryable billing runs: ${error.message}`
    );
  }

  const runs = data ?? [];

  for (const run of runs) {
    try {
      const { data: providerPayment, error: providerPaymentError } =
        await supabase
          .from("provider_payments")
          .select(
            "payment_intent_id, provider, provider_payment_id, provider_event_id, paid_at, raw_payload"
          )
          .eq("payment_intent_id", run.payment_intent_id)
          .eq("provider_payment_id", run.provider_payment_id)
          .maybeSingle();

      if (providerPaymentError) {
        continue;
      }

      if (!providerPayment) {
        continue;
      }

      await continueProviderPaymentOrchestration({
        paymentIntentId: providerPayment.payment_intent_id,
        provider: providerPayment.provider,
        providerPaymentId: providerPayment.provider_payment_id,
        providerEventId: providerPayment.provider_event_id,
        paidAt: providerPayment.paid_at,
        rawPayload:
          providerPayment.raw_payload &&
          typeof providerPayment.raw_payload === "object" &&
          !Array.isArray(providerPayment.raw_payload)
            ? (providerPayment.raw_payload as Record<string, unknown>)
            : {},
      });
    } catch {
      // Ничего не делаем: failed bookkeeping уже есть в orchestration contour
    }
  }

  return {
    processed: runs.length,
  };
}