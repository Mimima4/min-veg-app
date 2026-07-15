import { resolveProfessionSlugFromProgramSlug } from "@/lib/vgs/vg2-cross-profession";

export type AvailabilityTruthStageRow = {
  stage: string;
  programSlug: string;
  programTitle?: string | null;
  institutionName?: string | null;
  institutionId?: string;
  verificationStatus?: string;
};

function verificationPriority(status: string | undefined): number {
  if (status === "verified") return 1;
  if (status === "needs_review") return 2;
  return 999;
}

function compareAvailabilityTruthStageRows(
  a: AvailabilityTruthStageRow,
  b: AvailabilityTruthStageRow
): number {
  const verificationDelta =
    verificationPriority(a.verificationStatus) - verificationPriority(b.verificationStatus);
  if (verificationDelta !== 0) return verificationDelta;

  const byInstitution = (a.institutionName ?? "").localeCompare(b.institutionName ?? "", "nb");
  if (byInstitution !== 0) return byInstitution;

  const byProgram = (a.programSlug ?? "").localeCompare(b.programSlug ?? "", "nb");
  if (byProgram !== 0) return byProgram;

  return String(a.institutionId ?? "").localeCompare(String(b.institutionId ?? ""), "nb");
}

function scopeRowsForProfessionStage(
  rows: AvailabilityTruthStageRow[],
  stage: "VG1" | "VG2" | "VG3",
  professionSlug: string | null | undefined
): AvailabilityTruthStageRow[] {
  const stageRows = rows.filter((row) => row.stage === stage);
  const profession = String(professionSlug ?? "").trim();
  if (!profession || stage !== "VG2") {
    return stageRows;
  }

  const scoped = stageRows.filter(
    (row) => resolveProfessionSlugFromProgramSlug(row.programSlug) === profession
  );
  return scoped.length > 0 ? scoped : stageRows;
}

/** Pick one PSA row per stage; VG2 is scoped to the route catalogue profession. */
export function selectAvailabilityTruthStageRow(
  rows: AvailabilityTruthStageRow[],
  stage: "VG1" | "VG2" | "VG3",
  professionSlug?: string | null
): AvailabilityTruthStageRow | null {
  const candidates = scopeRowsForProfessionStage(rows, stage, professionSlug);
  return [...candidates].sort(compareAvailabilityTruthStageRows)[0] ?? null;
}
