/** Runtime guards — keep in sync with scripts/lib/route-truth-invariants.mjs */
import { isLosaAvailabilityScope } from "@/lib/losa/availability-scope";
import { PATH_VARIANT_VG3_THEN_BEDRIFT } from "@/lib/nav/route-outcome-filter-id";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import type { AvailabilityTruthRow } from "@/server/children/routes/get-availability-truth";
import type { PathVariant } from "@/server/children/routes/build-path-variants";
import { isLarefagSelectionStage } from "@/lib/vgs/larefag-selection-stage";
import { hasVg3SchoolProgrammeAvailability } from "@/lib/vgs/vg3-school-programme-availability";

export type RouteTruthInvariantCode =
  | "PATH_VG3_VARIANT_WITHOUT_TRUTH"
  | "PATH_VG3_NODE_WITHOUT_TRUTH"
  | "PATH_VG3_NODE_HAS_BRANCH_OPTIONS"
  | "STEP_VG3_WITHOUT_TRUTH"
  | "STEP_VG3_FABRICATED_BRANCH_OPTIONS"
  | "STEP_VG3_OPTIONS_MISSING_SCHOOL"
  | "STEP_APPRENTICESHIP_HAS_KOLONNE3_FAG_OPTIONS";

export type RouteTruthInvariantViolation = {
  code: RouteTruthInvariantCode;
  message: string;
};

function isVilbliBranchInstitutionId(value: string | null | undefined): boolean {
  return String(value ?? "").trim().startsWith("vilbli-branch:");
}

export function collectPathVariantInvariantViolations(params: {
  variants: PathVariant[];
  truthRows: AvailabilityTruthRow[];
}): RouteTruthInvariantViolation[] {
  const violations: RouteTruthInvariantViolation[] = [];
  const hasVg3Truth = hasVg3SchoolProgrammeAvailability(params.truthRows);

  for (const variant of params.variants) {
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

export function collectStudyRouteStepsInvariantViolations(params: {
  steps: StudyRouteSnapshotStep[];
  truthRows: AvailabilityTruthRow[];
}): RouteTruthInvariantViolation[] {
  const violations: RouteTruthInvariantViolation[] = [];
  const hasVg3Truth = hasVg3SchoolProgrammeAvailability(params.truthRows);
  const truthVg3InstitutionIds = new Set(
    params.truthRows
      .filter((row) => row.stage === "VG3" && !isLosaAvailabilityScope(row.availabilityScope))
      .map((row) => row.institutionId)
      .filter(Boolean)
  );

  const hasLarefagStep = params.steps.some(
    (step) => step.type === "programme_selection" && isLarefagSelectionStage(step.stage)
  );

  for (const step of params.steps) {
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
      const missingSchoolLabel = options.some(
        (option) => !String(option.institution_name ?? "").trim()
      );
      if (missingSchoolLabel) {
        violations.push({
          code: "STEP_VG3_OPTIONS_MISSING_SCHOOL",
          message: "VG3 programme_selection options must include institution_name (school label)",
        });
      }

      const unknownInstitution = options.some((option) => {
        const institutionId = String(option.institution_id ?? "").trim();
        return (
          institutionId &&
          !isVilbliBranchInstitutionId(institutionId) &&
          truthVg3InstitutionIds.size > 0 &&
          !truthVg3InstitutionIds.has(institutionId)
        );
      });
      if (unknownInstitution) {
        violations.push({
          code: "STEP_VG3_OPTIONS_MISSING_SCHOOL",
          message: "VG3 programme_selection options include institutions outside PSA VG3 truth",
        });
      }
    }
  }

  for (const step of params.steps) {
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

export function collectRouteTruthInvariantViolations(params: {
  variants: PathVariant[];
  steps: StudyRouteSnapshotStep[];
  truthRows: AvailabilityTruthRow[];
}): RouteTruthInvariantViolation[] {
  return [
    ...collectPathVariantInvariantViolations({
      variants: params.variants,
      truthRows: params.truthRows,
    }),
    ...collectStudyRouteStepsInvariantViolations({
      steps: params.steps,
      truthRows: params.truthRows,
    }),
  ];
}

export function assertRouteTruthInvariants(params: {
  variants: PathVariant[];
  steps: StudyRouteSnapshotStep[];
  truthRows: AvailabilityTruthRow[];
  context: string;
}): void {
  const violations = collectRouteTruthInvariantViolations(params);
  if (violations.length === 0) {
    return;
  }

  const detail = violations.map((item) => `${item.code}: ${item.message}`).join("; ");
  throw new Error(`Route truth invariant failed (${params.context}): ${detail}`);
}
