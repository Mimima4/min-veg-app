import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import { CompetitionBadge } from "@/components/route/competition-badge";
import { getStudyRouteDetail } from "@/server/children/routes/get-study-route-detail";
import { getRouteStrategies } from "@/server/children/routes/route-strategy-rules";
import RouteStepsPanel from "../route-steps-panel";
import RouteSignalsPanel from "../route-signals-panel";
import RouteAvailableProfessionsPanel from "../route-available-professions-panel";
import AlternativeRoutesCollapsible from "../alternative-routes-collapsible";

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
        <AppPrivateNav locale={locale} currentPath="/app/route" />
      </LocalePageShell>
    );
  }

  const route = await getStudyRouteDetail({
    childId,
    routeId,
    locale,
  });

  const competitionLevel = route.header.competitionLevel;

  const strategies = getRouteStrategies(route.identity.targetProfessionSlug);
  const showStrategyBlock =
    (route.header.competitionLevel === "high" ||
      route.header.competitionLevel === "very_high") &&
    strategies.length > 0;

  const statusItems = [
    {
      label: "Fit",
      value: route.header.overallFitLabel ?? "—",
    },
    {
      label: "Education level",
      value: route.header.stageContextLabel ?? "—",
    },
    {
      label: "Realism",
      value: route.header.realismLabel ?? "—",
    },
    ...(route.header.competitionLabel
      ? [
          {
            label: "Competition",
            value: route.header.competitionLabel,
          },
        ]
      : []),
    {
      label: "Steps",
      value: String(route.header.stepsCount),
    },
    {
      label: "Warnings",
      value: String(route.header.warningsCount),
    },
  ];

  return (
    <LocalePageShell
      locale={locale}
      title={route.header.professionTitle}
      subtitle={
        route.identity.status === "saved"
          ? "Current saved route for this target profession."
          : "Current route for this target profession."
      }
      backHref={`/${locale}/app/children/${childId}/route`}
      backLabel="Back routes"
    >
      <AppPrivateNav locale={locale} currentPath="/app/route" />

      <div className="mx-auto mt-6 w-full max-w-6xl">
        <div className="grid gap-6">
          <div className="w-full rounded-2xl border border-stone-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-stone-500">Route status</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-semibold text-stone-900">
                    {route.header.professionTitle}
                  </h2>
                  <CompetitionBadge level={competitionLevel} />
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  {route.header.feasibilityLabel ?? "No feasibility summary yet."}
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {statusItems.map((item) => (
                <div key={item.label}>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <RouteStepsPanel
            childId={childId}
            routeId={routeId}
            locale={locale}
            isSavedRoute={route.identity.status === "saved"}
            steps={route.steps}
            competitionLevel={route.header.competitionLevel}
          />

          {showStrategyBlock && (
            <div className="mt-6 rounded-lg border bg-white p-4">
              <h3 className="mb-3 font-medium">How to increase your chances</h3>

              <div className="space-y-3">
                {strategies.map((s) => (
                  <div key={`${s.type}-${s.title}`} className="text-sm">
                    <div className="font-medium">{s.title}</div>
                    <div className="text-gray-600">{s.description}</div>

                    {!s.leads_to_same_profession && (
                      <div className="mt-1 text-xs text-orange-600">
                        This path does NOT lead to becoming a licensed doctor in
                        Norway
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <AlternativeRoutesCollapsible alternatives={route.alternativeRoutes} />
          <RouteSignalsPanel signals={route.signals} />
          <RouteAvailableProfessionsPanel
            locale={locale}
            availableProfessions={route.availableProfessions}
            steps={route.steps}
          />
        </div>
      </div>
    </LocalePageShell>
  );
}