import { NextRequest, NextResponse } from "next/server";

import { processTripletexExportQueue } from "@/server/billing/process-tripletex-export-queue";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.BILLING_SYNC_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "BILLING_SYNC_SECRET is missing." },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const expectedAuth = `Bearer ${expectedSecret}`;

  if (authHeader !== expectedAuth) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = await processTripletexExportQueue({
      limit: typeof body.limit === "number" ? body.limit : undefined,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Tripletex processing error.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
