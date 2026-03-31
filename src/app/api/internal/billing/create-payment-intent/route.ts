import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntent } from "@/server/billing/create-payment-intent";

const INTERNAL_SECRET = process.env.BILLING_PROVIDER_INGEST_SECRET;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || authHeader !== `Bearer ${INTERNAL_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const intent = await createPaymentIntent({
      accountType: body.accountType,
      accountId: body.accountId,
      planCode: body.planCode,
      billingCycle: body.billingCycle,
      amount: body.amount,
      currency: body.currency || "NOK",
    });

    return NextResponse.json({
      ok: true,
      paymentIntent: intent,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}