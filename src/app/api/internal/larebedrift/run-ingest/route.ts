import { NextRequest } from "next/server";

import { handleRunIngestRequest, respondIngestRouteError } from "./handle-run-ingest";

/**
 * Self-sufficient verified-lærebedrift refresh (Finnlærebedrift + Brønnøysund).
 * Manual operator entry: all scheduled fag (may exceed maxDuration — prefer `/run-ingest/[batch]`).
 * Monthly Vercel Cron uses batched routes `/run-ingest/0` … `/run-ingest/6`. Auth: CRON_SECRET.
 * On HTTP 5xx pings OPS_ALERT_WEBHOOK_URL (Discord/Slack). Pass `?notify=false` to suppress.
 */
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    return await handleRunIngestRequest(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return respondIngestRouteError(request, 500, message);
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handleRunIngestRequest(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return respondIngestRouteError(request, 500, message);
  }
}
