import {
    coerceInterestIds,
    coerceObservedTraitIds,
    getDerivedStrengthIds,
  } from "@/lib/planning/child-tag-catalog";
  
  export type DesiredIncomeBand =
    | "open"
    | "up_to_600k"
    | "600k_to_800k"
    | "800k_plus";
  
  export type PreferredWorkStyle =
    | "open"
    | "onsite"
    | "hybrid"
    | "remote"
    | "mixed";
  
  export type PreferredEducationLevel =
    | "open"
    | "upper_secondary"
    | "apprenticeship"
    | "certificate"
    | "vocational"
    | "vocational_college"
    | "bachelor"
    | "master"
    | "professional_degree"
    | "flexible";
  
  export type ChildPlanningSourceRow = {
    interests: unknown;
    observed_traits: unknown;
    desired_income_band: DesiredIncomeBand | null;
    preferred_work_style: PreferredWorkStyle | null;
    preferred_education_level: PreferredEducationLevel | null;
    preferred_municipality_codes: unknown;
  };
  
  export type ChildPlanningState = {
    interestIds: string[];
    observedTraitIds: string[];
    derivedStrengthIds: string[];
    desiredIncomeBand: DesiredIncomeBand;
    preferredWorkStyle: PreferredWorkStyle;
    preferredEducationLevel: PreferredEducationLevel;
    preferredMunicipalityCodes: string[];
    hasPlanningFilters: boolean;
    currentSignalsCount: number;
  };
  
  export function getChildPlanningState(
    row: ChildPlanningSourceRow
  ): ChildPlanningState {
    const rawInterests = Array.isArray(row.interests)
      ? row.interests.filter((item): item is string => typeof item === "string")
      : [];
  
    const rawObservedTraits = Array.isArray(row.observed_traits)
      ? row.observed_traits.filter(
          (item): item is string => typeof item === "string"
        )
      : [];
  
    const interestIds = coerceInterestIds(rawInterests);
    const observedTraitIds = coerceObservedTraitIds(rawObservedTraits);
  
    const derivedStrengthIds = getDerivedStrengthIds({
      interestIds,
      observedTraitIds,
    });
  
    const desiredIncomeBand = row.desired_income_band ?? "open";
    const preferredWorkStyle = row.preferred_work_style ?? "open";
    const preferredEducationLevel = row.preferred_education_level ?? "open";
  
    const preferredMunicipalityCodes = Array.isArray(
      row.preferred_municipality_codes
    )
      ? row.preferred_municipality_codes.filter(
          (item): item is string => typeof item === "string"
        )
      : [];
  
    const hasPlanningFilters =
      desiredIncomeBand !== "open" ||
      preferredWorkStyle !== "open" ||
      preferredEducationLevel !== "open";
  
    return {
      interestIds,
      observedTraitIds,
      derivedStrengthIds,
      desiredIncomeBand,
      preferredWorkStyle,
      preferredEducationLevel,
      preferredMunicipalityCodes,
      hasPlanningFilters,
      currentSignalsCount: interestIds.length + observedTraitIds.length,
    };
  }