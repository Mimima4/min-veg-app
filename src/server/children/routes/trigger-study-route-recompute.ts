import { createClient } from "@/lib/supabase/server";
import { buildStudyRouteSnapshotContext } from "./build-study-route-snapshot-context";
import { getStudyRouteDetail } from "./get-study-route-detail";
import { RouteDomainError } from "./route-errors";

type Params = {
  childId: string;
  routeId: string;
  locale?: string;
  triggeredByType?: string;
  triggeredByUserId?: string | null;
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
};

type InstitutionRow = {
  id: string;
  slug: string;
  name: string;
};

export async function triggerStudyRouteRecompute(params: Params) {
  const supabase = await createClient();
  const locale = params.locale ?? "en";
  const triggeredByType = params.triggeredByType ?? "system";
  const triggeredByUserId = params.triggeredByUserId ?? null;

  const { data: route, error: routeError } = await supabase
    .from("study_routes")
    .select(
      `
        id,
        child_id,
        target_profession_id,
        current_variant_id
      `
    )
    .eq("id", params.routeId)
    .eq("child_id", params.childId)
    .maybeSingle();

  if (routeError || !route) {
    throw new RouteDomainError("route_not_found", "Route not found for recompute", {
      routeId: params.routeId,
      childId: params.childId,
    });
  }

  if (!route.current_variant_id) {
    throw new RouteDomainError(
      "route_variant_conflict",
      "Route has no current variant for recompute",
      { routeId: route.id }
    );
  }

  const { data: profession, error: professionError } = await supabase
    .from("professions")
    .select("id, slug, title_i18n")
    .eq("id", route.target_profession_id)
    .eq("is_active", true)
    .maybeSingle();

  if (professionError || !profession) {
    throw new RouteDomainError(
      "route_recompute_failed",
      `Failed to load route profession for recompute: ${professionError?.message ?? "Missing profession"}`
    );
  }

  const professionRow = profession as ProfessionRow;

  const { data: recomputeRun, error: recomputeRunError } = await supabase
    .from("study_route_recompute_runs")
    .insert({
      route_id: route.id,
      route_variant_id: route.current_variant_id,
      trigger_reason: "manual_recompute",
      triggered_by_type: triggeredByType,
      triggered_by_user_id: triggeredByUserId,
      result_status: "running",
    })
    .select("id")
    .single();

  if (recomputeRunError || !recomputeRun) {
    throw new RouteDomainError(
      "route_recompute_failed",
      `Failed to create recompute run: ${recomputeRunError?.message ?? "Unknown error"}`
    );
  }

  try {
    const snapshotContext = await buildStudyRouteSnapshotContext({
      locale,
      childId: route.child_id,
      routeId: route.id,
      routeVariantId: route.current_variant_id,
      targetProfessionId: route.target_profession_id,
    });

    const { data: programLinks, error: programLinksError } = await supabase
      .from("profession_program_links")
      .select("profession_slug, program_slug, fit_band")
      .eq("profession_slug", professionRow.slug)
      .order("fit_band", { ascending: true });

    if (programLinksError) {
      throw new RouteDomainError(
        "route_recompute_failed",
        `Failed to load profession-program links for recompute: ${programLinksError.message}`
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

    if (typedLinks.length > 0) {
      const preferredLink =
        typedLinks.find((link) => link.fit_band === "strong") ?? typedLinks[0];

      const { data: program, error: programError } = await supabase
        .from("education_programs")
        .select("slug, title, institution_id")
        .eq("slug", preferredLink.program_slug)
        .eq("is_active", true)
        .maybeSingle();

      if (programError) {
        throw new RouteDomainError(
          "route_recompute_failed",
          `Failed to load education program for recompute: ${programError.message}`
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
            "route_recompute_failed",
            `Failed to load education institution for recompute: ${institutionError.message}`
          );
        }

        if (institutionRow) {
          institution = institutionRow as InstitutionRow;
        }

        selectedProgram = {
          slug: typedProgram.slug,
          title: typedProgram.title,
          institution,
          fitBand: preferredLink.fit_band,
        };
      }
    }

    const recomputedSteps = [
      {
        stepId: "profession-entry",
        stepType: "profession_entry",
        stageCode: "target_profession",
        title: snapshotContext.currentProfession.title,
        subtitle: "Target profession (recomputed)",
        description: "Recomputed route baseline.",
        programme: null,
        institution: null,
        regionContext: null,
        timing: null,
        requirementsSummary: null,
        feasibilityBadge: null,
        warnings: [],
        isEditable: true,
        stepOptionsCount: null,
        meta: {
          currentProfessionSlug: professionRow.slug,
        },
      },
      ...(selectedProgram
        ? [
            {
              stepId: "programme-selection",
              stepType: "programme_selection",
              stageCode: "education_programme",
              title: selectedProgram.title,
              subtitle:
                selectedProgram.fitBand === "strong"
                  ? "Strong linked programme"
                  : "Broader linked programme",
              description: "Programme re-selected from the current target profession pathway.",
              programme: {
                slug: selectedProgram.slug,
                title: selectedProgram.title,
              },
              institution: selectedProgram.institution
                ? {
                    id: selectedProgram.institution.id,
                    slug: selectedProgram.institution.slug,
                    title: selectedProgram.institution.name,
                  }
                : null,
              regionContext: null,
              timing: null,
              requirementsSummary: null,
              feasibilityBadge:
                selectedProgram.fitBand === "strong" ? "Strong match" : "Broader option",
              warnings: [],
              isEditable: true,
              stepOptionsCount: typedLinks.length,
              meta: {
                currentProfessionSlug: professionRow.slug,
              },
            },
          ]
        : []),
    ];

    const recomputedSignals = {
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
          ? "Recomputed route has a valid target profession and linked programme"
          : selectedProgram
            ? "Recomputed route has a linked programme, but still needs more planning depth"
            : "Recomputed route still has no linked programme",
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

    const { error: unsetCurrentError } = await supabase
      .from("study_route_snapshots")
      .update({ is_current_snapshot: false })
      .eq("route_variant_id", route.current_variant_id)
      .eq("is_current_snapshot", true);

    if (unsetCurrentError) {
      throw new RouteDomainError(
        "route_recompute_failed",
        `Failed to unset previous current snapshot: ${unsetCurrentError.message}`
      );
    }

    const { error: snapshotError } = await supabase
      .from("study_route_snapshots")
      .insert({
        route_variant_id: route.current_variant_id,
        snapshot_version: Date.now(),
        snapshot_kind: "recompute",
        generation_reason: "manual_recompute",
        stage_context: snapshotContext,
        selected_steps_payload: recomputedSteps,
        signals_payload: recomputedSignals,
        available_professions_payload: [],
        alternatives_teaser_payload: [],
        is_current_snapshot: true,
      });

    if (snapshotError) {
      throw new RouteDomainError(
        "route_recompute_failed",
        `Failed to insert recomputed snapshot: ${snapshotError.message}`
      );
    }

    await supabase
      .from("study_route_recompute_runs")
      .update({
        completed_at: new Date().toISOString(),
        result_status: "completed",
        new_variant_created: false,
        new_route_available: false,
      })
      .eq("id", recomputeRun.id);

    return getStudyRouteDetail({
      childId: route.child_id,
      routeId: route.id,
      locale,
    });
  } catch (error) {
    await supabase
      .from("study_route_recompute_runs")
      .update({
        completed_at: new Date().toISOString(),
        result_status: "failed",
        error_code:
          error instanceof RouteDomainError ? error.code : "internal_error",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", recomputeRun.id);

    throw error;
  }
}