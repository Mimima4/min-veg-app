import { NextRequest, NextResponse } from "next/server";
import { updatePaymentIntentStatus } from "@/server/billing/update-payment-intent-status";

const INTERNAL_SECRET = process.env.BILLING_PROVIDER_INGEST_SECRET;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || authHeader !== `Bearer ${INTERNAL_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const updated = await updatePaymentIntentStatus(
      body.paymentIntentId,
      body.nextStatus
    );

    return NextResponse.json({
      ok: true,
      paymentIntent: updated,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}