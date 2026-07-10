/**
 * P-7 curated cross-fylke alternative for painter (Troms / Finnmark homes).
 * One nabofylke variant with VG2 school dropdown across reachable neighbors.
 */
import {
  getPainterNorthCrossFylkeInfoCopy,
  isPainterNorthCrossFylkeNabofylkeVariantEligible,
  isPainterNorthCrossFylkePathVariantEligible,
  PAINTER_NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS,
  PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID,
  PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_LABEL_NB,
  PAINTER_NORTH_NABOFYLKE_VG2_PROGRAMME_SLUG,
  painterNorthCrossFylkeVariantId,
} from "./painter-north-cross-fylke-pilot";
import { formatCuratedRegionalVariantReason } from "./curated-regional-variant-reason";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";

export const PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_REASON =
  formatCuratedRegionalVariantReason(PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID);

export function buildPainterNorthCrossFylkeNabofylkeVariantLabel(): string {
  return PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_LABEL_NB;
}

/** One VG2 programme slug so the school dropdown lists all nabofylke schools. */
export function normalizePainterNorthNabofylkeVg2StepPresentation(
  steps: StudyRouteSnapshotStep[]
): StudyRouteSnapshotStep[] {
  const canonicalSlug = PAINTER_NORTH_NABOFYLKE_VG2_PROGRAMME_SLUG;

  return steps.map((step) => {
    if (step.type !== "programme_selection" || step.stage !== "VG2") {
      return step;
    }

    const programTitle = step.program_title ?? step.title ?? "VG2 Overflateteknikk";
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
          profession_slug: step.current_profession_slug ?? "painter",
        },
      ],
      options: normalizedOptions,
    };
  });
}

/** @deprecated Per-neighbor labels — kept for archived variant rows. */
export function buildPainterNorthCrossFylkeVariantLabel(neighborCountyCode: string): string {
  const config = PAINTER_NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS.find(
    (item) => item.countyCode === neighborCountyCode
  );
  const label = config?.labelNb ?? neighborCountyCode;
  return `Overflateteknikk i ${label} (nabofylke)`;
}

/** @deprecated */
export function buildPainterNorthCrossFylkeVariantReason(neighborCountyCode: string): string {
  return formatCuratedRegionalVariantReason(painterNorthCrossFylkeVariantId(neighborCountyCode));
}

export function isPainterNorthCrossFylkePathVariantEligibleForNeighbor(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
  neighborCountyCode: string;
}): boolean {
  return isPainterNorthCrossFylkePathVariantEligible(params);
}

export { getPainterNorthCrossFylkeInfoCopy, painterNorthCrossFylkeVariantId };

export type BuildPainterNorthCrossFylkeNabofylkeStepsParams = {
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  buildMergedRouteSteps: () => Promise<StudyRouteSnapshotStep[]>;
};

export async function buildPainterNorthCrossFylkeNabofylkeAlternativeSteps(
  params: BuildPainterNorthCrossFylkeNabofylkeStepsParams
): Promise<StudyRouteSnapshotStep[]> {
  if (
    !isPainterNorthCrossFylkeNabofylkeVariantEligible({
      professionSlug: params.professionSlug,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    })
  ) {
    return [];
  }

  const steps = await params.buildMergedRouteSteps();
  return normalizePainterNorthNabofylkeVg2StepPresentation(steps);
}
