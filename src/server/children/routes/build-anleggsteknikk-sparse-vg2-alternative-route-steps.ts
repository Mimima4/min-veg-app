import "server-only";

import {
  anleggsteknikkHomeVg1ProgrammeSlugsForFylke,
  anleggsteknikkVg2ProgrammeSlugsForFylke,
  anleggsteknikkVilbliChainUrlForFylke,
  ANLEGGSTEKNIKK_SPARSE_VG2_CANDIDATE_FYLKE_CODES,
  countNationalSparseVg2Schools,
  mergeAnleggsteknikkSparseVg2TruthRows,
  resolveAnleggsteknikkHomeFylkeCode,
  selectNationalSparseVg2RowsOutsidePrimaryScope,
} from "@/lib/regional-delivery/anleggsteknikk-sparse-vg2-pilot";
import {
  enrichTransportSortContextWithVg2DistanceRanks,
  filterAndRankSparseVg2RowsByHomeDistance,
} from "@/lib/regional-delivery/anleggsteknikk-sparse-vg2-distance-rank";
import {
  resolveSchoolGeographyScope,
  type RelocationWillingness,
} from "@/lib/planning/school-geography-scope";
import {
  assessSparseVg2AlternativeEligibility,
  ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG,
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
 * P-8 — national sparse VG2 alternative for anleggsteknikk ("VG2 andre steder").
 *
 * Loads multi-county anleggsteknikk VG2 PSA ONLY when the sparse gate passes, respects
 * relocation willingness (`no`/null → []), and surfaces schools that fall OUTSIDE the
 * child's primary geography scope. Returns [] for every other profession and whenever the
 * PSA-derived sparse gate is inactive — the primary route is never affected.
 *
 * Kolonne-3 / Fagvalg: prefer the already-parsed primary `pathVariants` (zero extra Vilbli
 * fetch). Fallback is one canonical home-county chain URL — never re-resolve from the
 * multi-county national PSA URL set (that path was flaky / timed out).
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

  // relocation `no`/null → omit alternative (contract §4.2). Resolve via the shared scope
  // so the gating stays single-sourced.
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

  const nationalTruths = await Promise.all(
    ANLEGGSTEKNIKK_SPARSE_VG2_CANDIDATE_FYLKE_CODES.map((fylkeCode) => {
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
  const nationalVg2Rows = nationalTruths.flatMap((truth) => truth.rows);

  // PSA-derived sparse gate (owner §P8-7). When inactive the alternative is suppressed and
  // the primary route behaviour stays identical.
  const sparseVg2GateActive = assessSparseVg2AlternativeEligibility({
    professionSlug: params.professionSlug,
    nationalVg2PsaCount: countNationalSparseVg2Schools(nationalVg2Rows),
  });
  if (!sparseVg2GateActive) {
    return [];
  }

  const primaryScope = resolveSchoolGeographyScope({
    layer: "primary",
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    relocationWillingness: params.relocationWillingness,
    sparseVg2GateActive: true,
  });

  const nationalVg2RowsOutsidePrimaryScope = selectNationalSparseVg2RowsOutsidePrimaryScope({
    nationalRows: nationalVg2Rows,
    primaryScope,
  });
  if (nationalVg2RowsOutsidePrimaryScope.length === 0) {
    return [];
  }

  // Transport context today ranks VG1 only — without distance ranks VG2 falls back to
  // alphabetical (Åfjord first). Rank by home-kommune haversine; maybe ≤400km filter.
  const { rankedRows: rankedNationalVg2Rows, distanceKmByInstitutionId } =
    await filterAndRankSparseVg2RowsByHomeDistance({
      supabase: params.supabase,
      vg2Rows: nationalVg2RowsOutsidePrimaryScope,
      homeMunicipalityCodes: params.preferredMunicipalityCodes,
      relocationWillingness: params.relocationWillingness,
    });
  if (rankedNationalVg2Rows.length === 0) {
    return [];
  }

  // Shared V.BA VG1 (carpenter) — required for Oslo and any county where anleggsteknikk
  // VG1 catalogue rows were never materialized (Contour B ABORT / missing_programme_rows).
  const homeVg1Slugs = anleggsteknikkHomeVg1ProgrammeSlugsForFylke(homeFylkeCode);
  if (homeVg1Slugs.length === 0) {
    return [];
  }

  const homeTruth = await getAvailabilityTruth({
    countyCode: homeFylkeCode,
    programmeSlugsOrCodes: homeVg1Slugs,
    locale: params.locale,
  });

  const mergedTruthRows = mergeAnleggsteknikkSparseVg2TruthRows({
    homeVg1Rows: homeTruth.rows,
    nationalVg2RowsOutsidePrimaryScope: rankedNationalVg2Rows,
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
    vg2Rows: rankedNationalVg2Rows,
    distanceKmByInstitutionId,
  });

  const selectedTruthCandidate = await selectTruthCandidateForRoute({
    supabase: params.supabase,
    rows: mergedTruthRows,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    relocationWillingness: params.relocationWillingness,
    transportSortContext,
  });

  // Prefer primary's already-parsed kolonne-3 graph (same recompute). Otherwise one
  // canonical home-county Vilbli URL — do not re-pick from national multi-county PSA URLs.
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
    selectedVg2ProgramSlug: ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG,
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
