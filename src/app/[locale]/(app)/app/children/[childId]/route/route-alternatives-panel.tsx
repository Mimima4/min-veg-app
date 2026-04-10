import type { StudyRouteAlternativeTeaser } from "@/lib/routes/route-types";

type Props = {
  alternatives: StudyRouteAlternativeTeaser[];
};

export default function RouteAlternativesPanel({ alternatives }: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">
        Alternative routes
      </h2>
      <p className="mt-2 text-sm text-stone-600">
        Alternative route variants for the same target profession.
      </p>

      {alternatives.length === 0 ? (
        <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          No alternative route variants are available yet.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {alternatives.map((variant) => (
            <div
              key={variant.variantId}
              className="rounded-xl border border-stone-200 bg-stone-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-stone-900">
                    {variant.label}
                  </h3>
                  {variant.mainDifference ? (
                    <p className="mt-1 text-sm text-stone-600">
                      {variant.mainDifference}
                    </p>
                  ) : null}
                </div>

                <span className="inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700">
                  {variant.isCurrent ? "Current" : variant.variantStatus ?? "Variant"}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">
                    Changed steps
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {variant.changedStepsCount ?? "—"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">
                    Realism
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {variant.realismDelta ?? "—"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">
                    Risk
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {variant.riskDelta ?? "—"}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}