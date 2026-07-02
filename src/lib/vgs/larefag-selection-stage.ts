/** Kolonne-3 fag picker inserted before bedrift on direct-bedrift paths (model B). */
export const LAREFAG_SELECTION_STAGE = "LAREFAG" as const;

export type LarefagSelectionStage = typeof LAREFAG_SELECTION_STAGE;

/** Carpenter and other single-fag contours skip the dedicated fag card. */
export const MIN_KOLONNE3_OPTIONS_FOR_DEDICATED_FAG_STEP = 2;

export function shouldEmitDedicatedLarefagStep(kolonne3OptionCount: number): boolean {
  return kolonne3OptionCount >= MIN_KOLONNE3_OPTIONS_FOR_DEDICATED_FAG_STEP;
}

export function isLarefagSelectionStage(stage: string | null | undefined): boolean {
  return String(stage ?? "").toUpperCase() === LAREFAG_SELECTION_STAGE;
}
