import {
    type DesiredIncomeBand,
    type PreferredEducationLevel,
    type PreferredWorkStyle,
    getPreferenceMatchLabels,
  } from "@/lib/planning/profession-fit-utils";
  
  type ProfessionFitInput = {
    interest_tags: unknown;
    strength_tags: unknown;
    development_focus_tags: unknown;
    school_subject_tags: unknown;
    avg_salary_nok: number | null;
    work_style: string;
    education_level: string;
  };
  
  function getStringArray(value: unknown): string[] {
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  }
  
  export function getProfessionChildFit({
    profession,
    childInterestIds,
    childDerivedStrengthIds,
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
  }: {
    profession: ProfessionFitInput;
    childInterestIds: string[];
    childDerivedStrengthIds: string[];
    desiredIncomeBand: DesiredIncomeBand;
    preferredWorkStyle: PreferredWorkStyle;
    preferredEducationLevel: PreferredEducationLevel;
  }) {
    const professionInterestIds = getStringArray(profession.interest_tags);
    const professionStrengthIds = getStringArray(profession.strength_tags);
    const developmentFocusIds = getStringArray(profession.development_focus_tags);
    const schoolSubjectIds = getStringArray(profession.school_subject_tags);
  
    const matchedInterestIds = professionInterestIds.filter((id) =>
      childInterestIds.includes(id)
    );
  
    const matchedStrengthIds = professionStrengthIds.filter((id) =>
      childDerivedStrengthIds.includes(id)
    );
  
    const missingStrengthIds = professionStrengthIds.filter(
      (id) => !childDerivedStrengthIds.includes(id)
    );
  
    const preferenceMatches = getPreferenceMatchLabels({
      avgSalaryNok: profession.avg_salary_nok,
      workStyle: profession.work_style,
      educationLevel: profession.education_level,
      desiredIncomeBand,
      preferredWorkStyle,
      preferredEducationLevel,
    });
  
    return {
      matchedInterestIds,
      matchedStrengthIds,
      missingStrengthIds,
      developmentFocusIds,
      schoolSubjectIds,
      preferenceMatches,
    };
  }