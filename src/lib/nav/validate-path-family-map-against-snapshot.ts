import {
  PATH_FAMILY_OUTCOME_NAV_MAP_ROWS,
  PATH_FAMILY_OUTCOME_NAV_MAP_VERSION,
} from "./path-family-outcome-nav-map";

export function collectPathFamilyMapStyrkCodes(mapVersion = PATH_FAMILY_OUTCOME_NAV_MAP_VERSION): string[] {
  return Array.from(
    new Set(
      PATH_FAMILY_OUTCOME_NAV_MAP_ROWS.filter((row) => row.mapVersion === mapVersion).map(
        (row) => row.navStyrkCode
      )
    )
  );
}

export function validatePathFamilyMapAgainstSnapshot(params: {
  occupationCodes: Set<string>;
  mapVersion?: number;
}): { ok: true } | { ok: false; missingStyrkCodes: string[] } {
  const mapVersion = params.mapVersion ?? PATH_FAMILY_OUTCOME_NAV_MAP_VERSION;
  const required = collectPathFamilyMapStyrkCodes(mapVersion);
  const missingStyrkCodes = required.filter((code) => !params.occupationCodes.has(code));
  if (missingStyrkCodes.length > 0) {
    return { ok: false, missingStyrkCodes };
  }
  return { ok: true };
}
