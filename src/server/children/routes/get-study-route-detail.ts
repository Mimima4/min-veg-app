import { createClient } from "@/lib/supabase/server";
import type { StudyRouteReadModel } from "@/lib/routes/route-types";
import { assembleStudyRouteReadModel } from "./assemble-study-route-read-model";
import { buildStudyRouteSnapshotContext } from "./build-study-route-snapshot-context";

type Params = {
  childId: string;
  routeId: string;
  locale?: string;
};

type ProfessionRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
  competition_level?: string | null;
};

export async function getStudyRouteDetail(
  params: Params
): Promise<StudyRouteReadModel> {
  const supabase = await createClient();

  const { data: route, error: routeError } = await supabase
    .from("study_routes")
    .select(
      `
        id,
        child_id,
        target_profession_id,
        status,
        current_variant_id,
        last_meaningful_change_at
      `
    )
    .eq("id", params.routeId)
    .eq("child_id", params.childId)
    .is("archived_at", null)
    .maybeSingle();

  if (routeError) {
    throw new Error(`Failed to fetch study route: ${routeError.message}`);
  }

  if (!route) {
    throw new Error("Study route not found");
  }

  const { data: profession, error: professionError } = await supabase
    .from("professions")
    .select("id, slug, title_i18n")
    .eq("id", route.target_profession_id)
    .eq("is_active", true)
    .maybeSingle();

  if (professionError) {
    throw new Error(
      `Failed to fetch study route profession: ${professionError.message}`
    );
  }

  if (!profession) {
    throw new Error(
      `Study route ${route.id} references missing or inactive profession ${route.target_profession_id}`
    );
  }

  let currentSnapshot:
    | {
        generated_at: string;
        selected_steps_payload: unknown;
        signals_payload: unknown;
        stage_context?: unknown;
      }
    | null = null;

  if (route.current_variant_id) {
    const { data: snapshot, error: snapshotError } = await supabase
      .from("study_route_snapshots")
      .select(
        `
          generated_at,
          selected_steps_payload,
          signals_payload,
          stage_context
        `
      )
      .eq("route_variant_id", route.current_variant_id)
      .eq("is_current_snapshot", true)
      .maybeSingle();

    if (snapshotError) {
      throw new Error(
        `Failed to fetch current study route snapshot: ${snapshotError.message}`
      );
    }

    currentSnapshot = snapshot;
  }

  const snapshotContext = await buildStudyRouteSnapshotContext({
    locale: params.locale ?? "en",
    childId: route.child_id,
    routeId: route.id,
    routeVariantId: route.current_variant_id,
    targetProfessionId: route.target_profession_id,
  });

  return assembleStudyRouteReadModel({
    locale: params.locale,
    route,
    profession: profession as ProfessionRow,
    currentSnapshot,
    snapshotContext,
  });
}