import {
  PATH_VARIANT_DIRECT_BEDRIFT,
  PATH_VARIANT_VG3_THEN_BEDRIFT,
  type RouteOutcomeFilterId,
} from "@/lib/nav/route-outcome-filter-id";
import { getHiddenRouteOutcomeFilterIds } from "@/lib/nav/path-family-outcome-nav-map";
import { resolvePathFamilySlug } from "@/lib/nav/path-family-slug";
import type { PathVariant } from "./build-path-variants";

export type ResolvePathVariantForFilterResult = {
  primaryPathVariantId: string | null;
  hiddenFilterIds: RouteOutcomeFilterId[];
  effectiveFilterId: RouteOutcomeFilterId;
};

function variantById(variants: PathVariant[], variantId: string): PathVariant | null {
  return variants.find((variant) => variant.variantId === variantId) ?? null;
}

function pickFallbackVariant(variants: PathVariant[]): PathVariant | null {
  const withNodes = variants.filter((variant) => variant.nodes.length > 0);
  return (
    variantById(withNodes, PATH_VARIANT_DIRECT_BEDRIFT) ??
    variantById(withNodes, PATH_VARIANT_VG3_THEN_BEDRIFT) ??
    withNodes[0] ??
    null
  );
}

export function resolvePathVariantForFilter(params: {
  filterId: RouteOutcomeFilterId;
  professionSlug: string;
  variants: PathVariant[];
  childContext: boolean;
  hasVg3SchoolProgrammeAvailability: boolean;
}): ResolvePathVariantForFilterResult {
  const pathFamilySlug = resolvePathFamilySlug(params.professionSlug);
  const hiddenFilterIds = getHiddenRouteOutcomeFilterIds({
    filterId: params.filterId,
    childContext: params.childContext,
    pathFamilySlug,
    hasVg3BranchVariant: params.hasVg3SchoolProgrammeAvailability,
  });

  let effectiveFilterId = params.filterId;
  if (hiddenFilterIds.includes(effectiveFilterId)) {
    effectiveFilterId = "open";
  }

  const direct = variantById(params.variants, PATH_VARIANT_DIRECT_BEDRIFT);
  const vg3Then = variantById(params.variants, PATH_VARIANT_VG3_THEN_BEDRIFT);

  let primary: PathVariant | null = null;

  switch (effectiveFilterId) {
    case "fast_to_work":
      primary = direct ?? pickFallbackVariant(params.variants);
      break;
    case "vg3_before_apprenticeship":
      primary = vg3Then ?? pickFallbackVariant(params.variants);
      break;
    case "open":
    case "flexible":
      primary = direct ?? pickFallbackVariant(params.variants);
      break;
    case "fagskole_after_vgs":
    case "long_academic":
    case "pabygging_studiekompetanse":
      primary = direct ?? pickFallbackVariant(params.variants);
      break;
    default:
      primary = pickFallbackVariant(params.variants);
  }

  return {
    primaryPathVariantId: primary?.variantId ?? null,
    hiddenFilterIds,
    effectiveFilterId,
  };
}
