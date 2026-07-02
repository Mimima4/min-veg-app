import { NextRequest, NextResponse } from "next/server";

import { getScheduledLarebedriftIngestBatchCodes } from "@/lib/larebedrift/scheduled-larebedrift-ingest-fags";

import { handleRunIngestRequest } from "../handle-run-ingest";

/**
 * Batched monthly cron ingest — one batch per invocation to stay within maxDuration.
 * Vercel Cron hits `/run-ingest/0` … `/run-ingest/3` on staggered schedules.
 */
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batch: string }> }
) {
  try {
    const { batch } = await params;
    const batchIndex = Number(batch);
    if (!Number.isInteger(batchIndex)) {
      return NextResponse.json(
        { ok: false, error: `Invalid batch index: ${batch}` },
        { status: 400 }
      );
    }
    const larefagCodes = getScheduledLarebedriftIngestBatchCodes(batchIndex);
    return await handleRunIngestRequest(request, larefagCodes);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ batch: string }> }
) {
  return GET(request, { params });
}
