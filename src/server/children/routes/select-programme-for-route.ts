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
import type { RouteAdmissionRealismRecord } from "@/lib/routes/route-admission-realism-types";
import { batchGetRouteAdmissionRealismForCandidates } from "./get-route-admission-realism";
import { computeAdmissionAdvantageScore } from "./compute-admission-advantage-score";

type RelocationWillingness = "no" | "maybe" | "yes" | null;

export type RouteChildPlanning = {
  preferredMunicipalityCodes: string[];
  relocationWillingness: RelocationWillingness;
};

export type RouteProgramLink = {
  program_slug: string;
  fit_band: "strong" | "broader";
};

export type RouteEducationProgram = {
  slug: string;
  title: string;
  institution_id: string | null;
  education_level: string | null;
  is_active?: boolean;
};

export type RouteInstitution = {
  id: string;
  slug: string;
  name: string;
  county_code: string | null;
  municipality_code: string | null;
  is_active?: boolean;
  source?: string | null;
  is_route_relevant?: boolean | null;
};

export type SelectedProgrammeForRoute = {
  link: RouteProgramLink;
  program: RouteEducationProgram;
  institution: RouteInstitution | null;
};

type MunicipalityGeoPointRow = {
  municipality_code: string;
  lat: number;
  lng: number;
};

const MAYBE_MAX_DISTANCE_KM = 400;

function scopeCandidatesByFylkeCodes(
  candidates: SelectedProgrammeForRoute[],
  fylkeCodes: string[]
): SelectedProgrammeForRoute[] {
  if (fylkeCodes.length === 0) {
    return [];
  }

  return candidates.filter((candidate) => {
    if (!candidate.institution) {
      return false;
    }

    const institutionFylkeCodes = normalizeInstitutionFylkeCodes({
      countyCode: candidate.institution.county_code,
      municipalityCode: candidate.institution.municipality_code,
    });

    return institutionFylkeCodes.some((code) => fylkeCodes.includes(code));
  });
}

function sortCandidatesWithinScope(
  candidates: SelectedProgrammeForRoute[],
  professionSlug: string | undefined,
  admissionByKey: Map<string, RouteAdmissionRealismRecord>,
  preferredMunicipalityCodes: string[],
  homeFylkeCodes: string[],
  municipalityGeoPointByCode: Map<string, { lat: number; lng: number }>
): SelectedProgrammeForRoute[] {
  // LOCKED_SPEC:
  // - Main route selection remains family-realism first.
  // - Geography and practical burden (municipality/fylke/distance) outrank admission factors.
  // - Admission advantage (quota/competition/requirements) is a tie-break only within
  //   already acceptable geography scope.
  const preferredMunicipalitySet = new Set(preferredMunicipalityCodes);
  const homeFylkeSet = new Set(homeFylkeCodes);

  function getCandidateFylkeCodes(candidate: SelectedProgrammeForRoute): string[] {
    if (!candidate.institution) {
      return [];
    }

    return normalizeInstitutionFylkeCodes({
      countyCode: candidate.institution.county_code,
      municipalityCode: candidate.institution.municipality_code,
    });
  }

  function getCandidateMunicipalityCode(
    candidate: SelectedProgrammeForRoute
  ): string | null {
    return candidate.institution?.municipality_code ?? null;
  }

  function getCandidateCentroidDistanceKm(candidate: SelectedProgrammeForRoute): number {
    const candidateMunicipalityCode = normalizeMunicipalityCode(
      candidate.institution?.municipality_code
    );
    if (!candidateMunicipalityCode) {
      return Number.POSITIVE_INFINITY;
    }

    const candidateGeoPoint = municipalityGeoPointByCode.get(candidateMunicipalityCode);
    if (!candidateGeoPoint) {
      return Number.POSITIVE_INFINITY;
    }

    let best = Number.POSITIVE_INFINITY;
    for (const homeMunicipalityCode of preferredMunicipalityCodes) {
      const normalizedHomeCode = normalizeMunicipalityCode(homeMunicipalityCode);
      if (!normalizedHomeCode) {
        continue;
      }
      const homeGeoPoint = municipalityGeoPointByCode.get(normalizedHomeCode);
      if (!homeGeoPoint) {
        continue;
      }
      const distance = haversineDistanceKm(homeGeoPoint, candidateGeoPoint);
      if (distance < best) {
        best = distance;
      }
    }
    return best;
  }

  return [...candidates].sort((a, b) => {
    const aMunicipality = getCandidateMunicipalityCode(a);
    const bMunicipality = getCandidateMunicipalityCode(b);
    const aMunicipalityMatch = aMunicipality
      ? preferredMunicipalitySet.has(aMunicipality)
      : false;
    const bMunicipalityMatch = bMunicipality
      ? preferredMunicipalitySet.has(bMunicipality)
      : false;

    if (aMunicipalityMatch !== bMunicipalityMatch) {
      return aMunicipalityMatch ? -1 : 1;
    }

    const aFylkeCodes = getCandidateFylkeCodes(a);
    const bFylkeCodes = getCandidateFylkeCodes(b);
    const aHomeFylkeMatch = aFylkeCodes.some((code) => homeFylkeSet.has(code));
    const bHomeFylkeMatch = bFylkeCodes.some((code) => homeFylkeSet.has(code));

    if (aHomeFylkeMatch !== bHomeFylkeMatch) {
      return aHomeFylkeMatch ? -1 : 1;
    }

    const aCentroidDistanceKm = getCandidateCentroidDistanceKm(a);
    const bCentroidDistanceKm = getCandidateCentroidDistanceKm(b);
    if (aCentroidDistanceKm !== bCentroidDistanceKm) {
      return aCentroidDistanceKm - bCentroidDistanceKm;
    }

    const keyA = `${a.program.slug}\t${a.institution?.id ?? ""}`;
    const keyB = `${b.program.slug}\t${b.institution?.id ?? ""}`;

    const aScore = computeAdmissionAdvantageScore({
      professionSlug: professionSlug ?? "__unknown__",
      programSlug: a.program.slug,
      institutionId: a.institution?.id ?? null,
      admissionRealismRecord: admissionByKey.get(keyA) ?? null,
    }).score;
    const bScore = computeAdmissionAdvantageScore({
      professionSlug: professionSlug ?? "__unknown__",
      programSlug: b.program.slug,
      institutionId: b.institution?.id ?? null,
      admissionRealismRecord: admissionByKey.get(keyB) ?? null,
    }).score;

    if (aScore !== bScore) {
      return bScore - aScore;
    }

    return a.program.slug.localeCompare(b.program.slug);
  });
}

export async function selectProgrammeForRoute(params: {
  supabase: SupabaseClient;
  childPlanning: RouteChildPlanning;
  professionProgramLinks: RouteProgramLink[];
  educationPrograms: RouteEducationProgram[];
  institutions: RouteInstitution[];
  professionSlug?: string;
}): Promise<SelectedProgrammeForRoute | null> {
  const programBySlug = new Map(
    params.educationPrograms.map((program) => [program.slug, program])
  );
  const institutionById = new Map(
    params.institutions.map((institution) => [institution.id, institution])
  );

  const strongCandidates = params.professionProgramLinks
    .filter((link) => link.fit_band === "strong")
    .map((link) => {
      const program = programBySlug.get(link.program_slug);

      if (!program) {
        return null;
      }

      return {
        link,
        program,
        institution: program.institution_id
          ? institutionById.get(program.institution_id) ?? null
          : null,
      } satisfies SelectedProgrammeForRoute;
    })
    .filter((candidate): candidate is SelectedProgrammeForRoute => Boolean(candidate));

  if (strongCandidates.length === 0) {
    return null;
  }

  const admissionByKey = await batchGetRouteAdmissionRealismForCandidates(
    params.supabase,
    strongCandidates.map((candidate) => ({
      programSlug: candidate.program.slug,
      institutionId: candidate.institution?.id ?? null,
    })),
    params.professionSlug ?? null
  );

  const preferredMunicipalityCodes = Array.from(
    new Set(
      params.childPlanning.preferredMunicipalityCodes
        .map((code) => normalizeMunicipalityCode(code))
        .filter((code): code is string => Boolean(code))
    )
  );
  const homeFylkeCodes = normalizeFylkeCodesFromMunicipalityCodes(
    preferredMunicipalityCodes
  );
  const municipalityCodesForDistanceLookup = Array.from(
    new Set(
      [
        ...preferredMunicipalityCodes,
        ...strongCandidates
          .map((candidate) =>
            normalizeMunicipalityCode(candidate.institution?.municipality_code)
          )
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
        `Failed to load municipality geo points for route selection: ${municipalityGeoError.message}`
      );
    }

    municipalityGeoPointByCode = new Map(
      ((municipalityGeoRows ?? []) as MunicipalityGeoPointRow[]).map((row) => [
        row.municipality_code,
        { lat: row.lat, lng: row.lng },
      ])
    );
  }

  if (preferredMunicipalityCodes.length === 0) {
    const sortedNationwide = sortCandidatesWithinScope(
      strongCandidates,
      params.professionSlug,
      admissionByKey,
      preferredMunicipalityCodes,
      homeFylkeCodes,
      municipalityGeoPointByCode
    );
    return sortedNationwide[0] ?? null;
  }

  const municipalityScoped = strongCandidates.filter((candidate) =>
    candidate.institution?.municipality_code
      ? preferredMunicipalityCodes.includes(candidate.institution.municipality_code)
      : false
  );

  if (municipalityScoped.length > 0) {
    const sortedMunicipalityScoped = sortCandidatesWithinScope(
      municipalityScoped,
      params.professionSlug,
      admissionByKey,
      preferredMunicipalityCodes,
      homeFylkeCodes,
      municipalityGeoPointByCode
    );
    return sortedMunicipalityScoped[0] ?? null;
  }

  const homeFylkeScoped = scopeCandidatesByFylkeCodes(strongCandidates, homeFylkeCodes);
  if (homeFylkeScoped.length > 0) {
    const sortedHomeFylkeScoped = sortCandidatesWithinScope(
      homeFylkeScoped,
      params.professionSlug,
      admissionByKey,
      preferredMunicipalityCodes,
      homeFylkeCodes,
      municipalityGeoPointByCode
    );
    return sortedHomeFylkeScoped[0] ?? null;
  }

  function getCandidateCentroidDistanceKm(candidate: SelectedProgrammeForRoute): number {
    const candidateMunicipalityCode = normalizeMunicipalityCode(
      candidate.institution?.municipality_code
    );
    if (!candidateMunicipalityCode) {
      return Number.POSITIVE_INFINITY;
    }

    const candidateGeoPoint = municipalityGeoPointByCode.get(candidateMunicipalityCode);
    if (!candidateGeoPoint) {
      return Number.POSITIVE_INFINITY;
    }

    let best = Number.POSITIVE_INFINITY;
    for (const homeMunicipalityCode of preferredMunicipalityCodes) {
      const normalizedHomeCode = normalizeMunicipalityCode(homeMunicipalityCode);
      if (!normalizedHomeCode) {
        continue;
      }
      const homeGeoPoint = municipalityGeoPointByCode.get(normalizedHomeCode);
      if (!homeGeoPoint) {
        continue;
      }

      const distanceKm = haversineDistanceKm(homeGeoPoint, candidateGeoPoint);
      if (distanceKm < best) {
        best = distanceKm;
      }
    }

    return best;
  }

  if (params.childPlanning.relocationWillingness === "maybe") {
    const maybeDistanceScoped = strongCandidates.filter((candidate) => {
      const distanceKm = getCandidateCentroidDistanceKm(candidate);
      return Number.isFinite(distanceKm) && distanceKm <= MAYBE_MAX_DISTANCE_KM;
    });

    if (maybeDistanceScoped.length > 0) {
      const sortedMaybeDistanceScoped = sortCandidatesWithinScope(
        maybeDistanceScoped,
        params.professionSlug,
        admissionByKey,
        preferredMunicipalityCodes,
        homeFylkeCodes,
        municipalityGeoPointByCode
      );
      return sortedMaybeDistanceScoped[0] ?? null;
    }

    // "Kanskje" stays regional: no national fallback when distance-bounded scope is empty.
    return null;
  }

  if (params.childPlanning.relocationWillingness === "yes") {
    const adjacencyRings = deriveFylkeAdjacencyRings({ homeFylkeCodes });
    const maxRingDepth = 10;
    const ringCount = Math.min(maxRingDepth, adjacencyRings.length);

    for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
      const ringFylkeCodes = adjacencyRings[ringIndex] ?? [];
      const ringScoped = scopeCandidatesByFylkeCodes(strongCandidates, ringFylkeCodes);

      if (ringScoped.length > 0) {
        const sortedRingScoped = sortCandidatesWithinScope(
          ringScoped,
          params.professionSlug,
          admissionByKey,
          preferredMunicipalityCodes,
          homeFylkeCodes,
          municipalityGeoPointByCode
        );
        return sortedRingScoped[0] ?? null;
      }
    }
  }

  if (params.childPlanning.relocationWillingness === "no") {
    return null;
  }

  const sortedNationwideFallback = sortCandidatesWithinScope(
    strongCandidates,
    params.professionSlug,
    admissionByKey,
    preferredMunicipalityCodes,
    homeFylkeCodes,
    municipalityGeoPointByCode
  );
  return sortedNationwideFallback[0] ?? null;
}
