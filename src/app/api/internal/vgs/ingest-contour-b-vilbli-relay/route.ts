import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runStaleDraftRouteRecomputeBatch } from "@/server/children/routes/run-stale-draft-route-recompute-batch";
import { loadContourBSchedulerBundle } from "@/server/vgs/load-contour-b-scheduler-bundle";
import { verifyInternalSchedulerRequest } from "@/server/vgs/verify-internal-scheduler-request";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!verifyInternalSchedulerRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      professionSlug?: string;
      countyCode?: string;
      dryRun?: boolean;
      vilbliHtml?: string;
      currentYearOfferingHtml?: string;
    };

    const professionSlug = String(body.professionSlug ?? "").trim();
    const countyCode = String(body.countyCode ?? "").trim();
    const vilbliHtml = String(body.vilbliHtml ?? "");
    const currentYearOfferingHtml =
      typeof body.currentYearOfferingHtml === "string" && body.currentYearOfferingHtml.length > 0
        ? body.currentYearOfferingHtml
        : null;

    if (!professionSlug || !countyCode || vilbliHtml.length < 10_000) {
      return NextResponse.json(
        {
          ok: false,
          error: "professionSlug, countyCode, and vilbliHtml (min 10k) are required",
        },
        { status: 400 }
      );
    }

    const bundle = await loadContourBSchedulerBundle();
    const result = await bundle.runContourBCountyRelay({
      professionSlug,
      countyCode,
      dryRun: Boolean(body.dryRun),
      vilbliHtml,
      currentYearOfferingHtml,
    });

    if (
      !body.dryRun &&
      result &&
      typeof result === "object" &&
      "ok" in result &&
      result.ok === true &&
      "action" in result &&
      result.action === "ingested"
    ) {
      void runStaleDraftRouteRecomputeBatch({
        supabase: createAdminClient(),
        scope: { professionSlug, countyCode },
        triggerReason: "truth_relay_refresh",
        maxRoutes: 60,
        concurrency: 2,
      }).catch((error) => {
        console.error("post_relay_draft_recompute_batch_failed", {
          professionSlug,
          countyCode,
          message: error instanceof Error ? error.message : String(error),
        });
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
