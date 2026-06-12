import { normalizeRouteOutcomeFilterId } from "@/lib/nav/route-outcome-filter-id";
import {
  getCurrentNavOccupationSnapshot,
  type NavOccupationSnapshot,
} from "@/server/nav/get-nav-occupation-snapshot";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PathVariant, PathVariantsResult } from "./build-path-variants";
import { resolvePathFamilyNavMatches } from "./resolve-path-family-nav-matches";
import { resolvePathVariantForFilter } from "./resolve-path-variant-for-filter";
import { scopeOutcomesForPathVariant } from "./scope-outcomes-for-path-variant";

export type RoutePathVariantNavContext = {
  filterId: ReturnType<typeof normalizeRouteOutcomeFilterId>;
  effectiveFilterId: ReturnType<typeof resolvePathVariantForFilter>["effectiveFilterId"];
  primaryPathVariantId: string | null;
  hiddenFilterIds: ReturnType<typeof resolvePathVariantForFilter>["hiddenFilterIds"];
  scopedOutcomes: PathVariantsResult["outcomes"];
  navMatches: ReturnType<typeof resolvePathFamilyNavMatches>;
  navSnapshotVersion: number | null;
};

export async function buildRoutePathVariantNavContext(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  preferredEducationLevel: string | null;
  filterIdOverride?: ReturnType<typeof normalizeRouteOutcomeFilterId>;
  pathVariants: PathVariantsResult;
  enrichedPathVariants: PathVariant[];
  childContext: boolean;
  /** Reuse within one recompute turn to avoid repeated snapshot reads. */
  navOccupationSnapshot?: NavOccupationSnapshot | null;
}): Promise<RoutePathVariantNavContext> {
  const filterId =
    params.filterIdOverride ?? normalizeRouteOutcomeFilterId(params.preferredEducationLevel);
  const variantResolution = resolvePathVariantForFilter({
    filterId,
    professionSlug: params.professionSlug,
    variants: params.enrichedPathVariants,
    childContext: params.childContext,
    hasVg3SchoolProgrammeAvailability: params.pathVariants.hasVg3SchoolProgrammeAvailability,
  });

  const scopedPathVariants: PathVariantsResult = {
    ...params.pathVariants,
    variants: params.enrichedPathVariants,
  };

  const scopedOutcomes = scopeOutcomesForPathVariant({
    pathVariants: scopedPathVariants,
    primaryPathVariantId: variantResolution.primaryPathVariantId,
  });

  const rawNavMatches = resolvePathFamilyNavMatches({
    professionSlug: params.professionSlug,
    filterId: variantResolution.effectiveFilterId,
    outcomes: scopedOutcomes,
  });

  const snapshot =
    params.navOccupationSnapshot !== undefined
      ? params.navOccupationSnapshot
      : await getCurrentNavOccupationSnapshot(params.supabase);
  const navMatches = snapshot
    ? rawNavMatches
        .filter((match) => snapshot.occupationsByCode.has(match.navCode))
        .map((match) => ({
          ...match,
          navYrkeskategori:
            snapshot.occupationsByCode.get(match.navCode)?.level1Label ?? null,
        }))
    : [];

  return {
    filterId,
    effectiveFilterId: variantResolution.effectiveFilterId,
    primaryPathVariantId: variantResolution.primaryPathVariantId,
    hiddenFilterIds: variantResolution.hiddenFilterIds,
    scopedOutcomes,
    navMatches,
    navSnapshotVersion: snapshot?.snapshotVersion ?? null,
  };
}
