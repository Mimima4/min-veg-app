import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { continueProviderPaymentOrchestration } from "@/server/billing/continue-provider-payment-orchestration";
import { assertProviderPaymentOrchestrationConsistency } from "@/server/billing/assert-provider-payment-orchestration-consistency";

type UpsertBillingOrchestrationRunInput = {
  paymentIntentId: string;
  providerPaymentId: string;
  status: "processing" | "completed" | "failed";
  error?: string | null;
};

type RunProviderPaymentOrchestrationInput = {
  paymentIntentId: string;
  provider: string;
  providerPaymentId: string;
  providerEventId?: string | null;
  paidAt?: string | null;
  rawPayload?: Record<string, unknown> | null;
};

export async function upsertBillingOrchestrationRun(
  params: UpsertBillingOrchestrationRunInput
) {
  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  if (params.status === "failed") {
    const { data: existingRun, error: existingRunError } = await supabase
      .from("billing_orchestration_runs")
      .select("id, retry_count")
      .eq("payment_intent_id", params.paymentIntentId)
      .eq("provider_payment_id", params.providerPaymentId)
      .maybeSingle();

    if (existingRunError) {
      throw new Error(
        `Failed to read existing billing orchestration run for failure update: ${existingRunError.message}`
      );
    }

    const nextRetryDate = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const payload = {
      payment_intent_id: params.paymentIntentId,
      provider_payment_id: params.providerPaymentId,
      status: "failed" as const,
      error: params.error ?? "Unknown orchestration error",
      retry_count: (existingRun?.retry_count ?? 0) + 1,
      retryable: true,
      last_error_at: nowIso,
      next_retry_at: nextRetryDate,
      completed_at: null,
    };

    const { error } = await supabase
      .from("billing_orchestration_runs")
      .upsert(payload, {
        onConflict: "payment_intent_id,provider_payment_id",
      });

    if (error) {
      throw new Error(
        `Failed to upsert failed billing orchestration run: ${error.message}`
      );
    }

    return;
  }

  const payload =
    params.status === "completed"
      ? {
          payment_intent_id: params.paymentIntentId,
          provider_payment_id: params.providerPaymentId,
          status: params.status,
          error: null,
          completed_at: nowIso,
          retryable: true,
          next_retry_at: null,
          last_error_at: null,
        }
      : {
          payment_intent_id: params.paymentIntentId,
          provider_payment_id: params.providerPaymentId,
          status: params.status,
          error: null,
          retryable: true,
        };

  const { error } = await supabase
    .from("billing_orchestration_runs")
    .upsert(payload, {
      onConflict: "payment_intent_id,provider_payment_id",
    });

  if (error) {
    throw new Error(
      `Failed to upsert billing orchestration run: ${error.message}`
    );
  }
}

export async function runProviderPaymentOrchestration(
  input: RunProviderPaymentOrchestrationInput
) {
  await upsertBillingOrchestrationRun({
    paymentIntentId: input.paymentIntentId,
    providerPaymentId: input.providerPaymentId,
    status: "processing",
  });

  try {
    const orchestrationResult = await continueProviderPaymentOrchestration({
      paymentIntentId: input.paymentIntentId,
      provider: input.provider,
      providerPaymentId: input.providerPaymentId,
      providerEventId: input.providerEventId ?? null,
      paidAt: input.paidAt ?? null,
      rawPayload: input.rawPayload ?? {},
    });

    const consistencyCheck = await assertProviderPaymentOrchestrationConsistency(
      {
        paymentIntentId: input.paymentIntentId,
        provider: input.provider,
        providerPaymentId: input.providerPaymentId,
        familyAccountId:
          "familyAccountId" in orchestrationResult
            ? orchestrationResult.familyAccountId ?? null
            : null,
        deferredPlanChangeId:
          "deferredPlanChangeId" in orchestrationResult
            ? orchestrationResult.deferredPlanChangeId ?? null
            : null,
        subscriptionEventId:
          "subscriptionEventId" in orchestrationResult
            ? orchestrationResult.subscriptionEventId ?? null
            : null,
        ledgerEntryId:
          "ledgerEntryId" in orchestrationResult
            ? orchestrationResult.ledgerEntryId ?? null
            : null,
      }
    );

    await upsertBillingOrchestrationRun({
      paymentIntentId: input.paymentIntentId,
      providerPaymentId: input.providerPaymentId,
      status: "completed",
    });

    return {
      ...orchestrationResult,
      consistencyCheck,
    };
  } catch (error) {
    await upsertBillingOrchestrationRun({
      paymentIntentId: input.paymentIntentId,
      providerPaymentId: input.providerPaymentId,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown orchestration error",
    });

    throw error;
  }
}