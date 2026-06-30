import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cloud freshness watchdog for the Vilbli-sourced PSA snapshot.
 *
 * The Vilbli relay itself stays a home-IP / launchd job (Vilbli blocks datacenter
 * IPs), refreshing `programme_school_availability` every ~6 months. This watchdog
 * does NOT fetch Vilbli — it only reads the latest snapshot timestamp from our DB
 * and reminds the owner (optional webhook) when the snapshot is older than the
 * staleness threshold. Read-only; no writes, no relay, no Mac dependency.
 *
 * Threshold defaults to 6-month cadence + ~1 month grace; override with
 * `PSA_SNAPSHOT_STALE_DAYS`. Reminder delivery is optional via
 * `OPS_ALERT_WEBHOOK_URL` (Slack/Discord-compatible incoming webhook); when unset
 * the status is still returned and a console warning is logged.
 */

const DEFAULT_STALE_DAYS = 210;
const VILBLI_SOURCE = "vilbli";

export type PsaSnapshotFreshness = {
  source: string;
  latestVerifiedAt: string | null;
  ageDays: number | null;
  thresholdDays: number;
  stale: boolean;
  activeRowCount: number;
  notified: boolean;
};

function resolveThresholdDays(): number {
  const raw = Number.parseInt(process.env.PSA_SNAPSHOT_STALE_DAYS?.trim() ?? "", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_STALE_DAYS;
}

function ageInDays(isoTimestamp: string, now: Date): number {
  const then = new Date(isoTimestamp).getTime();
  return Math.floor((now.getTime() - then) / (1000 * 60 * 60 * 24));
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing env ${name}`);
  return value;
}

async function sendReminder(message: string): Promise<boolean> {
  const webhookUrl = process.env.OPS_ALERT_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    console.warn(`[psa-watchdog] ${message} (no OPS_ALERT_WEBHOOK_URL configured)`);
    return false;
  }
  try {
    // `text` (Slack) + `content` (Discord) so one URL works for either provider.
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: message, content: message }),
    });
    if (!response.ok) {
      console.warn(`[psa-watchdog] webhook returned ${response.status}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn(
      `[psa-watchdog] webhook failed: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
}

export async function checkPsaSnapshotFreshness(params: {
  supabase?: SupabaseClient;
  notify?: boolean;
  now?: Date;
} = {}): Promise<PsaSnapshotFreshness> {
  const now = params.now ?? new Date();
  const thresholdDays = resolveThresholdDays();
  const notify = params.notify ?? true;

  const supabase =
    params.supabase ??
    createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

  const { count, error: countError } = await supabase
    .from("programme_school_availability")
    .select("id", { count: "exact", head: true })
    .eq("source", VILBLI_SOURCE)
    .eq("is_active", true);
  if (countError) throw new Error(`watchdog count failed: ${countError.message}`);

  const { data: latest, error: latestError } = await supabase
    .from("programme_school_availability")
    .select("last_verified_at")
    .eq("source", VILBLI_SOURCE)
    .eq("is_active", true)
    .order("last_verified_at", { ascending: false })
    .limit(1);
  if (latestError) throw new Error(`watchdog latest failed: ${latestError.message}`);

  const latestVerifiedAt = latest?.[0]?.last_verified_at
    ? new Date(latest[0].last_verified_at).toISOString()
    : null;
  const ageDays = latestVerifiedAt ? ageInDays(latestVerifiedAt, now) : null;
  // No snapshot at all is also a "stale" condition worth a reminder.
  const stale = ageDays === null || ageDays > thresholdDays;

  let notified = false;
  if (stale && notify) {
    const ageLabel = ageDays === null ? "no snapshot found" : `${ageDays} days old`;
    notified = await sendReminder(
      `Min Veg: Vilbli PSA snapshot is stale (${ageLabel}, threshold ${thresholdDays}d). ` +
        `Run the home-IP relay: \`npm run ops:scheduled\`.`
    );
  }

  return {
    source: VILBLI_SOURCE,
    latestVerifiedAt,
    ageDays,
    thresholdDays,
    stale,
    activeRowCount: count ?? 0,
    notified,
  };
}
