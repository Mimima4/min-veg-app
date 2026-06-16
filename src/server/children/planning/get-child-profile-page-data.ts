import { createClient } from "@/lib/supabase/server";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { LocalizedLabel } from "@/lib/i18n/localized-label";
import { resolveContentLocale, type ContentLocale } from "@/lib/i18n/locales";
import {
  getDerivedStrengthLabel,
  getInterestLabel,
} from "@/lib/planning/child-tag-catalog";
import { getNorwayCountyMunicipalityOptions } from "@/lib/planning/norway-admin";
import { getProfessionChildFit } from "@/lib/planning/get-profession-child-fit";
import { getSuggestedProfessions } from "@/lib/planning/get-suggested-professions";
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
  id: string;
  target_profession_id: string;
  current_variant_id: string | null;
  status: string;
  updated_at: string;
};

type SavedRouteSnapshotRow = {
  route_variant_id: string;
  selected_steps_payload: unknown;
  generated_at: string;
};

type RouteProfessionRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
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
  professionTitle: string;
  professionSlug: string;
  primaryInstitutionName: string | null;
  primaryInstitutionLocation: string | null;
};

function isRouteStepRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readInstitutionName(step: Record<string, unknown>): string | null {
  const direct = step.institution_name;
  if (typeof direct === "string" && direct.trim().length > 0) {
    return direct.trim();
  }

  if (step.type === "programme_selection" && Array.isArray(step.options)) {
    for (const option of step.options) {
      if (!isRouteStepRecord(option)) {
        continue;
      }
      const optionName = option.institution_name;
      if (typeof optionName === "string" && optionName.trim().length > 0) {
        return optionName.trim();
      }
    }
  }

  return null;
}

function getPrimaryInstitutionStep(steps: unknown): Record<string, unknown> | null {
  if (!Array.isArray(steps)) {
    return null;
  }

  const records = steps.filter(isRouteStepRecord);
  const preferredTypes = ["programme_selection", "progression_step", "outcome_step"];

  for (const stepType of preferredTypes) {
    const step = records.find((candidate) => {
      if (candidate.type !== stepType) {
        return false;
      }
      return readInstitutionName(candidate) !== null;
    });
    if (step) {
      return step;
    }
  }

  return null;
}

function getPrimaryInstitutionName(steps: unknown): string | null {
  const step = getPrimaryInstitutionStep(steps);
  return step ? readInstitutionName(step) : null;
}

function getPrimaryInstitutionLocation(steps: unknown): string | null {
  const step = getPrimaryInstitutionStep(steps);
  if (!step) {
    return null;
  }

  const municipality = step.institution_municipality;
  if (typeof municipality === "string" && municipality.trim().length > 0) {
    return municipality.trim();
  }

  const city = step.institution_city;
  if (typeof city === "string" && city.trim().length > 0) {
    return city.trim();
  }

  return null;
}

export type ChildProfilePageData = {
  locale: string;
  supportedLocale: ContentLocale;
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
  LocalizedLabel
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
  LocalizedLabel
> = {
  open: { nb: "Åpen", nn: "Open", en: "Open" },
  onsite: { nb: "På stedet", nn: "På staden", en: "On-site" },
  hybrid: { nb: "Hybrid", nn: "Hybrid", en: "Hybrid" },
  remote: { nb: "Fjernarbeid", nn: "Fjernarbeid", en: "Remote" },
  mixed: { nb: "Blandet", nn: "Blanda", en: "Mixed" },
};

const EDUCATION_LEVEL_LABELS: Record<
  PreferredEducationLevel,
  LocalizedLabel
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
  labels: Record<T, LocalizedLabel>,
  value: T,
  locale: ContentLocale
): string {
  return getLocalizedValue(labels[value], locale);
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
  locale: ContentLocale;
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
  const supportedLocale = resolveContentLocale(locale);
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
    .from("study_routes")
    .select("id, target_profession_id, current_variant_id, status, updated_at")
    .eq("child_id", childRow.id)
    .eq("status", "saved")
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (savedStudyRoutesError) {
    return {
      kind: "error",
      title: "Child profile",
      subtitle: "There was a problem loading saved study routes.",
      message: savedStudyRoutesError.message,
    };
  }

  const savedStudyRouteRows = (savedStudyRoutes ?? []) as SavedStudyRouteRow[];
  const savedVariantIds = Array.from(
    new Set(
      savedStudyRouteRows
        .map((item) => item.current_variant_id)
        .filter((value): value is string => Boolean(value))
    )
  );

  let savedRouteSnapshotByVariantId = new Map<string, SavedRouteSnapshotRow>();
  if (savedVariantIds.length > 0) {
    const { data: savedRouteSnapshots, error: savedRouteSnapshotsError } = await supabase
      .from("study_route_snapshots")
      .select("route_variant_id, selected_steps_payload, generated_at")
      .in("route_variant_id", savedVariantIds)
      .eq("is_current_snapshot", true);

    if (savedRouteSnapshotsError) {
      return {
        kind: "error",
        title: "Child profile",
        subtitle: "There was a problem loading saved study route snapshots.",
        message: savedRouteSnapshotsError.message,
      };
    }

    const latestSnapshotByVariantId = new Map<string, SavedRouteSnapshotRow>();
    for (const snapshot of (savedRouteSnapshots ?? []) as SavedRouteSnapshotRow[]) {
      const current = latestSnapshotByVariantId.get(snapshot.route_variant_id);
      if (
        !current ||
        new Date(snapshot.generated_at).getTime() >
          new Date(current.generated_at).getTime()
      ) {
        latestSnapshotByVariantId.set(snapshot.route_variant_id, snapshot);
      }
    }
    savedRouteSnapshotByVariantId = latestSnapshotByVariantId;
  }
  const savedRouteProfessionIds = savedStudyRouteRows.map(
    (item) => item.target_profession_id
  );

  const savedRouteProfessionsQuery =
    savedRouteProfessionIds.length > 0
      ? await supabase
          .from("professions")
          .select("id, slug, title_i18n")
          .in("id", savedRouteProfessionIds)
          .eq("is_active", true)
      : { data: [], error: null };

  if (savedRouteProfessionsQuery.error) {
    return {
      kind: "error",
      title: "Child profile",
      subtitle: "There was a problem loading saved study route professions.",
      message: savedRouteProfessionsQuery.error.message,
    };
  }

  const savedRouteProfessionMap = new Map(
    ((savedRouteProfessionsQuery.data ?? []) as RouteProfessionRow[]).map((item) => [
      item.id,
      item,
    ])
  );

  const savedStudyRouteCards: SavedStudyRouteCard[] = savedStudyRouteRows
    .map((savedRoute) => {
      const profession = savedRouteProfessionMap.get(savedRoute.target_profession_id);
      if (!profession) {
        return null;
      }

      const snapshot = savedRoute.current_variant_id
        ? savedRouteSnapshotByVariantId.get(savedRoute.current_variant_id)
        : undefined;
      return {
        savedRoute,
        professionTitle: getLocalizedValue(
          profession.title_i18n ?? {},
          supportedLocale
        ),
        professionSlug: profession.slug,
        primaryInstitutionName: getPrimaryInstitutionName(snapshot?.selected_steps_payload),
        primaryInstitutionLocation: getPrimaryInstitutionLocation(
          snapshot?.selected_steps_payload
        ),
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