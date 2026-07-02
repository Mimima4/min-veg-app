import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isKolonne3ProgramSlug,
  resolveLarefagFromKolonne3Selection,
} from "@/lib/larebedrift/kolonne3-larefag-mapping";
import { isPrimaryRouteLarebedriftPilotEligible } from "@/lib/larebedrift/primary-route-larebedrift-pilot";
import { resolveLarefagCodeForProfession } from "@/lib/larebedrift/profession-larefag-mapping";
import { isLarefagSelectionStage } from "@/lib/vgs/larefag-selection-stage";
import { getChildPreferredMunicipalityCodes } from "@/server/children/planning/get-child-preferred-municipality-codes";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import {
  getVerifiedLarebedriftApprenticeshipOptions,
  type VerifiedLarebedriftOption,
} from "./get-verified-larebedrift-options";

function resolveProgrammeUrlFromLarefagStep(
  step: Extract<StudyRouteSnapshotStep, { type: "programme_selection" }>
): string | null {
  if (step.programme_url) return step.programme_url;
  const slug = String(step.program_slug ?? "").trim();
  if (!slug) return null;
  const matched = (step.options ?? []).find((option) => {
    const optionSlug = String(option.institution_id ?? "")
      .trim()
      .replace(/^vilbli-branch:/, "");
    return optionSlug === slug;
  });
  return matched?.programme_url ?? null;
}

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

  const kolonne3Larefag = resolveLarefagFromKolonne3Selection({
    programSlug: params.programSlug,
    programTitle: params.programTitle,
    title: params.title,
    programmeUrl: params.programmeUrl,
  });
  const inKolonne3Context =
    isKolonne3ProgramSlug(params.programSlug) || Boolean(params.programmeUrl?.trim());
  const larefagCode = inKolonne3Context
    ? kolonne3Larefag?.code ?? null
    : kolonne3Larefag?.code ?? resolveLarefagCodeForProfession(params.professionSlug);
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

    const priorLarefagStep = params.steps
      .slice(0, index)
      .reverse()
      .find(
        (candidate) =>
          candidate.type === "programme_selection" &&
          isLarefagSelectionStage(candidate.stage)
      );

    if (!priorLarefagStep || priorLarefagStep.type !== "programme_selection") {
      nextSteps.push(step);
      continue;
    }

    const programmeUrl = resolveProgrammeUrlFromLarefagStep(priorLarefagStep);

    const verifiedOptions = await resolveVerifiedLarebedriftOptionsForFagSelection({
      supabase: params.supabase,
      childId: params.childId,
      professionSlug: params.professionSlug,
      programSlug: priorLarefagStep.program_slug,
      programTitle: priorLarefagStep.program_title,
      title: priorLarefagStep.title,
      programmeUrl,
    });

    const kolonne3Larefag = resolveLarefagFromKolonne3Selection({
      programSlug: priorLarefagStep.program_slug,
      programTitle: priorLarefagStep.program_title,
      title: priorLarefagStep.title,
      programmeUrl,
    });

    const fagTitle =
      priorLarefagStep.program_title ??
      priorLarefagStep.title ??
      kolonne3Larefag?.label ??
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
