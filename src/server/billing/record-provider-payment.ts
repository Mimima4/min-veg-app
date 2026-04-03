import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { syncPaymentIntentFromProviderPayment } from "@/server/billing/sync-intent-from-provider";
import { continueProviderPaymentOrchestration } from "@/server/billing/continue-provider-payment-orchestration";

type ProviderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

type RecordProviderPaymentInput = {
  paymentIntentId: string;
  provider: string;
  providerPaymentId: string;
  providerEventId?: string | null;
  amount: number;
  currency?: string;
  paymentStatus: ProviderPaymentStatus;
  paidAt?: string | null;
  rawPayload?: Record<string, unknown> | null;
};

function normalizeText(value: string, field: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} is required`);
  }

  return normalized;
}

async function upsertOrchestrationRun(params: {
  paymentIntentId: string;
  providerPaymentId: string;
  status: "processing" | "completed" | "failed";
  error?: string | null;
}) {
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

export async function recordProviderPayment(input: RecordProviderPaymentInput) {
  const supabase = createAdminClient();

  const paymentIntentId = normalizeText(input.paymentIntentId, "paymentIntentId");
  const provider = normalizeText(input.provider, "provider").toLowerCase();
  const providerPaymentId = normalizeText(
    input.providerPaymentId,
    "providerPaymentId"
  );
  const providerEventId = input.providerEventId?.trim() || null;
  const currency = (input.currency?.trim() || "NOK").toUpperCase();

  if (
    input.paymentStatus !== "pending" &&
    input.paymentStatus !== "paid" &&
    input.paymentStatus !== "failed" &&
    input.paymentStatus !== "refunded"
  ) {
    throw new Error("Invalid paymentStatus");
  }

  if (
    typeof input.amount !== "number" ||
    Number.isNaN(input.amount) ||
    input.amount <= 0
  ) {
    throw new Error("Invalid amount");
  }

  const { data: existingRun, error: existingRunError } = await supabase
    .from("billing_orchestration_runs")
    .select("id, status, completed_at, error")
    .eq("payment_intent_id", paymentIntentId)
    .eq("provider_payment_id", providerPaymentId)
    .maybeSingle();

  if (existingRunError) {
    throw new Error(
      `Failed to inspect billing orchestration run: ${existingRunError.message}`
    );
  }

  if (existingRun?.status === "completed") {
    const { data: existingProviderPayment, error: existingProviderPaymentError } =
      await supabase
        .from("provider_payments")
        .select("*")
        .eq("payment_intent_id", paymentIntentId)
        .eq("provider", provider)
        .eq("provider_payment_id", providerPaymentId)
        .maybeSingle();

    if (existingProviderPaymentError) {
      throw new Error(
        `Failed to read existing provider payment after completed orchestration: ${existingProviderPaymentError.message}`
      );
    }

    return {
      wasReplay: true,
      providerPayment: existingProviderPayment,
    };
  }

  await upsertOrchestrationRun({
    paymentIntentId,
    providerPaymentId,
    status: "processing",
  });

  try {
    const { data: paymentIntent, error: paymentIntentError } = await supabase
      .from("payment_intents")
      .select("id, account_type, account_id, plan_code, billing_cycle, status")
      .eq("id", paymentIntentId)
      .single();

    if (paymentIntentError || !paymentIntent) {
      throw new Error("Payment intent not found");
    }

    const { data: existingByPaymentId, error: existingByPaymentIdError } =
      await supabase
        .from("provider_payments")
        .select("*")
        .eq("provider", provider)
        .eq("provider_payment_id", providerPaymentId)
        .maybeSingle();

    if (existingByPaymentIdError) {
      throw new Error(
        `Failed to load existing provider payment by provider_payment_id: ${existingByPaymentIdError.message}`
      );
    }

    if (existingByPaymentId) {
      if (existingByPaymentId.payment_intent_id !== paymentIntentId) {
        throw new Error(
          "This provider payment is already linked to a different payment intent"
        );
      }

      await upsertOrchestrationRun({
        paymentIntentId,
        providerPaymentId,
        status: "completed",
      });

      return {
        wasReplay: true,
        providerPayment: existingByPaymentId,
      };
    }

    if (providerEventId) {
      const { data: existingByEventId, error: existingByEventIdError } =
        await supabase
          .from("provider_payments")
          .select("*")
          .eq("provider", provider)
          .eq("provider_event_id", providerEventId)
          .maybeSingle();

      if (existingByEventIdError) {
        throw new Error(
          `Failed to load existing provider payment by provider_event_id: ${existingByEventIdError.message}`
        );
      }

      if (existingByEventId) {
        if (existingByEventId.payment_intent_id !== paymentIntentId) {
          throw new Error(
            "This provider event is already linked to a different payment intent"
          );
        }

        await upsertOrchestrationRun({
          paymentIntentId,
          providerPaymentId,
          status: "completed",
        });

        return {
          wasReplay: true,
          providerPayment: existingByEventId,
        };
      }
    }

    const { data, error } = await supabase
      .from("provider_payments")
      .insert({
        payment_intent_id: paymentIntentId,
        provider,
        provider_payment_id: providerPaymentId,
        provider_event_id: providerEventId,
        amount: input.amount,
        currency,
        payment_status: input.paymentStatus,
        paid_at: input.paidAt ?? null,
        raw_payload: input.rawPayload ?? {},
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record provider payment: ${error.message}`);
    }

    await syncPaymentIntentFromProviderPayment({
      paymentIntentId,
      providerPaymentStatus: input.paymentStatus,
    });

    const { data: paymentIntentRow, error: paymentIntentRowError } = await supabase
      .from("payment_intents")
      .select("account_type, account_id, plan_code, billing_cycle, status")
      .eq("id", paymentIntentId)
      .single();

    if (paymentIntentRowError) {
      throw new Error(
        `Failed to read payment intent owner after provider payment insert: ${paymentIntentRowError.message}`
      );
    }

    if (paymentIntentRow.account_type === "family" && input.paymentStatus === "paid") {
      await continueProviderPaymentOrchestration({
        paymentIntentId,
        provider,
        providerPaymentId,
        providerEventId,
        paidAt: input.paidAt ?? data.paid_at ?? null,
        rawPayload: input.rawPayload ?? {},
      });
    }

    await upsertOrchestrationRun({
      paymentIntentId,
      providerPaymentId,
      status: "completed",
    });

    return {
      wasReplay: false,
      providerPayment: data,
    };
  } catch (error) {
    await upsertOrchestrationRun({
      paymentIntentId,
      providerPaymentId,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown orchestration error",
    });

    throw error;
  }
}
