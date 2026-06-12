import type { PathVariant, PathVariantsResult, VilbliOutcomeProfession } from "./build-path-variants";

function collectOutcomeUrlsFromVariant(variant: PathVariant): Set<string> {
  const urls = new Set<string>();

  for (const node of variant.nodes) {
    if (node.type === "apprenticeship_step") {
      if (node.sourceOutcomeUrl) {
        urls.add(node.sourceOutcomeUrl);
      }
      for (const branch of node.branchOptions ?? []) {
        if (branch.sourceOutcomeUrl) {
          urls.add(branch.sourceOutcomeUrl);
        }
      }
    }
    if (node.type === "programme_selection" && node.stage === "VG3") {
      for (const option of node.options ?? []) {
        if (option.sourceOutcomeUrl) {
          urls.add(option.sourceOutcomeUrl);
        }
      }
    }
  }

  return urls;
}

export function scopeOutcomesForPathVariant(params: {
  pathVariants: PathVariantsResult;
  primaryPathVariantId: string | null;
}): VilbliOutcomeProfession[] {
  const { pathVariants, primaryPathVariantId } = params;
  if (!primaryPathVariantId) {
    return pathVariants.outcomes;
  }

  const variant =
    pathVariants.variants.find((item) => item.variantId === primaryPathVariantId) ?? null;
  if (!variant) {
    return pathVariants.outcomes;
  }

  const allowedUrls = collectOutcomeUrlsFromVariant(variant);
  if (allowedUrls.size === 0) {
    return pathVariants.outcomes;
  }

  return pathVariants.outcomes.filter((outcome) =>
    allowedUrls.has(outcome.sourceOutcomeUrl)
  );
}
