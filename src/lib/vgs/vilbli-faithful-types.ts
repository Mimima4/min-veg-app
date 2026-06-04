export type VilbliFaithfulDisplayType =
  | "ordinary"
  | "losa_external_delivery"
  | "identity_unresolved";

export type VilbliFaithfulEntry = {
  displayType: VilbliFaithfulDisplayType;
  stage: string;
  schoolCode: string;
  schoolName: string;
  vilbliUrl: string | null;
  provenance: string;
  verificationStatus: string;
  institutionId: string | null;
  institutionName: string | null;
  matchType: string | null;
  isLosa: boolean;
  losaReason: string | null;
  hasSlashAliases: boolean;
  psaPublished: boolean;
};

export type VilbliFaithfulAvailabilityPayload = {
  countyCode: string;
  professionSlug: string;
  sourceUrl: string;
  extractedAt: string;
  entries: VilbliFaithfulEntry[];
  summary: {
    total: number;
    ordinary: number;
    losa_external_delivery: number;
    identity_unresolved: number;
  };
  enrichmentLabels: Array<{ tier: number; label: string }>;
  disclaimer: string;
};
