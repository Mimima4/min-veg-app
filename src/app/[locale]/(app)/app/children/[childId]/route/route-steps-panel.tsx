import type { StudyRouteStep } from "@/lib/routes/route-step-types";

type Props = {
  steps: StudyRouteStep[];
};

export default function RouteStepsPanel({ steps }: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-stone-900">Route steps</h2>
      <p className="mt-2 text-sm text-stone-600">
        This path is assembled from the current saved route truth.
      </p>

      {steps.length === 0 ? (
        <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          No route steps are available yet.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.stepId}
              className="rounded-xl border border-stone-200 bg-stone-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-stone-500">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-stone-900">
                    {step.title}
                  </h3>
                  {step.subtitle ? (
                    <p className="mt-1 text-sm text-stone-600">{step.subtitle}</p>
                  ) : null}
                </div>

                <span className="inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700">
                  {step.stepType}
                </span>
              </div>

              {step.description ? (
                <p className="mt-3 text-sm text-stone-700">{step.description}</p>
              ) : null}

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">
                    Programme
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {step.programme?.title ?? "—"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">
                    Institution
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {step.institution?.title ?? "—"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">
                    Feasibility
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {step.feasibilityBadge ?? "—"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs uppercase tracking-wide text-stone-500">
                    Options
                  </dt>
                  <dd className="mt-1 text-sm text-stone-900">
                    {step.stepOptionsCount ?? "—"}
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