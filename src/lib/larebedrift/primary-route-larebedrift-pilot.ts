/**
 * P3b — verified lærebedrift on ordinary `availability_truth` apprenticeship steps
 * (not only veksling / curated-regional). Nationwide `larebedrift_truth` is carpenter-wide;
 * this gate controls which professions may surface on the primary route.
 *
 * Phase 1 (closed): fylke 15 + 55 only.
 * Phase 2 (current): carpenter nationwide when the child has a home kommune.
 */

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
  return childHomeCountyCodes(params.preferredMunicipalityCodes).length > 0;
}
