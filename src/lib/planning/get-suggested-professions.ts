import {
  type DesiredIncomeBand,
  type PreferredEducationLevel,
  type PreferredWorkStyle,
  getPreferenceMatchLabels,
} from "@/lib/planning/profession-fit-utils";

type ProfessionForMatching = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
  summary_i18n: Record<string, string> | null;
  key_skills: unknown;
  interest_tags: unknown;
  strength_tags: unknown;
  development_focus_tags: unknown;
  school_subject_tags: unknown;
  education_notes_i18n: Record<string, string> | null;
  avg_salary_nok: number | null;
  demand_level: string;
  education_level: string;
  work_style: string;
};

export type SuggestedProfession = ProfessionForMatching & {
  matchScore: number;
  matchedInterestIds: string[];
  matchedStrengthIds: string[];
  matchedPreferences: string[];
};

const MIN_VISIBLE_MATCH_SCORE = 6;

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
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
  interestIds,
  derivedStrengthIds,
  professions,
  desiredIncomeBand,
  preferredWorkStyle,
  preferredEducationLevel,
}: {
  interestIds: string[];
  derivedStrengthIds: string[];
  professions: ProfessionForMatching[];
  desiredIncomeBand: DesiredIncomeBand;
  preferredWorkStyle: PreferredWorkStyle;
  preferredEducationLevel: PreferredEducationLevel;
}): SuggestedProfession[] {
  const suggestions: SuggestedProfession[] = [];

  const activePreferenceCount = [
    desiredIncomeBand !== "open",
    preferredWorkStyle !== "open",
    preferredEducationLevel !== "open",
  ].filter(Boolean).length;

  for (const profession of professions) {
    const professionInterestIds = getStringArray(profession.interest_tags);
    const professionStrengthIds = getStringArray(profession.strength_tags);

    const matchedInterestIds = professionInterestIds.filter((id) =>
      interestIds.includes(id)
    );

    const matchedStrengthIds = professionStrengthIds.filter((id) =>
      derivedStrengthIds.includes(id)
    );

    const matchedPreferences = getPreferenceMatchLabels({
      avgSalaryNok: profession.avg_salary_nok,
      workStyle: profession.work_style,
      educationLevel: profession.education_level,
      desiredIncomeBand,
      preferredWorkStyle,
      preferredEducationLevel,
    });

    const matchScore =
      matchedInterestIds.length * 2 +
      matchedStrengthIds.length * 3 +
      matchedPreferences.length;

    const passesPreferenceGate =
      activePreferenceCount === 0 || matchedPreferences.length > 0;

    if (
      matchScore >= MIN_VISIBLE_MATCH_SCORE &&
      passesPreferenceGate
    ) {
      suggestions.push({
        ...profession,
        matchScore,
        matchedInterestIds,
        matchedStrengthIds,
        matchedPreferences,
      });
    }
  }

  return suggestions.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }

    if (b.matchedPreferences.length !== a.matchedPreferences.length) {
      return b.matchedPreferences.length - a.matchedPreferences.length;
    }

    if (demandWeight(b.demand_level) !== demandWeight(a.demand_level)) {
      return demandWeight(b.demand_level) - demandWeight(a.demand_level);
    }

    return a.slug.localeCompare(b.slug);
  });
}