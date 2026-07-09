/**
 * P3b — verified lærebedrift on ordinary `availability_truth` apprenticeship steps
 * (not only veksling / curated-regional). Nationwide `larebedrift_truth` covers
 * carpenter + eleven elektro + ten kjøretøy fag; this gate controls which
 * **catalogue profession slugs** may surface verified employers on the primary route.
 *
 * Phase 1 (closed): fylke 15 + 55 only.
 * Phase 2 (closed): carpenter nationwide when the child has a home kommune.
 * Phase 3 (closed): electrician nationwide when the child has a home kommune.
 * Phase 4 (closed): mechanic nationwide when the child has a home kommune.
 * Phase 5 (closed 2026-07-04): plumber nationwide when the child has a home kommune.
 * Phase 6 (painter): maler nationwide when the child has a home kommune.
 * V.BA VG2 cross-profession programme switch (carpenter ↔ plumber ↔ painter) — see `VGS_OPERATIONAL_RUNNERS.md`.
 */

const PRIMARY_ROUTE_LAREBEDRIFT_PROFESSIONS = new Set([
  "carpenter",
  "electrician",
  "mechanic",
  "plumber",
  "painter",
]);

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
  const professionSlug = String(params.professionSlug ?? "").trim();
  if (!PRIMARY_ROUTE_LAREBEDRIFT_PROFESSIONS.has(professionSlug)) {
    return false;
  }
  return childHomeCountyCodes(params.preferredMunicipalityCodes).length > 0;
}
