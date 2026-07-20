import { MAYBE_PT_REACH_POLICY_VERSION } from "@/lib/planning/kommune-transport/constants";
import type { MaybeReachVerdict } from "@/lib/planning/kommune-transport/evaluate-maybe-reach";
import type { SupabaseClient } from "@supabase/supabase-js";

type CacheRow = {
  admitted: boolean;
  soft: boolean;
  pt_network_km: number | null;
  duration_sec: number | null;
  reason: string;
};

let tableMissingLogged = false;

function isMissingTableError(message: string): boolean {
  return /relocation_maybe_pt_reach_cache|schema cache|does not exist/i.test(message);
}

export async function readMaybePtReachCache(params: {
  supabase: SupabaseClient;
  homeMunicipalityCode: string;
  schoolMunicipalityCode: string;
}): Promise<MaybeReachVerdict | null> {
  const { data, error } = await params.supabase
    .from("relocation_maybe_pt_reach_cache")
    .select("admitted, soft, pt_network_km, duration_sec, reason")
    .eq("home_municipality_code", params.homeMunicipalityCode)
    .eq("school_municipality_code", params.schoolMunicipalityCode)
    .eq("policy_version", MAYBE_PT_REACH_POLICY_VERSION)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) {
      if (!tableMissingLogged) {
        tableMissingLogged = true;
        console.error(
          "[maybe-pt-reach] cache table missing — fail-open to live Entur (apply migration 20260721120000)"
        );
      }
      return null;
    }
    console.error("[maybe-pt-reach] cache read failed", error.message);
    return null;
  }
  if (!data) return null;
  const row = data as CacheRow;
  return {
    admitted: Boolean(row.admitted),
    soft: Boolean(row.soft),
    ptNetworkKm:
      typeof row.pt_network_km === "number" && Number.isFinite(row.pt_network_km)
        ? row.pt_network_km
        : null,
    durationSec:
      typeof row.duration_sec === "number" && Number.isFinite(row.duration_sec)
        ? row.duration_sec
        : null,
    reason: row.reason as MaybeReachVerdict["reason"],
    policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
  };
}

export async function writeMaybePtReachCache(params: {
  supabase: SupabaseClient;
  homeMunicipalityCode: string;
  schoolMunicipalityCode: string;
  verdict: MaybeReachVerdict;
}): Promise<void> {
  const { error } = await params.supabase.from("relocation_maybe_pt_reach_cache").upsert(
    {
      home_municipality_code: params.homeMunicipalityCode,
      school_municipality_code: params.schoolMunicipalityCode,
      policy_version: MAYBE_PT_REACH_POLICY_VERSION,
      admitted: params.verdict.admitted,
      soft: params.verdict.soft,
      pt_network_km: params.verdict.ptNetworkKm,
      duration_sec: params.verdict.durationSec,
      reason: params.verdict.reason,
      computed_at: new Date().toISOString(),
    },
    { onConflict: "home_municipality_code,school_municipality_code,policy_version" }
  );
  if (error && !isMissingTableError(error.message)) {
    console.error("[maybe-pt-reach] cache write failed", error.message);
  }
}
