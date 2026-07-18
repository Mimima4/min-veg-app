import "server-only";

import { isLosaAvailabilityScope } from "@/lib/losa/availability-scope";
import {
  anleggsteknikkVg2ProgrammeSlugsForFylke,
  childHomeFylkeCodes,
} from "@/lib/regional-delivery/anleggsteknikk-sparse-vg2-pilot";
import {
  resolveSchoolGeographyScope,
  type RelocationWillingness,
} from "@/lib/planning/school-geography-scope";
import { isSparseVg2PilotProfession } from "@/lib/vgs/sparse-vg2-alternative-eligibility";
import {
  getAvailabilityTruth,
  type AvailabilityTruthRow,
} from "./get-availability-truth";

/**
 * P-8 / RG-2 — north-zone primary must surface Nordland (and peer north) VG2 seats.
 *
 * Alternative exclusion uses expanded primary scope `{55,56}+{18}`, but home-county truth
 * alone never loads those PSA rows → Fauske (and Troms→Kirkenes) vanished from both layers.
 * Contract: widen primary *picker* schools without changing the home-county chain identity.
 */
export async function enrichAnleggsteknikkNorthZonePrimaryTruthRows(params: {
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  relocationWillingness: RelocationWillingness;
  homeTruthRows: AvailabilityTruthRow[];
  locale?: string;
}): Promise<AvailabilityTruthRow[]> {
  if (!isSparseVg2PilotProfession(params.professionSlug)) {
    return params.homeTruthRows;
  }

  const primaryScope = resolveSchoolGeographyScope({
    layer: "primary",
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    relocationWillingness: params.relocationWillingness,
    sparseVg2GateActive: true,
  });
  const allowed = primaryScope.allowedFylkeCodes;
  if (!allowed || allowed.size === 0) {
    return params.homeTruthRows;
  }

  const homeFylkeCodes = new Set(childHomeFylkeCodes(params.preferredMunicipalityCodes));
  const extraFylkeCodes = [...allowed].filter((code) => !homeFylkeCodes.has(code));
  if (extraFylkeCodes.length === 0) {
    return params.homeTruthRows;
  }

  const existingVg2InstitutionIds = new Set(
    params.homeTruthRows
      .filter(
        (row) =>
          row.stage === "VG2" &&
          row.institutionId &&
          !isLosaAvailabilityScope(row.availabilityScope)
      )
      .map((row) => row.institutionId as string)
  );

  const extraVg2Rows: AvailabilityTruthRow[] = [];
  for (const fylkeCode of extraFylkeCodes) {
    const programmeSlugs = anleggsteknikkVg2ProgrammeSlugsForFylke(fylkeCode);
    if (programmeSlugs.length === 0) {
      continue;
    }
    const truth = await getAvailabilityTruth({
      countyCode: fylkeCode,
      programmeSlugsOrCodes: programmeSlugs,
      locale: params.locale,
    });
    for (const row of truth.rows) {
      if (row.stage !== "VG2" || isLosaAvailabilityScope(row.availabilityScope)) {
        continue;
      }
      if (row.institutionId && existingVg2InstitutionIds.has(row.institutionId)) {
        continue;
      }
      if (row.institutionId) {
        existingVg2InstitutionIds.add(row.institutionId);
      }
      extraVg2Rows.push(row);
    }
  }

  if (extraVg2Rows.length === 0) {
    return params.homeTruthRows;
  }

  return [...params.homeTruthRows, ...extraVg2Rows];
}
