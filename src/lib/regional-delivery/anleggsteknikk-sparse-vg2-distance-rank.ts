/**
 * P-8 — rank sparse national VG2 schools by home-kommune distance when Entur
 * transport context only covers VG1 (buildKommuneTransportSortContext).
 *
 * Contract: phase-4-relocation-geography-contract-owner-decision-record.md TR-1…TR-2
 * — travel realism over alphabetical / adjacency-only ordering.
 */
import {
  haversineDistanceKm,
  normalizeMunicipalityCode,
} from "@/lib/planning/geo-distance";
import type { KommuneTransportSortContext } from "@/lib/planning/kommune-transport/types";
import type { AvailabilityTruthRow } from "@/server/children/routes/get-availability-truth";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Aligns with select-truth-candidate-for-route maybe radius for schools. */
export const SPARSE_VG2_MAYBE_MAX_DISTANCE_KM = 400;

/**
 * Distance-based sortRank for VG2: nearer → lower rank (preferred).
 * Stays below RANK_UNKNOWN (400) so unknown Entur rows do not outrank near schools.
 */
function distanceToSortRank(distanceKm: number): number {
  if (!Number.isFinite(distanceKm)) {
    return 399;
  }
  return Math.min(399, Math.max(0, Math.floor(distanceKm)));
}

export async function filterAndRankSparseVg2RowsByHomeDistance(params: {
  supabase: SupabaseClient;
  vg2Rows: AvailabilityTruthRow[];
  homeMunicipalityCodes: string[];
  relocationWillingness: "no" | "maybe" | "yes" | null;
}): Promise<{
  rankedRows: AvailabilityTruthRow[];
  distanceKmByInstitutionId: Map<string, number>;
}> {
  const homeCodes = Array.from(
    new Set(
      params.homeMunicipalityCodes
        .map((code) => normalizeMunicipalityCode(code))
        .filter((code): code is string => Boolean(code))
    )
  );

  if (homeCodes.length === 0 || params.vg2Rows.length === 0) {
    return {
      rankedRows: params.vg2Rows,
      distanceKmByInstitutionId: new Map(),
    };
  }

  const schoolCodes = params.vg2Rows
    .map((row) => normalizeMunicipalityCode(row.municipalityCode))
    .filter((code): code is string => Boolean(code));
  const geoLookupCodes = Array.from(new Set([...homeCodes, ...schoolCodes]));

  const { data: geoRows, error } = await params.supabase
    .from("municipality_geo_points")
    .select("municipality_code, lat, lng")
    .in("municipality_code", geoLookupCodes);

  if (error) {
    throw new Error(
      `Failed to load municipality geo points for sparse VG2 ranking: ${error.message}`
    );
  }

  const geoByCode = new Map(
    ((geoRows ?? []) as Array<{ municipality_code: string; lat: number; lng: number }>).map(
      (row) => [row.municipality_code, { lat: row.lat, lng: row.lng }]
    )
  );

  const distanceKmForMunicipality = (municipalityCode: string | null | undefined): number => {
    const code = normalizeMunicipalityCode(municipalityCode);
    if (!code) return Number.POSITIVE_INFINITY;
    const schoolPoint = geoByCode.get(code);
    if (!schoolPoint) return Number.POSITIVE_INFINITY;
    let best = Number.POSITIVE_INFINITY;
    for (const homeCode of homeCodes) {
      const homePoint = geoByCode.get(homeCode);
      if (!homePoint) continue;
      const distance = haversineDistanceKm(homePoint, schoolPoint);
      if (distance < best) best = distance;
    }
    return best;
  };

  const distanceKmByInstitutionId = new Map<string, number>();
  const scored = params.vg2Rows.map((row) => {
    const distanceKm = distanceKmForMunicipality(row.municipalityCode);
    if (row.institutionId) {
      const prev = distanceKmByInstitutionId.get(row.institutionId);
      if (prev === undefined || distanceKm < prev) {
        distanceKmByInstitutionId.set(row.institutionId, distanceKm);
      }
    }
    return { row, distanceKm };
  });

  const relocation = params.relocationWillingness ?? "no";
  const filtered =
    relocation === "maybe"
      ? scored.filter(
          (item) =>
            Number.isFinite(item.distanceKm) &&
            item.distanceKm <= SPARSE_VG2_MAYBE_MAX_DISTANCE_KM
        )
      : scored;

  // If maybe filter empties the list, fall back to ranked full set (still better than []).
  const working = filtered.length > 0 ? filtered : scored;

  working.sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return (a.row.institutionName ?? "").localeCompare(b.row.institutionName ?? "", "nb");
  });

  return {
    rankedRows: working.map((item) => item.row),
    distanceKmByInstitutionId,
  };
}

/** Inject VG2 distance ranks into transport context so programme_selection sorts nearest-first. */
export function enrichTransportSortContextWithVg2DistanceRanks(params: {
  context: KommuneTransportSortContext;
  vg2Rows: AvailabilityTruthRow[];
  distanceKmByInstitutionId: Map<string, number>;
}): KommuneTransportSortContext {
  const next = new Map(params.context.institutionReachabilityById);

  for (const row of params.vg2Rows) {
    const institutionId = row.institutionId;
    if (!institutionId) continue;
    const distanceKm =
      params.distanceKmByInstitutionId.get(institutionId) ?? Number.POSITIVE_INFINITY;
    const existing = next.get(institutionId);
    // Prefer real Entur ranks when present; only fill gaps for national VG2 seats.
    if (existing && existing.reachable !== null) {
      continue;
    }
    next.set(institutionId, {
      institutionId,
      schoolMunicipalityCode: normalizeMunicipalityCode(row.municipalityCode),
      mode: "norm_buffer",
      sortRank: distanceToSortRank(distanceKm),
      reachable: null,
      morningArrivalIso: null,
      marginMinutes: Number.isFinite(distanceKm) ? -Math.floor(distanceKm) : null,
    });
  }

  return {
    computed: true,
    institutionReachabilityById: next,
    vg1Vg2ChainInstitutionIds: params.context.vg1Vg2ChainInstitutionIds,
  };
}
