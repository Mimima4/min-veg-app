import { CompetitionBadge } from "@/components/route/competition-badge";
import type {
  StudyRouteCompetitionLevel,
  StudyRouteReadModelStep,
  StudyRouteSnapshotStep,
} from "@/lib/routes/route-types";
import type { StudyRouteStep } from "@/lib/routes/route-step-types";
import { getRouteRequirementsRule } from "@/server/children/routes/route-requirements-rules";
import SaveRouteButton from "./[routeId]/save-route-button";

function isRouteSnapshotPayloadStep(
  step: StudyRouteReadModelStep
): step is StudyRouteSnapshotStep {
  return (
    typeof step === "object" &&
    step !== null &&
    "type" in step &&
    (step.type === "programme_selection" ||
      step.type === "progression_step" ||
      step.type === "outcome_step")
  );
}

type Props = {
  childId: string;
  routeId: string;
  locale: string;
  isSavedRoute: boolean;
  steps: StudyRouteReadModelStep[];
  competitionLevel?: StudyRouteCompetitionLevel;
};

export default function RouteStepsPanel({
  childId,
  routeId,
  locale,
  isSavedRoute,
  steps,
  competitionLevel,
}: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-900">Route steps</h2>
        <SaveRouteButton
          childId={childId}
          routeId={routeId}
          locale={locale}
          isSaved={isSavedRoute}
        />
      </div>
      <p className="mt-2 text-sm text-stone-600">
        This path is assembled from the current route truth.
      </p>

      {steps.length === 0 ? (
        <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          No route steps are available yet.
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {steps.map((step, index) => {
            if (isRouteSnapshotPayloadStep(step)) {
              const showCompetitionBadge =
                competitionLevel === "very_high" &&
                step.type === "programme_selection";

              const requirementsRule = getRouteRequirementsRule(
                step.current_profession_slug
              );

              const competitionTooltipItems =
                showCompetitionBadge &&
                requirementsRule &&
                (!requirementsRule.programmeStepOnly ||
                  step.type === "programme_selection")
                  ? requirementsRule.items
                  : undefined;

              return (
                <div
                  key={`snap-${index}-${step.type}-${step.program_slug ?? "none"}`}
                  className="rounded-xl border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-stone-500">
                        Step {index + 1}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-semibold text-stone-900">
                          {step.title}
                        </h4>
                        {showCompetitionBadge && competitionLevel ? (
                          <CompetitionBadge
                            level={competitionLevel}
                            tooltipItems={competitionTooltipItems}
                          />
                        ) : null}
                      </div>
                    </div>

                    <span className="inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700">
                      {step.type}
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-stone-500">
                        Programme
                      </dt>
                      <dd className="mt-1 text-sm text-stone-900">
                        {step.program_slug ?? "—"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs uppercase tracking-wide text-stone-500">
                        Institution
                      </dt>
                      <dd className="mt-1 text-sm text-stone-900">
                        {step.institution_name ?? "—"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs uppercase tracking-wide text-stone-500">
                        Education level
                      </dt>
                      <dd className="mt-1 text-sm text-stone-900">
                        {step.education_level || "—"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs uppercase tracking-wide text-stone-500">
                        Fit band
                      </dt>
                      <dd className="mt-1 text-sm text-stone-900">
                        {step.fit_band}
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            }

            const legacy = step as StudyRouteStep;
            return (
              <div
                key={legacy.stepId}
                className="rounded-xl border border-stone-200 bg-stone-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-stone-500">
                      Step {index + 1}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-stone-900">
                      {legacy.title}
                    </h3>
                    {legacy.subtitle ? (
                      <p className="mt-1 text-sm text-stone-600">{legacy.subtitle}</p>
                    ) : null}
                  </div>

                  <span className="inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700">
                    {legacy.stepType}
                  </span>
                </div>

                {legacy.description ? (
                  <p className="mt-3 text-sm text-stone-700">{legacy.description}</p>
                ) : null}

                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-stone-500">
                      Programme
                    </dt>
                    <dd className="mt-1 text-sm text-stone-900">
                      {legacy.programme?.title ?? "—"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs uppercase tracking-wide text-stone-500">
                      Institution
                    </dt>
                    <dd className="mt-1 text-sm text-stone-900">
                      {legacy.institution?.title ?? "—"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs uppercase tracking-wide text-stone-500">
                      Feasibility
                    </dt>
                    <dd className="mt-1 text-sm text-stone-900">
                      {legacy.feasibilityBadge ?? "—"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs uppercase tracking-wide text-stone-500">
                      Options
                    </dt>
                    <dd className="mt-1 text-sm text-stone-900">
                      {legacy.stepOptionsCount ?? "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
