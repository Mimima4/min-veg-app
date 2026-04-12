import { createClient } from "@/lib/supabase/server";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import {
  getDerivedStrengthLabel,
  getInterestLabel,
} from "@/lib/planning/child-tag-catalog";
import {
  getEducationProgramDecisionSupport,
  type EducationProgramDecisionSupport,
} from "@/lib/planning/get-education-program-fit";
import { getNorwayCountyMunicipalityOptions } from "@/lib/planning/norway-admin";
import { getProfessionChildFit } from "@/lib/planning/get-profession-child-fit";
import { getSuggestedProfessions } from "@/lib/planning/get-suggested-professions";
import {
  getDevelopmentFocusLabel,
  getSchoolSubjectLabel,
} from "@/lib/planning/profession-tag-catalog";
import {
  getAdjacentProfessionsForPrograms,
  type AdjacentProfessionCard,
} from "@/server/professions/adjacency/get-adjacent-professions-for-program";
import {
  getChildPlanningState,
  type DesiredIncomeBand,
  type PreferredEducationLevel,
  type PreferredWorkStyle,
} from "@/server/children/planning/get-child-planning-state";

type ChildRow = {
  id: string;
  display_name: string | null;
  birth_year: number | null;
  school_stage: string | null;
  country_code: string | null;
  relocation_willingness: "no" | "maybe" | "yes" | null;
  interests: unknown;
  observed_traits: unknown;
  strengths: unknown;
  desired_income_band: DesiredIncomeBand | null;
  preferred_work_style: PreferredWorkStyle | null;
  preferred_education_level: PreferredEducationLevel | null;
  preferred_municipality_codes: unknown;
};

type SavedStudyRouteRow = {
  profession_slug: string;
  program_slug: string;
  created_at: string;
};

type SavedStudyProgramRow = {
  slug: string;
  title: string;
  education_level: string;
  study_mode: string;
  duration_years: number | null;
  institution_id: string;
};

type SavedStudyInstitutionRow = {
  id: string;
  slug: string;
  name: string;
  website_url: string | null;
  municipality_name: string;
  municipality_code: string;
};

type SavedStudyProfessionRow = {
  id?: string;
  slug: string;
  title_i18n: Record<string, string> | null;
  summary_i18n?: Record<string, string> | null;
  avg_salary_nok: number | null;
  demand_level?: string | null;
  education_level: string;
  work_style: string;
  key_skills?: unknown;
  interest_tags: unknown;
  strength_tags: unknown;
  development_focus_tags: unknown;
  school_subject_tags: unknown;
  education_notes_i18n?: Record<string, string> | null;
};

type SavedStudyLinkRow = {
  profession_slug: string;
  program_slug: string;
  fit_band: "strong" | "broader";
};

export type SuggestedProfessionCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  matchScore: number;
  matchedPreferences: string[];
  matchedInterestLabels: string[];
  matchedStrengthLabels: string[];
};

export type SavedProfessionCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  matchedInterestLabels: string[];
  matchedStrengthLabels: string[];
  matchedPreferences: string[];
  keySkills: string[];
  nextDevelopmentLabels: string[];
  schoolSubjectLabels: string[];
  educationNotes: string;
};

export type SavedStudyRouteCard = {
  savedRoute: SavedStudyRouteRow;
  program: SavedStudyProgramRow;
  institution: SavedStudyInstitutionRow;
  professionTitle: string;
  decisionSupport: EducationProgramDecisionSupport;
  openDoorProfessions: AdjacentProfessionCard[];
};

export type ChildProfilePageData = {
  locale: string;
  supportedLocale: SupportedLocale;
  child: ChildRow;
  municipalityOptions: Awaited<ReturnType<typeof getNorwayCountyMunicipalityOptions>>;
  initialPreferredMunicipalityCodes: string[];
  interestIds: string[];
  observedTraitIds: string[];
  derivedStrengthIds: string[];
  desiredIncomeBand: DesiredIncomeBand;
  preferredWorkStyle: PreferredWorkStyle;
  preferredEducationLevel: PreferredEducationLevel;
  hasPlanningFilters: boolean;
  activePreferenceLabels: string[];
  suggestedProfessions: SuggestedProfessionCard[];
  savedProfessions: SavedProfessionCard[];
  savedStudyRouteCards: SavedStudyRouteCard[];
};

export type ChildProfilePageResult =
  | { kind: "redirect"; href: string }
  | { kind: "error"; title: string; subtitle: string; message: string }
  | { kind: "ok"; data: ChildProfilePageData };

const INCOME_BAND_LABELS: Record<
  DesiredIncomeBand,
  Record<SupportedLocale, string>
> = {
  open: { nb: "Åpen", nn: "Open", en: "Open" },
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
  open: { nb: "Åpen", nn: "Open", en: "Open" },
  onsite: { nb: "På stedet", nn: "På staden", en: "On-site" },
  hybrid: { nb: "Hybrid", nn: "Hybrid", en: "Hybrid" },
  remote: { nb: "Fjernarbeid", nn: "Fjernarbeid", en: "Remote" },
  mixed: { nb: "Blandet", nn: "Blanda", en: "Mixed" },
};

const EDUCATION_LEVEL_LABELS: Record<
  PreferredEducationLevel,
  Record<SupportedLocale, string>
> = {
  open: { nb: "Åpen", nn: "Open", en: "Open" },
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
  certificate: { nb: "Sertifikat", nn: "Sertifikat", en: "Certificate" },
  vocational: { nb: "Yrkesfaglig", nn: "Yrkesfagleg", en: "Vocational" },
  vocational_college: {
    nb: "Fagskole",
    nn: "Fagskule",
    en: "Vocational college",
  },
  bachelor: { nb: "Bachelor", nn: "Bachelor", en: "Bachelor" },
  master: { nb: "Master", nn: "Master", en: "Master" },
  professional_degree: {
    nb: "Profesjonsgrad",
    nn: "Profesjonsgrad",
    en: "Professional degree",
  },
  flexible: { nb: "Fleksibel", nn: "Fleksibel", en: "Flexible" },
};

function getLocalizedLabel<T extends string>(
  labels: Record<T, Record<SupportedLocale, string>>,
  value: T,
  locale: SupportedLocale
): string {
  return labels[value][locale];
}

function buildActivePreferenceLabels({
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

export async function getChildProfilePageData({
  locale,
  childId,
}: {
  locale: string;
  childId: string;
}): Promise<ChildProfilePageResult> {
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
      "id, display_name, birth_year, school_stage, country_code, relocation_willingness, interests, observed_traits, strengths, desired_income_band, preferred_work_style, preferred_education_level, preferred_municipality_codes"
    )
    .eq("id", childId)
    .maybeSingle();

  if (error) {
    return {
      kind: "error",
      title: "Child profile",
      subtitle: "There was a problem loading this child profile.",
      message: error.message,
    };
  }

  if (!child) {
    return { kind: "redirect", href: `/${locale}/app/family` };
  }

  const childRow = child as ChildRow;
  const municipalityOptions = await getNorwayCountyMunicipalityOptions().catch(
    () => []
  );

  const planningState = getChildPlanningState(childRow);

  const { data: savedLinks } = await supabase
    .from("child_profession_interests")
    .select("profession_id, created_at")
    .eq("child_profile_id", childRow.id)
    .order("created_at", { ascending: true });

  const professionIds =
    savedLinks?.map((item) => item.profession_id).filter(Boolean) ?? [];

  const professionQuery =
    professionIds.length > 0
      ? await supabase
          .from("professions")
          .select(
            "id, slug, title_i18n, summary_i18n, avg_salary_nok, demand_level, education_level, work_style, key_skills, interest_tags, strength_tags, development_focus_tags, school_subject_tags, education_notes_i18n"
          )
          .in("id", professionIds)
      : { data: [], error: null };

  if (professionQuery.error) {
    return {
      kind: "error",
      title: "Child profile",
      subtitle: "There was a problem loading saved professions.",
      message: professionQuery.error.message,
    };
  }

  const professionMap = new Map(
    (professionQuery.data ?? []).map((profession) => [profession.id, profession])
  );

  const savedProfessionsRaw =
    savedLinks
      ?.map((link) => professionMap.get(link.profession_id))
      .filter(Boolean) ?? [];

  const savedProfessionIds = new Set(
    savedProfessionsRaw.map((profession) => profession!.id)
  );

  const { data: allProfessions, error: allProfessionsError } = await supabase
    .from("professions")
    .select(
      "id, slug, title_i18n, summary_i18n, avg_salary_nok, demand_level, education_level, work_style, key_skills, interest_tags, strength_tags, development_focus_tags, school_subject_tags, education_notes_i18n"
    )
    .eq("is_active", true);

  if (allProfessionsError) {
    return {
      kind: "error",
      title: "Child profile",
      subtitle: "There was a problem loading suggested professions.",
      message: allProfessionsError.message,
    };
  }

  const suggestedProfessions = getSuggestedProfessions({
    interestIds: planningState.interestIds,
    derivedStrengthIds: planningState.derivedStrengthIds,
    professions: (allProfessions ?? []).filter(
      (profession) => !savedProfessionIds.has(profession.id)
    ),
    desiredIncomeBand: planningState.desiredIncomeBand,
    preferredWorkStyle: planningState.preferredWorkStyle,
    preferredEducationLevel: planningState.preferredEducationLevel,
  })
    .slice(0, 3)
    .map((profession) => ({
      id: profession.id,
      slug: profession.slug,
      title: getLocalizedValue(
        profession.title_i18n as Record<string, string>,
        supportedLocale
      ),
      summary: getLocalizedValue(
        profession.summary_i18n as Record<string, string>,
        supportedLocale
      ),
      matchScore: profession.matchScore,
      matchedPreferences: profession.matchedPreferences,
      matchedInterestLabels: profession.matchedInterestIds.map((id) =>
        getInterestLabel(id, supportedLocale)
      ),
      matchedStrengthLabels: profession.matchedStrengthIds.map((id) =>
        getDerivedStrengthLabel(id, supportedLocale)
      ),
    }));

  const savedProfessions: SavedProfessionCard[] = savedProfessionsRaw.map(
    (profession) => {
      const fit = getProfessionChildFit({
        profession: {
          interest_tags: profession!.interest_tags,
          strength_tags: profession!.strength_tags,
          development_focus_tags: profession!.development_focus_tags,
          school_subject_tags: profession!.school_subject_tags,
          avg_salary_nok: profession!.avg_salary_nok,
          work_style: profession!.work_style,
          education_level: profession!.education_level,
        },
        childInterestIds: planningState.interestIds,
        childDerivedStrengthIds: planningState.derivedStrengthIds,
        desiredIncomeBand: planningState.desiredIncomeBand,
        preferredWorkStyle: planningState.preferredWorkStyle,
        preferredEducationLevel: planningState.preferredEducationLevel,
      });

      const keySkills = Array.isArray(profession!.key_skills)
        ? profession!.key_skills.filter(
            (item): item is string => typeof item === "string"
          )
        : [];

      return {
        id: profession!.id,
        slug: profession!.slug,
        title: getLocalizedValue(
          profession!.title_i18n as Record<string, string>,
          supportedLocale
        ),
        summary: getLocalizedValue(
          profession!.summary_i18n as Record<string, string>,
          supportedLocale
        ),
        matchedInterestLabels: fit.matchedInterestIds.map((id) =>
          getInterestLabel(id, supportedLocale)
        ),
        matchedStrengthLabels: fit.matchedStrengthIds.map((id) =>
          getDerivedStrengthLabel(id, supportedLocale)
        ),
        matchedPreferences: fit.preferenceMatches,
        keySkills,
        nextDevelopmentLabels: [
          ...fit.missingStrengthIds.map((id) =>
            getDerivedStrengthLabel(id, supportedLocale)
          ),
          ...fit.developmentFocusIds.map((id) =>
            getDevelopmentFocusLabel(id, supportedLocale)
          ),
        ],
        schoolSubjectLabels: fit.schoolSubjectIds.map((id) =>
          getSchoolSubjectLabel(id, supportedLocale)
        ),
        educationNotes: getLocalizedValue(
          profession!.education_notes_i18n as Record<string, string>,
          supportedLocale
        ),
      };
    }
  );

  const { data: savedStudyRoutes, error: savedStudyRoutesError } = await supabase
    .from("child_saved_education_routes")
    .select("profession_slug, program_slug, created_at")
    .eq("child_profile_id", childRow.id)
    .order("created_at", { ascending: false });

  if (savedStudyRoutesError) {
    return {
      kind: "error",
      title: "Child profile",
      subtitle: "There was a problem loading saved study routes.",
      message: savedStudyRoutesError.message,
    };
  }

  const savedStudyRouteRows = (savedStudyRoutes ?? []) as SavedStudyRouteRow[];
  const savedStudyProgramSlugs = savedStudyRouteRows.map((item) => item.program_slug);
  const savedStudyProfessionSlugs = savedStudyRouteRows.map(
    (item) => item.profession_slug
  );

  const savedStudyProgramsQuery =
    savedStudyProgramSlugs.length > 0
      ? await supabase
          .from("education_programs")
          .select(
            "slug, title, education_level, study_mode, duration_years, institution_id"
          )
          .in("slug", savedStudyProgramSlugs)
          .eq("is_active", true)
      : { data: [], error: null };

  if (savedStudyProgramsQuery.error) {
    return {
      kind: "error",
      title: "Child profile",
      subtitle: "There was a problem loading saved study route programs.",
      message: savedStudyProgramsQuery.error.message,
    };
  }

  const savedStudyPrograms = (savedStudyProgramsQuery.data ??
    []) as SavedStudyProgramRow[];

  const savedStudyInstitutionIds = savedStudyPrograms.map(
    (item) => item.institution_id
  );

  const savedStudyInstitutionsQuery =
    savedStudyInstitutionIds.length > 0
      ? await supabase
          .from("education_institutions")
          .select("id, slug, name, website_url, municipality_name, municipality_code")
          .in("id", savedStudyInstitutionIds)
          .eq("is_active", true)
      : { data: [], error: null };

  if (savedStudyInstitutionsQuery.error) {
    return {
      kind: "error",
      title: "Child profile",
      subtitle: "There was a problem loading saved study route institutions.",
      message: savedStudyInstitutionsQuery.error.message,
    };
  }

  const savedStudyProfessionsQuery =
    savedStudyProfessionSlugs.length > 0
      ? await supabase
          .from("professions")
          .select(
            "slug, title_i18n, interest_tags, strength_tags, development_focus_tags, school_subject_tags, work_style, education_level, avg_salary_nok"
          )
          .in("slug", savedStudyProfessionSlugs)
      : { data: [], error: null };

  if (savedStudyProfessionsQuery.error) {
    return {
      kind: "error",
      title: "Child profile",
      subtitle: "There was a problem loading saved study route professions.",
      message: savedStudyProfessionsQuery.error.message,
    };
  }

  const savedStudyLinksQuery =
    savedStudyProgramSlugs.length > 0 && savedStudyProfessionSlugs.length > 0
      ? await supabase
          .from("profession_program_links")
          .select("profession_slug, program_slug, fit_band")
          .in("program_slug", savedStudyProgramSlugs)
          .in("profession_slug", savedStudyProfessionSlugs)
      : { data: [], error: null };

  if (savedStudyLinksQuery.error) {
    return {
      kind: "error",
      title: "Child profile",
      subtitle: "There was a problem loading saved study route links.",
      message: savedStudyLinksQuery.error.message,
    };
  }

  const savedProgramMap = new Map(
    savedStudyPrograms.map((item) => [item.slug, item])
  );

  const savedInstitutionMap = new Map(
    ((savedStudyInstitutionsQuery.data ?? []) as SavedStudyInstitutionRow[]).map(
      (item) => [item.id, item]
    )
  );

  const savedProfessionMapBySlug = new Map(
    ((savedStudyProfessionsQuery.data ?? []) as SavedStudyProfessionRow[]).map(
      (item) => [item.slug, item]
    )
  );

  const savedLinkMap = new Map(
    ((savedStudyLinksQuery.data ?? []) as SavedStudyLinkRow[]).map((item) => [
      `${item.profession_slug}::${item.program_slug}`,
      item,
    ])
  );

  const adjacencyResult = await getAdjacentProfessionsForPrograms({
    locale,
    planningState,
    programCurrentProfessionPairs: savedStudyRouteRows.map((item) => ({
      programSlug: item.program_slug,
      currentProfessionSlug: item.profession_slug,
    })),
  });

  if (adjacencyResult.kind === "error") {
    return {
      kind: "error",
      title: "Child profile",
      subtitle: "There was a problem loading adjacent profession paths.",
      message: adjacencyResult.message,
    };
  }

  const savedStudyRouteCards: SavedStudyRouteCard[] = savedStudyRouteRows
    .map((savedRoute) => {
      const program = savedProgramMap.get(savedRoute.program_slug);
      const profession = savedProfessionMapBySlug.get(savedRoute.profession_slug);
      const institution = program
        ? savedInstitutionMap.get(program.institution_id)
        : null;
      const link = savedLinkMap.get(
        `${savedRoute.profession_slug}::${savedRoute.program_slug}`
      );

      if (!program || !profession || !institution || !link) {
        return null;
      }

      const decisionSupport = getEducationProgramDecisionSupport({
        locale: supportedLocale,
        fitBand: link.fit_band,
        programEducationLevel: program.education_level,
        institutionMunicipalityCode: institution.municipality_code,
        selectedMunicipalityCodes: planningState.preferredMunicipalityCodes,
        childInterestIds: planningState.interestIds,
        childDerivedStrengthIds: planningState.derivedStrengthIds,
        desiredIncomeBand: planningState.desiredIncomeBand,
        preferredWorkStyle: planningState.preferredWorkStyle,
        preferredEducationLevel: planningState.preferredEducationLevel,
        profession: {
          interest_tags: profession.interest_tags,
          strength_tags: profession.strength_tags,
          development_focus_tags: profession.development_focus_tags,
          school_subject_tags: profession.school_subject_tags,
          work_style: profession.work_style,
          education_level: profession.education_level,
          avg_salary_nok: profession.avg_salary_nok,
        },
      });

      return {
        savedRoute,
        program,
        institution,
        professionTitle: getLocalizedValue(
          profession.title_i18n ?? {},
          supportedLocale
        ),
        decisionSupport,
        openDoorProfessions:
          adjacencyResult.byProgramSlug.get(savedRoute.program_slug) ?? [],
      };
    })
    .filter((item): item is SavedStudyRouteCard => Boolean(item));

  const activePreferenceLabels = buildActivePreferenceLabels({
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
      child: childRow,
      municipalityOptions,
      initialPreferredMunicipalityCodes: planningState.preferredMunicipalityCodes,
      interestIds: planningState.interestIds,
      observedTraitIds: planningState.observedTraitIds,
      derivedStrengthIds: planningState.derivedStrengthIds,
      desiredIncomeBand: planningState.desiredIncomeBand,
      preferredWorkStyle: planningState.preferredWorkStyle,
      preferredEducationLevel: planningState.preferredEducationLevel,
      hasPlanningFilters: planningState.hasPlanningFilters,
      activePreferenceLabels,
      suggestedProfessions,
      savedProfessions,
      savedStudyRouteCards,
    },
  };
}