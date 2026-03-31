import { NextRequest, NextResponse } from "next/server";

import { getPaymentFactsForBillingSubject } from "@/server/billing/get-payment-facts-for-billing-subject";

const INTERNAL_SECRET = process.env.BILLING_PROVIDER_INGEST_SECRET;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || authHeader !== `Bearer ${INTERNAL_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const facts = await getPaymentFactsForBillingSubject({
      billingSubjectType: body.billingSubjectType,
      billingSubjectId: body.billingSubjectId,
    });

    return NextResponse.json({
      ok: true,
      paymentFacts: facts,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown payment facts error";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
