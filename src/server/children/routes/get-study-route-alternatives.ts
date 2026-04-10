import { createClient } from "@/lib/supabase/server";
import type { StudyRouteAlternativeTeaser } from "@/lib/routes/route-types";

type Params = {
  routeId: string;
};

type VariantRow = {
  id: string;
  variant_label: string | null;
  variant_reason: string | null;
  is_current: boolean;
  status: string;
};

type SnapshotRow = {
  route_variant_id: string;
  selected_steps_payload: unknown;
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

  return typedVariants.map((variant) => {
    const snapshot = snapshotMap.get(variant.id)?.selected_steps_payload ?? null;

    return {
      variantId: variant.id,
      label:
        variant.variant_label ??
        (variant.is_current ? "Current route" : "Alternative route"),
      isCurrent: variant.is_current,
      variantStatus: variant.status,
      mainDifference:
        variant.variant_reason ??
        (variant.is_current
          ? "Current active route variant"
          : "Alternative variant for the same target profession"),
      realismDelta: null,
      riskDelta: null,
      changedStepsCount: getChangedStepsCount(currentSnapshot, snapshot),
    };
  });
}