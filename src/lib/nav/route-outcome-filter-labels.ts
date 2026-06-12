import type { RouteOutcomeFilterId } from "./route-outcome-filter-id";

/** Locked nb labels — phase-4-route-outcome-filter-owner-decision-record.md §2 */
const ROUTE_OUTCOME_FILTER_LABELS_NB: Record<RouteOutcomeFilterId, string> = {
  open: "Åpen / Ikke valgt ennå",
  fast_to_work: "Kort vei til fagbrev",
  vg3_before_apprenticeship: "Velg fag på VG3 før læretid",
  fagskole_after_vgs: "Fagskole etter VGS (1–2 år)",
  long_academic: "Lang og spesialisert utdanning",
  flexible: "Vis meg ulike realistiske veier",
  pabygging_studiekompetanse: "Påbygging til generell studiekompetanse",
};

export function getRouteOutcomeFilterLabelNb(filterId: RouteOutcomeFilterId): string {
  return ROUTE_OUTCOME_FILTER_LABELS_NB[filterId];
}

export const ROUTE_OUTCOME_FILTER_VARIANT_REASON_PREFIX = "outcome_filter:";

export function formatOutcomeFilterVariantReason(filterId: RouteOutcomeFilterId): string {
  return `${ROUTE_OUTCOME_FILTER_VARIANT_REASON_PREFIX}${filterId}`;
}
