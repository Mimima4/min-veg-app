import type { SupabaseClient } from "@supabase/supabase-js";

type RouteRow = {
  id: string;
  status: string;
  current_variant_id: string | null;
};

/**
 * Outcome-filter alternative variants live on the working draft route.
 * Saved route rows only store the user-saved snapshot variant.
 */
export async function resolveAlternativesSourceRouteId(params: {
  supabase: SupabaseClient;
  childId: string;
  targetProfessionId: string;
  routeId: string;
  routeStatus: string;
}): Promise<string> {
  if (params.routeStatus !== "saved") {
    return params.routeId;
  }

  const { data: siblingRoutes, error } = await params.supabase
    .from("study_routes")
    .select("id, status, current_variant_id")
    .eq("child_id", params.childId)
    .eq("target_profession_id", params.targetProfessionId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error || !siblingRoutes?.length) {
    return params.routeId;
  }

  const typedRoutes = siblingRoutes as RouteRow[];
  const routeIds = typedRoutes.map((route) => route.id);

  const { data: variants, error: variantsError } = await params.supabase
    .from("study_route_variants")
    .select("route_id, status, is_current")
    .in("route_id", routeIds)
    .eq("is_current", true);

  if (variantsError) {
    return params.routeId;
  }

  const variantStatusByRouteId = new Map<string, string>();
  for (const variant of variants ?? []) {
    variantStatusByRouteId.set(variant.route_id, variant.status);
  }

  const workingDraft = typedRoutes.find((route) => {
    if (route.status === "draft") {
      return true;
    }
    return variantStatusByRouteId.get(route.id) === "draft";
  });

  return workingDraft?.id ?? params.routeId;
}
