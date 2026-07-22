/**
 * P-8 — rank / filter sparse national VG2 schools for relocation geography.
 *
 * `maybe`: Entur bus+rail network km soft band (700/800) — owner lock 2026-07-22.
 * `yes`: haversine nearest-first (all sparse seats).
 * Contract: phase-4-relocation-maybe-public-transport-reach-owner-draft.md
 */
import {
  haversineDistanceKm,
  normalizeMunicipalityCode,
} from "@/lib/planning/geo-distance";
import {
  evaluateMaybeReachBetweenMunicipalities,
  maybeReachSortKey,
  type MaybeReachVerdict,
} from "@/lib/planning/kommune-transport/evaluate-maybe-reach";
import type { KommuneTransportSortContext } from "@/lib/planning/kommune-transport/types";
import {
  readMaybePtReachCache,
  writeMaybePtReachCache,
} from "@/lib/planning/kommune-transport/maybe-pt-reach-cache";
import type { AvailabilityTruthRow } from "@/server/children/routes/get-availability-truth";
import type { SupabaseClient } from "@supabase/supabase-js";

/** @deprecated Prefer MAYBE_PT_SOFT_MAX_KM — kept as export alias for smokes/docs. */
export const SPARSE_VG2_MAYBE_MAX_DISTANCE_KM = 700;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;
  async function run(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]!);
    }
  }
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => run());
  await Promise.all(runners);
  return results;
}

async function resolveMaybeVerdict(params: {
  supabase: SupabaseClient;
  homeMunicipalityCode: string;
  schoolMunicipalityCode: string;
}): Promise<MaybeReachVerdict> {
  const cached = await readMaybePtReachCache({
    supabase: params.supabase,
    homeMunicipalityCode: params.homeMunicipalityCode,
    schoolMunicipalityCode: params.schoolMunicipalityCode,
  });
  if (cached) return cached;

  const verdict = await evaluateMaybeReachBetweenMunicipalities({
    homeMunicipalityCode: params.homeMunicipalityCode,
    schoolMunicipalityCode: params.schoolMunicipalityCode,
  });
  await writeMaybePtReachCache({
    supabase: params.supabase,
    homeMunicipalityCode: params.homeMunicipalityCode,
    schoolMunicipalityCode: params.schoolMunicipalityCode,
    verdict,
  });
  return verdict;
}

/**
 * Distance-based sortRank for VG2: nearer → lower rank (preferred).
 * Soft admits sit above 550 so they sort after normal admits.
 * Stays conceptually below RANK_NOT_REACHABLE (800).
 */
function distanceToSortRank(distanceKm: number, soft: boolean): number {
  if (!Number.isFinite(distanceKm)) {
    return 399;
  }
  const base = Math.min(399, Math.max(0, Math.floor(distanceKm)));
  return soft ? Math.min(799, 550 + base) : base;
}

export async function filterAndRankSparseVg2RowsByHomeDistance(params: {
  supabase: SupabaseClient;
  vg2Rows: AvailabilityTruthRow[];
  homeMunicipalityCodes: string[];
  relocationWillingness: "no" | "maybe" | "yes" | null;
}): Promise<{
  rankedRows: AvailabilityTruthRow[];
  distanceKmByInstitutionId: Map<string, number>;
  softByInstitutionId: Map<string, boolean>;
}> {
  const homeCodes = Array.from(
    new Set(
      params.homeMunicipalityCodes
        .map((code) => normalizeMunicipalityCode(code))
        .filter((code): code is string => Boolean(code))
    )
  );

  const empty = {
    rankedRows: params.vg2Rows,
    distanceKmByInstitutionId: new Map<string, number>(),
    softByInstitutionId: new Map<string, boolean>(),
  };

  if (homeCodes.length === 0 || params.vg2Rows.length === 0) {
    return empty;
  }

  const primaryHome = homeCodes[0]!;
  const relocation = params.relocationWillingness ?? "no";

  if (relocation === "maybe") {
    const uniqueSchoolCodes = Array.from(
      new Set(
        params.vg2Rows
          .map((row) => normalizeMunicipalityCode(row.municipalityCode))
          .filter((code): code is string => Boolean(code))
      )
    );

    const verdictBySchoolCode = new Map<string, MaybeReachVerdict>();
    await mapWithConcurrency(uniqueSchoolCodes, 4, async (schoolCode) => {
      const verdict = await resolveMaybeVerdict({
        supabase: params.supabase,
        homeMunicipalityCode: primaryHome,
        schoolMunicipalityCode: schoolCode,
      });
      verdictBySchoolCode.set(schoolCode, verdict);
      return verdict;
    });

    const distanceKmByInstitutionId = new Map<string, number>();
    const softByInstitutionId = new Map<string, boolean>();
    const scored: Array<{
      row: AvailabilityTruthRow;
      verdict: MaybeReachVerdict;
      sortKey: number;
    }> = [];

    for (const row of params.vg2Rows) {
      const schoolCode = normalizeMunicipalityCode(row.municipalityCode);
      if (!schoolCode) continue;
      const verdict = verdictBySchoolCode.get(schoolCode);
      if (!verdict?.admitted) continue;
      const sortKey = maybeReachSortKey(verdict);
      scored.push({ row, verdict, sortKey });
      if (row.institutionId) {
        const km = verdict.ptNetworkKm ?? Number.POSITIVE_INFINITY;
        const prev = distanceKmByInstitutionId.get(row.institutionId);
        if (prev === undefined || km < prev) {
          distanceKmByInstitutionId.set(row.institutionId, km);
          softByInstitutionId.set(row.institutionId, verdict.soft);
        }
      }
    }

    scored.sort((a, b) => {
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
      return (a.row.institutionName ?? "").localeCompare(b.row.institutionName ?? "", "nb");
    });

    if (scored.length > 0) {
      return {
        rankedRows: scored.map((item) => item.row),
        distanceKmByInstitutionId,
        softByInstitutionId,
      };
    }

    // Owner 2026-07-22: every kommune must keep P-8 when national sparse PSA seats exist.
    // Entur silent / hub miss → haversine soft admit (same sort as `yes`), not empty card.
    console.error(
      `[sparse-vg2-maybe] Entur admitted 0/${params.vg2Rows.length} for home=${primaryHome}; falling back to haversine soft admit`
    );
    const fallback = await filterAndRankSparseVg2RowsByHomeDistance({
      ...params,
      relocationWillingness: "yes",
    });
    return {
      rankedRows: fallback.rankedRows,
      distanceKmByInstitutionId: fallback.distanceKmByInstitutionId,
      softByInstitutionId: new Map(
        [...fallback.distanceKmByInstitutionId.keys()].map((id) => [id, true] as const)
      ),
    };
  }

  // yes / other: haversine nearest-first (no maybe deny band)
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

  scored.sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return (a.row.institutionName ?? "").localeCompare(b.row.institutionName ?? "", "nb");
  });

  return {
    rankedRows: scored.map((item) => item.row),
    distanceKmByInstitutionId,
    softByInstitutionId: new Map(),
  };
}

/** Inject VG2 distance ranks into transport context so programme_selection sorts nearest-first. */
export function enrichTransportSortContextWithVg2DistanceRanks(params: {
  context: KommuneTransportSortContext;
  vg2Rows: AvailabilityTruthRow[];
  distanceKmByInstitutionId: Map<string, number>;
  softByInstitutionId?: Map<string, boolean>;
}): KommuneTransportSortContext {
  const next = new Map(params.context.institutionReachabilityById);

  for (const row of params.vg2Rows) {
    const institutionId = row.institutionId;
    if (!institutionId) continue;
    const distanceKm =
      params.distanceKmByInstitutionId.get(institutionId) ?? Number.POSITIVE_INFINITY;
    const soft = params.softByInstitutionId?.get(institutionId) ?? false;
    const existing = next.get(institutionId);
    if (existing && existing.reachable !== null) {
      continue;
    }
    next.set(institutionId, {
      institutionId,
      schoolMunicipalityCode: normalizeMunicipalityCode(row.municipalityCode),
      mode: "norm_buffer",
      sortRank: distanceToSortRank(distanceKm, soft),
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
