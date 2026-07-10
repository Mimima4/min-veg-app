import "server-only";

import {
  assessPainterNorthSplitRouteTruthEligibility,
  isPainterNorthCrossFylkePathVariantEligible,
  mergePainterNorthCrossFylkeTruthRows,
  painterHomeVg1ProgrammeSlugsForFylke,
  painterProgrammeSlugsForFylke,
  resolvePainterNorthHomeFylkeCode,
} from "@/lib/regional-delivery/painter-north-cross-fylke-pilot";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildKommuneTransportSortContext } from "@/server/planning/kommune-transport/build-transport-sort-context";
import { applyVerifiedLarebedriftToApprenticeshipSteps } from "./apply-verified-larebedrift-to-apprenticeship-steps";
import { buildPathVariants } from "./build-path-variants";
import { buildRoutePathVariantNavContext } from "./build-route-path-variant-nav-context";
import { buildStepsFromAvailabilityTruth } from "./build-steps-from-availability-truth";
import { getAvailabilityTruth } from "./get-availability-truth";
import {
  attachCatalogProfessionIdsToNavMatches,
  resolveCatalogProfessionIdsForNavMatches,
} from "./resolve-catalog-profession-ids-for-nav-matches";
import { resolveVbaSharedVg2ProgrammeOptions } from "./resolve-vba-shared-vg2-programme-options";
import { selectTruthCandidateForRoute } from "./select-truth-candidate-for-route";

/**
 * P-7 — Vilbli north split: VG1 PSA in home fylke (55/56) + VG2+ PSA in neighbor fylke.
 * Returns [] when home lacks VG1 or neighbor lacks VG2 Overflateteknikk.
 */
export async function buildPainterNorthCrossFylkeRouteSteps(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  neighborCountyCode: string;
  relocationWillingness?: "no" | "maybe" | "yes" | null;
  locale?: string;
}): Promise<StudyRouteSnapshotStep[]> {
  if (
    !isPainterNorthCrossFylkePathVariantEligible({
      professionSlug: params.professionSlug,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
      neighborCountyCode: params.neighborCountyCode,
    })
  ) {
    return [];
  }

  const homeFylkeCode = resolvePainterNorthHomeFylkeCode(params.preferredMunicipalityCodes);
  if (!homeFylkeCode) {
    return [];
  }

  const homeVg1Slugs = painterHomeVg1ProgrammeSlugsForFylke(homeFylkeCode);
  const neighborProgrammeSlugs = painterProgrammeSlugsForFylke(params.neighborCountyCode);
  if (homeVg1Slugs.length === 0 || neighborProgrammeSlugs.length === 0) {
    return [];
  }

  const [homeTruth, neighborTruth] = await Promise.all([
    getAvailabilityTruth({
      countyCode: homeFylkeCode,
      programmeSlugsOrCodes: homeVg1Slugs,
      locale: params.locale,
    }),
    getAvailabilityTruth({
      countyCode: params.neighborCountyCode,
      programmeSlugsOrCodes: neighborProgrammeSlugs,
      locale: params.locale,
    }),
  ]);

  const splitEligibility = assessPainterNorthSplitRouteTruthEligibility({
    homeRows: homeTruth.rows,
    neighborRows: neighborTruth.rows,
  });
  if (!splitEligibility.eligible) {
    return [];
  }

  const mergedTruthRows = mergePainterNorthCrossFylkeTruthRows({
    homeRows: homeTruth.rows,
    neighborRows: neighborTruth.rows,
  });

  const transportSortContext = await buildKommuneTransportSortContext({
    rows: mergedTruthRows,
    homeMunicipalityCodes: params.preferredMunicipalityCodes,
  });

  const selectedTruthCandidate = await selectTruthCandidateForRoute({
    supabase: params.supabase,
    rows: mergedTruthRows,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    relocationWillingness: params.relocationWillingness ?? "maybe",
    transportSortContext,
  });

  const pathVariants = await buildPathVariants(neighborTruth.rows, params.professionSlug);
  const enrichedPathVariants = pathVariants.variants.map((variant) => ({ ...variant }));

  const pathVariantNavContext = await buildRoutePathVariantNavContext({
    supabase: params.supabase,
    professionSlug: params.professionSlug,
    preferredEducationLevel: null,
    pathVariants,
    enrichedPathVariants,
    childContext: true,
  });

  const professionIdBySlug = await resolveCatalogProfessionIdsForNavMatches({
    supabase: params.supabase,
    navMatches: pathVariantNavContext.navMatches,
  });

  const navOutcomesForSteps = attachCatalogProfessionIdsToNavMatches({
    navMatches: pathVariantNavContext.navMatches,
    professionIdBySlug,
  });

  const vg2ProgrammeOptions = await resolveVbaSharedVg2ProgrammeOptions({
    supabase: params.supabase,
    professionSlug: params.professionSlug,
    truthRows: mergedTruthRows,
  });

  let steps = buildStepsFromAvailabilityTruth({
    rows: mergedTruthRows,
    selectedCandidate: selectedTruthCandidate,
    vg2ProgrammeOptions,
    transportSortContext,
    professionSlug: params.professionSlug,
    pathVariants: enrichedPathVariants,
    selectedPathVariantId: pathVariantNavContext.primaryPathVariantId,
    navOutcomes: navOutcomesForSteps,
  });

  steps = await applyVerifiedLarebedriftToApprenticeshipSteps({
    supabase: params.supabase,
    steps,
    professionSlug: params.professionSlug,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    countyCodesForEmployerScope: [homeFylkeCode],
  });

  return steps;
}
