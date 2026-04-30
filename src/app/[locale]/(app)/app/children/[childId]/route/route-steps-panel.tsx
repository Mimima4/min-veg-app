"use client";

import { useEffect, useRef, useState } from "react";
import { CompetitionBadge } from "@/components/route/competition-badge";
import type {
  StudyRouteCompetitionLevel,
  StudyRouteReadModelStep,
  StudyRouteSnapshotStep,
} from "@/lib/routes/route-types";
import type { StudyRouteStep } from "@/lib/routes/route-step-types";
import SaveRouteButton from "./[routeId]/save-route-button";

function isRouteSnapshotPayloadStep(
  step: StudyRouteReadModelStep
): step is StudyRouteSnapshotStep {
  return (
    typeof step === "object" &&
    step !== null &&
    "type" in step &&
    (step.type === "programme_selection" ||
      step.type === "apprenticeship_step" ||
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
  savedSelectionSignatures?: string[];
};

function humanizeStepType(type: StudyRouteSnapshotStep["type"]): string {
  switch (type) {
    case "programme_selection":
      return "Programme step";
    case "progression_step":
      return "Progression";
    case "apprenticeship_step":
      return "Apprenticeship";
    case "outcome_step":
      return "Outcome";
    default:
      return type;
  }
}

function normalizeJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonValue(item));
  }
  if (value && typeof value === "object") {
    const sortedEntries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nestedValue]) => [key, normalizeJsonValue(nestedValue)]);
    return Object.fromEntries(sortedEntries);
  }
  return value;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(normalizeJsonValue(value));
}

export default function RouteStepsPanel({
  childId,
  routeId,
  locale,
  isSavedRoute,
  steps,
  competitionLevel,
  savedSelectionSignatures = [],
}: Props) {
  const [selectedOptionByStep, setSelectedOptionByStep] = useState<Record<string, string>>({});
  const [openStepKey, setOpenStepKey] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const stepRefByKey = useRef<Record<string, HTMLDivElement | null>>({});
  type StepOption = {
    id: string;
    schoolName: string;
    location: string | null;
    website: string | null;
    programTitle: string | null | undefined;
    displayTitle: string | null | undefined;
    durationLabel: string | null;
    fromPayload: boolean;
    meta: string | null;
  };

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current) return;
      if (!openStepKey) return;
      const openStepElement = stepRefByKey.current[openStepKey];
      if (openStepElement && openStepElement.contains(event.target as Node)) {
        return;
      }
      setOpenStepKey(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [openStepKey]);

  const buildStepOptions = (step: StudyRouteSnapshotStep) => {
    if (step.type === "programme_selection") {
      const mapped = (step.options ?? []).map((option, index) => ({
        id: `programme-${option.institution_id ?? index}`,
        schoolName: option.institution_name ?? "Unknown school",
        location: option.institution_city ?? option.institution_municipality ?? null,
        website: option.institution_website ?? null,
        programTitle: option.program_title ?? step.program_title ?? step.title,
        displayTitle: option.display_title ?? option.program_title ?? step.program_title ?? step.title,
        durationLabel: option.duration_label ?? step.duration_label ?? null,
        fromPayload: true,
        meta: option.verification_status,
      }));
      if (mapped.length > 0) return mapped;
      return [
        {
          id: "programme-current",
          schoolName: step.institution_name ?? "Unknown school",
          location: step.institution_city ?? step.institution_municipality ?? null,
          website: step.institution_website ?? null,
          programTitle: step.program_title ?? step.title,
          displayTitle: step.program_title ?? step.title,
          durationLabel: step.duration_label ?? null,
          fromPayload: false,
          meta: null,
        },
      ];
    }

    if (step.type === "apprenticeship_step") {
      const mapped = (step.apprenticeship_options ?? []).map((option) => ({
        id: option.option_id,
        schoolName: option.option_title,
        location: step.institution_city ?? step.institution_municipality ?? null,
        website: step.institution_website ?? null,
        programTitle: step.program_title ?? step.title,
        displayTitle: step.program_title ?? step.title,
        durationLabel: step.duration_label ?? null,
        fromPayload: true,
        meta:
          option.outcome_profession_ids.length > 0
            ? `${option.outcome_profession_ids.length} outcomes`
            : null,
      }));
      if (mapped.length > 0) return mapped;
      return [
        {
          id: "apprenticeship-current",
          schoolName: step.institution_name ?? step.title,
          location: step.institution_city ?? step.institution_municipality ?? null,
          website: step.institution_website ?? null,
          programTitle: step.program_title ?? step.title,
          displayTitle: step.program_title ?? step.title,
          durationLabel: step.duration_label ?? null,
          fromPayload: false,
          meta: null,
        },
      ];
    }

    return [
      {
        id: "step-current",
        schoolName: step.institution_name ?? step.title,
        location: step.institution_city ?? step.institution_municipality ?? null,
        website: step.institution_website ?? null,
        programTitle: step.program_title ?? step.title,
        displayTitle: step.program_title ?? step.title,
        durationLabel: step.duration_label ?? null,
        fromPayload: false,
        meta: null,
      },
    ];
  };

  const getBaselineOptionForStep = (
    step: StudyRouteSnapshotStep,
    options: StepOption[]
  ): StepOption | undefined => {
    if (options.length === 0) return undefined;

    if (step.type === "apprenticeship_step") {
      const savedSelectedId = (
        step as StudyRouteSnapshotStep & { selected_apprenticeship_option_id?: string | null }
      ).selected_apprenticeship_option_id;
      if (savedSelectedId) {
        return options.find((option) => option.id === savedSelectedId) ?? options[0];
      }
      return options[0];
    }

    if (step.type === "programme_selection") {
      const targetSchool = step.institution_name ?? null;
      const targetLocation = step.institution_city ?? step.institution_municipality ?? null;
      const targetWebsite = step.institution_website ?? null;
      const matched = options.find((option) => {
        if (!targetSchool || option.schoolName !== targetSchool) return false;
        if (targetLocation && option.location && option.location !== targetLocation) return false;
        if (targetWebsite && option.website && option.website !== targetWebsite) return false;
        return true;
      });
      return matched ?? options[0];
    }

    return options[0];
  };

  const getSelectedOption = (stepKey: string, step: StudyRouteSnapshotStep, options: StepOption[]) => {
    const selectedId = selectedOptionByStep[stepKey];
    const selectedFromUi = options.find((option) => option.id === selectedId);
    if (selectedFromUi) return selectedFromUi;
    return getBaselineOptionForStep(step, options) ?? options[0];
  };

  const isSelectableStep = (step: StudyRouteSnapshotStep) =>
    step.type === "programme_selection" || step.type === "apprenticeship_step";

  const baselineOptionByStep = steps.reduce<Record<string, string>>((acc, step, index) => {
    if (!isRouteSnapshotPayloadStep(step)) return acc;
    if (!isSelectableStep(step)) return acc;
    const stepKey = `snap-${index}-${step.type}-${step.program_slug ?? "none"}`;
    const options = buildStepOptions(step);
    const baseline = getBaselineOptionForStep(step, options);
    if (baseline) {
      acc[stepKey] = baseline.id;
    }
    return acc;
  }, {});

  const isDirtySelection = Object.entries(selectedOptionByStep).some(([stepKey, selectedId]) => {
    const baselineId = baselineOptionByStep[stepKey];
    return Boolean(baselineId) && selectedId !== baselineId;
  });

  const buildSelectionSignature = () => {
    const entries: Array<{ stepKey: string; optionId: string }> = [];
    steps.forEach((step, index) => {
      if (!isRouteSnapshotPayloadStep(step)) return;
      if (!isSelectableStep(step)) return;
      const stepKey = `snap-${index}-${step.type}-${step.program_slug ?? "none"}`;
      const optionId = selectedOptionByStep[stepKey] ?? baselineOptionByStep[stepKey];
      if (!optionId) return;
      if (step.type === "programme_selection" && optionId === "programme-current") return;
      entries.push({ stepKey, optionId });
    });
    return stableStringify(entries);
  };

  const currentSelectionSignature = buildSelectionSignature();
  const alreadySavedBySignature = savedSelectionSignatures.includes(currentSelectionSignature);

  return (
    <div ref={panelRef} className="w-full rounded-2xl border border-stone-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-stone-900">Route steps</h2>
        <SaveRouteButton
          childId={childId}
          routeId={routeId}
          locale={locale}
          isSaved={(isSavedRoute && !isDirtySelection) || alreadySavedBySignature}
          selectedOptions={selectedOptionByStep}
        />
      </div>

      <p className="mt-2 text-sm text-stone-600">
        This path shows the currently selected route.
      </p>

      {steps.length === 0 ? (
        <div className="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
          No route steps are available yet.
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto pb-2">
          <div className="flex min-w-max items-start gap-3">
            {steps.map((step, index) => {
              if (isRouteSnapshotPayloadStep(step)) {
                const stepKey = `snap-${index}-${step.type}-${step.program_slug ?? "none"}`;
                const showCompetitionBadge =
                  competitionLevel === "very_high" &&
                  step.type === "programme_selection";
                const stepOptions = buildStepOptions(step);
                const selectedOption = getSelectedOption(stepKey, step, stepOptions);
                const optionList = stepOptions;
                const isOpen = openStepKey === stepKey;
                const displayProgrammeTitle =
                  step.type === "programme_selection"
                    ? String(step.stage ?? "").toUpperCase() === "VG3"
                      ? step.title ??
                        step.program_title ??
                        selectedOption.displayTitle ??
                        selectedOption.programTitle ??
                        step.program_slug ??
                        "Unknown programme"
                      : selectedOption.displayTitle ??
                        selectedOption.programTitle ??
                        (selectedOption.fromPayload
                          ? null
                          : step.program_title ?? step.title ?? step.program_slug) ??
                        "Unknown programme"
                    : step.title ?? step.program_title ?? step.program_slug ?? selectedOption.schoolName;
                const selectedSchoolName =
                  step.type === "apprenticeship_step"
                    ? selectedOptionByStep[stepKey]
                      ? selectedOption.schoolName
                      : (
                          step as StudyRouteSnapshotStep & {
                            selected_apprenticeship_option_title?: string | null;
                          }
                        ).selected_apprenticeship_option_title ??
                        selectedOption.schoolName
                    : selectedOption.schoolName;
                const selectedLocation = selectedOption.location;
                const selectedWebsite = selectedOption.website ?? null;
                const selectedDurationLabel = selectedOption.durationLabel ?? step.duration_label;
                const selectedWebsiteLabel =
                  selectedWebsite && step.programme_url && selectedWebsite === step.programme_url
                    ? "Visit programme page"
                    : "Visit school website";

                return (
                  <div
                    key={stepKey}
                    className="flex items-start gap-3"
                    ref={(element) => {
                      stepRefByKey.current[stepKey] = element;
                    }}
                  >
                    <div className="w-[320px] shrink-0 rounded-xl border border-stone-200 bg-stone-50 p-4">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenStepKey((prev) => (prev === stepKey ? null : stepKey))
                        }
                        className="w-full text-left"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <h4 className="text-xl font-semibold text-stone-900">
                                {displayProgrammeTitle}
                              </h4>

                              {showCompetitionBadge && competitionLevel ? (
                                <CompetitionBadge level={competitionLevel} />
                              ) : null}
                            </div>

                            {selectedSchoolName ? (
                              <p className="mt-2 text-base text-stone-700">{selectedSchoolName}</p>
                            ) : null}

                            <div className="mt-3 space-y-1 text-sm text-stone-600">
                              {selectedLocation && <div>{selectedLocation}</div>}

                              {selectedDurationLabel && (
                                <div>
                                  {step.type === "apprenticeship_step" ? "Work time" : "Study time"}:{" "}
                                  {selectedDurationLabel}
                                </div>
                              )}

                              {selectedWebsite && (
                                <a
                                  href={selectedWebsite}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex text-sm text-blue-600 hover:underline"
                                >
                                  {selectedWebsiteLabel}
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700">
                              {humanizeStepType(step.type)}
                            </span>
                            <span className="text-xs text-stone-500">{isOpen ? "▲" : "▼"}</span>
                          </div>
                        </div>
                      </button>

                      {isOpen ? (
                        <div className="mt-4 border-t border-stone-200 pt-3">
                          <div className="space-y-1">
                            {optionList.map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  {
                                    setSelectedOptionByStep((prev) => ({
                                      ...prev,
                                      [stepKey]: option.id,
                                    }));
                                    setOpenStepKey(null);
                                  }
                                }
                                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                                  option.id === selectedOption.id
                                    ? "border-stone-700 bg-stone-900 text-white"
                                    : "border-stone-200 bg-white text-stone-800 hover:bg-stone-100"
                                }`}
                              >
                                <div>{option.schoolName}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {index < steps.length - 1 ? (
                      <div className="mt-16 shrink-0 text-xl text-stone-400">→</div>
                    ) : null}
                  </div>
                );
              }

              const legacy = step as StudyRouteStep;

              return (
                <div key={legacy.stepId} className="flex items-start gap-3">
                  <div className="w-[320px] shrink-0 rounded-xl border border-stone-200 bg-stone-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-stone-500">
                          Step {index + 1}
                        </p>

                        <h3 className="mt-1 text-base font-semibold text-stone-900">
                          {legacy.title}
                        </h3>

                        {legacy.institution?.title ? (
                          <p className="mt-1 text-sm text-stone-600">
                            {legacy.institution.title}
                          </p>
                        ) : legacy.subtitle ? (
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
                          Required programme
                        </dt>
                        <dd className="mt-1 text-sm text-stone-900">
                          {legacy.programme?.title ?? "—"}
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

                  {index < steps.length - 1 ? (
                    <div className="mt-16 shrink-0 text-xl text-stone-400">→</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
