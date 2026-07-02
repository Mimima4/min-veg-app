import "server-only";

import { NextRequest, NextResponse } from "next/server";

import { runLarebedriftIngest } from "@/server/larebedrift/run-larebedrift-ingest";
import { sendOpsAlert } from "@/server/ops/send-ops-alert";
import { verifyInternalSchedulerRequest } from "@/server/vgs/verify-internal-scheduler-request";

async function maybeNotifyIngestFailure(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const notify = new URL(request.url).searchParams.get("notify") !== "false";
  if (!notify || response.status === 200 || response.status < 500) {
    return response;
  }

  const routePath = new URL(request.url).pathname;
  const payload = (await response
    .clone()
    .json()
    .catch(() => null)) as { error?: string } | null;
  const errorText = payload?.error?.trim() || "unknown error";

  await sendOpsAlert(
    `Min Veg: lærebedrift ingest failed (${routePath}, HTTP ${response.status}). ${errorText}`,
    "larebedrift-ingest"
  );
  return response;
}

export async function handleRunIngestRequest(
  request: NextRequest,
  larefagCodes?: string[]
): Promise<NextResponse> {
  if (!verifyInternalSchedulerRequest(request)) {
    return maybeNotifyIngestFailure(
      request,
      NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 })
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return maybeNotifyIngestFailure(
      request,
      NextResponse.json(
        {
          ok: false,
          error: "SUPABASE_SERVICE_ROLE_KEY is missing in deployment env (configure on Vercel).",
        },
        { status: 500 }
      )
    );
  }

  const dryRun = new URL(request.url).searchParams.get("dryRun") === "true";
  const queryCodes = new URL(request.url)
    .searchParams.getAll("larefagCode")
    .map((code) => code.trim())
    .filter(Boolean);
  const resolvedCodes =
    larefagCodes ?? (queryCodes.length > 0 ? queryCodes : undefined);

  try {
    const run = await runLarebedriftIngest({
      dryRun,
      larefagCodes: resolvedCodes,
    });
    return NextResponse.json({ ok: true, ...run });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return maybeNotifyIngestFailure(
      request,
      NextResponse.json({ ok: false, error: message }, { status: 500 })
    );
  }
}

export async function respondIngestRouteError(
  request: NextRequest,
  status: number,
  error: string
): Promise<NextResponse> {
  return maybeNotifyIngestFailure(
    request,
    NextResponse.json({ ok: false, error }, { status })
  );
}
