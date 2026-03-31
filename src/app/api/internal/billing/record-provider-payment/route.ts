import { NextRequest, NextResponse } from "next/server";

import { recordProviderPayment } from "@/server/billing/record-provider-payment";

const INTERNAL_SECRET = process.env.BILLING_PROVIDER_INGEST_SECRET;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || authHeader !== `Bearer ${INTERNAL_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const result = await recordProviderPayment({
      paymentIntentId: body.paymentIntentId,
      provider: body.provider,
      providerPaymentId: body.providerPaymentId,
      providerEventId: body.providerEventId ?? null,
      amount: body.amount,
      currency: body.currency ?? "NOK",
      paymentStatus: body.paymentStatus,
      paidAt: body.paidAt ?? null,
      rawPayload: body.rawPayload ?? {},
    });

    return NextResponse.json({
      ok: true,
      wasReplay: result.wasReplay,
      providerPayment: result.providerPayment,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown provider payment error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
