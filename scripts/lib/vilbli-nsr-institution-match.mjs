import { classifyIdentitySemantics } from "../school-identity-semantics.mjs";

export function normalizeSchoolNameForMatch(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\bvideregaende skole\b/g, " ")
    .replace(/\bvideregande skule\b/g, " ")
    .replace(/\bvidaregaande skole\b/g, " ")
    .replace(/\bvidaregaande skule\b/g, " ")
    .replace(/\bvgs\b/g, " ")
    // NSR legal suffix only (e.g. "… skole AS"); not municipality names like "Ås".
    .replace(/\s+as$/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Identity core = normalized brand name with the department suffix removed.
 * BOTH Vilbli (`avd. Høyanger`) and NSR (`Avdeling Høyanger`) must reduce to the
 * same brand core (`forde`), so the strip must cover `avd` AND `avdeling`.
 */
const AVD_SUFFIX_RE = /\b(?:avd|avdeling)\b.*$/;

function extractIdentityCore(name) {
  return normalizeSchoolNameForMatch(name).replace(AVD_SUFFIX_RE, "").trim();
}

/** e.g. "Førde vidaregåande skule avd. Høyanger" → "hoyanger" */
export function extractAvdLocationLabel(vilbliSchoolName) {
  const normalized = normalizeSchoolNameForMatch(vilbliSchoolName);
  const match = normalized.match(/\b(?:avd|avdeling)\.?\s+(.+)$/);
  return match?.[1]?.trim() || null;
}

/**
 * Does an `avd_location` label (e.g. "hoyanger", "nord") point at this NSR campus?
 * Location-only signal — used ONLY to disambiguate campuses inside a single brand
 * cohort (Phase 2). It must never promote a candidate outside the brand cohort.
 */
function avdLocationMatchesInstitution(avdLocation, institutionName, institutionMunicipalityName) {
  const municipalityNorm = normalizeSchoolNameForMatch(institutionMunicipalityName ?? "");
  const institutionNorm = normalizeSchoolNameForMatch(institutionName);
  const avdTokens = avdLocation.split(" ").filter((token) => token.length >= 4);
  if (avdTokens.length === 0) {
    return false;
  }

  const primaryToken = avdTokens[0];
  const municipalityMatches =
    municipalityNorm.length > 0 &&
    (municipalityNorm === avdLocation ||
      municipalityNorm.includes(primaryToken) ||
      avdLocation.includes(municipalityNorm));
  const institutionMatches =
    institutionNorm.includes(primaryToken) ||
    avdTokens.every((token) => institutionNorm.includes(token));

  return municipalityMatches || institutionMatches;
}

const MULTI_AVD_ALLOWED_MATCH_TYPES = new Set([
  "exact_normalized",
  "core_name_match",
  // Phase 2 may mark same-identity campus ties as avd_location_match (CASE 2).
  "avd_location_match",
]);

/**
 * CASE 2 (1:N): Vilbli school identity maps to multiple NSR avd rows at the same tier.
 * Requires core identity match — never expands weak fuzzy ties across different schools.
 * Includes avd_location_match ties when every candidate shares the Vilbli identity core.
 */
export function isMultiAvdIdentityTie({ vilbliSchoolName, tiedCandidates }) {
  if (tiedCandidates.length < 2) {
    return false;
  }

  if (!tiedCandidates.every((candidate) => MULTI_AVD_ALLOWED_MATCH_TYPES.has(candidate.matchType))) {
    return false;
  }

  const vilbliCore = extractIdentityCore(vilbliSchoolName);
  if (!vilbliCore) {
    return false;
  }

  const institutionIds = new Set();
  for (const candidate of tiedCandidates) {
    if (extractIdentityCore(candidate.institution.name) !== vilbliCore) {
      return false;
    }
    institutionIds.add(candidate.institution.id);
  }

  return institutionIds.size === tiedCandidates.length;
}

/**
 * Phase 1: identity-only match (exact / core / conservative fuzzy).
 * NO avd_location scoring here — campus disambiguation happens in Phase 2 within a
 * brand cohort, so a bare location token can never inflate an unrelated brand.
 */
export function classifyInstitutionMatch(vilbliName, institutionName) {
  const vilbliNorm = normalizeSchoolNameForMatch(vilbliName);
  const nsrNorm = normalizeSchoolNameForMatch(institutionName);

  if (vilbliNorm && nsrNorm && vilbliNorm === nsrNorm) {
    return { matchType: "exact_normalized", score: 1 };
  }

  const vilbliCore = vilbliNorm.replace(AVD_SUFFIX_RE, "").trim();
  const nsrCore = nsrNorm.replace(AVD_SUFFIX_RE, "").trim();
  if (vilbliCore && nsrCore && vilbliCore === nsrCore) {
    return { matchType: "core_name_match", score: 0.9 };
  }

  // Vilbli brand equals NSR brand + extra site/campus token(s)
  // e.g. Vilbli "Tveit vidaregåande skule" → "tveit" vs NSR "Tveit … Sti" → "tveit sti"
  if (
    vilbliNorm.length >= 4 &&
    nsrNorm.length > vilbliNorm.length &&
    nsrNorm.startsWith(`${vilbliNorm} `)
  ) {
    return { matchType: "brand_prefix_match", score: 0.85 };
  }
  if (
    vilbliCore.length >= 4 &&
    nsrCore.length > vilbliCore.length &&
    nsrCore.startsWith(`${vilbliCore} `)
  ) {
    return { matchType: "brand_prefix_match", score: 0.85 };
  }

  const vt = vilbliNorm.split(" ").filter(Boolean);
  const nt = nsrNorm.split(" ").filter(Boolean);
  const sharedTokens = vt.filter((token) => token.length >= 4 && nt.includes(token)).length;
  if (sharedTokens >= 2) {
    return { matchType: "fallback_fuzzy", score: 0.6 };
  }

  return { matchType: "none", score: 0 };
}

function pickBestAliasInstitutionMatch(aliasLabels, institutionName) {
  let best = { matchType: "none", score: 0 };
  for (const alias of aliasLabels) {
    const candidate = classifyInstitutionMatch(alias, institutionName);
    if (candidate.score > best.score) {
      best = candidate;
    }
  }
  return best;
}

/**
 * Phase 1 identity classification for a Vilbli school row.
 *
 * CASE 3: slash-separated Vilbli labels match NSR via alias segments, not the raw combined string.
 * CASE 4: LOSA rows never match ordinary NSR institutions here.
 *
 * `institutionMunicipalityName` is retained in the signature for call-site compatibility;
 * campus/location resolution is deferred to Phase 2 (`pickInstitutionMatchesForVilbliSchool`).
 */
export function classifyInstitutionMatchForVilbliSchool(
  vilbliSchoolName,
  institutionName,
  institutionMunicipalityName
) {
  void institutionMunicipalityName;
  const semantics = classifyIdentitySemantics(vilbliSchoolName);
  if (semantics.isLosa) {
    return { matchType: "none", score: 0 };
  }

  if (semantics.hasSlashAliases && semantics.aliasLabels.length > 0) {
    const best = pickBestAliasInstitutionMatch(semantics.aliasLabels, institutionName);
    if (best.score > 0) {
      return { ...best, resolvedVia: "slash_alias_segment" };
    }
    return best;
  }

  return classifyInstitutionMatch(vilbliSchoolName, institutionName);
}

function scoreCandidatesAgainstAliases(tiedCandidates, aliasLabels) {
  let best = null;
  let bestScore = -1;
  let bestCount = 0;

  for (const candidate of tiedCandidates) {
    let candidateBest = 0;
    for (const alias of aliasLabels) {
      const { score } = classifyInstitutionMatch(alias, candidate.institution.name);
      if (score > candidateBest) candidateBest = score;
    }
    if (candidateBest > bestScore) {
      bestScore = candidateBest;
      best = candidate;
      bestCount = 1;
    } else if (candidateBest === bestScore && candidateBest > 0) {
      bestCount += 1;
    }
  }

  if (best && bestCount === 1 && bestScore >= 0.6) {
    return best;
  }
  return null;
}

function pickCampusFromPrimaryAlias(tiedCandidates, primaryAlias) {
  const primaryNorm = normalizeSchoolNameForMatch(primaryAlias);
  const campusHints = ["joarkkask", "joatkka", "joatkk"];
  const hint = campusHints.find((token) => primaryNorm.includes(token));
  if (!hint) return null;

  const matches = tiedCandidates.filter((candidate) =>
    normalizeSchoolNameForMatch(candidate.institution.name).includes(hint)
  );
  return matches.length === 1 ? matches[0] : null;
}

/**
 * Matching spec test case 2: slash-alias Vilbli label, multiple NSR department rows.
 * Pick campus when primary alias segment disambiguates (e.g. Joarkkaskåvllå vs Steigen).
 */
export function resolveSlashAliasNsrTie({ vilbliSchoolName, tiedCandidates }) {
  const semantics = classifyIdentitySemantics(vilbliSchoolName);
  if (!semantics.hasSlashAliases || tiedCandidates.length < 2) {
    return null;
  }

  const aliasLabels = semantics.aliasLabels;
  if (aliasLabels.length === 0) return null;

  const primaryAlias = aliasLabels[0];

  const byCampus = pickCampusFromPrimaryAlias(tiedCandidates, primaryAlias);
  if (byCampus) {
    return { ...byCampus, resolvedVia: "slash_alias_campus_hint" };
  }

  // Use primary Vilbli segment only — secondary alias can over-score a different avd (e.g. Steigen).
  const byPrimaryAlias = scoreCandidatesAgainstAliases(tiedCandidates, [primaryAlias]);
  if (byPrimaryAlias) {
    return { ...byPrimaryAlias, resolvedVia: "slash_alias_primary_segment" };
  }

  return null;
}

/**
 * Phase 2: campus disambiguation via `avd_location`, applied ONLY inside the brand
 * cohort (tied candidates sharing the Vilbli identity core). This is what lets
 * Førde `avd. Høyanger` land on the Høyanger campus without a location token ever
 * selecting an unrelated brand.
 *
 * @returns {null | { matches: Array<object>, unmatched: false, ambiguous: false }}
 */
function resolveAvdLocationCampusTie({ vilbliSchoolName, tiedCandidates }) {
  const avdLocation = extractAvdLocationLabel(vilbliSchoolName);
  if (!avdLocation) {
    return null;
  }

  const vilbliCore = extractIdentityCore(vilbliSchoolName);
  if (!vilbliCore) {
    return null;
  }

  const cohort = tiedCandidates.filter(
    (candidate) => extractIdentityCore(candidate.institution.name) === vilbliCore
  );
  if (cohort.length === 0) {
    return null;
  }

  const campusMatches = cohort
    .filter((candidate) =>
      avdLocationMatchesInstitution(
        avdLocation,
        candidate.institution.name,
        candidate.institution.municipality_name
      )
    )
    .map((candidate) => ({
      ...candidate,
      matchType: "avd_location_match",
      resolvedVia: "avd_location",
    }));

  if (campusMatches.length === 0) {
    return null;
  }

  if (campusMatches.length === 1) {
    return { matches: [campusMatches[0]], unmatched: false, ambiguous: false };
  }

  // Multiple cohort campuses share the same location label (identical avd rows) → CASE 2.
  if (isMultiAvdIdentityTie({ vilbliSchoolName, tiedCandidates: campusMatches })) {
    return {
      matches: campusMatches.map((candidate) => ({
        ...candidate,
        resolvedVia: "multi_avd_identity",
      })),
      unmatched: false,
      ambiguous: false,
    };
  }

  return null;
}

/**
 * @returns {{
 *   matches: Array<object>;
 *   unmatched: boolean;
 *   ambiguous: boolean;
 * }}
 */
export function pickInstitutionMatchesForVilbliSchool({ vilbliSchoolName, ranked }) {
  if (ranked.length === 0) {
    return { matches: [], unmatched: true, ambiguous: false };
  }

  const best = ranked[0];
  const ties = ranked.filter((candidate) => candidate.score === best.score);
  if (ties.length === 1) {
    return { matches: [best], unmatched: false, ambiguous: false };
  }

  // CASE 3: slash-alias campus / segment disambiguation.
  const slashResolved = resolveSlashAliasNsrTie({ vilbliSchoolName, tiedCandidates: ties });
  if (slashResolved) {
    return { matches: [slashResolved], unmatched: false, ambiguous: false };
  }

  // Phase 2: campus disambiguation via avd_location, constrained to the brand cohort.
  const campusResolved = resolveAvdLocationCampusTie({ vilbliSchoolName, tiedCandidates: ties });
  if (campusResolved) {
    return campusResolved;
  }

  // CASE 2: same-identity multi-avd tie → link all rows, 1:1 PSA emission downstream.
  if (isMultiAvdIdentityTie({ vilbliSchoolName, tiedCandidates: ties })) {
    return {
      matches: ties.map((candidate) => ({
        ...candidate,
        resolvedVia: "multi_avd_identity",
      })),
      unmatched: false,
      ambiguous: false,
    };
  }

  return { matches: [], unmatched: false, ambiguous: true };
}

/**
 * @returns {{ match: object, ambiguous: boolean } | { match: null, ambiguous: false, unmatched: true }}
 */
export function pickInstitutionMatchForVilbliSchool(params) {
  const result = pickInstitutionMatchesForVilbliSchool(params);
  if (result.unmatched) {
    return { match: null, ambiguous: false, unmatched: true };
  }
  if (result.ambiguous) {
    return { match: null, ambiguous: true, unmatched: false };
  }
  return { match: result.matches[0], ambiguous: false, unmatched: false };
}

function isMultiAvdIdentityEmission(institutionMatches) {
  return (
    institutionMatches.length > 1 &&
    institutionMatches.every((match) => match.resolvedVia === "multi_avd_identity")
  );
}

/**
 * CASE 2 matcher may resolve multiple NSR avd rows for one Vilbli school identity.
 * PSA emission stays 1:1 with Vilbli / VIGO school-brand until a campus has
 * programme×stage evidence (Tier 2+).
 *
 * @param {Array<{
 *   institutionId: string;
 *   institutionMunicipalityCode?: string | null;
 *   institutionName?: string | null;
 *   resolvedVia?: string | null;
 * }>} institutionMatches
 */
export function pickInstitutionsForPsaEmission(institutionMatches) {
  if (institutionMatches.length <= 1) {
    return institutionMatches;
  }
  if (!isMultiAvdIdentityEmission(institutionMatches)) {
    return institutionMatches;
  }

  const sorted = [...institutionMatches].sort((a, b) => {
    const nameA = a.institutionName ?? a.institutionId ?? "";
    const nameB = b.institutionName ?? b.institutionId ?? "";
    const byName = String(nameA).localeCompare(String(nameB), "nb");
    if (byName !== 0) return byName;
    return String(a.institutionId ?? "").localeCompare(String(b.institutionId ?? ""));
  });

  return [sorted[0]];
}
