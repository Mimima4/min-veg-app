import type { VilbliOutcomeProfession } from "./build-path-variants";

/**
 * @deprecated Use resolvePathFamilyNavMatches + nav_occupation_snapshot (P4-NM-A/B).
 */
export async function mapVilbliOutcomesToNav(_params: {
  outcomes: VilbliOutcomeProfession[];
  maxCandidates?: number;
}): Promise<{
  mapped: never[];
}> {
  throw new Error(
    "mapVilbliOutcomesToNav is deprecated. Use resolvePathFamilyNavMatches with materialized NAV snapshot."
  );
}
