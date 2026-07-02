import { NextRequest, NextResponse } from "next/server";

import {
  getScheduledLarebedriftIngestBatchCodes,
  isScheduledLarebedriftIngestBatchIndex,
  SCHEDULED_LAREBEDRIFT_INGEST_BATCHES,
} from "@/lib/larebedrift/scheduled-larebedrift-ingest-fags";

import { handleRunIngestRequest, respondIngestRouteError } from "../handle-run-ingest";

/**
 * Batched monthly cron ingest — one batch per invocation to stay within maxDuration.
 * Vercel Cron hits `/run-ingest/0` … `/run-ingest/3` on staggered schedules.
 * HTTP 5xx pings OPS_ALERT_WEBHOOK_URL (Discord/Slack). Pass `?notify=false` to suppress.
 */
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

const MAX_BATCH_INDEX = SCHEDULED_LAREBEDRIFT_INGEST_BATCHES.length - 1;

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
    if (!isScheduledLarebedriftIngestBatchIndex(batchIndex)) {
      return NextResponse.json(
        {
          ok: false,
          error: `Invalid larebedrift ingest batch index ${batchIndex} (valid: 0-${MAX_BATCH_INDEX})`,
        },
        { status: 400 }
      );
    }
    const larefagCodes = getScheduledLarebedriftIngestBatchCodes(batchIndex);
    return await handleRunIngestRequest(request, larefagCodes);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return respondIngestRouteError(request, 500, message);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ batch: string }> }
) {
  return GET(request, { params });
}
