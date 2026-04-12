import Link from "next/link";
import { LocalePageShell } from "@/components/layout/locale-page-shell";
import AppPrivateNav from "@/components/layout/app-private-nav";
import { getFamilyPageData } from "@/server/family/overview/get-family-page-data";
import { getFamilyRoutesSummary } from "@/server/children/routes/get-family-routes-summary";

function getStatusBadge(status: "empty" | "healthy" | "attention") {
  switch (status) {
    case "empty":
      return {
        label: "No routes yet",
        className:
          "border border-stone-300 bg-stone-50 text-stone-700",
      };
    case "attention":
      return {
        label: "Needs attention",
        className:
          "border border-amber-300 bg-amber-50 text-amber-800",
      };
    default:
      return {
        label: "Healthy",
        className:
          "border border-emerald-300 bg-emerald-50 text-emerald-800",
      };
  }
}

export default async function RouteHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const familyResult = await getFamilyPageData({ locale });

  if (familyResult.kind === "redirect") {
    return (
      <LocalePageShell
        locale={locale}
        title="Route"
        subtitle="Redirecting to the correct access path."
      >
        <AppPrivateNav locale={locale} currentPath="/app/route" />
        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-700">
          Open the correct app entry from your account flow.
        </div>
      </LocalePageShell>
    );
  }

  if (familyResult.kind === "error") {
    return (
      <LocalePageShell
        locale={locale}
        title={familyResult.title}
        subtitle={familyResult.subtitle}
      >
        <AppPrivateNav locale={locale} currentPath="/app/route" />
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {familyResult.message}
        </div>
      </LocalePageShell>
    );
  }

  if (familyResult.kind === "no_family") {
    return (
      <LocalePageShell
        locale={locale}
        title="Route"
        subtitle="Create a family account first to start working with child routes."
      >
        <AppPrivateNav locale={locale} currentPath="/app/route" />

        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <p className="text-sm text-stone-700">
            Route is a top-level section, but it still works through your family and
            child contours. Create a family account first.
          </p>

          <Link
            href={`/${locale}/app/family`}
            className="mt-4 inline-flex items-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Open family
          </Link>
        </div>
      </LocalePageShell>
    );
  }

  const summary = await getFamilyRoutesSummary({
    locale,
    familyAccountId: familyResult.data.familyAccount.id,
  });

  return (
    <LocalePageShell
      locale={locale}
      title="Route"
      subtitle="Route is a dedicated top-level section. Open a child-specific route contour from here."
    >
      <AppPrivateNav locale={locale} currentPath="/app/route" />

      {summary.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            No child profiles yet
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Create a child profile first. Route stays child-scoped, but it is entered
            through this top-level section.
          </p>

          <Link
            href={`/${locale}/app/children/create`}
            className="mt-4 inline-flex items-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
          >
            Create child
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {summary.map((child) => {
            const badge = getStatusBadge(child.status);

            return (
              <div
                key={child.childId}
                className="rounded-2xl border border-stone-200 bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-stone-500">Child</p>
                    <h2 className="mt-1 text-lg font-semibold text-stone-900">
                      {child.displayName}
                    </h2>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700">
                        {child.schoolStageLabel}
                      </span>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs font-medium",
                          badge.className,
                        ].join(" ")}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/${locale}/app/children/${child.childId}/route`}
                    className="inline-flex items-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
                  >
                    Open child routes
                  </Link>
                </div>

                <dl className="mt-5 grid gap-3 sm:grid-cols-4">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-stone-500">
                      Routes
                    </dt>
                    <dd className="mt-1 text-sm text-stone-900">
                      {child.routeCount}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs uppercase tracking-wide text-stone-500">
                      Warnings
                    </dt>
                    <dd className="mt-1 text-sm text-stone-900">
                      {child.warningsCount}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs uppercase tracking-wide text-stone-500">
                      New route
                    </dt>
                    <dd className="mt-1 text-sm text-stone-900">
                      {child.hasNewRouteAvailable ? "Available" : "No"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs uppercase tracking-wide text-stone-500">
                      Updated
                    </dt>
                    <dd className="mt-1 text-sm text-stone-900">
                      {child.latestRouteUpdatedAt
                        ? new Date(child.latestRouteUpdatedAt).toLocaleString()
                        : "—"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-wide text-stone-500">
                    Target professions
                  </p>

                  {child.targetProfessionTitles.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {child.targetProfessionTitles.slice(0, 4).map((title) => (
                        <span
                          key={title}
                          className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700"
                        >
                          {title}
                        </span>
                      ))}
                      {child.targetProfessionTitles.length > 4 ? (
                        <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-700">
                          +{child.targetProfessionTitles.length - 4} more
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-stone-600">
                      No target professions saved through route yet.
                    </p>
                  )}
                </div>

                {child.status === "attention" ? (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Review this child’s route contour. There are warnings or a newer
                    route version available.
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </LocalePageShell>
  );
}