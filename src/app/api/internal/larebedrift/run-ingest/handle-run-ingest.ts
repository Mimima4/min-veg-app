import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { runLarebedriftIngest } from "@/server/larebedrift/run-larebedrift-ingest";
import { verifyInternalSchedulerRequest } from "@/server/vgs/verify-internal-scheduler-request";

export async function handleRunIngestRequest(
  request: NextRequest,
  larefagCodes?: string[]
): Promise<NextResponse> {
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
  const queryCodes = new URL(request.url)
    .searchParams.getAll("larefagCode")
    .map((code) => code.trim())
    .filter(Boolean);
  const resolvedCodes =
    larefagCodes ?? (queryCodes.length > 0 ? queryCodes : undefined);

  const run = await runLarebedriftIngest({
    dryRun,
    larefagCodes: resolvedCodes,
  });
  return NextResponse.json({ ok: true, ...run });
}
