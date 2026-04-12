import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import RouteOverviewCard from "./route-overview-card";
import { requireAppAccess } from "@/server/billing/require-app-access";
import { getChildStudyRoutesOverview } from "@/server/children/routes/get-child-study-routes-overview";
import { getFamilyPageData } from "@/server/family/overview/get-family-page-data";

export default async function ChildRouteOverviewPage({
  params,
}: {
  params: Promise<{ locale: string; childId: string }>;
}) {
  const { locale, childId } = await params;

  await requireAppAccess({
    locale,
    pathname: `/${locale}/app/children/${childId}/route`,
  });

  const familyResult = await getFamilyPageData({ locale });

  if (familyResult.kind === "redirect") {
    redirect(familyResult.href);
  }

  if (familyResult.kind === "error") {
    return (
      <LocalePageShell
        locale={locale}
        title={familyResult.title}
        subtitle={familyResult.subtitle}
        backHref={`/${locale}/app/route`}
        backLabel="Back to route"
      >
        <AppPrivateNav locale={locale} currentPath="/app/route" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {familyResult.message}
        </div>
      </LocalePageShell>
    );
  }

  if (familyResult.kind === "no_family") {
    redirect(`/${locale}/app/family`);
  }

  const child = familyResult.data.children.find((item) => item.id === childId);

  if (!child) {
    notFound();
  }

  const overview = await getChildStudyRoutesOverview({
    childId,
    locale,
    childDisplayName: child.displayName,
  });

  return (
    <LocalePageShell
      locale={locale}
      title={`${child.displayName} — Route`}
      subtitle="Saved routes for this child. Route stays cld-scoped, but it is reached from the top-level Route section."
      backHref={`/${locale}/app/route`}
      backLabel="Back to route"
    >
      <AppPrivateNav locale={locale} currentPath="/app/route" />

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">Child route contour</p>
            <h2 className="mt-1 text-xl font-semibold text-stone-900">
              {child.displayName}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              School stage: {child.schoolStageLabel}
            </p>
          </div>

          <Link
            href={child.profileHref}
            className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
          >
            Open child profile
          </Link>
        </div>
      </div>

      {overview.routes.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <h3 className="text-lg font-semibold text-stone-900">No saved routes yet</h3>
          <p className="mt-2 text-sm text-stone-600">
            Route is target-driven. Save a profession first, then build or open the
            route for that target.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/${locale}/app/children/${childId}/matches`}
              className="inline-flex items-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
            >
              Open professions
            </Link>

            <Link
              href={`/${locale}/app/route`}
              className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
            >
              Back to route hub
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {overview.routes.map((route) => (
            <RouteOverviewCard
              key={route.routeId}
              locale={locale}
              childId={childId}
              route={route}
            />
          ))}
        </div>
      )}
    </LocalePageShell>
  );
}
