import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import CompareProfessionButton from "@/components/planning/compare-profession-button";
import CompareProfessionsButton from "@/components/planning/compare-professions-button";
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
import { getProfessionChildFit } from "@/lib/planning/get-profession-child-fit";
import { getSuggestedProfessions } from "@/lib/planning/get-suggested-professions";
import {
  getDevelopmentFocusLabel,
  getSchoolSubjectLabel,
} from "@/lib/planning/profession-tag-catalog";
import EditChildForm from "./edit-child-form";
import RemoveSavedProfessionButton from "./remove-saved-profession-button";

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
      subtitle="Review and update the child profile, development signals, and planning preferences."
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

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                Suggested professions
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                These are the strongest current matches for this child profile.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/${locale}/app/children/${child.id}/matches`}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
              >
                Explore professions
              </Link>

              <CompareProfessionsButton locale={locale} childId={child.id} />
            </div>
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
                          Match score:{" "}
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
        </div>

        <div
          id="saved-professions"
          className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6"
        >
          <h2 className="text-lg font-semibold text-stone-900">
            Saved professions
          </h2>

          {!savedProfessions || savedProfessions.length === 0 ? (
            <p className="mt-3 text-sm text-stone-600">
              No professions saved for this child yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
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
        </div>
      </div>
    </LocalePageShell>
  );
}