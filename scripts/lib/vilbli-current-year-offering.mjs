/**
 * Current-year programme offering truth for Contour B (I-1…I-3).
 * Owner: docs/architecture/phase-4-current-year-programme-offering-owner-decision-record.md
 *
 * REAL SIGNAL (amended 2026-07-22):
 *   Authority for a Contour B county ingest is **that county’s** Vilbli `side=p5` page.
 *   There is **no** Oslo-probe gold list. Each fylke/profession owns its truth (same spirit as P-7).
 *
 *   For landslinje courses the county page still pins multi-fylke schools; local pins on that
 *   page stay in the offering set and must not be deactivated. Out-of-county pins are NOT written
 *   into home PSA (extract already county-filters) — they feed the continuation allowlist for
 *   P-7 / P-8 alternatives.
 *
 * DESIGN (amended 2026-07-22):
 *   - **VG2+:** county-page `vb_map_data` pins ARE the offering set even when they span only
 *     one fylke. This stops `html_stage_block` structure links (e.g. Agder Østre Agder on
 *     anleggsgartner) from staying `is_active` when the map pin list does not include them.
 *   - **VG1:** still requires ≥ 2 distinct fylke (landslinje). Broad single-fylke VG1 stays
 *     fail-open so we never mass-deactivate ordinary local VG1 structure.
 *
 * SAFETY (owner requirement #7 — fail-closed ONLY when the extract succeeds):
 *   - No offering HTML / too small / parse throws / no usable stage → NOT enforceable
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
 * Build the current-year offering set from a course-specific strukturkart `side=p5` page.
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
    const stageKey = String(stage ?? "").trim().toUpperCase();
    const fylker = new Set();
    for (const school of schools ?? []) {
      const fylke = normalizeFylke(school?.fylkeName);
      if (fylke) fylker.add(fylke);
    }
    // VG1: landslinje only (≥2 fylke). VG2+: county map pins are authority even for 1 fylke.
    if (stageKey === "VG1" && fylker.size < MIN_LANDSLINJE_FYLKE) {
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
 * Union two offering sets (legacy helper). Contour B write path uses **county page only**
 * (owner 2026-07-22) — kept for smokes/diagnostics.
 */
export function unionCurrentYearOfferingSets(probeOffering, countyPageOffering) {
  if (!probeOffering && !countyPageOffering) return null;
  if (!probeOffering) return countyPageOffering;
  if (!countyPageOffering) return probeOffering;

  const byStage = {};
  const stageCounts = {};
  const stages = new Set([
    ...Object.keys(probeOffering.byStage ?? {}),
    ...Object.keys(countyPageOffering.byStage ?? {}),
  ]);
  for (const stage of stages) {
    const a = probeOffering.byStage?.[stage];
    const b = countyPageOffering.byStage?.[stage];
    if (!a && !b) continue;
    const codes = new Set([...(a?.codes ?? []), ...(b?.codes ?? [])]);
    const names = new Set([...(a?.names ?? []), ...(b?.names ?? [])]);
    const fylkeCount = Math.max(a?.fylkeCount ?? 0, b?.fylkeCount ?? 0);
    if (codes.size === 0 && names.size === 0) continue;
    byStage[stage] = { codes, names, fylkeCount };
    stageCounts[stage] = codes.size || names.size;
  }
  if (Object.keys(byStage).length === 0) return null;
  return {
    byStage,
    source: "vilbli_strukturkart_landstilbud_p5_union_probe_county",
    stageCounts,
  };
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
