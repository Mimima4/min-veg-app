import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import { getStudyRouteDetail } from "@/server/children/routes/get-study-route-detail";
import RouteStepsPanel from "../route-steps-panel";
import RouteSignalsPanel from "../route-signals-panel";
import RouteAvailableProfessionsPanel from "../route-available-professions-panel";
import RouteAlternativesPanel from "../route-alternatives-panel";

export default async function StudyRouteDetailPage({
  params,
}: {
  params: Promise<{ locale: string; childId: string; routeId: string }>;
}) {
  const { locale, childId, routeId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <LocalePageShell
        locale={locale}
        title="Route"
        subtitle="You need to sign in to view this route."
      >
        <AppPrivateNav locale={locale} currentPath="/app/children" />
      </LocalePageShell>
    );
  }

  const route = await getStudyRouteDetail({
    childId,
    routeId,
    locale,
  });

  return (
    <LocalePageShell
      locale={locale}
      title={route.header.professionTitle}
      subtitle="Current saved route for this target profession."
      backHref={`/${locale}/app/children/${childId}/route`}
      backLabel="Back routes"
    >
      <AppPrivateNav locale={locale} currentPath="/app/children" />

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">Route status</p>
            <h2 className="mt-1 text-xl font-semibold text-stone-900">
              {route.header.routeLabel}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              {route.header.feasibilityLabel ?? "No feasibility summary yet."}
            </p>
          </div>

          <span className="inline-flex rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
            {route.identity.status}
          </span>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-stone-500">
              Fit
            </dt>
            <dd className="mt-1 text-sm text-stone-900">
              {route.header.overallFitLabel ?? "—"}
            </dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-wide text-stone-500">
              Realism
            </dt>
            <dd className="mt-1 text-sm text-stone-900">
              {route.header.realismLabel ?? "—"}
            </dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-wide text-stone-500">
              Steps
            </dt>
            <dd className="mt-1 text-sm text-stone-900">
              {route.header.stepsCount}
            </dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-wide text-stone-500">
              Warnings
            </dt>
            <dd className="mt-1 text-sm text-stone-900">
              {route.header.warningsCount}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 grid gap-6">
        <RouteStepsPanel steps={route.steps} />
        <RouteSignalsPanel signals={route.signals} />
        <RouteAvailableProfessionsPanel
          locale={locale}
          availableProfessions={route.availableProfessions}
        />
        <RouteAlternativesPanel alternatives={route.alternativeRoutes} />
      </div>
    </LocalePageShell>
  );
}