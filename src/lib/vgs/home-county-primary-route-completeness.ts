/**
 * PSA → primary route handoff (Contour B read path).
 *
 * Owner policy: `docs/architecture/phase-4-county-local-primary-route-completeness-owner-policy.md`
 *
 * ## Where this runs (and where it must NOT)
 *
 * **This gate:** between Contour B PSA rows and primary snapshot steps — the single
 * `psa_to_primary` door. Used by `build-steps-from-availability-truth` and
 * `build-path-variants`, and asserted in `route-truth-invariants`.
 *
 * **NOT here:** Contour B ingest/relay/classify, Steigen curated regional alternatives,
 * LOSA scope (LOSA rows are excluded from chain completeness), UI-only checks, or
 * `get-study-route-alternatives` teasers.
 *
 * ## Contour B handoff
 *
 * Ingest/classify may return `missing_programme_rows` or ABORT when Vilbli lacks a
 * required stage. At runtime the product reads PSA — if county-scoped school rows
 * (non-LOSA) do not cover every required stage (VG1+VG2 for current VGS paths), primary
 * steps are not built. That mirrors B's write verdict without calling classify on
 * every page load.
 *
 * Steigen / P-7 alternatives sync **after** primary snapshot creation and are never
 * subject to this gate.
 */
import { isLosaAvailabilityScope } from "@/lib/losa/availability-scope";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { AvailabilityTruthRow } from "@/server/children/routes/get-availability-truth";

/** Mirrors `requiredForWrite` school stages in `vgs-path-definitions.mjs` (all current VGS paths). */
export const PRIMARY_REQUIRED_SCHOOL_STAGES = ["VG1", "VG2"] as const;

export type PrimaryRequiredSchoolStage = (typeof PRIMARY_REQUIRED_SCHOOL_STAGES)[number];

export const PRIMARY_ROUTE_ELIGIBILITY_GATE_ID = "psa_to_primary" as const;

export type HomeCountyPrimaryRouteEligibilityReason =
  | "PRIMARY_ROUTE_COMPLETE"
  | "PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY"
  | "NO_TRUTH_ROWS";

export type HomeCountyPrimaryRouteEligibility = {
  gate: typeof PRIMARY_ROUTE_ELIGIBILITY_GATE_ID;
  eligible: boolean;
  reason: HomeCountyPrimaryRouteEligibilityReason;
  missingStages: PrimaryRequiredSchoolStage[];
  contourBHandoff: "primary_steps_allowed" | "primary_steps_blocked";
};

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

/**
 * Explicit PSA → primary eligibility contract (Contour B runtime handoff).
 */
export function assessHomeCountyPrimaryRouteEligibility(params: {
  truthRows: AvailabilityTruthRow[];
  professionSlug?: string;
}): HomeCountyPrimaryRouteEligibility {
  void params.professionSlug;

  if (params.truthRows.length === 0) {
    return {
      gate: PRIMARY_ROUTE_ELIGIBILITY_GATE_ID,
      eligible: false,
      reason: "NO_TRUTH_ROWS",
      missingStages: [...PRIMARY_REQUIRED_SCHOOL_STAGES],
      contourBHandoff: "primary_steps_blocked",
    };
  }

  const missingStages = listMissingPrimarySchoolChainStages(params.truthRows);
  if (missingStages.length === 0) {
    return {
      gate: PRIMARY_ROUTE_ELIGIBILITY_GATE_ID,
      eligible: true,
      reason: "PRIMARY_ROUTE_COMPLETE",
      missingStages: [],
      contourBHandoff: "primary_steps_allowed",
    };
  }

  return {
    gate: PRIMARY_ROUTE_ELIGIBILITY_GATE_ID,
    eligible: false,
    reason: "PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY",
    missingStages,
    contourBHandoff: "primary_steps_blocked",
  };
}

export function isHomeCountyPrimarySchoolChainComplete(
  truthRows: AvailabilityTruthRow[]
): boolean {
  return assessHomeCountyPrimaryRouteEligibility({ truthRows }).eligible;
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

  const eligibility = assessHomeCountyPrimaryRouteEligibility({
    truthRows: params.truthRows,
  });

  if (eligibility.eligible) {
    return [];
  }

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
      message: `Primary route emitted school steps without full home-fylke chain (missing PSA: ${eligibility.missingStages.join(", ")})`,
    },
  ];
}
