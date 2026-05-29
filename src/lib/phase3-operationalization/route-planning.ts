/**
 * Phase 3 Route Engine consumption planning labels (scaffold only).
 * Documents planning boundaries — not Route consumption or X-post product runtime changes.
 */

export const PHASE3_ROUTE_PLANNING_SCOPE_LABEL =
  "phase3-route-planning-boundary-non-wired" as const;

/** Planning-layer prohibitions; consumption remains separately gated. */
export const PHASE3_ROUTE_PLANNING_FORBIDDEN = [
  "route_engine_consumption_execution",
  "route_engine_enablement_in_product",
  "x_post_route_psa_product_runtime_changes",
  "db_writes",
  "sql_supabase_connect_or_execute",
  "psa_materialization_or_publication",
  "runtime_write_path_activation",
  "wire_planning_scaffold_into_route_product_paths",
] as const;

export type Phase3RoutePlanningForbidden =
  (typeof PHASE3_ROUTE_PLANNING_FORBIDDEN)[number];

export const PHASE3_ROUTE_PLANNING_POSTURE = {
  routeConsumptionExecuted: false,
  routeEnablementInProduct: false,
  xPostRoutePsaProductRuntime: "NO_TOUCH" as const,
  scaffoldWired: false,
  notReadyForApplyUnchanged: true,
} as const;

export type Phase3RoutePlanningPosture = typeof PHASE3_ROUTE_PLANNING_POSTURE;
