import {
  PATH_FAMILY_OUTCOME_NAV_MAP_VERSION,
  resolvePathFamilyNavMapMatches,
} from "@/lib/nav/path-family-outcome-nav-map";
import { resolvePathFamilySlug } from "@/lib/nav/path-family-slug";
import type { RouteOutcomeFilterId } from "@/lib/nav/route-outcome-filter-id";
import type { VilbliOutcomeProfession } from "./build-path-variants";

export type PathFamilyNavMatch = {
  sourceOutcome: VilbliOutcomeProfession;
  navTitle: string;
  navCode: string;
  navYrkeskategori: string | null;
  catalogProfessionSlug: string;
  reviewNeeded: false;
  reviewReason: null;
  confidence: "high";
  matchMethod: "path_family_map";
  mapVersion: number;
};

export function resolvePathFamilyNavMatches(params: {
  professionSlug: string;
  filterId: RouteOutcomeFilterId;
  outcomes: VilbliOutcomeProfession[];
}): PathFamilyNavMatch[] {
  const pathFamilySlug = resolvePathFamilySlug(params.professionSlug);
  if (!pathFamilySlug) {
    return [];
  }

  const mapped = resolvePathFamilyNavMapMatches({
    pathFamilySlug,
    filterId: params.filterId,
    outcomes: params.outcomes,
    mapVersion: PATH_FAMILY_OUTCOME_NAV_MAP_VERSION,
  });

  return mapped.map((entry) => ({
    sourceOutcome: entry.sourceOutcome,
    navTitle: entry.navTitle,
    navCode: entry.navCode,
    navYrkeskategori: null,
    catalogProfessionSlug: entry.catalogProfessionSlug,
    reviewNeeded: false,
    reviewReason: null,
    confidence: "high",
    matchMethod: "path_family_map",
    mapVersion: PATH_FAMILY_OUTCOME_NAV_MAP_VERSION,
  }));
}
