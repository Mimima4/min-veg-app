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

function stableStringify(value: unknown): string {
  return JSON.stringify(normalizeJsonValue(value));
}

function buildSelectionSignatureFromPayload(selectedStepsPayload: unknown): string {
  if (!Array.isArray(selectedStepsPayload)) {
    return stableStringify([]);
  }

  const signatureEntries: Array<{ stepKey: string; optionId: string }> = [];

  selectedStepsPayload.forEach((step, index) => {
    if (!step || typeof step !== "object" || Array.isArray(step)) return;
    const typedStep = step as Record<string, unknown>;
    const stepType = typedStep.type;
    if (stepType !== "programme_selection" && stepType !== "apprenticeship_step") return;

    const stepKey = `snap-${index}-${String(stepType)}-${String(typedStep.program_slug ?? "none")}`;

    if (stepType === "programme_selection") {
      const options = Array.isArray(typedStep.options)
        ? (typedStep.options as Array<Record<string, unknown>>)
        : [];
      if (options.length === 0) return;

      const targetSchool =
        typeof typedStep.institution_name === "string" ? typedStep.institution_name : null;
      const targetLocation =
        typeof typedStep.institution_city === "string"
          ? typedStep.institution_city
          : typeof typedStep.institution_municipality === "string"
            ? typedStep.institution_municipality
            : null;
      const targetWebsite =
        typeof typedStep.institution_website === "string" ? typedStep.institution_website : null;

      const matchedOptionIndex = options.findIndex((option) => {
        const schoolName =
          typeof option.institution_name === "string" ? option.institution_name : null;
        if (!targetSchool || schoolName !== targetSchool) return false;

        const location =
          typeof option.institution_city === "string"
            ? option.institution_city
            : typeof option.institution_municipality === "string"
              ? option.institution_municipality
              : null;
        if (targetLocation && location && location !== targetLocation) return false;

        const website =
          typeof option.institution_website === "string" ? option.institution_website : null;
        if (targetWebsite && website && website !== targetWebsite) return false;

        return true;
      });

      const selectedIndex = matchedOptionIndex >= 0 ? matchedOptionIndex : 0;
      const selectedOption = options[selectedIndex];
      const institutionId =
        selectedOption && typeof selectedOption.institution_id === "string"
          ? selectedOption.institution_id
          : String(selectedIndex);
      signatureEntries.push({
        stepKey,
        optionId: `programme-${institutionId}`,
      });
      return;
    }

    const apprenticeshipOptions = Array.isArray(typedStep.apprenticeship_options)
      ? (typedStep.apprenticeship_options as Array<Record<string, unknown>>)
      : [];
    const selectedApprenticeshipId =
      typeof typedStep.selected_apprenticeship_option_id === "string"
        ? typedStep.selected_apprenticeship_option_id
        : null;
    const fallbackApprenticeshipId =
      apprenticeshipOptions[0] && typeof apprenticeshipOptions[0].option_id === "string"
        ? apprenticeshipOptions[0].option_id
        : null;
    const optionId = selectedApprenticeshipId ?? fallbackApprenticeshipId;
    if (!optionId) return;
    signatureEntries.push({ stepKey, optionId });
  });

  return stableStringify(signatureEntries);
}

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

  const { data: savedRoutesForProfession, error: savedRoutesForProfessionError } = await supabase
    .from("study_routes")
    .select("id, current_variant_id")
    .eq("child_id", route.child_id)
    .eq("target_profession_id", route.target_profession_id)
    .eq("status", "saved")
    .is("archived_at", null);

  if (savedRoutesForProfessionError) {
    throw new Error(
      `Failed to fetch saved routes for equivalence: ${savedRoutesForProfessionError.message}`
    );
  }

  const savedRoutes = (savedRoutesForProfession ?? []) as Array<{
    id: string;
    current_variant_id: string | null;
  }>;
  const savedVariantIds = savedRoutes
    .map((savedRoute) => savedRoute.current_variant_id)
    .filter((value): value is string => Boolean(value));

  let equivalentSavedRouteId: string | null = null;
  const savedSelectionSignatures: string[] = [];
  if (savedVariantIds.length > 0) {
    const { data: savedSnapshots, error: savedSnapshotsError } = await supabase
      .from("study_route_snapshots")
      .select("route_variant_id, selected_steps_payload")
      .in("route_variant_id", savedVariantIds)
      .eq("is_current_snapshot", true);

    if (savedSnapshotsError) {
      throw new Error(
        `Failed to fetch saved snapshots for equivalence: ${savedSnapshotsError.message}`
      );
    }

    const normalizedCurrentPayload = stableStringify(
      normalizeApprenticeshipSelectionPayload(currentSnapshot?.selected_steps_payload ?? [])
    );
    const normalizedByVariantId = new Map<string, string>();
    for (const snapshot of (savedSnapshots ?? []) as Array<{
      route_variant_id: string;
      selected_steps_payload: unknown;
    }>) {
      savedSelectionSignatures.push(
        buildSelectionSignatureFromPayload(snapshot.selected_steps_payload ?? [])
      );
      normalizedByVariantId.set(
        snapshot.route_variant_id,
        stableStringify(
          normalizeApprenticeshipSelectionPayload(snapshot.selected_steps_payload ?? [])
        )
      );
    }

    const equivalentSavedRoute = savedRoutes.find((savedRoute) => {
      if (!savedRoute.current_variant_id) return false;
      return (
        normalizedByVariantId.get(savedRoute.current_variant_id) === normalizedCurrentPayload
      );
    });
    equivalentSavedRouteId = equivalentSavedRoute?.id ?? null;
  }
  const alreadySavedEquivalent = Boolean(equivalentSavedRouteId);

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
    alreadySavedEquivalent,
    equivalentSavedRouteId,
    savedSelectionSignatures: Array.from(new Set(savedSelectionSignatures)),
    supabase,
  });
}