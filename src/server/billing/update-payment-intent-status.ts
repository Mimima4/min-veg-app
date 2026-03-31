import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type PaymentIntentStatus =
  | "created"
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "blocked";

const ALLOWED_TRANSITIONS: Record<PaymentIntentStatus, PaymentIntentStatus[]> = {
  created: ["pending", "failed", "expired"],
  pending: ["paid", "failed"],
  paid: [],
  failed: [],
  expired: [],
  blocked: [],
};

export async function updatePaymentIntentStatus(
  paymentIntentId: string,
  nextStatus: PaymentIntentStatus
) {
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("payment_intents")
    .select("id, status")
    .eq("id", paymentIntentId)
    .single();

  if (fetchError || !existing) {
    throw new Error("Payment intent not found");
  }

  const currentStatus = existing.status as PaymentIntentStatus;

  if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(nextStatus)) {
    throw new Error(
      `Invalid status transition: ${currentStatus} -> ${nextStatus}`
    );
  }

  const { data, error } = await supabase
    .from("payment_intents")
    .update({
      status: nextStatus,
    })
    .eq("id", paymentIntentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }

  return data;
}