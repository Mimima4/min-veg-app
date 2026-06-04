import { getVgsPathDefinition, VGS_PATH_DEFINITIONS } from "../vgs-path-definitions.mjs";

/**
 * Eligibility for Contour B batch + relay.
 * Mandatory expansion/ops rules when adding professions or counties to the product:
 * `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` § "Mandatory rules when updating application information".
 */

/** Professions with a VGS Vilbli path (extend when adding to `vgs-path-definitions.mjs`). */
export const SUPPORTED_VGS_PROFESSION_SLUGS = new Set(Object.keys(VGS_PATH_DEFINITIONS));

/** Same keys as `run-vgs-truth-pipeline.mjs` / `classify-vgs-truth-readiness.mjs`. */
export const VGS_PIPELINE_COUNTY_CODES = new Set([
  "03",
  "11",
  "15",
  "18",
  "31",
  "32",
  "33",
  "34",
  "39",
  "40",
  "42",
  "46",
  "50",
  "55",
  "56",
]);

/**
 * Per-profession counties where Contour A full operational write applies when readiness is green.
 * Add professions here when a #2 green-counties charter exists; empty/missing => Contour B path allowed.
 */
export const CONTOUR_A_OPERATIONAL_BY_PROFESSION = {
  electrician: new Set(["03", "11", "46", "50"]),
};

export const CONTOUR_A_GREEN_READINESS_STATUSES = new Set([
  "ready_for_write",
  "verification_ready_after_write",
]);

export function getContourAOperationalCounties(professionSlug) {
  const profession = String(professionSlug ?? "").trim();
  return CONTOUR_A_OPERATIONAL_BY_PROFESSION[profession] ?? new Set();
}

/**
 * Contour B operational ingest when Contour A cannot complete a full truth write.
 * Any VGS path profession + pipeline county; not tied to one fylke or one profession.
 */
export function assessContourBOperationalEligibility({
  countyCode,
  professionSlug,
  readinessStatus,
}) {
  const county = String(countyCode ?? "").trim();
  const profession = String(professionSlug ?? "").trim();
  const readiness = String(readinessStatus ?? "").trim();

  if (!county || !profession) {
    return { eligible: false, reason: "missing_county_or_profession" };
  }

  if (!VGS_PIPELINE_COUNTY_CODES.has(county)) {
    return { eligible: false, reason: "unsupported_county", countyCode: county };
  }

  if (!getVgsPathDefinition(profession)) {
    return { eligible: false, reason: "unsupported_profession", professionSlug: profession };
  }

  const contourAOperational = getContourAOperationalCounties(profession);
  const contourAGreen =
    contourAOperational.has(county) && CONTOUR_A_GREEN_READINESS_STATUSES.has(readiness);

  if (contourAGreen) {
    return {
      eligible: false,
      reason: "use_contour_a",
      countyCode: county,
      professionSlug: profession,
      readinessStatus: readiness,
    };
  }

  return {
    eligible: true,
    reason: "contour_b_partial",
    countyCode: county,
    professionSlug: profession,
    readinessStatus: readiness || "unknown",
  };
}

/** Route may read Contour B PSA rows (same programme_selection path as Contour A). */
export function usesContourBOperationalRouteReadPath({ countyCode, professionSlug }) {
  const county = String(countyCode ?? "").trim();
  const profession = String(professionSlug ?? "").trim();
  if (!getVgsPathDefinition(profession)) return false;
  if (!VGS_PIPELINE_COUNTY_CODES.has(county)) return false;
  if (getContourAOperationalCounties(profession).has(county)) return false;
  return true;
}
