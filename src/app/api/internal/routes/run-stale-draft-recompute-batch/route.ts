import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isOsloMaintenanceWindow,
  runStaleDraftRouteRecomputeBatch,
} from "@/server/children/routes/run-stale-draft-route-recompute-batch";
import { verifyInternalSchedulerRequest } from "@/server/vgs/verify-internal-scheduler-request";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

type BatchBody = {
  professionSlug?: string;
  countyCode?: string;
  locale?: string;
  maxRoutes?: number;
  concurrency?: number;
  dryRun?: boolean;
  /** Skip 03:00–05:00 Europe/Oslo maintenance window check. */
  force?: boolean;
  triggerReason?: string;
};

async function handle(request: NextRequest) {
  if (!verifyInternalSchedulerRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  let body: BatchBody = {};

  if (request.method === "POST") {
    try {
      body = (await request.json()) as BatchBody;
    } catch {
      body = {};
    }
  }

  const professionSlug =
    body.professionSlug?.trim() || url.searchParams.get("professionSlug")?.trim() || undefined;
  const countyCode =
    body.countyCode?.trim() || url.searchParams.get("countyCode")?.trim() || undefined;
  const locale = body.locale?.trim() || url.searchParams.get("locale")?.trim() || "en";
  const dryRun =
    body.dryRun === true || url.searchParams.get("dryRun") === "true";
  const force = body.force === true || url.searchParams.get("force") === "true";
  const maxRoutes = Number(body.maxRoutes ?? url.searchParams.get("maxRoutes") ?? 40);
  const concurrency = Number(
    body.concurrency ?? url.searchParams.get("concurrency") ?? 2
  );
  const triggerReason =
    body.triggerReason?.trim() ||
    url.searchParams.get("triggerReason")?.trim() ||
    "scheduled_stale_batch";

  if (!force && !isOsloMaintenanceWindow()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "outside_oslo_maintenance_window",
      hint: "Batch runs only 03:00–05:00 Europe/Oslo unless force=true",
    });
  }

  const supabase = createAdminClient();
  const result = await runStaleDraftRouteRecomputeBatch({
    supabase,
    locale,
    dryRun,
    maxRoutes: Number.isFinite(maxRoutes) ? maxRoutes : 40,
    concurrency: Number.isFinite(concurrency) ? concurrency : 2,
    triggerReason,
    scope: {
      professionSlug,
      countyCode,
    },
  });

  return NextResponse.json({
    ok: true,
    result,
  });
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
