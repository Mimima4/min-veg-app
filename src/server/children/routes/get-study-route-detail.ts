import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudyRouteReadModel } from "@/lib/routes/route-types";
import { assembleStudyRouteReadModel } from "./assemble-study-route-read-model";
import { buildStudyRouteSnapshotContext } from "./build-study-route-snapshot-context";
import { computeRouteInputSignature } from "./compute-route-input-signature";

type Params = {
  childId: string;
  routeId: string;
  locale?: string;
  forceNewRouteAvailable?: boolean;
  supabase?: SupabaseClient;
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
  const supabase = params.supabase ?? (await createClient());

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
        route_input_signature?: string | null;
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
          stage_context,
          route_input_signature
        `
      )
      .eq("route_variant_id", route.current_variant_id)
      .eq("is_current_snapshot", true)
      .order("generated_at", { ascending: false })
      .limit(1)
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
    supabase,
  });

  const currentRouteInputSignature = computeRouteInputSignature({
    preferredMunicipalityCodes: snapshotContext.planning.preferredMunicipalityCodes,
    relocationWillingness: snapshotContext.planning.relocationWillingness,
    interestIds: snapshotContext.planning.interestIds,
    observedTraitIds: snapshotContext.planning.observedTraitIds,
    desiredIncomeBand: snapshotContext.planning.desiredIncomeBand,
    preferredWorkStyle: snapshotContext.planning.preferredWorkStyle,
    preferredEducationLevel: snapshotContext.planning.preferredEducationLevel,
  });

  const snapshotRouteInputSignature = currentSnapshot?.route_input_signature ?? null;
  const isStale =
    !snapshotRouteInputSignature ||
    snapshotRouteInputSignature !== currentRouteInputSignature;

  // Compliance guardrail for this runtime slice:
  // - LOCKED_SPEC: saved route must not be silently overwritten.
  // - LOCKED_SPEC: only working route can auto-recompute on stale signature.
  // - OPEN_DECISION: exact material-shift thresholds remain out of scope here.
  const isWorkingRoute = route.status === "draft";

  if (isStale && route.current_variant_id) {
    if (isWorkingRoute) {
      const { triggerStudyRouteRecompute } = await import(
        "./trigger-study-route-recompute"
      );

      return triggerStudyRouteRecompute({
        childId: params.childId,
        routeId: params.routeId,
        locale: params.locale,
        triggeredByType: "system",
        triggeredByUserId: null,
        supabase,
      });
    }
  }

  return assembleStudyRouteReadModel({
    locale: params.locale,
    route,
    profession: profession as ProfessionRow,
    currentSnapshot,
    snapshotContext,
    forceNewRouteAvailable: params.forceNewRouteAvailable || (isStale && !isWorkingRoute),
    supabase,
  });
}