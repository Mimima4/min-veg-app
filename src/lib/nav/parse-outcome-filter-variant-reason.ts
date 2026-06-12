import {
  isRouteOutcomeFilterId,
  type RouteOutcomeFilterId,
} from "./route-outcome-filter-id";
import { ROUTE_OUTCOME_FILTER_VARIANT_REASON_PREFIX } from "./route-outcome-filter-labels";

export function parseOutcomeFilterVariantReason(
  variantReason: string | null | undefined
): RouteOutcomeFilterId | null {
  const raw = String(variantReason ?? "").trim();
  if (!raw.startsWith(ROUTE_OUTCOME_FILTER_VARIANT_REASON_PREFIX)) {
    return null;
  }
  const filterId = raw.slice(ROUTE_OUTCOME_FILTER_VARIANT_REASON_PREFIX.length);
  return isRouteOutcomeFilterId(filterId) ? filterId : null;
}

export function isOutcomeFilterVariantReason(variantReason: string | null | undefined): boolean {
  return parseOutcomeFilterVariantReason(variantReason) !== null;
}
