import { createClient } from "@/lib/supabase/server";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import {
  getDerivedStrengthLabel,
  getInterestLabel,
  getObservedTraitLabel,
} from "@/lib/planning/child-tag-catalog";
import { getChildSummary } from "@/lib/planning/get-child-summary";
import {
  getDevelopmentFocusLabel,
  getSchoolSubjectLabel,
} from "@/lib/planning/profession-tag-catalog";
import {
  getChildPlanningState,
  type DesiredIncomeBand,
  type PreferredEducationLevel,
  type PreferredWorkStyle,
} from "@/server/children/planning/get-child-planning-state";

type SchoolStage =
  | "barneskole"
  | "ungdomsskole"
  | "vgs"
  | "student"
  | "young_adult";

type RelocationWillingness = "no" | "maybe" | "yes";

type ChildRow = {
  id: string;
  display_name: string | null;
  birth_year: number | null;
  school_stage: SchoolStage | null;
  country_code: string | null;
  relocation_willingness: RelocationWillingness | null;
  interests: unknown;
  observed_traits: unknown;
  desired_income_band: DesiredIncomeBand | null;
  preferred_work_style: PreferredWorkStyle | null;
  preferred_education_level: PreferredEducationLevel | null;
  preferred_municipality_codes: unknown;
};

type ProfessionRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
  summary_i18n: Record<string, string> | null;
  avg_salary_nok: number | null;
  demand_level: string;
  education_level: string;
  work_style: string;
  key_skills: unknown;
  interest_tags: unknown;
  strength_tags: unknown;
  development_focus_tags: unknown;
  school_subject_tags: unknown;
  education_notes_i18n: Record<string, string> | null;
};

type SavedProfessionLinkRow = {
  profession_id: string;
};

type SavedStudyRouteRow = {
  id: string;
};

export type SummaryProfessionCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  matchScore: number;
  matchedPreferences: string[];
  matchedInterestLabels: string[];
  matchedStrengthLabels: string[];
  isSaved: boolean;
};

export type ChildSummaryPageData = {
  locale: string;
  supportedLocale: SupportedLocale;
  child: {
    id: string;
    displayName: string;
    age: number | null;
    schoolStageLabel: string;
    relocationLabel: string;
  };
  metrics: {
    signalCount: number;
    derivedStrengthCount: number;
    matchingProfessionCount: number;
    savedProfessionCount: number;
    savedStudyRouteCount: number;
  };
  hasProfileReady: boolean;
  hasPlanningFilters: boolean;
  interestLabels: string[];
  observedTraitLabels: string[];
  derivedStrengthLabels: string[];
  directionLabels: string[];
  developmentLabels: string[];
  schoolFocusLabels: string[];
  planningDirectionLabels: string[];
  topProfessions: SummaryProfessionCard[];
};

export type ChildSummaryPageResult =
  | { kind: "redirect"; href: string }
  | { kind: "error"; title: string; subtitle: string; message: string }
  | { kind: "ok"; data: ChildSummaryPageData };

const SCHOOL_STAGE_LABELS: Record<
  SchoolStage,
  Record<SupportedLocale, string>
> = {
  barneskole: {
    nb: "Barneskole",
    nn: "Barneskule",
    en: "Primary school",
  },
  ungdomsskole: {
    nb: "Ungdomsskole",
    nn: "Ungdomsskule",
    en: "Lower secondary school",
  },
  vgs: {
    nb: "Videregående skole",
    nn: "Vidaregåande skule",
    en: "Upper secondary school",
  },
  student: {
    nb: "Student",
    nn: "Student",
    en: "Student",
  },
  young_adult: {
    nb: "Ung voksen",
    nn: "Ung vaksen",
    en: "Young adult",
  },
};

const RELOCATION_LABELS: Record<
  RelocationWillingness,
  Record<SupportedLocale, string>
> = {
  no: {
    nb: "Nei",
    nn: "Nei",
    en: "No",
  },
  maybe: {
    nb: "Kanskje",
    nn: "Kanskje",
    en: "Maybe",
  },
  yes: {
    nb: "Ja",
    nn: "Ja",
    en: "Yes",
  },
};

const INCOME_BAND_LABELS: Record<
  DesiredIncomeBand,
  Record<SupportedLocale, string>
> = {
  open: {
    nb: "Åpen",
    nn: "Open",
    en: "Open",
  },
  up_to_600k: {
    nb: "Opptil 600k NOK",
    nn: "Opptil 600k NOK",
    en: "Up to 600k NOK",
  },
  "600k_to_800k": {
    nb: "600k til 800k NOK",
    nn: "600k til 800k NOK",
    en: "600k to 800k NOK",
  },
  "800k_plus": {
    nb: "800k+ NOK",
    nn: "800k+ NOK",
    en: "800k+ NOK",
  },
};

const WORK_STYLE_LABELS: Record<
  PreferredWorkStyle,
  Record<SupportedLocale, string>
> = {
  open: {
    nb: "Åpen",
    nn: "Open",
    en: "Open",
  },
  onsite: {
    nb: "På stedet",
    nn: "På staden",
    en: "On-site",
  },
  hybrid: {
    nb: "Hybrid",
    nn: "Hybrid",
    en: "Hybrid",
  },
  remote: {
    nb: "Fjernarbeid",
    nn: "Fjernarbeid",
    en: "Remote",
  },
  mixed: {
    nb: "Blandet",
    nn: "Blanda",
    en: "Mixed",
  },
};

const EDUCATION_LEVEL_LABELS: Record<
  PreferredEducationLevel,
  Record<SupportedLocale, string>
> = {
  open: {
    nb: "Åpen",
    nn: "Open",
    en: "Open",
  },
  upper_secondary: {
    nb: "Videregående",
    nn: "Vidaregåande",
    en: "Upper secondary",
  },
  apprenticeship: {
    nb: "Lærlingskap",
    nn: "Lærlingskap",
    en: "Apprenticeship",
  },
  certificate: {
    nb: "Sertifikat",
    nn: "Sertifikat",
    en: "Certificate",
  },
  vocational: {
    nb: "Yrkesfaglig",
    nn: "Yrkesfagleg",
    en: "Vocational",
  },
  vocational_college: {
    nb: "Fagskole",
    nn: "Fagskule",
    en: "Vocational college",
  },
  bachelor: {
    nb: "Bachelor",
    nn: "Bachelor",
    en: "Bachelor",
  },
  master: {
    nb: "Master",
    nn: "Master",
    en: "Master",
  },
  professional_degree: {
    nb: "Profesjonsgrad",
    nn: "Profesjonsgrad",
    en: "Professional degree",
  },
  flexible: {
    nb: "Fleksibel",
    nn: "Fleksibel",
    en: "Flexible",
  },
};

function getLocalizedLabel<T extends string>(
  labels: Record<T, Record<SupportedLocale, string>>,
  value: T,
  locale: SupportedLocale
): string {
  return labels[value][locale];
}

function formatDirectionLabel(term: string): string {
  return term
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSchoolStageLabel(
  value: SchoolStage | null,
  locale: SupportedLocale
): string {
  if (!value) {
    return "Not set";
  }

  return SCHOOL_STAGE_LABELS[value]?.[locale] ?? value;
}

function getRelocationLabel(
  value: RelocationWillingness | null,
  locale: SupportedLocale
): string {
  if (!value) {
    return "Not set";
  }

  return RELOCATION_LABELS[value]?.[locale] ?? value;
}

function buildPlanningDirectionLabels({
  desiredIncomeBand,
  preferredWorkStyle,
  preferredEducationLevel,
  locale,
}: {
  desiredIncomeBand: DesiredIncomeBand;
  preferredWorkStyle: PreferredWorkStyle;
  preferredEducationLevel: PreferredEducationLevel;
  locale: SupportedLocale;
}): string[] {
  const labels: string[] = [];

  if (desiredIncomeBand !== "open") {
    labels.push(
      `Income: ${getLocalizedLabel(
        INCOME_BAND_LABELS,
        desiredIncomeBand,
        locale
      )}`
    );
  }

  if (preferredWorkStyle !== "open") {
    labels.push(
      `Work style: ${getLocalizedLabel(
        WORK_STYLE_LABELS,
        preferredWorkStyle,
        locale
      )}`
    );
  }

  if (preferredEducationLevel !== "open") {
    labels.push(
      `Education: ${getLocalizedLabel(
        EDUCATION_LEVEL_LABELS,
        preferredEducationLevel,
        locale
      )}`
    );
  }

  return labels;
}

export async function getChildSummaryPageData({
  locale,
  childId,
}: {
  locale: string;
  childId: string;
}): Promise<ChildSummaryPageResult> {
  const supportedLocale = locale as SupportedLocale;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "redirect", href: `/${locale}/login` };
  }

  const { data: child, error } = await supabase
    .from("child_profiles")
    .select(
      "id, display_name, birth_year, school_stage, country_code, relocation_willingness, interests, observed_traits, desired_income_band, preferred_work_style, preferred_education_level, preferred_municipality_codes"
    )
    .eq("id", childId)
    .maybeSingle();

  if (error) {
    return {
      kind: "error",
      title: "Child summary",
      subtitle: "There was a problem loading this child profile.",
      message: error.message,
    };
  }

  if (!child) {
    return { kind: "redirect", href: `/${locale}/app/family` };
  }

  const childRow = child as ChildRow;
  const planningState = getChildPlanningState(childRow);

  const { data: savedLinks, error: savedLinksError } = await supabase
    .from("child_profession_interests")
    .select("profession_id")
    .eq("child_profile_id", childRow.id);

  if (savedLinksError) {
    return {
      kind: "error",
      title: "Child summary",
      subtitle: "There was a problem loading saved professions.",
      message: savedLinksError.message,
    };
  }

  const { data: savedRouteRows, error: savedRoutesError } = await supabase
    .from("study_routes")
    .select("id")
    .eq("child_id", childRow.id)
    .eq("status", "saved")
    .is("archived_at", null);

  if (savedRoutesError) {
    return {
      kind: "error",
      title: "Child summary",
      subtitle: "There was a problem loading saved study routes.",
      message: savedRoutesError.message,
    };
  }

  const { data: professions, error: professionsError } = await supabase
    .from("professions")
    .select(
      "id, slug, title_i18n, summary_i18n, avg_salary_nok, demand_level, education_level, work_style, key_skills, interest_tags, strength_tags, development_focus_tags, school_subject_tags, education_notes_i18n"
    )
    .eq("is_active", true);

  if (professionsError) {
    return {
      kind: "error",
      title: "Child summary",
      subtitle: "There was a problem loading professions.",
      message: professionsError.message,
    };
  }

  const typedProfessions = (professions ?? []) as ProfessionRow[];
  const savedProfessionIds = new Set(
    ((savedLinks ?? []) as SavedProfessionLinkRow[]).map(
      (item) => item.profession_id
    )
  );

  const childSummary = getChildSummary({
    interestIds: planningState.interestIds,
    derivedStrengthIds: planningState.derivedStrengthIds,
    professions: typedProfessions,
    desiredIncomeBand: planningState.desiredIncomeBand,
    preferredWorkStyle: planningState.preferredWorkStyle,
    preferredEducationLevel: planningState.preferredEducationLevel,
    savedProfessionCount: savedProfessionIds.size,
  });

  const topProfessions: SummaryProfessionCard[] = childSummary.topProfessions.map(
    (profession) => ({
      id: profession.id,
      slug: profession.slug,
      title: getLocalizedValue(profession.title_i18n, supportedLocale),
      summary: getLocalizedValue(profession.summary_i18n, supportedLocale),
      matchScore: profession.matchScore,
      matchedPreferences: profession.matchedPreferences,
      matchedInterestLabels: profession.matchedInterestIds.map((id) =>
        getInterestLabel(id, supportedLocale)
      ),
      matchedStrengthLabels: profession.matchedStrengthIds.map((id) =>
        getDerivedStrengthLabel(id, supportedLocale)
      ),
      isSaved: savedProfessionIds.has(profession.id),
    })
  );

  const currentYear = new Date().getFullYear();
  const age =
    typeof childRow.birth_year === "number"
      ? currentYear - childRow.birth_year
      : null;

  const planningDirectionLabels = buildPlanningDirectionLabels({
    desiredIncomeBand: planningState.desiredIncomeBand,
    preferredWorkStyle: planningState.preferredWorkStyle,
    preferredEducationLevel: planningState.preferredEducationLevel,
    locale: supportedLocale,
  });

  return {
    kind: "ok",
    data: {
      locale,
      supportedLocale,
      child: {
        id: childRow.id,
        displayName: childRow.display_name || "Child",
        age,
        schoolStageLabel: getSchoolStageLabel(
          childRow.school_stage,
          supportedLocale
        ),
        relocationLabel: getRelocationLabel(
          childRow.relocation_willingness,
          supportedLocale
        ),
      },
      metrics: {
        signalCount: planningState.currentSignalsCount,
        derivedStrengthCount: planningState.derivedStrengthIds.length,
        matchingProfessionCount: childSummary.matchingProfessionCount,
        savedProfessionCount: childSummary.savedProfessionCount,
        savedStudyRouteCount: ((savedRouteRows ?? []) as SavedStudyRouteRow[])
          .length,
      },
      hasProfileReady: planningState.currentSignalsCount > 0,
      hasPlanningFilters: planningState.hasPlanningFilters,
      interestLabels: planningState.interestIds.map((id) =>
        getInterestLabel(id, supportedLocale)
      ),
      observedTraitLabels: planningState.observedTraitIds.map((id) =>
        getObservedTraitLabel(id, supportedLocale)
      ),
      derivedStrengthLabels: planningState.derivedStrengthIds.map((id) =>
        getDerivedStrengthLabel(id, supportedLocale)
      ),
      directionLabels: childSummary.strongestDirectionTerms.map(
        formatDirectionLabel
      ),
      developmentLabels: [
        ...childSummary.priorityStrengthIds.map((id) =>
          getDerivedStrengthLabel(id, supportedLocale)
        ),
        ...childSummary.priorityDevelopmentFocusIds.map((id) =>
          getDevelopmentFocusLabel(id, supportedLocale)
        ),
      ],
      schoolFocusLabels: childSummary.usefulSchoolSubjectIds.map((id) =>
        getSchoolSubjectLabel(id, supportedLocale)
      ),
      planningDirectionLabels,
      topProfessions,
    },
  };
}