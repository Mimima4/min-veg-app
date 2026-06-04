import "server-only";

import type { NextRequest } from "next/server";

function bearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length).trim();
}

/**
 * Internal scheduler auth — no Supabase keys in GitHub.
 * Vercel Cron: set CRON_SECRET in Vercel env (Vercel sends Bearer on invoke).
 * Manual / external cron: same value via Bearer or x-internal-secret, or reuse BILLING_SYNC_SECRET.
 */
export function verifyInternalSchedulerRequest(request: NextRequest): boolean {
  const token =
    bearerToken(request) ?? request.headers.get("x-internal-secret")?.trim() ?? "";

  const cronSecret = process.env.CRON_SECRET?.trim();
  const billingSecret = process.env.BILLING_SYNC_SECRET?.trim();

  if (cronSecret && token === cronSecret) return true;
  if (billingSecret && token === billingSecret) return true;
  return false;
}
