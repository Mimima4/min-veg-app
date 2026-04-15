import type { RouteAdmissionRealismRecord } from "@/lib/routes/route-admission-realism-types";

type AdmissionAdvantageMetrics = {
  quotaWeight?: number | null;
  competitionAdjustment?: number | null;
  requirementAlignment?: number | null;
};

export type AdmissionAdvantageInput = {
  professionSlug: string;
  programSlug: string;
  institutionId: string | null;
  metrics?: AdmissionAdvantageMetrics | null;
  admissionRealismRecord?: RouteAdmissionRealismRecord | null;
};

export type AdmissionAdvantageScore = {
  score: number;
  hasOfficialData: boolean;
};

function normalizeMetric(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return value;
}

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

function deriveMetricsFromRecord(
  record: RouteAdmissionRealismRecord | null | undefined
): AdmissionAdvantageMetrics | null {
  if (!record) {
    return null;
  }

  const quota = toRecord(record.quotaPayload);
  const requirements = toRecord(record.requirementsPayload);
  const thresholds = toRecord(record.thresholdsPayload);

  const quotaWeight = readNumber(quota, "advantage_weight");
  const requirementAlignment = readNumber(requirements, "alignment_weight");
  const competitionAdjustment = readNumber(thresholds, "competition_adjustment");

  if (
    quotaWeight === null &&
    requirementAlignment === null &&
    competitionAdjustment === null
  ) {
    return null;
  }

  return {
    quotaWeight,
    requirementAlignment,
    competitionAdjustment,
  };
}

export function computeAdmissionAdvantageScore(
  input: AdmissionAdvantageInput
): AdmissionAdvantageScore {
  const metrics = input.metrics ?? deriveMetricsFromRecord(input.admissionRealismRecord);

  // No record or no numeric engine fields → neutral score; stable slug ordering within scope.
  if (!metrics) {
    return {
      score: 0,
      hasOfficialData: false,
    };
  }

  const score =
    normalizeMetric(metrics.quotaWeight) +
    normalizeMetric(metrics.competitionAdjustment) +
    normalizeMetric(metrics.requirementAlignment);

  return {
    score,
    hasOfficialData: true,
  };
}
