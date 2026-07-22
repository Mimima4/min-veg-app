import "server-only";

import {
  assessNorthCrossFylkeSplitRouteTruthEligibility,
  isNorthCrossFylkeHomeFylke,
  mergeNorthCrossFylkeTruthRows,
  northCrossFylkeHomeVg1ProgrammeSlugsForFylke,
  northCrossFylkeNabofylkeVg2ProgrammeSlug,
  northCrossFylkeProgrammeSlugsForFylke,
  resolveNorthCrossFylkeHomeFylkeCode,
  childHomeFylkeCodes,
} from "@/lib/regional-delivery/painter-north-cross-fylke-pilot";
import { SUPPORTED_VGS_PROFESSION_SLUGS } from "@/lib/vgs/contour-b-operational-eligibility";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildKommuneTransportSortContext } from "@/server/planning/kommune-transport/build-transport-sort-context";
import { applyVerifiedLarebedriftToApprenticeshipSteps } from "./apply-verified-larebedrift-to-apprenticeship-steps";
import { buildPathVariants } from "./build-path-variants";
import { buildRoutePathVariantNavContext } from "./build-route-path-variant-nav-context";
import { buildStepsFromAvailabilityTruth } from "./build-steps-from-availability-truth";
import { getAvailabilityTruth } from "./get-availability-truth";
import { loadVilbliHomeVg2ContinuationTruthRows } from "./load-vilbli-home-vg2-continuation-truth-rows";
import {
  attachCatalogProfessionIdsToNavMatches,
  resolveCatalogProfessionIdsForNavMatches,
} from "./resolve-catalog-profession-ids-for-nav-matches";
import { resolveVbaSharedVg2ProgrammeOptions } from "./resolve-vba-shared-vg2-programme-options";
import { selectTruthCandidateForRoute } from "./select-truth-candidate-for-route";

/**
 * P-7 — VG1 PSA in home fylke + VG2+ from Vilbli home continuations ∩ destination PSA ∩ public.
 * Adjacency PSA dump removed (owner 2026-07-22). Relocation does not gate schools.
 */
export async function buildPainterNorthCrossFylkeMergedRouteSteps(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  relocationWillingness?: "no" | "maybe" | "yes" | null;
  locale?: string;
}): Promise<StudyRouteSnapshotStep[]> {
  void params.relocationWillingness;

  if (!SUPPORTED_VGS_PROFESSION_SLUGS.has(params.professionSlug)) {
    return [];
  }

  const homeFylkeCodes = childHomeFylkeCodes(params.preferredMunicipalityCodes);
  if (!isNorthCrossFylkeHomeFylke(homeFylkeCodes)) {
    return [];
  }

  const homeFylkeCode = resolveNorthCrossFylkeHomeFylkeCode(params.preferredMunicipalityCodes);
  if (!homeFylkeCode) {
    return [];
  }

  const homeProgrammeSlugs = Array.from(
    new Set([
      ...northCrossFylkeHomeVg1ProgrammeSlugsForFylke({
        professionSlug: params.professionSlug,
        fylkeCode: homeFylkeCode,
      }),
      ...northCrossFylkeProgrammeSlugsForFylke({
        professionSlug: params.professionSlug,
        fylkeCode: homeFylkeCode,
      }),
    ])
  );
  if (homeProgrammeSlugs.length === 0) {
    return [];
  }

  const [homeTruth, continuationRows] = await Promise.all([
    getAvailabilityTruth({
      countyCode: homeFylkeCode,
      programmeSlugsOrCodes: homeProgrammeSlugs,
      locale: params.locale,
    }),
    loadVilbliHomeVg2ContinuationTruthRows({
      supabase: params.supabase,
      professionSlug: params.professionSlug,
      homeCountyCode: homeFylkeCode,
      locale: params.locale,
    }),
  ]);

  const splitEligibility = assessNorthCrossFylkeSplitRouteTruthEligibility({
    professionSlug: params.professionSlug,
    homeRows: homeTruth.rows,
    continuationRows,
  });
  if (!splitEligibility.eligible) {
    return [];
  }

  const mergedTruthRows = mergeNorthCrossFylkeTruthRows({
    professionSlug: params.professionSlug,
    homeRows: homeTruth.rows,
    continuationRows,
  });

  return buildStepsFromMergedNorthCrossFylkeTruth({
    supabase: params.supabase,
    professionSlug: params.professionSlug,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    homeFylkeCode,
    mergedTruthRows,
    rowsForPathVariants: continuationRows,
  });
}

/**
 * @deprecated Prefer {@link buildPainterNorthCrossFylkeMergedRouteSteps}.
 * Single-neighbor path kept for old callers; membership is continuation-only.
 */
export async function buildPainterNorthCrossFylkeRouteSteps(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  neighborCountyCode: string;
  relocationWillingness?: "no" | "maybe" | "yes" | null;
  locale?: string;
}): Promise<StudyRouteSnapshotStep[]> {
  void params.neighborCountyCode;
  return buildPainterNorthCrossFylkeMergedRouteSteps(params);
}

async function buildStepsFromMergedNorthCrossFylkeTruth(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  homeFylkeCode: string;
  mergedTruthRows: Awaited<ReturnType<typeof getAvailabilityTruth>>["rows"];
  rowsForPathVariants: Awaited<ReturnType<typeof getAvailabilityTruth>>["rows"];
}): Promise<StudyRouteSnapshotStep[]> {
  const transportSortContext = await buildKommuneTransportSortContext({
    rows: params.mergedTruthRows,
    homeMunicipalityCodes: params.preferredMunicipalityCodes,
  });

  const selectedTruthCandidate = await selectTruthCandidateForRoute({
    supabase: params.supabase,
    rows: params.mergedTruthRows,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    relocationWillingness: null,
    transportSortContext,
  });

  const pathVariants = await buildPathVariants(
    params.rowsForPathVariants,
    params.professionSlug
  );
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
    truthRows: params.mergedTruthRows,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
  });

  const nabofylkeSlug = northCrossFylkeNabofylkeVg2ProgrammeSlug(params.professionSlug);

  let steps = buildStepsFromAvailabilityTruth({
    rows: params.mergedTruthRows,
    selectedCandidate: selectedTruthCandidate,
    vg2ProgrammeOptions,
    transportSortContext,
    professionSlug: params.professionSlug,
    pathVariants: enrichedPathVariants,
    selectedPathVariantId: pathVariantNavContext.primaryPathVariantId,
    navOutcomes: navOutcomesForSteps,
    selectedVg2ProgramSlug: nabofylkeSlug,
  });

  steps = await applyVerifiedLarebedriftToApprenticeshipSteps({
    supabase: params.supabase,
    steps,
    professionSlug: params.professionSlug,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    countyCodesForEmployerScope: [params.homeFylkeCode],
  });

  return steps;
}
