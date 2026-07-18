import {
  isCuratedRegionalVariantReason,
  parseCuratedRegionalVariantReason,
} from "@/lib/regional-delivery/curated-regional-variant-reason";
import {
  buildSteigenCarpenterVekslingStepsWithVerifiedEmployers,
  isSteigenCarpenterVekslingPathVariantEligible,
  STEIGEN_CARPENTER_VEKSLING_VARIANT_ID,
  STEIGEN_CARPENTER_VEKSLING_VARIANT_LABEL,
  STEIGEN_CARPENTER_VEKSLING_VARIANT_REASON,
} from "@/lib/regional-delivery/steigen-carpenter-veksling-path-variant";
import {
  PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID,
  isPainterNorthCrossFylkeNabofylkeVariantEligible,
} from "@/lib/regional-delivery/painter-north-cross-fylke-pilot";
import {
  buildPainterNorthCrossFylkeNabofylkeAlternativeSteps,
  buildPainterNorthCrossFylkeNabofylkeVariantLabel,
  PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_REASON,
} from "@/lib/regional-delivery/painter-north-cross-fylke-path-variant";
import {
  ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_ID,
} from "@/lib/vgs/sparse-vg2-alternative-eligibility";
import { isAnleggsteknikkSparseVg2VariantEligible } from "@/lib/regional-delivery/anleggsteknikk-sparse-vg2-pilot";
import {
  buildAnleggsteknikkSparseVg2AlternativeSteps,
  buildAnleggsteknikkSparseVg2AlternativeVariantLabel,
  ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_REASON,
} from "@/lib/regional-delivery/anleggsteknikk-sparse-vg2-path-variant";
import type { RelocationWillingness } from "@/lib/planning/school-geography-scope";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildAnleggsteknikkSparseVg2AlternativeRouteSteps } from "./build-anleggsteknikk-sparse-vg2-alternative-route-steps";
import { buildPainterNorthCrossFylkeMergedRouteSteps } from "./build-painter-north-cross-fylke-route-steps";
import { getVerifiedLarebedriftApprenticeshipOptions } from "./get-verified-larebedrift-options";

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

type BuildStepsParams = {
  supabase: SupabaseClient;
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  relocationWillingness: RelocationWillingness;
};

type CuratedRegionalVariantDefinition = {
  variantId: string;
  variantLabel: string;
  variantReason: string;
  isEligible: (params: {
    professionSlug: string;
    preferredMunicipalityCodes: string[];
  }) => boolean;
  buildSteps: (params: BuildStepsParams) => Promise<StudyRouteSnapshotStep[]>;
};

const MAX_SNAPSHOT_VERSION_INSERT_RETRIES = 5;

/**
 * Curated regional alternatives (Steigen, P-7 north painter) resolve neighbor PSA themselves.
 * They must sync even when home fylke has no programme rows / PSA truth (missing_programme_rows).
 *
 * Always sync for Contour B professions so stale variants are archived when home fylke or
 * eligibility changes (e.g. Finnmark → Buskerud must drop P-7 alternatives).
 */
export function shouldSyncStudyRouteCuratedRegionalAlternatives(params: {
  hasContourBProfessionLinks: boolean;
  contourBTruthPathUsed: boolean;
  professionSlug: string;
  preferredMunicipalityCodes: string[];
}): boolean {
  void params.contourBTruthPathUsed;
  void params.professionSlug;
  void params.preferredMunicipalityCodes;
  return params.hasContourBProfessionLinks;
}

const CURATED_REGIONAL_VARIANTS: CuratedRegionalVariantDefinition[] = [
  {
    variantId: STEIGEN_CARPENTER_VEKSLING_VARIANT_ID,
    variantLabel: STEIGEN_CARPENTER_VEKSLING_VARIANT_LABEL,
    variantReason: STEIGEN_CARPENTER_VEKSLING_VARIANT_REASON,
    isEligible: isSteigenCarpenterVekslingPathVariantEligible,
    buildSteps: ({ supabase, professionSlug, preferredMunicipalityCodes }) =>
      buildSteigenCarpenterVekslingStepsWithVerifiedEmployers({
        professionSlug,
        preferredMunicipalityCodes,
        loadVerifiedOptions: ({ larefagCode, preferredMunicipalityCodes: codes }) =>
          getVerifiedLarebedriftApprenticeshipOptions({
            supabase,
            larefagCode,
            preferredMunicipalityCodes: codes,
          }),
      }),
  },
  {
    variantId: PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_ID,
    variantLabel: buildPainterNorthCrossFylkeNabofylkeVariantLabel(),
    variantReason: PAINTER_NORTH_CROSS_FYLKE_NABOFYLKE_VARIANT_REASON,
    isEligible: isPainterNorthCrossFylkeNabofylkeVariantEligible,
    buildSteps: ({ supabase, professionSlug, preferredMunicipalityCodes }: BuildStepsParams) =>
      buildPainterNorthCrossFylkeNabofylkeAlternativeSteps({
        professionSlug,
        preferredMunicipalityCodes,
        buildMergedRouteSteps: () =>
          buildPainterNorthCrossFylkeMergedRouteSteps({
            supabase,
            professionSlug,
            preferredMunicipalityCodes,
          }),
      }),
  },
  {
    variantId: ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_ID,
    variantLabel: buildAnleggsteknikkSparseVg2AlternativeVariantLabel(),
    variantReason: ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_REASON,
    isEligible: isAnleggsteknikkSparseVg2VariantEligible,
    buildSteps: ({
      supabase,
      professionSlug,
      preferredMunicipalityCodes,
      relocationWillingness,
    }: BuildStepsParams) =>
      buildAnleggsteknikkSparseVg2AlternativeSteps({
        professionSlug,
        preferredMunicipalityCodes,
        relocationWillingness,
        buildRouteSteps: () =>
          buildAnleggsteknikkSparseVg2AlternativeRouteSteps({
            supabase,
            professionSlug,
            preferredMunicipalityCodes,
            relocationWillingness,
          }),
      }),
  },
];

async function promoteCuratedRegionalSnapshot(params: {
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
      `Failed to unset current curated regional snapshot: ${unsetError.message}`
    );
  }

  const { error: promoteError } = await params.supabase
    .from("study_route_snapshots")
    .update({ is_current_snapshot: true })
    .eq("id", params.snapshotId);

  if (promoteError) {
    throw new Error(
      `Failed to promote curated regional snapshot: ${promoteError.message}`
    );
  }
}

async function ensureCuratedRegionalSnapshot(params: {
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
      `Failed to load curated regional snapshots: ${snapshotsError.message}`
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
      await promoteCuratedRegionalSnapshot({
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

  await insertCuratedRegionalSnapshotWithRetry({
    supabase: params.supabase,
    variantId: params.variantId,
    generationReason: params.generationReason,
    snapshotContext: params.snapshotContext,
    alternativeSteps: params.alternativeSteps,
    routeInputSignature: params.routeInputSignature,
  });
}

async function insertCuratedRegionalSnapshotWithRetry(params: {
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
        `Failed to load latest curated regional snapshot version: ${latestSnapshotError.message}`
      );
    }

    const nextSnapshotVersion =
      typeof latestSnapshot?.snapshot_version === "number"
        ? latestSnapshot.snapshot_version + 1
        : 1;

    const { error: snapshotError } = await params.supabase.from("study_route_snapshots").insert({
      route_variant_id: params.variantId,
      snapshot_version: nextSnapshotVersion,
      snapshot_kind: "curated_regional_alternative",
      generation_reason: params.generationReason,
      stage_context: params.snapshotContext,
      selected_steps_payload: params.alternativeSteps,
      signals_payload: [],
      available_professions_payload: [],
      alternatives_teaser_payload: [],
      route_input_signature: params.routeInputSignature,
      // DB check constraint allows only availability_truth | legacy today.
      route_source: "legacy",
      is_current_snapshot: true,
    });

    if (!snapshotError) {
      return;
    }

    if (snapshotError.code === "23505") {
      continue;
    }

    throw new Error(
      `Failed to insert curated regional alternative snapshot: ${snapshotError.message}`
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
      `Failed to verify concurrent curated regional snapshot after retries: ${currentSnapshotError.message}`
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
    "Failed to insert curated regional alternative snapshot after retries"
  );
}

export async function syncStudyRouteCuratedRegionalAlternatives(params: {
  supabase: SupabaseClient;
  routeId: string;
  primaryVariantId: string;
  primarySteps: StudyRouteSnapshotStep[];
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  relocationWillingness: RelocationWillingness;
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

    const alternativeSteps = await definition.buildSteps({
      supabase: params.supabase,
      professionSlug: params.professionSlug,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
      relocationWillingness: params.relocationWillingness,
    });
    if (alternativeSteps.length === 0) {
      continue;
    }
    if (stableStringify(alternativeSteps) === primaryStepsJson) {
      continue;
    }

    activeCuratedIds.add(definition.variantId);
    const existing = existingByCuratedId.get(definition.variantId);

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

    if (!variantId) {
      throw new Error("Curated regional variant id missing after sync setup");
    }

    await ensureCuratedRegionalSnapshot({
      supabase: params.supabase,
      variantId,
      generationReason: definition.variantReason,
      snapshotContext: params.snapshotContext,
      alternativeSteps,
      routeInputSignature: params.routeInputSignature,
    });
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
