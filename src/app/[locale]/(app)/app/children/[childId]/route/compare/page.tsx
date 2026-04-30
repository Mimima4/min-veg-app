import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { StudyRouteReadModel, StudyRouteReadModelStep, StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import { requireAppAccess } from "@/server/billing/require-app-access";
import { getStudyRouteDetail } from "@/server/children/routes/get-study-route-detail";

type SavedRouteRow = {
  id: string;
  child_id: string;
  target_profession_id: string;
  status: string;
  updated_at: string;
  archived_at: string | null;
};

type ProfessionRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
};

function isProgrammeSelectionStep(
  step: StudyRouteReadModelStep
): step is Extract<StudyRouteSnapshotStep, { type: "programme_selection" }> {
  return (
    typeof step === "object" &&
    step !== null &&
    "type" in step &&
    step.type === "programme_selection"
  );
}

function getPrimaryProgrammeStep(detail: StudyRouteReadModel) {
  return detail.steps.find((step) => isProgrammeSelectionStep(step)) ?? null;
}

function getSchool(step: Extract<StudyRouteSnapshotStep, { type: "programme_selection" }> | null) {
  return step?.institution_name ?? "—";
}

function getLocation(
  step: Extract<StudyRouteSnapshotStep, { type: "programme_selection" }> | null
) {
  return step?.institution_municipality ?? step?.institution_city ?? "—";
}

function isSnapshotStep(step: StudyRouteReadModelStep): step is StudyRouteSnapshotStep {
  return (
    typeof step === "object" &&
    step !== null &&
    "type" in step &&
    (step.type === "programme_selection" ||
      step.type === "apprenticeship_step" ||
      step.type === "progression_step" ||
      step.type === "outcome_step")
  );
}

function humanizeStepType(type: StudyRouteSnapshotStep["type"]): string {
  switch (type) {
    case "programme_selection":
      return "Programme step";
    case "apprenticeship_step":
      return "Apprenticeship";
    case "progression_step":
      return "Progression";
    case "outcome_step":
      return "Outcome";
    default:
      return type;
  }
}

function getStepTitle(step: StudyRouteReadModelStep): string {
  if ("title" in step && typeof step.title === "string" && step.title.trim().length > 0) {
    return step.title;
  }
  if (
    "program_title" in step &&
    typeof step.program_title === "string" &&
    step.program_title.trim().length > 0
  ) {
    return step.program_title;
  }
  if ("program_slug" in step && typeof step.program_slug === "string" && step.program_slug.length > 0) {
    return step.program_slug;
  }
  return "Route step";
}

export default async function SavedRouteComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; childId: string }>;
  searchParams: Promise<{ ids?: string | string[] }>;
}) {
  const { locale, childId } = await params;
  await requireAppAccess({
    locale,
    pathname: `/${locale}/app/children/${childId}/route/compare`,
  });

  const resolvedSearchParams = await searchParams;
  const idsParam = Array.isArray(resolvedSearchParams.ids)
    ? resolvedSearchParams.ids[0]
    : resolvedSearchParams.ids ?? "";

  const requestedIds = idsParam
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (requestedIds.length < 2) {
    redirect(`/${locale}/app/children/${childId}#saved-study-routes`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: routes, error: routesError } = await supabase
    .from("study_routes")
    .select("id, child_id, target_profession_id, status, updated_at, archived_at")
    .eq("child_id", childId)
    .in("id", requestedIds)
    .eq("status", "saved")
    .is("archived_at", null);

  if (routesError) {
    throw new Error(`Failed to load saved routes for compare: ${routesError.message}`);
  }

  const typedRoutes = (routes ?? []) as SavedRouteRow[];
  if (typedRoutes.length < 2) {
    redirect(`/${locale}/app/children/${childId}#saved-study-routes`);
  }

  const professionIds = Array.from(
    new Set(typedRoutes.map((route) => route.target_profession_id))
  );
  const { data: professions, error: professionsError } = await supabase
    .from("professions")
    .select("id, slug, title_i18n")
    .in("id", professionIds)
    .eq("is_active", true);

  if (professionsError) {
    throw new Error(
      `Failed to load target professions for route compare: ${professionsError.message}`
    );
  }

  const professionMap = new Map(
    ((professions ?? []) as ProfessionRow[]).map((profession) => [
      profession.id,
      profession,
    ])
  );

  const orderedRoutes = requestedIds
    .map((id) => typedRoutes.find((route) => route.id === id))
    .filter((item): item is SavedRouteRow => Boolean(item));

  const routeDetails = await Promise.all(
    orderedRoutes.map(async (route) => {
      const detail = await getStudyRouteDetail({
        childId,
        routeId: route.id,
        locale,
        supabase,
      });
      return {
        route,
        detail,
      };
    })
  );

  return (
    <LocalePageShell
      locale={locale}
      title="Compare saved routes"
      subtitle="Review selected saved routes side by side."
      backHref={`/${locale}/app/children/${childId}#saved-study-routes`}
      backLabel="Back to saved study routes"
    >
      <AppPrivateNav locale={locale} currentPath="/app/family" />

      <div className="mt-6 space-y-6">
        {routeDetails.map(({ route, detail }) => {
          const profession = professionMap.get(route.target_profession_id);
          const professionTitle = profession
            ? getLocalizedValue(profession.title_i18n ?? {}, locale as SupportedLocale) ||
              profession.slug
            : "Unknown profession";
          const primaryProgrammeStep = getPrimaryProgrammeStep(detail);
          const routeSteps = detail.steps;

          return (
            <div key={route.id} className="rounded-2xl border border-stone-200 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-stone-900">{professionTitle}</h2>
                  <p className="mt-2 text-sm text-stone-700">
                    City / kommune: {getLocation(primaryProgrammeStep)}
                  </p>
                </div>

                <Link
                  href={`/${locale}/app/children/${childId}/route/${route.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                >
                  Open full route
                </Link>
              </div>
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-stone-900">Route steps</h3>
                {routeSteps.length === 0 ? (
                  <div className="mt-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600">
                    —
                  </div>
                ) : (
                  <div className="mt-3 overflow-x-auto pb-2">
                    <div className="flex min-w-max items-start gap-3">
                      {routeSteps.map((step, index) => {
                        const snapshotStep = isSnapshotStep(step) ? step : null;
                        const schoolName = snapshotStep?.institution_name ?? null;
                        const location =
                          snapshotStep?.institution_municipality ??
                          snapshotStep?.institution_city ??
                          null;
                        const duration =
                          snapshotStep && "duration_label" in snapshotStep
                            ? (snapshotStep.duration_label ?? null)
                            : null;
                        const website =
                          snapshotStep && "institution_website" in snapshotStep
                            ? (snapshotStep.institution_website ?? null)
                            : null;
                        const apprenticeshipOptionTitle =
                          snapshotStep?.type === "apprenticeship_step" &&
                          Array.isArray(snapshotStep.apprenticeship_options) &&
                          snapshotStep.apprenticeship_options[0]
                            ? snapshotStep.apprenticeship_options[0].option_title
                            : null;

                        return (
                          <div key={`${route.id}-step-${index}`} className="flex items-start gap-3">
                            <div className="w-[320px] shrink-0 rounded-xl border border-stone-200 bg-stone-50 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4 className="text-xl font-semibold text-stone-900">
                                    {getStepTitle(step)}
                                  </h4>
                                  {schoolName ? (
                                    <p className="mt-2 text-base text-stone-700">{schoolName}</p>
                                  ) : null}
                                  {apprenticeshipOptionTitle ? (
                                    <p className="mt-1 text-sm text-stone-600">
                                      {apprenticeshipOptionTitle}
                                    </p>
                                  ) : null}
                                  <div className="mt-3 space-y-1 text-sm text-stone-600">
                                    {location ? <div>{location}</div> : null}
                                    {duration ? <div>Duration: {duration}</div> : null}
                                    {website ? (
                                      <a
                                        href={website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex text-sm text-blue-600 hover:underline"
                                      >
                                        Visit school website
                                      </a>
                                    ) : null}
                                  </div>
                                </div>
                                {snapshotStep ? (
                                  <span className="inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700">
                                    {humanizeStepType(snapshotStep.type)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                            {index < routeSteps.length - 1 ? (
                              <div className="mt-16 shrink-0 text-xl text-stone-400">→</div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </LocalePageShell>
  );
}
