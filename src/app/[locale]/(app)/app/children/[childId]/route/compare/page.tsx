import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
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

      <div className="grid gap-4 xl:grid-cols-3">
        {routeDetails.map(({ route, detail }) => {
          const profession = professionMap.get(route.target_profession_id);
          const professionTitle = profession
            ? getLocalizedValue(profession.title_i18n ?? {}, locale as SupportedLocale) ||
              profession.slug
            : "Unknown profession";
          const routeSteps = detail.steps.slice(0, 4);
          const remainingStepsCount = Math.max(detail.steps.length - routeSteps.length, 0);
          const warnings = detail.signals.warnings.slice(0, 3);
          const guidance = detail.signals.improvementGuidance.slice(0, 3);

          return (
            <div
              key={route.id}
              className="rounded-2xl border border-stone-200 bg-white p-6"
            >
              <h2 className="text-lg font-semibold text-stone-900">{professionTitle}</h2>
              <p className="mt-2 text-sm text-stone-600">Status: {detail.identity.status}</p>
              <p className="mt-1 text-xs text-stone-500">
                Updated: {new Date(route.updated_at).toLocaleString()}
              </p>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">Fit</dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {detail.header.overallFitLabel ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">
                    Feasibility
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {detail.header.feasibilityLabel ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">
                    Warnings
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {detail.header.warningsCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">Steps</dt>
                  <dd className="mt-1 text-sm text-stone-900">{detail.header.stepsCount}</dd>
                </div>
              </dl>

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-stone-900">Route steps</h3>
                <ol className="mt-2 space-y-2">
                  {routeSteps.map((step, index) => (
                    <li
                      key={`${route.id}-${index}`}
                      className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700"
                    >
                      {step.title}
                    </li>
                  ))}
                </ol>
                {remainingStepsCount > 0 ? (
                  <p className="mt-2 text-xs text-stone-500">
                    +{remainingStepsCount} more steps
                  </p>
                ) : null}
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-stone-900">Key signals</h3>
                {detail.signals.feasibilitySummary ? (
                  <p className="mt-2 text-sm text-stone-700">
                    {detail.signals.feasibilitySummary}
                  </p>
                ) : null}
                {detail.signals.confidenceSummary ? (
                  <p className="mt-2 text-sm text-stone-700">
                    {detail.signals.confidenceSummary}
                  </p>
                ) : null}
                {warnings.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {warnings.map((warning) => (
                      <li
                        key={`${route.id}-${warning.code}`}
                        className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                      >
                        {warning.label}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {guidance.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {guidance.map((item) => (
                      <li
                        key={`${route.id}-${item.code}`}
                        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800"
                      >
                        {item.label}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href={`/${locale}/app/children/${childId}/route/${route.id}`}
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-900 transition hover:border-stone-400"
                >
                  Open full route
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </LocalePageShell>
  );
}
