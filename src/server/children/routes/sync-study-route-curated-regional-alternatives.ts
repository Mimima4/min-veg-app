import {
  isCuratedRegionalVariantReason,
  parseCuratedRegionalVariantReason,
} from "@/lib/regional-delivery/curated-regional-variant-reason";
import {
  buildSteigenCarpenterVekslingSteps,
  isSteigenCarpenterVekslingPathVariantEligible,
  STEIGEN_CARPENTER_VEKSLING_VARIANT_ID,
  STEIGEN_CARPENTER_VEKSLING_VARIANT_LABEL,
  STEIGEN_CARPENTER_VEKSLING_VARIANT_REASON,
} from "@/lib/regional-delivery/steigen-carpenter-veksling-path-variant";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { SupabaseClient } from "@supabase/supabase-js";

function stableStringify(value: unknown): string {
  return JSON.stringify(value);
}

type CuratedRegionalVariantDefinition = {
  variantId: string;
  variantLabel: string;
  variantReason: string;
  isEligible: (params: {
    professionSlug: string;
    preferredMunicipalityCodes: string[];
  }) => boolean;
  buildSteps: (professionSlug: string) => StudyRouteSnapshotStep[];
};

const CURATED_REGIONAL_VARIANTS: CuratedRegionalVariantDefinition[] = [
  {
    variantId: STEIGEN_CARPENTER_VEKSLING_VARIANT_ID,
    variantLabel: STEIGEN_CARPENTER_VEKSLING_VARIANT_LABEL,
    variantReason: STEIGEN_CARPENTER_VEKSLING_VARIANT_REASON,
    isEligible: isSteigenCarpenterVekslingPathVariantEligible,
    buildSteps: buildSteigenCarpenterVekslingSteps,
  },
];

export async function syncStudyRouteCuratedRegionalAlternatives(params: {
  supabase: SupabaseClient;
  routeId: string;
  primaryVariantId: string;
  primarySteps: StudyRouteSnapshotStep[];
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  snapshotContext: unknown;
  routeInputSignature: string;
  createdByType: string;
  createdByUserId: string | null;
}): Promise<void> {
  const { data: existingVariants, error: existingError } = await params.supabase
    .from("study_route_variants")
    .select("id, variant_reason, status")
    .eq("route_id", params.routeId)
    .neq("status", "archived");

  if (existingError) {
    throw new Error(
      `Failed to load route variants for curated regional alternatives: ${existingError.message}`
    );
  }

  const existingByCuratedId = new Map<string, { id: string }>();
  for (const variant of existingVariants ?? []) {
    const curatedId = parseCuratedRegionalVariantReason(variant.variant_reason);
    if (curatedId) {
      existingByCuratedId.set(curatedId, { id: variant.id });
    }
  }

  const activeCuratedIds = new Set<string>();
  const primaryStepsJson = stableStringify(params.primarySteps);

  for (const definition of CURATED_REGIONAL_VARIANTS) {
    const eligible = definition.isEligible({
      professionSlug: params.professionSlug,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    });

    if (!eligible) {
      continue;
    }

    const alternativeSteps = definition.buildSteps(params.professionSlug);
    if (stableStringify(alternativeSteps) === primaryStepsJson) {
      continue;
    }

    activeCuratedIds.add(definition.variantId);
    const existing = existingByCuratedId.get(definition.variantId);

    let variantId = existing?.id ?? null;
    if (!variantId) {
      const { data: insertedVariant, error: insertVariantError } = await params.supabase
        .from("study_route_variants")
        .insert({
          route_id: params.routeId,
          variant_label: definition.variantLabel,
          variant_reason: definition.variantReason,
          is_current: false,
          status: "draft",
          created_by_type: params.createdByType,
          created_by_user_id: params.createdByUserId,
        })
        .select("id")
        .single();

      if (insertVariantError || !insertedVariant) {
        throw new Error(
          `Failed to create curated regional alternative variant: ${insertVariantError?.message ?? "unknown"}`
        );
      }
      variantId = insertedVariant.id;
    } else {
      const { error: relabelError } = await params.supabase
        .from("study_route_variants")
        .update({
          variant_label: definition.variantLabel,
          variant_reason: definition.variantReason,
          status: "draft",
          is_current: false,
        })
        .eq("id", variantId);
      if (relabelError) {
        throw new Error(`Failed to refresh curated regional variant: ${relabelError.message}`);
      }
    }

    await params.supabase
      .from("study_route_snapshots")
      .update({ is_current_snapshot: false })
      .eq("route_variant_id", variantId)
      .eq("is_current_snapshot", true);

    const { data: latestSnapshot } = await params.supabase
      .from("study_route_snapshots")
      .select("snapshot_version")
      .eq("route_variant_id", variantId)
      .order("snapshot_version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextSnapshotVersion =
      typeof latestSnapshot?.snapshot_version === "number"
        ? latestSnapshot.snapshot_version + 1
        : 1;

    const { error: snapshotError } = await params.supabase.from("study_route_snapshots").insert({
      route_variant_id: variantId,
      snapshot_version: nextSnapshotVersion,
      snapshot_kind: "curated_regional_alternative",
      generation_reason: definition.variantReason,
      stage_context: params.snapshotContext,
      selected_steps_payload: alternativeSteps,
      signals_payload: [],
      available_professions_payload: [],
      alternatives_teaser_payload: [],
      route_input_signature: params.routeInputSignature,
      route_source: "curated_regional_delivery",
      is_current_snapshot: true,
    });

    if (snapshotError) {
      throw new Error(
        `Failed to insert curated regional alternative snapshot: ${snapshotError.message}`
      );
    }
  }

  for (const variant of existingVariants ?? []) {
    if (variant.id === params.primaryVariantId) {
      continue;
    }
    if (!isCuratedRegionalVariantReason(variant.variant_reason)) {
      continue;
    }
    const curatedId = parseCuratedRegionalVariantReason(variant.variant_reason);
    if (curatedId && activeCuratedIds.has(curatedId)) {
      continue;
    }
    const { error: archiveError } = await params.supabase
      .from("study_route_variants")
      .update({ status: "archived", is_current: false })
      .eq("id", variant.id);
    if (archiveError) {
      throw new Error(`Failed to archive stale curated regional variant: ${archiveError.message}`);
    }
  }
}
