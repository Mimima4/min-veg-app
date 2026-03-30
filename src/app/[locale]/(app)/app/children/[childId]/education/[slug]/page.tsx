import Link from "next/link";
import { redirect } from "next/navigation";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import { getEducationLevelLabel } from "@/lib/planning/education-route";
import {
  getEducationDecisionRoleLabel,
  getEducationRouteTypeLabel,
  type EducationProgramDecisionSupport,
  type EducationProgramLocationState,
  type EducationProgramPreferenceState,
} from "@/lib/planning/get-education-program-fit";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import type { PreferredEducationLevel } from "@/lib/planning/profession-fit-utils";
import SaveStudyRouteButton from "../../save-study-route-button";
import {
  getProfessionStudyOptions,
  type ProfessionStudyOptionRow,
} from "@/server/professions/study-options/get-profession-study-options";
import { requireAppAccess } from "@/server/billing/require-app-access";

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

function getLocationBadgeLabel({
  state,
  hasCommuneFilter,
}: {
  state: EducationProgramLocationState;
  hasCommuneFilter: boolean;
}) {
  if (state === "local") {
    return "Inside selected communes";
  }

  return hasCommuneFilter ? "Outside selected communes" : "Broader location set";
}

function getEducationPreferenceBadgeLabel({
  preferenceState,
  preferredEducationLevel,
  locale,
}: {
  preferenceState: EducationProgramPreferenceState;
  preferredEducationLevel: PreferredEducationLevel;
  locale: SupportedLocale;
}): string {
  switch (preferenceState) {
    case "aligned":
      return "Matches current education preference";
    case "flexible":
      return "Fits a flexible education preference";
    case "broader":
      return `Outside current education preference (${getEducationLevelLabel(
        preferredEducationLevel,
        locale
      )})`;
    case "open":
    default:
      return "No education preference set";
  }
}

function getRouteTypeExplanation(
  routeType: EducationProgramDecisionSupport["routeType"]
) {
  switch (routeType) {
    case "academic_first":
      return "This route leans more toward a study-prep path that can lead further toward university or university college.";
    case "practical_first":
      return "This route leans more toward a practical or vocational-first path, closer to hands-on training, certificate routes, or apprenticeship logic.";
    case "flexible_route":
    default:
      return "This route keeps more than one next step open and is useful when the child profile is still broad.";
  }
}

function getDecisionRoleExplanation(
  decisionRole: EducationProgramDecisionSupport["decisionRole"]
) {
  switch (decisionRole) {
    case "local_priority":
      return "This is the clearest local route right now: strong profession link, inside the selected area, and aligned with the current planning direction.";
    case "main_route":
      return "This is one of the clearest current routes for this child profile and planning direction.";
    case "stretch_route":
      return "This route is still strong for the profession, but it stretches wider than the current education preference.";
    case "local_alternative":
      return "This is a realistic nearby alternative worth keeping visible, but not the clearest primary route.";
    case "broader_alternative":
    default:
      return "This is a broader comparison route. It should stay visible, but it is not the clearest primary choice right now.";
  }
}

function getEducationPreferenceExplanation({
  preferenceState,
  preferredEducationLevel,
  locale,
}: {
  preferenceState: EducationProgramPreferenceState;
  preferredEducationLevel: PreferredEducationLevel;
  locale: SupportedLocale;
}) {
  switch (preferenceState) {
    case "aligned":
      return "The programme level matches the current education preference in the child profile.";
    case "flexible":
      return "The child profile is open to more than one education level, so this programme stays inside that flexible direction.";
    case "broader":
      return `The child profile currently points more toward ${getEducationLevelLabel(
        preferredEducationLevel,
        locale
      )}, so this programme should be read as a broader comparison route.`;
    case "open":
    default:
      return "No education level filter is active yet, so this programme is being shown without a preference restriction.";
  }
}

function getLocationExplanation({
  locationState,
  hasCommuneFilter,
  municipalityName,
}: {
  locationState: EducationProgramLocationState;
  hasCommuneFilter: boolean;
  municipalityName: string;
}) {
  if (locationState === "local") {
    return `This programme is inside the selected commune scope for the child profile (${municipalityName}).`;
  }

  if (!hasCommuneFilter) {
    return `No commune filter is active yet, so this programme remains visible as part of the broader study set (${municipalityName}).`;
  }

  return `This programme is outside the currently selected communes and should be read as a broader route (${municipalityName}).`;
}

function LabelGroup({
  title,
  items,
  emptyText,
  highlight = false,
}: {
  title: string;
  items: string[];
  emptyText: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="text-sm font-semibold text-stone-900">{title}</div>

      {items.length === 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-stone-500">{emptyText}</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
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

function ProgramCard({
  locale,
  childId,
  professionSlug,
  row,
  hasCommuneFilter,
  preferredEducationLevel,
  isSavedRoute,
}: {
  locale: string;
  childId: string;
  professionSlug: string;
  row: ProfessionStudyOptionRow;
  hasCommuneFilter: boolean;
  preferredEducationLevel: PreferredEducationLevel;
  isSavedRoute: boolean;
}) {
  const supportedLocale = locale as SupportedLocale;
  const durationLabel = getDurationLabel(
    row.program.duration_years,
    supportedLocale
  );

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <span
              className={
                row.fitBand === "strong"
                  ? "inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                  : "inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800"
              }
            >
              {row.fitBand === "strong"
                ? "Strong study option"
                : "Broader study option"}
            </span>

            <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
              {getEducationRouteTypeLabel(
                row.decisionSupport.routeType,
                supportedLocale
              )}
            </span>

            <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
              {getEducationDecisionRoleLabel(
                row.decisionSupport.decisionRole,
                supportedLocale
              )}
            </span>

            <span
              className={
                row.decisionSupport.locationState === "local"
                  ? "inline-flex items-center rounded-full border border-emerald-300 bg-white px-3 py-1 text-sm text-emerald-700"
                  : "inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800"
              }
            >
              {getLocationBadgeLabel({
                state: row.decisionSupport.locationState,
                hasCommuneFilter,
              })}
            </span>

            <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
              {getEducationPreferenceBadgeLabel({
                preferenceState: row.decisionSupport.preferenceState,
                preferredEducationLevel,
                locale: supportedLocale,
              })}
            </span>

            <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
              {getEducationLevelLabel(
                row.program.education_level,
                supportedLocale
              )}
            </span>

            <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
              {getStudyModeLabel(row.program.study_mode, supportedLocale)}
            </span>

            {durationLabel ? (
              <span className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-800">
                {durationLabel}
              </span>
            ) : null}
          </div>

          <h2 className="mt-4 text-lg font-semibold text-stone-900">
            {row.program.title}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            {row.institution.name} · {row.institution.municipality_name}
          </p>

          {row.program.description ? (
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {row.program.description}
            </p>
          ) : null}

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="text-sm font-semibold text-stone-900">
                Route type
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {getRouteTypeExplanation(row.decisionSupport.routeType)}
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="text-sm font-semibold text-stone-900">
                Decision role for this child
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {getDecisionRoleExplanation(row.decisionSupport.decisionRole)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <LabelGroup
              title="Supporting interests"
              items={row.decisionSupport.supportingInterestLabels}
              emptyText="Add a few more child signals to sharpen this route."
              highlight
            />
            <LabelGroup
              title="Supporting strengths"
              items={row.decisionSupport.supportingStrengthLabels}
              emptyText="Derived strengths will appear here as the profile gets clearer."
              highlight
            />
            <LabelGroup
              title="Useful school focus"
              items={row.decisionSupport.schoolFocusLabels}
              emptyText="The programme is linked, but no school-focus tags are attached yet."
            />
            <LabelGroup
              title="Still worth developing"
              items={row.decisionSupport.developmentLabels}
              emptyText="No extra development prompts are attached yet."
            />
          </div>

          <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <div className="text-sm font-semibold text-stone-900">
              Route realism
            </div>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-600">
              <p>
                <span className="font-medium text-stone-900">
                  Education preference.
                </span>{" "}
                {getEducationPreferenceExplanation({
                  preferenceState: row.decisionSupport.preferenceState,
                  preferredEducationLevel,
                  locale: supportedLocale,
                })}
              </p>

              <p>
                <span className="font-medium text-stone-900">Location.</span>{" "}
                {getLocationExplanation({
                  locationState: row.decisionSupport.locationState,
                  hasCommuneFilter,
                  municipalityName: row.institution.municipality_name,
                })}
              </p>

              {row.note ? (
                <p>
                  <span className="font-medium text-stone-900">Route note.</span>{" "}
                  {row.note}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
          <SaveStudyRouteButton
            childId={childId}
            professionSlug={professionSlug}
            programSlug={row.program.slug}
            isSaved={isSavedRoute}
          />

          {row.institution.website_url ? (
            <a
              href={row.institution.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
            >
              Open institution page
            </a>
          ) : null}

          <Link
            href={`/${locale}/app/children/${childId}#planning-preferences`}
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
          >
            Edit planning preferences
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function ChildEducationRoutePage({
  params,
}: {
  params: Promise<{ locale: string; childId: string; slug: string }>;
}) {
  const { locale, childId, slug } = await params;
  const gate = await requireAppAccess({
    locale,
    pathname: `/${locale}/app/children/${childId}/education/${slug}`,
  });
  if (gate.readonly) {
    redirect(`/${locale}/app/family`);
  }

  const result = await getProfessionStudyOptions({
    locale,
    childId,
    professionSlug: slug,
  });

  if (result.kind === "redirect") {
    redirect(result.href);
  }

  if (result.kind === "error") {
    return (
      <LocalePageShell
        locale={locale}
        title={result.title}
        subtitle={result.subtitle}
        backHref={`/${locale}/app/children/${childId}/summary#professions-worth-exploring`}
        backLabel="Back child summary"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {result.message}
        </div>
      </LocalePageShell>
    );
  }

  if (result.kind === "no_links") {
    return (
      <LocalePageShell
        locale={locale}
        title="Study options"
        subtitle="No study programs are linked to this profession yet."
        backHref={`/${locale}/app/children/${childId}/summary#professions-worth-exploring`}
        backLabel="Back child summary"
      >
        <AppPrivateNav locale={locale} currentPath="/app/family" />

        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            No concrete programs yet
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            This profession already has a study-options route, but no concrete
            programme rows are linked yet. The next data step is to expand the
            starter education dataset.
          </p>
        </div>
      </LocalePageShell>
    );
  }

  const {
    supportedLocale,
    childId: resolvedChildId,
    professionSlug,
    childDisplayName,
    professionTitle,
    professionSummary,
    educationNotes,
    preferredEducationLevel,
    selectedMunicipalityLabels,
    hasCommuneFilter,
    previewSupport,
    filteredRows,
    savedProgramSlugs,
  } = result.data;

  const savedProgramSlugSet = new Set(savedProgramSlugs);

  return (
    <LocalePageShell
      locale={locale}
      title={`${professionTitle} study options`}
      subtitle="Decision support for concrete programs linked to this profession, using the current child profile, route type, route role, education preference, and commune filter."
      backHref={`/${locale}/app/children/${resolvedChildId}/summary#professions-worth-exploring`}
      backLabel="Back child summary"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1.2fr)]">
            <div>
              <h1 className="text-xl font-semibold text-stone-900">
                {professionTitle}
              </h1>

              {childDisplayName ? (
                <p className="mt-2 text-sm leading-relaxed text-stone-500">
                  Decision support for {childDisplayName}.
                </p>
              ) : null}

              {professionSummary ? (
                <p className="mt-3 text-sm leading-relaxed text-stone-600">
                  {professionSummary}
                </p>
              ) : null}

              {educationNotes ? (
                <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm leading-relaxed text-stone-600">
                  <div className="text-sm font-semibold text-stone-900">
                    Education notes
                  </div>
                  <p className="mt-2">{educationNotes}</p>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="text-sm font-semibold text-stone-900">
                  Current education preference
                </div>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {preferredEducationLevel === "open"
                    ? "No education level filter is set yet."
                    : getEducationLevelLabel(
                        preferredEducationLevel,
                        supportedLocale
                      )}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="text-sm font-semibold text-stone-900">
                  Selected commune filter
                </div>

                {selectedMunicipalityLabels.length === 0 ? (
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    No communes selected. Showing the full starter program set.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedMunicipalityLabels.map((label) => (
                      <span
                        key={label}
                        className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {previewSupport ? (
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="text-sm font-semibold text-stone-900">
                    Signals already supporting this profession
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      ...previewSupport.supportingInterestLabels,
                      ...previewSupport.supportingStrengthLabels,
                    ].length > 0 ? (
                      [
                        ...previewSupport.supportingInterestLabels,
                        ...previewSupport.supportingStrengthLabels,
                      ].map((label) => (
                        <span
                          key={label}
                          className="inline-flex items-center rounded-full border border-blue-300 bg-white px-3 py-1 text-sm text-blue-700"
                        >
                          {label}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm leading-relaxed text-stone-600">
                        Add more child signals to make this decision screen
                        sharper.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {filteredRows.length > 0 ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">
                {hasCommuneFilter
                  ? "Filtered study options"
                  : "Available study options"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {hasCommuneFilter
                  ? "These programmes are inside the communes selected in the child profile and are now explained through route type, route role, child signals, school focus, and education preference."
                  : "These programmes are currently linked to this profession in the starter dataset and are now explained through route type, route role, child signals, school focus, and education preference."}
              </p>
            </div>

            {filteredRows.map((row) => (
              <ProgramCard
                key={row.program.slug}
                locale={locale}
                childId={resolvedChildId}
                professionSlug={professionSlug}
                row={row}
                hasCommuneFilter={hasCommuneFilter}
                preferredEducationLevel={preferredEducationLevel}
                isSavedRoute={savedProgramSlugSet.has(row.program.slug)}
              />
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-semibold text-stone-900">
              No study options found for the selected communes
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              The current commune filter is active, but none of the linked study
              programmes are located in the selected communes.
            </p>

            <div className="mt-5">
              <Link
                href={`/${locale}/app/children/${resolvedChildId}#planning-preferences`}
                className="inline-flex items-center justify-center rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800"
              >
                Edit planning preferences
              </Link>
            </div>
          </div>
        )}
      </div>
    </LocalePageShell>
  );
}