export type VgsStage = "VG1" | "VG2" | "VG3";

export function isVgsStage(value: string | null | undefined): value is VgsStage {
  const normalized = String(value ?? "").trim().toUpperCase();
  return normalized === "VG1" || normalized === "VG2" || normalized === "VG3";
}

export function toStageAwareProgrammeTitle(params: {
  stage: VgsStage;
  title: string;
}): string {
  const normalized = String(params.title ?? "").trim();
  const stage = params.stage.toUpperCase() as VgsStage;
  if (!normalized) return stage;

  const stagePattern = new RegExp(`^${stage}\\b`, "i");
  if (stagePattern.test(normalized)) {
    return normalized.replace(new RegExp(`^${stage}\\b\\s*`, "i"), `${stage} `).trim();
  }

  return `${stage} ${normalized}`;
}

export function toStageAwareProgrammeTitleForStage(
  stage: string | null | undefined,
  title: string | null | undefined
): string | null {
  const normalizedTitle = String(title ?? "").trim();
  if (!isVgsStage(stage)) {
    return normalizedTitle || null;
  }

  return toStageAwareProgrammeTitle({
    stage: stage.toUpperCase() as VgsStage,
    title: normalizedTitle,
  });
}
