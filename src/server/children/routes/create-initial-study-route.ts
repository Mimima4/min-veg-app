import { createClient } from "@/lib/supabase/server";
import type {
  StudyRouteReadModel,
  StudyRouteSnapshotStep,
  StudyRouteProgressionSnapshotStep,
  StudyRouteOutcomeSnapshotStep,
} from "@/lib/routes/route-types";
import { buildStudyRouteSnapshotContext } from "./build-study-route-snapshot-context";
import {
  getRouteAuthenticityRule,
  type RouteAuthenticityStep,
} from "./route-authenticity-rules";
import { getStudyRouteDetail } from "./get-study-route-detail";
import { RouteDomainError } from "./route-errors";
import {
  selectProgrammeForRoute,
  type RouteEducationProgram,
  type RouteInstitution,
  type RouteProgramLink,
} from "./select-programme-for-route";
import { computeRouteInputSignature } from "./compute-route-input-signature";
import { getRouteAdmissionRealism } from "./get-route-admission-realism";
import { buildRouteSignals } from "./build-route-signals";
import { getAvailabilityTruthVersion } from "./get-availability-truth";
import { buildStepsFromAvailabilityTruth } from "./build-steps-from-availability-truth";
import { shouldUseAvailabilityTruth } from "./should-use-availability-truth";
import { buildAvailabilityTruthLookupInputs } from "./build-availability-truth-lookup-inputs";
import { buildPathVariants } from "./build-path-variants";
import { mapVilbliOutcomesToNav } from "./map-vilbli-outcomes-to-nav";
import { selectTruthCandidateForRoute } from "./select-truth-candidate-for-route";

type Params = {
  childId: string;
  targetProfessionId: string;
  locale?: string;
  createdByType?: string;
  createdByUserId?: string | null;
};

type ProfessionRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
};

type ChildPlanningRow = {
  id: string;
  preferred_municipality_codes: unknown;
  relocation_willingness: "no" | "maybe" | "yes" | null;
};

type ExistingRouteRow = {
  id: string;
  status: string;
  current_variant_id: string | null;
  updated_at: string;
};

type ExistingVariantRow = {
  route_id: string;
  status: string;
  is_current: boolean;
};

type SavedSnapshotProgrammeStep = {
  type?: string;
  program_slug?: string | null;
};

function deriveStageProgrammeIdentity(
  linkedPrograms: Array<{ slug: string; title: string | null }>
): Map<"VG1" | "VG2" | "VG3", { slug: string; title: string | null }> {
  const byStage = new Map<"VG1" | "VG2" | "VG3", { slug: string; title: string | null }>();
  const sorted = [...linkedPrograms].sort((a, b) => a.slug.localeCompare(b.slug));
  for (const program of sorted) {
    const normalizedTitle = (program.title ?? "").trim();
    const stageMatch = normalizedTitle.match(/^(VG[1-3])\b/i);
    const stage = stageMatch?.[1]?.toUpperCase() as "VG1" | "VG2" | "VG3" | undefined;
    if (!stage) continue;
    if (!byStage.has(stage)) {
      byStage.set(stage, { slug: program.slug, title: program.title });
    }
  }
  return byStage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (!isRecord(value)) {
    return JSON.stringify(value);
  }

  const keys = Object.keys(value).sort();
  const serialized = keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",");
  return `{${serialized}}`;
}

function extractMaterialSignalsSubset(signals: unknown): {
  warnings: unknown;
  feasibilitySummary: unknown;
} {
  if (!isRecord(signals)) {
    return {
      warnings: null,
      feasibilitySummary: null,
    };
  }

  return {
    warnings: signals.warnings ?? null,
    feasibilitySummary: signals.feasibilitySummary ?? null,
  };
}

function toAuthenticitySnapshotStep(params: {
  step: RouteAuthenticityStep;
  professionSlug: string;
}): StudyRouteProgressionSnapshotStep | StudyRouteOutcomeSnapshotStep {
  const common = {
    title: params.step.title,
    institution_name: null,
    education_level: params.step.education_level,
    fit_band: params.step.fit_band,
    program_slug: null,
    current_profession_slug: params.professionSlug,
    source: "legacy" as const,
  };

  if (params.step.type === "progression_step") {
    return {
      type: "progression_step",
      ...common,
    };
  }

  return {
    type: "outcome_step",
    ...common,
  };
}

export async function createInitialStudyRoute(
  params: Params
): Promise<StudyRouteReadModel> {
  const supabase = await createClient();
  const locale = params.locale ?? "en";
  const createdByType = params.createdByType ?? "parent";
  const createdByUserId = params.createdByUserId ?? null;

  const [{ data: child }, { data: profession, error: professionError }] =
    await Promise.all([
      supabase
        .from("child_profiles")
        .select("id, preferred_municipality_codes, relocation_willingness")
        .eq("id", params.childId)
        .maybeSingle(),
      supabase
        .from("professions")
        .select("id, slug, title_i18n")
        .eq("id", params.targetProfessionId)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

  if (!child) {
    throw new RouteDomainError("route_access_denied", "Child profile not found", {
      childId: params.childId,
    });
  }

  const childPlanning = child as ChildPlanningRow;

  if (professionError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to load target profession for route creation: ${professionError.message}`
    );
  }

  if (!profession) {
    throw new RouteDomainError(
      "route_not_found",
      "Target profession is missing or inactive",
      { targetProfessionId: params.targetProfessionId }
    );
  }

  const { data: savedLink, error: savedLinkError } = await supabase
    .from("child_profession_interests")
    .select("id")
    .eq("child_profile_id", params.childId)
    .eq("profession_id", params.targetProfessionId)
    .maybeSingle();

  if (savedLinkError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to verify saved profession before route creation: ${savedLinkError.message}`
    );
  }

  if (!savedLink) {
    throw new RouteDomainError(
      "profession_not_saved_for_child",
      "Cannot create route because the profession is not saved for this child",
      {
        childId: params.childId,
        targetProfessionId: params.targetProfessionId,
      }
    );
  }

  const { data: existingRoutes, error: existingRoutesError } = await supabase
    .from("study_routes")
    .select("id, status, current_variant_id, updated_at")
    .eq("child_id", params.childId)
    .eq("target_profession_id", params.targetProfessionId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (existingRoutesError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to check existing route before creation: ${existingRoutesError.message}`
    );
  }

  const typedExistingRoutes = (existingRoutes ?? []) as ExistingRouteRow[];
  const routeIdsWithCurrentVariant = typedExistingRoutes
    .map((route) => route.id)
    .filter(Boolean);

  let currentVariantStatusByRouteId = new Map<string, string>();
  if (routeIdsWithCurrentVariant.length > 0) {
    const { data: variants, error: variantsError } = await supabase
      .from("study_route_variants")
      .select("route_id, status, is_current")
      .in("route_id", routeIdsWithCurrentVariant)
      .eq("is_current", true);

    if (variantsError) {
      throw new RouteDomainError(
        "internal_error",
        `Failed to verify current route variants before creation: ${variantsError.message}`
      );
    }

    currentVariantStatusByRouteId = new Map(
      ((variants ?? []) as ExistingVariantRow[]).map((variant) => [
        variant.route_id,
        variant.status,
      ])
    );
  }

  const existingWorkingRoute = typedExistingRoutes.find((route) => {
    if (route.status === "draft") {
      return true;
    }
    return currentVariantStatusByRouteId.get(route.id) === "draft";
  });

  if (existingWorkingRoute) {
    return getStudyRouteDetail({
      childId: params.childId,
      routeId: existingWorkingRoute.id,
      locale,
    });
  }

  const existingSavedRoute = typedExistingRoutes.find(
    (route) => route.status === "saved" && Boolean(route.current_variant_id)
  );

  const professionRow = profession as ProfessionRow;

  const { data: programLinks, error: programLinksError } = await supabase
    .from("profession_program_links")
    .select("program_slug, fit_band")
    .eq("profession_slug", professionRow.slug)
    .order("fit_band", { ascending: true });

  if (programLinksError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to load profession-program links for initial route: ${programLinksError.message}`
    );
  }

  let selectedProgram: {
    slug: string;
    title: string;
    institution: RouteInstitution | null;
    fitBand: "strong" | "broader";
  } | null = null;

  const typedLinks = (programLinks ?? []) as RouteProgramLink[];
  const fallbackProgrammeSlugs = typedLinks.map((link) => link.program_slug);

  let savedPrimaryProgrammeSlug: string | null = null;
  if (existingSavedRoute?.current_variant_id) {
    const { data: savedSnapshotForTruth, error: savedSnapshotForTruthError } = await supabase
      .from("study_route_snapshots")
      .select("selected_steps_payload")
      .eq("route_variant_id", existingSavedRoute.current_variant_id)
      .eq("is_current_snapshot", true)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (savedSnapshotForTruthError) {
      throw new RouteDomainError(
        "internal_error",
        `Failed to load saved snapshot for truth lookup context: ${savedSnapshotForTruthError.message}`
      );
    }

    const savedSteps = Array.isArray(savedSnapshotForTruth?.selected_steps_payload)
      ? (savedSnapshotForTruth.selected_steps_payload as SavedSnapshotProgrammeStep[])
      : [];
    const savedProgrammeStep = savedSteps.find(
      (step) =>
        step?.type === "programme_selection" &&
        typeof step.program_slug === "string" &&
        step.program_slug.trim().length > 0
    );
    savedPrimaryProgrammeSlug =
      typeof savedProgrammeStep?.program_slug === "string"
        ? savedProgrammeStep.program_slug
        : null;
  }

  let initialSteps: StudyRouteSnapshotStep[] = [];
  let admissionRealismRecord = null;

  if (typedLinks.length > 0) {
    const preferredMunicipalityCodes = Array.isArray(childPlanning.preferred_municipality_codes)
      ? childPlanning.preferred_municipality_codes.filter(
          (item): item is string => typeof item === "string"
        )
      : [];
    const truthLookupInputs = await buildAvailabilityTruthLookupInputs({
      supabase,
      preferredMunicipalityCodes,
      primaryProgrammeSlugs: savedPrimaryProgrammeSlug ? [savedPrimaryProgrammeSlug] : [],
      fallbackProgrammeSlugs,
    });
    const { useTruth, truth } = truthLookupInputs.countyCodes.length > 0
      ? await shouldUseAvailabilityTruth({
          countyCodes: truthLookupInputs.countyCodes,
          programmeSlugsOrCodes: truthLookupInputs.programmeSlugsOrCodes,
        })
      : { useTruth: false, truth: { hasTruth: false, rows: [] } };

    if (useTruth) {
      const selectedTruthCandidate = await selectTruthCandidateForRoute({
        supabase,
        rows: truth.rows,
        preferredMunicipalityCodes,
        relocationWillingness: childPlanning.relocation_willingness,
      });
      const { data: linkedPrograms } = await supabase
        .from("education_programs")
        .select("slug, title")
        .in(
          "slug",
          typedLinks.map((link) => link.program_slug)
        )
        .eq("is_active", true);
      const stageProgrammeIdentity = deriveStageProgrammeIdentity(
        ((linkedPrograms ?? []) as Array<{ slug: string; title: string | null }>)
      );
      const pathVariants = await buildPathVariants(truth.rows);
      const enrichedPathVariants = pathVariants.variants.map((variant) => ({
        ...variant,
        nodes: variant.nodes.map((node) => {
          if (node.type !== "programme_selection") return node;
          const stageIdentity = stageProgrammeIdentity.get(node.stage);
          return {
            ...node,
            programSlug: node.programSlug ?? stageIdentity?.slug ?? null,
            programTitle: node.programTitle ?? stageIdentity?.title ?? null,
          };
        }),
      }));
      const navOutcomeMapping = await mapVilbliOutcomesToNav({
        outcomes: pathVariants.outcomes,
      });
      initialSteps = buildStepsFromAvailabilityTruth({
        rows: truth.rows,
        selectedCandidate: selectedTruthCandidate,
        professionSlug: professionRow.slug,
        pathVariants: enrichedPathVariants,
        navOutcomes: navOutcomeMapping.mapped,
      });

      if (selectedTruthCandidate) {
        selectedProgram = {
          slug: selectedTruthCandidate.programSlug,
          title: selectedTruthCandidate.programTitle ?? selectedTruthCandidate.programSlug,
          institution: selectedTruthCandidate.institutionId
            ? {
                id: selectedTruthCandidate.institutionId,
                slug: selectedTruthCandidate.institutionId,
                name: selectedTruthCandidate.institutionName ?? "Unknown institution",
                county_code: selectedTruthCandidate.countyCode,
                municipality_code: selectedTruthCandidate.municipalityCode,
              }
            : null,
          fitBand: "strong",
        };

        admissionRealismRecord = await getRouteAdmissionRealism({
          supabase,
          professionSlug: professionRow.slug,
          programSlug: selectedTruthCandidate.programSlug,
          institutionId: selectedTruthCandidate.institutionId,
        });
      }
    } else {
    const linkProgramSlugs = typedLinks.map((link) => link.program_slug);

    const { data: programs, error: programsError } = await supabase
      .from("education_programs")
      .select("slug, title, institution_id, education_level")
      .in("slug", linkProgramSlugs)
      .eq("is_active", true);

    if (programsError) {
      throw new RouteDomainError(
        "internal_error",
        `Failed to load education programs for initial route: ${programsError.message}`
      );
    }

    const typedPrograms = (programs ?? []) as RouteEducationProgram[];
    const institutionIds = typedPrograms.map((program) => program.institution_id);

    const { data: institutions, error: institutionsError } = await supabase
      .from("education_institutions")
      .select("id, slug, name, county_code, municipality_code")
      .in("id", institutionIds)
      .eq("is_active", true);

    if (institutionsError) {
      throw new RouteDomainError(
        "internal_error",
        `Failed to load education institutions for initial route: ${institutionsError.message}`
      );
    }

    const selected = await selectProgrammeForRoute({
      supabase,
      childPlanning: {
        preferredMunicipalityCodes,
        relocationWillingness: childPlanning.relocation_willingness,
      },
      professionProgramLinks: typedLinks,
      educationPrograms: typedPrograms,
      institutions: (institutions ?? []) as RouteInstitution[],
      professionSlug: professionRow.slug,
    });

    if (selected) {
      selectedProgram = {
        slug: selected.program.slug,
        title: selected.program.title,
        institution: selected.institution,
        fitBand: selected.link.fit_band,
      };

      const steps: StudyRouteSnapshotStep[] = [
        {
          type: "programme_selection",
          title: selected.program.title,
          institution_name: selected.institution?.name ?? null,
          education_level: selected.program.education_level ?? "",
          fit_band: selected.link.fit_band,
          program_slug: selected.link.program_slug,
          current_profession_slug: professionRow.slug,
          source: "legacy",
        },
      ];

      const authenticityRule = getRouteAuthenticityRule(professionRow.slug, {
        source: "legacy",
      });

      if (authenticityRule) {
        steps.push(
          ...authenticityRule.progressionAndOutcomeSteps.map((step) =>
            toAuthenticitySnapshotStep({
              step,
              professionSlug: professionRow.slug,
            })
          )
        );
      }

      initialSteps = steps;

      admissionRealismRecord = await getRouteAdmissionRealism({
        supabase,
        professionSlug: professionRow.slug,
        programSlug: selected.program.slug,
        institutionId: selected.institution?.id ?? null,
      });
    }
    }
  }

  const previewSnapshotContext = await buildStudyRouteSnapshotContext({
    locale,
    childId: params.childId,
    routeId: existingSavedRoute?.id ?? `preview-${params.childId}-${params.targetProfessionId}`,
    routeVariantId: existingSavedRoute?.current_variant_id ?? null,
    targetProfessionId: params.targetProfessionId,
    supabase,
  });

  const initialSignals = buildRouteSignals({
    snapshotContext: previewSnapshotContext,
    professionSlug: professionRow.slug,
    selectedProgramExists: Boolean(selectedProgram),
    mode: "initial",
    admissionRealismRecord,
  });

  if (existingSavedRoute?.current_variant_id) {
    const { data: savedSnapshot, error: savedSnapshotError } = await supabase
      .from("study_route_snapshots")
      .select("selected_steps_payload, signals_payload")
      .eq("route_variant_id", existingSavedRoute.current_variant_id)
      .eq("is_current_snapshot", true)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (savedSnapshotError) {
      throw new RouteDomainError(
        "internal_error",
        `Failed to load saved snapshot for equivalence check: ${savedSnapshotError.message}`
      );
    }

    const isEquivalentToSavedRoute =
      stableStringify(savedSnapshot?.selected_steps_payload ?? []) ===
        stableStringify(initialSteps) &&
      stableStringify(extractMaterialSignalsSubset(savedSnapshot?.signals_payload)) ===
        stableStringify(extractMaterialSignalsSubset(initialSignals));

    if (isEquivalentToSavedRoute) {
      return getStudyRouteDetail({
        childId: params.childId,
        routeId: existingSavedRoute.id,
        locale,
      });
    }
  }

  const { data: route, error: routeError } = await supabase
    .from("study_routes")
    .insert({
      child_id: params.childId,
      target_profession_id: params.targetProfessionId,
      // LOCKED_SPEC semantics: newly generated route is working until explicit save.
      status: "draft",
      created_by_type: createdByType,
      created_by_user_id: createdByUserId,
    })
    .select(
      "id, child_id, target_profession_id, status, current_variant_id, last_meaningful_change_at"
    )
    .single();

  if (routeError || !route) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to create study route: ${routeError?.message ?? "Unknown error"}`
    );
  }

  const { data: variant, error: variantError } = await supabase
    .from("study_route_variants")
    .insert({
      route_id: route.id,
      variant_label: "Initial route",
      variant_reason: "Initial route creation",
      is_current: true,
      status: "draft",
      created_by_type: createdByType,
      created_by_user_id: createdByUserId,
    })
    .select("id")
    .single();

  if (variantError || !variant) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to create study route variant: ${variantError?.message ?? "Unknown error"}`
    );
  }

  const snapshotContext = await buildStudyRouteSnapshotContext({
    locale,
    childId: params.childId,
    routeId: route.id,
    routeVariantId: variant.id,
    targetProfessionId: params.targetProfessionId,
    supabase,
  });

  const signatureTruthInputs = Array.isArray(childPlanning.preferred_municipality_codes)
    ? await buildAvailabilityTruthLookupInputs({
        supabase,
        preferredMunicipalityCodes: childPlanning.preferred_municipality_codes.filter(
          (item): item is string => typeof item === "string"
        ),
        primaryProgrammeSlugs: savedPrimaryProgrammeSlug ? [savedPrimaryProgrammeSlug] : [],
        fallbackProgrammeSlugs,
      })
    : { countyCodes: [], programmeSlugsOrCodes: [] };

  const routeInputSignature = computeRouteInputSignature({
    preferredMunicipalityCodes: snapshotContext.planning.preferredMunicipalityCodes,
    relocationWillingness: snapshotContext.planning.relocationWillingness,
    interestIds: snapshotContext.planning.interestIds,
    observedTraitIds: snapshotContext.planning.observedTraitIds,
    desiredIncomeBand: snapshotContext.planning.desiredIncomeBand,
    preferredWorkStyle: snapshotContext.planning.preferredWorkStyle,
    preferredEducationLevel: snapshotContext.planning.preferredEducationLevel,
    truthVersion: signatureTruthInputs.countyCodes.length > 0
      ? await getAvailabilityTruthVersion({
          countyCode: signatureTruthInputs.countyCodes[0] ?? "",
          programmeSlugsOrCodes: signatureTruthInputs.programmeSlugsOrCodes,
        })
      : null,
  });

  const routeSource = initialSteps.some((step) => step.source === "availability_truth")
    ? "availability_truth"
    : "legacy";

  const { error: snapshotError } = await supabase.from("study_route_snapshots").insert({
    route_variant_id: variant.id,
    snapshot_version: 1,
    snapshot_kind: "initial",
    generation_reason: "initial_route_creation",
    stage_context: snapshotContext,
    selected_steps_payload: initialSteps,
    signals_payload: initialSignals,
    available_professions_payload: [],
    alternatives_teaser_payload: [],
    route_input_signature: routeInputSignature,
    route_source: routeSource,
    is_current_snapshot: true,
  });

  if (snapshotError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to create initial study route snapshot: ${snapshotError.message}`
    );
  }

  const { error: routeUpdateError } = await supabase
    .from("study_routes")
    .update({
      current_variant_id: variant.id,
      updated_at: new Date().toISOString(),
      last_meaningful_change_at: new Date().toISOString(),
    })
    .eq("id", route.id);

  if (routeUpdateError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to finalize study route after snapshot creation: ${routeUpdateError.message}`
    );
  }

  return getStudyRouteDetail({
    childId: params.childId,
    routeId: route.id,
    locale,
  });
}