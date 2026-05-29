/**
 * Phase 3 operationalization planning types (scaffold only).
 * Types only — no runtime side effects, no DB/Supabase/product truth.
 */

import type { Phase3ForbiddenAction, Phase3GateId } from "./boundary";
import type { Phase3RwPlanningForbidden } from "./runtime-write-planning";

/** Planning-only readiness; does not imply execution approval. */
export type Phase3PlanningReadiness =
  | "not_started"
  | "boundary_scaffold_recorded"
  | "p3_rw_planning_boundary_recorded"
  | "awaiting_p3_rw_gate"
  | "awaiting_p3_psa_gate"
  | "awaiting_p3_route_gate"
  | "blocked_fail_unclear";

/** Runtime/write planning slice readiness (no activation). */
export type Phase3RuntimeWritePlanningReadiness =
  | "not_started"
  | "rw_planning_labels_recorded"
  | "blocked_fail_unclear";

export type Phase3OperationalizationPlanningState = {
  scopeLabel: string;
  readiness: Phase3PlanningReadiness;
  currentGate: Phase3GateId;
  nextGate: Phase3GateId | null;
  activeForbiddenActions: readonly Phase3ForbiddenAction[];
  notReadyForApplyUnchanged: true;
  runtimeWired: false;
  notesRef?: string;
};

export type Phase3RuntimeWritePlanningState = {
  scopeLabel: string;
  readiness: Phase3RuntimeWritePlanningReadiness;
  activeRwForbidden: readonly Phase3RwPlanningForbidden[];
  writePathActivated: false;
  runtimePathActivatedInProduct: false;
  notReadyForApplyUnchanged: true;
  notesRef?: string;
};

export type Phase3ScaffoldMetadata = {
  version: "0.1.0-scaffold";
  isolated: true;
  productConsumption: false;
  rwPlanningSlice: "0.1.0-rw-planning";
};
