import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import CompareProfessionButton from "@/components/planning/compare-profession-button";
import CompareProfessionsButton from "@/components/planning/compare-professions-button";
import CollapsibleSection from "@/components/planning/collapsible-section";
import RouteOpenDoorsPanel from "@/components/planning/route-open-doors-panel";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import { getNorwayCountyMunicipalityOptions } from "@/lib/planning/norway-admin";
import {
  coerceInterestIds,
  coerceObservedTraitIds,
  getDerivedStrengthIds,
  getDerivedStrengthLabel,
  getInterestLabel,
} from "@/lib/planning/child-tag-catalog";
import {
  getEducationProgramDecisionSupport,
  getEducationDecisionRoleLabel,
  getEducationRouteTypeLabel,
  type EducationDecisionRole,
} from "@/lib/planning/get-education-program-fit";
import { getProfessionChildFit } from "@/lib/planning/get-profession-child-fit";
import { getSuggestedProfessions } from "@/lib/planning/get-suggested-professions";
import {
  getDevelopmentFocusLabel,
  getSchoolSubjectLabel,
} from "@/lib/planning/profession-tag-catalog";
import EditChildForm from "./edit-child-form";
import RemoveSavedProfessionButton from "./remove-saved-profession-button";
import RemoveSavedStudyRouteButton from "./remove-saved-study-route-button";

type DesiredIncomeBand =
  | "open"
  | "up_to_600k"
  | "600k_to_800k"
  | "800k_plus";

type PreferredWorkStyle =
  | "open"
  | "onsite"
  | "hybrid"
  | "remote"
  | "mixed";

type PreferredEducationLevel =
  | "open"
  | "certificate"
  | "vocational"
  | "bachelor"
  | "master"
  | "flexible";

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
  slug: string;
  title_i18n: Record<string, string> | null;
  interest_tags: unknown;
  strength_tags: unknown;
  development_focus_tags: unknown;
  school_subject_tags: unknown;
  work_style: string;
  education_level: string;
  avg_salary_nok: number | null;
};

type SavedStudyLinkRow = {
  profession_slug: string;
  program_slug: string;
  fit_band: "strong" | "broader";
};

type AdjacentProfessionCard = {
  slug: string;
  title: string;
  fitScore: number;
  matchedInterestLabels: string[];
  matchedStrengthLabels: string[];
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

function TagList({
  title,
  items,
  highlight = false,
}: {
  title: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div className="mt-4">
      <div className="text-sm font-medium text-stone-600">{title}</div>

      {items.length === 0 ? (
        <p className="mt-1 text-sm text-stone-500">No items yet.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={`${title}-${item}`}
              className={
                highlight
                  ? "inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                  : "inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800"
              }
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function getStudyModeLabel(value: string, locale: SupportedLocale) {
  const labels = {
    full_time: { nb: "Heltid", nn: "Heiltid", en: "Full-time" },
    part_time: { nb: "Deltid", nn: "Deltid", en: "Part-time" },
    flexible: { nb: "Fleksibel", nn: "Fleksibel", en: "Flexible" },
  } as const;

  if (value in labels) {
    return labels[value as keyof typeof labels][locale];
  }

  return value;
}

function getDurationLabel(
  value: number | null,
  locale: SupportedLocale
): string | null {
  if (!value) {
    return null;
  }

  if (locale === "en") {
    return value === 1 ? "1 year" : `${value} years`;
  }

  return value === 1 ? "1 år" : `${value} år`;
}

function getDecisionRoleTone(role: EducationDecisionRole): string {
  switch (role) {
    case "local_priority":
      return "inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm text-emerald-800";
    case "main_route":
      return "inline-flex items-center rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-sm text-blue-800";
    case "stretch_route":
      return "inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm text-amber-800";
    case "local_alternative":
      return "inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800";
    case "broader_alternative":
    default:
      return "inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800";
  }
}

function getDecisionRoleExplanation(role: EducationDecisionRole): string {
  switch (role) {
    case "local_priority":
      return "This is the clearest nearby route right now and should be treated as a strong primary option.";
    case "main_route":
      return "This is one of the strongest current routes for the child profile and is worth keeping near the top of the shortlist.";
    case "stretch_route":
      return "This route is still meaningful, but it sits wider than the current education preference and should be read more carefully.";
    case "local_alternative":
      return "This is a realistic nearby backup option. It is useful to keep visible, but it is not the clearest primary choice.";
    case "broader_alternative":
    default:
      return "This is a broader comparison route. Keep it visible, but treat it as a secondary option for now.";
  }
}

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ locale: string; childId: string }>;
}) {
  const { locale, childId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: child, error } = await supabase
    .from("child_profiles")
    .select(
      "id, display_name, birth_year, school_stage, country_code, relocation_willingness, interests, observed_traits, strengths, desired_income_band, preferred_work_style, preferred_education_level, preferred_municipality_codes"
    )
    .eq("id", childId)
    .maybeSingle();

  if (error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Child profile"
        subtitle="There was a problem loading this child profile."
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error.message}
        </div>
      </LocalePageShell>
    );
  }

  if (!child) {
    redirect(`/${locale}/app/family`);
  }

  const municipalityOptions = await getNorwayCountyMunicipalityOptions().catch(
    () => []
  );

  const initialPreferredMunicipalityCodes = Array.isArray(
    child.preferred_municipality_codes
  )
    ? child.preferred_municipality_codes.filter(
        (item): item is string => typeof item === "string"
      )
    : [];

  const rawInterests = Array.isArray(child.interests)
    ? child.interests.filter((item): item is string => typeof item === "string")
    : [];

  const rawObservedTraits = Array.isArray(child.observed_traits)
    ? child.observed_traits.filter(
        (item): item is string => typeof item === "string"
      )
    : [];

  const interestIds = coerceInterestIds(rawInterests);
  const observedTraitIds = coerceObservedTraitIds(rawObservedTraits);
  const derivedStrengthIds = getDerivedStrengthIds({
    interestIds,
    observedTraitIds,
  });

  const desiredIncomeBand =
    (child.desired_income_band as DesiredIncomeBand) ?? "open";

  const preferredWorkStyle =
    (child.preferred_work_style as PreferredWorkStyle) ?? "open";

  const preferredEducationLevel =
    (child.preferred_education_level as PreferredEducationLevel) ?? "open";

  const { data: savedLinks } = await supabase
    .from("child_profession_interests")
    .select("profession_id, created_at")
    .eq("child_profile_id", child.id)
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

  const professionMap = new Map(
    (professionQuery.data ?? []).map((profession) => [profession.id, profession])
  );

  const savedProfessions =
    savedLinks
      ?.map((link) => professionMap.get(link.profession_id))
      .filter(Boolean) ?? [];

  const savedProfessionIds = new Set(
    savedProfessions.map((profession) => profession!.id)
  );

  const { data: allProfessions } = await supabase
    .from("professions")
    .select(
      "id, slug, title_i18n, summary_i18n, avg_salary_nok, demand_level, education_level, work_style, key_skills, interest_tags, strength_tags"
    )
    .eq("is_active", true);

  const suggestedProfessions = getSuggestedProfessions({
    interestIds,
    derivedStrengthIds,
    professions: (allProfessions ?? []).filter(
      (profession) => !savedProfessionIds.has(profession.id)
    ),
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
  }).slice(0, 3);

  const { data: savedStudyRoutes, error: savedStudyRoutesError } = await supabase
    .from("child_saved_education_routes")
    .select("profession_slug, program_slug, created_at")
    .eq("child_profile_id", child.id)
    .order("created_at", { ascending: false });

  if (savedStudyRoutesError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Child profile"
        subtitle="There was a problem loading saved study routes."
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {savedStudyRoutesError.message}
        </div>
      </LocalePageShell>
    );
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
    return (
      <LocalePageShell
        locale={locale}
        title="Child profile"
        subtitle="There was a problem loading saved study route programs."
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {savedStudyProgramsQuery.error.message}
        </div>
      </LocalePageShell>
    );
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
    return (
      <LocalePageShell
        locale={locale}
        title="Child profile"
        subtitle="There was a problem loading saved study route institutions."
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {savedStudyInstitutionsQuery.error.message}
        </div>
      </LocalePageShell>
    );
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
    return (
      <LocalePageShell
        locale={locale}
        title="Child profile"
        subtitle="There was a problem loading saved study route professions."
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {savedStudyProfessionsQuery.error.message}
        </div>
      </LocalePageShell>
    );
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
    return (
      <LocalePageShell
        locale={locale}
        title="Child profile"
        subtitle="There was a problem loading saved study route links."
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {savedStudyLinksQuery.error.message}
        </div>
      </LocalePageShell>
    );
  }

  const adjacentLinksQuery =
    savedStudyProgramSlugs.length > 0
      ? await supabase
          .from("profession_program_links")
          .select("profession_slug, program_slug, fit_band")
          .in("program_slug", savedStudyProgramSlugs)
      : { data: [], error: null };

  if (adjacentLinksQuery.error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Child profile"
        subtitle="There was a problem loading adjacent profession paths."
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {adjacentLinksQuery.error.message}
        </div>
      </LocalePageShell>
    );
  }

  const adjacentProfessionSlugs = Array.from(
    new Set(
      ((adjacentLinksQuery.data ?? []) as SavedStudyLinkRow[]).map(
        (item) => item.profession_slug
      )
    )
  );

  const adjacentProfessionsQuery =
    adjacentProfessionSlugs.length > 0
      ? await supabase
          .from("professions")
          .select(
            "slug, title_i18n, interest_tags, strength_tags, development_focus_tags, school_subject_tags, work_style, education_level, avg_salary_nok"
          )
          .in("slug", adjacentProfessionSlugs)
      : { data: [], error: null };

  if (adjacentProfessionsQuery.error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Child profile"
        subtitle="There was a problem loading adjacent professions."
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {adjacentProfessionsQuery.error.message}
        </div>
      </LocalePageShell>
    );
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

  const adjacentProfessionMap = new Map(
    ((adjacentProfessionsQuery.data ?? []) as SavedStudyProfessionRow[]).map(
      (item) => [item.slug, item]
    )
  );

  const adjacentLinksByProgram = new Map<string, SavedStudyLinkRow[]>();

  for (const link of (adjacentLinksQuery.data ?? []) as SavedStudyLinkRow[]) {
    const current = adjacentLinksByProgram.get(link.program_slug) ?? [];
    current.push(link);
    adjacentLinksByProgram.set(link.program_slug, current);
  }

  const savedStudyRouteCards = savedStudyRouteRows
    .map((savedRoute) => {
      const program = savedProgramMap.get(savedRoute.program_slug);
      const profession = savedProfessionMapBySlug.get(savedRoute.profession_slug);

      if (!program || !profession) {
        return null;
      }

      const institution = savedInstitutionMap.get(program.institution_id);
      const link = savedLinkMap.get(
        `${savedRoute.profession_slug}::${savedRoute.program_slug}`
      );

      if (!institution || !link) {
        return null;
      }

      const decisionSupport = getEducationProgramDecisionSupport({
        locale: locale as SupportedLocale,
        fitBand: link.fit_band,
        programEducationLevel: program.education_level,
        institutionMunicipalityCode: institution.municipality_code,
        selectedMunicipalityCodes: initialPreferredMunicipalityCodes,
        childInterestIds: interestIds,
        childDerivedStrengthIds: derivedStrengthIds,
        desiredIncomeBand,
        preferredWorkStyle,
        preferredEducationLevel,
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

      const openDoorProfessions: AdjacentProfessionCard[] = (
        adjacentLinksByProgram.get(savedRoute.program_slug) ?? []
      )
        .filter((item) => item.profession_slug !== savedRoute.profession_slug)
        .map((item) => {
          const adjacentProfession = adjacentProfessionMap.get(item.profession_slug);

          if (!adjacentProfession) {
            return null;
          }

          const fit = getProfessionChildFit({
            profession: {
              interest_tags: adjacentProfession.interest_tags,
              strength_tags: adjacentProfession.strength_tags,
              development_focus_tags:
                adjacentProfession.development_focus_tags,
              school_subject_tags: adjacentProfession.school_subject_tags,
              avg_salary_nok: adjacentProfession.avg_salary_nok,
              work_style: adjacentProfession.work_style,
              education_level: adjacentProfession.education_level,
            },
            childInterestIds: interestIds,
            childDerivedStrengthIds: derivedStrengthIds,
            desiredIncomeBand,
            preferredWorkStyle,
            preferredEducationLevel,
          });

          const matchedInterestLabels = fit.matchedInterestIds.map((id) =>
            getInterestLabel(id, supportedLocale)
          );

          const matchedStrengthLabels = fit.matchedStrengthIds.map((id) =>
            getDerivedStrengthLabel(id, supportedLocale)
          );

          const fitScore =
            fit.matchedInterestIds.length * 2 +
            fit.matchedStrengthIds.length * 3 +
            fit.preferenceMatches.length;

          return {
            slug: adjacentProfession.slug,
            title: getLocalizedValue(
              adjacentProfession.title_i18n ?? {},
              supportedLocale
            ),
            fitScore,
            matchedInterestLabels,
            matchedStrengthLabels,
          };
        })
        .filter((item): item is AdjacentProfessionCard => Boolean(item))
        .sort((a, b) => {
          if (b.fitScore !== a.fitScore) {
            return b.fitScore - a.fitScore;
          }

          return a.title.localeCompare(b.title);
        })
        .slice(0, 3);

      return {
        savedRoute,
        program,
        institution,
        profession,
        decisionSupport,
        openDoorProfessions,
      };
    })
    .filter(
      (
        item
      ): item is {
        savedRoute: SavedStudyRouteRow;
        program: SavedStudyProgramRow;
        institution: SavedStudyInstitutionRow;
        profession: SavedStudyProfessionRow;
        decisionSupport: ReturnType<typeof getEducationProgramDecisionSupport>;
        openDoorProfessions: AdjacentProfessionCard[];
      } => Boolean(item)
    );

  const supportedLocale = locale as SupportedLocale;
  const hasPlanningFilters =
    desiredIncomeBand !== "open" ||
    preferredWorkStyle !== "open" ||
    preferredEducationLevel !== "open";

  const activePreferenceLabels = buildActivePreferenceLabels({
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
    locale: supportedLocale,
  });

  return (
    <LocalePageShell
      locale={locale}
      title={child.display_name || "Child profile"}
      subtitle="Review and update the child profile, development signals, planning preferences, and saved study routes."
      backHref={`/${locale}/app/family`}
      backLabel="Back family overview"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="space-y-6">
        <div id="current-signals" className="scroll-mt-24">
          <EditChildForm
            locale={locale}
            childId={child.id}
            initialDisplayName={child.display_name ?? ""}
            initialBirthYear={child.birth_year}
            initialSchoolStage={
              child.school_stage as
                | "barneskole"
                | "ungdomsskole"
                | "vgs"
                | "student"
                | "young_adult"
            }
            initialCountryCode={child.country_code}
            initialRelocationWillingness={
              child.relocation_willingness as "no" | "maybe" | "yes" | null
            }
            initialInterestIds={interestIds}
            initialObservedTraitIds={observedTraitIds}
            initialDesiredIncomeBand={desiredIncomeBand}
            initialPreferredWorkStyle={preferredWorkStyle}
            initialPreferredEducationLevel={preferredEducationLevel}
            initialPreferredMunicipalityCodes={initialPreferredMunicipalityCodes}
            municipalityOptions={municipalityOptions}
          />
        </div>

        <CollapsibleSection
          id="suggested-professions"
          title="Suggested professions"
          count={suggestedProfessions.length}
        >
          <p className="text-sm leading-relaxed text-stone-600">
            These are the strongest current matches for this child profile.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/app/children/${child.id}/matches`}
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
            >
              Explore professions
            </Link>

            <CompareProfessionsButton locale={locale} childId={child.id} />
          </div>

          {interestIds.length === 0 && observedTraitIds.length === 0 ? (
            <p className="mt-5 text-sm text-stone-600">
              Select interests and observed traits to get profession suggestions.
            </p>
          ) : suggestedProfessions.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="text-base font-semibold text-stone-900">
                No professions are visible with the current planning filters
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                The child profile still has useful signals, but the current
                planning direction is filtering out all profession matches. Try
                widening the active filters below.
              </p>

              {hasPlanningFilters && activePreferenceLabels.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {activePreferenceLabels.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full border border-amber-300 bg-white px-3 py-1 text-sm text-amber-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-5">
                <Link
                  href={`/${locale}/app/children/${child.id}#planning-preferences`}
                  className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
                >
                  Review planning filters
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {suggestedProfessions.map((profession) => {
                const title = getLocalizedValue(
                  profession.title_i18n as Record<string, string>,
                  supportedLocale
                );
                const summary = getLocalizedValue(
                  profession.summary_i18n as Record<string, string>,
                  supportedLocale
                );

                const matchedInterestLabels = profession.matchedInterestIds.map(
                  (id) => getInterestLabel(id, supportedLocale)
                );

                const matchedStrengthLabels = profession.matchedStrengthIds.map(
                  (id) => getDerivedStrengthLabel(id, supportedLocale)
                );

                return (
                  <div
                    key={profession.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-3xl">
                        <h3 className="text-base font-semibold text-stone-900">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-stone-600">
                          {summary}
                        </p>

                        <TagList
                          title="Matched interests"
                          items={matchedInterestLabels}
                          highlight
                        />
                        <TagList
                          title="Matched strengths"
                          items={matchedStrengthLabels}
                          highlight
                        />
                        <TagList
                          title="Matched preferences"
                          items={profession.matchedPreferences}
                          highlight
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 sm:flex-col">
                        <div className="text-sm text-stone-500">
                          Match score{" "}
                          <span className="font-medium text-stone-900">
                            {profession.matchScore}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/${locale}/app/professions/${profession.slug}`}
                            className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
                          >
                            Open profession
                          </Link>

                          <CompareProfessionButton
                            childId={child.id}
                            professionId={profession.id}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          id="saved-professions"
          title="Saved professions"
          count={savedProfessions.length}
        >
          {savedProfessions.length === 0 ? (
            <p className="text-sm text-stone-600">
              No professions saved for this child yet.
            </p>
          ) : (
            <div className="grid gap-4">
              {savedProfessions.map((profession) => {
                const title = getLocalizedValue(
                  profession!.title_i18n as Record<string, string>,
                  supportedLocale
                );
                const summary = getLocalizedValue(
                  profession!.summary_i18n as Record<string, string>,
                  supportedLocale
                );

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
                  childInterestIds: interestIds,
                  childDerivedStrengthIds: derivedStrengthIds,
                  desiredIncomeBand,
                  preferredWorkStyle,
                  preferredEducationLevel,
                });

                const matchedInterestLabels = fit.matchedInterestIds.map((id) =>
                  getInterestLabel(id, supportedLocale)
                );
                const matchedStrengthLabels = fit.matchedStrengthIds.map((id) =>
                  getDerivedStrengthLabel(id, supportedLocale)
                );
                const missingStrengthLabels = fit.missingStrengthIds.map((id) =>
                  getDerivedStrengthLabel(id, supportedLocale)
                );
                const developmentFocusLabels = fit.developmentFocusIds.map((id) =>
                  getDevelopmentFocusLabel(id, supportedLocale)
                );
                const schoolSubjectLabels = fit.schoolSubjectIds.map((id) =>
                  getSchoolSubjectLabel(id, supportedLocale)
                );
                const keySkills = Array.isArray(profession!.key_skills)
                  ? profession!.key_skills.filter(
                      (item): item is string => typeof item === "string"
                    )
                  : [];
                const educationNotes = getLocalizedValue(
                  profession!.education_notes_i18n as Record<string, string>,
                  supportedLocale
                );

                return (
                  <div
                    key={profession!.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-3xl">
                        <h3 className="text-base font-semibold text-stone-900">
                          {title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-stone-600">
                          {summary}
                        </p>

                        <TagList
                          title="Matched interests"
                          items={matchedInterestLabels}
                          highlight
                        />
                        <TagList
                          title="Matched strengths"
                          items={matchedStrengthLabels}
                          highlight
                        />
                        <TagList
                          title="Matched preferences"
                          items={fit.preferenceMatches}
                          highlight
                        />
                        <TagList title="Key skills" items={keySkills} />
                        <TagList
                          title="What to develop next"
                          items={[
                            ...missingStrengthLabels,
                            ...developmentFocusLabels,
                          ]}
                        />
                        <TagList
                          title="Useful school subjects"
                          items={schoolSubjectLabels}
                        />

                        {educationNotes ? (
                          <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-600">
                            <div className="text-sm font-semibold text-stone-900">
                              Education notes
                            </div>
                            <p className="mt-2">{educationNotes}</p>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                        <Link
                          href={`/${locale}/app/professions/${profession!.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                        >
                          Open profession
                        </Link>

                        <RemoveSavedProfessionButton
                          childId={child.id}
                          professionId={profession!.id}
                        />

                        <CompareProfessionButton
                          childId={child.id}
                          professionId={profession!.id}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection
          id="saved-study-routes"
          title="Saved study routes"
          count={savedStudyRouteCards.length}
        >
          <p className="text-sm leading-relaxed text-stone-600">
            These are the concrete study paths already selected from the study
            options screen. This block should help the parent quickly read
            which routes are primary, local, broader, or more stretch-based.
          </p>

          {savedStudyRouteCards.length === 0 ? (
            <p className="mt-4 text-sm text-stone-600">
              No study routes saved for this child yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {savedStudyRouteCards.map((item) => {
                const professionTitle = getLocalizedValue(
                  item.profession.title_i18n ?? {},
                  supportedLocale
                );
                const durationLabel = getDurationLabel(
                  item.program.duration_years,
                  supportedLocale
                );

                return (
                  <div
                    key={`${item.savedRoute.profession_slug}-${item.savedRoute.program_slug}`}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-3xl">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={getDecisionRoleTone(
                              item.decisionSupport.decisionRole
                            )}
                          >
                            {getEducationDecisionRoleLabel(
                              item.decisionSupport.decisionRole,
                              supportedLocale
                            )}
                          </span>

                          <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
                            {getEducationRouteTypeLabel(
                              item.decisionSupport.routeType,
                              supportedLocale
                            )}
                          </span>

                          <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
                            {getStudyModeLabel(
                              item.program.study_mode,
                              supportedLocale
                            )}
                          </span>

                          {durationLabel ? (
                            <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
                              {durationLabel}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 text-base font-semibold text-stone-900">
                          {item.program.title}
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-stone-600">
                          {professionTitle} · {item.institution.name} ·{" "}
                          {item.institution.municipality_name}
                        </p>

                        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4">
                          <div className="text-sm font-semibold text-stone-900">
                            How to read this route now
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-stone-600">
                            {getDecisionRoleExplanation(
                              item.decisionSupport.decisionRole
                            )}
                          </p>
                        </div>

                        <RouteOpenDoorsPanel
                          items={item.openDoorProfessions.map((adjacentProfession) => ({
                            ...adjacentProfession,
                            href: `/${locale}/app/professions/${adjacentProfession.slug}`,
                          }))}
                        />

                        <TagList
                          title="Profile signals already supporting this route"
                          items={[
                            ...item.decisionSupport.supportingInterestLabels,
                            ...item.decisionSupport.supportingStrengthLabels,
                          ]}
                          highlight
                        />

                        <TagList
                          title="Useful school focus"
                          items={item.decisionSupport.schoolFocusLabels}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                        {item.institution.website_url ? (
                          <a
                            href={item.institution.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                          >
                            Open institution page
                          </a>
                        ) : null}

                        <Link
                          href={`/${locale}/app/children/${child.id}/education/${item.savedRoute.profession_slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                        >
                          Review route options
                        </Link>

                        <RemoveSavedStudyRouteButton
                          childId={child.id}
                          programSlug={item.savedRoute.program_slug}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CollapsibleSection>
      </div>
    </LocalePageShell>
  );
}