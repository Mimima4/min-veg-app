/**
 * Current-year programme offering truth for Contour B (I-1…I-3).
 * Owner: docs/architecture/phase-4-current-year-programme-offering-owner-decision-record.md
 *
 * REAL SIGNAL (audited 2026-07-18 from a home-IP fetch — see §4a of the owner record):
 *   The national strukturkart `side=p2` «fag- og timefordeling» page carries NO `vb_map_data`
 *   and NO school listing — it is only the subject/hour course graph. The earlier assumption that
 *   p2 mirrors the county `side=p5` map was WRONG, so the previous parser returned null forever
 *   (gate stuck fail-open).
 *
 *   `vb_map_data_Vg*` exists ONLY on county-scoped `side=p5` pages. For a «landslinje /
 *   landstilbud» course (a nationally-coordinated line offered at a handful of schools, e.g.
 *   anleggsteknikk VG2), the VG2 map on EVERY county page pins the same *national* offering
 *   schools — spanning several fylke — while broad, non-landslinje stages (e.g. VG1 Bygg- og
 *   anleggsteknikk) pin only that page's own single county.
 *
 *   We therefore fetch the course-specific `skoler-og-laerebedrifter … side=p5` page for a PROBE
 *   county that does NOT offer the landslinje locally (Oslo for anleggsteknikk). Its `vb_map_data_Vg2`
 *   is then exactly the national current-year offering set (no local-structure contamination). See
 *   `strukturkartReferenceUrl` in scripts/vgs-path-definitions.mjs.
 *
 * DESIGN:
 *   - A stage is treated as the offering set ONLY when its pins span ≥ 2 distinct fylke — the
 *     landslinje signal. Single-fylke stages (broad VG1) are left OUT → the gate stays fail-open
 *     for them (never deactivates broadly-offered stages). This is what keeps VG1 safe even though
 *     the probe page also carries a (single-county) `vb_map_data_Vg1`.
 *   - Membership is NATIONAL: the same offering set is applied to every county, because a
 *     landslinje school in county X must stay active in X while structure-only schools elsewhere
 *     are dropped.
 *
 * SAFETY (owner requirement #7 — fail-closed ONLY when the extract succeeds):
 *   - No offering HTML / too small / parse throws / no landslinje stage → NOT enforceable
 *     (fail-open: keep current behavior). The caller must still emit a loud diagnostic.
 *   - Offering present + non-empty for a stage → enforceable: schools not in the offering set
 *     are structure-only and must not stay is_active=true.
 */
import { extractVilbliMapPinsByStage } from "../vilbli-stage-extraction-helper.mjs";

/** Minimum plausible full-page size; below this Vilbli returned a stub / block page. */
const MIN_OFFERING_HTML_BYTES = 10_000;

/** A stage counts as a «landslinje / landstilbud» offering only if it spans ≥ this many fylke. */
const MIN_LANDSLINJE_FYLKE = 2;

function normalizeOfferingName(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFylke(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .trim();
}

/**
 * Build the current-year offering set from a course-specific national strukturkart `side=p5` page.
 *
 * `countySlug` / `countyLabel` are accepted for signature compatibility and diagnostics only —
 * the offering set is NATIONAL (a landslinje is offered by the same schools regardless of the
 * county being ingested), so no per-county filtering is applied to membership.
 *
 * @returns {null | { byStage: Record<string, { codes: Set<string>, names: Set<string>, fylkeCount: number }>, source: string, stageCounts: Record<string, number> }}
 *   `null` when offering extraction is unavailable (fail-open signal).
 */
export function buildCurrentYearOfferingSet({ offeringHtml, countySlug, countyLabel } = {}) {
  void countySlug;
  void countyLabel;
  const html = String(offeringHtml ?? "");
  if (html.length < MIN_OFFERING_HTML_BYTES) {
    return null;
  }

  let byStagePins;
  try {
    byStagePins = extractVilbliMapPinsByStage(html);
  } catch {
    return null;
  }

  const byStage = {};
  const stageCounts = {};
  for (const [stage, schools] of Object.entries(byStagePins ?? {})) {
    const fylker = new Set();
    for (const school of schools ?? []) {
      const fylke = normalizeFylke(school?.fylkeName);
      if (fylke) fylker.add(fylke);
    }
    // Only a landslinje/landstilbud stage (national, multi-fylke) is a current-year offering set.
    // Broad single-county stages (e.g. VG1 Bygg- og anleggsteknikk) are intentionally left out so
    // the gate stays fail-open for them.
    if (fylker.size < MIN_LANDSLINJE_FYLKE) {
      continue;
    }

    const codes = new Set();
    const names = new Set();
    for (const school of schools ?? []) {
      const code = String(school?.schoolCode ?? "").trim();
      if (code) codes.add(code);
      const name = normalizeOfferingName(school?.schoolName);
      if (name) names.add(name);
    }
    if (codes.size === 0 && names.size === 0) {
      continue;
    }
    byStage[stage] = { codes, names, fylkeCount: fylker.size };
    stageCounts[stage] = codes.size || names.size;
  }

  const anyOffering = Object.values(stageCounts).some((count) => count > 0);
  if (!anyOffering) {
    return null;
  }

  return { byStage, source: "vilbli_strukturkart_landstilbud_p5", stageCounts };
}

/**
 * Pure per-school decision for the write gate.
 *
 * @returns {{ enforceable: boolean, isOffered: boolean, matchedVia: "code" | "name" | null }}
 *   - enforceable=false → fail-open (offering unknown for this stage); caller keeps is_active=true.
 *   - enforceable=true, isOffered=false → structure-only; caller must skip / deactivate.
 */
export function resolveOfferingDecision({ offering, stage, school }) {
  if (!offering) {
    return { enforceable: false, isOffered: true, matchedVia: null };
  }
  const entry = offering.byStage?.[stage];
  if (!entry || (entry.codes.size === 0 && entry.names.size === 0)) {
    // Offering present overall but empty for THIS stage → cannot safely enforce (fail-open).
    return { enforceable: false, isOffered: true, matchedVia: null };
  }

  const code = String(school?.schoolCode ?? "").trim();
  if (code && entry.codes.has(code)) {
    return { enforceable: true, isOffered: true, matchedVia: "code" };
  }
  const name = normalizeOfferingName(school?.schoolName);
  if (name && entry.names.has(name)) {
    return { enforceable: true, isOffered: true, matchedVia: "name" };
  }
  return { enforceable: true, isOffered: false, matchedVia: null };
}

/**
 * Whether the pipeline may act on the offering gate (skip structure-only writes).
 *
 * Default ON after 2026-07-18 home-IP validation (anlegg VG2 live count=6).
 * Fail-open still applies whenever the extract is null / stage not enforceable —
 * so dense professions whose reference URL still points at schoolsless p2 are unchanged.
 * Opt out explicitly with CONTOUR_B_ENFORCE_CURRENT_YEAR_OFFERING=0.
 */
export function isCurrentYearOfferingEnforcementEnabled(env = process.env) {
  const raw = String(env?.CONTOUR_B_ENFORCE_CURRENT_YEAR_OFFERING ?? "1").trim();
  return raw !== "0" && raw.toLowerCase() !== "false";
}

export { normalizeOfferingName, normalizeFylke, MIN_OFFERING_HTML_BYTES, MIN_LANDSLINJE_FYLKE };
