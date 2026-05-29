/**
 * Phase 3 operationalization boundary labels (scaffold only).
 * No imports from app, server, API, DB, Route, PSA, or Supabase.
 * No side effects.
 */

export const PHASE3_ALLOWED_SCOPE_LABEL =
  "phase3-boundary-scaffold-isolated-non-wired" as const;

export const PHASE3_FORBIDDEN_ACTIONS = [
  "runtime_write_execution",
  "db_writes",
  "sql_supabase_connect_or_execute",
  "psa_materialization_or_publication",
  "route_engine_consumption",
  "production_truth_materialization",
  "phase4_losa_implementation",
  "wire_scaffold_into_app_or_api_or_ui",
  "barrel_export_outside_phase3_operationalization",
] as const;

export type Phase3ForbiddenAction = (typeof PHASE3_FORBIDDEN_ACTIONS)[number];

export const PHASE3_DEPENDENCY_BOUNDARIES = {
  mayImportFromApp: false,
  mayImportFromServer: false,
  mayImportFromApiRoutes: false,
  mayImportFromSupabase: false,
  mayImportFromRouteEngine: false,
  mayImportFromPsaPaths: false,
  mayPerformIo: false,
} as const;

export type Phase3DependencyBoundaries = typeof PHASE3_DEPENDENCY_BOUNDARIES;

/** Documentation-only gate sequence; adoption/execution remain separately gated. */
export const PHASE3_GATE_ORDER = [
  "P3-IMPL",
  "P3-RW",
  "P3-PSA",
  "P3-ROUTE",
] as const;

export type Phase3GateId = (typeof PHASE3_GATE_ORDER)[number];

export const PHASE3_CHARTER_REFERENCE = {
  implCharterId: "P3-IMPL-EXEC-2026-05-29-01",
  implApprovalGateCommit: "5941f66",
  implCharterTemplateCommit: "44e4b91",
  rwCharterId: "P3-RW-EXEC-2026-05-29-01",
  rwApprovalGateCommit: "b24acc8",
  rwCharterTemplateCommit: "b24acc8",
  psaCharterId: "P3-PSA-EXEC-2026-05-29-01",
  psaApprovalGateCommit: "dfdaf7f",
  psaCharterTemplateCommit: "dfdaf7f",
} as const;
