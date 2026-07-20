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
import {
  evaluateMaybeReachBetweenMunicipalities,
} from "@/lib/planning/kommune-transport/evaluate-maybe-reach";
import {
  readMaybePtReachCache,
  writeMaybePtReachCache,
} from "@/lib/planning/kommune-transport/maybe-pt-reach-cache";
import { compareInstitutionTransportRank } from "@/lib/planning/kommune-transport/evaluate-reachability";
import type { KommuneTransportSortContext } from "@/lib/planning/kommune-transport/types";
import type { AvailabilityTruthRow } from "./get-availability-truth";

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
  transportSortContext?: KommuneTransportSortContext | null;
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

    if (params.transportSortContext?.computed) {
      const transportDelta = compareInstitutionTransportRank(
        a.institutionId,
        b.institutionId,
        params.transportSortContext
      );
      if (transportDelta !== 0) {
        return transportDelta;
      }
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
  transportSortContext?: KommuneTransportSortContext | null;
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
        transportSortContext: params.transportSortContext,
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
        transportSortContext: params.transportSortContext,
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
        transportSortContext: params.transportSortContext,
      })[0] ?? null
    );
  }

  if (params.relocationWillingness === "no") {
    return null;
  }

  if (params.relocationWillingness === "maybe") {
    const primaryHome = preferredMunicipalityCodes[0];
    if (!primaryHome) return null;

    const uniqueSchoolCodes = Array.from(
      new Set(
        params.rows
          .map((row) => normalizeMunicipalityCode(row.municipalityCode))
          .filter((code): code is string => Boolean(code))
      )
    );

    const admittedSchoolCodes = new Set<string>();
    const softSchoolCodes = new Set<string>();
    const ptKmBySchool = new Map<string, number>();

    for (const schoolCode of uniqueSchoolCodes) {
      let verdict = await readMaybePtReachCache({
        supabase: params.supabase,
        homeMunicipalityCode: primaryHome,
        schoolMunicipalityCode: schoolCode,
      });
      if (!verdict) {
        verdict = await evaluateMaybeReachBetweenMunicipalities({
          homeMunicipalityCode: primaryHome,
          schoolMunicipalityCode: schoolCode,
        });
        await writeMaybePtReachCache({
          supabase: params.supabase,
          homeMunicipalityCode: primaryHome,
          schoolMunicipalityCode: schoolCode,
          verdict,
        });
      }
      if (!verdict.admitted) continue;
      admittedSchoolCodes.add(schoolCode);
      if (verdict.soft) softSchoolCodes.add(schoolCode);
      if (verdict.ptNetworkKm != null) ptKmBySchool.set(schoolCode, verdict.ptNetworkKm);
    }

    const maybePtScoped = params.rows.filter((row) => {
      const code = normalizeMunicipalityCode(row.municipalityCode);
      return code ? admittedSchoolCodes.has(code) : false;
    });
    if (maybePtScoped.length === 0) return null;

    const sorted = [...maybePtScoped].sort((a, b) => {
      const aCode = normalizeMunicipalityCode(a.municipalityCode) ?? "";
      const bCode = normalizeMunicipalityCode(b.municipalityCode) ?? "";
      const aSoft = softSchoolCodes.has(aCode);
      const bSoft = softSchoolCodes.has(bCode);
      if (aSoft !== bSoft) return aSoft ? 1 : -1;
      const aKm = ptKmBySchool.get(aCode) ?? Number.POSITIVE_INFINITY;
      const bKm = ptKmBySchool.get(bCode) ?? Number.POSITIVE_INFINITY;
      if (aKm !== bKm) return aKm - bKm;
      return (a.institutionName ?? "").localeCompare(b.institutionName ?? "", "nb");
    });

    return sorted[0] ?? null;
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
          transportSortContext: params.transportSortContext,
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
      transportSortContext: params.transportSortContext,
    })[0] ?? null
  );
}
