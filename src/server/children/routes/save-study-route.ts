import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStudyRouteDetail } from "./get-study-route-detail";
import { RouteDomainError } from "./route-errors";

type Params = {
  childId: string;
  routeId: string;
  locale?: string;
  supabase?: SupabaseClient;
  selectedOptions?: Record<string, string>;
};

function applySelectedOptions(
  steps: any[],
  selectedOptions: Record<string, string> | undefined
) {
  if (!Array.isArray(steps) || !selectedOptions) return steps;

  return steps.map((step, index) => {
    const stepKey = `snap-${index}-${step.type}-${step.program_slug ?? "none"}`;
    const selectedId = selectedOptions[stepKey];

    if (step.type === "apprenticeship_step") {
      if (!selectedId || !Array.isArray(step.apprenticeship_options)) return step;

      const selected = step.apprenticeship_options.find((option: any) => {
        return option.option_id === selectedId;
      });

      if (!selected) return step;

      return {
        ...step,
        selected_apprenticeship_option_id: selected.option_id,
        selected_apprenticeship_option_title: selected.option_title,
      };
    }

    if (step.type !== "programme_selection") return step;
    if (!selectedId || !Array.isArray(step.options)) return step;

    const selected = step.options.find((opt: any, i: number) => {
      const id = `programme-${opt.institution_id ?? i}`;
      return id === selectedId;
    });

    if (!selected) return step;

    return {
      ...step,
      institution_name: selected.institution_name ?? step.institution_name,
      institution_city: selected.institution_city ?? step.institution_city,
      institution_municipality:
        selected.institution_municipality ?? step.institution_municipality,
      institution_website: selected.institution_website ?? step.institution_website,
      program_slug: selected.program_slug ?? step.program_slug,
    };
  });
}

function normalizeApprenticeshipSelectionPayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeApprenticeshipSelectionPayload(item));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  if (record.type !== "apprenticeship_step") {
    return Object.fromEntries(
      Object.entries(record).map(([key, nestedValue]) => [
        key,
        normalizeApprenticeshipSelectionPayload(nestedValue),
      ])
    );
  }

  const apprenticeshipOptions = Array.isArray(record.apprenticeship_options)
    ? (record.apprenticeship_options as Array<Record<string, unknown>>)
    : [];
  const explicitSelectedId =
    typeof record.selected_apprenticeship_option_id === "string" &&
    record.selected_apprenticeship_option_id.length > 0
      ? record.selected_apprenticeship_option_id
      : null;
  const fallbackSelectedId = apprenticeshipOptions[0]?.option_id;
  const effectiveSelectedId =
    explicitSelectedId ??
    (typeof fallbackSelectedId === "string" && fallbackSelectedId.length > 0
      ? fallbackSelectedId
      : null);
  const matchedOption =
    effectiveSelectedId === null
      ? null
      : apprenticeshipOptions.find(
          (option) => option && option.option_id === effectiveSelectedId
        ) ?? null;
  const explicitSelectedTitle =
    typeof record.selected_apprenticeship_option_title === "string" &&
    record.selected_apprenticeship_option_title.length > 0
      ? record.selected_apprenticeship_option_title
      : null;
  const fallbackSelectedTitle = apprenticeshipOptions[0]?.option_title;
  const effectiveSelectedTitle =
    (matchedOption && typeof matchedOption.option_title === "string"
      ? matchedOption.option_title
      : null) ??
    explicitSelectedTitle ??
    (typeof fallbackSelectedTitle === "string" ? fallbackSelectedTitle : null);

  return {
    ...Object.fromEntries(
      Object.entries(record).map(([key, nestedValue]) => [
        key,
        normalizeApprenticeshipSelectionPayload(nestedValue),
      ])
    ),
    selected_apprenticeship_option_id: effectiveSelectedId,
    selected_apprenticeship_option_title: effectiveSelectedTitle,
  };
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

export async function saveStudyRoute(params: Params) {
  const supabase = params.supabase ?? (await createClient());

  const { data: route, error: routeError } = await supabase
    .from("study_routes")
    .select("id, child_id, target_profession_id, current_variant_id, status")
    .eq("id", params.routeId)
    .eq("child_id", params.childId)
    .is("archived_at", null)
    .maybeSingle();

  if (routeError || !route) {
    throw new RouteDomainError("route_not_found", "Route not found for save", {
      childId: params.childId,
      routeId: params.routeId,
    });
  }

  if (!route.current_variant_id) {
    throw new RouteDomainError(
      "route_variant_conflict",
      "Route has no current variant to save",
      { routeId: route.id }
    );
  }

  const { data: currentSnapshot, error: currentSnapshotError } = await supabase
    .from("study_route_snapshots")
    .select(
      "selected_steps_payload, signals_payload, stage_context, available_professions_payload, alternatives_teaser_payload, route_input_signature, route_source"
    )
    .eq("route_variant_id", route.current_variant_id)
    .eq("is_current_snapshot", true)
    .maybeSingle();

  if (currentSnapshotError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to fetch current route snapshot: ${currentSnapshotError.message}`,
      { routeId: route.id, routeVariantId: route.current_variant_id }
    );
  }

  const updatedSteps = applySelectedOptions(
    currentSnapshot?.selected_steps_payload ?? [],
    params.selectedOptions
  );
  const normalizedUpdatedSteps = stableStringify(
    normalizeApprenticeshipSelectionPayload(updatedSteps)
  );

  const { data: savedRoutes, error: savedRoutesError } = await supabase
    .from("study_routes")
    .select("id, current_variant_id")
    .eq("child_id", route.child_id)
    .eq("target_profession_id", route.target_profession_id)
    .eq("status", "saved")
    .is("archived_at", null);

  if (savedRoutesError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to fetch existing saved routes: ${savedRoutesError.message}`,
      { routeId: route.id }
    );
  }

  const savedRouteRows = (savedRoutes ?? []) as Array<{
    id: string;
    current_variant_id: string | null;
  }>;
  const savedVariantIds = savedRouteRows
    .map((savedRoute) => savedRoute.current_variant_id)
    .filter((value): value is string => Boolean(value));

  if (savedVariantIds.length > 0) {
    const { data: savedSnapshots, error: savedSnapshotsError } = await supabase
      .from("study_route_snapshots")
      .select("route_variant_id, selected_steps_payload")
      .in("route_variant_id", savedVariantIds)
      .eq("is_current_snapshot", true);

    if (savedSnapshotsError) {
      throw new RouteDomainError(
        "internal_error",
        `Failed to fetch existing saved snapshots: ${savedSnapshotsError.message}`,
        { routeId: route.id }
      );
    }

    const normalizedByVariantId = new Map<string, string>();
    for (const snapshot of (savedSnapshots ?? []) as Array<{
      route_variant_id: string;
      selected_steps_payload: unknown;
    }>) {
      normalizedByVariantId.set(
        snapshot.route_variant_id,
        stableStringify(
          normalizeApprenticeshipSelectionPayload(snapshot.selected_steps_payload ?? [])
        )
      );
    }

    const equivalentSavedRoute = savedRouteRows.find((savedRoute) => {
      if (!savedRoute.current_variant_id) return false;
      return normalizedByVariantId.get(savedRoute.current_variant_id) === normalizedUpdatedSteps;
    });

    if (equivalentSavedRoute) {
      const locale = params.locale ?? "en";
      revalidatePath(`/${locale}/app/children/${route.child_id}`);
      revalidatePath(`/${locale}/app/children/${route.child_id}/route`);
      revalidatePath(`/${locale}/app/route`);
      return getStudyRouteDetail({
        childId: route.child_id,
        routeId: equivalentSavedRoute.id,
        locale: params.locale,
        supabase,
      });
    }
  }

  const { data: newRoute, error: newRouteError } = await supabase
    .from("study_routes")
    .insert({
      child_id: route.child_id,
      target_profession_id: route.target_profession_id,
      status: "saved",
      created_by_type: "user",
      created_by_user_id: null,
    })
    .select("id")
    .single();

  if (newRouteError || !newRoute) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to create saved study route row: ${newRouteError?.message ?? "Unknown error"}`,
      { routeId: route.id }
    );
  }
  const targetRouteId = newRoute.id;

  const { data: newVariant, error: newVariantError } = await supabase
    .from("study_route_variants")
    .insert({
      route_id: targetRouteId,
      variant_label: "User saved route",
      variant_reason: "User selection",
      is_current: true,
      status: "saved",
      created_by_type: "user",
      created_by_user_id: null,
    })
    .select("id")
    .single();

  if (newVariantError || !newVariant) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to create saved route variant: ${newVariantError?.message ?? "Unknown error"}`,
      { routeId: route.id }
    );
  }

  const { error: snapshotInsertError } = await supabase.from("study_route_snapshots").insert({
    route_variant_id: newVariant.id,
    snapshot_version: 1,
    snapshot_kind: "user_saved",
    generation_reason: "user_selected_options",
    stage_context: currentSnapshot?.stage_context ?? null,
    selected_steps_payload: updatedSteps,
    signals_payload: currentSnapshot?.signals_payload ?? null,
    available_professions_payload: currentSnapshot?.available_professions_payload ?? null,
    alternatives_teaser_payload: currentSnapshot?.alternatives_teaser_payload ?? null,
    route_input_signature: currentSnapshot?.route_input_signature ?? null,
    route_source: currentSnapshot?.route_source ?? "availability_truth",
    is_current_snapshot: true,
  });

  if (snapshotInsertError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to create route snapshot: ${snapshotInsertError.message}`,
      { routeId: route.id, routeVariantId: newVariant.id }
    );
  }

  const now = new Date().toISOString();
  const routeUpdatePayload = {
    current_variant_id: newVariant.id,
    status: "saved",
    updated_at: now,
    last_meaningful_change_at: now,
  };
  const { error: routeUpdateError } = await supabase
    .from("study_routes")
    .update(routeUpdatePayload)
    .eq("id", targetRouteId);

  if (routeUpdateError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to update study route: ${routeUpdateError.message}`,
      { routeId: targetRouteId, routeVariantId: newVariant.id }
    );
  }

  const locale = params.locale ?? "en";
  revalidatePath(`/${locale}/app/children/${route.child_id}`);
  revalidatePath(`/${locale}/app/children/${route.child_id}/route`);
  revalidatePath(`/${locale}/app/route`);

  return getStudyRouteDetail({
    childId: route.child_id,
    routeId: targetRouteId,
    locale: params.locale,
    supabase,
  });
}
