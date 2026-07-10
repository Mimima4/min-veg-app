import { createClient } from "@/lib/supabase/server";
import { getRouteOutcomeFilterLabelNb } from "@/lib/nav/route-outcome-filter-labels";
import { parseOutcomeFilterVariantReason } from "@/lib/nav/parse-outcome-filter-variant-reason";
import { resolveCuratedRegionalAlternativeMainDifference } from "@/lib/regional-delivery/curated-regional-alternative-copy";
import { parseCuratedRegionalVariantReason } from "@/lib/regional-delivery/curated-regional-variant-reason";
import { isPainterNorthCrossFylkePathVariantEligibleForNeighbor } from "@/lib/regional-delivery/painter-north-cross-fylke-path-variant";
import {
  isPainterNorthCrossFylkeNabofylkeVariantEligible,
  PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID,
} from "@/lib/regional-delivery/painter-north-cross-fylke-pilot";
import {
  isSteigenCarpenterVekslingPathVariantEligible,
  STEIGEN_CARPENTER_VEKSLING_VARIANT_ID,
} from "@/lib/regional-delivery/steigen-carpenter-veksling-path-variant";
import type {
  StudyRouteAlternativeTeaser,
  StudyRouteSnapshotStep,
} from "@/lib/routes/route-types";
import { buildSelectionSignatureFromPayload } from "@/lib/routes/selection-signature";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  batchGetRouteAdmissionRealismForCandidates,
  getRouteAdmissionRealism,
} from "./get-route-admission-realism";
import { enrichStudyRouteSteps } from "./enrich-study-route-steps";
import { getChildPreferredMunicipalityCodes } from "@/server/children/planning/get-child-preferred-municipality-codes";

type Params = {
  routeId: string;
  savedSelectionSignatures?: string[];
};

type VariantRow = {
  id: string;
  variant_label: string | null;
  variant_reason: string | null;
  is_current: boolean;
  status: string;
};

function resolveVariantLabel(variant: VariantRow): string {
  const filterId = parseOutcomeFilterVariantReason(variant.variant_reason);
  if (filterId) {
    return getRouteOutcomeFilterLabelNb(filterId);
  }
  return variant.variant_label ?? (variant.is_current ? "Current route" : "Alternative route");
}

type SnapshotRow = {
  route_variant_id: string;
  selected_steps_payload: unknown;
};

type CuratedRegionalEligibilityContext = {
  professionSlug: string;
  preferredMunicipalityCodes: string[];
};

function parsePainterNorthNeighborCountyCode(curatedRegionalVariantId: string): string | null {
  const prefix = "painter-north-overflateteknikk-";
  if (!curatedRegionalVariantId.startsWith(prefix)) {
    return null;
  }
  const countyCode = curatedRegionalVariantId.slice(prefix.length).trim();
  return /^\d{2}$/.test(countyCode) ? countyCode : null;
}

async function loadCuratedRegionalEligibilityContext(
  supabase: SupabaseClient,
  routeId: string
): Promise<CuratedRegionalEligibilityContext | null> {
  const { data: route } = await supabase
    .from("study_routes")
    .select("child_id, target_profession_id")
    .eq("id", routeId)
    .maybeSingle();

  if (!route?.child_id || !route?.target_profession_id) {
    return null;
  }

  const [preferredMunicipalityCodes, professionResult] = await Promise.all([
    getChildPreferredMunicipalityCodes(route.child_id, supabase),
    supabase
      .from("professions")
      .select("slug")
      .eq("id", route.target_profession_id)
      .maybeSingle(),
  ]);

  const professionSlug = professionResult.data?.slug;
  if (typeof professionSlug !== "string" || professionSlug.trim().length === 0) {
    return null;
  }

  return { professionSlug, preferredMunicipalityCodes };
}

function isCuratedRegionalVariantEligible(
  curatedRegionalVariantId: string,
  context: CuratedRegionalEligibilityContext
): boolean {
  if (curatedRegionalVariantId === STEIGEN_CARPENTER_VEKSLING_VARIANT_ID) {
    return isSteigenCarpenterVekslingPathVariantEligible({
      professionSlug: context.professionSlug,
      preferredMunicipalityCodes: context.preferredMunicipalityCodes,
    });
  }

  if (curatedRegionalVariantId === PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID) {
    return isPainterNorthCrossFylkeNabofylkeVariantEligible({
      professionSlug: context.professionSlug,
      preferredMunicipalityCodes: context.preferredMunicipalityCodes,
    });
  }

  const neighborCountyCode = parsePainterNorthNeighborCountyCode(curatedRegionalVariantId);
  if (neighborCountyCode) {
    return isPainterNorthCrossFylkePathVariantEligibleForNeighbor({
      professionSlug: context.professionSlug,
      preferredMunicipalityCodes: context.preferredMunicipalityCodes,
      neighborCountyCode,
    });
  }

  return false;
}

type ProgrammeSelectionStep = {
  type: "programme_selection";
  program_slug: string;
  program_title?: string | null;
  current_profession_slug: string;

  institution_name?: string | null;
  institution_city?: string | null;
  institution_municipality?: string | null;
  institution_website?: string | null;
  duration_years?: number | null;
  duration_label?: string | null;
};

type AdmissionMetrics = {
  advantageWeight: number | null;
  competitionAdjustment: number | null;
  requirementsPayload: unknown;
};

function getChangedStepsCount(
  currentSteps: unknown,
  candidateSteps: unknown
): number | null {
  const current = Array.isArray(currentSteps) ? currentSteps : [];
  const candidate = Array.isArray(candidateSteps) ? candidateSteps : [];

  if (current.length === 0 && candidate.length === 0) {
    return 0;
  }

  const max = Math.max(current.length, candidate.length);
  let changed = 0;

  for (let i = 0; i < max; i += 1) {
    const a = current[i];
    const b = candidate[i];

    if (JSON.stringify(a) !== JSON.stringify(b)) {
      changed += 1;
    }
  }

  return changed;
}

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

function extractProgrammeSelectionStep(payload: unknown): ProgrammeSelectionStep | null {
  if (!Array.isArray(payload)) {
    return null;
  }

  for (const rawStep of payload) {
    if (!rawStep || typeof rawStep !== "object" || Array.isArray(rawStep)) {
      continue;
    }
    const step = rawStep as Record<string, unknown>;
    if (step.type !== "programme_selection") {
      continue;
    }
    const programSlug = step.program_slug;
    const professionSlug = step.current_profession_slug;
    const institutionName = step.institution_name;
    if (typeof programSlug !== "string" || typeof professionSlug !== "string") {
      continue;
    }
    if (programSlug.trim().length === 0 || professionSlug.trim().length === 0) {
      continue;
    }
    return {
      type: "programme_selection",
      program_slug: programSlug,
      current_profession_slug: professionSlug,
      institution_name: typeof institutionName === "string" ? institutionName : null,
    };
  }

  return null;
}

function deriveAdmissionMetrics(record: {
  quotaPayload: unknown;
  thresholdsPayload: unknown;
  requirementsPayload: unknown;
} | null): AdmissionMetrics {
  const quota = toRecord(record?.quotaPayload ?? null);
  const thresholds = toRecord(record?.thresholdsPayload ?? null);

  return {
    advantageWeight: readNumber(quota, "advantage_weight"),
    competitionAdjustment: readNumber(thresholds, "competition_adjustment"),
    requirementsPayload: record?.requirementsPayload ?? null,
  };
}

function resolveRealismDelta(
  currentWeight: number | null,
  candidateWeight: number | null
): string | null {
  if (currentWeight === null || candidateWeight === null) {
    return null;
  }
  const diff = candidateWeight - currentWeight;
  if (diff > 0.01) {
    return "Higher admission advantage due to quota";
  }
  if (diff < -0.01) {
    return "Lower admission advantage";
  }
  return null;
}

function resolveRiskDelta(
  currentCompetitionAdjustment: number | null,
  candidateCompetitionAdjustment: number | null
): string | null {
  if (currentCompetitionAdjustment === null || candidateCompetitionAdjustment === null) {
    return null;
  }
  const diff = candidateCompetitionAdjustment - currentCompetitionAdjustment;
  if (diff < -0.01) {
    return "Higher competition pressure";
  }
  if (diff > 0.01) {
    return "Lower competition pressure";
  }
  return null;
}

export async function getStudyRouteAlternatives(
  params: Params
): Promise<StudyRouteAlternativeTeaser[]> {
  const supabase = await createClient();

  const { data: variants, error } = await supabase
    .from("study_route_variants")
    .select(
      `
        id,
        variant_label,
        variant_reason,
        is_current,
        status
      `
    )
    .eq("route_id", params.routeId)
    .neq("status", "archived")
    .order("is_current", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch study route alternatives: ${error.message}`);
  }

  const typedVariants = (variants ?? []) as VariantRow[];

  if (typedVariants.length === 0) {
    return [];
  }

  const variantIds = typedVariants.map((variant) => variant.id);

  const { data: snapshots, error: snapshotsError } = await supabase
    .from("study_route_snapshots")
    .select("route_variant_id, selected_steps_payload")
    .in("route_variant_id", variantIds)
    .eq("is_current_snapshot", true);

  if (snapshotsError) {
    throw new Error(
      `Failed to fetch study route alternative snapshots: ${snapshotsError.message}`
    );
  }

  const snapshotMap = new Map<string, SnapshotRow>(
    ((snapshots ?? []) as SnapshotRow[]).map((snapshot) => [
      snapshot.route_variant_id,
      snapshot,
    ])
  );

  const currentVariant = typedVariants.find((variant) => variant.is_current);
  const currentSnapshot = currentVariant
    ? snapshotMap.get(currentVariant.id)?.selected_steps_payload
    : null;
  const variantSteps = typedVariants.map((variant) => {
    const payload = snapshotMap.get(variant.id)?.selected_steps_payload ?? null;
    const steps = Array.isArray(payload) ? (payload as StudyRouteSnapshotStep[]) : [];
    return { variantId: variant.id, steps };
  });

  const programmeSelectionByVariantId = new Map<string, ProgrammeSelectionStep>();
  for (const { variantId, steps } of variantSteps) {
    const programmeStep = steps.find(
      (step) => step.type === "programme_selection" && typeof step.program_slug === "string"
    ) as ProgrammeSelectionStep | undefined;

    if (programmeStep) {
      programmeSelectionByVariantId.set(variantId, programmeStep);
    }
  }

  // Admission deltas are explanatory only: use program_slug across alternatives.
  // To avoid mutating or re-ranking routes, we query admission realism by program only.
  const candidateByProgram = new Map<string, true>();
  let sharedProfessionSlug: string | null = null;
  for (const programmeSelection of programmeSelectionByVariantId.values()) {
    candidateByProgram.set(programmeSelection.program_slug, true);
    if (!sharedProfessionSlug) {
      sharedProfessionSlug = programmeSelection.current_profession_slug;
    }
  }

  let admissionByKey = new Map<string, Awaited<ReturnType<typeof getRouteAdmissionRealism>>>();
  const candidateEntries = Array.from(candidateByProgram.keys()).map((programSlug) => ({
    programSlug,
    institutionId: null as string | null,
  }));
  if (candidateEntries.length > 0) {
    const fetchedAdmissionByKey = await batchGetRouteAdmissionRealismForCandidates(
      supabase,
      candidateEntries,
      sharedProfessionSlug
    );
    admissionByKey = fetchedAdmissionByKey;
  }

  const admissionMetricsByVariantId = new Map<string, AdmissionMetrics>();
  for (const variant of typedVariants) {
    const programmeSelection = programmeSelectionByVariantId.get(variant.id);
    if (!programmeSelection) {
      continue;
    }
    const key = `${programmeSelection.program_slug}\t`;
    const record = admissionByKey.get(key) ?? null;
    // requirementsPayload is also loaded and retained in metrics for future requirement deltas.
    admissionMetricsByVariantId.set(variant.id, deriveAdmissionMetrics(record));
  }

  const currentMetrics = currentVariant
    ? admissionMetricsByVariantId.get(currentVariant.id) ?? null
    : null;

  const teasers = typedVariants.map((variant) => {
    const snapshot = snapshotMap.get(variant.id)?.selected_steps_payload ?? null;
    const candidateMetrics = admissionMetricsByVariantId.get(variant.id) ?? null;
    const realismDelta = currentMetrics
      ? resolveRealismDelta(currentMetrics.advantageWeight, candidateMetrics?.advantageWeight ?? null)
      : null;
    const riskDelta = currentMetrics
      ? resolveRiskDelta(
          currentMetrics.competitionAdjustment,
          candidateMetrics?.competitionAdjustment ?? null
        )
      : null;

    const routeOutcomeFilterId = parseOutcomeFilterVariantReason(variant.variant_reason);
    const curatedRegionalVariantId = parseCuratedRegionalVariantReason(variant.variant_reason);

    return {
      variantId: variant.id,
      label: resolveVariantLabel(variant),
      isCurrent: variant.is_current,
      routeOutcomeFilterId,
      curatedRegionalVariantId,
      variantStatus: variant.status,
      mainDifference: routeOutcomeFilterId
        ? "Alternative route shaped by a different education outcome filter"
        : curatedRegionalVariantId
          ? resolveCuratedRegionalAlternativeMainDifference(curatedRegionalVariantId)
          : variant.variant_reason ??
            (variant.is_current
              ? "Current active route variant"
              : "Alternative variant for the same target profession"),
      realismDelta,
      riskDelta,
      changedStepsCount: getChangedStepsCount(currentSnapshot, snapshot),
    };
  });

  const savedSignatureSet = new Set(params.savedSelectionSignatures ?? []);
  const curatedRegionalEligibilityContext = await loadCuratedRegionalEligibilityContext(
    supabase,
    params.routeId
  );

  const alternativeTeasers = teasers.filter(
    (teaser) =>
      !teaser.isCurrent &&
      (teaser.changedStepsCount ?? 0) > 0 &&
      (Boolean(teaser.routeOutcomeFilterId) ||
        (Boolean(teaser.curatedRegionalVariantId) &&
          curatedRegionalEligibilityContext !== null &&
          isCuratedRegionalVariantEligible(
            teaser.curatedRegionalVariantId!,
            curatedRegionalEligibilityContext
          )))
  );

  return Promise.all(
    alternativeTeasers.map(async (teaser) => {
      const payload = snapshotMap.get(teaser.variantId)?.selected_steps_payload ?? null;
      const rawSteps = Array.isArray(payload) ? (payload as StudyRouteSnapshotStep[]) : [];
      const isSaved =
        rawSteps.length > 0 &&
        savedSignatureSet.has(buildSelectionSignatureFromPayload(rawSteps));
      if (rawSteps.length === 0) {
        return { ...teaser, isSaved };
      }

      const enrichedSteps = await enrichStudyRouteSteps(rawSteps);
      const presentationSteps = enrichedSteps.filter(
        (step) => !(step.source === "availability_truth" && step.type === "outcome_step")
      );

      return {
        ...teaser,
        steps: presentationSteps,
        isSaved,
      };
    })
  );
}