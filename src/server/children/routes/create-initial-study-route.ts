import { createClient } from "@/lib/supabase/server";
import type { StudyRouteReadModel, StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import { buildStudyRouteSnapshotContext } from "./build-study-route-snapshot-context";
import { getStudyRouteDetail } from "./get-study-route-detail";
import { RouteDomainError } from "./route-errors";

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

type ProgramLinkRow = {
  profession_slug: string;
  program_slug: string;
  fit_band: "strong" | "broader";
};

type EducationProgramRow = {
  slug: string;
  title: string;
  institution_id: string;
  education_level: string | null;
};

type InstitutionRow = {
  id: string;
  slug: string;
  name: string;
};

export async function createInitialStudyRoute(
  params: Params
): Promise<StudyRouteReadModel> {
  const supabase = await createClient();
  const locale = params.locale ?? "en";
  const createdByType = params.createdByType ?? "parent";
  const createdByUserId = params.createdByUserId ?? null;

  const [{ data: child }, { data: profession, error: professionError }] =
    await Promise.all([
      supabase.from("child_profiles").select("id").eq("id", params.childId).maybeSingle(),
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

  const { data: existingRoute, error: existingRouteError } = await supabase
    .from("study_routes")
    .select("id")
    .eq("child_id", params.childId)
    .eq("target_profession_id", params.targetProfessionId)
    .is("archived_at", null)
    .maybeSingle();

  if (existingRouteError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to check existing route before creation: ${existingRouteError.message}`
    );
  }

  if (existingRoute) {
    return getStudyRouteDetail({
      childId: params.childId,
      routeId: existingRoute.id,
      locale,
    });
  }

  const { data: route, error: routeError } = await supabase
    .from("study_routes")
    .insert({
      child_id: params.childId,
      target_profession_id: params.targetProfessionId,
      status: "saved",
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
      status: "saved",
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

  const professionRow = profession as ProfessionRow;
  const snapshotContext = await buildStudyRouteSnapshotContext({
    locale,
    childId: params.childId,
    routeId: route.id,
    routeVariantId: variant.id,
    targetProfessionId: params.targetProfessionId,
  });

  const { data: programLinks, error: programLinksError } = await supabase
    .from("profession_program_links")
    .select("profession_slug, program_slug, fit_band")
    .eq("profession_slug", professionRow.slug)
    .order("fit_band", { ascending: true });

  if (programLinksError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to load profession-program links for initial route: ${programLinksError.message}`
    );
  }

  let selectedProgram:
    | {
        slug: string;
        title: string;
        institution: InstitutionRow | null;
        fitBand: "strong" | "broader";
      }
    | null = null;

  const typedLinks = (programLinks ?? []) as ProgramLinkRow[];

  let initialSteps: StudyRouteSnapshotStep[] = [];

  if (typedLinks.length > 0) {
    // 1. Берём только strong links
    const strongLinks = typedLinks.filter(
      (link) => link.fit_band === "strong"
    );

    // 2. Детерминированный порядок (чтобы не зависеть от БД)
    const sortedStrongLinks = strongLinks.sort((a, b) =>
      a.program_slug.localeCompare(b.program_slug)
    );

    // 3. Выбор
    const bestLink =
      sortedStrongLinks[0] ??
      typedLinks.sort((a, b) =>
        a.program_slug.localeCompare(b.program_slug)
      )[0];

    const { data: program, error: programError } = await supabase
      .from("education_programs")
      .select("slug, title, institution_id, education_level")
      .eq("slug", bestLink.program_slug)
      .eq("is_active", true)
      .maybeSingle();

    if (programError) {
      throw new RouteDomainError(
        "internal_error",
        `Failed to load education program for initial route: ${programError.message}`
      );
    }

    if (program) {
      const typedProgram = program as EducationProgramRow;

      let institution: InstitutionRow | null = null;

      const { data: institutionRow, error: institutionError } = await supabase
        .from("education_institutions")
        .select("id, slug, name")
        .eq("id", typedProgram.institution_id)
        .eq("is_active", true)
        .maybeSingle();

      if (institutionError) {
        throw new RouteDomainError(
          "internal_error",
          `Failed to load education institution for initial route: ${institutionError.message}`
        );
      }

      if (institutionRow) {
        institution = institutionRow as InstitutionRow;
      }

      selectedProgram = {
        slug: typedProgram.slug,
        title: typedProgram.title,
        institution,
        fitBand: bestLink.fit_band,
      };

      const steps: StudyRouteSnapshotStep[] = [
        {
          type: "programme_selection",
          title: typedProgram.title,
          institution_name: institution?.name ?? null,
          education_level: typedProgram.education_level ?? "",
          fit_band: bestLink.fit_band,
          program_slug: bestLink.program_slug,
          current_profession_slug: professionRow.slug,
        },
      ];

      if (professionRow.slug === "electrician") {
        steps.push(
          {
            type: "progression_step",
            title: "Apprenticeship (læretid)",
            institution_name: null,
            education_level: "apprenticeship",
            fit_band: "strong",
            program_slug: null,
            current_profession_slug: professionRow.slug,
          },
          {
            type: "outcome_step",
            title: "Fagbrev (Electrician)",
            institution_name: null,
            education_level: "certificate",
            fit_band: "strong",
            program_slug: null,
            current_profession_slug: professionRow.slug,
          }
        );
      }

      if (professionRow.slug === "doctor") {
        steps.push({
          type: "outcome_step",
          title: "Licensed doctor",
          institution_name: null,
          education_level: "professional_degree",
          fit_band: "strong",
          program_slug: null,
          current_profession_slug: professionRow.slug,
        });
      }

      initialSteps = steps;
    }
  }

  const initialSignals = {
    fitSummary:
      snapshotContext.planning.interestIds.length > 0
        ? "Early fit signal"
        : "Low-signal route",
    confidenceSummary:
      snapshotContext.planning.derivedStrengthIds.length > 0
        ? "Developing confidence"
        : "Low confidence",
    feasibilitySummary:
      selectedProgram && snapshotContext.planning.preferredEducationLevel
        ? "Initial route has a valid target profession and linked programme"
        : selectedProgram
          ? "Route has a linked programme, but still needs more planning depth"
          : "Route exists, but no linked programme has been selected yet",
    warnings: snapshotContext.planning.interestIds.length === 0
      ? [
          {
            code: "missing_interests",
            label: "Interest profile is still thin",
            severity: "medium",
          },
        ]
      : [],
    improvementGuidance:
      snapshotContext.planning.interestIds.length === 0
        ? [
            {
              code: "add_interests",
              label: "Add interest signals",
            },
          ]
        : [],
    evidenceComposition: {
      hasParentInput:
        snapshotContext.planning.interestIds.length > 0 ||
        Boolean(snapshotContext.planning.preferredEducationLevel) ||
        Boolean(snapshotContext.planning.desiredIncomeBand) ||
        Boolean(snapshotContext.planning.preferredWorkStyle),
      hasSchoolEvidence: false,
      hasDerivedSignals: snapshotContext.planning.derivedStrengthIds.length > 0,
    },
  };

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