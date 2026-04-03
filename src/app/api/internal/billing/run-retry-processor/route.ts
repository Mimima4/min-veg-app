import { NextResponse } from "next/server";

import { runBillingRetryProcessor } from "@/server/billing/run-billing-retry-processor";

export async function POST() {
  const result = await runBillingRetryProcessor();

  return NextResponse.json({
    ok: true,
    result,
  });
}