/**
 * Phase 3 operationalization planning types (scaffold only).
 * Types only — no runtime side effects, no DB/Supabase/product truth.
 */

import type { Phase3ForbiddenAction, Phase3GateId } from "./boundary";

/** Planning-only readiness; does not imply execution approval. */
export type Phase3PlanningReadiness =
  | "not_started"
  | "boundary_scaffold_recorded"
  | "awaiting_p3_rw_gate"
  | "awaiting_p3_psa_gate"
  | "awaiting_p3_route_gate"
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

export type Phase3ScaffoldMetadata = {
  version: "0.1.0-scaffold";
  isolated: true;
  productConsumption: false;
};
