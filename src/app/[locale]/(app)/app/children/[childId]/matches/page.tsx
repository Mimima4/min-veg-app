import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import CompareProfessionButton from "@/components/planning/compare-profession-button";
import CompareProfessionsButton from "@/components/planning/compare-professions-button";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
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
import {
  type DesiredIncomeBand,
  type PreferredEducationLevel,
  type PreferredWorkStyle,
  getPreferenceMatchLabels,
  matchesEducationLevel,
  matchesIncomeBand,
  matchesWorkStyle,
} from "@/lib/planning/profession-fit-utils";
import SaveProfessionToChildButton from "../save-profession-to-child-button";

type ExplorerProfession = {
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

function demandWeight(demandLevel: string): number {
  switch (demandLevel) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

function buildActivePreferenceLabels({
  desiredIncomeBand,
  preferredWorkStyle,
  preferredEducationLevel,
}: {
  desiredIncomeBand: DesiredIncomeBand;
  preferredWorkStyle: PreferredWorkStyle;
  preferredEducationLevel: PreferredEducationLevel;
  locale: SupportedLocale;
}): string[] {
  const labels: string[] = [];

  if (desiredIncomeBand !== "open") {
    labels.push("Income preference active");
  }

  if (preferredWorkStyle !== "open") {
    labels.push("Work style preference active");
  }

  if (preferredEducationLevel !== "open") {
    labels.push("Education preference active");
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

export default async function ChildMatchesPage({
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
      "id, display_name, interests, observed_traits, desired_income_band, preferred_work_style, preferred_education_level"
    )
    .eq("id", childId)
    .maybeSingle();

  if (error) {
    return (
      <LocalePageShell
        locale={locale}
        title="Profession explorer"
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
    .select("profession_id")
    .eq("child_profile_id", child.id);

  const savedProfessionIds = new Set(
    (savedLinks ?? []).map((item) => item.profession_id)
  );

  const { data: professions, error: professionsError } = await supabase
    .from("professions")
    .select(
      "id, slug, title_i18n, summary_i18n, avg_salary_nok, demand_level, education_level, work_style, key_skills, interest_tags, strength_tags, development_focus_tags, school_subject_tags, education_notes_i18n"
    )
    .eq("is_active", true);

  if (professionsError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Profession explorer"
        subtitle="There was a problem loading professions."
        backHref={`/${locale}/app/children/${child.id}`}
        backLabel="Back child profile"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {professionsError.message}
        </div>
      </LocalePageShell>
    );
  }

  const allProfessions = (professions ?? []) as ExplorerProfession[];

  const strongMatches = getSuggestedProfessions({
    interestIds,
    derivedStrengthIds,
    professions: allProfessions,
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
  });

  const strongMatchIds = new Set(strongMatches.map((profession) => profession.id));

  const broaderOptions = allProfessions
    .filter((profession) => {
      return (
        matchesIncomeBand(profession.avg_salary_nok, desiredIncomeBand) &&
        matchesWorkStyle(profession.work_style, preferredWorkStyle) &&
        matchesEducationLevel(
          profession.education_level,
          preferredEducationLevel
        ) &&
        !strongMatchIds.has(profession.id)
      );
    })
    .sort((a, b) => {
      if (demandWeight(b.demand_level) !== demandWeight(a.demand_level)) {
        return demandWeight(b.demand_level) - demandWeight(a.demand_level);
      }

      return a.slug.localeCompare(b.slug);
    });

  const supportedLocale = locale as SupportedLocale;

  const activePreferenceLabels = buildActivePreferenceLabels({
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
    locale: supportedLocale,
  });

  return (
    <LocalePageShell
      locale={locale}
      title={`${child.display_name || "Child"} matches`}
      subtitle="Explore strong matches first, then broader professions that still fit the current planning direction."
      backHref={`/${locale}/app/children/${child.id}`}
      backLabel="Back child profile"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-stone-500">Current explorer filters</div>

            <div className="mt-3 flex flex-wrap gap-2">
              {interestIds.map((id) => (
                <span
                  key={`interest-${id}`}
                  className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                >
                  {getInterestLabel(id, supportedLocale)}
                </span>
              ))}

              {derivedStrengthIds.map((id) => (
                <span
                  key={`strength-${id}`}
                  className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                >
                  {getDerivedStrengthLabel(id, supportedLocale)}
                </span>
              ))}

              {activePreferenceLabels.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <CompareProfessionsButton locale={locale} childId={child.id} />
        </div>
      </div>

      {strongMatches.length === 0 && broaderOptions.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            No professions are visible with the current planning filters
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            The child profile still has useful signals, but the current planning
            direction is filtering out all available profession results.
          </p>

          {activePreferenceLabels.length > 0 ? (
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
        <div className="mt-6 space-y-6">
          {strongMatches.length > 0 ? (
            <section className="rounded-2xl border border-stone-200 bg-white p-6">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  Strong matches
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  These professions have the strongest current overlap with the
                  child’s interests, derived strengths, and planning direction.
                </p>
              </div>

              <div className="mt-5 grid gap-4">
                {strongMatches.map((profession) => {
                  const title = getLocalizedValue(
                    profession.title_i18n as Record<string, string>,
                    supportedLocale
                  );
                  const summary = getLocalizedValue(
                    profession.summary_i18n as Record<string, string>,
                    supportedLocale
                  );

                  const fit = getProfessionChildFit({
                    profession: {
                      interest_tags: profession.interest_tags,
                      strength_tags: profession.strength_tags,
                      development_focus_tags:
                        (profession as ExplorerProfession).development_focus_tags,
                      school_subject_tags:
                        (profession as ExplorerProfession).school_subject_tags,
                      avg_salary_nok: profession.avg_salary_nok,
                      work_style: profession.work_style,
                      education_level: profession.education_level,
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
                  const keySkills = Array.isArray(profession.key_skills)
                    ? profession.key_skills.filter(
                        (item): item is string => typeof item === "string"
                      )
                    : [];
                  const educationNotes = getLocalizedValue(
                    ((profession as ExplorerProfession).education_notes_i18n ??
                      {}) as Record<string, string>,
                    supportedLocale
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
                          <div className="text-sm text-stone-500">
                            Match score{" "}
                            <span className="font-medium text-stone-900">
                              {profession.matchScore}
                            </span>
                          </div>

                          <Link
                            href={`/${locale}/app/professions/${profession.slug}`}
                            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                          >
                            Open profession
                          </Link>

                          <Link
                            href={`/${locale}/app/children/${child.id}/education/${profession.slug}`}
                            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                          >
                            Open study options
                          </Link>

                          <SaveProfessionToChildButton
                            childId={child.id}
                            professionId={profession.id}
                            isSaved={savedProfessionIds.has(profession.id)}
                          />

                          <CompareProfessionButton
                            childId={child.id}
                            professionId={profession.id}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {broaderOptions.length > 0 ? (
            <section className="rounded-2xl border border-stone-200 bg-white p-6">
              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  Broader options
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  These professions still fit the current planning direction,
                  but they have weaker overlap with the child’s current signals.
                  They are useful as wider exploration, not just top matches.
                </p>
              </div>

              <div className="mt-5 grid gap-4">
                {broaderOptions.map((profession) => {
                  const title = getLocalizedValue(
                    profession.title_i18n as Record<string, string>,
                    supportedLocale
                  );
                  const summary = getLocalizedValue(
                    profession.summary_i18n as Record<string, string>,
                    supportedLocale
                  );

                  const preferenceMatches = getPreferenceMatchLabels({
                    avgSalaryNok: profession.avg_salary_nok,
                    workStyle: profession.work_style,
                    educationLevel: profession.education_level,
                    desiredIncomeBand,
                    preferredWorkStyle,
                    preferredEducationLevel,
                  });

                  const keySkills = Array.isArray(profession.key_skills)
                    ? profession.key_skills.filter(
                        (item): item is string => typeof item === "string"
                      )
                    : [];

                  const educationNotes = getLocalizedValue(
                    (profession.education_notes_i18n ?? {}) as Record<
                      string,
                      string
                    >,
                    supportedLocale
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
                            title="Planning direction fit"
                            items={
                              preferenceMatches.length > 0
                                ? preferenceMatches
                                : ["Fits the current open planning direction"]
                            }
                            highlight
                          />
                          <TagList title="Key skills" items={keySkills} />

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
                            href={`/${locale}/app/professions/${profession.slug}`}
                            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                          >
                            Open profession
                          </Link>

                          <Link
                            href={`/${locale}/app/children/${child.id}/education/${profession.slug}`}
                            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                          >
                            Open study options
                          </Link>

                          <SaveProfessionToChildButton
                            childId={child.id}
                            professionId={profession.id}
                            isSaved={savedProfessionIds.has(profession.id)}
                          />

                          <CompareProfessionButton
                            childId={child.id}
                            professionId={profession.id}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </LocalePageShell>
  );
}