import "server-only";

import path from "node:path";
import { pathToFileURL } from "node:url";
import { NextRequest, NextResponse } from "next/server";
import { runContourBOperationalScheduler } from "@/server/vgs/run-contour-b-operational-scheduler";
import { verifyInternalSchedulerRequest } from "@/server/vgs/verify-internal-scheduler-request";

/** Vercel Cron uses GET; allow POST for operator tools. */
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function parseDryRun(request: NextRequest): boolean {
  const url = new URL(request.url);
  return url.searchParams.get("dryRun") === "true";
}

async function handle(request: NextRequest) {
  if (!verifyInternalSchedulerRequest(request)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "SUPABASE_SERVICE_ROLE_KEY is missing in deployment env (configure on Vercel, not GitHub).",
      },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const vilbliProbeCounty = url.searchParams.get("vilbliProbe")?.trim();
  if (vilbliProbeCounty) {
    const bundlePath = path.join(
      process.cwd(),
      "src/server/vgs/generated/contour-b-scheduler.bundle.mjs"
    );
    const bundle = await import(pathToFileURL(bundlePath).href);
    const probe = await bundle.probeVilbliCounty({
      professionSlug: url.searchParams.get("profession") ?? "electrician",
      countyCode: vilbliProbeCounty,
    });
    return NextResponse.json({ ok: true, probe });
  }

  const profession = url.searchParams.get("profession") ?? undefined;
  const county = url.searchParams.get("county") ?? undefined;
  const dryRun = parseDryRun(request);

  const result = await runContourBOperationalScheduler({
    dryRun,
    profession,
    county,
  });

  if (result.exitCode !== 0) {
    return NextResponse.json(
      {
        ok: false,
        exitCode: result.exitCode,
        summary: result.summary,
        results: result.results,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    summary: result.summary,
    results: result.results,
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
