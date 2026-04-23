import type { SupabaseClient } from "@supabase/supabase-js";
import { deriveFylkeAdjacencyRings } from "@/lib/planning/norway-fylke-adjacency";
import {
  normalizeFylkeCodesFromMunicipalityCodes,
  normalizeInstitutionFylkeCodes,
} from "@/lib/planning/norway-geo-code-normalization";
import {
  haversineDistanceKm,
  normalizeMunicipalityCode,
} from "@/lib/planning/geo-distance";
import type { AvailabilityTruthRow } from "./get-availability-truth";

const MAYBE_MAX_DISTANCE_KM = 400;

function stagePriority(stage: string): number {
  const order: Record<string, number> = {
    VG1: 1,
    VG2: 2,
    VG3: 3,
    APPRENTICESHIP: 4,
  };
  return order[stage] ?? 999;
}

function verificationPriority(status: string): number {
  if (status === "verified") return 1;
  if (status === "needs_review") return 2;
  return 999;
}

function sortCandidatesWithinScope(params: {
  candidates: AvailabilityTruthRow[];
  preferredMunicipalityCodes: string[];
  homeFylkeCodes: string[];
  municipalityGeoPointByCode: Map<string, { lat: number; lng: number }>;
}): AvailabilityTruthRow[] {
  const preferredMunicipalitySet = new Set(params.preferredMunicipalityCodes);
  const homeFylkeSet = new Set(params.homeFylkeCodes);

  function getCandidateFylkeCodes(candidate: AvailabilityTruthRow): string[] {
    return normalizeInstitutionFylkeCodes({
      countyCode: candidate.countyCode,
      municipalityCode: candidate.municipalityCode,
    });
  }

  function getCandidateCentroidDistanceKm(candidate: AvailabilityTruthRow): number {
    const candidateMunicipalityCode = normalizeMunicipalityCode(candidate.municipalityCode);
    if (!candidateMunicipalityCode) {
      return Number.POSITIVE_INFINITY;
    }
    const candidateGeoPoint = params.municipalityGeoPointByCode.get(candidateMunicipalityCode);
    if (!candidateGeoPoint) {
      return Number.POSITIVE_INFINITY;
    }

    let best = Number.POSITIVE_INFINITY;
    for (const homeMunicipalityCode of params.preferredMunicipalityCodes) {
      const homeGeoPoint = params.municipalityGeoPointByCode.get(homeMunicipalityCode);
      if (!homeGeoPoint) continue;
      const distance = haversineDistanceKm(homeGeoPoint, candidateGeoPoint);
      if (distance < best) {
        best = distance;
      }
    }
    return best;
  }

  return [...params.candidates].sort((a, b) => {
    const aMunicipalityCode = normalizeMunicipalityCode(a.municipalityCode);
    const bMunicipalityCode = normalizeMunicipalityCode(b.municipalityCode);
    const aMunicipalityMatch = aMunicipalityCode
      ? preferredMunicipalitySet.has(aMunicipalityCode)
      : false;
    const bMunicipalityMatch = bMunicipalityCode
      ? preferredMunicipalitySet.has(bMunicipalityCode)
      : false;
    if (aMunicipalityMatch !== bMunicipalityMatch) {
      return aMunicipalityMatch ? -1 : 1;
    }

    const aHomeFylkeMatch = getCandidateFylkeCodes(a).some((code) => homeFylkeSet.has(code));
    const bHomeFylkeMatch = getCandidateFylkeCodes(b).some((code) => homeFylkeSet.has(code));
    if (aHomeFylkeMatch !== bHomeFylkeMatch) {
      return aHomeFylkeMatch ? -1 : 1;
    }

    const aDistance = getCandidateCentroidDistanceKm(a);
    const bDistance = getCandidateCentroidDistanceKm(b);
    if (aDistance !== bDistance) {
      return aDistance - bDistance;
    }

    const stageDelta = stagePriority(a.stage) - stagePriority(b.stage);
    if (stageDelta !== 0) {
      return stageDelta;
    }

    const verificationDelta =
      verificationPriority(a.verificationStatus) - verificationPriority(b.verificationStatus);
    if (verificationDelta !== 0) {
      return verificationDelta;
    }

    return (a.institutionName ?? "").localeCompare(b.institutionName ?? "");
  });
}

function scopeCandidatesByFylkeCodes(
  candidates: AvailabilityTruthRow[],
  fylkeCodes: string[]
): AvailabilityTruthRow[] {
  if (fylkeCodes.length === 0) return [];
  return candidates.filter((candidate) =>
    normalizeInstitutionFylkeCodes({
      countyCode: candidate.countyCode,
      municipalityCode: candidate.municipalityCode,
    }).some((code) => fylkeCodes.includes(code))
  );
}

export async function selectTruthCandidateForRoute(params: {
  supabase: SupabaseClient;
  rows: AvailabilityTruthRow[];
  preferredMunicipalityCodes: string[];
  relocationWillingness: "no" | "maybe" | "yes" | null;
}): Promise<AvailabilityTruthRow | null> {
  if (params.rows.length === 0) {
    return null;
  }

  const preferredMunicipalityCodes = Array.from(
    new Set(
      params.preferredMunicipalityCodes
        .map((code) => normalizeMunicipalityCode(code))
        .filter((code): code is string => Boolean(code))
    )
  );
  const homeFylkeCodes = normalizeFylkeCodesFromMunicipalityCodes(preferredMunicipalityCodes);

  const municipalityCodesForDistanceLookup = Array.from(
    new Set(
      [
        ...preferredMunicipalityCodes,
        ...params.rows
          .map((row) => normalizeMunicipalityCode(row.municipalityCode))
          .filter((code): code is string => Boolean(code)),
      ].filter(Boolean)
    )
  );

  let municipalityGeoPointByCode = new Map<string, { lat: number; lng: number }>();
  if (municipalityCodesForDistanceLookup.length > 0) {
    const { data: municipalityGeoRows, error: municipalityGeoError } = await params.supabase
      .from("municipality_geo_points")
      .select("municipality_code, lat, lng")
      .in("municipality_code", municipalityCodesForDistanceLookup);

    if (municipalityGeoError) {
      throw new Error(
        `Failed to load municipality geo points for truth selection: ${municipalityGeoError.message}`
      );
    }

    municipalityGeoPointByCode = new Map(
      ((municipalityGeoRows ?? []) as Array<{
        municipality_code: string;
        lat: number;
        lng: number;
      }>).map((row) => [row.municipality_code, { lat: row.lat, lng: row.lng }])
    );
  }

  if (preferredMunicipalityCodes.length === 0) {
    return (
      sortCandidatesWithinScope({
        candidates: params.rows,
        preferredMunicipalityCodes,
        homeFylkeCodes,
        municipalityGeoPointByCode,
      })[0] ?? null
    );
  }

  const municipalityScoped = params.rows.filter((row) => {
    const municipalityCode = normalizeMunicipalityCode(row.municipalityCode);
    return municipalityCode ? preferredMunicipalityCodes.includes(municipalityCode) : false;
  });
  if (municipalityScoped.length > 0) {
    return (
      sortCandidatesWithinScope({
        candidates: municipalityScoped,
        preferredMunicipalityCodes,
        homeFylkeCodes,
        municipalityGeoPointByCode,
      })[0] ?? null
    );
  }

  const homeFylkeScoped = scopeCandidatesByFylkeCodes(params.rows, homeFylkeCodes);
  if (homeFylkeScoped.length > 0) {
    return (
      sortCandidatesWithinScope({
        candidates: homeFylkeScoped,
        preferredMunicipalityCodes,
        homeFylkeCodes,
        municipalityGeoPointByCode,
      })[0] ?? null
    );
  }

  const getDistanceKm = (row: AvailabilityTruthRow): number => {
    const municipalityCode = normalizeMunicipalityCode(row.municipalityCode);
    if (!municipalityCode) return Number.POSITIVE_INFINITY;
    const geoPoint = municipalityGeoPointByCode.get(municipalityCode);
    if (!geoPoint) return Number.POSITIVE_INFINITY;
    let best = Number.POSITIVE_INFINITY;
    for (const homeCode of preferredMunicipalityCodes) {
      const homePoint = municipalityGeoPointByCode.get(homeCode);
      if (!homePoint) continue;
      const distance = haversineDistanceKm(homePoint, geoPoint);
      if (distance < best) best = distance;
    }
    return best;
  };

  if (params.relocationWillingness === "no") {
    return null;
  }

  if (params.relocationWillingness === "maybe") {
    const maybeDistanceScoped = params.rows.filter((row) => {
      const distanceKm = getDistanceKm(row);
      return Number.isFinite(distanceKm) && distanceKm <= MAYBE_MAX_DISTANCE_KM;
    });
    if (maybeDistanceScoped.length > 0) {
      return (
        sortCandidatesWithinScope({
          candidates: maybeDistanceScoped,
          preferredMunicipalityCodes,
          homeFylkeCodes,
          municipalityGeoPointByCode,
        })[0] ?? null
      );
    }
    return null;
  }

  if (params.relocationWillingness === "yes") {
    const adjacencyRings = deriveFylkeAdjacencyRings({ homeFylkeCodes });
    for (const ringFylkeCodes of adjacencyRings) {
      const ringScoped = scopeCandidatesByFylkeCodes(params.rows, ringFylkeCodes);
      if (ringScoped.length === 0) continue;
      return (
        sortCandidatesWithinScope({
          candidates: ringScoped,
          preferredMunicipalityCodes,
          homeFylkeCodes,
          municipalityGeoPointByCode,
        })[0] ?? null
      );
    }
  }

  return (
    sortCandidatesWithinScope({
      candidates: params.rows,
      preferredMunicipalityCodes,
      homeFylkeCodes,
      municipalityGeoPointByCode,
    })[0] ?? null
  );
}
