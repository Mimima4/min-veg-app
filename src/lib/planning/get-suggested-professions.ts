type ProfessionForMatching = {
    id: string;
    slug: string;
    title_i18n: Record<string, string> | null;
    summary_i18n: Record<string, string> | null;
    key_skills: unknown;
    avg_salary_nok: number | null;
    demand_level: string;
  };
  
  export type SuggestedProfession = ProfessionForMatching & {
    matchScore: number;
    matchedTerms: string[];
  };
  
  function normalizeText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
  }
  
  function normalizeList(values: string[]): string[] {
    return Array.from(new Set(values.map(normalizeText).filter(Boolean)));
  }
  
  function splitWords(value: string): string[] {
    return normalizeText(value)
      .split(/[\s/-]+/)
      .map((word) => word.trim())
      .filter((word) => word.length >= 3);
  }
  
  function phrasesMatch(a: string, b: string): boolean {
    const left = normalizeText(a);
    const right = normalizeText(b);
  
    if (!left || !right) return false;
    if (left === right) return true;
    if (left.includes(right) || right.includes(left)) return true;
  
    const leftWords = splitWords(left);
    const rightWords = splitWords(right);
  
    return leftWords.some((word) => rightWords.includes(word));
  }
  
  function demandWeight(demandLevel: string): number {
    switch (demandLevel) {
      case "high":
        return 3;
      case "medium":
        return 2;
      case "low":
        return 1;
      default:
        return 0;
    }
  }
  
  export function getSuggestedProfessions({
    interests,
    strengths,
    professions,
  }: {
    interests: string[];
    strengths: string[];
    professions: ProfessionForMatching[];
  }): SuggestedProfession[] {
    const childSignals = normalizeList([...interests, ...strengths]);
  
    if (childSignals.length === 0) {
      return [];
    }
  
    const suggestions: SuggestedProfession[] = [];
  
    for (const profession of professions) {
      const skills = Array.isArray(profession.key_skills)
        ? normalizeList(
            profession.key_skills.filter(
              (item): item is string => typeof item === "string"
            )
          )
        : [];
  
      const matchedTerms = skills.filter((skill) =>
        childSignals.some((signal) => phrasesMatch(signal, skill))
      );
  
      const matchScore = matchedTerms.length;
  
      if (matchScore > 0) {
        suggestions.push({
          ...profession,
          matchScore,
          matchedTerms,
        });
      }
    }
  
    return suggestions.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
  
      if (demandWeight(b.demand_level) !== demandWeight(a.demand_level)) {
        return demandWeight(b.demand_level) - demandWeight(a.demand_level);
      }
  
      return a.slug.localeCompare(b.slug);
    });
  }