import {
  isKolonne3ProgramSlug,
  resolveLarefagFromKolonne3Selection,
} from "@/lib/larebedrift/kolonne3-larefag-mapping";
import {
  resolveLarefagForProfession,
} from "@/lib/larebedrift/profession-larefag-mapping";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import { isLarefagSelectionStage } from "@/lib/vgs/larefag-selection-stage";

/** Programme step that determines which lærefag employers to show before bedrift. */
export function isBedriftLaerefagDrivingStage(stage: string | null | undefined): boolean {
  const normalized = String(stage ?? "").toUpperCase();
  return isLarefagSelectionStage(stage) || normalized === "VG3";
}

export function findPriorBedriftLaerefagStep(
  steps: StudyRouteSnapshotStep[],
  beforeIndex: number
): Extract<StudyRouteSnapshotStep, { type: "programme_selection" }> | null {
  for (let index = beforeIndex - 1; index >= 0; index -= 1) {
    const candidate = steps[index];
    if (candidate.type === "apprenticeship_step") {
      return null;
    }
    if (
      candidate.type === "programme_selection" &&
      isBedriftLaerefagDrivingStage(candidate.stage)
    ) {
      return candidate;
    }
  }
  return null;
}

export function resolveProgrammeUrlFromFagSelectionStep(
  step: Extract<StudyRouteSnapshotStep, { type: "programme_selection" }>
): string | null {
  if (step.programme_url) return step.programme_url;
  const slug = String(step.program_slug ?? "").trim();
  if (!slug) return null;
  const matched = (step.options ?? []).find((option) => {
    const optionSlug = String(option.institution_id ?? "")
      .trim()
      .replace(/^vilbli-branch:/, "");
    const programSlug = String((option as { program_slug?: string }).program_slug ?? "").trim();
    return optionSlug === slug || programSlug === slug;
  });
  return matched?.programme_url ?? null;
}

export type BedriftLaerefagSelectionInput = {
  professionSlug: string;
  programSlug?: string | null;
  programTitle?: string | null;
  title?: string | null;
  programmeUrl?: string | null;
  /** True when selection comes from an explicit LAREFAG or VG3 step (no profession default). */
  explicitFagStep?: boolean;
};

export function resolveBedriftLaerefagFromSelection(
  params: BedriftLaerefagSelectionInput
): { code: string; label: string } | null {
  const mapped = resolveLarefagFromKolonne3Selection({
    programSlug: params.programSlug,
    programTitle: params.programTitle,
    title: params.title,
    programmeUrl: params.programmeUrl,
  });
  if (mapped) return mapped;

  if (params.explicitFagStep) return null;

  return resolveLarefagForProfession(params.professionSlug);
}

export function resolveBedriftLaerefagCodeFromSelection(
  params: BedriftLaerefagSelectionInput
): string | null {
  return resolveBedriftLaerefagFromSelection(params)?.code ?? null;
}

export function resolveBedriftLaerefagFromPriorStep(params: {
  professionSlug: string;
  priorFagStep: Extract<StudyRouteSnapshotStep, { type: "programme_selection" }> | null;
}): { code: string; label: string } | null {
  if (!params.priorFagStep) {
    return resolveLarefagForProfession(params.professionSlug);
  }

  const programmeUrl = resolveProgrammeUrlFromFagSelectionStep(params.priorFagStep);
  const explicitFagStep =
    isLarefagSelectionStage(params.priorFagStep.stage) ||
    String(params.priorFagStep.stage ?? "").toUpperCase() === "VG3" ||
    isKolonne3ProgramSlug(params.priorFagStep.program_slug) ||
    Boolean(programmeUrl);

  return resolveBedriftLaerefagFromSelection({
    professionSlug: params.professionSlug,
    programSlug: params.priorFagStep.program_slug,
    programTitle: params.priorFagStep.program_title,
    title: params.priorFagStep.title,
    programmeUrl,
    explicitFagStep,
  });
}
