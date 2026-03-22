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
import SaveProfessionToChildButton from "../save-profession-to-child-button";

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
    (child.desired_income_band as
      | "open"
      | "up_to_600k"
      | "600k_to_800k"
      | "800k_plus") ?? "open";

  const preferredWorkStyle =
    (child.preferred_work_style as
      | "open"
      | "onsite"
      | "hybrid"
      | "remote"
      | "mixed") ?? "open";

  const preferredEducationLevel =
    (child.preferred_education_level as
      | "open"
      | "certificate"
      | "vocational"
      | "bachelor"
      | "master"
      | "flexible") ?? "open";

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

  const suggestedProfessions = getSuggestedProfessions({
    interestIds,
    derivedStrengthIds,
    professions: professions ?? [],
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
  });

  return (
    <LocalePageShell
      locale={locale}
      title={`${child.display_name || "Child"} matches`}
      subtitle="Explore all professions that currently match this child profile and planning direction."
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
                  {getInterestLabel(id, locale as SupportedLocale)}
                </span>
              ))}

              {derivedStrengthIds.map((id) => (
                <span
                  key={`strength-${id}`}
                  className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                >
                  {getDerivedStrengthLabel(id, locale as SupportedLocale)}
                </span>
              ))}

              {desiredIncomeBand !== "open" ? (
                <span className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700">
                  income filter active
                </span>
              ) : null}

              {preferredWorkStyle !== "open" ? (
                <span className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700">
                  work style filter active
                </span>
              ) : null}

              {preferredEducationLevel !== "open" ? (
                <span className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700">
                  education filter active
                </span>
              ) : null}
            </div>
          </div>

          <CompareProfessionsButton locale={locale} childId={child.id} />
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        {suggestedProfessions.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              No matches found
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">
              Adjust interests, observed traits, or planning preferences in the
              child profile to widen the match set.
            </p>
          </div>
        ) : (
          suggestedProfessions.map((profession) => {
            const title = getLocalizedValue(
              profession.title_i18n as Record<string, string>,
              locale as SupportedLocale
            );
            const summary = getLocalizedValue(
              profession.summary_i18n as Record<string, string>,
              locale as SupportedLocale
            );

            const fit = getProfessionChildFit({
              profession: {
                interest_tags: profession.interest_tags,
                strength_tags: profession.strength_tags,
                development_focus_tags: profession.development_focus_tags,
                school_subject_tags: profession.school_subject_tags,
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
              getInterestLabel(id, locale as SupportedLocale)
            );
            const matchedStrengthLabels = fit.matchedStrengthIds.map((id) =>
              getDerivedStrengthLabel(id, locale as SupportedLocale)
            );
            const missingStrengthLabels = fit.missingStrengthIds.map((id) =>
              getDerivedStrengthLabel(id, locale as SupportedLocale)
            );
            const developmentFocusLabels = fit.developmentFocusIds.map((id) =>
              getDevelopmentFocusLabel(id, locale as SupportedLocale)
            );
            const schoolSubjectLabels = fit.schoolSubjectIds.map((id) =>
              getSchoolSubjectLabel(id, locale as SupportedLocale)
            );
            const keySkills = Array.isArray(profession.key_skills)
              ? profession.key_skills.filter(
                  (item): item is string => typeof item === "string"
                )
              : [];
            const educationNotes = getLocalizedValue(
              profession.education_notes_i18n as Record<string, string>,
              locale as SupportedLocale
            );

            return (
              <div
                key={profession.id}
                className="rounded-2xl border border-stone-200 bg-white p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-3xl">
                    <h2 className="text-lg font-semibold text-stone-900">
                      {title}
                    </h2>
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
                      <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">
                        <div className="text-sm font-semibold text-stone-900">
                          Education notes
                        </div>
                        <p className="mt-2">{educationNotes}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                    <div className="text-sm text-stone-500">
                      Match score:{" "}
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
          })
        )}
      </div>
    </LocalePageShell>
  );
}