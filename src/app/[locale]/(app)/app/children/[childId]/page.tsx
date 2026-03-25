import Link from "next/link";
import { redirect } from "next/navigation";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import CompareProfessionButton from "@/components/planning/compare-profession-button";
import CompareProfessionsButton from "@/components/planning/compare-professions-button";
import CollapsibleSection from "@/components/planning/collapsible-section";
import RouteOpenDoorsPanel from "@/components/planning/route-open-doors-panel";
import {
  getEducationDecisionRoleLabel,
  getEducationRouteTypeLabel,
  type EducationDecisionRole,
} from "@/lib/planning/get-education-program-fit";
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

          {savedStudyRouteCards.length === 0 ? (
            <p className="mt-4 text-sm text-stone-600">
              No study routes saved for this child yet.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {savedStudyRouteCards.map((item) => {
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
                          {item.professionTitle} · {item.institution.name} ·{" "}
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