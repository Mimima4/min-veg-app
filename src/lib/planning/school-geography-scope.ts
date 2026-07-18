/**
 * P-8 / P4-RELOCATION-GEOGRAPHY — north regional zone for historical cross-fylke school access.
 * Charter: phase-4-relocation-geography-contract-owner-decision-record.md §4.1
 */
import { normalizeFylkeCodesFromMunicipalityCodes } from "@/lib/planning/norway-geo-code-normalization";

export const NORTH_ZONE_HOME_FYLKE_CODES = new Set(["55", "56"]);

/** Nordland — historical school-service partner for Troms/Finnmark. */
export const NORTH_ZONE_FRIENDLY_FYLKE_CODES = new Set(["18"]);

export type SchoolGeographyLayer = "primary" | "alternative";

export type RelocationWillingness = "no" | "maybe" | "yes" | null;

export type SchoolGeographyScope = {
  /** Fylke codes allowed for institution pickers at this layer. */
  allowedFylkeCodes: Set<string> | null;
  /** When true, national PSA-backed schools outside primary scope may appear in alternatives. */
  allowNationalSparseAlternative: boolean;
};

function isNorthZoneHome(homeFylkeCodes: string[]): boolean {
  return homeFylkeCodes.some((code) => NORTH_ZONE_HOME_FYLKE_CODES.has(code));
}

/**
 * Resolves which fylke codes may surface school institutions for C-VGS pickers.
 * Does not load PSA — filter only.
 *
 * Before P-8 wiring: callers pass sparseVg2GateActive=false for unchanged behaviour.
 */
export function resolveSchoolGeographyScope(params: {
  layer: SchoolGeographyLayer;
  preferredMunicipalityCodes: string[];
  relocationWillingness: RelocationWillingness;
  /** When false, returns home-fylke-only primary scope (current production behaviour). */
  sparseVg2GateActive: boolean;
}): SchoolGeographyScope {
  const homeFylkeCodes = normalizeFylkeCodesFromMunicipalityCodes(
    params.preferredMunicipalityCodes
  );

  if (!params.sparseVg2GateActive) {
    const homeOnly = new Set(homeFylkeCodes);
    return {
      allowedFylkeCodes: homeOnly.size > 0 ? homeOnly : null,
      allowNationalSparseAlternative: false,
    };
  }

  if (params.layer === "primary") {
    const allowed = new Set(homeFylkeCodes);
    if (isNorthZoneHome(homeFylkeCodes)) {
      for (const code of NORTH_ZONE_FRIENDLY_FYLKE_CODES) {
        allowed.add(code);
      }
    }
    return {
      allowedFylkeCodes: allowed.size > 0 ? allowed : null,
      allowNationalSparseAlternative: false,
    };
  }

  const relocation = params.relocationWillingness ?? "no";
  if (relocation === "no") {
    return {
      allowedFylkeCodes: null,
      allowNationalSparseAlternative: false,
    };
  }

  return {
    allowedFylkeCodes: null,
    allowNationalSparseAlternative: true,
  };
}

export function rowMatchesSchoolGeographyScope(params: {
  countyCode: string | null | undefined;
  scope: SchoolGeographyScope;
  /** Used when allowNationalSparseAlternative — row may be outside primary allowed set. */
  treatAsNationalSparse: boolean;
}): boolean {
  const county = String(params.countyCode ?? "").trim();
  if (!county) {
    return false;
  }

  if (params.treatAsNationalSparse && params.scope.allowNationalSparseAlternative) {
    return true;
  }

  const allowed = params.scope.allowedFylkeCodes;
  if (!allowed) {
    return false;
  }
  return allowed.has(county);
}
