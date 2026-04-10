export const STUDY_ROUTE_STATUSES = [
    "saved",
    "needs_review",
    "outdated",
    "archived",
  ] as const;
  
  export type StudyRouteStatus = (typeof STUDY_ROUTE_STATUSES)[number];
  
  export const STUDY_ROUTE_VARIANT_STATUSES = [
    "draft",
    "saved",
    "superseded",
    "archived",
  ] as const;
  
  export type StudyRouteVariantStatus =
    (typeof STUDY_ROUTE_VARIANT_STATUSES)[number];
  
  export const STUDY_ROUTE_SNAPSHOT_STATUSES = [
    "current",
    "historical",
    "superseded",
    "failed_generation",
  ] as const;
  
  export type StudyRouteSnapshotStatus =
    (typeof STUDY_ROUTE_SNAPSHOT_STATUSES)[number];
  
  export function isActiveStudyRouteStatus(status: StudyRouteStatus): boolean {
    return status === "saved" || status === "needs_review";
  }