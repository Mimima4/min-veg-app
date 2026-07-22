/**
 * P-8 — anleggsteknikk sparse national VG2 alternative ("VG2 andre steder").
 * Charter: phase-0-6-contour-b-anleggsteknikk-p8-sparse-vg2-relocation-owner-record.md
 * Contract: phase-4-relocation-geography-contract-owner-decision-record.md §4.2
 *
 * Contour B ingest materializes PSA per fylke. Runtime reads the home county only, so a
 * family in a sparse-VG2 profession never sees national VG2 schools elsewhere. This module
 * loads multi-county anleggsteknikk VG2 PSA and exposes only the schools that fall OUTSIDE
 * the primary geography scope, gated by the sparse PSA gate + relocation willingness.
 */
import { isLosaAvailabilityScope } from "@/lib/losa/availability-scope";
import { normalizeFylkeCodesFromMunicipalityCodes } from "@/lib/planning/norway-geo-code-normalization";
import {
  resolveSchoolGeographyScope,
  type RelocationWillingness,
  type SchoolGeographyScope,
} from "@/lib/planning/school-geography-scope";
import { FYLKE_CODE_TO_VILBLI_COUNTY_SLUG } from "@/lib/vgs/vilbli-county-meta";
import {
  ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG,
  isSparseVg2PilotProfession,
} from "@/lib/vgs/sparse-vg2-alternative-eligibility";
import type { AvailabilityTruthRow } from "@/server/children/routes/get-availability-truth";

/**
 * Fylke codes materialized for anleggsteknikk (15-county Contour B batch; Oslo `03`
 * aborted with VG2=0 — owner record §closure). getAvailabilityTruth returns empty for
 * counties with no PSA, so querying the full set is safe.
 */
export const ANLEGGSTEKNIKK_SPARSE_VG2_CANDIDATE_FYLKE_CODES: string[] = Object.keys(
  FYLKE_CODE_TO_VILBLI_COUNTY_SLUG
);

export function childHomeFylkeCodes(preferredMunicipalityCodes: string[]): string[] {
  return normalizeFylkeCodesFromMunicipalityCodes(preferredMunicipalityCodes);
}

export function resolveAnleggsteknikkHomeFylkeCode(
  preferredMunicipalityCodes: string[]
): string | null {
  return childHomeFylkeCodes(preferredMunicipalityCodes)[0] ?? null;
}

export function anleggsteknikkVg1ProgrammeSlugsForFylke(fylkeCode: string): string[] {
  const countySlug = FYLKE_CODE_TO_VILBLI_COUNTY_SLUG[String(fylkeCode ?? "").trim()];
  if (!countySlug) {
    return [];
  }
  return [`anleggsteknikk-vg1-bygg-${countySlug}`];
}

/**
 * V.BA shared VG1 — anleggsteknikk may lack its own VG1 catalogue row when Contour B
 * ABORTed the county (e.g. Oslo `03` VG2=0). Read home VG1 via carpenter PSA like painter P-7.
 */
export function anleggsteknikkHomeVg1ProgrammeSlugsForFylke(fylkeCode: string): string[] {
  const normalized = String(fylkeCode ?? "").trim();
  const anleggVg1 = anleggsteknikkVg1ProgrammeSlugsForFylke(normalized);
  const countySlug = FYLKE_CODE_TO_VILBLI_COUNTY_SLUG[normalized];
  if (!countySlug) {
    return anleggVg1;
  }
  const carpenterVg1 =
    normalized === "50"
      ? "carpenter-vg1-bygg-trondelag"
      : `carpenter-vg1-bygg-${countySlug}`;
  return Array.from(new Set([...anleggVg1, carpenterVg1]));
}

export function anleggsteknikkVilbliChainUrlForFylke(fylkeCode: string): string | null {
  const countySlug = FYLKE_CODE_TO_VILBLI_COUNTY_SLUG[String(fylkeCode ?? "").trim()];
  if (!countySlug) {
    return null;
  }
  return `https://www.vilbli.no/nb/${countySlug}/strukturkart/V.BA/bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAANL2----&side=p5`;
}

export function anleggsteknikkVg2ProgrammeSlugsForFylke(fylkeCode: string): string[] {
  const countySlug = FYLKE_CODE_TO_VILBLI_COUNTY_SLUG[String(fylkeCode ?? "").trim()];
  if (!countySlug) {
    return [];
  }
  return [`anleggsteknikk-vg2-anleggsteknikk-${countySlug}`];
}

/** Ordinary (non-LOSA) PSA rows only — LOSA is county-delivery, not a national school seat. */
function countyScopedSchoolRows(rows: AvailabilityTruthRow[]): AvailabilityTruthRow[] {
  return rows.filter((row) => !isLosaAvailabilityScope(row.availabilityScope));
}

/** Distinct VG2 school institutions across the national PSA — feeds the sparse ≤50 gate. */
export function countNationalSparseVg2Schools(nationalRows: AvailabilityTruthRow[]): number {
  const institutions = new Set<string>();
  for (const row of countyScopedSchoolRows(nationalRows)) {
    if (row.stage === "VG2" && row.institutionId) {
      institutions.add(row.institutionId);
    }
  }
  return institutions.size;
}

/**
 * National VG2 rows whose county is NOT inside the primary geography scope — these are the
 * "andre steder" schools. Primary is home fylke only (owner 2026-07-22); nabofylke seats
 * such as Nordland for Troms/Finnmark appear here when relocation allows (G-3).
 */
export function selectNationalSparseVg2RowsOutsidePrimaryScope(params: {
  nationalRows: AvailabilityTruthRow[];
  primaryScope: SchoolGeographyScope;
}): AvailabilityTruthRow[] {
  const primaryAllowed = params.primaryScope.allowedFylkeCodes;
  return countyScopedSchoolRows(params.nationalRows).filter((row) => {
    if (row.stage !== "VG2") {
      return false;
    }
    const county = String(row.countyCode ?? "").trim();
    if (!county) {
      return false;
    }
    if (primaryAllowed && primaryAllowed.has(county)) {
      return false;
    }
    return true;
  });
}

/**
 * Merge home VG1 PSA with national VG2 PSA (outside primary scope). VG2 slug is canonicalized
 * so the school dropdown lists all national schools under one programme_selection option.
 */
export function mergeAnleggsteknikkSparseVg2TruthRows(params: {
  homeVg1Rows: AvailabilityTruthRow[];
  nationalVg2RowsOutsidePrimaryScope: AvailabilityTruthRow[];
}): AvailabilityTruthRow[] {
  const homeVg1 = params.homeVg1Rows.filter((row) => row.stage === "VG1");
  const nationalVg2 = params.nationalVg2RowsOutsidePrimaryScope
    .filter((row) => row.stage === "VG2")
    .map((row) => ({
      ...row,
      programSlug: ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG,
    }));
  return [...homeVg1, ...nationalVg2];
}

/**
 * Cheap synchronous pre-filter for the sync loop: only the pilot profession may build the
 * national sparse VG2 alternative. Relocation + sparse PSA gate are enforced in the builder.
 */
export function isAnleggsteknikkSparseVg2VariantEligible(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
}): boolean {
  void params.preferredMunicipalityCodes;
  return isSparseVg2PilotProfession(params.professionSlug);
}

/** relocation `no`/null omits the P-8 alternative entirely (contract §4.2). */
export function relocationAllowsNationalSparseAlternative(
  relocationWillingness: RelocationWillingness
): boolean {
  const scope = resolveSchoolGeographyScope({
    layer: "alternative",
    preferredMunicipalityCodes: [],
    relocationWillingness,
    sparseVg2GateActive: true,
  });
  return scope.allowNationalSparseAlternative;
}

export type AnleggsteknikkSparseVg2InfoCopy = {
  title: string;
  body: string;
};

export function getAnleggsteknikkSparseVg2InfoCopy(
  locale: string
): AnleggsteknikkSparseVg2InfoCopy {
  if (locale === "nb" || locale === "nn") {
    return {
      title: "Anleggsteknikk — VG2 andre steder",
      body: "VG1 Bygg- og anleggsteknikk tas i heimfylket ditt; VG2 Anleggsteknikk tilbys på få skoler nasjonalt. Skolene under ligger utanfor primærområdet ditt og krever flytting eller pendling. Skolene er sortert etter reisetid med kollektivtransport.",
    };
  }
  return {
    title: "Anleggsteknikk — VG2 elsewhere",
    body: "VG1 Bygg- og anleggsteknikk is taken in your home county; VG2 Anleggsteknikk is offered at only a few schools nationally. The schools below are outside your primary area and require relocation or commuting. They are ordered by public-transport travel time.",
  };
}
