import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  findPriorBedriftLaerefagStep,
  resolveBedriftLaerefagFromPriorStep,
  resolveBedriftLaerefagFromSelection,
  resolveProgrammeUrlFromFagSelectionStep,
} from "@/lib/larebedrift/bedrift-laerefag-from-route";
import { resolveLarefagFromKolonne3Selection } from "@/lib/larebedrift/kolonne3-larefag-mapping";
import { isPrimaryRouteLarebedriftPilotEligible } from "@/lib/larebedrift/primary-route-larebedrift-pilot";
import { getChildPreferredMunicipalityCodes } from "@/server/children/planning/get-child-preferred-municipality-codes";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import {
  getVerifiedLarebedriftApprenticeshipOptions,
  type VerifiedLarebedriftOption,
} from "./get-verified-larebedrift-options";

export async function loadChildPreferredMunicipalityCodes(
  supabase: SupabaseClient,
  childId: string
): Promise<string[]> {
  return getChildPreferredMunicipalityCodes(childId, supabase);
}

export async function resolveVerifiedLarebedriftOptionsForFagSelection(params: {
  supabase: SupabaseClient;
  childId: string;
  professionSlug: string;
  programSlug?: string | null;
  programTitle?: string | null;
  title?: string | null;
  programmeUrl?: string | null;
  explicitFagStep?: boolean;
}): Promise<VerifiedLarebedriftOption[]> {
  const preferredMunicipalityCodes = await loadChildPreferredMunicipalityCodes(
    params.supabase,
    params.childId
  );

  if (
    !isPrimaryRouteLarebedriftPilotEligible({
      professionSlug: params.professionSlug,
      preferredMunicipalityCodes,
    })
  ) {
    return [];
  }

  const larefagCode =
    resolveBedriftLaerefagFromSelection({
      professionSlug: params.professionSlug,
      programSlug: params.programSlug,
      programTitle: params.programTitle,
      title: params.title,
      programmeUrl: params.programmeUrl,
      explicitFagStep: params.explicitFagStep,
    })?.code ?? null;
  if (!larefagCode) return [];

  return getVerifiedLarebedriftApprenticeshipOptions({
    supabase: params.supabase,
    larefagCode,
    preferredMunicipalityCodes,
  });
}

export async function refreshApprenticeshipLarebedriftForFagSteps(params: {
  supabase: SupabaseClient;
  childId: string;
  professionSlug: string;
  steps: StudyRouteSnapshotStep[];
  larefagSelectionChanged?: boolean;
}): Promise<StudyRouteSnapshotStep[]> {
  let applied = false;
  const nextSteps: StudyRouteSnapshotStep[] = [];

  for (let index = 0; index < params.steps.length; index += 1) {
    const step = params.steps[index];
    if (step.type !== "apprenticeship_step" || step.source !== "availability_truth") {
      nextSteps.push(step);
      continue;
    }

    const priorFagStep = findPriorBedriftLaerefagStep(params.steps, index);

    if (!priorFagStep) {
      nextSteps.push(step);
      continue;
    }

    const programmeUrl = resolveProgrammeUrlFromFagSelectionStep(priorFagStep);

    const verifiedOptions = await resolveVerifiedLarebedriftOptionsForFagSelection({
      supabase: params.supabase,
      childId: params.childId,
      professionSlug: params.professionSlug,
      programSlug: priorFagStep.program_slug,
      programTitle: priorFagStep.program_title,
      title: priorFagStep.title,
      programmeUrl,
      explicitFagStep: true,
    });

    const kolonne3Larefag = resolveLarefagFromKolonne3Selection({
      programSlug: priorFagStep.program_slug,
      programTitle: priorFagStep.program_title,
      title: priorFagStep.title,
      programmeUrl,
    });

    const bedriftLaerefag = resolveBedriftLaerefagFromPriorStep({
      professionSlug: params.professionSlug,
      priorFagStep,
    });

    const fagTitle =
      priorFagStep.program_title ??
      priorFagStep.title ??
      kolonne3Larefag?.label ??
      bedriftLaerefag?.label ??
      step.program_title ??
      null;

    const title = fagTitle ? `Opplæring i bedrift (${fagTitle})` : step.title;

    if (verifiedOptions.length === 0) {
      if (params.larefagSelectionChanged) {
        applied = true;
        nextSteps.push({
          ...step,
          title,
          program_title: fagTitle ?? step.program_title ?? null,
          institution_name: null,
          institution_municipality: null,
          institution_website: null,
          selected_apprenticeship_option_id: null,
          selected_apprenticeship_option_title: null,
          apprenticeship_options: [],
        } as StudyRouteSnapshotStep);
      } else {
        nextSteps.push(step);
      }
      continue;
    }

    const defaultEmployer = verifiedOptions[0] ?? null;

    applied = true;
    nextSteps.push({
      ...step,
      title,
      program_title: fagTitle ?? step.program_title ?? null,
      institution_name: defaultEmployer?.option_title ?? step.institution_name ?? null,
      institution_municipality:
        defaultEmployer?.employer_municipality ?? step.institution_municipality ?? null,
      institution_website: defaultEmployer?.employer_website ?? step.institution_website ?? null,
      selected_apprenticeship_option_id: defaultEmployer?.option_id ?? null,
      selected_apprenticeship_option_title: defaultEmployer?.option_title ?? null,
      apprenticeship_options: verifiedOptions,
    } as StudyRouteSnapshotStep);
  }

  return applied || params.larefagSelectionChanged ? nextSteps : params.steps;
}
