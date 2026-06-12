/**
 * Route outcome filters — aligned with phase-4-route-outcome-filter-owner-decision-record.md
 */

export const ROUTE_OUTCOME_FILTER_IDS = [
  "open",
  "fast_to_work",
  "vg3_before_apprenticeship",
  "fagskole_after_vgs",
  "long_academic",
  "flexible",
  "pabygging_studiekompetanse",
] as const;

export type RouteOutcomeFilterId = (typeof ROUTE_OUTCOME_FILTER_IDS)[number];

export const PATH_VARIANT_DIRECT_BEDRIFT = "vilbli-branch-direct-bedrift";
export const PATH_VARIANT_VG3_THEN_BEDRIFT = "vilbli-branch-vg3-then-bedrift";

const FILTER_ID_SET = new Set<string>(ROUTE_OUTCOME_FILTER_IDS);

export function isRouteOutcomeFilterId(value: string): value is RouteOutcomeFilterId {
  return FILTER_ID_SET.has(value);
}

/** Bridge legacy `preferred_education_level` until enum migration (owner record C-4). */
export function normalizeRouteOutcomeFilterId(
  preferredEducationLevel: string | null | undefined
): RouteOutcomeFilterId {
  const raw = String(preferredEducationLevel ?? "open").trim();
  if (isRouteOutcomeFilterId(raw)) {
    return raw;
  }

  switch (raw) {
    case "apprenticeship":
    case "certificate":
    case "vocational":
    case "upper_secondary":
      return "fast_to_work";
    case "vocational_college":
      return "fagskole_after_vgs";
    case "bachelor":
    case "master":
    case "professional_degree":
      return "long_academic";
    default:
      return "open";
  }
}
