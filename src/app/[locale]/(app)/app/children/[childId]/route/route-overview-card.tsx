import Link from "next/link";
import { CompetitionBadge } from "@/components/route/competition-badge";
import type { ChildStudyRouteOverviewItem } from "@/lib/routes/route-types";

type Props = {
  locale: string;
  childId: string;
  route: ChildStudyRouteOverviewItem;
};

export default function RouteOverviewCard({ locale, childId, route }: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-stone-500">Target profession</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-stone-900">
              {route.professionTitle}
            </h3>
            <CompetitionBadge level={route.competitionLevel} />
          </div>
        </div>

        <span className="inline-flex rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">
          {route.status}
        </span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">
            Fit
          </dt>
          <dd className="mt-1 text-sm text-stone-900">
            {route.overallFitLabel ?? "—"}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">
            Feasibility
          </dt>
          <dd className="mt-1 text-sm text-stone-900">
            {route.feasibilityLabel ?? "—"}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">
            Warnings
          </dt>
          <dd className="mt-1 text-sm text-stone-900">
            {route.warningsCount}
          </dd>
        </div>
      </dl>

      {route.newRouteAvailable ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          A new route version is available for review.
        </div>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-xs text-stone-500">
          Updated: {new Date(route.updatedAt).toLocaleString()}
        </p>

        <Link
          href={`/${locale}/app/children/${childId}/route/${route.routeId}`}
          className="inline-flex items-center rounded-xl bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700"
        >
          Open route
        </Link>
      </div>
    </div>
  );
}