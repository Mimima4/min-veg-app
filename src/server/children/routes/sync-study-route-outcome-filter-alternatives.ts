import {
  formatOutcomeFilterVariantReason,
  getRouteOutcomeFilterLabelNb,
} from "@/lib/nav/route-outcome-filter-labels";
import { parseOutcomeFilterVariantReason } from "@/lib/nav/parse-outcome-filter-variant-reason";
import type { RouteOutcomeFilterId } from "@/lib/nav/route-outcome-filter-id";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { KommuneTransportSortContext } from "@/lib/planning/kommune-transport/types";
import type { AvailabilityTruthRow } from "./get-availability-truth";
import { buildTruthRouteStepsForOutcomeFilter } from "./build-truth-route-steps-for-outcome-filter";
import type { PathVariant, PathVariantsResult } from "./build-path-variants";
import { resolveAlternativeRouteOutcomeFilters } from "./resolve-alternative-route-outcome-filters";
import type { RoutePathVariantNavContext } from "./build-route-path-variant-nav-context";
import { getCurrentNavOccupationSnapshot } from "@/server/nav/get-nav-occupation-snapshot";
import { resolveCatalogProfessionIdsForNavMatches } from "./resolve-catalog-profession-ids-for-nav-matches";

const MAX_SNAPSHOT_VERSION_INSERT_RETRIES = 5;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
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

function snapshotPayloadMatches(
  stored: unknown,
  expected: StudyRouteSnapshotStep[],
  routeInputSignature: string,
  storedSignature: string | null | undefined
): boolean {
  return (
    storedSignature === routeInputSignature &&
    stableStringify(stored) === stableStringify(expected)
  );
}

async function promoteOutcomeFilterSnapshot(params: {
  supabase: SupabaseClient;
  variantId: string;
  snapshotId: string;
}): Promise<void> {
  const { error: unsetError } = await params.supabase
    .from("study_route_snapshots")
    .update({ is_current_snapshot: false })
    .eq("route_variant_id", params.variantId)
    .eq("is_current_snapshot", true);

  if (unsetError) {
    throw new Error(
      `Failed to unset current outcome-filter snapshot: ${unsetError.message}`
    );
  }

  const { error: promoteError } = await params.supabase
    .from("study_route_snapshots")
    .update({ is_current_snapshot: true })
    .eq("id", params.snapshotId);

  if (promoteError) {
    throw new Error(
      `Failed to promote outcome-filter snapshot: ${promoteError.message}`
    );
  }
}

async function insertOutcomeFilterSnapshotWithRetry(params: {
  supabase: SupabaseClient;
  variantId: string;
  generationReason: string;
  snapshotContext: unknown;
  alternativeSteps: StudyRouteSnapshotStep[];
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
      .eq("route_variant_id", params.variantId)
      .order("snapshot_version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestSnapshotError) {
      throw new Error(
        `Failed to load latest outcome-filter snapshot version: ${latestSnapshotError.message}`
      );
    }

    const nextSnapshotVersion =
      typeof latestSnapshot?.snapshot_version === "number"
        ? latestSnapshot.snapshot_version + 1
        : 1;

    const { error: snapshotError } = await params.supabase.from("study_route_snapshots").insert({
      route_variant_id: params.variantId,
      snapshot_version: nextSnapshotVersion,
      snapshot_kind: "outcome_filter_alternative",
      generation_reason: params.generationReason,
      stage_context: params.snapshotContext,
      selected_steps_payload: params.alternativeSteps,
      signals_payload: [],
      available_professions_payload: [],
      alternatives_teaser_payload: [],
      route_input_signature: params.routeInputSignature,
      route_source: "availability_truth",
      is_current_snapshot: true,
    });

    if (!snapshotError) {
      return;
    }

    if (snapshotError.code === "23505") {
      continue;
    }

    throw new Error(
      `Failed to insert outcome-filter alternative snapshot: ${snapshotError.message}`
    );
  }

  const { data: currentSnapshot, error: currentSnapshotError } = await params.supabase
    .from("study_route_snapshots")
    .select("selected_steps_payload, route_input_signature")
    .eq("route_variant_id", params.variantId)
    .eq("is_current_snapshot", true)
    .maybeSingle();

  if (currentSnapshotError) {
    throw new Error(
      `Failed to verify concurrent outcome-filter snapshot after retries: ${currentSnapshotError.message}`
    );
  }

  if (
    currentSnapshot &&
    snapshotPayloadMatches(
      currentSnapshot.selected_steps_payload,
      params.alternativeSteps,
      params.routeInputSignature,
      currentSnapshot.route_input_signature
    )
  ) {
    return;
  }

  throw new Error(
    "Failed to insert outcome-filter alternative snapshot after retries"
  );
}

async function ensureOutcomeFilterSnapshot(params: {
  supabase: SupabaseClient;
  variantId: string;
  generationReason: string;
  snapshotContext: unknown;
  alternativeSteps: StudyRouteSnapshotStep[];
  routeInputSignature: string;
}): Promise<void> {
  const { data: snapshots, error: snapshotsError } = await params.supabase
    .from("study_route_snapshots")
    .select(
      "id, snapshot_version, selected_steps_payload, route_input_signature, is_current_snapshot"
    )
    .eq("route_variant_id", params.variantId)
    .order("snapshot_version", { ascending: false });

  if (snapshotsError) {
    throw new Error(
      `Failed to load outcome-filter snapshots: ${snapshotsError.message}`
    );
  }

  const matchingSnapshot = (snapshots ?? []).find((snapshot) =>
    snapshotPayloadMatches(
      snapshot.selected_steps_payload,
      params.alternativeSteps,
      params.routeInputSignature,
      snapshot.route_input_signature
    )
  );

  if (matchingSnapshot) {
    if (!matchingSnapshot.is_current_snapshot) {
      await promoteOutcomeFilterSnapshot({
        supabase: params.supabase,
        variantId: params.variantId,
        snapshotId: matchingSnapshot.id,
      });
    }
    return;
  }

  await params.supabase
    .from("study_route_snapshots")
    .update({ is_current_snapshot: false })
    .eq("route_variant_id", params.variantId)
    .eq("is_current_snapshot", true);

  await insertOutcomeFilterSnapshotWithRetry({
    supabase: params.supabase,
    variantId: params.variantId,
    generationReason: params.generationReason,
    snapshotContext: params.snapshotContext,
    alternativeSteps: params.alternativeSteps,
    routeInputSignature: params.routeInputSignature,
  });
}

export async function syncStudyRouteOutcomeFilterAlternatives(params: {
  supabase: SupabaseClient;
  routeId: string;
  primaryVariantId: string;
  primarySteps: StudyRouteSnapshotStep[];
  primaryNavContext: RoutePathVariantNavContext;
  professionSlug: string;
  truthRows: AvailabilityTruthRow[];
  selectedCandidate: AvailabilityTruthRow | null;
  transportSortContext: KommuneTransportSortContext;
  pathVariants: PathVariantsResult;
  enrichedPathVariants: PathVariant[];
  childContext: boolean;
  snapshotContext: unknown;
  routeInputSignature: string;
  createdByType: string;
  createdByUserId: string | null;
}): Promise<void> {
  const alternativeFilterIds = resolveAlternativeRouteOutcomeFilters({
    primaryEffectiveFilterId: params.primaryNavContext.effectiveFilterId,
    hiddenFilterIds: params.primaryNavContext.hiddenFilterIds,
    professionSlug: params.professionSlug,
    variants: params.enrichedPathVariants,
    childContext: params.childContext,
    hasVg3SchoolProgrammeAvailability: params.pathVariants.hasVg3SchoolProgrammeAvailability,
  });

  const { data: existingVariants, error: existingError } = await params.supabase
    .from("study_route_variants")
    .select("id, variant_reason, status")
    .eq("route_id", params.routeId)
    .neq("status", "archived");

  if (existingError) {
    throw new Error(
      `Failed to load route variants for outcome-filter alternatives: ${existingError.message}`
    );
  }

  const existingByFilter = new Map<RouteOutcomeFilterId, { id: string }>();
  for (const variant of existingVariants ?? []) {
    const filterId = parseOutcomeFilterVariantReason(variant.variant_reason);
    if (filterId) {
      existingByFilter.set(filterId, { id: variant.id });
    }
  }

  const activeFilterIds = new Set<RouteOutcomeFilterId>(alternativeFilterIds);

  for (const variant of existingVariants ?? []) {
    const filterId = parseOutcomeFilterVariantReason(variant.variant_reason);
    if (!filterId || activeFilterIds.has(filterId) || variant.id === params.primaryVariantId) {
      continue;
    }
    const { error: archiveError } = await params.supabase
      .from("study_route_variants")
      .update({ status: "archived", is_current: false })
      .eq("id", variant.id);
    if (archiveError) {
      throw new Error(`Failed to archive stale outcome-filter variant: ${archiveError.message}`);
    }
  }

  const primaryStepsJson = stableStringify(params.primarySteps);
  const navOccupationSnapshot = await getCurrentNavOccupationSnapshot(params.supabase);
  const professionIdBySlug = await resolveCatalogProfessionIdsForNavMatches({
    supabase: params.supabase,
    navMatches: params.primaryNavContext.navMatches,
  });

  for (const filterId of alternativeFilterIds) {
    const { steps: alternativeSteps } = await buildTruthRouteStepsForOutcomeFilter({
      supabase: params.supabase,
      professionSlug: params.professionSlug,
      filterId,
      rows: params.truthRows,
      selectedCandidate: params.selectedCandidate,
      transportSortContext: params.transportSortContext,
      pathVariants: params.pathVariants,
      enrichedPathVariants: params.enrichedPathVariants,
      childContext: params.childContext,
      navOccupationSnapshot,
      professionIdBySlug,
    });

    if (stableStringify(alternativeSteps) === primaryStepsJson) {
      const existing = existingByFilter.get(filterId);
      if (existing) {
        await params.supabase
          .from("study_route_variants")
          .update({ status: "archived", is_current: false })
          .eq("id", existing.id);
      }
      continue;
    }

    const variantReason = formatOutcomeFilterVariantReason(filterId);
    const variantLabel = getRouteOutcomeFilterLabelNb(filterId);
    const existing = existingByFilter.get(filterId);

    let variantId = existing?.id ?? null;
    if (variantId) {
      const { data: currentSnapshot } = await params.supabase
        .from("study_route_snapshots")
        .select("selected_steps_payload, route_input_signature, is_current_snapshot")
        .eq("route_variant_id", variantId)
        .eq("is_current_snapshot", true)
        .maybeSingle();

      if (
        currentSnapshot &&
        snapshotPayloadMatches(
          currentSnapshot.selected_steps_payload,
          alternativeSteps,
          params.routeInputSignature,
          currentSnapshot.route_input_signature
        )
      ) {
        continue;
      }
    }

    if (!variantId) {
      const { data: insertedVariant, error: insertVariantError } = await params.supabase
        .from("study_route_variants")
        .insert({
          route_id: params.routeId,
          variant_label: variantLabel,
          variant_reason: variantReason,
          is_current: false,
          status: "draft",
          created_by_type: params.createdByType,
          created_by_user_id: params.createdByUserId,
        })
        .select("id")
        .single();

      if (insertVariantError || !insertedVariant) {
        throw new Error(
          `Failed to create outcome-filter alternative variant: ${insertVariantError?.message ?? "unknown"}`
        );
      }
      variantId = insertedVariant.id;
    } else {
      const { error: relabelError } = await params.supabase
        .from("study_route_variants")
        .update({
          variant_label: variantLabel,
          variant_reason: variantReason,
          status: "draft",
          is_current: false,
        })
        .eq("id", variantId);
      if (relabelError) {
        throw new Error(`Failed to refresh outcome-filter variant: ${relabelError.message}`);
      }
    }

    if (!variantId) {
      throw new Error("Outcome-filter variant id missing after sync setup");
    }

    await ensureOutcomeFilterSnapshot({
      supabase: params.supabase,
      variantId,
      generationReason: variantReason,
      snapshotContext: params.snapshotContext,
      alternativeSteps,
      routeInputSignature: params.routeInputSignature,
    });
  }
}
