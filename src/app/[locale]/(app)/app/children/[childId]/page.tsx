import Link from "next/link";
import { redirect } from "next/navigation";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import CompareProfessionButton from "@/components/planning/compare-profession-button";
import CompareProfessionsButton from "@/components/planning/compare-professions-button";
import CompareSavedRouteButton from "@/components/planning/compare-saved-route-button";
import CompareSavedRoutesButton from "@/components/planning/compare-saved-routes-button";
import CollapsibleSection from "@/components/planning/collapsible-section";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import EditChildForm from "./edit-child-form";
import RemoveSavedProfessionButton from "./remove-saved-profession-button";
import RemoveSavedStudyRouteButton from "./remove-saved-study-route-button";
import {
  getChildProfilePageData,
} from "@/server/children/planning/get-child-profile-page-data";
import type {
  DesiredIncomeBand,
  PreferredEducationLevel,
  PreferredWorkStyle,
} from "@/server/children/planning/get-child-planning-state";
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

export default async function ChildDetailPage({
  params,
}: {
  params: Promise<{ locale: string; childId: string }>;
}) {
  const { locale, childId } = await params;
  const gate = await requireAppAccess({
    locale,
    pathname: `/${locale}/app/children/${childId}`,
  });
  if (gate.readonly) {
    redirect(`/${locale}/app/family`);
  }

  const result = await getChildProfilePageData({ locale, childId });

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
    supportedLocale,
    child,
    municipalityOptions,
    initialPreferredMunicipalityCodes,
    interestIds,
    observedTraitIds,
    desiredIncomeBand,
    preferredWorkStyle,
    preferredEducationLevel,
    hasPlanningFilters,
    activePreferenceLabels,
    suggestedProfessions,
    savedProfessions,
    savedStudyRouteCards,
  } = result.data;

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
            initialBirthYear={child.birth_year ?? new Date().getFullYear()}
            initialSchoolStage={
              child.school_stage as
                | "barneskole"
                | "ungdomsskole"
                | "vgs"
                | "student"
                | "young_adult"
            }
            initialCountryCode={child.country_code ?? "NO"}
            initialRelocationWillingness={
              child.relocation_willingness as "no" | "maybe" | "yes" | null
            }
            initialInterestIds={interestIds}
            initialObservedTraitIds={observedTraitIds}
            initialDesiredIncomeBand={desiredIncomeBand as DesiredIncomeBand}
            initialPreferredWorkStyle={preferredWorkStyle as PreferredWorkStyle}
            initialPreferredEducationLevel={
              preferredEducationLevel as PreferredEducationLevel
            }
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
              {suggestedProfessions.map((profession) => (
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
              ))}
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
              {savedProfessions.map((profession) => (
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
                      <TagList title="Key skills" items={profession.keySkills} />
                      <TagList
                        title="What to develop next"
                        items={profession.nextDevelopmentLabels}
                      />
                      <TagList
                        title="Useful school subjects"
                        items={profession.schoolSubjectLabels}
                      />

                      {profession.educationNotes ? (
                        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-relaxed text-stone-600">
                          <div className="text-sm font-semibold text-stone-900">
                            Education notes
                          </div>
                          <p className="mt-2">{profession.educationNotes}</p>
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

                      <RemoveSavedProfessionButton
                        childId={child.id}
                        professionId={profession.id}
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

          <div className="mt-4 flex flex-wrap gap-3">
            <CompareSavedRoutesButton locale={locale} childId={child.id} />
          </div>

          {savedStudyRouteCards.length === 0 ? (
            <p className="mt-4 text-sm text-stone-600">
              No study routes saved for this child yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {savedStudyRouteCards.map((item) => {
                return (
                  <div
                    key={item.savedRoute.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="max-w-3xl">
                        <h3 className="mt-4 text-base font-semibold text-stone-900">
                          {item.professionTitle}
                        </h3>

                        <p className="mt-2 text-sm leading-relaxed text-stone-600">
                          Status: {item.savedRoute.status}
                        </p>
                        {item.primaryInstitutionName ? (
                          <p className="mt-2 text-sm font-medium text-stone-800">
                            {item.primaryInstitutionName}
                          </p>
                        ) : null}
                        {item.primaryInstitutionLocation ? (
                          <p className="mt-1 text-sm text-stone-600">
                            {item.primaryInstitutionLocation}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-stone-500">
                          Updated: {new Date(item.savedRoute.updated_at).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                        <Link
                          href={`/${locale}/app/children/${child.id}/route/${item.savedRoute.id}`}
                          className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                        >
                          Open route
                        </Link>

                        <RemoveSavedStudyRouteButton
                          childId={child.id}
                          routeId={item.savedRoute.id}
                        />

                        <CompareSavedRouteButton
                          childId={child.id}
                          routeId={item.savedRoute.id}
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