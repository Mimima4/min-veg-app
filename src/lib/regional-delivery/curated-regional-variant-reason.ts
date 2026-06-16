export const CURATED_REGIONAL_VARIANT_REASON_PREFIX = "curated:";

export function formatCuratedRegionalVariantReason(variantId: string): string {
  return `${CURATED_REGIONAL_VARIANT_REASON_PREFIX}${variantId}`;
}

export function parseCuratedRegionalVariantReason(
  variantReason: string | null | undefined
): string | null {
  const raw = String(variantReason ?? "").trim();
  if (!raw.startsWith(CURATED_REGIONAL_VARIANT_REASON_PREFIX)) {
    return null;
  }
  const variantId = raw.slice(CURATED_REGIONAL_VARIANT_REASON_PREFIX.length).trim();
  return variantId.length > 0 ? variantId : null;
}

export function isCuratedRegionalVariantReason(
  variantReason: string | null | undefined
): boolean {
  return parseCuratedRegionalVariantReason(variantReason) !== null;
}
