import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { continueProviderPaymentOrchestration } from "@/server/billing/continue-provider-payment-orchestration";

type RequestBody = {
  providerPaymentId?: string;
};

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return null;
}

async function markRunCompleted(params: {
  paymentIntentId: string;
  providerPaymentId: string;
}) {
  const admin = createAdminClient();

  const { error } = await admin
    .from("billing_orchestration_runs")
    .update({
      status: "completed",
      error: null,
      completed_at: new Date().toISOString(),
      next_retry_at: null,
      last_error_at: null,
    })
    .eq("payment_intent_id", params.paymentIntentId)
    .eq("provider_payment_id", params.providerPaymentId);

  if (error) {
    throw new Error(`Failed to mark orchestration run completed: ${error.message}`);
  }
}

async function markRunFailed(params: {
  paymentIntentId: string;
  providerPaymentId: string;
  errorMessage: string;
}) {
  const admin = createAdminClient();

  const { data: existingRun, error: existingRunError } = await admin
    .from("billing_orchestration_runs")
    .select("retry_count")
    .eq("payment_intent_id", params.paymentIntentId)
    .eq("provider_payment_id", params.providerPaymentId)
    .maybeSingle();

  if (existingRunError) {
    throw new Error(
      `Failed to read orchestration run before retry failure update: ${existingRunError.message}`
    );
  }

  const nextRetryAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error } = await admin
    .from("billing_orchestration_runs")
    .update({
      status: "failed",
      error: params.errorMessage,
      retry_count: (existingRun?.retry_count ?? 0) + 1,
      retryable: true,
      last_error_at: new Date().toISOString(),
      next_retry_at: nextRetryAt,
      completed_at: null,
    })
    .eq("payment_intent_id", params.paymentIntentId)
    .eq("provider_payment_id", params.providerPaymentId);

  if (error) {
    throw new Error(`Failed to mark orchestration run failed: ${error.message}`);
  }
}

export async function POST(request: NextRequest) {
  const authToken = getAuthToken(request);

  if (authToken !== process.env.BILLING_PROVIDER_INGEST_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const providerPaymentId = body.providerPaymentId?.trim();

  if (!providerPaymentId) {
    return NextResponse.json(
      { ok: false, error: "providerPaymentId is required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: run, error: runError } = await admin
    .from("billing_orchestration_runs")
    .select(
      "payment_intent_id, provider_payment_id, status, retryable, next_retry_at"
    )
    .eq("provider_payment_id", providerPaymentId)
    .maybeSingle();

  if (runError) {
    return NextResponse.json(
      { ok: false, error: `Failed to load orchestration run: ${runError.message}` },
      { status: 500 }
    );
  }

  if (!run) {
    return NextResponse.json(
      { ok: false, error: "Orchestration run not found" },
      { status: 404 }
    );
  }

  if (run.status !== "failed") {
    return NextResponse.json(
      { ok: false, error: "Only failed orchestration runs can be retried" },
      { status: 400 }
    );
  }

  if (!run.retryable) {
    return NextResponse.json(
      { ok: false, error: "This orchestration run is not retryable" },
      { status: 400 }
    );
  }

  if (run.next_retry_at && new Date(run.next_retry_at).getTime() > Date.now()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Retry is not due yet",
        nextRetryAt: run.next_retry_at,
      },
      { status: 400 }
    );
  }

  const { data: providerPayment, error: providerPaymentError } = await admin
    .from("provider_payments")
    .select(
      "payment_intent_id, provider, provider_payment_id, provider_event_id, paid_at, raw_payload"
    )
    .eq("provider_payment_id", providerPaymentId)
    .maybeSingle();

  if (providerPaymentError) {
    return NextResponse.json(
      { ok: false, error: `Failed to load provider payment: ${providerPaymentError.message}` },
      { status: 500 }
    );
  }

  if (!providerPayment) {
    return NextResponse.json(
      { ok: false, error: "Provider payment not found" },
      { status: 404 }
    );
  }

  try {
    const result = await continueProviderPaymentOrchestration({
      paymentIntentId: providerPayment.payment_intent_id,
      provider: providerPayment.provider,
      providerPaymentId: providerPayment.provider_payment_id,
      providerEventId: providerPayment.provider_event_id,
      paidAt: providerPayment.paid_at,
      rawPayload:
        providerPayment.raw_payload &&
        typeof providerPayment.raw_payload === "object" &&
        !Array.isArray(providerPayment.raw_payload)
          ? {
              ...(providerPayment.raw_payload as Record<string, unknown>),
              forceFail: false,
              retryTriggered: true,
            }
          : {
              forceFail: false,
              retryTriggered: true,
            },
    });

    await markRunCompleted({
      paymentIntentId: providerPayment.payment_intent_id,
      providerPaymentId: providerPayment.provider_payment_id,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown retry orchestration error";

    await markRunFailed({
      paymentIntentId: providerPayment.payment_intent_id,
      providerPaymentId: providerPayment.provider_payment_id,
      errorMessage,
    });

    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
