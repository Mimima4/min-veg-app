export type AdmissionSourceFamily =
  | "centralized_admission"
  | "institution_programme_page"
  | "official_requirements_page"
  | "official_quota_page"
  | "official_threshold_source"
  | "other_official_source";

export type AdmissionReviewStatus = "pending" | "approved" | "rejected";

export type AdmissionConfidenceLevel = "low" | "medium" | "high";

export type AdmissionQuotaPayload = Record<string, unknown> | null;

export type AdmissionRequirementsPayload = Record<string, unknown> | null;

export type AdmissionThresholdsPayload = Record<string, unknown> | null;

export type AdmissionEligibilityPayload = Record<string, unknown> | null;

export type AdmissionNotesPayload = Record<string, unknown> | null;

export type RouteAdmissionRealismRecord = {
  id: string;
  professionSlug: string | null;
  programSlug: string;
  institutionId: string | null;
  sourceFamily: AdmissionSourceFamily;
  sourceUrl: string;
  sourceLabel: string;
  collectedAt: string;
  effectiveAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewStatus: AdmissionReviewStatus;
  confidenceLevel: AdmissionConfidenceLevel;
  quotaPayload: AdmissionQuotaPayload;
  requirementsPayload: AdmissionRequirementsPayload;
  thresholdsPayload: AdmissionThresholdsPayload;
  eligibilityPayload: AdmissionEligibilityPayload;
  notesPayload: AdmissionNotesPayload;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RouteAdmissionRealismQuery = {
  professionSlug?: string;
  programSlug: string;
  institutionId?: string | null;
};
