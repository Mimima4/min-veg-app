/**
 * Arbeidsplassen (NAV) occupation category deep-links for catalog profession surfaces.
 *
 * Product contract (owner 2026-07-23):
 * - Link label is always exactly `Arbeidsplassen.nav.no` (no disclaimer copy).
 * - Show only on profession detail + child saved-professions — never on study routes.
 * - Every catalogue profession must resolve a category-filtered stillinger URL.
 *
 * URL contract (verified live 2026-07-23): Arbeidsplassen applies filters via
 * human-readable labels, not STYRK slug codes:
 *   ?occupationLevel1=<level1Label>&occupationLevel2=<level1Label>.<occupationLabel>
 * Slug-code params (occupationFirstLevel[]=håndverkere…) do NOT filter — they show all ads.
 */

import {
  CATALOG_PROFESSION_ARBEIDSPLASSEN,
  type CatalogProfessionArbeidsplassenEntry,
} from "./catalog-profession-arbeidsplassen-styrk";
import { NAV_TAXONOMY_AUTHORITY_URL } from "./path-family-outcome-nav-map";

export const ARBEIDSPLASSEN_LINK_LABEL = "Arbeidsplassen.nav.no";

/** Default external-link style used across app route/school website links. */
export const ARBEIDSPLASSEN_LINK_CLASSNAME =
  "inline-flex text-sm text-blue-600 hover:underline";

export function resolveArbeidsplassenEntryForProfessionSlug(
  professionSlug: string
): CatalogProfessionArbeidsplassenEntry | null {
  const slug = String(professionSlug ?? "").trim();
  if (!slug) return null;
  return CATALOG_PROFESSION_ARBEIDSPLASSEN[slug] ?? null;
}

/** Primary vacancy-catalog STYRK for a catalogue profession. */
export function resolvePrimaryNavStyrkCodeForProfession(
  professionSlug: string
): string | null {
  return resolveArbeidsplassenEntryForProfessionSlug(professionSlug)?.styrkCode ?? null;
}

/**
 * Category-filtered stillinger URL for one occupation leaf.
 * Emits the canonical query shape Arbeidsplassen redirects to / accepts.
 */
export function buildArbeidsplassenOccupationUrl(entry: {
  level1Label: string;
  occupationLabel: string;
}): string {
  const level1 = String(entry.level1Label ?? "").trim();
  const occupation = String(entry.occupationLabel ?? "").trim();
  if (!level1 || !occupation) return NAV_TAXONOMY_AUTHORITY_URL;

  const level2 = `${level1}.${occupation}`;
  const params = new URLSearchParams();
  params.set("occupationLevel1", level1);
  params.set("occupationLevel2", level2);
  return `${NAV_TAXONOMY_AUTHORITY_URL}?${params.toString()}`;
}

export function resolveArbeidsplassenUrlForProfessionSlug(
  professionSlug: string
): string | null {
  const entry = resolveArbeidsplassenEntryForProfessionSlug(professionSlug);
  if (!entry) return null;
  return buildArbeidsplassenOccupationUrl(entry);
}
