import type { StudyRouteSignals } from "@/lib/routes/route-signal-types";
import type { StudyRouteSnapshotContext } from "@/lib/routes/route-types";
import type { RouteAdmissionRealismRecord } from "@/lib/routes/route-admission-realism-types";
import { getRouteRequirementsRule } from "./route-requirements-rules";

type BuildRouteSignalsInput = {
  snapshotContext: StudyRouteSnapshotContext;
  professionSlug: string;
  selectedProgramExists: boolean;
  mode: "initial" | "recompute";
  admissionRealismRecord: RouteAdmissionRealismRecord | null;
};

function toRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readNumber(record: Record<string, unknown> | null, key: string): number | null {
  if (!record) {
    return null;
  }
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readString(record: Record<string, unknown> | null, key: string): string | null {
  if (!record) {
    return null;
  }
  const value = record[key];
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractRequirementLabelsFromAdmission(
  record: RouteAdmissionRealismRecord | null
): string[] {
  if (!record) {
    return [];
  }

  const requirements = toRecord(record.requirementsPayload);
  if (!requirements) {
    return [];
  }

  const keyConditions = requirements["key_conditions"];
  if (!Array.isArray(keyConditions)) {
    return [];
  }

  return keyConditions
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }
      const row = item as Record<string, unknown>;
      return (
        readString(row, "label_nb") ??
        readString(row, "label_en") ??
        readString(row, "label")
      );
    })
    .filter((item): item is string => Boolean(item));
}

function mergeRequirementItems(staticItems: string[], admissionItems: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const item of [...staticItems, ...admissionItems]) {
    const normalized = item.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    merged.push(item.trim());
  }

  return merged;
}

export function buildRouteSignals(input: BuildRouteSignalsInput): StudyRouteSignals {
  const planning = input.snapshotContext.planning;

  const hasInterests = planning.interestIds.length > 0;
  const hasStrengths = planning.derivedStrengthIds.length > 0;
  const hasEducationPreference = Boolean(planning.preferredEducationLevel);
  const hasIncomeBand = Boolean(planning.desiredIncomeBand);
  const hasWorkStyle = Boolean(planning.preferredWorkStyle);

  const warnings: StudyRouteSignals["warnings"] = [];
  const improvementGuidance: StudyRouteSignals["improvementGuidance"] = [];

  if (!hasInterests) {
    warnings.push({
      code: "missing_interests",
      label: "Interest profile is still thin",
      severity: "medium",
    });
    improvementGuidance.push({
      code: "add_interests",
      label: "Add interest signals",
    });
  }

  const staticRequirements = getRouteRequirementsRule(input.professionSlug)?.items ?? [];
  const admissionRequirements = extractRequirementLabelsFromAdmission(
    input.admissionRealismRecord
  );
  const mergedRequirements = mergeRequirementItems(staticRequirements, admissionRequirements);

  if (mergedRequirements.length > 0) {
    improvementGuidance.push({
      code: "review_admission_requirements",
      label: "Review admission requirements",
      description: mergedRequirements.join(" • "),
    });
  }

  const thresholds = toRecord(input.admissionRealismRecord?.thresholdsPayload ?? null);
  const quota = toRecord(input.admissionRealismRecord?.quotaPayload ?? null);
  const competitionAdjustment = readNumber(thresholds, "competition_adjustment");
  const quotaAdvantageWeight = readNumber(quota, "advantage_weight");
  const confidenceLevel = input.admissionRealismRecord?.confidenceLevel ?? null;

  if (typeof competitionAdjustment === "number") {
    if (confidenceLevel === "low") {
      improvementGuidance.push({
        code: "admission_confidence_limited",
        label: "Admission realism confidence is limited",
        description:
          "Current official-source admission input has low confidence, so route interpretation remains conservative.",
      });
    } else if (competitionAdjustment > -1.0) {
      improvementGuidance.push({
        code: "competition_pressure_moderated",
        label: "Competition pressure is somewhat moderated",
        description:
          "Current official-source thresholds indicate this programme may be relatively more reachable than the strictest alternatives.",
      });
    } else {
      warnings.push({
        code: "competition_pressure_high",
        label: "Admission competition remains high",
        description:
          "Official-source threshold input indicates continued high competition for this programme.",
        severity: "medium",
      });
    }
  }

  if ((quotaAdvantageWeight ?? 0) > 0) {
    improvementGuidance.push({
      code: "quota_advantage_context",
      label: "Quota context can improve route feasibility",
      description:
        "Official-source quota data indicates a positive admission context for this programme within current rules.",
    });
  }

  const evidenceCount = [
    hasInterests,
    hasStrengths,
    hasEducationPreference || hasIncomeBand || hasWorkStyle,
  ].filter(Boolean).length;

  let fitSummary: string | null = null;
  let confidenceSummary: string | null = null;
  let feasibilitySummary: string | null = null;

  if (evidenceCount >= 3) {
    fitSummary = "Good baseline fit";
    confidenceSummary = "Moderate confidence";
    feasibilitySummary = "Initial route is feasible at baseline level";
  } else if (evidenceCount === 2) {
    fitSummary = "Early fit signal";
    confidenceSummary = "Developing confidence";
    feasibilitySummary = "Route is usable, but still needs more profile depth";
  } else {
    fitSummary = "Low-signal route";
    confidenceSummary = "Low confidence";
    feasibilitySummary =
      "Route exists, but realism is still limited by missing planning signals";
  }

  if (input.mode === "initial" || input.mode === "recompute") {
    feasibilitySummary =
      input.selectedProgramExists && planning.preferredEducationLevel
        ? `${
            input.mode === "initial" ? "Initial" : "Recomputed"
          } route has a valid target profession and linked programme`
        : input.selectedProgramExists
          ? `${
              input.mode === "initial" ? "Route" : "Recomputed route"
            } has a linked programme, but still needs more planning depth`
          : `${
              input.mode === "initial" ? "Route exists" : "Recomputed route still"
            } has no linked programme`;
  }

  if (input.selectedProgramExists && typeof competitionAdjustment === "number") {
    if (confidenceLevel === "low") {
      feasibilitySummary = `${feasibilitySummary}. Official admission confidence is currently limited.`;
    } else if (competitionAdjustment > -1.0) {
      feasibilitySummary = `${feasibilitySummary}. Threshold data suggests moderately improved admission feasibility for this option.`;
    } else if (competitionAdjustment <= -1.2) {
      feasibilitySummary = `${feasibilitySummary}. Threshold data indicates this option remains highly competitive.`;
    }
  }

  return {
    fitSummary,
    confidenceSummary,
    feasibilitySummary,
    warnings,
    improvementGuidance,
    evidenceComposition: {
      hasParentInput:
        hasInterests || hasEducationPreference || hasIncomeBand || hasWorkStyle,
      hasSchoolEvidence: false,
      hasDerivedSignals: hasStrengths,
    },
  };
}
