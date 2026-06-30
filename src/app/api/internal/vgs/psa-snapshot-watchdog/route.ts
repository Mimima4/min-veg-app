import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { checkPsaSnapshotFreshness } from "@/server/vgs/check-psa-snapshot-freshness";
import { verifyInternalSchedulerRequest } from "@/server/vgs/verify-internal-scheduler-request";

/**
 * Read-only freshness watchdog for the Vilbli PSA snapshot. Triggered by Vercel
 * Cron (GET) on a weekly cadence; never fetches Vilbli and never writes. When the
 * snapshot is older than the threshold it pings OPS_ALERT_WEBHOOK_URL (if set).
 * Auth: CRON_SECRET. Pass `?notify=false` to inspect status without alerting.
 */
export const runtime = "nodejs";
export const maxDuration = 60;
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

  const searchParams = new URL(request.url).searchParams;
  const notify = searchParams.get("notify") !== "false";
  // Test-only override of the staleness threshold (e.g. `?staleDays=1`) so the
  // reminder path can be exercised without touching env / redeploying.
  const staleDaysRaw = Number.parseInt(searchParams.get("staleDays") ?? "", 10);
  const thresholdDaysOverride =
    Number.isFinite(staleDaysRaw) && staleDaysRaw > 0 ? staleDaysRaw : undefined;
  const freshness = await checkPsaSnapshotFreshness({ notify, thresholdDaysOverride });
  return NextResponse.json({ ok: true, freshness });
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
