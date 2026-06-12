import type { RouteOutcomeFilterId } from "@/lib/nav/route-outcome-filter-id";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { KommuneTransportSortContext } from "@/lib/planning/kommune-transport/types";
import type { AvailabilityTruthRow } from "./get-availability-truth";
import { buildRoutePathVariantNavContext } from "./build-route-path-variant-nav-context";
import { buildStepsFromAvailabilityTruth } from "./build-steps-from-availability-truth";
import type { PathVariant, PathVariantsResult } from "./build-path-variants";
import type { NavOccupationSnapshot } from "@/server/nav/get-nav-occupation-snapshot";
import {
  attachCatalogProfessionIdsToNavMatches,
  resolveCatalogProfessionIdsForNavMatches,
} from "./resolve-catalog-profession-ids-for-nav-matches";
export async function buildTruthRouteStepsForOutcomeFilter(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  filterId: RouteOutcomeFilterId;
  rows: AvailabilityTruthRow[];
  selectedCandidate: AvailabilityTruthRow | null;
  transportSortContext: KommuneTransportSortContext;
  pathVariants: PathVariantsResult;
  enrichedPathVariants: PathVariant[];
  childContext: boolean;
  navOccupationSnapshot?: NavOccupationSnapshot | null;
  professionIdBySlug?: Map<string, string>;
}): Promise<{
  steps: StudyRouteSnapshotStep[];
  pathVariantNavContext: Awaited<ReturnType<typeof buildRoutePathVariantNavContext>>;
}> {
  const pathVariantNavContext = await buildRoutePathVariantNavContext({
    supabase: params.supabase,
    professionSlug: params.professionSlug,
    preferredEducationLevel: null,
    filterIdOverride: params.filterId,
    pathVariants: params.pathVariants,
    enrichedPathVariants: params.enrichedPathVariants,
    childContext: params.childContext,
    navOccupationSnapshot: params.navOccupationSnapshot,
  });

  const professionIdBySlug =
    params.professionIdBySlug ??
    (await resolveCatalogProfessionIdsForNavMatches({
      supabase: params.supabase,
      navMatches: pathVariantNavContext.navMatches,
    }));
  const navOutcomesForSteps = attachCatalogProfessionIdsToNavMatches({
    navMatches: pathVariantNavContext.navMatches,
    professionIdBySlug,
  });

  const steps = buildStepsFromAvailabilityTruth({
    rows: params.rows,
    selectedCandidate: params.selectedCandidate,
    transportSortContext: params.transportSortContext,
    professionSlug: params.professionSlug,
    pathVariants: params.enrichedPathVariants,
    selectedPathVariantId: pathVariantNavContext.primaryPathVariantId,
    navOutcomes: navOutcomesForSteps,
  });

  return { steps, pathVariantNavContext };
}
