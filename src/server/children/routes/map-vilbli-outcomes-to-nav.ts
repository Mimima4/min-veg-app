import type { VilbliOutcomeProfession } from "./build-path-variants";
import { getNavTaxonomySnapshot } from "./nav-taxonomy-adapter";

type NavMappedOutcome = {
  sourceOutcome: VilbliOutcomeProfession;
  navTitle: string | null;
  navYrkeskategori: string | null;
  navCode: string | null;
  reviewNeeded: boolean;
  reviewReason: string | null;
  reviewStrength?: "weak_match" | "no_match";
  confidence: "high" | "medium" | "low";
  matchMethod: string | null;
};

type NavOccupationCandidate = {
  code: string;
  navTitle: string;
  navTitleCore: string;
  navYrkeskategori: string | null;
};

function normalize(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length >= 3);
}

function coreProfessionTerm(value: string): string {
  const noParens = value.replace(/\([^)]*\)/g, " ");
  const beforeComma = noParens.split(",")[0] ?? "";
  const beforeSlash = beforeComma.split("/")[0] ?? "";
  return normalize(beforeSlash);
}

function scoreTitleMatch(sourceTitle: string, navTitle: string): {
  score: number;
  matchMethod: string | null;
} {
  const sourceNorm = coreProfessionTerm(sourceTitle);
  const navNorm = coreProfessionTerm(navTitle);
  if (!sourceNorm || !navNorm) {
    return { score: 0, matchMethod: null };
  }

  if (sourceNorm === navNorm) {
    return { score: 1, matchMethod: "exact_title" };
  }

  if (sourceNorm.includes(navNorm) || navNorm.includes(sourceNorm)) {
    return { score: 0.85, matchMethod: "title_contains" };
  }

  const sourceTokens = tokenize(sourceNorm).filter((token) => token.length >= 5);
  if (sourceTokens.length > 0) {
    const navTokenSet = new Set(tokenize(navNorm));
    const hasKeyword = sourceTokens.some((token) => navTokenSet.has(token));
    if (hasKeyword) {
      return { score: 0.7, matchMethod: "keyword_contains" };
    }
  }

  return { score: 0, matchMethod: null };
}

async function fetchNavOccupationCandidates(): Promise<NavOccupationCandidate[]> {
  const taxonomy = await getNavTaxonomySnapshot();
  const categoryByCode = new Map(
    taxonomy.level1Categories.map((category) => [category.code, category.label])
  );
  const candidates = new Map<string, NavOccupationCandidate>();
  for (const occupation of taxonomy.occupations) {
    const navTitle = occupation.label;
    const key = normalize(navTitle);
    if (!key || candidates.has(key)) continue;

    candidates.set(key, {
      code: occupation.code,
      navTitle,
      navTitleCore: coreProfessionTerm(navTitle),
      navYrkeskategori: occupation.level1Code
        ? categoryByCode.get(occupation.level1Code) ?? null
        : null,
    });
  }

  return Array.from(candidates.values());
}

export async function mapVilbliOutcomesToNav(params: {
  outcomes: VilbliOutcomeProfession[];
  maxCandidates?: number;
}): Promise<{
  mapped: NavMappedOutcome[];
}> {
  const maxCandidates = params.maxCandidates ?? Number.POSITIVE_INFINITY;
  const candidates = Number.isFinite(maxCandidates)
    ? params.outcomes.slice(0, maxCandidates)
    : params.outcomes;

  const navCandidates = await fetchNavOccupationCandidates();
  const mapped: NavMappedOutcome[] = [];

  for (const outcome of candidates) {
    try {
      if (navCandidates.length === 0) {
        mapped.push({
          sourceOutcome: outcome,
          navTitle: null,
          navYrkeskategori: null,
          navCode: null,
          reviewNeeded: true,
          reviewReason: "no_nav_taxonomy_match",
          reviewStrength: "no_match",
          confidence: "low",
          matchMethod: null,
        });
        continue;
      }

      const ranked = navCandidates
        .map((candidate) => ({
          candidate,
          ...scoreTitleMatch(outcome.vilbliTitle, candidate.navTitle),
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score);
      const best = ranked[0] ?? null;

      if (!best) {
        mapped.push({
          sourceOutcome: outcome,
          navTitle: null,
          navYrkeskategori: null,
          navCode: null,
          reviewNeeded: true,
          reviewReason: "no_nav_taxonomy_match",
          reviewStrength: "no_match",
          confidence: "low",
          matchMethod: null,
        });
        continue;
      }

      const confidence: "high" | "medium" | "low" =
        best.score >= 0.85 ? "high" : best.score >= 0.7 ? "medium" : "low";
      const isExact = best.matchMethod === "exact_title";
      const isContains = best.matchMethod === "title_contains";
      const hasMatch = isExact || isContains;
      const reviewNeeded = !hasMatch;
      const reviewReason = hasMatch ? null : "no_nav_taxonomy_match";
      const reviewStrength = hasMatch
        ? isContains
          ? ("weak_match" as const)
          : undefined
        : ("no_match" as const);

      mapped.push({
        sourceOutcome: outcome,
        navTitle: best.matchMethod === "exact_title" ? best.candidate.navTitle : null,
        navYrkeskategori: best.candidate.navYrkeskategori,
        navCode: best.candidate.code,
        reviewNeeded,
        reviewReason,
        reviewStrength,
        confidence,
        matchMethod: best.matchMethod,
      });
    } catch (error) {
      mapped.push({
        sourceOutcome: outcome,
        navTitle: null,
        navYrkeskategori: null,
        navCode: null,
        reviewNeeded: true,
        reviewReason:
          "no_nav_taxonomy_match",
        reviewStrength: "no_match",
        confidence: "low",
        matchMethod: null,
      });
    }
  }

  return { mapped };
}
