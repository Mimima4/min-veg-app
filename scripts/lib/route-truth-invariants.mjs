/**
 * Keep in sync with src/lib/vgs/route-truth-invariants.ts (smoke/audit runtime).
 */
export const PATH_VARIANT_VG3_THEN_BEDRIFT = "vilbli-branch-vg3-then-bedrift";
const LOSA_SCOPE = "losa_fjern_delivery_municipality";
const LAREFAG_SELECTION_STAGE = "LAREFAG";

function isLosaScope(scope) {
  return scope === LOSA_SCOPE;
}

function isLarefagSelectionStage(stage) {
  return String(stage ?? "").toUpperCase() === LAREFAG_SELECTION_STAGE;
}

function hasVg3SchoolProgrammeAvailability(rows) {
  return rows.some((row) => row.stage === "VG3" && !isLosaScope(row.availabilityScope));
}

function isVilbliBranchInstitutionId(value) {
  return String(value ?? "").trim().startsWith("vilbli-branch:");
}

export function collectPathVariantInvariantViolations({ variants, truthRows }) {
  const violations = [];
  const hasVg3Truth = hasVg3SchoolProgrammeAvailability(truthRows);

  for (const variant of variants) {
    if (variant.variantId === PATH_VARIANT_VG3_THEN_BEDRIFT && !hasVg3Truth) {
      violations.push({
        code: "PATH_VG3_VARIANT_WITHOUT_TRUTH",
        message: `Variant ${variant.variantId} requires PSA-backed VG3 school rows`,
      });
    }

    for (const node of variant.nodes) {
      if (node.type !== "programme_selection" || node.stage !== "VG3") {
        continue;
      }
      if (!hasVg3Truth) {
        violations.push({
          code: "PATH_VG3_NODE_WITHOUT_TRUTH",
          message: `VG3 programme node in variant ${variant.variantId} without PSA VG3 school truth`,
        });
      }
      if ((node.options?.length ?? 0) > 0) {
        violations.push({
          code: "PATH_VG3_NODE_HAS_BRANCH_OPTIONS",
          message: `VG3 programme node in variant ${variant.variantId} must not carry kolonne-3 branch options`,
        });
      }
    }
  }

  return violations;
}

export function collectStudyRouteStepsInvariantViolations({ steps, truthRows }) {
  const violations = [];
  const hasVg3Truth = hasVg3SchoolProgrammeAvailability(truthRows);
  const truthVg3InstitutionIds = new Set(
    truthRows
      .filter((row) => row.stage === "VG3" && !isLosaScope(row.availabilityScope))
      .map((row) => row.institutionId)
      .filter(Boolean)
  );

  const hasLarefagStep = steps.some(
    (step) => step.type === "programme_selection" && isLarefagSelectionStage(step.stage)
  );

  for (const step of steps) {
    if (step.type !== "programme_selection" || step.stage !== "VG3") {
      continue;
    }

    if (!hasVg3Truth) {
      violations.push({
        code: "STEP_VG3_WITHOUT_TRUTH",
        message: "VG3 programme_selection step emitted without PSA-backed VG3 school truth",
      });
      continue;
    }

    const options = step.options ?? [];
    if (options.some((option) => isVilbliBranchInstitutionId(option.institution_id))) {
      violations.push({
        code: "STEP_VG3_FABRICATED_BRANCH_OPTIONS",
        message:
          "VG3 programme_selection options must be schools from availability truth, not vilbli-branch kolonne-3 fag",
      });
    }

    if (options.length > 0) {
      if (options.some((option) => !String(option.institution_name ?? "").trim())) {
        violations.push({
          code: "STEP_VG3_OPTIONS_MISSING_SCHOOL",
          message: "VG3 programme_selection options must include institution_name (school label)",
        });
      }

      if (
        options.some((option) => {
          const institutionId = String(option.institution_id ?? "").trim();
          return (
            institutionId &&
            !isVilbliBranchInstitutionId(institutionId) &&
            truthVg3InstitutionIds.size > 0 &&
            !truthVg3InstitutionIds.has(institutionId)
          );
        })
      ) {
        violations.push({
          code: "STEP_VG3_OPTIONS_MISSING_SCHOOL",
          message: "VG3 programme_selection options include institutions outside PSA VG3 truth",
        });
      }
    }
  }

  for (const step of steps) {
    if (step.type !== "apprenticeship_step") {
      continue;
    }
    const options = step.apprenticeship_options ?? [];
    if (
      hasLarefagStep &&
      options.some((option) => String(option.option_id ?? "").startsWith("kolonne3-"))
    ) {
      violations.push({
        code: "STEP_APPRENTICESHIP_HAS_KOLONNE3_FAG_OPTIONS",
        message:
          "apprenticeship_step must list bedrifter only when a dedicated LAREFAG step is present",
      });
    }
  }

  return violations;
}

const PRIMARY_REQUIRED_SCHOOL_STAGES = ["VG1", "VG2"];

function listMissingPrimarySchoolChainStages(truthRows) {
  const schoolRows = truthRows.filter((row) => !isLosaScope(row.availabilityScope));
  return PRIMARY_REQUIRED_SCHOOL_STAGES.filter(
    (stage) => !schoolRows.some((row) => row.stage === stage)
  );
}

function isHomeCountyPrimarySchoolChainComplete(truthRows) {
  return listMissingPrimarySchoolChainStages(truthRows).length === 0;
}

export { isHomeCountyPrimarySchoolChainComplete };

export function collectPrimaryRouteCompletenessViolations({ steps, truthRows }) {
  if (steps.length === 0) {
    return [];
  }
  if (isHomeCountyPrimarySchoolChainComplete(truthRows)) {
    return [];
  }
  const missingStages = listMissingPrimarySchoolChainStages(truthRows);
  const hasPartialSchoolSteps = steps.some(
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
