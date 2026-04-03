import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length).trim();
  }

  return null;
}

type RequestBody = {
  familyAccountId?: string;
  grantType?: "fixed_period" | "until_date" | "permanent";
  planCode?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  reason?: string | null;
  notes?: string | null;
};

export async function POST(request: NextRequest) {
  const authToken = getAuthToken(request);

  if (authToken !== process.env.BILLING_SYNC_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const familyAccountId = body.familyAccountId?.trim();
  const grantType = body.grantType ?? "fixed_period";
  const planCode = body.planCode?.trim() || null;
  const startsAt = body.startsAt?.trim() || new Date().toISOString();
  const endsAt = body.endsAt?.trim() || null;
  const reason = body.reason?.trim() || null;
  const notes = body.notes?.trim() || null;

  if (!familyAccountId) {
    return NextResponse.json(
      { ok: false, error: "familyAccountId is required." },
      { status: 400 }
    );
  }

  if (
    grantType !== "fixed_period" &&
    grantType !== "until_date" &&
    grantType !== "permanent"
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid grantType." },
      { status: 400 }
    );
  }

  if (grantType !== "permanent" && !endsAt) {
    return NextResponse.json(
      { ok: false, error: "endsAt is required for non-permanent grants." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  try {
    const { data, error } = await admin
      .from("complimentary_access_grants")
      .insert({
        family_account_id: familyAccountId,
        grant_type: grantType,
        plan_code: planCode,
        status: "active",
        starts_at: startsAt,
        ends_at: grantType === "permanent" ? null : endsAt,
        issued_by_type: "platform_admin",
        reason,
        notes,
        superseded_by_paid_access: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: `Failed to issue complimentary grant: ${error.message}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      grant: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown complimentary grant issue error.",
      },
      { status: 500 }
    );
  }
}