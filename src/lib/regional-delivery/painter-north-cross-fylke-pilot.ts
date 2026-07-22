/**
 * P-7 — north cross-fylke (nabofylke) when home fylke is Nordland/Troms/Finnmark and lacks local VG2.
 * Profession-agnostic Contour B overlay (painter precedent generalized).
 * Policy: phase-4-county-local-primary-route-completeness-owner-policy.md (R-3)
 *
 * Scope: home fylke {18,55,56} — not nationwide adjacency.
 * Relocation willingness does not gate eligibility or alternative visibility.
 * P-8 (national sparse) stays separate / owner-chartered.
 * Neighbor VG2+ pool excludes privatskole (north Vilbli chain pages list public continuations).
 */
import { isLosaAvailabilityScope } from "@/lib/losa/availability-scope";
import { normalizeFylkeCodesFromMunicipalityCodes } from "@/lib/planning/norway-geo-code-normalization";
import { deriveFylkeAdjacencyRings } from "@/lib/planning/norway-fylke-adjacency";
import { SUPPORTED_VGS_PROFESSION_SLUGS } from "@/lib/vgs/contour-b-operational-eligibility";
import { FYLKE_CODE_TO_VILBLI_COUNTY_SLUG } from "@/lib/vgs/vilbli-county-meta";
import {
  assessHomeCountyPrimaryRouteEligibility,
  listMissingPrimarySchoolChainStages,
  type PrimaryRequiredSchoolStage,
} from "@/lib/vgs/home-county-primary-route-completeness";
import { isVbaSharedVg1Profession } from "@/lib/vgs/vg2-cross-profession";
import type { AvailabilityTruthRow } from "@/server/children/routes/get-availability-truth";

/** Nordland + Troms + Finnmark — north zone homes for nabofylke VG2 commute. */
export const NORTH_CROSS_FYLKE_HOME_FYLKE_CODES = new Set(["18", "55", "56"]);

/**
 * Neighbor counties scanned for VG2 (filtered by adjacency from home; home excluded).
 * Includes Troms `55` so Finnmark/Nordland homes can use Troms VG2.
 */
export const NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS = [
  { countyCode: "18", labelNb: "Nordland", labelEn: "Nordland" },
  { countyCode: "50", labelNb: "Trøndelag", labelEn: "Trøndelag" },
  { countyCode: "55", labelNb: "Troms", labelEn: "Troms" },
] as const;

/** @deprecated Use NORTH_CROSS_FYLKE_HOME_FYLKE_CODES */
export const PAINTER_NORTH_HOME_FYLKE_CODES = NORTH_CROSS_FYLKE_HOME_FYLKE_CODES;

/** @deprecated Use NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS */
export const PAINTER_NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS = NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS;

/** Slug middles aligned with `scripts/vgs-programme-materialization-planner.mjs`. */
const PROFESSION_COUNTY_SLUG_MIDDLES: Record<
  string,
  { vg1: string; vg2: string; vg2TitleNb: string }
> = {
  electrician: { vg1: "vg1-elektro", vg2: "vg2-elenergi", vg2TitleNb: "Elenergi og ekom" },
  mechanic: { vg1: "vg1-teknologi", vg2: "vg2-kjoretoy", vg2TitleNb: "Kjøretøy" },
  carpenter: { vg1: "vg1-bygg", vg2: "vg2-tomrer", vg2TitleNb: "Tømrerfaget" },
  plumber: { vg1: "vg1-bygg", vg2: "vg2-rorlegger", vg2TitleNb: "Rørleggerfaget" },
  painter: {
    vg1: "vg1-bygg",
    vg2: "vg2-overflateteknikk",
    vg2TitleNb: "Overflateteknikk",
  },
  anleggsteknikk: {
    vg1: "vg1-bygg",
    vg2: "vg2-anleggsteknikk",
    vg2TitleNb: "Anleggsteknikkfaget",
  },
  klima: {
    vg1: "vg1-bygg",
    vg2: "vg2-klima",
    vg2TitleNb: "Klima, energi og miljøteknikk",
  },
  murer: {
    vg1: "vg1-bygg",
    vg2: "vg2-betong-mur",
    vg2TitleNb: "Betong og mur",
  },
  anleggsgartner: {
    vg1: "vg1-bygg",
    vg2: "vg2-anleggsgartner",
    vg2TitleNb: "Anleggsgartner",
  },
};

function countySlugForFylke(fylkeCode: string): string | null {
  const normalized = String(fylkeCode ?? "").trim();
  if (normalized === "50") {
    return "trondelag";
  }
  return FYLKE_CODE_TO_VILBLI_COUNTY_SLUG[normalized] ?? null;
}

export function northCrossFylkeProgrammeSlugsForFylke(params: {
  professionSlug: string;
  fylkeCode: string;
}): string[] {
  const profession = String(params.professionSlug ?? "").trim();
  const middles = PROFESSION_COUNTY_SLUG_MIDDLES[profession];
  const countySlug = countySlugForFylke(params.fylkeCode);
  if (!middles || !countySlug) {
    return [];
  }
  return [
    `${profession}-${middles.vg1}-${countySlug}`,
    `${profession}-${middles.vg2}-${countySlug}`,
  ];
}

/** @deprecated Prefer northCrossFylkeProgrammeSlugsForFylke({ professionSlug: "painter", … }) */
export function painterProgrammeSlugsForFylke(fylkeCode: string): string[] {
  return northCrossFylkeProgrammeSlugsForFylke({
    professionSlug: "painter",
    fylkeCode,
  });
}

/** Home VG1 PSA slugs; V.BA shared professions may also read carpenter VG1 rows. */
export function northCrossFylkeHomeVg1ProgrammeSlugsForFylke(params: {
  professionSlug: string;
  fylkeCode: string;
}): string[] {
  const profession = String(params.professionSlug ?? "").trim();
  const ownVg1 = northCrossFylkeProgrammeSlugsForFylke({
    professionSlug: profession,
    fylkeCode: params.fylkeCode,
  }).filter((slug) => slug.includes("-vg1-"));

  if (!isVbaSharedVg1Profession(profession)) {
    return ownVg1;
  }

  const countySlug = countySlugForFylke(params.fylkeCode);
  if (!countySlug) {
    return ownVg1;
  }
  const carpenterVg1 = `carpenter-vg1-bygg-${countySlug}`;
  return Array.from(new Set([...ownVg1, carpenterVg1]));
}

/** @deprecated */
export function painterHomeVg1ProgrammeSlugsForFylke(fylkeCode: string): string[] {
  return northCrossFylkeHomeVg1ProgrammeSlugsForFylke({
    professionSlug: "painter",
    fylkeCode,
  });
}

function countyScopedSchoolRows(rows: AvailabilityTruthRow[]): AvailabilityTruthRow[] {
  return rows.filter((row) => !isLosaAvailabilityScope(row.availabilityScope));
}

/**
 * P-7 nabofylke VG2+ school pool: exclude private schools.
 * Vilbli north home pages (18/55/56) for sparse VG2 chains list public
 * out-of-fylke continuations — not privatskole markers — so neighbor PSA
 * privatskole (e.g. Øya in Trøndelag) must not enter the P-7 dropdown.
 */
function isPublicSchoolTruthRow(row: AvailabilityTruthRow): boolean {
  return row.institutionIsPrivateSchool !== true;
}

export function northCrossFylkeNabofylkeVg2ProgrammeSlug(professionSlug: string): string {
  const profession = String(professionSlug ?? "").trim();
  const middles = PROFESSION_COUNTY_SLUG_MIDDLES[profession];
  if (!middles) {
    return `${profession}-vg2-nabofylke`;
  }
  return `${profession}-${middles.vg2}-nabofylke`;
}

export function northCrossFylkeNabofylkeVariantId(professionSlug: string): string {
  const profession = String(professionSlug ?? "").trim();
  if (profession === "painter") {
    return PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID;
  }
  return `${profession}-north-vg2-nabofylke`;
}

export function northCrossFylkeVg2TitleNb(professionSlug: string): string {
  const profession = String(professionSlug ?? "").trim();
  return PROFESSION_COUNTY_SLUG_MIDDLES[profession]?.vg2TitleNb ?? "VG2";
}

export function resolveNorthCrossFylkeHomeFylkeCode(
  preferredMunicipalityCodes: string[]
): string | null {
  return (
    childHomeFylkeCodes(preferredMunicipalityCodes).find((code) =>
      NORTH_CROSS_FYLKE_HOME_FYLKE_CODES.has(code)
    ) ?? null
  );
}

/** @deprecated */
export const resolvePainterNorthHomeFylkeCode = resolveNorthCrossFylkeHomeFylkeCode;

export function mergeNorthCrossFylkeTruthRows(params: {
  professionSlug: string;
  homeRows: AvailabilityTruthRow[];
  neighborRows: AvailabilityTruthRow[];
}): AvailabilityTruthRow[] {
  const nabofylkeSlug = northCrossFylkeNabofylkeVg2ProgrammeSlug(params.professionSlug);
  const homeVg1 = params.homeRows.filter((row) => row.stage === "VG1");
  const neighborFromVg2 = countyScopedSchoolRows(params.neighborRows)
    .filter((row) => row.stage !== "VG1")
    .filter(isPublicSchoolTruthRow)
    .map((row) =>
      row.stage === "VG2" ? { ...row, programSlug: nabofylkeSlug } : row
    );
  return [...homeVg1, ...neighborFromVg2];
}

/** @deprecated */
export function mergePainterNorthCrossFylkeTruthRows(params: {
  homeRows: AvailabilityTruthRow[];
  neighborRows: AvailabilityTruthRow[];
}): AvailabilityTruthRow[] {
  return mergeNorthCrossFylkeTruthRows({
    professionSlug: "painter",
    homeRows: params.homeRows,
    neighborRows: params.neighborRows,
  });
}

export function assessNorthCrossFylkeSplitRouteTruthEligibility(params: {
  professionSlug: string;
  homeRows: AvailabilityTruthRow[];
  neighborRows: AvailabilityTruthRow[];
}): {
  eligible: boolean;
  homeHasVg1: boolean;
  homeHasVg2: boolean;
  neighborHasVg2: boolean;
  missingMergedStages: PrimaryRequiredSchoolStage[];
} {
  const homeSchool = countyScopedSchoolRows(params.homeRows);
  const neighborSchool = countyScopedSchoolRows(params.neighborRows).filter(
    isPublicSchoolTruthRow
  );
  const homeHasVg1 = homeSchool.some((row) => row.stage === "VG1");
  const homeHasVg2 = homeSchool.some((row) => row.stage === "VG2");
  const neighborHasVg2 = neighborSchool.some((row) => row.stage === "VG2");
  const merged = mergeNorthCrossFylkeTruthRows({
    professionSlug: params.professionSlug,
    homeRows: params.homeRows,
    neighborRows: params.neighborRows,
  });
  const mergedEligibility = assessHomeCountyPrimaryRouteEligibility({
    truthRows: merged,
  });
  return {
    eligible:
      homeHasVg1 && !homeHasVg2 && neighborHasVg2 && mergedEligibility.eligible,
    homeHasVg1,
    homeHasVg2,
    neighborHasVg2,
    missingMergedStages: listMissingPrimarySchoolChainStages(merged),
  };
}

/** @deprecated */
export function assessPainterNorthSplitRouteTruthEligibility(params: {
  homeRows: AvailabilityTruthRow[];
  neighborRows: AvailabilityTruthRow[];
}): {
  eligible: boolean;
  homeHasVg1: boolean;
  neighborHasVg2: boolean;
  missingMergedStages: PrimaryRequiredSchoolStage[];
} {
  const result = assessNorthCrossFylkeSplitRouteTruthEligibility({
    professionSlug: "painter",
    homeRows: params.homeRows,
    neighborRows: params.neighborRows,
  });
  return {
    eligible: result.eligible,
    homeHasVg1: result.homeHasVg1,
    neighborHasVg2: result.neighborHasVg2,
    missingMergedStages: result.missingMergedStages,
  };
}

export function childHomeFylkeCodes(preferredMunicipalityCodes: string[]): string[] {
  return normalizeFylkeCodesFromMunicipalityCodes(preferredMunicipalityCodes);
}

export function isNorthCrossFylkeHomeFylke(homeFylkeCodes: string[]): boolean {
  return homeFylkeCodes.some((code) => NORTH_CROSS_FYLKE_HOME_FYLKE_CODES.has(code));
}

/** @deprecated */
export const isPainterNorthHomeFylke = isNorthCrossFylkeHomeFylke;

export function isNeighborFylkeReachableFromNorthHome(params: {
  homeFylkeCodes: string[];
  neighborCountyCode: string;
}): boolean {
  const neighbor = String(params.neighborCountyCode ?? "").trim();
  if (!neighbor) {
    return false;
  }
  if (params.homeFylkeCodes.includes(neighbor)) {
    return false;
  }
  const rings = deriveFylkeAdjacencyRings({ homeFylkeCodes: params.homeFylkeCodes });
  return rings.flat().includes(neighbor);
}

/** @deprecated */
export const isNeighborFylkeReachableFromPainterNorthHome =
  isNeighborFylkeReachableFromNorthHome;

export function isNorthCrossFylkePathVariantEligible(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
  neighborCountyCode: string;
}): boolean {
  const profession = String(params.professionSlug ?? "").trim();
  if (!SUPPORTED_VGS_PROFESSION_SLUGS.has(profession)) {
    return false;
  }
  const homeFylkeCodes = childHomeFylkeCodes(params.preferredMunicipalityCodes);
  if (!isNorthCrossFylkeHomeFylke(homeFylkeCodes)) {
    return false;
  }
  return isNeighborFylkeReachableFromNorthHome({
    homeFylkeCodes,
    neighborCountyCode: params.neighborCountyCode,
  });
}

/** @deprecated */
export function isPainterNorthCrossFylkePathVariantEligible(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
  neighborCountyCode: string;
}): boolean {
  return isNorthCrossFylkePathVariantEligible(params);
}

export type NorthCrossFylkeInfoCopy = {
  title: string;
  body: string;
};

export function getNorthCrossFylkeInfoCopy(
  locale: string,
  neighborLabel: string,
  professionSlug: string
): NorthCrossFylkeInfoCopy {
  const vg2Title = northCrossFylkeVg2TitleNb(professionSlug);
  if (locale === "nb" || locale === "nn") {
    return {
      title: `${vg2Title} i ${neighborLabel} (nabofylke)`,
      body: `VG1 tas i heimfylket ditt; VG2 ${vg2Title} i ${neighborLabel} der Vilbli og PSA bekrefter tilbudet. Læreplass søkes normalt i heimfylket — pendling til VG2 kreves.`,
    };
  }
  return {
    title: `${vg2Title} in ${neighborLabel} (neighboring county)`,
    body: `VG1 is taken in your home county; VG2 ${vg2Title} in ${neighborLabel} where Vilbli and PSA confirm availability. Apprenticeship is normally sought in your home county — commuting to VG2 is required.`,
  };
}

/** @deprecated */
export function getPainterNorthCrossFylkeInfoCopy(
  locale: string,
  neighborLabel: string
): NorthCrossFylkeInfoCopy {
  return getNorthCrossFylkeInfoCopy(locale, neighborLabel, "painter");
}

/** Painter historical UI contract id — keep stable for E2E / archived rows. */
export const PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID =
  "painter-north-overflateteknikk-nabofylke" as const;

export const PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_LABEL_NB =
  "Overflateteknikk nabofylke" as const;

export const PAINTER_NORTH_NABOFYLKE_VG2_PROGRAMME_SLUG =
  "painter-vg2-overflateteknikk-nabofylke" as const;

export function buildNorthCrossFylkeNabofylkeVariantLabel(professionSlug: string): string {
  const profession = String(professionSlug ?? "").trim();
  if (profession === "painter") {
    return PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_LABEL_NB;
  }
  return `${northCrossFylkeVg2TitleNb(profession)} nabofylke`;
}

/** @deprecated Per-neighbor variant ids — superseded by NABOFYLKE merged variant. */
export function painterNorthCrossFylkeVariantId(neighborCountyCode: string): string {
  return `painter-north-overflateteknikk-${neighborCountyCode}`;
}

export function listNorthCrossFylkeReachableNeighborCountyCodes(
  preferredMunicipalityCodes: string[]
): string[] {
  const homeFylkeCodes = childHomeFylkeCodes(preferredMunicipalityCodes);
  if (!isNorthCrossFylkeHomeFylke(homeFylkeCodes)) {
    return [];
  }
  return NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS.map((neighbor) => neighbor.countyCode).filter(
    (countyCode) =>
      isNeighborFylkeReachableFromNorthHome({
        homeFylkeCodes,
        neighborCountyCode: countyCode,
      })
  );
}

/** @deprecated */
export function listPainterNorthReachableNeighborCountyCodes(
  preferredMunicipalityCodes: string[]
): string[] {
  return listNorthCrossFylkeReachableNeighborCountyCodes(preferredMunicipalityCodes);
}

export function isNorthCrossFylkeNabofylkeVariantEligible(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
}): boolean {
  const profession = String(params.professionSlug ?? "").trim();
  if (!SUPPORTED_VGS_PROFESSION_SLUGS.has(profession)) {
    return false;
  }
  return (
    listNorthCrossFylkeReachableNeighborCountyCodes(params.preferredMunicipalityCodes)
      .length > 0
  );
}

/** @deprecated */
export function isPainterNorthCrossFylkeNabofylkeVariantEligible(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
}): boolean {
  return isNorthCrossFylkeNabofylkeVariantEligible(params);
}

export function isNorthCrossFylkeCuratedVariantId(curatedRegionalVariantId: string): boolean {
  const id = String(curatedRegionalVariantId ?? "").trim();
  if (id === PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID) {
    return true;
  }
  return /^.+-north-vg2-nabofylke$/.test(id);
}
