import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import type {
  StudyRouteReadModel,
  StudyRouteSnapshotContext,
} from "@/lib/routes/route-types";
import type {
  StudyRouteImprovementGuidance,
  StudyRouteWarning,
} from "@/lib/routes/route-signal-types";
import { getStudyRouteAlternatives } from "./get-study-route-alternatives";
import { getStudyRouteAvailableProfessions } from "./get-study-route-available-professions";

type AssembleParams = {
  locale?: string;
  route: {
    id: string;
    child_id: string;
    target_profession_id: string;
    status: string;
    last_meaningful_change_at: string;
    current_variant_id: string | null;
  };
  profession: {
    id: string;
    slug: string;
    title_i18n: Record<string, string> | null;
  };
  currentSnapshot?: {
    generated_at: string;
    selected_steps_payload: unknown;
    signals_payload: unknown;
    stage_context?: unknown;
  } | null;
  snapshotContext?: StudyRouteSnapshotContext | null;
};

function buildDerivedSignals(snapshotContext?: StudyRouteSnapshotContext | null) {
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
    feasibilitySummary = "Route exists, but realism is still limited by missing planning signals";
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

export async function assembleStudyRouteReadModel(
  params: AssembleParams
): Promise<StudyRouteReadModel> {
  const supportedLocale = (params.locale ?? "en") as SupportedLocale;

  const alternatives = await getStudyRouteAlternatives({
    routeId: params.route.id,
  });

  const availableProfessions = await getStudyRouteAvailableProfessions({
    routeId: params.route.id,
    locale: params.locale,
  });

  const steps = Array.isArray(params.currentSnapshot?.selected_steps_payload)
    ? params.currentSnapshot.selected_steps_payload
    : [];

  const derivedSignals = buildDerivedSignals(params.snapshotContext);

  const storedSignals =
    params.currentSnapshot?.signals_payload &&
    typeof params.currentSnapshot.signals_payload === "object"
      ? params.currentSnapshot.signals_payload
      : null;

  const signals = storedSignals
    ? {
        ...derivedSignals,
        ...(storedSignals as object),
        warnings: Array.isArray((storedSignals as { warnings?: unknown }).warnings)
          ? ((storedSignals as { warnings: StudyRouteWarning[] }).warnings ?? [])
          : derivedSignals.warnings,
        improvementGuidance: Array.isArray(
          (storedSignals as { improvementGuidance?: unknown }).improvementGuidance
        )
          ? ((storedSignals as {
              improvementGuidance: StudyRouteImprovementGuidance[];
            }).improvementGuidance ?? [])
          : derivedSignals.improvementGuidance,
      }
    : derivedSignals;

  const professionTitle =
    params.snapshotContext?.currentProfession.title ||
    getLocalizedValue(params.profession.title_i18n ?? {}, supportedLocale) ||
    params.profession.slug;

  return {
    identity: {
      routeId: params.route.id,
      childId: params.route.child_id,
      targetProfessionId: params.route.target_profession_id,
      targetProfessionSlug: params.profession.slug,
      routeVariantId: params.route.current_variant_id ?? "missing-current-variant",
      status: params.route.status as StudyRouteReadModel["identity"]["status"],
      variantStatus: null,
      snapshotStatus: null,
      isCurrent: true,
      isEditable: true,
      generatedAt: params.currentSnapshot?.generated_at ?? new Date().toISOString(),
      lastMeaningfulChangeAt: params.route.last_meaningful_change_at,
    },
    header: {
      professionTitle,
      routeLabel: professionTitle,
      stageContextLabel: params.snapshotContext?.planning.preferredEducationLevel ?? null,
      overallFitLabel: signals.fitSummary,
      feasibilityLabel: signals.feasibilitySummary,
      realismLabel:
        (signals.warnings?.length ?? 0) > 0 ? "Needs more evidence" : "Baseline realistic",
      stepsCount: Array.isArray(steps) ? steps.length : 0,
      warningsCount: Array.isArray(signals.warnings) ? signals.warnings.length : 0,
      newRouteAvailable: false,
    },
    steps: steps as StudyRouteReadModel["steps"],
    signals: signals as StudyRouteReadModel["signals"],
    availableProfessions,
    alternativeRoutes: alternatives,
    allowedActions: {
      canEditRoute: true,
      canOpenAlternatives: true,
      canSaveAsNewVariant: true,
      canReplaceCurrentVariant: true,
      canOpenAvailableProfessions: true,
      canExportConsultationPdf: false,
      canShareReadOnlyRoute: false,
      canRemoveSavedRoute: true,
    },
  };
}