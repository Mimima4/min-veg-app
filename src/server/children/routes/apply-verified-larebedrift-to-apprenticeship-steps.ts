import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { isPrimaryRouteLarebedriftPilotEligible } from "@/lib/larebedrift/primary-route-larebedrift-pilot";
import {
  resolveLarefagCodeForProfession,
  resolveLarefagLabelForProfession,
} from "@/lib/larebedrift/profession-larefag-mapping";
import { isLarefagSelectionStage } from "@/lib/vgs/larefag-selection-stage";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import { getVerifiedLarebedriftApprenticeshipOptions } from "./get-verified-larebedrift-options";

/**
 * P3b — inject verified godkjent lærebedrifter into ordinary
 * `availability_truth` apprenticeship steps at snapshot build time (recompute /
 * initial route / outcome-filter alternatives). Curated-regional / veksling steps
 * are unchanged (they already load verified rows via their own builders).
 *
 * Stop rule: no pilot eligibility, no fag mapping, or zero DB rows → steps unchanged.
 */
export async function applyVerifiedLarebedriftToApprenticeshipSteps(params: {
  supabase: SupabaseClient;
  steps: StudyRouteSnapshotStep[];
  professionSlug: string;
  preferredMunicipalityCodes: string[];
}): Promise<StudyRouteSnapshotStep[]> {
  if (
    !isPrimaryRouteLarebedriftPilotEligible({
      professionSlug: params.professionSlug,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    })
  ) {
    return params.steps;
  }

  const larefagCode = resolveLarefagCodeForProfession(params.professionSlug);
  if (!larefagCode) {
    return params.steps;
  }

  const verifiedOptions = await getVerifiedLarebedriftApprenticeshipOptions({
    supabase: params.supabase,
    larefagCode,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
  });
  if (verifiedOptions.length === 0) {
    return params.steps;
  }

  const larefagLabel = resolveLarefagLabelForProfession(params.professionSlug);

  let applied = false;
  const nextSteps = params.steps.map((step, index) => {
    if (step.type !== "apprenticeship_step") {
      return step;
    }
    if (step.source !== "availability_truth") {
      return step;
    }

    const priorLarefagStep = params.steps
      .slice(0, index)
      .reverse()
      .find(
        (candidate) =>
          candidate.type === "programme_selection" &&
          isLarefagSelectionStage(candidate.stage)
      );

    const activeFagLabel =
      priorLarefagStep?.program_title ??
      priorLarefagStep?.title ??
      step.program_title ??
      larefagLabel;

    applied = true;
    const baseTitle = String(step.title ?? "Opplæring i bedrift").trim();
    const title =
      activeFagLabel && !baseTitle.includes(activeFagLabel)
        ? `Opplæring i bedrift (${activeFagLabel})`
        : baseTitle;

    const defaultEmployer = verifiedOptions[0] ?? null;

    return {
      ...step,
      title,
      program_title: activeFagLabel ?? step.program_title ?? null,
      institution_name: defaultEmployer?.option_title ?? step.institution_name ?? null,
      institution_municipality:
        defaultEmployer?.employer_municipality ?? step.institution_municipality ?? null,
      institution_website: defaultEmployer?.employer_website ?? step.institution_website ?? null,
      selected_apprenticeship_option_id: defaultEmployer?.option_id ?? null,
      selected_apprenticeship_option_title: defaultEmployer?.option_title ?? null,
      apprenticeship_options: verifiedOptions,
    };
  });

  return applied ? nextSteps : params.steps;
}
