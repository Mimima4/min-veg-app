import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  StudyRouteReadModel,
  StudyRouteSnapshotContext,
  StudyRouteCompetitionLevel,
  StudyRouteSnapshotStep,
  StudyRouteAvailableProfession,
} from "@/lib/routes/route-types";
import { getStudyRouteAlternatives } from "./get-study-route-alternatives";
import { getStudyRouteAvailableProfessions } from "./get-study-route-available-professions";
import {
  applyAdmissionCompetitionAdjustment,
  competitionLevelToLabel,
  resolveProfessionCompetitionLevel,
} from "./resolve-profession-competition-level";
import { getRouteAdmissionRealism } from "./get-route-admission-realism";
import { resolveStudyRouteState } from "./resolve-study-route-state";
import { enrichStudyRouteSteps } from "./enrich-study-route-steps";

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
    competition_level?: string | null;
  };
  currentSnapshot?: {
    generated_at: string;
    selected_steps_payload: unknown;
    signals_payload: unknown;
    stage_context?: unknown;
  } | null;
  snapshotContext?: StudyRouteSnapshotContext | null;
  forceNewRouteAvailable?: boolean;
  supabase?: SupabaseClient;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readNumber(record: Record<string, unknown> | null, key: string): number | null {
  if (!record) {
    return null;
  }
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getSelectedProgrammeSlug(selectedStepsPayload: unknown): string | null {
  if (!Array.isArray(selectedStepsPayload)) {
    return null;
  }

  for (const row of selectedStepsPayload) {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      continue;
    }
    const typedRow = row as Record<string, unknown>;
    if (typedRow.type !== "programme_selection") {
      continue;
    }
    const slug = typedRow.program_slug;
    if (typeof slug === "string" && slug.trim().length > 0) {
      return slug;
    }
  }

  return null;
}

function slugifyToken(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function assembleStudyRouteReadModel(
  params: AssembleParams
): Promise<StudyRouteReadModel> {
  const supportedLocale = (params.locale ?? "en") as SupportedLocale;
  const supabase = params.supabase ?? (await createClient());

  const alternatives = await getStudyRouteAlternatives({
    routeId: params.route.id,
  });

  const availableProfessions = await getStudyRouteAvailableProfessions({
    routeId: params.route.id,
    locale: params.locale,
  });

  const snapshotSteps = Array.isArray(params.currentSnapshot?.selected_steps_payload)
    ? params.currentSnapshot.selected_steps_payload
    : [];
  const enrichedSteps = await enrichStudyRouteSteps(
    snapshotSteps as StudyRouteSnapshotStep[]
  );
  const truthApprenticeshipStep = enrichedSteps.find(
    (step): step is Extract<StudyRouteSnapshotStep, { type: "apprenticeship_step" }> =>
      step.type === "apprenticeship_step" && step.source === "availability_truth"
  );
  const apprenticeshipOptions = truthApprenticeshipStep?.apprenticeship_options ?? [];
  const optionIdByOutcomeId = new Map<string, string>();
  for (const option of apprenticeshipOptions) {
    for (const outcomeId of option.outcome_profession_ids) {
      optionIdByOutcomeId.set(outcomeId, option.option_id);
    }
  }
  const optionIdByTitle = new Map<string, string>();
  for (const option of apprenticeshipOptions) {
    optionIdByTitle.set(slugifyToken(option.option_title), option.option_id);
  }
  const availableProfessionsWithBuckets = availableProfessions.items.map((profession) => {
    const matchedById = optionIdByOutcomeId.get(profession.professionId) ?? null;
    const matchedByTitle = optionIdByTitle.get(slugifyToken(profession.title)) ?? null;
    return {
      ...profession,
      apprenticeshipOptionId: matchedById ?? matchedByTitle,
    };
  });
  const presentationSteps = enrichedSteps
    .filter(
      (step) => !(step.source === "availability_truth" && step.type === "outcome_step")
    )
    .map((step) => step);

  const snapshotSignals = (() => {
    if (!params.forceNewRouteAvailable) {
      return params.currentSnapshot?.signals_payload;
    }

    const existingSignals =
      params.currentSnapshot?.signals_payload &&
      typeof params.currentSnapshot.signals_payload === "object" &&
      !Array.isArray(params.currentSnapshot.signals_payload)
        ? (params.currentSnapshot.signals_payload as Record<string, unknown>)
        : {};

    return {
      ...existingSignals,
      // LOCKED_SPEC: expose "new route available" instead of silently replacing.
      new_route_available: true,
    };
  })();

  const resolvedState = resolveStudyRouteState({
    selectedStepsPayload: params.currentSnapshot?.selected_steps_payload,
    snapshotSignals,
    snapshotContext: params.snapshotContext,
  });

  const professionTitle =
    params.snapshotContext?.currentProfession.title ||
    getLocalizedValue(params.profession.title_i18n ?? {}, supportedLocale) ||
    params.profession.slug;

  const baseCompetitionLevel = resolveProfessionCompetitionLevel(params.profession);
  const selectedProgramSlug = getSelectedProgrammeSlug(
    params.currentSnapshot?.selected_steps_payload
  );

  let competitionLevel: StudyRouteCompetitionLevel = baseCompetitionLevel;

  if (selectedProgramSlug) {
    const { data: selectedProgramRow } = await supabase
      .from("education_programs")
      .select("institution_id")
      .eq("slug", selectedProgramSlug)
      .maybeSingle();

    const admissionRecord = await getRouteAdmissionRealism({
      supabase,
      professionSlug: params.profession.slug,
      programSlug: selectedProgramSlug,
      institutionId: selectedProgramRow?.institution_id ?? null,
    });

    const thresholds = toRecord(admissionRecord?.thresholdsPayload ?? null);
    const competitionAdjustment = readNumber(thresholds, "competition_adjustment");
    competitionLevel = applyAdmissionCompetitionAdjustment({
      baseLevel: baseCompetitionLevel,
      competitionAdjustment,
      confidenceLevel: admissionRecord?.confidenceLevel ?? null,
    });
  }

  const competitionLabel = competitionLevelToLabel(competitionLevel);

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
      competitionLevel,
      competitionLabel,
      stepsCount: resolvedState.headerSummary.stepsCount,
      warningsCount: resolvedState.headerSummary.warningsCount,
      newRouteAvailable: resolvedState.headerSummary.newRouteAvailable,
    },
    steps: presentationSteps,
    signals: resolvedState.signals,
    availableProfessions: {
      ...availableProfessions,
      items: availableProfessionsWithBuckets,
    },
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