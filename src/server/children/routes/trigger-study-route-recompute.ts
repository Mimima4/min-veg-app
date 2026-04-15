import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import { buildStudyRouteSnapshotContext } from "./build-study-route-snapshot-context";
import { getRouteAuthenticityRule } from "./route-authenticity-rules";
import { getStudyRouteDetail } from "./get-study-route-detail";
import { RouteDomainError } from "./route-errors";
import {
  selectProgrammeForRoute,
  type RouteEducationProgram,
  type RouteInstitution,
  type RouteProgramLink,
} from "./select-programme-for-route";
import { computeRouteInputSignature } from "./compute-route-input-signature";
import { getRouteAdmissionRealism } from "./get-route-admission-realism";
import { buildRouteSignals } from "./build-route-signals";

type Params = {
  childId: string;
  routeId: string;
  locale?: string;
  triggeredByType?: string;
  triggeredByUserId?: string | null;
  supabase?: SupabaseClient;
};

type ProfessionRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
};

type ChildPlanningRow = {
  preferred_municipality_codes: unknown;
  relocation_willingness: "no" | "maybe" | "yes" | null;
};

const MAX_SNAPSHOT_VERSION_INSERT_RETRIES = 5;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isLockedStep(step: unknown): boolean {
  if (!isRecord(step)) {
    return false;
  }

  return (
    step.locked === true ||
    step.is_locked === true ||
    step.user_selected === true ||
    step.is_user_selected === true
  );
}

function protectLockedSteps({
  previous,
  candidate,
}: {
  previous: StudyRouteSnapshotStep[];
  candidate: StudyRouteSnapshotStep[];
}): StudyRouteSnapshotStep[] {
  if (previous.length === 0) {
    return candidate;
  }

  const byTypeQueue = new Map<string, StudyRouteSnapshotStep[]>();
  for (const step of previous) {
    if (!isLockedStep(step)) {
      continue;
    }
    const key = step.type;
    const existing = byTypeQueue.get(key) ?? [];
    existing.push(step);
    byTypeQueue.set(key, existing);
  }

  if (byTypeQueue.size === 0) {
    return candidate;
  }

  return candidate.map((step) => {
    const queue = byTypeQueue.get(step.type);
    if (!queue || queue.length === 0) {
      return step;
    }
    const locked = queue.shift();
    return locked ?? step;
  });
}

function hasLockedSteps(steps: StudyRouteSnapshotStep[]): boolean {
  return steps.some((step) => isLockedStep(step));
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (!isRecord(value)) {
    return JSON.stringify(value);
  }

  const keys = Object.keys(value).sort();
  const serialized = keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",");
  return `{${serialized}}`;
}

function isMaterialRouteShift({
  previousSteps,
  candidateSteps,
  previousSignals,
  candidateSignals,
}: {
  previousSteps: StudyRouteSnapshotStep[];
  candidateSteps: StudyRouteSnapshotStep[];
  previousSignals: unknown;
  candidateSignals: unknown;
}): boolean {
  if (stableStringify(previousSteps) !== stableStringify(candidateSteps)) {
    return true;
  }

  const previousWarnings = isRecord(previousSignals) ? previousSignals.warnings : null;
  const candidateWarnings = isRecord(candidateSignals) ? candidateSignals.warnings : null;

  if (stableStringify(previousWarnings) !== stableStringify(candidateWarnings)) {
    return true;
  }

  const previousFeasibility = isRecord(previousSignals)
    ? previousSignals.feasibilitySummary
    : null;
  const candidateFeasibility = isRecord(candidateSignals)
    ? candidateSignals.feasibilitySummary
    : null;

  return stableStringify(previousFeasibility) !== stableStringify(candidateFeasibility);
}

function extractMaterialSignalsSubset(signals: unknown): {
  warnings: unknown;
  feasibilitySummary: unknown;
} {
  if (!isRecord(signals)) {
    return {
      warnings: null,
      feasibilitySummary: null,
    };
  }

  return {
    warnings: signals.warnings ?? null,
    feasibilitySummary: signals.feasibilitySummary ?? null,
  };
}

async function insertRecomputedSnapshotWithRetry(params: {
  supabase: SupabaseClient;
  routeVariantId: string;
  snapshotContext: unknown;
  recomputedSteps: StudyRouteSnapshotStep[];
  recomputedSignals: unknown;
  routeInputSignature: string;
}): Promise<void> {
  for (
    let attempt = 0;
    attempt < MAX_SNAPSHOT_VERSION_INSERT_RETRIES;
    attempt += 1
  ) {
    const { data: latestSnapshot, error: latestSnapshotError } = await params.supabase
      .from("study_route_snapshots")
      .select("snapshot_version")
      .eq("route_variant_id", params.routeVariantId)
      .order("snapshot_version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestSnapshotError) {
      throw new RouteDomainError(
        "route_recompute_failed",
        `Failed to load latest snapshot version for recompute: ${latestSnapshotError.message}`
      );
    }

    const nextSnapshotVersion =
      typeof latestSnapshot?.snapshot_version === "number"
        ? latestSnapshot.snapshot_version + 1
        : 1;

    const { error: snapshotInsertError } = await params.supabase
      .from("study_route_snapshots")
      .insert({
        route_variant_id: params.routeVariantId,
        snapshot_version: nextSnapshotVersion,
        snapshot_kind: "recompute",
        generation_reason: "manual_recompute",
        stage_context: params.snapshotContext,
        selected_steps_payload: params.recomputedSteps,
        signals_payload: params.recomputedSignals,
        available_professions_payload: [],
        alternatives_teaser_payload: [],
        route_input_signature: params.routeInputSignature,
        is_current_snapshot: true,
      });

    if (!snapshotInsertError) {
      return;
    }

    if (snapshotInsertError.code === "23505") {
      // Concurrent recompute inserted same next version first; retry with fresh latest.
      continue;
    }

    throw new RouteDomainError(
      "route_recompute_failed",
      `Failed to insert recomputed snapshot: ${snapshotInsertError.message}`
    );
  }

  throw new RouteDomainError(
    "route_recompute_failed",
    "Failed to allocate unique snapshot version after concurrent retries"
  );
}

export async function triggerStudyRouteRecompute(params: Params) {
  const supabase = params.supabase ?? (await createClient());
  const locale = params.locale ?? "en";
  const triggeredByType = params.triggeredByType ?? "system";
  const triggeredByUserId = params.triggeredByUserId ?? null;

  const { data: route, error: routeError } = await supabase
    .from("study_routes")
    .select(
      `
        id,
        child_id,
        target_profession_id,
        status,
        current_variant_id
      `
    )
    .eq("id", params.routeId)
    .eq("child_id", params.childId)
    .maybeSingle();

  if (routeError || !route) {
    throw new RouteDomainError("route_not_found", "Route not found for recompute", {
      routeId: params.routeId,
      childId: params.childId,
    });
  }

  if (!route.current_variant_id) {
    throw new RouteDomainError(
      "route_variant_conflict",
      "Route has no current variant for recompute",
      { routeId: route.id }
    );
  }

  const { data: profession, error: professionError } = await supabase
    .from("professions")
    .select("id, slug, title_i18n")
    .eq("id", route.target_profession_id)
    .eq("is_active", true)
    .maybeSingle();

  if (professionError || !profession) {
    throw new RouteDomainError(
      "route_recompute_failed",
      `Failed to load route profession for recompute: ${professionError?.message ?? "Missing profession"}`
    );
  }

  const professionRow = profession as ProfessionRow;

  const { data: recomputeRun, error: recomputeRunError } = await supabase
    .from("study_route_recompute_runs")
    .insert({
      route_id: route.id,
      route_variant_id: route.current_variant_id,
      trigger_reason: "manual_recompute",
      triggered_by_type: triggeredByType,
      triggered_by_user_id: triggeredByUserId,
      result_status: "running",
    })
    .select("id")
    .single();

  if (recomputeRunError || !recomputeRun) {
    throw new RouteDomainError(
      "route_recompute_failed",
      `Failed to create recompute run: ${recomputeRunError?.message ?? "Unknown error"}`
    );
  }

  try {
    // Compliance guardrail for this runtime slice:
    // - LOCKED_SPEC: saved route must not be silently overwritten.
    // - LOCKED_SPEC: locked (user-selected) steps are protected on recompute.
    // - LOCKED_SPEC: materially different result is exposed as new_route_available.
    // - OPEN_DECISION: exact numeric policy for "major" remains out of scope here.
    const isWorkingRoute = route.status === "draft";

    const { data: currentSnapshot, error: currentSnapshotError } = await supabase
      .from("study_route_snapshots")
      .select("selected_steps_payload, signals_payload, route_input_signature")
      .eq("route_variant_id", route.current_variant_id)
      .eq("is_current_snapshot", true)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentSnapshotError) {
      throw new RouteDomainError(
        "route_recompute_failed",
        `Failed to load current snapshot before recompute: ${currentSnapshotError.message}`
      );
    }

    const previousSteps = Array.isArray(currentSnapshot?.selected_steps_payload)
      ? (currentSnapshot.selected_steps_payload as StudyRouteSnapshotStep[])
      : [];
    const previousSignals = currentSnapshot?.signals_payload ?? null;

    const snapshotContext = await buildStudyRouteSnapshotContext({
      locale,
      childId: route.child_id,
      routeId: route.id,
      routeVariantId: route.current_variant_id,
      targetProfessionId: route.target_profession_id,
      supabase,
    });

    const { data: programLinks, error: programLinksError } = await supabase
      .from("profession_program_links")
      .select("program_slug, fit_band")
      .eq("profession_slug", professionRow.slug)
      .order("fit_band", { ascending: true });

    if (programLinksError) {
      throw new RouteDomainError(
        "route_recompute_failed",
        `Failed to load profession-program links for recompute: ${programLinksError.message}`
      );
    }

    const { data: childProfile, error: childProfileError } = await supabase
      .from("child_profiles")
      .select("preferred_municipality_codes, relocation_willingness")
      .eq("id", route.child_id)
      .maybeSingle();

    if (childProfileError || !childProfile) {
      throw new RouteDomainError(
        "route_recompute_failed",
        `Failed to load child planning for recompute: ${childProfileError?.message ?? "Missing child profile"}`
      );
    }

    const childPlanning = childProfile as ChildPlanningRow;
    const preferredMunicipalityCodesRaw = childPlanning.preferred_municipality_codes;
    const preferredMunicipalityCodes = Array.isArray(preferredMunicipalityCodesRaw)
      ? preferredMunicipalityCodesRaw.filter(
          (item: unknown): item is string => typeof item === "string"
        )
      : [];
    const relocationWillingness = childPlanning.relocation_willingness;

    let selectedProgram: {
      slug: string;
      title: string;
      institution: RouteInstitution | null;
      fitBand: "strong" | "broader";
    } | null = null;

    const typedLinks = (programLinks ?? []) as RouteProgramLink[];

    let recomputedSteps: StudyRouteSnapshotStep[] = [];
    let admissionRealismRecord = null;

    if (typedLinks.length > 0) {
      const linkProgramSlugs = typedLinks.map((link) => link.program_slug);

      const { data: programs, error: programsError } = await supabase
        .from("education_programs")
        .select("slug, title, institution_id, education_level")
        .in("slug", linkProgramSlugs)
        .eq("is_active", true)
        .returns<RouteEducationProgram[]>();

      if (programsError) {
        throw new RouteDomainError(
          "route_recompute_failed",
          `Failed to load education programs for recompute: ${programsError.message}`
        );
      }

      const institutionIds = (programs ?? []).map((program) => program.institution_id);
      const { data: institutions, error: institutionsError } = await supabase
        .from("education_institutions")
        .select("id, slug, name, county_code, municipality_code")
        .in("id", institutionIds)
        .eq("is_active", true)
        .returns<RouteInstitution[]>();

      if (institutionsError) {
        throw new RouteDomainError(
          "route_recompute_failed",
          `Failed to load education institutions for recompute: ${institutionsError.message}`
        );
      }

      const selected = await selectProgrammeForRoute({
        supabase,
        childPlanning: {
          preferredMunicipalityCodes,
          relocationWillingness,
        },
        professionProgramLinks: typedLinks,
        educationPrograms: programs ?? [],
        institutions: institutions ?? [],
        professionSlug: professionRow.slug,
      });

      if (selected) {
        selectedProgram = {
          slug: selected.program.slug,
          title: selected.program.title,
          institution: selected.institution,
          fitBand: selected.link.fit_band,
        };

        const steps: StudyRouteSnapshotStep[] = [
          {
            type: "programme_selection",
            title: selected.program.title,
            institution_name: selected.institution?.name ?? null,
            education_level: selected.program.education_level ?? "",
            fit_band: selected.link.fit_band,
            program_slug: selected.link.program_slug,
            current_profession_slug: professionRow.slug,
          },
        ];

        const authenticityRule = getRouteAuthenticityRule(professionRow.slug);

        if (authenticityRule) {
          steps.push(
            ...authenticityRule.progressionAndOutcomeSteps.map((step) => ({
              type: step.type,
              title: step.title,
              institution_name: null,
              education_level: step.education_level,
              fit_band: step.fit_band,
              program_slug: null,
              current_profession_slug: professionRow.slug,
            }))
          );
        }

        recomputedSteps = steps;

        admissionRealismRecord = await getRouteAdmissionRealism({
          supabase,
          professionSlug: professionRow.slug,
          programSlug: selected.program.slug,
          institutionId: selected.institution?.id ?? null,
        });
      }
    }

    const recomputedSignals = buildRouteSignals({
      snapshotContext,
      professionSlug: professionRow.slug,
      selectedProgramExists: Boolean(selectedProgram),
      mode: "recompute",
      admissionRealismRecord,
    });

    recomputedSteps = protectLockedSteps({
      previous: previousSteps,
      candidate: recomputedSteps,
    });

    const hasUserLockedSteps = hasLockedSteps(previousSteps);
    const materialRouteShift = isMaterialRouteShift({
      previousSteps,
      candidateSteps: recomputedSteps,
      previousSignals,
      candidateSignals: recomputedSignals,
    });
    const shouldProtectSavedRoute = !isWorkingRoute || hasUserLockedSteps;
    const shouldExposeNewRouteAvailable =
      shouldProtectSavedRoute && materialRouteShift;

    if (shouldProtectSavedRoute) {
      await supabase
        .from("study_route_recompute_runs")
        .update({
          completed_at: new Date().toISOString(),
          result_status: "completed",
          new_variant_created: false,
          new_route_available: shouldExposeNewRouteAvailable,
        })
        .eq("id", recomputeRun.id);

      return getStudyRouteDetail({
        childId: route.child_id,
        routeId: route.id,
        locale,
        forceNewRouteAvailable: shouldExposeNewRouteAvailable,
        supabase,
      });
    }

    const routeInputSignature = computeRouteInputSignature({
      preferredMunicipalityCodes: snapshotContext.planning.preferredMunicipalityCodes,
      relocationWillingness: snapshotContext.planning.relocationWillingness,
      interestIds: snapshotContext.planning.interestIds,
      observedTraitIds: snapshotContext.planning.observedTraitIds,
      desiredIncomeBand: snapshotContext.planning.desiredIncomeBand,
      preferredWorkStyle: snapshotContext.planning.preferredWorkStyle,
      preferredEducationLevel: snapshotContext.planning.preferredEducationLevel,
    });

    const isEquivalentToCurrentSnapshot =
      Boolean(currentSnapshot) &&
      currentSnapshot?.route_input_signature === routeInputSignature &&
      stableStringify(previousSteps) === stableStringify(recomputedSteps) &&
      stableStringify(extractMaterialSignalsSubset(previousSignals)) ===
        stableStringify(extractMaterialSignalsSubset(recomputedSignals));

    if (isEquivalentToCurrentSnapshot) {
      await supabase
        .from("study_route_recompute_runs")
        .update({
          completed_at: new Date().toISOString(),
          result_status: "completed",
          new_variant_created: false,
          new_route_available: false,
        })
        .eq("id", recomputeRun.id);

      return getStudyRouteDetail({
        childId: route.child_id,
        routeId: route.id,
        locale,
        supabase,
      });
    }

    const { error: unsetCurrentError } = await supabase
      .from("study_route_snapshots")
      .update({ is_current_snapshot: false })
      .eq("route_variant_id", route.current_variant_id)
      .eq("is_current_snapshot", true);

    if (unsetCurrentError) {
      throw new RouteDomainError(
        "route_recompute_failed",
        `Failed to unset previous current snapshot: ${unsetCurrentError.message}`
      );
    }

    await insertRecomputedSnapshotWithRetry({
      supabase,
      routeVariantId: route.current_variant_id,
      snapshotContext,
      recomputedSteps,
      recomputedSignals,
      routeInputSignature,
    });

    await supabase
      .from("study_route_recompute_runs")
      .update({
        completed_at: new Date().toISOString(),
        result_status: "completed",
        new_variant_created: false,
        new_route_available: false,
      })
      .eq("id", recomputeRun.id);

    return getStudyRouteDetail({
      childId: route.child_id,
      routeId: route.id,
      locale,
      supabase,
    });
  } catch (error) {
    await supabase
      .from("study_route_recompute_runs")
      .update({
        completed_at: new Date().toISOString(),
        result_status: "failed",
        error_code:
          error instanceof RouteDomainError ? error.code : "internal_error",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", recomputeRun.id);

    throw error;
  }
}