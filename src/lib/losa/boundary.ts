/**
 * Phase 4 LOSA operationalization boundary (scaffold only).
 * No imports from app routes, server PSA, Route Engine, or Supabase.
 */

export const PHASE4_LOSA_ALLOWED_SCOPE_LABEL =
  "phase4-losa-boundary-scaffold-read-only" as const;

export const PHASE4_LOSA_FORBIDDEN_ACTIONS = [
  "psa_materialization_or_publication",
  "route_engine_consumption",
  "phase2_table_writes",
  "db_writes",
  "sql_supabase_connect_or_execute",
  "production_truth_materialization",
  "runtime_live_source_fetch_on_route",
  "wire_losa_into_app_or_api_or_ui",
  "treat_losa_as_ordinary_campus_school",
] as const;

export type Phase4LosaForbiddenAction =
  (typeof PHASE4_LOSA_FORBIDDEN_ACTIONS)[number];

/** Documentation-only gate sequence for Finnmark LOSA reference case. */
export const PHASE4_LOSA_GATE_ORDER = [
  "P4-LOSA-IMPL",
  "P4-LOSA-MANIFEST",
  "P4-LOSA-EVIDENCE-LINK",
  "P4-LOSA-PUBLICATION-MODEL",
  "P4-LOSA-PSA",
  "P4-LOSA-ROUTE",
] as const;

/** Tranche 2 closed at docs level (read-only linkage; no PSA). */
export const PHASE4_LOSA_EVIDENCE_LINK_TRANCHE = 2 as const;

export type Phase4LosaGateId = (typeof PHASE4_LOSA_GATE_ORDER)[number];
