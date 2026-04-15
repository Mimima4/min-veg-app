import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getStudyRouteDetail } from "./get-study-route-detail";
import { RouteDomainError } from "./route-errors";

type Params = {
  childId: string;
  routeId: string;
  locale?: string;
  supabase?: SupabaseClient;
};

export async function saveStudyRoute(params: Params) {
  const supabase = params.supabase ?? (await createClient());

  const { data: route, error: routeError } = await supabase
    .from("study_routes")
    .select("id, child_id, current_variant_id, status")
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

  if (route.status !== "saved") {
    const now = new Date().toISOString();

    const { error: routeUpdateError } = await supabase
      .from("study_routes")
      .update({
        status: "saved",
        updated_at: now,
        last_meaningful_change_at: now,
      })
      .eq("id", route.id);

    if (routeUpdateError) {
      throw new RouteDomainError(
        "internal_error",
        `Failed to save study route: ${routeUpdateError.message}`,
        { routeId: route.id }
      );
    }
  }

  const { error: variantUpdateError } = await supabase
    .from("study_route_variants")
    .update({
      status: "saved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", route.current_variant_id)
    .eq("route_id", route.id);

  if (variantUpdateError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to persist route variant as saved: ${variantUpdateError.message}`,
      { routeId: route.id, routeVariantId: route.current_variant_id }
    );
  }

  return getStudyRouteDetail({
    childId: route.child_id,
    routeId: route.id,
    locale: params.locale,
    supabase,
  });
}
