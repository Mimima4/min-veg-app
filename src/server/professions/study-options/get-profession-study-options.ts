import { createClient } from "@/lib/supabase/server";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getNorwayCountyMunicipalityOptions } from "@/lib/planning/norway-admin";
import {
  getEducationProgramDecisionSupport,
  type EducationProgramDecisionSupport,
  type EducationProgramPreferenceState,
} from "@/lib/planning/get-education-program-fit";
import {
  getChildPlanningState,
  type DesiredIncomeBand,
  type PreferredEducationLevel,
  type PreferredWorkStyle,
} from "@/server/children/planning/get-child-planning-state";

type ProgramLinkRow = {
  program_slug: string;
  fit_band: "strong" | "broader";
  note: string | null;
};

type InstitutionRow = {
  id: string;
  slug: string;
  name: string;
  institution_type: string;
  website_url: string | null;
  county_code: string;
  municipality_code: string;
  municipality_name: string;
};

type ProgramDetailsRow = {
  slug: string;
  title: string;
  education_level: string;
  study_mode: string;
  duration_years: number | null;
  description: string | null;
  institution_id: string;
};

type ChildRow = {
  id: string;
  display_name: string | null;
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
  education_notes_i18n: Record<string, string> | null;
  interest_tags: unknown;
  strength_tags: unknown;
  development_focus_tags: unknown;
  school_subject_tags: unknown;
  work_style: string;
  education_level: string;
};

export type ProfessionStudyOptionRow = {
  program: ProgramDetailsRow;
  institution: InstitutionRow;
  fitBand: "strong" | "broader";
  note: string | null;
  decisionSupport: EducationProgramDecisionSupport;
};

export type ProfessionStudyOptionsPageData = {
  locale: string;
  supportedLocale: SupportedLocale;
  childId: string;
  professionSlug: string;
  childDisplayName: string;
  professionTitle: string;
  professionSummary: string;
  educationNotes: string;
  preferredEducationLevel: PreferredEducationLevel;
  selectedMunicipalityCodes: string[];
  selectedMunicipalityLabels: string[];
  hasCommuneFilter: boolean;
  previewSupport: EducationProgramDecisionSupport | null;
  filteredRows: ProfessionStudyOptionRow[];
  savedProgramSlugs: string[];
};

export type ProfessionStudyOptionsResult =
  | { kind: "redirect"; href: string }
  | { kind: "error"; title: string; subtitle: string; message: string }
  | { kind: "no_links" }
  | { kind: "ok"; data: ProfessionStudyOptionsPageData };

function getPreferenceSortPriority(state: EducationProgramPreferenceState) {
  switch (state) {
    case "aligned":
      return 0;
    case "flexible":
      return 1;
    case "open":
      return 2;
    case "broader":
    default:
      return 3;
  }
}

export async function getProfessionStudyOptions({
  locale,
  childId,
  professionSlug,
}: {
  locale: string;
  childId: string;
  professionSlug: string;
}): Promise<ProfessionStudyOptionsResult> {
  const supportedLocale = locale as SupportedLocale;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "redirect", href: `/${locale}/login` };
  }

  const [{ data: child }, { data: profession }] = await Promise.all([
    supabase
      .from("child_profiles")
      .select(
        "id, display_name, interests, observed_traits, desired_income_band, preferred_work_style, preferred_education_level, preferred_municipality_codes"
      )
      .eq("id", childId)
      .maybeSingle(),
    supabase
      .from("professions")
      .select(
        "id, slug, title_i18n, summary_i18n, education_notes_i18n, interest_tags, strength_tags, development_focus_tags, school_subject_tags, work_style, education_level"
      )
      .eq("slug", professionSlug)
      .maybeSingle(),
  ]);

  if (!child || !profession) {
    return {
      kind: "redirect",
      href: `/${locale}/app/children/${childId}/summary`,
    };
  }

  const childRow = child as ChildRow;
  const professionRow = profession as ProfessionRow;

  const planningState = getChildPlanningState(childRow);

  const municipalityOptions = await getNorwayCountyMunicipalityOptions().catch(
    () => []
  );

  const municipalityNameMap = new Map<string, string>(
    municipalityOptions.flatMap((county) =>
      county.municipalities.map((municipality) => [
        municipality.code,
        `${municipality.name} · ${county.name}`,
      ])
    )
  );

  const selectedMunicipalityLabels = planningState.preferredMunicipalityCodes.map(
    (code) => municipalityNameMap.get(code) ?? code
  );

  const { data: links, error: linksError } = await supabase
    .from("profession_program_links")
    .select("program_slug, fit_band, note")
    .eq("profession_slug", professionSlug);

  if (linksError) {
    return {
      kind: "error",
      title: "Study options",
      subtitle: "There was a problem loading education links.",
      message: linksError.message,
    };
  }

  const programSlugs = (links ?? []).map((item) => item.program_slug);

  if (programSlugs.length === 0) {
    return { kind: "no_links" };
  }

  const { data: programs, error: programsError } = await supabase
    .from("education_programs")
    .select(
      "slug, title, education_level, study_mode, duration_years, description, institution_id"
    )
    .in("slug", programSlugs)
    .eq("is_active", true);

  if (programsError) {
    return {
      kind: "error",
      title: "Study options",
      subtitle: "There was a problem loading programs.",
      message: programsError.message,
    };
  }

  const institutionIds = (programs ?? []).map((program) => program.institution_id);

  const { data: institutions, error: institutionsError } = await supabase
    .from("education_institutions")
    .select(
      "id, slug, name, institution_type, website_url, county_code, municipality_code, municipality_name"
    )
    .in("id", institutionIds)
    .eq("is_active", true);

  if (institutionsError) {
    return {
      kind: "error",
      title: "Study options",
      subtitle: "There was a problem loading institutions.",
      message: institutionsError.message,
    };
  }

  const { data: savedRouteRows } = await supabase
    .from("child_saved_education_routes")
    .select("program_slug")
    .eq("child_profile_id", childId)
    .in("program_slug", programSlugs);

  const savedProgramSlugs = (savedRouteRows ?? []).map((item) => item.program_slug);

  const linkMap = new Map<string, ProgramLinkRow>(
    (links ?? []).map((item) => [item.program_slug, item as ProgramLinkRow])
  );

  const institutionMap = new Map<string, InstitutionRow>(
    (institutions ?? []).map((item) => [item.id, item as InstitutionRow])
  );

  const decoratedRows = ((programs ?? []) as ProgramDetailsRow[])
    .map((program) => {
      const institution = institutionMap.get(program.institution_id);
      const link = linkMap.get(program.slug);

      if (!institution || !link) {
        return null;
      }

      return {
        program,
        institution,
        fitBand: link.fit_band,
        note: link.note,
        decisionSupport: getEducationProgramDecisionSupport({
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
            interest_tags: professionRow.interest_tags,
            strength_tags: professionRow.strength_tags,
            development_focus_tags: professionRow.development_focus_tags,
            school_subject_tags: professionRow.school_subject_tags,
            work_style: professionRow.work_style,
            education_level: professionRow.education_level,
          },
        }),
      } satisfies ProfessionStudyOptionRow;
    })
    .filter((item): item is ProfessionStudyOptionRow => Boolean(item))
    .sort((a, b) => {
      if (a.fitBand !== b.fitBand) {
        return a.fitBand === "strong" ? -1 : 1;
      }

      const preferencePriorityA = getPreferenceSortPriority(
        a.decisionSupport.preferenceState
      );
      const preferencePriorityB = getPreferenceSortPriority(
        b.decisionSupport.preferenceState
      );

      if (preferencePriorityA !== preferencePriorityB) {
        return preferencePriorityA - preferencePriorityB;
      }

      return a.program.title.localeCompare(b.program.title);
    });

  const filteredRows =
    planningState.preferredMunicipalityCodes.length === 0
      ? decoratedRows
      : decoratedRows.filter((row) =>
          planningState.preferredMunicipalityCodes.includes(
            row.institution.municipality_code
          )
        );

  const previewSupport =
    (filteredRows[0] ?? decoratedRows[0])?.decisionSupport ?? null;

  const professionTitle = professionRow.title_i18n
    ? getLocalizedValue(professionRow.title_i18n, supportedLocale)
    : professionRow.slug;

  const professionSummary = professionRow.summary_i18n
    ? getLocalizedValue(professionRow.summary_i18n, supportedLocale)
    : "";

  const educationNotes = professionRow.education_notes_i18n
    ? getLocalizedValue(professionRow.education_notes_i18n, supportedLocale)
    : "";

  return {
    kind: "ok",
    data: {
      locale,
      supportedLocale,
      childId,
      professionSlug,
      childDisplayName: childRow.display_name ?? "",
      professionTitle,
      professionSummary,
      educationNotes,
      preferredEducationLevel: planningState.preferredEducationLevel,
      selectedMunicipalityCodes: planningState.preferredMunicipalityCodes,
      selectedMunicipalityLabels,
      hasCommuneFilter: planningState.preferredMunicipalityCodes.length > 0,
      previewSupport,
      filteredRows,
      savedProgramSlugs,
    },
  };
}