import type { RouteOutcomeFilterId } from "@/lib/nav/route-outcome-filter-id";
import type { PathVariant } from "./build-path-variants";
import { resolvePathVariantForFilter } from "./resolve-path-variant-for-filter";

const ALTERNATIVE_FILTER_ORDER: RouteOutcomeFilterId[] = [
  "vg3_before_apprenticeship",
  "fagskole_after_vgs",
  "long_academic",
];

const REVERSE_ALTERNATIVE_ORDER: RouteOutcomeFilterId[] = ["fast_to_work", "open"];

/** K=3 pool: up to two alternatives besides the primary route. */
const MAX_ALTERNATIVE_FILTERS = 2;

function variantIdForFilter(params: {
  filterId: RouteOutcomeFilterId;
  professionSlug: string;
  variants: PathVariant[];
  childContext: boolean;
  hasVg3SchoolProgrammeAvailability: boolean;
}): string | null {
  return resolvePathVariantForFilter({
    filterId: params.filterId,
    professionSlug: params.professionSlug,
    variants: params.variants,
    childContext: params.childContext,
    hasVg3SchoolProgrammeAvailability: params.hasVg3SchoolProgrammeAvailability,
  }).primaryPathVariantId;
}

export function resolveAlternativeRouteOutcomeFilters(params: {
  primaryEffectiveFilterId: RouteOutcomeFilterId;
  hiddenFilterIds: RouteOutcomeFilterId[];
  professionSlug: string;
  variants: PathVariant[];
  childContext: boolean;
  hasVg3SchoolProgrammeAvailability: boolean;
}): RouteOutcomeFilterId[] {
  const hidden = new Set(params.hiddenFilterIds);
  const primaryVariantId = variantIdForFilter({
    filterId: params.primaryEffectiveFilterId,
    professionSlug: params.professionSlug,
    variants: params.variants,
    childContext: params.childContext,
    hasVg3SchoolProgrammeAvailability: params.hasVg3SchoolProgrammeAvailability,
  });

  const candidateFilters =
    params.primaryEffectiveFilterId === "vg3_before_apprenticeship"
      ? REVERSE_ALTERNATIVE_ORDER
      : ALTERNATIVE_FILTER_ORDER;

  const alternatives: RouteOutcomeFilterId[] = [];

  for (const filterId of candidateFilters) {
    if (alternatives.length >= MAX_ALTERNATIVE_FILTERS) break;
    if (hidden.has(filterId)) continue;
    if (filterId === params.primaryEffectiveFilterId) continue;

    const candidateVariantId = variantIdForFilter({
      filterId,
      professionSlug: params.professionSlug,
      variants: params.variants,
      childContext: params.childContext,
      hasVg3SchoolProgrammeAvailability: params.hasVg3SchoolProgrammeAvailability,
    });
    if (!candidateVariantId) continue;
    if (primaryVariantId && candidateVariantId === primaryVariantId) continue;
    if (alternatives.includes(filterId)) continue;

    alternatives.push(filterId);
  }

  return alternatives;
}
