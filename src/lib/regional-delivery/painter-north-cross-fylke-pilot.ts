/**
 * P-7 — painter (Overflateteknikk) cross-fylke alternatives when home fylke lacks local VG2.
 * Charter: phase-0-6-contour-b-painter-vilbli-branch-owner-record.md (P-7)
 * Policy: phase-4-county-local-primary-route-completeness-owner-policy.md (R-3)
 *
 * Vilbli pattern (Troms/Finnmark only): VG1 schools in home fylke, VG2 Overflateteknikk in
 * neighboring fylker. Alternatives are split routes — not a full chain relocated to neighbor.
 */
import { isLosaAvailabilityScope } from "@/lib/losa/availability-scope";
import { normalizeFylkeCodesFromMunicipalityCodes } from "@/lib/planning/norway-geo-code-normalization";
import { deriveFylkeAdjacencyRings } from "@/lib/planning/norway-fylke-adjacency";
import { FYLKE_CODE_TO_VILBLI_COUNTY_SLUG } from "@/lib/vgs/vilbli-county-meta";
import {
  assessHomeCountyPrimaryRouteEligibility,
  listMissingPrimarySchoolChainStages,
  type PrimaryRequiredSchoolStage,
} from "@/lib/vgs/home-county-primary-route-completeness";
import type { AvailabilityTruthRow } from "@/server/children/routes/get-availability-truth";

export const PAINTER_NORTH_HOME_FYLKE_CODES = new Set(["55", "56"]);

export const PAINTER_NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS = [
  { countyCode: "18", labelNb: "Nordland", labelEn: "Nordland" },
  { countyCode: "50", labelNb: "Trøndelag", labelEn: "Trøndelag" },
] as const;

export function painterProgrammeSlugsForFylke(fylkeCode: string): string[] {
  const normalized = String(fylkeCode ?? "").trim();
  if (normalized === "50") {
    return ["painter-vg1-bygg-trondelag", "painter-vg2-overflateteknikk-trondelag"];
  }
  const countySlug = FYLKE_CODE_TO_VILBLI_COUNTY_SLUG[normalized];
  if (!countySlug) {
    return [];
  }
  return [
    `painter-vg1-bygg-${countySlug}`,
    `painter-vg2-overflateteknikk-${countySlug}`,
  ];
}

/** V.BA shared VG1 — painter may read home VG1 PSA via carpenter programme rows. */
export function painterHomeVg1ProgrammeSlugsForFylke(fylkeCode: string): string[] {
  const normalized = String(fylkeCode ?? "").trim();
  const painterVg1 = painterProgrammeSlugsForFylke(normalized).filter((slug) =>
    slug.includes("-vg1-")
  );
  const countySlug = FYLKE_CODE_TO_VILBLI_COUNTY_SLUG[normalized];
  if (!countySlug) {
    return painterVg1;
  }
  const carpenterVg1 =
    normalized === "50"
      ? "carpenter-vg1-bygg-trondelag"
      : `carpenter-vg1-bygg-${countySlug}`;
  return Array.from(new Set([...painterVg1, carpenterVg1]));
}

function countyScopedSchoolRows(rows: AvailabilityTruthRow[]): AvailabilityTruthRow[] {
  return rows.filter((row) => !isLosaAvailabilityScope(row.availabilityScope));
}

export function resolvePainterNorthHomeFylkeCode(
  preferredMunicipalityCodes: string[]
): string | null {
  return (
    childHomeFylkeCodes(preferredMunicipalityCodes).find((code) =>
      PAINTER_NORTH_HOME_FYLKE_CODES.has(code)
    ) ?? null
  );
}

export function mergePainterNorthCrossFylkeTruthRows(
  params: {
    homeRows: AvailabilityTruthRow[];
    neighborRows: AvailabilityTruthRow[];
  }
): AvailabilityTruthRow[] {
  const homeVg1 = countyScopedSchoolRows(params.homeRows).filter((row) => row.stage === "VG1");
  const neighborFromVg2 = countyScopedSchoolRows(params.neighborRows).filter(
    (row) => row.stage !== "VG1"
  );
  return [...homeVg1, ...neighborFromVg2];
}

export function assessPainterNorthSplitRouteTruthEligibility(params: {
  homeRows: AvailabilityTruthRow[];
  neighborRows: AvailabilityTruthRow[];
}): {
  eligible: boolean;
  homeHasVg1: boolean;
  neighborHasVg2: boolean;
  missingMergedStages: PrimaryRequiredSchoolStage[];
} {
  const homeSchool = countyScopedSchoolRows(params.homeRows);
  const neighborSchool = countyScopedSchoolRows(params.neighborRows);
  const homeHasVg1 = homeSchool.some((row) => row.stage === "VG1");
  const neighborHasVg2 = neighborSchool.some((row) => row.stage === "VG2");
  const merged = mergePainterNorthCrossFylkeTruthRows({
    homeRows: params.homeRows,
    neighborRows: params.neighborRows,
  });
  const mergedEligibility = assessHomeCountyPrimaryRouteEligibility({
    truthRows: merged,
  });
  return {
    eligible: homeHasVg1 && neighborHasVg2 && mergedEligibility.eligible,
    homeHasVg1,
    neighborHasVg2,
    missingMergedStages: listMissingPrimarySchoolChainStages(merged),
  };
}

export function childHomeFylkeCodes(preferredMunicipalityCodes: string[]): string[] {
  return normalizeFylkeCodesFromMunicipalityCodes(preferredMunicipalityCodes);
}

export function isPainterNorthHomeFylke(homeFylkeCodes: string[]): boolean {
  return homeFylkeCodes.some((code) => PAINTER_NORTH_HOME_FYLKE_CODES.has(code));
}

export function isNeighborFylkeReachableFromPainterNorthHome(params: {
  homeFylkeCodes: string[];
  neighborCountyCode: string;
}): boolean {
  const neighbor = String(params.neighborCountyCode ?? "").trim();
  if (!neighbor) {
    return false;
  }
  const rings = deriveFylkeAdjacencyRings({ homeFylkeCodes: params.homeFylkeCodes });
  return rings.flat().includes(neighbor);
}

export function isPainterNorthCrossFylkePathVariantEligible(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
  neighborCountyCode: string;
}): boolean {
  const profession = String(params.professionSlug ?? "").trim();
  if (profession !== "painter") {
    return false;
  }
  const homeFylkeCodes = childHomeFylkeCodes(params.preferredMunicipalityCodes);
  if (!isPainterNorthHomeFylke(homeFylkeCodes)) {
    return false;
  }
  return isNeighborFylkeReachableFromPainterNorthHome({
    homeFylkeCodes,
    neighborCountyCode: params.neighborCountyCode,
  });
}

export type PainterNorthCrossFylkeInfoCopy = {
  title: string;
  body: string;
};

export function getPainterNorthCrossFylkeInfoCopy(
  locale: string,
  neighborLabel: string
): PainterNorthCrossFylkeInfoCopy {
  if (locale === "nb" || locale === "nn") {
    return {
      title: `Overflateteknikk i ${neighborLabel} (nabofylke)`,
      body: `VG1 Bygg tas i heimfylket ditt; VG2 Overflateteknikk i ${neighborLabel} der Vilbli og PSA bekrefter tilbudet. Læreplass søkes normalt i heimfylket — pendling til VG2 kreves.`,
    };
  }
  return {
    title: `Overflateteknikk in ${neighborLabel} (neighboring county)`,
    body: `VG1 Bygg is taken in your home county; VG2 Overflateteknikk in ${neighborLabel} where Vilbli and PSA confirm availability. Apprenticeship is normally sought in your home county — commuting to VG2 is required.`,
  };
}

/** P-7 UI contract: one curated alternative with VG2 school dropdown. */
export const PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID =
  "painter-north-overflateteknikk-nabofylke" as const;

export const PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_LABEL_NB =
  "Overflateteknikk nabofylke" as const;

/** Canonical VG2 programme slug for nabofylke school dropdown (all neighbor schools share one slug). */
export const PAINTER_NORTH_NABOFYLKE_VG2_PROGRAMME_SLUG =
  "painter-vg2-overflateteknikk-nabofylke" as const;

/** @deprecated Per-neighbor variant ids — superseded by NABOFYLKE merged variant. */
export function painterNorthCrossFylkeVariantId(neighborCountyCode: string): string {
  return `painter-north-overflateteknikk-${neighborCountyCode}`;
}

export function listPainterNorthReachableNeighborCountyCodes(
  preferredMunicipalityCodes: string[]
): string[] {
  const homeFylkeCodes = childHomeFylkeCodes(preferredMunicipalityCodes);
  if (!isPainterNorthHomeFylke(homeFylkeCodes)) {
    return [];
  }
  return PAINTER_NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS.map((neighbor) => neighbor.countyCode).filter(
    (countyCode) =>
      isNeighborFylkeReachableFromPainterNorthHome({ homeFylkeCodes, neighborCountyCode: countyCode })
  );
}

export function isPainterNorthCrossFylkeNabofylkeVariantEligible(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
}): boolean {
  const profession = String(params.professionSlug ?? "").trim();
  if (profession !== "painter") {
    return false;
  }
  return listPainterNorthReachableNeighborCountyCodes(params.preferredMunicipalityCodes).length > 0;
}
