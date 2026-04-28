import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import RouteOverviewCard from "./route-overview-card";
import { requireAppAccess } from "@/server/billing/require-app-access";
import { createInitialStudyRoute } from "@/server/children/routes/create-initial-study-route";
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

  let overview = await getChildStudyRoutesOverview({
    childId,
    locale,
    childDisplayName: child.displayName,
  });

  const supabase = await createClient();
  const { data: savedProfessionLinks, error: savedProfessionLinksError } = await supabase
    .from("child_profession_interests")
    .select("profession_id")
    .eq("child_profile_id", childId);

  if (savedProfessionLinksError) {
    throw new Error(
      `Failed to load saved profession targets for working routes: ${savedProfessionLinksError.message}`
    );
  }

  const savedProfessionIds = Array.from(
    new Set(
      (savedProfessionLinks ?? [])
        .map((row) => row.profession_id)
        .filter((value): value is string => Boolean(value))
    )
  );
  const workingOverviewProfessionIds = new Set(
    overview.routes
      .map((route) => route.professionId)
      .filter((value): value is string => Boolean(value))
  );
  const missingWorkingRouteProfessionIds = savedProfessionIds.filter(
    (professionId) => !workingOverviewProfessionIds.has(professionId)
  );

  if (missingWorkingRouteProfessionIds.length > 0) {
    await Promise.all(
      missingWorkingRouteProfessionIds.map(async (targetProfessionId) => {
        try {
          await createInitialStudyRoute({
            childId,
            targetProfessionId,
            locale,
            createdByType: "system",
            createdByUserId: null,
          });
        } catch {
          // Keep child Route page resilient: one failed target
          // must not block materialization for other saved professions.
        }
      })
    );

    overview = await getChildStudyRoutesOverview({
      childId,
      locale,
      childDisplayName: child.displayName,
    });
  }

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
          <h3 className="text-lg font-semibold text-stone-900">No working routes yet</h3>
          <p className="mt-2 text-sm text-stone-600">
            Route main entry shows only active working routes. Saved routes stay in
            the profile storage section until a new working route is opened.
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
