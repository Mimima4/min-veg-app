import type { SupabaseClient } from "@supabase/supabase-js";
import { computeRouteInputSignature } from "./compute-route-input-signature";
import { buildStudyRouteSnapshotContext } from "./build-study-route-snapshot-context";
import { getAvailabilityTruthVersion } from "./get-availability-truth";
import { shouldUseAvailabilityTruth } from "./should-use-availability-truth";
import { buildAvailabilityTruthLookupInputs } from "./build-availability-truth-lookup-inputs";

type SnapshotProgrammeStep = {
  type?: string;
  program_slug?: string | null;
};

export function isLegacyTruthSnapshotShape(selectedStepsPayload: unknown): boolean {
  if (!Array.isArray(selectedStepsPayload)) {
    return false;
  }

  let hasProgressionStep = false;
  let hasApprenticeshipStep = false;
  let hasLarefagStep = false;
  let hasKolonne3InApprenticeship = false;

  for (const step of selectedStepsPayload) {
    if (!step || typeof step !== "object" || Array.isArray(step)) {
      continue;
    }
    const typedStep = step as {
      type?: string;
      stage?: string;
      apprenticeship_options?: Array<{ option_id?: string }>;
    };
    if (typedStep.type === "progression_step") {
      hasProgressionStep = true;
    }
    if (typedStep.type === "apprenticeship_step") {
      hasApprenticeshipStep = true;
      if (
        (typedStep.apprenticeship_options ?? []).some((option) =>
          String(option.option_id ?? "").startsWith("kolonne3-")
        )
      ) {
        hasKolonne3InApprenticeship = true;
      }
    }
    if (typedStep.type === "programme_selection" && typedStep.stage === "LAREFAG") {
      hasLarefagStep = true;
    }
  }

  if (hasProgressionStep || !hasApprenticeshipStep) {
    return true;
  }

  // Pre model-B electrician snapshots mixed kolonne-3 fag into apprenticeship_options.
  return hasKolonne3InApprenticeship && !hasLarefagStep;
}

export type StudyRouteStaleness = {
  isStale: boolean;
  isDraft: boolean;
};

export async function evaluateStudyRouteStaleness(params: {
  childId: string;
  routeId: string;
  locale?: string;
  supabase: SupabaseClient;
}): Promise<StudyRouteStaleness | null> {
  const { data: route, error: routeError } = await params.supabase
    .from("study_routes")
    .select(
      `
        id,
        child_id,
        target_profession_id,
        status,
        current_variant_id
      `
    )
    .eq("id", params.routeId)
    .eq("child_id", params.childId)
    .is("archived_at", null)
    .maybeSingle();

  if (routeError || !route) {
    return null;
  }

  if (!route.current_variant_id) {
    return { isStale: true, isDraft: route.status === "draft" };
  }

  const { data: profession, error: professionError } = await params.supabase
    .from("professions")
    .select("slug")
    .eq("id", route.target_profession_id)
    .eq("is_active", true)
    .maybeSingle();

  if (professionError || !profession?.slug) {
    return null;
  }

  const { data: currentSnapshot, error: snapshotError } = await params.supabase
    .from("study_route_snapshots")
    .select(
      `
        selected_steps_payload,
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
    return null;
  }

  const snapshotContext = await buildStudyRouteSnapshotContext({
    locale: params.locale ?? "en",
    childId: route.child_id,
    routeId: route.id,
    routeVariantId: route.current_variant_id,
    targetProfessionId: route.target_profession_id,
    supabase: params.supabase,
  });

  const { data: programLinks, error: programLinksError } = await params.supabase
    .from("profession_program_links")
    .select("program_slug")
    .eq("profession_slug", profession.slug);

  if (programLinksError) {
    return null;
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
    supabase: params.supabase,
    preferredMunicipalityCodes: snapshotContext.planning.preferredMunicipalityCodes,
    primaryProgrammeSlugs,
    fallbackProgrammeSlugs,
  });

  const { useTruth } = await shouldUseAvailabilityTruth({
    countyCodes: truthLookupInputs.countyCodes,
    programmeSlugsOrCodes: truthLookupInputs.programmeSlugsOrCodes,
    locale: params.locale,
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
      ? ((currentSnapshot.selected_steps_payload[0] as { source?: string }).source ??
        null)
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

  return {
    isStale,
    isDraft: route.status === "draft",
  };
}
