/**
 * Keep in sync with `scripts/lib/contour-b-operational-eligibility.mjs`.
 */

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

/** Sync with `VGS_PATH_DEFINITIONS` keys in `scripts/vgs-path-definitions.mjs`. */
export const SUPPORTED_VGS_PROFESSION_SLUGS = new Set(["electrician"]);

export const CONTOUR_A_OPERATIONAL_BY_PROFESSION: Record<string, Set<string>> = {
  electrician: new Set(["03", "11", "46", "50"]),
};

export const CONTOUR_A_GREEN_READINESS_STATUSES = new Set([
  "ready_for_write",
  "verification_ready_after_write",
]);

export type ContourBOperationalEligibility = {
  eligible: boolean;
  reason: string;
  countyCode?: string;
  professionSlug?: string;
  readinessStatus?: string;
};

export function assessContourBOperationalEligibility(params: {
  countyCode: string;
  professionSlug: string;
  readinessStatus: string;
}): ContourBOperationalEligibility {
  const county = params.countyCode.trim();
  const profession = params.professionSlug.trim();
  const readiness = params.readinessStatus.trim();

  if (!county || !profession) {
    return { eligible: false, reason: "missing_county_or_profession" };
  }

  if (!VGS_PIPELINE_COUNTY_CODES.has(county)) {
    return { eligible: false, reason: "unsupported_county", countyCode: county };
  }

  if (!SUPPORTED_VGS_PROFESSION_SLUGS.has(profession)) {
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

export function getContourAOperationalCounties(professionSlug: string): Set<string> {
  const profession = professionSlug.trim();
  return CONTOUR_A_OPERATIONAL_BY_PROFESSION[profession] ?? new Set();
}

export function usesContourBOperationalRouteReadPath(params: {
  countyCode: string;
  professionSlug: string;
}): boolean {
  const county = params.countyCode.trim();
  const profession = params.professionSlug.trim();
  if (!SUPPORTED_VGS_PROFESSION_SLUGS.has(profession)) return false;
  if (!VGS_PIPELINE_COUNTY_CODES.has(county)) return false;
  const contourAOperational = getContourAOperationalCounties(profession);
  if (contourAOperational.size === 0) return true;
  return !contourAOperational.has(county);
}
