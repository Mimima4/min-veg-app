import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import CompareProfessionButton from "@/components/planning/compare-profession-button";
import CompareProfessionsButton from "@/components/planning/compare-professions-button";
import SaveProfessionToChildButton from "../save-profession-to-child-button";
import { getChildSummaryPageData } from "@/server/children/summary/get-child-summary-page-data";
import { requireAppAccess } from "@/server/billing/require-app-access";

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

function SummaryMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
        {value}
      </div>
      {hint ? (
        <p className="mt-2 text-sm leading-relaxed text-stone-500">{hint}</p>
      ) : null}
    </div>
  );
}

function DashboardCard({
  title,
  children,
  id,
}: {
  title: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6"
    >
      <h2 className="text-base font-semibold text-stone-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default async function ChildSummaryPage({
  params,
}: {
  params: Promise<{ locale: string; childId: string }>;
}) {
  const { locale, childId } = await params;
  const gate = await requireAppAccess({
    locale,
    pathname: `/${locale}/app/children/${childId}/summary`,
  });
  if (gate.readonly) {
    redirect(`/${locale}/app/family`);
  }

  const result = await getChildSummaryPageData({ locale, childId });

  if (result.kind === "redirect") {
    redirect(result.href);
  }

  if (result.kind === "error") {
    return (
      <LocalePageShell
        locale={locale}
        title={result.title}
        subtitle={result.subtitle}
        backHref={`/${locale}/app/family`}
        backLabel="Back family overview"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {result.message}
        </div>
      </LocalePageShell>
    );
  }

  const {
    child,
    metrics,
    hasProfileReady,
    hasPlanningFilters,
    interestLabels,
    observedTraitLabels,
    derivedStrengthLabels,
    directionLabels,
    developmentLabels,
    schoolFocusLabels,
    planningDirectionLabels,
    topProfessions,
  } = result.data;

  return (
    <LocalePageShell
      locale={locale}
      title={`${child.displayName} summary`}
      subtitle="A clean parent-facing readout of current signals, strongest directions, profession relevance, and next development priorities."
      backHref={`/${locale}/app/children/${child.id}`}
      backLabel="Back child profile"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-lg font-semibold text-stone-900">
                Summary overview
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                This is the current parent-facing summary for this child profile.
                It should help a parent quickly understand where the child looks
                strongest right now, which directions are most realistic to
                explore, and what to build next.
              </p>
            </div>

            <div className="grid w-full max-w-[22rem] gap-3 sm:w-auto sm:max-w-none sm:grid-cols-2">
              <Link
                href={`/${locale}/app/children/${child.id}/matches`}
                className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
              >
                Explore professions
              </Link>

              <div className="[&>*]:w-full [&>*]:justify-center">
                <CompareProfessionsButton locale={locale} childId={child.id} />
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryMetric
              label="Current signals"
              value={metrics.signalCount}
              hint="Selected interests and observed traits."
            />
            <SummaryMetric
              label="Derived strengths"
              value={metrics.derivedStrengthCount}
              hint="Generated automatically from the child profile."
            />
            <SummaryMetric
              label="Matching professions"
              value={metrics.matchingProfessionCount}
              hint="Current matches after profile and planning filters."
            />
            <SummaryMetric
              label="Saved professions"
              value={metrics.savedProfessionCount}
              hint="Professions already saved for this child."
            />
            <SummaryMetric
              label="Saved study routes"
              value={metrics.savedStudyRouteCount}
              hint="Concrete education paths already saved."
            />
          </div>
        </div>

        {!hasProfileReady ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              Summary not ready yet
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-stone-600">
              Select interests and observed traits in the child profile first.
              That will unlock a much stronger summary, clearer profession
              relevance, and better development guidance.
            </p>

            <div className="mt-5">
              <Link
                href={`/${locale}/app/children/${child.id}`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
              >
                Edit child profile
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-2">
              <DashboardCard title="Profile snapshot">
                <dl className="grid gap-3 text-sm text-stone-600">
                  <div>
                    <dt className="font-medium text-stone-900">Age</dt>
                    <dd className="mt-1">{child.age ?? "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-stone-900">School stage</dt>
                    <dd className="mt-1">{child.schoolStageLabel}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-stone-900">
                      Relocation willingness
                    </dt>
                    <dd className="mt-1">{child.relocationLabel}</dd>
                  </div>
                </dl>
              </DashboardCard>

              <DashboardCard id="derived-strengths" title="Strengths and direction">
                <TagList
                  title="Derived strengths"
                  items={derivedStrengthLabels}
                  highlight
                />
                <TagList
                  title="Strongest directions"
                  items={directionLabels}
                  highlight
                />
              </DashboardCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <DashboardCard title="Current signals">
                <TagList
                  title="Selected interests"
                  items={interestLabels}
                  highlight
                />
                <TagList
                  title="Observed traits"
                  items={observedTraitLabels}
                  highlight
                />
              </DashboardCard>

              <DashboardCard title="Development priorities">
                <TagList title="What to develop next" items={developmentLabels} />
                <TagList title="Useful school focus" items={schoolFocusLabels} />
              </DashboardCard>
            </div>

            <div
              id="professions-worth-exploring"
              className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">
                    Professions worth exploring now
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    These are the strongest current profession matches for this
                    child profile.
                  </p>
                </div>

                <div className="grid w-full max-w-[22rem] gap-3 sm:w-auto sm:max-w-none sm:grid-cols-2">
                  <Link
                    href={`/${locale}/app/children/${child.id}/matches`}
                    className="inline-flex w-full items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                  >
                    Open full explorer
                  </Link>

                  <div className="[&>*]:w-full [&>*]:justify-center">
                    <CompareProfessionsButton locale={locale} childId={child.id} />
                  </div>
                </div>
              </div>

              {topProfessions.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="text-base font-semibold text-stone-900">
                    No professions are visible with the current planning filters
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">
                    The child profile still has useful signals, but the current
                    planning direction is filtering out all profession matches.
                    Review the planning preferences to reopen more realistic
                    study paths.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(planningDirectionLabels.length > 0
                      ? planningDirectionLabels
                      : ["No planning filters set yet"]
                    ).map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center rounded-full border border-amber-300 bg-white px-3 py-1 text-sm text-amber-800"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

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
                  {topProfessions.map((profession) => (
                    <div
                      key={profession.id}
                      className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-3xl">
                          <h3 className="text-base font-semibold text-stone-900">
                            {profession.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-stone-600">
                            {profession.summary}
                          </p>

                          <TagList
                            title="Matched interests"
                            items={profession.matchedInterestLabels}
                            highlight
                          />
                          <TagList
                            title="Matched strengths"
                            items={profession.matchedStrengthLabels}
                            highlight
                          />
                          <TagList
                            title="Matched preferences"
                            items={profession.matchedPreferences}
                            highlight
                          />
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
                            locale={locale}
                            childId={child.id}
                            professionId={profession.id}
                            isSaved={profession.isSaved}
                          />

                          <CompareProfessionButton
                            childId={child.id}
                            professionId={profession.id}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </LocalePageShell>
  );
}