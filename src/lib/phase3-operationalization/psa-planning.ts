/**
 * Phase 3 PSA materialization/publication planning labels (scaffold only).
 * Documents planning boundaries — not PSA execution or product-path changes.
 */

export const PHASE3_PSA_PLANNING_SCOPE_LABEL =
  "phase3-psa-planning-boundary-non-wired" as const;

/** Planning-layer prohibitions; materialization/publication remain separately gated. */
export const PHASE3_PSA_PLANNING_FORBIDDEN = [
  "psa_materialization_execution",
  "psa_publication_execution",
  "x_post_route_psa_product_runtime_changes",
  "db_writes",
  "sql_supabase_connect_or_execute",
  "route_engine_consumption",
  "wire_planning_scaffold_into_psa_product_paths",
] as const;

export type Phase3PsaPlanningForbidden =
  (typeof PHASE3_PSA_PLANNING_FORBIDDEN)[number];

export const PHASE3_PSA_PLANNING_POSTURE = {
  materializationExecuted: false,
  publicationExecuted: false,
  xPostRoutePsaProductRuntime: "NO_TOUCH" as const,
  scaffoldWired: false,
  notReadyForApplyUnchanged: true,
} as const;

export type Phase3PsaPlanningPosture = typeof PHASE3_PSA_PLANNING_POSTURE;
