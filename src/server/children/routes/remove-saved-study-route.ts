import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { RouteDomainError } from "./route-errors";

type Params = {
  childId: string;
  routeId: string;
  supabase?: SupabaseClient;
};

export async function removeSavedStudyRoute(params: Params) {
  const supabase = params.supabase ?? (await createClient());

  const { data: route, error: routeError } = await supabase
    .from("study_routes")
    .select("id, child_id, status")
    .eq("id", params.routeId)
    .eq("child_id", params.childId)
    .is("archived_at", null)
    .maybeSingle();

  if (routeError || !route) {
    throw new RouteDomainError("route_not_found", "Route not found for removal", {
      childId: params.childId,
      routeId: params.routeId,
    });
  }

  const now = new Date().toISOString();
  const { error: archiveError } = await supabase
    .from("study_routes")
    .update({
      status: "archived",
      archived_at: now,
      updated_at: now,
      last_meaningful_change_at: now,
    })
    .eq("id", route.id)
    .eq("child_id", route.child_id);

  if (archiveError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to remove saved study route: ${archiveError.message}`,
      { routeId: route.id, childId: route.child_id }
    );
  }

  return {
    routeId: route.id,
    removed: true,
  };
}
