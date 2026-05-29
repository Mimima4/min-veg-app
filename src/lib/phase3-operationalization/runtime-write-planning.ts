/**
 * Phase 3 runtime/write planning labels (scaffold only).
 * Documents planning boundaries — not write-path or runtime activation.
 */

export const PHASE3_RW_PLANNING_SCOPE_LABEL =
  "phase3-rw-planning-boundary-non-wired" as const;

/** Planning-layer prohibitions; activation remains separately gated. */
export const PHASE3_RW_PLANNING_FORBIDDEN = [
  "write_path_activation",
  "runtime_path_activation_in_product",
  "db_writes",
  "sql_supabase_connect_or_execute",
  "psa_materialization_or_publication",
  "route_engine_consumption",
  "wire_planning_scaffold_into_app_or_api",
] as const;

export type Phase3RwPlanningForbidden =
  (typeof PHASE3_RW_PLANNING_FORBIDDEN)[number];

export const PHASE3_RW_PLANNING_POSTURE = {
  writePathActivated: false,
  runtimePathActivatedInProduct: false,
  scaffoldWired: false,
  notReadyForApplyUnchanged: true,
} as const;

export type Phase3RwPlanningPosture = typeof PHASE3_RW_PLANNING_POSTURE;
