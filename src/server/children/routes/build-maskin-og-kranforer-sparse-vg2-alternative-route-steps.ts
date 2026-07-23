import "server-only";

import {
  anleggsteknikkHomeVg1ProgrammeSlugsForFylke,
  anleggsteknikkVilbliChainUrlForFylke,
  countNationalSparseVg2Schools,
  mergeAnleggsteknikkSparseVg2TruthRows,
  resolveAnleggsteknikkHomeFylkeCode,
  anleggsteknikkVg2ProgrammeSlugsForFylke,
  MASKIN_OG_KRANFORER_SPARSE_VG2_CANDIDATE_FYLKE_CODES,
} from "@/lib/regional-delivery/maskin-og-kranforer-sparse-vg2-pilot";
import {
  enrichTransportSortContextWithVg2DistanceRanks,
  filterAndRankSparseVg2RowsByHomeDistance,
} from "@/lib/regional-delivery/maskin-og-kranforer-sparse-vg2-distance-rank";
import {
  resolveSchoolGeographyScope,
  type RelocationWillingness,
} from "@/lib/planning/school-geography-scope";
import {
  assessSparseVg2AlternativeEligibility,
  MASKIN_OG_KRANFORER_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG,
  isSparseVg2PilotProfession,
} from "@/lib/vgs/sparse-vg2-alternative-eligibility";
import { isLarefagSelectionStage } from "@/lib/vgs/larefag-selection-stage";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildKommuneTransportSortContext } from "@/server/planning/kommune-transport/build-transport-sort-context";
import { applyVerifiedLarebedriftToApprenticeshipSteps } from "./apply-verified-larebedrift-to-apprenticeship-steps";
import {
  buildPathVariants,
  type PathVariantsResult,
} from "./build-path-variants";
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

function pathVariantsIncludeLarefag(pathVariants: PathVariantsResult | null | undefined): boolean {
  return Boolean(
    pathVariants?.variants.some((variant) =>
      variant.nodes.some(
        (node) =>
          node.type === "programme_selection" && isLarefagSelectionStage(node.stage)
      )
    )
  );
}

/**
 * P-8 — sparse VG2 alternative for maskin-og-kranforer ("VG2 andre steder").
 *
 * Membership (owner 2026-07-22) mirrors P-7:
 *   Vilbli home-page out-of-county VG2 pins ∩ NSR ∩ destination PSA ∩ public
 * (allowlist written at Contour B relay). No Oslo gold list; each home fylke owns its truth.
 *
 * Relocation willingness still gates visibility (`no` → omit). Transport rank unchanged.
 */
export async function buildAnleggsteknikkSparseVg2AlternativeRouteSteps(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  relocationWillingness: RelocationWillingness;
  locale?: string;
  /** Already-parsed primary path variants from the same recompute — reuse Fagvalg graph. */
  primaryPathVariants?: PathVariantsResult | null;
}): Promise<StudyRouteSnapshotStep[]> {
  if (!isSparseVg2PilotProfession(params.professionSlug)) {
    return [];
  }

  const alternativeScope = resolveSchoolGeographyScope({
    layer: "alternative",
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    relocationWillingness: params.relocationWillingness,
    sparseVg2GateActive: true,
  });
  if (!alternativeScope.allowNationalSparseAlternative) {
    return [];
  }

  const homeFylkeCode = resolveAnleggsteknikkHomeFylkeCode(params.preferredMunicipalityCodes);
  if (!homeFylkeCode) {
    return [];
  }

  // Sparse gate still uses nationwide active PSA count (profession density), not membership.
  const nationalTruthsForGate = await Promise.all(
    MASKIN_OG_KRANFORER_SPARSE_VG2_CANDIDATE_FYLKE_CODES.map((fylkeCode) => {
      const programmeSlugs = anleggsteknikkVg2ProgrammeSlugsForFylke(fylkeCode);
      if (programmeSlugs.length === 0) {
        return Promise.resolve({ hasTruth: false, rows: [] as never[] });
      }
      return getAvailabilityTruth({
        countyCode: fylkeCode,
        programmeSlugsOrCodes: programmeSlugs,
        locale: params.locale,
      });
    })
  );
  const sparseVg2GateActive = assessSparseVg2AlternativeEligibility({
    professionSlug: params.professionSlug,
    nationalVg2PsaCount: countNationalSparseVg2Schools(
      nationalTruthsForGate.flatMap((truth) => truth.rows)
    ),
  });
  if (!sparseVg2GateActive) {
    return [];
  }

  const [homeTruth, continuationVg2Rows] = await Promise.all([
    getAvailabilityTruth({
      countyCode: homeFylkeCode,
      programmeSlugsOrCodes: anleggsteknikkHomeVg1ProgrammeSlugsForFylke(homeFylkeCode),
      locale: params.locale,
    }),
    loadVilbliHomeVg2ContinuationTruthRows({
      supabase: params.supabase,
      professionSlug: params.professionSlug,
      homeCountyCode: homeFylkeCode,
      locale: params.locale,
    }),
  ]);

  const continuationVg2Only = continuationVg2Rows.filter((row) => row.stage === "VG2");
  if (continuationVg2Only.length === 0) {
    return [];
  }

  const {
    rankedRows: rankedContinuationVg2Rows,
    distanceKmByInstitutionId,
    softByInstitutionId,
  } = await filterAndRankSparseVg2RowsByHomeDistance({
    supabase: params.supabase,
    vg2Rows: continuationVg2Only,
    homeMunicipalityCodes: params.preferredMunicipalityCodes,
    relocationWillingness: params.relocationWillingness,
  });
  if (rankedContinuationVg2Rows.length === 0) {
    return [];
  }

  const homeVg1Slugs = anleggsteknikkHomeVg1ProgrammeSlugsForFylke(homeFylkeCode);
  if (homeVg1Slugs.length === 0) {
    return [];
  }

  const mergedTruthRows = mergeAnleggsteknikkSparseVg2TruthRows({
    homeVg1Rows: homeTruth.rows,
    nationalVg2RowsOutsidePrimaryScope: rankedContinuationVg2Rows,
  });
  if (
    !mergedTruthRows.some((row) => row.stage === "VG1") ||
    !mergedTruthRows.some((row) => row.stage === "VG2")
  ) {
    return [];
  }

  const baseTransportSortContext = await buildKommuneTransportSortContext({
    rows: mergedTruthRows,
    homeMunicipalityCodes: params.preferredMunicipalityCodes,
  });
  const transportSortContext = enrichTransportSortContextWithVg2DistanceRanks({
    context: baseTransportSortContext,
    vg2Rows: rankedContinuationVg2Rows,
    distanceKmByInstitutionId,
    softByInstitutionId,
  });

  const selectedTruthCandidate = await selectTruthCandidateForRoute({
    supabase: params.supabase,
    rows: mergedTruthRows,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    relocationWillingness: params.relocationWillingness,
    transportSortContext,
  });

  const pathVariants = pathVariantsIncludeLarefag(params.primaryPathVariants)
    ? params.primaryPathVariants!
    : await buildPathVariants(mergedTruthRows, params.professionSlug, {
        sourceUrlOverride: anleggsteknikkVilbliChainUrlForFylke(homeFylkeCode),
      });
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
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
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
    selectedVg2ProgramSlug: MASKIN_OG_KRANFORER_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG,
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
