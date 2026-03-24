import {
    getDerivedStrengthMatchTerms,
    getInterestMatchTerms,
  } from "@/lib/planning/child-tag-catalog";
  import { getProfessionChildFit } from "@/lib/planning/get-profession-child-fit";
  import {
    getSuggestedProfessions,
    type SuggestedProfession,
  } from "@/lib/planning/get-suggested-professions";
  import type {
    DesiredIncomeBand,
    PreferredEducationLevel,
    PreferredWorkStyle,
  } from "@/lib/planning/profession-fit-utils";
  
  type ProfessionForChildSummary = {
    id: string;
    slug: string;
    title_i18n: Record<string, string> | null;
    summary_i18n: Record<string, string> | null;
    key_skills: unknown;
    interest_tags: unknown;
    strength_tags: unknown;
    development_focus_tags: unknown;
    school_subject_tags: unknown;
    avg_salary_nok: number | null;
    demand_level: string;
    education_level: string;
    work_style: string;
  };
  
  export type ChildSummary = {
    topProfessions: SuggestedProfession[];
    matchingProfessionCount: number;
    savedProfessionCount: number;
    strongestDirectionTerms: string[];
    priorityStrengthIds: string[];
    priorityDevelopmentFocusIds: string[];
    usefulSchoolSubjectIds: string[];
    activePreferenceLabels: string[];
  };
  
  function rankItems(items: string[], limit: number): string[] {
    const counts = new Map<string, number>();
  
    for (const item of items) {
      counts.set(item, (counts.get(item) ?? 0) + 1);
    }
  
    return Array.from(counts.entries())
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1];
        }
  
        return a[0].localeCompare(b[0]);
      })
      .slice(0, limit)
      .map(([item]) => item);
  }
  
  function getActivePreferenceLabels({
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
  }: {
    desiredIncomeBand: DesiredIncomeBand;
    preferredWorkStyle: PreferredWorkStyle;
    preferredEducationLevel: PreferredEducationLevel;
  }): string[] {
    const labels: string[] = [];
  
    switch (desiredIncomeBand) {
      case "up_to_600k":
        labels.push("Income: up to 600k NOK");
        break;
      case "600k_to_800k":
        labels.push("Income: 600k to 800k NOK");
        break;
      case "800k_plus":
        labels.push("Income: 800k+ NOK");
        break;
      default:
        break;
    }
  
    switch (preferredWorkStyle) {
      case "onsite":
        labels.push("Work style: onsite");
        break;
      case "hybrid":
        labels.push("Work style: hybrid");
        break;
      case "remote":
        labels.push("Work style: remote");
        break;
      case "mixed":
        labels.push("Work style: mixed");
        break;
      default:
        break;
    }
  
    switch (preferredEducationLevel) {
      case "certificate":
        labels.push("Education: certificate");
        break;
      case "vocational":
        labels.push("Education: vocational");
        break;
      case "bachelor":
        labels.push("Education: bachelor");
        break;
      case "master":
        labels.push("Education: master");
        break;
      case "flexible":
        labels.push("Education: flexible");
        break;
      default:
        break;
    }
  
    return labels;
  }
  
  export function getChildSummary({
    interestIds,
    derivedStrengthIds,
    professions,
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
    savedProfessionCount,
  }: {
    interestIds: string[];
    derivedStrengthIds: string[];
    professions: ProfessionForChildSummary[];
    desiredIncomeBand: DesiredIncomeBand;
    preferredWorkStyle: PreferredWorkStyle;
    preferredEducationLevel: PreferredEducationLevel;
    savedProfessionCount: number;
  }): ChildSummary {
    const professionMap = new Map(
      professions.map((profession) => [profession.id, profession])
    );
  
    const suggestions = getSuggestedProfessions({
      interestIds,
      derivedStrengthIds,
      professions,
      desiredIncomeBand,
      preferredWorkStyle,
      preferredEducationLevel,
    });
  
    const topProfessions = suggestions.slice(0, 3);
  
    const strongestDirectionTerms = rankItems(
      [
        ...getInterestMatchTerms(interestIds),
        ...getDerivedStrengthMatchTerms(derivedStrengthIds),
      ],
      4
    );
  
    const priorityStrengthPool: string[] = [];
    const priorityDevelopmentFocusPool: string[] = [];
    const schoolSubjectPool: string[] = [];
  
    for (const suggestion of suggestions.slice(0, 5)) {
      const sourceProfession = professionMap.get(suggestion.id);
  
      if (!sourceProfession) {
        continue;
      }
  
      const fit = getProfessionChildFit({
        profession: {
          interest_tags: sourceProfession.interest_tags,
          strength_tags: sourceProfession.strength_tags,
          development_focus_tags: sourceProfession.development_focus_tags,
          school_subject_tags: sourceProfession.school_subject_tags,
          avg_salary_nok: sourceProfession.avg_salary_nok,
          work_style: sourceProfession.work_style,
          education_level: sourceProfession.education_level,
        },
        childInterestIds: interestIds,
        childDerivedStrengthIds: derivedStrengthIds,
        desiredIncomeBand,
        preferredWorkStyle,
        preferredEducationLevel,
      });
  
      priorityStrengthPool.push(...fit.missingStrengthIds);
      priorityDevelopmentFocusPool.push(...fit.developmentFocusIds);
      schoolSubjectPool.push(...fit.schoolSubjectIds);
    }
  
    return {
      topProfessions,
      matchingProfessionCount: suggestions.length,
      savedProfessionCount,
      strongestDirectionTerms,
      priorityStrengthIds: rankItems(priorityStrengthPool, 4),
      priorityDevelopmentFocusIds: rankItems(priorityDevelopmentFocusPool, 4),
      usefulSchoolSubjectIds: rankItems(schoolSubjectPool, 4),
      activePreferenceLabels: getActivePreferenceLabels({
        desiredIncomeBand,
        preferredWorkStyle,
        preferredEducationLevel,
      }),
    };
  }