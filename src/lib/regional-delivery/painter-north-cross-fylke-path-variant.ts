/**
 * P-7 curated cross-fylke alternative for Contour B professions (Troms / Finnmark homes).
 * One nabofylke variant with VG2 school dropdown across reachable neighbors.
 */
import {
  getNorthCrossFylkeInfoCopy,
  getPainterNorthCrossFylkeInfoCopy,
  isNorthCrossFylkeNabofylkeVariantEligible,
  isNorthCrossFylkePathVariantEligible,
  isPainterNorthCrossFylkeNabofylkeVariantEligible,
  isPainterNorthCrossFylkePathVariantEligible,
  NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS,
  northCrossFylkeNabofylkeVg2ProgrammeSlug,
  northCrossFylkeVg2TitleNb,
  buildNorthCrossFylkeNabofylkeVariantLabel,
  PAINTER_NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS,
  PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID,
  PAINTER_NORTH_NABOFYLKE_VG2_PROGRAMME_SLUG,
  painterNorthCrossFylkeVariantId,
  northCrossFylkeNabofylkeVariantId,
} from "./painter-north-cross-fylke-pilot";
import { formatCuratedRegionalVariantReason } from "./curated-regional-variant-reason";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";

export const PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_REASON =
  formatCuratedRegionalVariantReason(PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID);

export function northCrossFylkeNabofylkeVariantReason(professionSlug: string): string {
  return formatCuratedRegionalVariantReason(
    northCrossFylkeNabofylkeVariantId(professionSlug)
  );
}

export function buildPainterNorthCrossFylkeNabofylkeVariantLabel(): string {
  return buildNorthCrossFylkeNabofylkeVariantLabel("painter");
}

/** One VG2 programme slug so the school dropdown lists all nabofylke schools. */
export function normalizeNorthCrossFylkeNabofylkeVg2StepPresentation(params: {
  professionSlug: string;
  steps: StudyRouteSnapshotStep[];
}): StudyRouteSnapshotStep[] {
  const canonicalSlug = northCrossFylkeNabofylkeVg2ProgrammeSlug(params.professionSlug);
  const programTitleFallback = `VG2 ${northCrossFylkeVg2TitleNb(params.professionSlug)}`;

  return params.steps.map((step) => {
    if (step.type !== "programme_selection" || step.stage !== "VG2") {
      return step;
    }

    const programTitle = step.program_title ?? step.title ?? programTitleFallback;
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
          profession_slug: step.current_profession_slug ?? params.professionSlug,
        },
      ],
      options: normalizedOptions,
    };
  });
}

/** @deprecated */
export function normalizePainterNorthNabofylkeVg2StepPresentation(
  steps: StudyRouteSnapshotStep[]
): StudyRouteSnapshotStep[] {
  return normalizeNorthCrossFylkeNabofylkeVg2StepPresentation({
    professionSlug: "painter",
    steps,
  });
}

/** @deprecated Per-neighbor labels — kept for archived variant rows. */
export function buildPainterNorthCrossFylkeVariantLabel(neighborCountyCode: string): string {
  const config = (
    NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS as typeof PAINTER_NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS
  ).find((item) => item.countyCode === neighborCountyCode);
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
  return isNorthCrossFylkePathVariantEligible(params);
}

export {
  getPainterNorthCrossFylkeInfoCopy,
  getNorthCrossFylkeInfoCopy,
  painterNorthCrossFylkeVariantId,
  isPainterNorthCrossFylkePathVariantEligible,
  isPainterNorthCrossFylkeNabofylkeVariantEligible,
  isNorthCrossFylkeNabofylkeVariantEligible,
  buildNorthCrossFylkeNabofylkeVariantLabel,
  northCrossFylkeNabofylkeVariantId,
};

export type BuildNorthCrossFylkeNabofylkeStepsParams = {
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  buildMergedRouteSteps: () => Promise<StudyRouteSnapshotStep[]>;
};

export async function buildNorthCrossFylkeNabofylkeAlternativeSteps(
  params: BuildNorthCrossFylkeNabofylkeStepsParams
): Promise<StudyRouteSnapshotStep[]> {
  if (
    !isNorthCrossFylkeNabofylkeVariantEligible({
      professionSlug: params.professionSlug,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    })
  ) {
    return [];
  }

  const steps = await params.buildMergedRouteSteps();
  return normalizeNorthCrossFylkeNabofylkeVg2StepPresentation({
    professionSlug: params.professionSlug,
    steps,
  });
}

/** @deprecated */
export async function buildPainterNorthCrossFylkeNabofylkeAlternativeSteps(
  params: BuildNorthCrossFylkeNabofylkeStepsParams
): Promise<StudyRouteSnapshotStep[]> {
  return buildNorthCrossFylkeNabofylkeAlternativeSteps(params);
}
