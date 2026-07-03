import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  findPriorBedriftLaerefagStep,
  resolveBedriftLaerefagFromPriorStep,
  resolveProgrammeUrlFromFagSelectionStep,
} from "@/lib/larebedrift/bedrift-laerefag-from-route";
import { resolveLarefagFromKolonne3Selection } from "@/lib/larebedrift/kolonne3-larefag-mapping";
import { isPrimaryRouteLarebedriftPilotEligible } from "@/lib/larebedrift/primary-route-larebedrift-pilot";
import { resolveLarefagLabelForProfession } from "@/lib/larebedrift/profession-larefag-mapping";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import {
  getVerifiedLarebedriftApprenticeshipOptions,
  type VerifiedLarebedriftOption,
} from "./get-verified-larebedrift-options";

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

  const professionLarefagLabel = resolveLarefagLabelForProfession(params.professionSlug);
  const verifiedOptionsByLarefagCode = new Map<string, VerifiedLarebedriftOption[]>();

  const loadVerifiedOptions = async (larefagCode: string) => {
    const cached = verifiedOptionsByLarefagCode.get(larefagCode);
    if (cached) return cached;

    const verifiedOptions = await getVerifiedLarebedriftApprenticeshipOptions({
      supabase: params.supabase,
      larefagCode,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    });
    verifiedOptionsByLarefagCode.set(larefagCode, verifiedOptions);
    return verifiedOptions;
  };

  let applied = false;
  const nextSteps: StudyRouteSnapshotStep[] = [];

  for (let index = 0; index < params.steps.length; index += 1) {
    const step = params.steps[index];
    if (step.type !== "apprenticeship_step" || step.source !== "availability_truth") {
      nextSteps.push(step);
      continue;
    }

    const priorFagStep = findPriorBedriftLaerefagStep(params.steps, index);

    const programmeUrl =
      priorFagStep != null ? resolveProgrammeUrlFromFagSelectionStep(priorFagStep) : null;

    const bedriftLaerefag = resolveBedriftLaerefagFromPriorStep({
      professionSlug: params.professionSlug,
      priorFagStep,
    });

    const kolonne3Larefag =
      priorFagStep != null
        ? resolveLarefagFromKolonne3Selection({
            programSlug: priorFagStep.program_slug,
            programTitle: priorFagStep.program_title,
            title: priorFagStep.title,
            programmeUrl,
          })
        : null;

    const larefagCode = bedriftLaerefag?.code ?? null;
    if (!larefagCode) {
      nextSteps.push(step);
      continue;
    }

    const verifiedOptions = await loadVerifiedOptions(larefagCode);
    if (verifiedOptions.length === 0) {
      nextSteps.push(step);
      continue;
    }

    const activeFagLabel =
      priorFagStep?.program_title ??
      priorFagStep?.title ??
      kolonne3Larefag?.label ??
      bedriftLaerefag?.label ??
      step.program_title ??
      professionLarefagLabel;

    applied = true;
    const baseTitle = String(step.title ?? "Opplæring i bedrift").trim();
    const title =
      activeFagLabel && !baseTitle.includes(activeFagLabel)
        ? `Opplæring i bedrift (${activeFagLabel})`
        : baseTitle;

    const defaultEmployer = verifiedOptions[0] ?? null;

    nextSteps.push({
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
    } as StudyRouteSnapshotStep);
  }

  return applied ? nextSteps : params.steps;
}
