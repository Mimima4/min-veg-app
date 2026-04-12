import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import type {
  StudyRouteReadModel,
  StudyRouteSnapshotContext,
} from "@/lib/routes/route-types";
import { getStudyRouteAlternatives } from "./get-study-route-alternatives";
import { getStudyRouteAvailableProfessions } from "./get-study-route-available-professions";
import { resolveStudyRouteState } from "./resolve-study-route-state";

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

  const resolvedState = resolveStudyRouteState({
    selectedStepsPayload: params.currentSnapshot?.selected_steps_payload,
    snapshotSignals: params.currentSnapshot?.signals_payload,
    snapshotContext: params.snapshotContext,
  });

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
      overallFitLabel: resolvedState.headerSummary.overallFitLabel,
      feasibilityLabel: resolvedState.headerSummary.feasibilityLabel,
      realismLabel: resolvedState.headerSummary.realismLabel,
      stepsCount: resolvedState.headerSummary.stepsCount,
      warningsCount: resolvedState.headerSummary.warningsCount,
      newRouteAvailable: resolvedState.headerSummary.newRouteAvailable,
    },
    steps: steps as StudyRouteReadModel["steps"],
    signals: resolvedState.signals,
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