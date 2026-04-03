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
  grantId?: string;
  reason?: string | null;
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

  const grantId = body.grantId?.trim();
  const reason = body.reason?.trim() || null;

  if (!grantId) {
    return NextResponse.json(
      { ok: false, error: "grantId is required." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: existingGrant, error: existingGrantError } = await admin
    .from("complimentary_access_grants")
    .select("id, notes")
    .eq("id", grantId)
    .maybeSingle();

  if (existingGrantError) {
    return NextResponse.json(
      {
        ok: false,
        error: `Failed to load complimentary grant: ${existingGrantError.message}`,
      },
      { status: 500 }
    );
  }

  if (!existingGrant) {
    return NextResponse.json(
      { ok: false, error: "Grant not found." },
      { status: 404 }
    );
  }

  let nextNotes = existingGrant.notes ?? null;

  if (reason) {
    const revokeLine = `Revoked: ${reason}`;

    if (!nextNotes || !nextNotes.includes(revokeLine)) {
      nextNotes = [nextNotes, revokeLine].filter(Boolean).join("\n");
    }
  }

  const { data, error } = await admin
    .from("complimentary_access_grants")
    .update({
      status: "revoked",
      updated_at: new Date().toISOString(),
      notes: nextNotes,
    })
    .eq("id", grantId)
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: `Failed to revoke complimentary grant: ${error.message}`,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    grant: data,
  });
}