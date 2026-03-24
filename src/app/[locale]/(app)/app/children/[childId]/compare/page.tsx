import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import RemoveFromCompareButton from "@/components/planning/remove-from-compare-button";
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

function formatSalary(value: number | null) {
  if (!value) return "—";
  return `${new Intl.NumberFormat("nb-NO").format(value)} NOK`;
}

function formatDemandLevel(value: string) {
  switch (value) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return value;
  }
}

export default async function ChildComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; childId: string }>;
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const { locale, childId } = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = await createClient();

  const idsParam = Array.isArray(resolvedSearchParams.ids)
    ? resolvedSearchParams.ids[0]
    : resolvedSearchParams.ids ?? "";

  const requestedIds = idsParam
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (requestedIds.length < 2) {
    redirect(`/${locale}/app/children/${childId}/matches`);
  }

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

  if (error || !child) {
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

  const { data: professions } = await supabase
    .from("professions")
    .select(
      "id, slug, title_i18n, summary_i18n, avg_salary_nok, demand_level, education_level, work_style, key_skills, interest_tags, strength_tags, development_focus_tags, school_subject_tags, education_notes_i18n"
    )
    .in("id", requestedIds)
    .eq("is_active", true);

  const professionMap = new Map(
    (professions ?? []).map((profession) => [profession.id, profession])
  );

  const orderedProfessions = requestedIds
    .map((id) => professionMap.get(id))
    .filter(Boolean);

  if (orderedProfessions.length < 2) {
    redirect(`/${locale}/app/children/${childId}/matches`);
  }

  return (
    <LocalePageShell
      locale={locale}
      title={`${child.display_name || "Child"} compare`}
      subtitle="Compare selected professions side by side for fit, development areas, and education direction."
      backHref={`/${locale}/app/children/${child.id}/matches`}
      backLabel="Back profession explorer"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="grid gap-4 xl:grid-cols-3">
        {orderedProfessions.map((profession) => {
          const title = getLocalizedValue(
            profession!.title_i18n as Record<string, string>,
            locale as SupportedLocale
          );
          const summary = getLocalizedValue(
            profession!.summary_i18n as Record<string, string>,
            locale as SupportedLocale
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
          const keySkills = Array.isArray(profession!.key_skills)
            ? profession!.key_skills.filter(
                (item): item is string => typeof item === "string"
              )
            : [];
          const educationNotes = getLocalizedValue(
            profession!.education_notes_i18n as Record<string, string>,
            locale as SupportedLocale
          );

          const fitNowScore =
            matchedInterestLabels.length +
            matchedStrengthLabels.length +
            fit.preferenceMatches.length;

          return (
            <div
              key={profession!.id}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {summary}
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="text-sm font-medium text-stone-600">
                    Compare summary
                  </div>

                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-stone-500">
                        Fit now
                      </dt>
                      <dd className="mt-1 text-base font-medium text-stone-900">
                        {fitNowScore}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs uppercase tracking-wide text-stone-500">
                        Salary
                      </dt>
                      <dd className="mt-1 text-base text-stone-900">
                        {formatSalary(profession!.avg_salary_nok)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs uppercase tracking-wide text-stone-500">
                        Demand
                      </dt>
                      <dd className="mt-1 text-base text-stone-900">
                        {formatDemandLevel(profession!.demand_level)}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs uppercase tracking-wide text-stone-500">
                        Work style
                      </dt>
                      <dd className="mt-1 text-base text-stone-900">
                        {profession!.work_style}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs uppercase tracking-wide text-stone-500">
                        Education
                      </dt>
                      <dd className="mt-1 text-base text-stone-900">
                        {profession!.education_level}
                      </dd>
                    </div>
                  </dl>
                </div>

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
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">
                    <div className="text-sm font-semibold text-stone-900">
                      Education notes
                    </div>
                    <p className="mt-2">{educationNotes}</p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/${locale}/app/professions/${profession!.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                  >
                    Open profession
                  </Link>

                  <Link
                    href={`/${locale}/app/children/${child.id}/education/${profession!.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                  >
                    Open study options
                  </Link>

                  <SaveProfessionToChildButton
                    childId={child.id}
                    professionId={profession!.id}
                    isSaved={savedProfessionIds.has(profession!.id)}
                  />

                  <RemoveFromCompareButton
                    locale={locale}
                    childId={child.id}
                    professionId={profession!.id}
                    fallbackIds={requestedIds}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </LocalePageShell>
  );
}