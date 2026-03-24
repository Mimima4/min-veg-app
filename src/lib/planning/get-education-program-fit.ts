import type { SupportedLocale } from "@/lib/i18n/site-copy";
import {
  getDerivedStrengthLabel,
  getInterestLabel,
} from "@/lib/planning/child-tag-catalog";
import { getProfessionChildFit } from "@/lib/planning/get-profession-child-fit";
import {
  getDevelopmentFocusLabel,
  getSchoolSubjectLabel,
} from "@/lib/planning/profession-tag-catalog";
import type {
  DesiredIncomeBand,
  PreferredEducationLevel,
  PreferredWorkStyle,
} from "@/lib/planning/profession-fit-utils";

type ProfessionForEducationReason = {
  interest_tags: unknown;
  strength_tags: unknown;
  development_focus_tags: unknown;
  school_subject_tags: unknown;
  avg_salary_nok?: number | null;
  work_style: string;
  education_level: string;
};

export type EducationProgramPreferenceState =
  | "open"
  | "aligned"
  | "flexible"
  | "broader";

export type EducationProgramLocationState = "local" | "broader";

export type EducationRouteType =
  | "academic_first"
  | "practical_first"
  | "flexible_route";

export type EducationDecisionRole =
  | "local_priority"
  | "main_route"
  | "stretch_route"
  | "local_alternative"
  | "broader_alternative";

export type EducationProgramDecisionSupport = {
  supportingInterestLabels: string[];
  supportingStrengthLabels: string[];
  schoolFocusLabels: string[];
  developmentLabels: string[];
  preferenceState: EducationProgramPreferenceState;
  locationState: EducationProgramLocationState;
  routeType: EducationRouteType;
  decisionRole: EducationDecisionRole;
  hasSignals: boolean;
};

const ROUTE_TYPE_LABELS: Record<
  EducationRouteType,
  Record<SupportedLocale, string>
> = {
  academic_first: {
    nb: "Akademisk først",
    nn: "Akademisk først",
    en: "Academic-first",
  },
  practical_first: {
    nb: "Praktisk først",
    nn: "Praktisk først",
    en: "Practical-first",
  },
  flexible_route: {
    nb: "Fleksibel rute",
    nn: "Fleksibel rute",
    en: "Flexible route",
  },
};

const DECISION_ROLE_LABELS: Record<
  EducationDecisionRole,
  Record<SupportedLocale, string>
> = {
  local_priority: {
    nb: "Lokal hovedrute",
    nn: "Lokal hovudrute",
    en: "Local main route",
  },
  main_route: {
    nb: "Hovedrute",
    nn: "Hovudrute",
    en: "Main route",
  },
  stretch_route: {
    nb: "Strekk-rute",
    nn: "Strekk-rute",
    en: "Stretch route",
  },
  local_alternative: {
    nb: "Lokalt alternativ",
    nn: "Lokalt alternativ",
    en: "Local alternative",
  },
  broader_alternative: {
    nb: "Bredere alternativ",
    nn: "Breiare alternativ",
    en: "Broader alternative",
  },
};

function uniqueLimit(items: string[], limit: number): string[] {
  return Array.from(new Set(items)).slice(0, limit);
}

export function getEducationRouteType(
  programEducationLevel: string
): EducationRouteType {
  if (
    programEducationLevel === "bachelor" ||
    programEducationLevel === "master"
  ) {
    return "academic_first";
  }

  if (
    programEducationLevel === "vocational" ||
    programEducationLevel === "certificate"
  ) {
    return "practical_first";
  }

  return "flexible_route";
}

function getDecisionRole({
  fitBand,
  preferenceState,
  locationState,
}: {
  fitBand: "strong" | "broader";
  preferenceState: EducationProgramPreferenceState;
  locationState: EducationProgramLocationState;
}): EducationDecisionRole {
  if (
    fitBand === "strong" &&
    locationState === "local" &&
    (preferenceState === "aligned" ||
      preferenceState === "open" ||
      preferenceState === "flexible")
  ) {
    return "local_priority";
  }

  if (
    fitBand === "strong" &&
    (preferenceState === "aligned" ||
      preferenceState === "open" ||
      preferenceState === "flexible")
  ) {
    return "main_route";
  }

  if (fitBand === "strong" && preferenceState === "broader") {
    return "stretch_route";
  }

  if (fitBand === "broader" && locationState === "local") {
    return "local_alternative";
  }

  return "broader_alternative";
}

export function getEducationRouteTypeLabel(
  value: EducationRouteType,
  locale: SupportedLocale
): string {
  return ROUTE_TYPE_LABELS[value][locale];
}

export function getEducationDecisionRoleLabel(
  value: EducationDecisionRole,
  locale: SupportedLocale
): string {
  return DECISION_ROLE_LABELS[value][locale];
}

export function getEducationProgramDecisionSupport({
  locale,
  fitBand = "broader",
  programEducationLevel,
  institutionMunicipalityCode,
  selectedMunicipalityCodes,
  childInterestIds,
  childDerivedStrengthIds,
  desiredIncomeBand,
  preferredWorkStyle,
  preferredEducationLevel,
  profession,
}: {
  locale: SupportedLocale;
  fitBand?: "strong" | "broader";
  programEducationLevel: string;
  institutionMunicipalityCode: string;
  selectedMunicipalityCodes: string[];
  childInterestIds: string[];
  childDerivedStrengthIds: string[];
  desiredIncomeBand: DesiredIncomeBand;
  preferredWorkStyle: PreferredWorkStyle;
  preferredEducationLevel: PreferredEducationLevel;
  profession: ProfessionForEducationReason;
}): EducationProgramDecisionSupport {
  const fit = getProfessionChildFit({
    profession: {
      interest_tags: profession.interest_tags,
      strength_tags: profession.strength_tags,
      development_focus_tags: profession.development_focus_tags,
      school_subject_tags: profession.school_subject_tags,
      avg_salary_nok: profession.avg_salary_nok ?? null,
      work_style: profession.work_style,
      education_level: profession.education_level,
    },
    childInterestIds,
    childDerivedStrengthIds,
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
  });

  const supportingInterestLabels = uniqueLimit(
    fit.matchedInterestIds.map((id) => getInterestLabel(id, locale)),
    4
  );

  const supportingStrengthLabels = uniqueLimit(
    fit.matchedStrengthIds.map((id) => getDerivedStrengthLabel(id, locale)),
    4
  );

  const schoolFocusLabels = uniqueLimit(
    fit.schoolSubjectIds.map((id) => getSchoolSubjectLabel(id, locale)),
    4
  );

  const developmentLabels = uniqueLimit(
    [
      ...fit.missingStrengthIds.map((id) => getDerivedStrengthLabel(id, locale)),
      ...fit.developmentFocusIds.map((id) => getDevelopmentFocusLabel(id, locale)),
    ],
    4
  );

  const preferenceState: EducationProgramPreferenceState =
    preferredEducationLevel === "open"
      ? "open"
      : preferredEducationLevel === "flexible"
        ? "flexible"
        : preferredEducationLevel === programEducationLevel
          ? "aligned"
          : "broader";

  const locationState: EducationProgramLocationState =
    selectedMunicipalityCodes.length > 0 &&
    selectedMunicipalityCodes.includes(institutionMunicipalityCode)
      ? "local"
      : "broader";

  const routeType = getEducationRouteType(programEducationLevel);
  const decisionRole = getDecisionRole({
    fitBand,
    preferenceState,
    locationState,
  });

  return {
    supportingInterestLabels,
    supportingStrengthLabels,
    schoolFocusLabels,
    developmentLabels,
    preferenceState,
    locationState,
    routeType,
    decisionRole,
    hasSignals:
      supportingInterestLabels.length > 0 || supportingStrengthLabels.length > 0,
  };
}