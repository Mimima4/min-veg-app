/**
 * P-8 curated national sparse VG2 alternative for anleggsteknikk.
 * One "VG2 andre steder" variant whose VG2 dropdown lists national schools outside the
 * child's primary geography scope, gated by relocation willingness + sparse PSA gate.
 * Charter: phase-0-6-contour-b-anleggsteknikk-p8-sparse-vg2-relocation-owner-record.md
 */
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { RelocationWillingness } from "@/lib/planning/school-geography-scope";
import {
  ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_LABEL_NB,
  ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_ID,
  ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG,
} from "@/lib/vgs/sparse-vg2-alternative-eligibility";
import {
  getAnleggsteknikkSparseVg2InfoCopy,
  isAnleggsteknikkSparseVg2VariantEligible,
  relocationAllowsNationalSparseAlternative,
} from "./anleggsteknikk-sparse-vg2-pilot";
import { formatCuratedRegionalVariantReason } from "./curated-regional-variant-reason";

export const ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_REASON =
  formatCuratedRegionalVariantReason(ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_ID);

export function buildAnleggsteknikkSparseVg2AlternativeVariantLabel(): string {
  return ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_LABEL_NB;
}

/** One canonical VG2 programme slug so the school dropdown lists all national schools. */
export function normalizeAnleggsteknikkSparseVg2StepPresentation(
  steps: StudyRouteSnapshotStep[]
): StudyRouteSnapshotStep[] {
  const canonicalSlug = ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG;

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
          profession_slug: step.current_profession_slug ?? "anleggsteknikk",
        },
      ],
      options: normalizedOptions,
    };
  });
}

export type BuildAnleggsteknikkSparseVg2AlternativeStepsParams = {
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  relocationWillingness: RelocationWillingness;
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
  return normalizeAnleggsteknikkSparseVg2StepPresentation(steps);
}

export { getAnleggsteknikkSparseVg2InfoCopy };
