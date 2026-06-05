import { classifyIdentitySemantics } from "../school-identity-semantics.mjs";

export function normalizeSchoolNameForMatch(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\bvideregaende skole\b/g, " ")
    .replace(/\bvideregande skule\b/g, " ")
    .replace(/\bvidaregaande skule\b/g, " ")
    .replace(/\bvgs\b/g, " ")
    .replace(/\bas\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
 * @returns {{ match: object, ambiguous: boolean } | { match: null, ambiguous: false, unmatched: true }}
 */
export function pickInstitutionMatchForVilbliSchool({ vilbliSchoolName, ranked }) {
  if (ranked.length === 0) {
    return { match: null, ambiguous: false, unmatched: true };
  }

  const best = ranked[0];
  const ties = ranked.filter((candidate) => candidate.score === best.score);
  if (ties.length === 1) {
    return { match: best, ambiguous: false, unmatched: false };
  }

  const resolved = resolveSlashAliasNsrTie({ vilbliSchoolName, tiedCandidates: ties });
  if (resolved) {
    return { match: resolved, ambiguous: false, unmatched: false };
  }

  return { match: null, ambiguous: true, unmatched: false };
}
