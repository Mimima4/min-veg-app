import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StudyRouteReadModel } from "@/lib/routes/route-types";
import { assembleStudyRouteReadModel } from "./assemble-study-route-read-model";
import { buildStudyRouteSnapshotContext } from "./build-study-route-snapshot-context";
import { computeRouteInputSignature } from "./compute-route-input-signature";
import { getAvailabilityTruthVersion } from "./get-availability-truth";
import { shouldUseAvailabilityTruth } from "./should-use-availability-truth";
import { buildAvailabilityTruthLookupInputs } from "./build-availability-truth-lookup-inputs";

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

type SnapshotProgrammeStep = {
  type?: string;
  program_slug?: string | null;
};

function isLegacyTruthSnapshotShape(selectedStepsPayload: unknown): boolean {
  if (!Array.isArray(selectedStepsPayload)) {
    return false;
  }

  let hasProgressionStep = false;
  let hasApprenticeshipStep = false;

  for (const step of selectedStepsPayload) {
    if (!step || typeof step !== "object" || Array.isArray(step)) {
      continue;
    }
    const typedStep = step as { type?: string };
    if (typedStep.type === "progression_step") {
      hasProgressionStep = true;
    }
    if (typedStep.type === "apprenticeship_step") {
      hasApprenticeshipStep = true;
    }
  }

  return hasProgressionStep || !hasApprenticeshipStep;
}

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
        route_source?: "availability_truth" | "legacy" | null;
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
          route_input_signature,
          route_source
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

  const { data: programLinks, error: programLinksError } = await supabase
    .from("profession_program_links")
    .select("program_slug")
    .eq("profession_slug", (profession as ProfessionRow).slug);

  if (programLinksError) {
    throw new Error(
      `Failed to load profession-program links for truth precedence: ${programLinksError.message}`
    );
  }

  const fallbackProgrammeSlugs = Array.from(
    new Set(
      ((programLinks ?? []) as Array<{ program_slug: string | null }>)
        .map((row) => row.program_slug)
        .filter((value): value is string => Boolean(value))
    )
  );
  const snapshotSteps = Array.isArray(currentSnapshot?.selected_steps_payload)
    ? (currentSnapshot.selected_steps_payload as SnapshotProgrammeStep[])
    : [];
  const currentProgrammeStep = snapshotSteps.find(
    (step) =>
      step?.type === "programme_selection" &&
      typeof step.program_slug === "string" &&
      step.program_slug.trim().length > 0
  );
  const primaryProgrammeSlugs =
    typeof currentProgrammeStep?.program_slug === "string"
      ? [currentProgrammeStep.program_slug]
      : [];
  const truthLookupInputs = await buildAvailabilityTruthLookupInputs({
    supabase,
    preferredMunicipalityCodes: snapshotContext.planning.preferredMunicipalityCodes,
    primaryProgrammeSlugs,
    fallbackProgrammeSlugs,
  });
  const { useTruth } = await shouldUseAvailabilityTruth({
    countyCodes: truthLookupInputs.countyCodes,
    programmeSlugsOrCodes: truthLookupInputs.programmeSlugsOrCodes,
  });

  const truthVersion =
    truthLookupInputs.countyCodes.length > 0
      ? await getAvailabilityTruthVersion({
          countyCode: truthLookupInputs.countyCodes[0] ?? "",
          programmeSlugsOrCodes: truthLookupInputs.programmeSlugsOrCodes,
        })
      : null;

  const currentRouteInputSignature = computeRouteInputSignature({
    preferredMunicipalityCodes: snapshotContext.planning.preferredMunicipalityCodes,
    relocationWillingness: snapshotContext.planning.relocationWillingness,
    interestIds: snapshotContext.planning.interestIds,
    observedTraitIds: snapshotContext.planning.observedTraitIds,
    desiredIncomeBand: snapshotContext.planning.desiredIncomeBand,
    preferredWorkStyle: snapshotContext.planning.preferredWorkStyle,
    preferredEducationLevel: snapshotContext.planning.preferredEducationLevel,
    truthVersion,
  });

  const snapshotRouteInputSignature = currentSnapshot?.route_input_signature ?? null;
  const snapshotSource =
    currentSnapshot?.route_source ??
    (Array.isArray(currentSnapshot?.selected_steps_payload) &&
    currentSnapshot?.selected_steps_payload.length > 0 &&
    typeof currentSnapshot.selected_steps_payload[0] === "object" &&
    currentSnapshot.selected_steps_payload[0] !== null &&
    "source" in currentSnapshot.selected_steps_payload[0]
      ? ((currentSnapshot.selected_steps_payload[0] as { source?: string }).source ?? null)
      : null);
  const isTruthPromotionNeeded =
    useTruth && snapshotSource !== "availability_truth" && Boolean(route.current_variant_id);
  const isLegacyTruthShapeStale =
    snapshotSource === "availability_truth" &&
    isLegacyTruthSnapshotShape(currentSnapshot?.selected_steps_payload);
  const isStale =
    !snapshotRouteInputSignature ||
    snapshotRouteInputSignature !== currentRouteInputSignature ||
    isTruthPromotionNeeded ||
    isLegacyTruthShapeStale;

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

  const showUpdateAvailableForSavedRoute =
    route.status === "saved" &&
    useTruth &&
    snapshotSource === "legacy";

  return assembleStudyRouteReadModel({
    locale: params.locale,
    route,
    profession: profession as ProfessionRow,
    currentSnapshot,
    snapshotContext,
    forceNewRouteAvailable:
      params.forceNewRouteAvailable ||
      (isStale && !isWorkingRoute) ||
      showUpdateAvailableForSavedRoute,
    supabase,
  });
}