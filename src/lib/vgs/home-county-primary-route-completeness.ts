/**
 * County-local primary route gate — owner policy:
 * `docs/architecture/phase-4-county-local-primary-route-completeness-owner-policy.md`
 *
 * Primary yrkesfag routes require PSA-backed VG1 + VG2 in the child's home fylke.
 * No VG1-only patching; incomplete chain → no primary steps.
 */
import { isLosaAvailabilityScope } from "@/lib/losa/availability-scope";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { AvailabilityTruthRow } from "@/server/children/routes/get-availability-truth";

export const PRIMARY_REQUIRED_SCHOOL_STAGES = ["VG1", "VG2"] as const;

export type PrimaryRequiredSchoolStage = (typeof PRIMARY_REQUIRED_SCHOOL_STAGES)[number];

export type PrimaryRouteCompletenessViolation = {
  code: "PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY";
  message: string;
};

function countyScopedSchoolRows(rows: AvailabilityTruthRow[]): AvailabilityTruthRow[] {
  return rows.filter((row) => !isLosaAvailabilityScope(row.availabilityScope));
}

export function listMissingPrimarySchoolChainStages(
  truthRows: AvailabilityTruthRow[]
): PrimaryRequiredSchoolStage[] {
  const schoolRows = countyScopedSchoolRows(truthRows);
  return PRIMARY_REQUIRED_SCHOOL_STAGES.filter(
    (stage) => !schoolRows.some((row) => row.stage === stage)
  );
}

export function isHomeCountyPrimarySchoolChainComplete(
  truthRows: AvailabilityTruthRow[]
): boolean {
  return listMissingPrimarySchoolChainStages(truthRows).length === 0;
}

export function primaryRouteStepsIncludeRequiredSchoolChain(
  steps: StudyRouteSnapshotStep[]
): boolean {
  for (const stage of PRIMARY_REQUIRED_SCHOOL_STAGES) {
    const hasStage = steps.some(
      (step) => step.type === "programme_selection" && step.stage === stage
    );
    if (!hasStage) {
      return false;
    }
  }
  return true;
}

export function collectPrimaryRouteCompletenessViolations(params: {
  steps: StudyRouteSnapshotStep[];
  truthRows: AvailabilityTruthRow[];
}): PrimaryRouteCompletenessViolation[] {
  if (params.steps.length === 0) {
    return [];
  }

  if (isHomeCountyPrimarySchoolChainComplete(params.truthRows)) {
    return [];
  }

  const missingStages = listMissingPrimarySchoolChainStages(params.truthRows);
  const hasPartialSchoolSteps = params.steps.some(
    (step) =>
      step.type === "programme_selection" &&
      (step.stage === "VG1" || step.stage === "VG2" || step.stage === "VG3")
  );

  if (!hasPartialSchoolSteps) {
    return [];
  }

  return [
    {
      code: "PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY",
      message: `Primary route emitted school steps without full home-fylke chain (missing PSA: ${missingStages.join(", ")})`,
    },
  ];
}
