import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ingestAdmissionRealismBaseline } from "@/server/admission/ingest-admission-realism-baseline";

/**
 * One-shot baseline ingest for route_admission_realism_records (Samordna-class doctor coverage).
 * Requires the same internal secret pattern as other internal maintenance routes.
 */
export async function POST(req: Request) {
  const internalSecret = req.headers.get("x-internal-secret");
  const hasValidInternalSecret =
    Boolean(process.env.BILLING_SYNC_SECRET) &&
    internalSecret === process.env.BILLING_SYNC_SECRET;

  if (!hasValidInternalSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "unauthorized",
          message: "Invalid or missing x-internal-secret",
        },
      },
      { status: 401 }
    );
  }

  try {
    const supabase = createAdminClient();
    const result = await ingestAdmissionRealismBaseline({ supabase });

    return NextResponse.json({
      ok: true,
      inserted: result.inserted,
      updated: result.updated,
      meta: {
        modelVersion: "admission_realism_baseline_v1",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "ingest_failed",
          message,
        },
      },
      { status: 500 }
    );
  }
}
