import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import {
  coerceInterestIds,
  coerceObservedTraitIds,
  getDerivedStrengthIds,
} from "@/lib/planning/child-tag-catalog";
import { getChildSummary } from "@/lib/planning/get-child-summary";

function SummaryMetricLink({
  label,
  value,
  href,
}: {
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-stone-300 hover:bg-stone-50"
    >
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
        {value}
      </div>
    </Link>
  );
}

function getSchoolStageLabel(
  schoolStage: string | null | undefined,
  locale: SupportedLocale
): string {
  if (!schoolStage) {
    return "—";
  }

  const labels: Record<string, Record<SupportedLocale, string>> = {
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

  return labels[schoolStage]?.[locale] ?? schoolStage;
}

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: familyAccount, error: familyError } = await supabase
    .from("family_accounts")
    .select("id, plan_type, status, max_children, created_at")
    .eq("primary_user_id", user.id)
    .maybeSingle();

  if (familyError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Family"
        subtitle="There was a problem loading your family account."
        backHref={`/${locale}/app/dashboard`}
        backLabel="Back dashboard"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {familyError.message}
        </div>
      </LocalePageShell>
    );
  }

  if (!familyAccount) {
    return (
      <LocalePageShell
        locale={locale}
        title="Family"
        subtitle="This is where your family account and child profiles will live."
        backHref={`/${locale}/app/dashboard`}
        backLabel="Back dashboard"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            No family account yet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            Create your family account to start building the parent and child
            area.
          </p>

          <div className="mt-5">
            <Link
              href={`/${locale}/app/family/create`}
              className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
            >
              Create family account
            </Link>
          </div>
        </div>
      </LocalePageShell>
    );
  }

  const { data: children, error: childrenError } = await supabase
    .from("child_profiles")
    .select(
      "id, display_name, birth_year, school_stage, interests, observed_traits, desired_income_band, preferred_work_style, preferred_education_level, created_at"
    )
    .eq("family_account_id", familyAccount.id)
    .order("created_at", { ascending: true });

  if (childrenError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Family"
        subtitle="There was a problem loading child profiles."
        backHref={`/${locale}/app/dashboard`}
        backLabel="Back dashboard"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {childrenError.message}
        </div>
      </LocalePageShell>
    );
  }

  const childCount = children?.length ?? 0;
  const canCreateMore = childCount < familyAccount.max_children;
  const childIds = (children ?? []).map((child) => child.id);

  const { data: savedLinks } =
    childIds.length > 0
      ? await supabase
          .from("child_profession_interests")
          .select("child_profile_id, profession_id")
          .in("child_profile_id", childIds)
      : { data: [], error: null };

  const savedCountByChildId = new Map<string, number>();

  for (const link of savedLinks ?? []) {
    const current = savedCountByChildId.get(link.child_profile_id) ?? 0;
    savedCountByChildId.set(link.child_profile_id, current + 1);
  }

  const { data: professions, error: professionsError } = await supabase
    .from("professions")
    .select(
      "id, slug, title_i18n, summary_i18n, key_skills, interest_tags, strength_tags, development_focus_tags, school_subject_tags, avg_salary_nok, demand_level, education_level, work_style"
    )
    .eq("is_active", true);

  if (professionsError) {
    return (
      <LocalePageShell
        locale={locale}
        title="Family"
        subtitle="There was a problem loading child summaries."
        backHref={`/${locale}/app/dashboard`}
        backLabel="Back dashboard"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {professionsError.message}
        </div>
      </LocalePageShell>
    );
  }

  const supportedLocale = locale as SupportedLocale;

  return (
    <LocalePageShell
      locale={locale}
      title="Family"
      subtitle="Manage your family account and the child profiles connected to it."
      backHref={`/${locale}/app/dashboard`}
      backLabel="Back dashboard"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Family account
          </h2>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-stone-500">Plan type</dt>
              <dd className="mt-1 text-base text-stone-900">
                {familyAccount.plan_type}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Status</dt>
              <dd className="mt-1 text-base text-stone-900">
                {familyAccount.status}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Children</dt>
              <dd className="mt-1 text-base text-stone-900">
                {childCount} / {familyAccount.max_children}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-stone-500">Created at</dt>
              <dd className="mt-1 text-base text-stone-900">
                {new Date(familyAccount.created_at).toLocaleString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                Child profiles
              </h2>
              <p className="mt-1 text-sm text-stone-600">
                Add and manage the children connected to this family account.
              </p>
            </div>

            {canCreateMore ? (
              <Link
                href={`/${locale}/app/children/create`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm text-white transition hover:bg-stone-800"
              >
                Create child profile
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                Child limit reached
              </span>
            )}
          </div>

          {!children || children.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
              <h3 className="text-base font-semibold text-stone-900">
                No child profiles yet
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Create the first child profile to continue building the family
                planning flow.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {children.map((child) => {
                const rawInterests = Array.isArray(child.interests)
                  ? child.interests.filter(
                      (item): item is string => typeof item === "string"
                    )
                  : [];

                const rawObservedTraits = Array.isArray(child.observed_traits)
                  ? child.observed_traits.filter(
                      (item): item is string => typeof item === "string"
                    )
                  : [];

                const interestIds = coerceInterestIds(rawInterests);
                const observedTraitIds = coerceObservedTraitIds(
                  rawObservedTraits
                );
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

                const summary = getChildSummary({
                  interestIds,
                  derivedStrengthIds,
                  professions: professions ?? [],
                  desiredIncomeBand,
                  preferredWorkStyle,
                  preferredEducationLevel,
                  savedProfessionCount:
                    savedCountByChildId.get(child.id) ?? 0,
                });

                const currentSignalsCount =
                  interestIds.length + observedTraitIds.length;

                return (
                  <div
                    key={child.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                  >
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-base font-semibold text-stone-900">
                          {child.display_name || "Unnamed child"}
                        </h3>

                        <p className="mt-1 text-xs leading-relaxed text-stone-500">
                          Fast parent-facing overview with quick access to deeper
                          planning details.
                        </p>
                      </div>

                      <div className="grid gap-5 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_12.5rem] lg:items-start">
                        <dl className="space-y-3">
                          <div>
                            <dt className="text-sm text-stone-500">Birth year</dt>
                            <dd className="mt-1 text-base text-stone-900">
                              {child.birth_year}
                            </dd>
                          </div>

                          <div>
                            <dt className="text-sm text-stone-500">
                              School stage
                            </dt>
                            <dd className="mt-1 text-base text-stone-900">
                              {getSchoolStageLabel(
                                child.school_stage,
                                supportedLocale
                              )}
                            </dd>
                          </div>
                        </dl>

                        <div className="rounded-2xl border border-stone-200 bg-stone-100 p-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <SummaryMetricLink
                              label="Current signals"
                              value={currentSignalsCount}
                              href={`/${locale}/app/children/${child.id}#current-signals`}
                            />
                            <SummaryMetricLink
                              label="Derived strengths"
                              value={derivedStrengthIds.length}
                              href={`/${locale}/app/children/${child.id}/summary#derived-strengths`}
                            />
                            <SummaryMetricLink
                              label="Matching professions"
                              value={summary.matchingProfessionCount}
                              href={`/${locale}/app/children/${child.id}/matches#matching-professions`}
                            />
                            <SummaryMetricLink
                              label="Saved professions"
                              value={summary.savedProfessionCount}
                              href={`/${locale}/app/children/${child.id}#saved-professions`}
                            />
                          </div>
                        </div>

                        <div className="flex w-full flex-col gap-2 lg:min-w-[12.5rem]">
                          <Link
                            href={`/${locale}/app/children/${child.id}/summary`}
                            className="inline-flex w-full items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
                          >
                            Open child summary
                          </Link>

                          <Link
                            href={`/${locale}/app/children/${child.id}`}
                            className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                          >
                            Open child profile
                          </Link>
                        </div>
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