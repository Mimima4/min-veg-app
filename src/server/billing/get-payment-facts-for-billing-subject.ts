import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

type BillingSubjectType = "family";

type PaymentIntentStatus =
  | "created"
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "blocked";

type ProviderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

type PaymentIntentRow = {
  id: string;
  account_type: string;
  account_id: string;
  plan_code: string;
  billing_cycle: string;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  policy_block_reason: string | null;
  created_at: string;
  expires_at: string | null;
  updated_at: string;
};

type ProviderPaymentRow = {
  id: string;
  payment_intent_id: string;
  provider: string;
  provider_payment_id: string;
  provider_event_id: string | null;
  amount: number;
  currency: string;
  payment_status: ProviderPaymentStatus;
  paid_at: string | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

type GetPaymentFactsInput = {
  billingSubjectType: BillingSubjectType;
  billingSubjectId: string;
};

export type PaymentFactsForBillingSubject = {
  billingSubject: {
    type: BillingSubjectType;
    id: string;
  };
  latestIntent: null | {
    id: string;
    status: PaymentIntentStatus;
    policyBlockReason: string | null;
    planCode: string;
    billingCycle: string;
    amount: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
    expiresAt: string | null;
  };
  latestProviderPayment: null | {
    id: string;
    paymentIntentId: string;
    provider: string;
    providerPaymentId: string;
    providerEventId: string | null;
    paymentStatus: ProviderPaymentStatus;
    amount: number;
    currency: string;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  latestValidPayment: null | {
    paymentIntentId: string;
    providerPaymentId: string;
    providerEventId: string | null;
    provider: string;
    amount: number;
    currency: string;
    paidAt: string | null;
    createdAt: string;
  };
  paymentAnswers: {
    hasAnyIntent: boolean;
    hasBlockedIntent: boolean;
    hasPendingIntent: boolean;
    hasPaidIntent: boolean;
    hasAnyProviderPayment: boolean;
    hasValidProviderPayment: boolean;
    latestPaymentAt: string | null;
  };
};

function requireBillingSubjectId(value: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error("billingSubjectId is required");
  }

  return normalized;
}

function compareProviderPaymentRecency(
  a: ProviderPaymentRow,
  b: ProviderPaymentRow
): number {
  const aTime = a.paid_at ?? a.created_at;
  const bTime = b.paid_at ?? b.created_at;

  if (aTime > bTime) return -1;
  if (aTime < bTime) return 1;

  if (a.created_at > b.created_at) return -1;
  if (a.created_at < b.created_at) return 1;

  return 0;
}

export async function getPaymentFactsForBillingSubject(
  input: GetPaymentFactsInput
): Promise<PaymentFactsForBillingSubject> {
  const supabase = createAdminClient();

  const billingSubjectId = requireBillingSubjectId(input.billingSubjectId);

  if (input.billingSubjectType !== "family") {
    throw new Error("Unsupported billingSubjectType");
  }

  const { data: intents, error: intentsError } = await supabase
    .from("payment_intents")
    .select(
      "id, account_type, account_id, plan_code, billing_cycle, amount, currency, status, policy_block_reason, created_at, expires_at, updated_at"
    )
    .eq("account_type", input.billingSubjectType)
    .eq("account_id", billingSubjectId)
    .order("created_at", { ascending: false });

  if (intentsError) {
    throw new Error(`Failed to load payment intents: ${intentsError.message}`);
  }

  const paymentIntents = (intents ?? []) as PaymentIntentRow[];
  const latestIntent = paymentIntents[0] ?? null;

  const intentIds = paymentIntents.map((intent) => intent.id);

  let providerPayments: ProviderPaymentRow[] = [];

  if (intentIds.length > 0) {
    const { data: payments, error: paymentsError } = await supabase
      .from("provider_payments")
      .select(
        "id, payment_intent_id, provider, provider_payment_id, provider_event_id, amount, currency, payment_status, paid_at, raw_payload, created_at, updated_at"
      )
      .in("payment_intent_id", intentIds);

    if (paymentsError) {
      throw new Error(
        `Failed to load provider payments: ${paymentsError.message}`
      );
    }

    providerPayments = (payments ?? []) as ProviderPaymentRow[];
    providerPayments.sort(compareProviderPaymentRecency);
  }

  const latestProviderPayment = providerPayments[0] ?? null;
  const latestValidPayment =
    providerPayments.find((payment) => payment.payment_status === "paid") ?? null;

  return {
    billingSubject: {
      type: input.billingSubjectType,
      id: billingSubjectId,
    },
    latestIntent: latestIntent
      ? {
          id: latestIntent.id,
          status: latestIntent.status,
          policyBlockReason: latestIntent.policy_block_reason,
          planCode: latestIntent.plan_code,
          billingCycle: latestIntent.billing_cycle,
          amount: latestIntent.amount,
          currency: latestIntent.currency,
          createdAt: latestIntent.created_at,
          updatedAt: latestIntent.updated_at,
          expiresAt: latestIntent.expires_at,
        }
      : null,
    latestProviderPayment: latestProviderPayment
      ? {
          id: latestProviderPayment.id,
          paymentIntentId: latestProviderPayment.payment_intent_id,
          provider: latestProviderPayment.provider,
          providerPaymentId: latestProviderPayment.provider_payment_id,
          providerEventId: latestProviderPayment.provider_event_id,
          paymentStatus: latestProviderPayment.payment_status,
          amount: latestProviderPayment.amount,
          currency: latestProviderPayment.currency,
          paidAt: latestProviderPayment.paid_at,
          createdAt: latestProviderPayment.created_at,
          updatedAt: latestProviderPayment.updated_at,
        }
      : null,
    latestValidPayment: latestValidPayment
      ? {
          paymentIntentId: latestValidPayment.payment_intent_id,
          providerPaymentId: latestValidPayment.provider_payment_id,
          providerEventId: latestValidPayment.provider_event_id,
          provider: latestValidPayment.provider,
          amount: latestValidPayment.amount,
          currency: latestValidPayment.currency,
          paidAt: latestValidPayment.paid_at,
          createdAt: latestValidPayment.created_at,
        }
      : null,
    paymentAnswers: {
      hasAnyIntent: paymentIntents.length > 0,
      hasBlockedIntent: paymentIntents.some((intent) => intent.status === "blocked"),
      hasPendingIntent: paymentIntents.some((intent) => intent.status === "pending"),
      hasPaidIntent: paymentIntents.some((intent) => intent.status === "paid"),
      hasAnyProviderPayment: providerPayments.length > 0,
      hasValidProviderPayment: providerPayments.some(
        (payment) => payment.payment_status === "paid"
      ),
      latestPaymentAt: latestValidPayment?.paid_at ?? latestValidPayment?.created_at ?? null,
    },
  };
}
