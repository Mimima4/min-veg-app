"use client";

import { useEffect, useRef, useState } from "react";
import { CompetitionBadge } from "@/components/route/competition-badge";
import type {
  StudyRouteCompetitionLevel,
  StudyRouteReadModelStep,
  StudyRouteApprenticeshipSnapshotStep,
  StudyRouteSnapshotStep,
} from "@/lib/routes/route-types";
import type { StudyRouteStep } from "@/lib/routes/route-step-types";
import {
  buildProgrammeSelectionOptionId,
  formatLosaDropdownLabel,
  isLosaProgrammeOption,
  normalizeLosaDeliverySiteLabel,
  normalizeLosaProviderLabel,
  LOSA_ROUTE_BADGE_LABEL,
  LOSA_ROUTE_BADGE_TITLE,
} from "@/lib/losa/availability-scope";
import SaveRouteButton from "./[routeId]/save-route-button";
import type { SteigenCarpenterVekslingInfoCopy } from "@/lib/regional-delivery/steigen-carpenter-veksling-pilot";
import SteigenVekslingBadgeWithInfo from "@/components/route/steigen-veksling-badge-with-info";
import { isLarefagSelectionStage } from "@/lib/vgs/larefag-selection-stage";

type ApprenticeshipOptionList = NonNullable<
  StudyRouteApprenticeshipSnapshotStep["apprenticeship_options"]
>;
type ApprenticeshipOptionItem = ApprenticeshipOptionList[number];

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
  professionSlug?: string | null;
  isSavedRoute: boolean;
  steps: StudyRouteReadModelStep[];
  competitionLevel?: StudyRouteCompetitionLevel;
  savedSelectionSignatures?: string[];
  compact?: boolean;
  showHeader?: boolean;
  steigenVekslingInfoCopy?: SteigenCarpenterVekslingInfoCopy | null;
};

function humanizeStepType(step: StudyRouteSnapshotStep): string {
  if (step.type === "programme_selection" && isLarefagSelectionStage(step.stage)) {
    return "Fagvalg";
  }
  if (step.type === "programme_selection") return "Programme step";
  if (step.type === "progression_step") return "Progression";
  if (step.type === "apprenticeship_step") return "Apprenticeship";
  if (step.type === "outcome_step") return "Outcome";
  return "Step";
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

const PRIVATE_SCHOOL_BADGE_CLASSES = {
  default:
    "inline-flex shrink-0 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700",
  /** Same orange palette, slightly stronger for selected row on dark background. */
  onDarkSelectedRow:
    "inline-flex shrink-0 rounded-full border border-orange-300 bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-900",
};

const LOSA_BADGE_CLASSES = {
  default:
    "inline-flex shrink-0 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-800",
  onDarkSelectedRow:
    "inline-flex shrink-0 rounded-full border border-sky-300 bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-950",
};

export default function RouteStepsPanel({
  childId,
  routeId,
  locale,
  professionSlug = null,
  isSavedRoute,
  steps,
  competitionLevel,
  savedSelectionSignatures = [],
  compact = false,
  showHeader = true,
  steigenVekslingInfoCopy = null,
}: Props) {
  const cardWidth = compact ? "w-[200px] min-w-[200px]" : "w-[320px]";
  const cardMinHeight = compact ? "min-h-[11.5rem]" : "";
  const panelPadding = compact ? "p-3" : "p-6";
  const cardPadding = compact ? "p-3" : "p-4";
  const stepTitleClass = compact ? "text-xs font-semibold leading-snug" : "text-xl font-semibold";
  const schoolNameClass = compact
    ? "mt-1.5 line-clamp-2 text-[11px] leading-snug text-stone-700"
    : "mt-2 text-base text-stone-700";
  const metaClass = compact ? "mt-2 space-y-1 text-[11px] leading-snug text-stone-600" : "mt-3 space-y-1 text-sm text-stone-600";
  const arrowClass = compact
    ? "shrink-0 self-center text-sm text-stone-400"
    : "mt-16 shrink-0 text-xl text-stone-400";
  const stepsGap = compact ? "gap-2" : "gap-3";
  const stepsRowAlign = compact ? "items-stretch" : "items-start";
  const stepTypeBadgeClass = compact
    ? "inline-flex max-w-full rounded-full border border-stone-300 bg-white px-2 py-0.5 text-[10px] font-medium leading-tight text-stone-700"
    : "inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700";
  const cardShellClass = `${cardWidth} ${cardMinHeight} flex h-full shrink-0 flex-col rounded-xl border border-stone-200 bg-stone-50 ${cardPadding}`;
  const listRowClass = compact
    ? "flex w-full items-start justify-between gap-1 rounded-md border px-2 py-1 text-left text-xs"
    : "flex w-full items-start justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm";
  const dropdownOptionsScrollClass = compact
    ? "max-h-56 overflow-y-auto overscroll-contain"
    : "max-h-72 overflow-y-auto overscroll-contain";
  const [selectedOptionByStep, setSelectedOptionByStep] = useState<Record<string, string>>({});
  const [openStepKey, setOpenStepKey] = useState<string | null>(null);
  const [apprenticeshipOptionsOverride, setApprenticeshipOptionsOverride] = useState<
    Record<string, ApprenticeshipOptionList>
  >({});
  const apprenticeshipOptionsFetchGenRef = useRef<Record<string, number>>({});
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
    institutionIsPrivateSchool: boolean;
    isLosaDelivery: boolean;
    sourceNote: string | null;
    fagSlug?: string | null;
    programmeUrl?: string | null;
  };

  const resolveStepKey = (index: number, step: StudyRouteSnapshotStep) =>
    `snap-${index}-${step.type}-${step.program_slug ?? "none"}`;

  const extractFagSlugFromOptionId = (optionId: string): string | null => {
    const match = optionId.match(/^programme-vilbli-branch:(.+?)(?:-\d+)?$/);
    if (match?.[1]) return match[1];
    const alt = optionId.replace(/^programme-vilbli-branch:/, "").replace(/-\d+$/, "");
    return alt || null;
  };

  const renderLosaBadge = (isSelectedRow: boolean) => (
    <span
      className={
        isSelectedRow ? LOSA_BADGE_CLASSES.onDarkSelectedRow : LOSA_BADGE_CLASSES.default
      }
      title={LOSA_ROUTE_BADGE_TITLE}
    >
      {LOSA_ROUTE_BADGE_LABEL}
    </span>
  );

  useEffect(() => {
    setApprenticeshipOptionsOverride({});
    apprenticeshipOptionsFetchGenRef.current = {};
  }, [steps]);

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

  const dedupeStepOptions = (options: StepOption[]) => {
    const seen = new Set<string>();
    return options.filter((option) => {
      if (seen.has(option.id)) return false;
      seen.add(option.id);
      return true;
    });
  };

  const resolveProgrammeDropdownLabel = (option: StepOption) => {
    if (option.isLosaDelivery) {
      return formatLosaDropdownLabel({
        providerLabel: option.schoolName,
        deliverySiteLabel: option.location,
      });
    }
    return option.schoolName;
  };

  const resolveApprenticeshipDropdownLabel = (option: StepOption) => {
    if (option.location) {
      return `${option.schoolName} — ${option.location}`;
    }
    return option.schoolName;
  };

  const buildStepOptions = (step: StudyRouteSnapshotStep, stepKey?: string) => {
    if (step.type === "programme_selection" && isLarefagSelectionStage(step.stage)) {
      const mapped = (step.options ?? []).map((option, index) => {
        const fagTitle =
          option.display_title ?? option.program_title ?? option.institution_name ?? "Unknown fag";
        return {
          id: buildProgrammeSelectionOptionId(option, index),
          schoolName: fagTitle,
          location: null,
          website: null,
          programTitle: option.program_title ?? fagTitle,
          displayTitle: fagTitle,
          durationLabel: option.duration_label ?? step.duration_label ?? null,
          fromPayload: true,
          meta: option.verification_status,
          institutionIsPrivateSchool: false,
          isLosaDelivery: false,
          sourceNote: null,
          fagSlug: String(option.institution_id ?? "")
            .trim()
            .replace(/^vilbli-branch:/, "") || null,
          programmeUrl: option.programme_url ?? null,
        };
      });
      if (mapped.length > 0) return dedupeStepOptions(mapped);
      return [
        {
          id: "larefag-current",
          schoolName: step.program_title ?? step.title ?? "Unknown fag",
          location: null,
          website: null,
          programTitle: step.program_title ?? step.title,
          displayTitle: step.program_title ?? step.title,
          durationLabel: step.duration_label ?? null,
          fromPayload: false,
          meta: null,
          institutionIsPrivateSchool: false,
          isLosaDelivery: false,
          sourceNote: null,
          fagSlug: step.program_slug ?? null,
          programmeUrl: step.programme_url ?? null,
        },
      ];
    }

    if (step.type === "programme_selection") {
      const mapped = (step.options ?? []).map((option, index) => {
        const isLosaDelivery = isLosaProgrammeOption(option);
        const schoolName =
          (isLosaDelivery
            ? normalizeLosaProviderLabel(option.institution_name)
            : option.institution_name) ?? "Unknown school";
        const location = isLosaDelivery
          ? normalizeLosaDeliverySiteLabel(
              option.delivery_site_label ??
                option.institution_city ??
                option.institution_municipality
            )
          : option.institution_city ?? option.institution_municipality ?? null;

        return {
          id: buildProgrammeSelectionOptionId(option, index),
          schoolName,
          location,
          website: option.institution_website ?? step.institution_website ?? null,
          programTitle: option.program_title ?? step.program_title ?? step.title,
          displayTitle:
            option.display_title ?? option.program_title ?? step.program_title ?? step.title,
          durationLabel: option.duration_label ?? step.duration_label ?? null,
          fromPayload: true,
          meta: option.verification_status,
          institutionIsPrivateSchool: option.institution_is_private_school === true,
          isLosaDelivery,
          sourceNote: null,
        };
      });
      if (mapped.length > 0) return dedupeStepOptions(mapped);
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
          institutionIsPrivateSchool: false,
          isLosaDelivery: false,
          sourceNote: null,
        },
      ];
    }

    if (step.type === "apprenticeship_step") {
      const hasApprenticeshipOverride =
        stepKey != null && Object.prototype.hasOwnProperty.call(apprenticeshipOptionsOverride, stepKey);
      const optionSource = hasApprenticeshipOverride
        ? apprenticeshipOptionsOverride[stepKey]
        : step.apprenticeship_options;
      const mapped = (optionSource ?? []).map((option: ApprenticeshipOptionItem) => {
        const outcomeCount = option.outcome_profession_ids?.length ?? 0;
        return {
        id: option.option_id,
        schoolName: option.option_title,
        location:
          option.employer_municipality ??
          step.institution_city ??
          step.institution_municipality ??
          null,
        website: option.employer_website ?? step.institution_website ?? null,
        programTitle: step.program_title ?? step.title,
        displayTitle: step.program_title ?? step.title,
        durationLabel: step.duration_label ?? null,
        fromPayload: true,
        meta:
          option.employer_source_note ??
          (outcomeCount > 0 ? `${outcomeCount} outcomes` : null),
        institutionIsPrivateSchool: false,
        isLosaDelivery: false,
        sourceNote: option.employer_source_note ?? null,
      };
      });
      if (mapped.length > 0) return mapped;
      if (hasApprenticeshipOverride) return [];
      return [
        {
          id: "apprenticeship-current",
          schoolName: step.institution_name ?? "",
          location: step.institution_city ?? step.institution_municipality ?? null,
          website: step.institution_website ?? null,
          programTitle: step.program_title ?? step.title,
          displayTitle: step.program_title ?? step.title,
          durationLabel: step.duration_label ?? null,
          fromPayload: false,
          meta: null,
          institutionIsPrivateSchool: false,
          isLosaDelivery: false,
          sourceNote: null,
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
        institutionIsPrivateSchool: false,
        isLosaDelivery: false,
        sourceNote: null,
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
      if (isLarefagSelectionStage(step.stage)) {
        const targetSlug = String(step.program_slug ?? "").trim();
        if (targetSlug) {
          const matched = options.find((option) => {
            const slugFromId = option.id.replace(/^programme-vilbli-branch:/, "");
            return slugFromId === targetSlug || option.id.includes(targetSlug);
          });
          if (matched) return matched;
        }
        const targetTitle = step.program_title ?? step.title ?? null;
        if (targetTitle) {
          const matched = options.find(
            (option) =>
              option.displayTitle === targetTitle || option.programTitle === targetTitle
          );
          if (matched) return matched;
        }
        return options[0];
      }

      const targetSchool =
        normalizeLosaProviderLabel(step.institution_name) ?? step.institution_name ?? null;
      const targetLocation = normalizeLosaDeliverySiteLabel(
        step.institution_city ?? step.institution_municipality ?? null
      );
      const targetWebsite = step.institution_website ?? null;
      const matched = options.find((option) => {
        const optionSchool =
          option.isLosaDelivery
            ? normalizeLosaProviderLabel(option.schoolName) ?? option.schoolName
            : option.schoolName;
        if (!targetSchool || optionSchool !== targetSchool) return false;
        if (targetLocation && option.location) {
          const optionLocation = option.isLosaDelivery
            ? normalizeLosaDeliverySiteLabel(option.location) ?? option.location
            : option.location;
          if (optionLocation !== targetLocation) return false;
        }
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

  const resolvePriorLarefagSelection = (
    stepIndex: number
  ): { fagTitle: string; fagSlug: string | null; larefagStepKey: string } | null => {
    for (let index = stepIndex - 1; index >= 0; index -= 1) {
      const priorStep = steps[index];
      if (!isRouteSnapshotPayloadStep(priorStep)) continue;
      if (priorStep.type === "apprenticeship_step") {
        return null;
      }
      if (
        priorStep.type === "programme_selection" &&
        isLarefagSelectionStage(priorStep.stage)
      ) {
        const larefagStepKey = resolveStepKey(index, priorStep);
        const options = buildStepOptions(priorStep);
        const selected = getSelectedOption(larefagStepKey, priorStep, options);
        return {
          fagTitle:
            selected.displayTitle ??
            selected.programTitle ??
            priorStep.program_title ??
            priorStep.title ??
            "Unknown fag",
          fagSlug:
            selected.fagSlug ??
            extractFagSlugFromOptionId(selected.id) ??
            priorStep.program_slug ??
            null,
          larefagStepKey,
        };
      }
    }
    return null;
  };

  const findApprenticeshipStepKeyAfterLarefag = (larefagStepIndex: number): string | null => {
    for (let index = larefagStepIndex + 1; index < steps.length; index += 1) {
      const nextStep = steps[index];
      if (!isRouteSnapshotPayloadStep(nextStep)) continue;
      if (nextStep.type === "apprenticeship_step") {
        return resolveStepKey(index, nextStep);
      }
    }
    return null;
  };

  const refreshApprenticeshipOptionsForFag = async (
    larefagStepIndex: number,
    option: StepOption
  ) => {
    if (!professionSlug) return;
    const apprenticeshipStepKey = findApprenticeshipStepKeyAfterLarefag(larefagStepIndex);
    if (!apprenticeshipStepKey) return;

    const nextGeneration =
      (apprenticeshipOptionsFetchGenRef.current[apprenticeshipStepKey] ?? 0) + 1;
    apprenticeshipOptionsFetchGenRef.current[apprenticeshipStepKey] = nextGeneration;

    try {
      const response = await fetch(
        "/api/internal/routes/get-verified-larebedrift-apprenticeship-options",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            childId,
            professionSlug,
            programSlug: option.fagSlug ?? extractFagSlugFromOptionId(option.id),
            programTitle: option.displayTitle ?? option.programTitle,
            title: option.displayTitle ?? option.programTitle,
            programmeUrl: option.programmeUrl,
          }),
        }
      );
      const payload = (await response.json()) as {
        ok?: boolean;
        options?: ApprenticeshipOptionList;
      };
      if (
        apprenticeshipOptionsFetchGenRef.current[apprenticeshipStepKey] !== nextGeneration
      ) {
        return;
      }
      if (!response.ok || !payload.ok || !Array.isArray(payload.options)) {
        setApprenticeshipOptionsOverride((prev) => {
          const { [apprenticeshipStepKey]: _removed, ...rest } = prev;
          return rest;
        });
        return;
      }

      const options = payload.options ?? [];
      setApprenticeshipOptionsOverride((prev) => ({
        ...prev,
        [apprenticeshipStepKey]: options,
      }));
      setSelectedOptionByStep((prev) => {
        const next = { ...prev };
        if (options.length > 0) {
          next[apprenticeshipStepKey] = options[0].option_id;
        } else {
          delete next[apprenticeshipStepKey];
        }
        return next;
      });
    } catch {
      if (apprenticeshipOptionsFetchGenRef.current[apprenticeshipStepKey] === nextGeneration) {
        setApprenticeshipOptionsOverride((prev) => {
          const { [apprenticeshipStepKey]: _removed, ...rest } = prev;
          return rest;
        });
      }
    }
  };

  const isSelectableStep = (step: StudyRouteSnapshotStep) =>
    step.type === "programme_selection" || step.type === "apprenticeship_step";

  const baselineOptionByStep = steps.reduce<Record<string, string>>((acc, step, index) => {
    if (!isRouteSnapshotPayloadStep(step)) return acc;
    if (!isSelectableStep(step)) return acc;
    const stepKey = resolveStepKey(index, step);
    const options = buildStepOptions(step, stepKey);
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
      const stepKey = resolveStepKey(index, step);
      const optionId = selectedOptionByStep[stepKey] ?? baselineOptionByStep[stepKey];
      if (!optionId) return;
      if (step.type === "programme_selection" && optionId === "programme-current") return;
      if (step.type === "programme_selection" && optionId === "larefag-current") return;
      entries.push({ stepKey, optionId });
    });
    return stableStringify(entries);
  };

  const currentSelectionSignature = buildSelectionSignature();
  const alreadySavedBySignature = savedSelectionSignatures.includes(currentSelectionSignature);

  return (
    <div
      ref={panelRef}
      className={`w-full ${showHeader ? `rounded-2xl border border-stone-200 bg-white ${panelPadding}` : ""}`}
    >
      {showHeader ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-stone-900">Route steps</h2>
              {steigenVekslingInfoCopy ? (
                <SteigenVekslingBadgeWithInfo copy={steigenVekslingInfoCopy} />
              ) : null}
            </div>
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
        </>
      ) : null}

      {steps.length === 0 ? (
        <div
          className={`${showHeader ? "mt-5" : "mt-0"} rounded-xl border border-stone-200 bg-stone-50 ${cardPadding} ${compact ? "text-xs" : "text-sm"} text-stone-600`}
        >
          No route steps are available yet.
        </div>
      ) : (
        <div className={`${showHeader ? "mt-5" : "mt-0"} overflow-x-auto pb-2`}>
          <div className={`flex min-w-max ${stepsRowAlign} ${stepsGap}`}>
            {steps.flatMap((step, index) => {
              if (isRouteSnapshotPayloadStep(step)) {
                const stepKey = resolveStepKey(index, step);
                const showCompetitionBadge =
                  competitionLevel === "very_high" &&
                  step.type === "programme_selection";
                const stepOptions = buildStepOptions(step, stepKey);
                const selectedOption = getSelectedOption(stepKey, step, stepOptions);
                const optionList = stepOptions;
                const isOpen = openStepKey === stepKey;
                const priorLarefagSelection = resolvePriorLarefagSelection(index);
                const isLarefagStep =
                  step.type === "programme_selection" && isLarefagSelectionStage(step.stage);
                const displayProgrammeTitle = isLarefagStep
                  ? "Fagvalg"
                  : step.type === "apprenticeship_step" && priorLarefagSelection
                    ? `Opplæring i bedrift (${priorLarefagSelection.fagTitle})`
                    : step.type === "programme_selection"
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
                const selectedSchoolName = isLarefagStep
                  ? selectedOption.displayTitle ??
                    selectedOption.programTitle ??
                    step.program_title ??
                    step.title ??
                    null
                  : step.type === "apprenticeship_step"
                    ? (() => {
                        const hasOverride = Object.prototype.hasOwnProperty.call(
                          apprenticeshipOptionsOverride,
                          stepKey
                        );
                        if (hasOverride) {
                          if (stepOptions.length === 0) return null;
                          return selectedOption?.schoolName ?? null;
                        }
                        const employerName = selectedOptionByStep[stepKey]
                          ? selectedOption?.schoolName
                          : (
                              step as StudyRouteSnapshotStep & {
                                selected_apprenticeship_option_title?: string | null;
                              }
                            ).selected_apprenticeship_option_title ??
                            selectedOption?.schoolName ??
                            step.institution_name ??
                            null;
                        return employerName && employerName.trim().length > 0 ? employerName : null;
                      })()
                    : selectedOption.schoolName;
                const selectedLocation = isLarefagStep
                  ? null
                  : selectedOption?.location ?? null;
                const selectedWebsite = isLarefagStep
                  ? null
                  : selectedOption?.website ??
                    (step.type === "programme_selection" ? step.institution_website ?? null : null);
                const selectedDurationLabel = selectedOption?.durationLabel ?? step.duration_label;
                const selectedWebsiteLabel =
                  step.type === "apprenticeship_step"
                    ? "About the employer"
                    : selectedWebsite && step.programme_url && selectedWebsite === step.programme_url
                      ? "Visit programme page"
                      : "Visit school website";

                const card = (
                    <div
                      key={stepKey}
                      className={cardShellClass}
                      ref={(element) => {
                        stepRefByKey.current[stepKey] = element;
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenStepKey((prev) => (prev === stepKey ? null : stepKey))
                        }
                        className="flex h-full w-full flex-col text-left"
                        aria-expanded={isOpen}
                        data-testid={
                          step.type === "programme_selection" &&
                          String(step.stage ?? "").toUpperCase() === "VG1"
                            ? "route-vg1-step-toggle"
                            : undefined
                        }
                      >
                        {compact ? (
                          <div className="flex min-h-0 flex-1 flex-col">
                            <h4 className={`${stepTitleClass} line-clamp-3 text-stone-900`}>
                              {displayProgrammeTitle}
                            </h4>

                            <div className="mt-2 flex items-center justify-between gap-1">
                              <span className={stepTypeBadgeClass}>
                                {humanizeStepType(step)}
                              </span>
                              <span className="text-[10px] text-stone-500">{isOpen ? "▲" : "▼"}</span>
                            </div>

                            <div className="mt-auto pt-2">
                              {selectedSchoolName ? (
                                <p className={schoolNameClass}>{selectedSchoolName}</p>
                              ) : null}

                              <div className={metaClass}>
                                {selectedLocation && <div>{selectedLocation}</div>}

                                {selectedDurationLabel && (
                                  <div>
                                    {step.type === "apprenticeship_step" ? "Work time" : "Study time"}:{" "}
                                    {selectedDurationLabel}
                                  </div>
                                )}

                                {selectedWebsite ? (
                                  <a
                                    href={selectedWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex text-[11px] text-blue-600 hover:underline"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    {selectedWebsiteLabel}
                                  </a>
                                ) : step.type === "programme_selection" && !isLarefagStep ? (
                                  <span className="inline-block min-h-[1rem]" aria-hidden />
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <h4 className={stepTitleClass + " text-stone-900"}>
                                  {displayProgrammeTitle}
                                </h4>

                                {showCompetitionBadge && competitionLevel ? (
                                  <CompetitionBadge level={competitionLevel} />
                                ) : null}
                              </div>

                              {selectedSchoolName ? (
                                <p className={schoolNameClass}>{selectedSchoolName}</p>
                              ) : null}

                              <div className={metaClass}>
                                {selectedLocation && <div>{selectedLocation}</div>}

                                {selectedDurationLabel && (
                                  <div>
                                    {step.type === "apprenticeship_step" ? "Work time" : "Study time"}:{" "}
                                    {selectedDurationLabel}
                                  </div>
                                )}

                                {step.type === "programme_selection" &&
                                (selectedOption.isLosaDelivery ||
                                  selectedOption.institutionIsPrivateSchool) ? (
                                  <div className="flex flex-wrap gap-2 pt-0.5">
                                    {selectedOption.isLosaDelivery
                                      ? renderLosaBadge(false)
                                      : null}
                                    {selectedOption.institutionIsPrivateSchool ? (
                                      <span
                                        className={PRIVATE_SCHOOL_BADGE_CLASSES.default}
                                        title="Privat videregående skole"
                                      >
                                        Privatskole
                                      </span>
                                    ) : null}
                                  </div>
                                ) : null}

                                {selectedWebsite && (
                                  <a
                                    href={selectedWebsite}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex text-sm text-blue-600 hover:underline"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    {selectedWebsiteLabel}
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className={stepTypeBadgeClass}>
                                {humanizeStepType(step)}
                              </span>
                              <span className="text-xs text-stone-500">{isOpen ? "▲" : "▼"}</span>
                            </div>
                          </div>
                        )}
                      </button>

                      {isOpen ? (
                        <div
                          className="mt-4 border-t border-stone-200 pt-3"
                          data-testid="route-step-options"
                        >
                          <div className={`space-y-1 ${dropdownOptionsScrollClass}`}>
                            {optionList.length === 0 ? (
                              <p className="px-2 py-2 text-sm text-stone-500">
                                Ingen godkjente lærebedrifter for dette faget ennå.
                              </p>
                            ) : null}
                            {optionList.map((option) => (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                  if (isLarefagStep) {
                                    const apprenticeshipStepKey =
                                      findApprenticeshipStepKeyAfterLarefag(index);
                                    if (apprenticeshipStepKey) {
                                      setApprenticeshipOptionsOverride((prev) => ({
                                        ...prev,
                                        [apprenticeshipStepKey]: [],
                                      }));
                                    }
                                  }
                                  setSelectedOptionByStep((prev) => {
                                    const next = {
                                      ...prev,
                                      [stepKey]: option.id,
                                    };
                                    if (isLarefagStep) {
                                      const apprenticeshipStepKey =
                                        findApprenticeshipStepKeyAfterLarefag(index);
                                      if (apprenticeshipStepKey) {
                                        delete next[apprenticeshipStepKey];
                                      }
                                    }
                                    return next;
                                  });
                                  if (isLarefagStep) {
                                    void refreshApprenticeshipOptionsForFag(index, option);
                                  }
                                  setOpenStepKey(null);
                                }}
                                className={`${listRowClass} ${
                                  option.id === selectedOption?.id
                                    ? "border-stone-700 bg-stone-900 text-white"
                                    : "border-stone-200 bg-white text-stone-800 hover:bg-stone-100"
                                }`}
                              >
                                <span className="min-w-0 flex-1 break-words">
                                  <span className="block">
                                    {step.type === "programme_selection"
                                      ? resolveProgrammeDropdownLabel(option)
                                      : resolveApprenticeshipDropdownLabel(option)}
                                  </span>
                                </span>
                                <span className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                                  {option.isLosaDelivery
                                    ? renderLosaBadge(option.id === selectedOption?.id)
                                    : null}
                                  {option.institutionIsPrivateSchool ? (
                                    <span
                                      className={
                                        option.id === selectedOption?.id
                                          ? PRIVATE_SCHOOL_BADGE_CLASSES.onDarkSelectedRow
                                          : PRIVATE_SCHOOL_BADGE_CLASSES.default
                                      }
                                      title="Privat videregående skole"
                                    >
                                      Privatskole
                                    </span>
                                  ) : null}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                );

                if (index < steps.length - 1) {
                  return [
                    card,
                    <div key={`${stepKey}-arrow`} className={arrowClass}>
                      →
                    </div>,
                  ];
                }

                return [card];
              }

              const legacy = step as StudyRouteStep;

              const legacyCard = (
                  <div key={legacy.stepId} className={cardShellClass}>
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

                      <span className={stepTypeBadgeClass}>{legacy.stepType}</span>
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
              );

              if (index < steps.length - 1) {
                return [
                  legacyCard,
                  <div key={`${legacy.stepId}-arrow`} className={arrowClass}>
                    →
                  </div>,
                ];
              }

              return [legacyCard];
            })}
          </div>
        </div>
      )}
    </div>
  );
}
