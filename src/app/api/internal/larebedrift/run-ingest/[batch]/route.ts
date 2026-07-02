import { NextRequest, NextResponse } from "next/server";

import { getScheduledLarebedriftIngestBatchCodes } from "@/lib/larebedrift/scheduled-larebedrift-ingest-fags";

import { handleRunIngestRequest, respondIngestRouteError } from "../handle-run-ingest";

/**
 * Batched monthly cron ingest — one batch per invocation to stay within maxDuration.
 * Vercel Cron hits `/run-ingest/0` … `/run-ingest/3` on staggered schedules.
 * On HTTP ≠ 200 pings OPS_ALERT_WEBHOOK_URL (Discord/Slack). Pass `?notify=false` to suppress.
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
      return respondIngestRouteError(request, 400, `Invalid batch index: ${batch}`);
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
