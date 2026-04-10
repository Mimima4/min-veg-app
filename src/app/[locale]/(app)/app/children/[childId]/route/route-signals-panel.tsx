import type { StudyRouteSignals } from "@/lib/routes/route-signal-types";

type Props = {
  signals: StudyRouteSignals;
};

export default function RouteSignalsPanel({ signals }: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">Route signals</h2>
      <p className="mt-2 text-sm text-stone-600">
        Signals are derived from the current route context and stored evidence.
      </p>

      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">Fit</dt>
          <dd className="mt-1 text-sm text-stone-900">
            {signals.fitSummary ?? "—"}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">
            Confidence
          </dt>
          <dd className="mt-1 text-sm text-stone-900">
            {signals.confidenceSummary ?? "—"}
          </dd>
        </div>

        <div>
          <dt className="text-xs uppercase tracking-wide text-stone-500">
            Feasibility
          </dt>
          <dd className="mt-1 text-sm text-stone-900">
            {signals.feasibilitySummary ?? "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <h3 className="text-sm font-semibold text-stone-900">Warnings</h3>

          {signals.warnings.length === 0 ? (
            <p className="mt-2 text-sm text-stone-600">No active warnings.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {signals.warnings.map((warning) => (
                <div
                  key={warning.code}
                  className="rounded-lg border border-amber-200 bg-amber-50 p-3"
                >
                  <p className="text-sm font-medium text-amber-900">
                    {warning.label}
                  </p>
                  {warning.description ? (
                    <p className="mt-1 text-sm text-amber-800">
                      {warning.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
          <h3 className="text-sm font-semibold text-stone-900">
            Improvement guidance
          </h3>

          {signals.improvementGuidance.length === 0 ? (
            <p className="mt-2 text-sm text-stone-600">
              No additional guidance is available yet.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {signals.improvementGuidance.map((item) => (
                <div
                  key={item.code}
                  className="rounded-lg border border-stone-200 bg-white p-3"
                >
                  <p className="text-sm font-medium text-stone-900">
                    {item.label}
                  </p>
                  {item.description ? (
                    <p className="mt-1 text-sm text-stone-700">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}