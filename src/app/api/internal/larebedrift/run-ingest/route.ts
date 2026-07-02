import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { runLarebedriftIngest } from "@/server/larebedrift/run-larebedrift-ingest";
import { verifyInternalSchedulerRequest } from "@/server/vgs/verify-internal-scheduler-request";

/**
 * Self-sufficient verified-lærebedrift refresh (Finnlærebedrift + Brønnøysund).
 * Triggered by Vercel Cron (GET) on a monthly cadence; never on page load,
 * recompute, or deploy. POST allowed for operator tooling. Auth: CRON_SECRET.
 */
export const runtime = "nodejs";
export const maxDuration = 800;
export const dynamic = "force-dynamic";

async function handle(request: NextRequest) {
  if (!verifyInternalSchedulerRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error: "SUPABASE_SERVICE_ROLE_KEY is missing in deployment env (configure on Vercel).",
      },
      { status: 500 }
    );
  }

  const dryRun = new URL(request.url).searchParams.get("dryRun") === "true";
  const larefagCodes = new URL(request.url)
    .searchParams.getAll("larefagCode")
    .map((code) => code.trim())
    .filter(Boolean);
  const run = await runLarebedriftIngest({
    dryRun,
    larefagCodes: larefagCodes.length > 0 ? larefagCodes : undefined,
  });
  return NextResponse.json({ ok: true, ...run });
}

export async function GET(request: NextRequest) {
  try {
    return await handle(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return await handle(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
