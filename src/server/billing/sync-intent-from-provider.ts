import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type ProviderStatus = "paid" | "failed" | "pending" | string;

export async function syncPaymentIntentFromProviderPayment(params: {
  paymentIntentId: string;
  providerPaymentStatus: ProviderStatus;
}) {
  const admin = createAdminClient();

  let nextStatus: "paid" | "failed" | "pending" | null = null;

  if (params.providerPaymentStatus === "paid") {
    nextStatus = "paid";
  } else if (params.providerPaymentStatus === "failed") {
    nextStatus = "failed";
  } else if (params.providerPaymentStatus === "pending") {
    nextStatus = "pending";
  } else {
    // неизвестные статусы не трогаем
    return { ok: true, skipped: true };
  }

  // не делаем деградации статуса:
  // paid -> pending/failed запрещено
  const { data: current, error: readError } = await admin
    .from("payment_intents")
    .select("status")
    .eq("id", params.paymentIntentId)
    .single();

  if (readError) {
    throw new Error(`Failed to read payment intent: ${readError.message}`);
  }

  if (current.status === "paid" && nextStatus !== "paid") {
    return { ok: true, skipped: true };
  }

  const { error } = await admin
    .from("payment_intents")
    .update({ status: nextStatus })
    .eq("id", params.paymentIntentId);

  if (error) {
    throw new Error(`Failed to sync payment intent: ${error.message}`);
  }

  return {
    ok: true,
    updated: true,
    nextStatus,
  };
}
