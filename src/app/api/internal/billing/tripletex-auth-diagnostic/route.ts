import { NextRequest, NextResponse } from "next/server";

import { createTripletexSessionToken } from "@/server/billing/tripletex-auth";

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");

  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

function basicAuth(username: string, password: string) {
  return "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
}

async function fetchJson(url: string, authHeader: string) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: authHeader,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const text = await res.text();

  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  return {
    status: res.status,
    body: json,
  };
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.BILLING_SYNC_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "BILLING_SYNC_SECRET is missing." },
      { status: 500 }
    );
  }

  const providedSecret = getBearerToken(request);

  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const baseUrl = process.env.TRIPLETEX_API_BASE_URL?.trim();
    const companyId = process.env.TRIPLETEX_COMPANY_ID?.trim();

    if (!baseUrl) {
      return NextResponse.json(
        { ok: false, error: "TRIPLETEX_API_BASE_URL is missing." },
        { status: 500 }
      );
    }

    if (!companyId) {
      return NextResponse.json(
        { ok: false, error: "TRIPLETEX_COMPANY_ID is missing." },
        { status: 500 }
      );
    }

    const sessionToken = await createTripletexSessionToken();

    const authCompany = basicAuth(companyId, sessionToken);

    const whoAmICompany = await fetchJson(
      `${baseUrl}/token/session/whoAmI`,
      authCompany
    );

    const withLoginAccessCompany = await fetchJson(
      `${baseUrl}/company/withLoginAccess`,
      authCompany
    );

    return NextResponse.json({
      ok: true,
      result: {
        sessionTokenPreview: sessionToken.slice(0, 8) + "...",
        companyId,
        companyUsername: {
          whoAmI: whoAmICompany,
          withLoginAccess: withLoginAccessCompany,
        },
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Tripletex auth diagnostic error.";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
