import "server-only";

import {
  assessNorthCrossFylkeSplitRouteTruthEligibility,
  isNorthCrossFylkePathVariantEligible,
  listNorthCrossFylkeReachableNeighborCountyCodes,
  mergeNorthCrossFylkeTruthRows,
  northCrossFylkeHomeVg1ProgrammeSlugsForFylke,
  northCrossFylkeNabofylkeVg2ProgrammeSlug,
  northCrossFylkeProgrammeSlugsForFylke,
  resolveNorthCrossFylkeHomeFylkeCode,
} from "@/lib/regional-delivery/painter-north-cross-fylke-pilot";
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
 * P-7 — Vilbli north split: VG1 PSA in home fylke (55/56) + VG2+ PSA in neighbor fylke
 * union Vilbli home-page continuation schools (destination PSA ∩ allowlist).
 * Relocation willingness is ignored for selection (commute model — not P-8 relocation).
 * Returns [] when home lacks VG1, home already has VG2, or neither neighbor nor
 * continuation pool has VG2.
 */
export async function buildPainterNorthCrossFylkeRouteSteps(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  neighborCountyCode: string;
  relocationWillingness?: "no" | "maybe" | "yes" | null;
  locale?: string;
}): Promise<StudyRouteSnapshotStep[]> {
  void params.relocationWillingness;

  if (
    !isNorthCrossFylkePathVariantEligible({
      professionSlug: params.professionSlug,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
      neighborCountyCode: params.neighborCountyCode,
    })
  ) {
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
  const neighborProgrammeSlugs = northCrossFylkeProgrammeSlugsForFylke({
    professionSlug: params.professionSlug,
    fylkeCode: params.neighborCountyCode,
  });
  if (homeProgrammeSlugs.length === 0 || neighborProgrammeSlugs.length === 0) {
    return [];
  }

  const [homeTruth, neighborTruth, continuationRows] = await Promise.all([
    getAvailabilityTruth({
      countyCode: homeFylkeCode,
      programmeSlugsOrCodes: homeProgrammeSlugs,
      locale: params.locale,
    }),
    getAvailabilityTruth({
      countyCode: params.neighborCountyCode,
      programmeSlugsOrCodes: neighborProgrammeSlugs,
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
    neighborRows: neighborTruth.rows,
    continuationRows,
  });
  if (!splitEligibility.eligible) {
    return [];
  }

  const mergedTruthRows = mergeNorthCrossFylkeTruthRows({
    professionSlug: params.professionSlug,
    homeRows: homeTruth.rows,
    neighborRows: neighborTruth.rows,
    continuationRows,
  });

  return buildStepsFromMergedNorthCrossFylkeTruth({
    supabase: params.supabase,
    professionSlug: params.professionSlug,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    homeFylkeCode,
    mergedTruthRows,
    neighborRowsForPathVariants: [...neighborTruth.rows, ...continuationRows],
  });
}

/**
 * P-7 merged nabofylke route: VG1 in home fylke + VG2 schools from all reachable
 * neighbors in one programme_selection dropdown.
 */
export async function buildPainterNorthCrossFylkeMergedRouteSteps(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  relocationWillingness?: "no" | "maybe" | "yes" | null;
  locale?: string;
}): Promise<StudyRouteSnapshotStep[]> {
  void params.relocationWillingness;

  const homeFylkeCode = resolveNorthCrossFylkeHomeFylkeCode(params.preferredMunicipalityCodes);
  if (!homeFylkeCode) {
    return [];
  }

  const neighborCountyCodes = listNorthCrossFylkeReachableNeighborCountyCodes(
    params.preferredMunicipalityCodes
  );
  if (neighborCountyCodes.length === 0) {
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

  const neighborTruths = await Promise.all(
    neighborCountyCodes.map((neighborCountyCode) =>
      getAvailabilityTruth({
        countyCode: neighborCountyCode,
        programmeSlugsOrCodes: northCrossFylkeProgrammeSlugsForFylke({
          professionSlug: params.professionSlug,
          fylkeCode: neighborCountyCode,
        }),
        locale: params.locale,
      })
    )
  );

  // Adjacency neighbors that independently qualify; continuations always union into merge.
  const eligibleNeighborPairs = neighborCountyCodes
    .map((neighborCountyCode, index) => ({
      neighborCountyCode,
      neighborTruth: neighborTruths[index] ?? { hasTruth: false, rows: [] },
    }))
    .filter(({ neighborTruth }) =>
      assessNorthCrossFylkeSplitRouteTruthEligibility({
        professionSlug: params.professionSlug,
        homeRows: homeTruth.rows,
        neighborRows: neighborTruth.rows,
        continuationRows: [],
      }).eligible
    );

  const allNeighborRows = eligibleNeighborPairs.flatMap((pair) => pair.neighborTruth.rows);
  const splitEligibility = assessNorthCrossFylkeSplitRouteTruthEligibility({
    professionSlug: params.professionSlug,
    homeRows: homeTruth.rows,
    neighborRows: allNeighborRows,
    continuationRows,
  });
  if (!splitEligibility.eligible) {
    return [];
  }

  const mergedTruthRows = mergeNorthCrossFylkeTruthRows({
    professionSlug: params.professionSlug,
    homeRows: homeTruth.rows,
    neighborRows: allNeighborRows,
    continuationRows,
  });

  return buildStepsFromMergedNorthCrossFylkeTruth({
    supabase: params.supabase,
    professionSlug: params.professionSlug,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    homeFylkeCode,
    mergedTruthRows,
    neighborRowsForPathVariants: [...allNeighborRows, ...continuationRows],
  });
}

async function buildStepsFromMergedNorthCrossFylkeTruth(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  homeFylkeCode: string;
  mergedTruthRows: Awaited<ReturnType<typeof getAvailabilityTruth>>["rows"];
  neighborRowsForPathVariants: Awaited<ReturnType<typeof getAvailabilityTruth>>["rows"];
}): Promise<StudyRouteSnapshotStep[]> {
  const transportSortContext = await buildKommuneTransportSortContext({
    rows: params.mergedTruthRows,
    homeMunicipalityCodes: params.preferredMunicipalityCodes,
  });

  // P-7 commute: do not apply relocation_willingness filtering (pass null → full-set sort
  // after home-fylke prefer). Neighbor VG2 schools remain visible in options.
  const selectedTruthCandidate = await selectTruthCandidateForRoute({
    supabase: params.supabase,
    rows: params.mergedTruthRows,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    relocationWillingness: null,
    transportSortContext,
  });

  const pathVariants = await buildPathVariants(
    params.neighborRowsForPathVariants,
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
