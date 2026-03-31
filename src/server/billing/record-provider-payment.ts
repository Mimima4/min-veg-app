import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

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

  if (typeof input.amount !== "number" || Number.isNaN(input.amount) || input.amount <= 0) {
    throw new Error("Invalid amount");
  }

  const { data: paymentIntent, error: paymentIntentError } = await supabase
    .from("payment_intents")
    .select("id, status")
    .eq("id", paymentIntentId)
    .single();

  if (paymentIntentError || !paymentIntent) {
    throw new Error("Payment intent not found");
  }

  const { data: existingByPaymentId, error: existingByPaymentIdError } = await supabase
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

    return {
      wasReplay: true,
      providerPayment: existingByPaymentId,
    };
  }

  if (providerEventId) {
    const { data: existingByEventId, error: existingByEventIdError } = await supabase
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

  return {
    wasReplay: false,
    providerPayment: data,
  };
}
