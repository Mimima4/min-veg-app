/**
 * P-8 curated national sparse VG2 alternative for anleggsteknikk.
 * One "VG2 andre steder" variant whose VG2 dropdown lists national schools outside the
 * child's primary geography scope, gated by relocation willingness + sparse PSA gate.
 * Charter: phase-0-6-contour-b-anleggsteknikk-p8-sparse-vg2-relocation-owner-record.md
 */
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { RelocationWillingness } from "@/lib/planning/school-geography-scope";
import {
  MASKIN_OG_KRANFORER_SPARSE_VG2_ALTERNATIVE_LABEL_NB,
  MASKIN_OG_KRANFORER_SPARSE_VG2_ALTERNATIVE_VARIANT_ID,
  MASKIN_OG_KRANFORER_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG,
} from "@/lib/vgs/sparse-vg2-alternative-eligibility";
import { isLarefagSelectionStage } from "@/lib/vgs/larefag-selection-stage";
import {
  getAnleggsteknikkSparseVg2InfoCopy,
  isAnleggsteknikkSparseVg2VariantEligible,
  relocationAllowsNationalSparseAlternative,
} from "./maskin-og-kranforer-sparse-vg2-pilot";
import { formatCuratedRegionalVariantReason } from "./curated-regional-variant-reason";

export const MASKIN_OG_KRANFORER_SPARSE_VG2_ALTERNATIVE_VARIANT_REASON =
  formatCuratedRegionalVariantReason(MASKIN_OG_KRANFORER_SPARSE_VG2_ALTERNATIVE_VARIANT_ID);

export function buildAnleggsteknikkSparseVg2AlternativeVariantLabel(): string {
  return MASKIN_OG_KRANFORER_SPARSE_VG2_ALTERNATIVE_LABEL_NB;
}

/** One canonical VG2 programme slug so the school dropdown lists all national schools. */
export function normalizeAnleggsteknikkSparseVg2StepPresentation(
  steps: StudyRouteSnapshotStep[]
): StudyRouteSnapshotStep[] {
  const canonicalSlug = MASKIN_OG_KRANFORER_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG;

  return steps.map((step) => {
    if (step.type !== "programme_selection" || step.stage !== "VG2") {
      return step;
    }

    const programTitle = step.program_title ?? step.title ?? "VG2 Anleggsteknikk";
    const normalizedOptions = (step.options ?? []).map((option) => ({
      ...option,
      program_slug: canonicalSlug,
      program_title: option.program_title ?? programTitle,
    }));

    return {
      ...step,
      program_slug: canonicalSlug,
      program_title: programTitle,
      programme_options: [
        {
          program_slug: canonicalSlug,
          program_title: programTitle,
          profession_slug: step.current_profession_slug ?? "maskin-og-kranforer",
        },
      ],
      options: normalizedOptions,
    };
  });
}

/**
 * P-8 only: copy Fagvalg from primary when the alternative skipped LAREFAG
 * (second Vilbli parse failed / never ran). No new network — reuses primary snapshot steps.
 * Requires the alternative to already have VG1/VG2 programme steps — never invent a
 * Fagvalg-only "VG2 andre steder" card from an empty builder result.
 */
export function ensureAnleggsteknikkSparseVg2LarefagParity(params: {
  alternativeSteps: StudyRouteSnapshotStep[];
  primarySteps: StudyRouteSnapshotStep[];
}): StudyRouteSnapshotStep[] {
  const alt = params.alternativeSteps;
  if (alt.length === 0) {
    return [];
  }

  const hasProgrammeChain = alt.some(
    (step) =>
      step.type === "programme_selection" &&
      (step.stage === "VG1" || step.stage === "VG2")
  );
  if (!hasProgrammeChain) {
    return alt;
  }

  if (
    alt.some(
      (step) =>
        step.type === "programme_selection" && isLarefagSelectionStage(step.stage)
    )
  ) {
    return alt;
  }

  const primaryLarefag = params.primarySteps.find(
    (step): step is Extract<StudyRouteSnapshotStep, { type: "programme_selection" }> =>
      step.type === "programme_selection" && isLarefagSelectionStage(step.stage)
  );
  if (!primaryLarefag) {
    return alt;
  }

  const bedriftIndex = alt.findIndex((step) => step.type === "apprenticeship_step");
  const larefagStep: StudyRouteSnapshotStep = {
    ...primaryLarefag,
    options: primaryLarefag.options ? [...primaryLarefag.options] : primaryLarefag.options,
  };

  if (bedriftIndex < 0) {
    return [...alt, larefagStep];
  }

  const selectedTitle =
    primaryLarefag.program_title ?? primaryLarefag.institution_name ?? primaryLarefag.title;
  const bedrift = alt[bedriftIndex];
  if (bedrift.type !== "apprenticeship_step") {
    return alt;
  }
  const nextBedrift: StudyRouteSnapshotStep = {
    ...bedrift,
    title: selectedTitle
      ? `Opplæring i bedrift (${selectedTitle})`
      : bedrift.title,
    program_title: selectedTitle ?? bedrift.program_title,
  };

  return [
    ...alt.slice(0, bedriftIndex),
    larefagStep,
    nextBedrift,
    ...alt.slice(bedriftIndex + 1),
  ];
}

export type BuildAnleggsteknikkSparseVg2AlternativeStepsParams = {
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  relocationWillingness: RelocationWillingness;
  primarySteps?: StudyRouteSnapshotStep[];
  buildRouteSteps: () => Promise<StudyRouteSnapshotStep[]>;
};

export async function buildAnleggsteknikkSparseVg2AlternativeSteps(
  params: BuildAnleggsteknikkSparseVg2AlternativeStepsParams
): Promise<StudyRouteSnapshotStep[]> {
  if (
    !isAnleggsteknikkSparseVg2VariantEligible({
      professionSlug: params.professionSlug,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    })
  ) {
    return [];
  }

  if (!relocationAllowsNationalSparseAlternative(params.relocationWillingness)) {
    return [];
  }

  const steps = await params.buildRouteSteps();
  // Empty builder (no reachable national VG2) must not become a Fagvalg-only
  // teaser via larefag parity — that is the broken "VG2 andre steder" card.
  if (steps.length === 0) {
    return [];
  }

  const withLarefag = ensureAnleggsteknikkSparseVg2LarefagParity({
    alternativeSteps: steps,
    primarySteps: params.primarySteps ?? [],
  });
  return normalizeAnleggsteknikkSparseVg2StepPresentation(withLarefag);
}

export { getAnleggsteknikkSparseVg2InfoCopy };
