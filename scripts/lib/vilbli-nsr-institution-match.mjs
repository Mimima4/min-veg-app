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
    .replace(/\bas\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractIdentityCore(name) {
  return normalizeSchoolNameForMatch(name).replace(/\bavd\b.*$/, "").trim();
}

const MULTI_AVD_ALLOWED_MATCH_TYPES = new Set(["exact_normalized", "core_name_match"]);

/**
 * CASE 2 (1:N): Vilbli school identity maps to multiple NSR avd rows at the same tier.
 * Requires core identity match — never expands weak fuzzy ties across different schools.
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

export function classifyInstitutionMatch(vilbliName, institutionName) {
  const vilbliNorm = normalizeSchoolNameForMatch(vilbliName);
  const nsrNorm = normalizeSchoolNameForMatch(institutionName);

  if (vilbliNorm && nsrNorm && vilbliNorm === nsrNorm) {
    return { matchType: "exact_normalized", score: 1 };
  }

  const vilbliCore = vilbliNorm.replace(/\bavd\b.*$/, "").trim();
  const nsrCore = nsrNorm.replace(/\bavd\b.*$/, "").trim();
  if (vilbliCore && nsrCore && vilbliCore === nsrCore) {
    return { matchType: "core_name_match", score: 0.9 };
  }

  const vt = vilbliNorm.split(" ").filter(Boolean);
  const nt = nsrNorm.split(" ").filter(Boolean);
  const sharedTokens = vt.filter((token) => token.length >= 4 && nt.includes(token)).length;
  if (sharedTokens >= 2) {
    return { matchType: "fallback_fuzzy", score: 0.6 };
  }

  return { matchType: "none", score: 0 };
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

  const slashResolved = resolveSlashAliasNsrTie({ vilbliSchoolName, tiedCandidates: ties });
  if (slashResolved) {
    return { matches: [slashResolved], unmatched: false, ambiguous: false };
  }

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
