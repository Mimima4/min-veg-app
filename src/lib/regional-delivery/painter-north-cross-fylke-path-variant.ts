/**
 * P-7 curated cross-fylke alternative variants for painter (Troms / Finnmark homes).
 */
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import { formatCuratedRegionalVariantReason } from "./curated-regional-variant-reason";
import {
  PAINTER_NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS,
  getPainterNorthCrossFylkeInfoCopy,
  isPainterNorthCrossFylkePathVariantEligible,
  painterNorthCrossFylkeVariantId,
} from "./painter-north-cross-fylke-pilot";

export function buildPainterNorthCrossFylkeVariantLabel(neighborCountyCode: string): string {
  const config = PAINTER_NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS.find(
    (item) => item.countyCode === neighborCountyCode
  );
  const label = config?.labelNb ?? neighborCountyCode;
  return `Overflateteknikk i ${label} (nabofylke)`;
}

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

export type BuildPainterNorthCrossFylkeStepsParams = {
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  neighborCountyCode: string;
  buildRouteSteps: (input: {
    neighborCountyCode: string;
  }) => Promise<StudyRouteSnapshotStep[]>;
};

export async function buildPainterNorthCrossFylkeAlternativeSteps(
  params: BuildPainterNorthCrossFylkeStepsParams
): Promise<StudyRouteSnapshotStep[]> {
  if (
    !isPainterNorthCrossFylkePathVariantEligible({
      professionSlug: params.professionSlug,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
      neighborCountyCode: params.neighborCountyCode,
    })
  ) {
    return [];
  }

  return params.buildRouteSteps({ neighborCountyCode: params.neighborCountyCode });
}
