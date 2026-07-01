import { normalizeMunicipalityCode } from "@/lib/planning/geo-distance";

export type RelocationWillingness = "no" | "maybe" | "yes" | null;

/** Within-home-fylke radius when the family is open to nearby communes. */
const MAYBE_MAX_DISTANCE_KM = 80;

type RowWithMunicipality = {
  municipality_code: string;
};

/**
 * Resolved geography for verified lærebedrift options (charter: scope follows
 * relocation willingness — not the entire fylke by default).
 */
export function filterRowsByLarebedriftGeographyScope<T extends RowWithMunicipality>(params: {
  rows: T[];
  homeMunicipalityCodes: string[];
  relocationWillingness: RelocationWillingness;
  distanceKm: (municipalityCode: string) => number;
}): T[] {
  const homeSet = new Set(params.homeMunicipalityCodes);

  const inHomeKommune = params.rows.filter((row) => {
    const code = normalizeMunicipalityCode(row.municipality_code);
    return code ? homeSet.has(code) : false;
  });

  if (params.relocationWillingness === "yes") {
    return params.rows;
  }

  if (params.relocationWillingness === "maybe") {
    const withinRadius = params.rows.filter(
      (row) => params.distanceKm(row.municipality_code) <= MAYBE_MAX_DISTANCE_KM
    );
    return withinRadius.length > 0 ? withinRadius : inHomeKommune;
  }

  return inHomeKommune;
}
