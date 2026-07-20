/**
 * Relocation `maybe` admit — Entur bus+rail network km soft band.
 * Owner lock: phase-4-relocation-maybe-public-transport-reach-owner-draft.md (2026-07-21).
 */
import {
  MAYBE_PT_HARD_MAX_KM,
  MAYBE_PT_REACH_POLICY_VERSION,
  MAYBE_PT_SOFT_MAX_KM,
} from "./constants";
import {
  planEnturTrip,
  resolveKommuneHubStopPlaceId,
} from "./entur-client";
import { formatReferenceDateTimeIso, nextMondayUtc } from "./school-start-time";
import type { EnturTripPattern } from "./types";

export type MaybeReachReason =
  | "normal"
  | "soft"
  | "same_kommune"
  | "denied_over_hard_max"
  | "denied_no_pt"
  | "denied_air_or_car"
  | "denied_hub_unresolved";

export type MaybeReachVerdict = {
  admitted: boolean;
  soft: boolean;
  ptNetworkKm: number | null;
  durationSec: number | null;
  reason: MaybeReachReason;
  policyVersion: string;
};

const ALLOWED_PT_MODES = new Set([
  "rail",
  "bus",
  "coach",
  "metro",
  "tram",
  "water",
  "ferry",
  "foot",
  "bicycle",
]);

const FORBIDDEN_MODES = new Set(["air", "car", "taxi"]);

function normalizeMode(mode: string | undefined): string {
  return String(mode ?? "")
    .trim()
    .toLowerCase();
}

/** True if pattern contains air/car (not usable for maybe admit). */
export function patternHasForbiddenMode(pattern: EnturTripPattern): boolean {
  return (pattern.legs ?? []).some((leg) => FORBIDDEN_MODES.has(normalizeMode(leg.mode)));
}

/**
 * Sum travelled network km on allowed PT legs. Returns null if distances missing
 * or pattern has no allowed legs with distance.
 */
export function sumAllowedPtNetworkKm(pattern: EnturTripPattern): number | null {
  if (patternHasForbiddenMode(pattern)) return null;
  let metres = 0;
  let counted = 0;
  for (const leg of pattern.legs ?? []) {
    const mode = normalizeMode(leg.mode);
    if (!ALLOWED_PT_MODES.has(mode)) continue;
    const distance = leg.distance;
    if (typeof distance !== "number" || !Number.isFinite(distance) || distance < 0) {
      continue;
    }
    metres += distance;
    counted += 1;
  }
  if (counted === 0) return null;
  return metres / 1000;
}

export function classifyMaybePtNetworkKm(ptNetworkKm: number): MaybeReachVerdict {
  if (!Number.isFinite(ptNetworkKm) || ptNetworkKm < 0) {
    return {
      admitted: false,
      soft: false,
      ptNetworkKm: null,
      durationSec: null,
      reason: "denied_no_pt",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
  if (ptNetworkKm <= MAYBE_PT_SOFT_MAX_KM) {
    return {
      admitted: true,
      soft: false,
      ptNetworkKm,
      durationSec: null,
      reason: "normal",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
  if (ptNetworkKm <= MAYBE_PT_HARD_MAX_KM) {
    return {
      admitted: true,
      soft: true,
      ptNetworkKm,
      durationSec: null,
      reason: "soft",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
  return {
    admitted: false,
    soft: false,
    ptNetworkKm,
    durationSec: null,
    reason: "denied_over_hard_max",
    policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
  };
}

/** Pick best usable pattern: min PT network km among allowed patterns. */
export function pickBestMaybePtPattern(patterns: EnturTripPattern[]): {
  pattern: EnturTripPattern;
  ptNetworkKm: number;
} | null {
  let best: { pattern: EnturTripPattern; ptNetworkKm: number } | null = null;
  for (const pattern of patterns) {
    if (patternHasForbiddenMode(pattern)) continue;
    const km = sumAllowedPtNetworkKm(pattern);
    if (km === null) continue;
    if (!best || km < best.ptNetworkKm) {
      best = { pattern, ptNetworkKm: km };
    }
  }
  return best;
}

export async function planMaybePtBetweenHubs(params: {
  fromStopPlaceId: string;
  toStopPlaceId: string;
  referenceDate?: Date;
}): Promise<EnturTripPattern[]> {
  const referenceDate = params.referenceDate ?? nextMondayUtc();
  const dateTimeIso = formatReferenceDateTimeIso({
    referenceDate,
    hour: 10,
    minute: 0,
  });
  return planEnturTrip({
    fromStopPlaceId: params.fromStopPlaceId,
    toStopPlaceId: params.toStopPlaceId,
    arriveBy: false,
    dateTimeIso,
    numTripPatterns: 6,
  });
}

export function verdictFromPatterns(patterns: EnturTripPattern[]): MaybeReachVerdict {
  if (patterns.length === 0) {
    return {
      admitted: false,
      soft: false,
      ptNetworkKm: null,
      durationSec: null,
      reason: "denied_no_pt",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
  const onlyForbidden = patterns.every((p) => patternHasForbiddenMode(p));
  if (onlyForbidden) {
    return {
      admitted: false,
      soft: false,
      ptNetworkKm: null,
      durationSec: null,
      reason: "denied_air_or_car",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
  const best = pickBestMaybePtPattern(patterns);
  if (!best) {
    return {
      admitted: false,
      soft: false,
      ptNetworkKm: null,
      durationSec: null,
      reason: "denied_no_pt",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
  const classified = classifyMaybePtNetworkKm(best.ptNetworkKm);
  return {
    ...classified,
    durationSec: Number.isFinite(best.pattern.duration) ? best.pattern.duration : null,
  };
}

const GEONORGE_KOMMUNE_URL = "https://ws.geonorge.no/kommuneinfo/v1/kommuner";
const municipalityNameCache = new Map<string, string | null>();
const hubIdCache = new Map<string, string | null>();
const municipalityGeoCache = new Map<string, { lat: number; lng: number } | null>();

type KommuneDetail = {
  kommunenavnNorsk?: string;
  kommunenavn?: string;
  punktIOmrade?: { coordinates?: number[] };
};

async function fetchKommuneDetail(code: string): Promise<KommuneDetail | null> {
  try {
    const response = await fetch(`${GEONORGE_KOMMUNE_URL}/${code}`);
    if (!response.ok) return null;
    return (await response.json()) as KommuneDetail;
  } catch {
    return null;
  }
}

function centroidFromDetail(detail: KommuneDetail | null): { lat: number; lng: number } | null {
  const coords = detail?.punktIOmrade?.coordinates;
  const lng = Array.isArray(coords) ? Number(coords[0]) : NaN;
  const lat = Array.isArray(coords) ? Number(coords[1]) : NaN;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export async function resolveMunicipalityNameForMaybeReach(
  municipalityCode: string
): Promise<string | null> {
  const code = municipalityCode.trim();
  if (!code) return null;
  if (municipalityNameCache.has(code)) return municipalityNameCache.get(code) ?? null;
  const detail = await fetchKommuneDetail(code);
  const name = detail?.kommunenavnNorsk ?? detail?.kommunenavn ?? null;
  municipalityNameCache.set(code, name);
  if (!municipalityGeoCache.has(code)) {
    municipalityGeoCache.set(code, centroidFromDetail(detail));
  }
  return name;
}

export async function resolveHubStopPlaceForMunicipalityCode(
  municipalityCode: string
): Promise<string | null> {
  const code = municipalityCode.trim();
  if (!code) return null;
  if (hubIdCache.has(code)) return hubIdCache.get(code) ?? null;
  const name = await resolveMunicipalityNameForMaybeReach(code);
  if (!name) {
    hubIdCache.set(code, null);
    return null;
  }
  let centroid = municipalityGeoCache.get(code) ?? null;
  if (centroid === undefined || centroid === null) {
    const detail = await fetchKommuneDetail(code);
    centroid = centroidFromDetail(detail);
    municipalityGeoCache.set(code, centroid);
  }
  const hubId = await resolveKommuneHubStopPlaceId({
    municipalityName: name,
    focusLat: centroid?.lat ?? null,
    focusLng: centroid?.lng ?? null,
  });
  hubIdCache.set(code, hubId);
  return hubId;
}

/**
 * Live Entur evaluation home kommune → school kommune.
 * Same kommune → admitted (no travel). Failures → deny + reason (no haversine rescue).
 */
export async function evaluateMaybeReachBetweenMunicipalities(params: {
  homeMunicipalityCode: string;
  schoolMunicipalityCode: string;
}): Promise<MaybeReachVerdict> {
  const home = params.homeMunicipalityCode.trim();
  const school = params.schoolMunicipalityCode.trim();
  if (!home || !school) {
    return {
      admitted: false,
      soft: false,
      ptNetworkKm: null,
      durationSec: null,
      reason: "denied_hub_unresolved",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
  if (home === school) {
    return {
      admitted: true,
      soft: false,
      ptNetworkKm: 0,
      durationSec: 0,
      reason: "same_kommune",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }

  try {
    const [fromHub, toHub] = await Promise.all([
      resolveHubStopPlaceForMunicipalityCode(home),
      resolveHubStopPlaceForMunicipalityCode(school),
    ]);
    if (!fromHub || !toHub) {
      console.error(
        `[maybe-pt-reach] denied_hub_unresolved home=${home} school=${school} from=${fromHub} to=${toHub}`
      );
      return {
        admitted: false,
        soft: false,
        ptNetworkKm: null,
        durationSec: null,
        reason: "denied_hub_unresolved",
        policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
      };
    }

    const patterns = await planMaybePtBetweenHubs({
      fromStopPlaceId: fromHub,
      toStopPlaceId: toHub,
    });
    const verdict = verdictFromPatterns(patterns);
    if (!verdict.admitted) {
      console.error(
        `[maybe-pt-reach] ${verdict.reason} home=${home} school=${school} km=${verdict.ptNetworkKm}`
      );
    }
    return verdict;
  } catch (error) {
    console.error(
      `[maybe-pt-reach] denied_no_pt home=${home} school=${school}`,
      error instanceof Error ? error.message : error
    );
    return {
      admitted: false,
      soft: false,
      ptNetworkKm: null,
      durationSec: null,
      reason: "denied_no_pt",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
}

/** Sort key: soft admits after normal; then by PT km. */
export function maybeReachSortKey(verdict: MaybeReachVerdict): number {
  if (!verdict.admitted) return Number.POSITIVE_INFINITY;
  const km = verdict.ptNetworkKm ?? Number.POSITIVE_INFINITY;
  return (verdict.soft ? MAYBE_PT_HARD_MAX_KM : 0) + km;
}
