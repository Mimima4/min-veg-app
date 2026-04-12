import type {
    StudyRouteImprovementGuidance,
    StudyRouteSignals,
    StudyRouteWarning,
  } from "@/lib/routes/route-signal-types";
  import type {
    StudyRouteHeaderSummary,
    StudyRouteSnapshotContext,
  } from "@/lib/routes/route-types";
  
  type RouteSnapshotSignalRecord = Record<string, unknown>;
  
  export type ResolvedStudyRouteState = {
    stepsCount: number;
    warningsCount: number;
    newRouteAvailable: boolean;
    realismLabel: string;
    signals: StudyRouteSignals;
    headerSummary: Pick<
      StudyRouteHeaderSummary,
      | "overallFitLabel"
      | "feasibilityLabel"
      | "realismLabel"
      | "stepsCount"
      | "warningsCount"
      | "newRouteAvailable"
    >;
  };
  
  function buildDerivedSignals(
    snapshotContext?: StudyRouteSnapshotContext | null
  ): StudyRouteSignals {
    const warnings: StudyRouteWarning[] = [];
    const improvementGuidance: StudyRouteImprovementGuidance[] = [];
  
    const planning = snapshotContext?.planning;
  
    const hasInterests = (planning?.interestIds?.length ?? 0) > 0;
    const hasStrengths = (planning?.derivedStrengthIds?.length ?? 0) > 0;
    const hasEducationPreference = Boolean(planning?.preferredEducationLevel);
    const hasIncomeBand = Boolean(planning?.desiredIncomeBand);
    const hasWorkStyle = Boolean(planning?.preferredWorkStyle);
  
    if (!hasInterests) {
      warnings.push({
        code: "missing_interests",
        label: "Interest profile is still thin",
        description:
          "The child profile has no recorded interests yet, so the route remains less grounded.",
        severity: "medium",
      });
  
      improvementGuidance.push({
        code: "add_interests",
        label: "Add interest signals",
        description:
          "Select the child’s strongest interests to improve route guidance and profession adjacency quality.",
      });
    }
  
    if (!hasStrengths) {
      warnings.push({
        code: "missing_strengths",
        label: "Derived strengths are limited",
        description:
          "The route has limited strength signals and therefore weaker confidence.",
        severity: "medium",
      });
  
      improvementGuidance.push({
        code: "improve_strength_signals",
        label: "Strengthen the child profile",
        description:
          "Add observed traits and planning inputs so the route can reflect stronger evidence.",
      });
    }
  
    if (!hasEducationPreference) {
      improvementGuidance.push({
        code: "set_education_preference",
        label: "Set an education preference",
        description:
          "Adding a preferred education level will make future route variants more realistic.",
      });
    }
  
    const evidenceCount = [
      hasInterests,
      hasStrengths,
      hasEducationPreference || hasIncomeBand || hasWorkStyle,
    ].filter(Boolean).length;
  
    let fitSummary: string | null = null;
    let confidenceSummary: string | null = null;
    let feasibilitySummary: string | null = null;
  
    if (evidenceCount >= 3) {
      fitSummary = "Good baseline fit";
      confidenceSummary = "Moderate confidence";
      feasibilitySummary = "Initial route is feasible at baseline level";
    } else if (evidenceCount === 2) {
      fitSummary = "Early fit signal";
      confidenceSummary = "Developing confidence";
      feasibilitySummary = "Route is usable, but still needs more profile depth";
    } else {
      fitSummary = "Low-signal route";
      confidenceSummary = "Low confidence";
      feasibilitySummary =
        "Route exists, but realism is still limited by missing planning signals";
    }
  
    return {
      fitSummary,
      confidenceSummary,
      feasibilitySummary,
      warnings,
      improvementGuidance,
      evidenceComposition: {
        hasParentInput:
          hasInterests || hasEducationPreference || hasIncomeBand || hasWorkStyle,
        hasSchoolEvidence: false,
        hasDerivedSignals: hasStrengths,
      },
    };
  }
  
  function readWarnings(value: unknown, fallback: StudyRouteWarning[]) {
    return Array.isArray(value) ? (value as StudyRouteWarning[]) : fallback;
  }
  
  function readImprovementGuidance(
    value: unknown,
    fallback: StudyRouteImprovementGuidance[]
  ) {
    return Array.isArray(value)
      ? (value as StudyRouteImprovementGuidance[])
      : fallback;
  }
  
  function readNewRouteAvailable(signals: unknown): boolean {
    if (!signals || typeof signals !== "object") {
      return false;
    }
  
    const record = signals as RouteSnapshotSignalRecord;
  
    return record.newRouteAvailable === true || record.new_route_available === true;
  }
  
  function readEvidenceComposition(
    value: unknown,
    fallback: StudyRouteSignals["evidenceComposition"]
  ) {
    if (!value || typeof value !== "object") {
      return fallback;
    }
  
    const record = value as Record<string, unknown>;
  
    return {
      hasParentInput:
        typeof record.hasParentInput === "boolean"
          ? record.hasParentInput
          : fallback.hasParentInput,
      hasSchoolEvidence:
        typeof record.hasSchoolEvidence === "boolean"
          ? record.hasSchoolEvidence
          : fallback.hasSchoolEvidence,
      hasDerivedSignals:
        typeof record.hasDerivedSignals === "boolean"
          ? record.hasDerivedSignals
          : fallback.hasDerivedSignals,
    };
  }
  
  export function resolveStudyRouteState({
    selectedStepsPayload,
    snapshotSignals,
    snapshotContext,
  }: {
    selectedStepsPayload?: unknown;
    snapshotSignals?: unknown;
    snapshotContext?: StudyRouteSnapshotContext | null;
  }): ResolvedStudyRouteState {
    const derivedSignals = buildDerivedSignals(snapshotContext);
  
    const storedSignals =
      snapshotSignals && typeof snapshotSignals === "object"
        ? (snapshotSignals as RouteSnapshotSignalRecord)
        : null;
  
    const signals: StudyRouteSignals = storedSignals
      ? {
          fitSummary:
            typeof storedSignals.fitSummary === "string"
              ? storedSignals.fitSummary
              : derivedSignals.fitSummary,
          confidenceSummary:
            typeof storedSignals.confidenceSummary === "string"
              ? storedSignals.confidenceSummary
              : derivedSignals.confidenceSummary,
          feasibilitySummary:
            typeof storedSignals.feasibilitySummary === "string"
              ? storedSignals.feasibilitySummary
              : derivedSignals.feasibilitySummary,
          warnings: readWarnings(storedSignals.warnings, derivedSignals.warnings),
          improvementGuidance: readImprovementGuidance(
            storedSignals.improvementGuidance,
            derivedSignals.improvementGuidance
          ),
          evidenceComposition: readEvidenceComposition(
            storedSignals.evidenceComposition,
            derivedSignals.evidenceComposition
          ),
        }
      : derivedSignals;
  
    const stepsCount = Array.isArray(selectedStepsPayload)
      ? selectedStepsPayload.length
      : 0;
  
    const warningsCount = Array.isArray(signals.warnings) ? signals.warnings.length : 0;
    const newRouteAvailable = readNewRouteAvailable(snapshotSignals);
    const realismLabel =
      warningsCount > 0 ? "Needs more evidence" : "Baseline realistic";
  
    return {
      stepsCount,
      warningsCount,
      newRouteAvailable,
      realismLabel,
      signals,
      headerSummary: {
        overallFitLabel: signals.fitSummary ?? null,
        feasibilityLabel: signals.feasibilitySummary ?? null,
        realismLabel,
        stepsCount,
        warningsCount,
        newRouteAvailable,
      },
    };
  }