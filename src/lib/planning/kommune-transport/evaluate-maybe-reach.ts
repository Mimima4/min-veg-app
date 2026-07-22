/**
 * Relocation `maybe` admit — Entur bus+rail network km soft band (700/800);
 * Troms/Finnmark/Nordland homes also admit via air (8–12h duration).
 * Owner: phase-4-relocation-maybe-public-transport-reach-owner-draft.md (amended 2026-07-22)
 */
import { normalizeFylkeCodesFromMunicipalityCodes } from "@/lib/planning/norway-geo-code-normalization";
import {
  NORTH_ZONE_FRIENDLY_FYLKE_CODES,
  NORTH_ZONE_HOME_FYLKE_CODES,
} from "@/lib/planning/school-geography-scope";
import {
  MAYBE_AIR_HARD_MAX_DURATION_SEC,
  MAYBE_AIR_SOFT_MAX_DURATION_SEC,
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

/** Troms + Finnmark + Nordland — reduced student air fares / education access. */
export const MAYBE_AIR_HOME_FYLKE_CODES = new Set([
  ...NORTH_ZONE_HOME_FYLKE_CODES,
  ...NORTH_ZONE_FRIENDLY_FYLKE_CODES,
]);

export type MaybeReachReason =
  | "normal"
  | "soft"
  | "air_north"
  | "air_north_soft"
  | "same_kommune"
  | "denied_over_hard_max"
  | "denied_no_pt"
  | "denied_air_or_car"
  | "denied_hub_unresolved"
  | "denied_air_over_duration";

export type MaybeReachVerdict = {
  admitted: boolean;
  soft: boolean;
  /** True when admit used an air leg (north homes only). */
  viaAir: boolean;
  ptNetworkKm: number | null;
  durationSec: number | null;
  reason: MaybeReachReason;
  policyVersion: string;
};

const GROUND_PT_MODES = new Set([
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

const NEVER_ALLOWED_MODES = new Set(["car", "taxi"]);

function normalizeMode(mode: string | undefined): string {
  return String(mode ?? "")
    .trim()
    .toLowerCase();
}

export function homeAllowsMaybeAir(homeMunicipalityCode: string): boolean {
  const fylkes = normalizeFylkeCodesFromMunicipalityCodes([homeMunicipalityCode]);
  return fylkes.some((code) => MAYBE_AIR_HOME_FYLKE_CODES.has(code));
}

export function patternHasCarOrTaxi(pattern: EnturTripPattern): boolean {
  return (pattern.legs ?? []).some((leg) => NEVER_ALLOWED_MODES.has(normalizeMode(leg.mode)));
}

export function patternHasAir(pattern: EnturTripPattern): boolean {
  return (pattern.legs ?? []).some((leg) => normalizeMode(leg.mode) === "air");
}

/** True if pattern is unusable for ground-only maybe (air/car). */
export function patternHasForbiddenMode(pattern: EnturTripPattern): boolean {
  return (pattern.legs ?? []).some((leg) => {
    const mode = normalizeMode(leg.mode);
    return mode === "air" || NEVER_ALLOWED_MODES.has(mode);
  });
}

function sumModeNetworkKm(pattern: EnturTripPattern, modes: Set<string>): number | null {
  let metres = 0;
  let counted = 0;
  for (const leg of pattern.legs ?? []) {
    const mode = normalizeMode(leg.mode);
    if (!modes.has(mode)) continue;
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

/**
 * Sum travelled network km on ground PT legs. Returns null if air/car present
 * or distances missing.
 */
export function sumAllowedPtNetworkKm(pattern: EnturTripPattern): number | null {
  if (patternHasForbiddenMode(pattern)) return null;
  return sumModeNetworkKm(pattern, GROUND_PT_MODES);
}

/** Ground + air distance (connectors + flight) for north-air patterns. */
export function sumAirInclusiveNetworkKm(pattern: EnturTripPattern): number | null {
  if (patternHasCarOrTaxi(pattern)) return null;
  if (!patternHasAir(pattern)) return null;
  const modes = new Set([...GROUND_PT_MODES, "air"]);
  return sumModeNetworkKm(pattern, modes);
}

export function classifyMaybePtNetworkKm(ptNetworkKm: number): MaybeReachVerdict {
  if (!Number.isFinite(ptNetworkKm) || ptNetworkKm < 0) {
    return {
      admitted: false,
      soft: false,
      viaAir: false,
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
      viaAir: false,
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
      viaAir: false,
      ptNetworkKm,
      durationSec: null,
      reason: "soft",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
  return {
    admitted: false,
    soft: false,
    viaAir: false,
    ptNetworkKm,
    durationSec: null,
    reason: "denied_over_hard_max",
    policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
  };
}

export function classifyMaybeAirDuration(durationSec: number): MaybeReachVerdict {
  if (!Number.isFinite(durationSec) || durationSec < 0) {
    return {
      admitted: false,
      soft: false,
      viaAir: true,
      ptNetworkKm: null,
      durationSec: null,
      reason: "denied_no_pt",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
  if (durationSec <= MAYBE_AIR_SOFT_MAX_DURATION_SEC) {
    return {
      admitted: true,
      soft: true,
      viaAir: true,
      ptNetworkKm: null,
      durationSec,
      reason: "air_north",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
  if (durationSec <= MAYBE_AIR_HARD_MAX_DURATION_SEC) {
    return {
      admitted: true,
      soft: true,
      viaAir: true,
      ptNetworkKm: null,
      durationSec,
      reason: "air_north_soft",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
  return {
    admitted: false,
    soft: false,
    viaAir: true,
    ptNetworkKm: null,
    durationSec,
    reason: "denied_air_over_duration",
    policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
  };
}

/** Pick best usable ground pattern: min PT network km. */
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

/** Pick shortest-duration air-inclusive pattern (no car/taxi). */
export function pickBestMaybeAirPattern(patterns: EnturTripPattern[]): {
  pattern: EnturTripPattern;
  durationSec: number;
  networkKm: number | null;
} | null {
  let best: {
    pattern: EnturTripPattern;
    durationSec: number;
    networkKm: number | null;
  } | null = null;
  for (const pattern of patterns) {
    if (patternHasCarOrTaxi(pattern)) continue;
    if (!patternHasAir(pattern)) continue;
    const durationSec = pattern.duration;
    if (!Number.isFinite(durationSec) || durationSec < 0) continue;
    const networkKm = sumAirInclusiveNetworkKm(pattern);
    if (!best || durationSec < best.durationSec) {
      best = { pattern, durationSec, networkKm };
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
    numTripPatterns: 8,
  });
}

export function verdictFromPatterns(
  patterns: EnturTripPattern[],
  options?: { allowAir?: boolean }
): MaybeReachVerdict {
  if (patterns.length === 0) {
    return {
      admitted: false,
      soft: false,
      viaAir: false,
      ptNetworkKm: null,
      durationSec: null,
      reason: "denied_no_pt",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }

  const ground = pickBestMaybePtPattern(patterns);
  if (ground) {
    const classified = classifyMaybePtNetworkKm(ground.ptNetworkKm);
    return {
      ...classified,
      durationSec: Number.isFinite(ground.pattern.duration) ? ground.pattern.duration : null,
    };
  }

  if (options?.allowAir) {
    const air = pickBestMaybeAirPattern(patterns);
    if (air) {
      const classified = classifyMaybeAirDuration(air.durationSec);
      return {
        ...classified,
        ptNetworkKm: air.networkKm,
      };
    }
  }

  if (patterns.some((p) => patternHasAir(p)) && !options?.allowAir) {
    return {
      admitted: false,
      soft: false,
      viaAir: false,
      ptNetworkKm: null,
      durationSec: null,
      reason: "denied_air_or_car",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }

  return {
    admitted: false,
    soft: false,
    viaAir: false,
    ptNetworkKm: null,
    durationSec: null,
    reason: "denied_no_pt",
    policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
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
 * Troms/Finnmark/Nordland homes: ground PT first, then air by duration.
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
      viaAir: false,
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
      viaAir: false,
      ptNetworkKm: 0,
      durationSec: 0,
      reason: "same_kommune",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }

  const allowAir = homeAllowsMaybeAir(home);

  try {
    const [fromHub, toHub] = await Promise.all([
      resolveHubStopPlaceForMunicipalityCode(home),
      resolveHubStopPlaceForMunicipalityCode(school),
    ]);
    if (!fromHub || !toHub) {
      return {
        admitted: false,
        soft: false,
        viaAir: false,
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
    // Expected denials are common on sparse/long routes — do not spam server logs.
    return verdictFromPatterns(patterns, { allowAir });
  } catch (error) {
    // Entur miss / timeout → deny; avoid console spam on expected sparse pairs.
    void error;
    return {
      admitted: false,
      soft: false,
      viaAir: false,
      ptNetworkKm: null,
      durationSec: null,
      reason: "denied_no_pt",
      policyVersion: MAYBE_PT_REACH_POLICY_VERSION,
    };
  }
}

/**
 * Sort key: normal ground → soft ground → north air (by duration).
 * Air always sorts after ground PT admits.
 */
export function maybeReachSortKey(verdict: MaybeReachVerdict): number {
  if (!verdict.admitted) return Number.POSITIVE_INFINITY;
  if (verdict.viaAir) {
    const durationHours =
      typeof verdict.durationSec === "number" && Number.isFinite(verdict.durationSec)
        ? verdict.durationSec / 3600
        : Number.POSITIVE_INFINITY;
    return MAYBE_PT_HARD_MAX_KM * 2 + durationHours;
  }
  const km = verdict.ptNetworkKm ?? Number.POSITIVE_INFINITY;
  return (verdict.soft ? MAYBE_PT_HARD_MAX_KM : 0) + km;
}
