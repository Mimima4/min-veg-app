import Link from "next/link";
import type { StudyRouteAvailableProfessionsBlock } from "@/lib/routes/route-types";

type Props = {
  locale: string;
  availableProfessions: StudyRouteAvailableProfessionsBlock;
};

export default function RouteAvailableProfessionsPanel({
  locale,
  availableProfessions,
}: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">
        Available professions
      </h2>
      <p className="mt-2 text-sm text-stone-600">
        These professions become reachable via the currently selected route.
      </p>

      {availableProfessions.items.length === 0 ? (
        <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <h3 className="text-sm font-semibold text-stone-900">
            {availableProfessions.emptyState?.title ??
              "No additional professions can be shown yet"}
          </h3>
          <p className="mt-2 text-sm text-stone-600">
            {availableProfessions.emptyState?.message ??
              "Adjust route inputs or selected filters to expand available professions"}
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {availableProfessions.items.map((profession) => (
            <div
              key={profession.professionId}
              className="rounded-xl border border-stone-200 bg-stone-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-stone-900">
                    {profession.title}
                  </h3>
                  {profession.whyOpenedLabel ? (
                    <p className="mt-1 text-sm text-stone-600">
                      {profession.whyOpenedLabel}
                    </p>
                  ) : null}
                  {profession.similarityLabel ? (
                    <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">
                      {profession.similarityLabel}
                    </p>
                  ) : null}
                </div>

                <Link
                  href={`/${locale}/app/professions/${profession.slug}`}
                  className="inline-flex items-center rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-100"
                >
                  Open profession
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}