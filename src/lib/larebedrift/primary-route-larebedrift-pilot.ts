/**
 * P3b Phase 1 — controlled opening of design-gate D-1 for ordinary
 * `availability_truth` apprenticeship steps (not only veksling/curated-regional).
 *
 * Nationwide data (`larebedrift_truth`) is already carpenter-wide; surfacing on the
 * primary route is rolled out fylke-by-fylke. Remove counties from the pilot set (or
 * delete this gate) when promoting to full automation.
 */

/** Home fylke codes (first two digits of kommunenummer) in the Phase 1 pilot. */
export const LAREBEDRIFT_PRIMARY_ROUTE_PILOT_COUNTY_CODES = new Set(["15", "55"]);

export function childHomeCountyCodes(
  preferredMunicipalityCodes: string[]
): string[] {
  return Array.from(
    new Set(
      preferredMunicipalityCodes
        .map((code) => String(code ?? "").trim().slice(0, 2))
        .filter((code) => /^\d{2}$/.test(code))
    )
  );
}

export function isPrimaryRouteLarebedriftPilotEligible(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
}): boolean {
  if (params.professionSlug !== "carpenter") {
    return false;
  }
  const homeCounties = childHomeCountyCodes(params.preferredMunicipalityCodes);
  if (homeCounties.length === 0) {
    return false;
  }
  return homeCounties.some((code) => LAREBEDRIFT_PRIMARY_ROUTE_PILOT_COUNTY_CODES.has(code));
}
