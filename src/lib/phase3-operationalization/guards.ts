/**
 * Pure planning-label guards for Phase 3 scaffold (no IO).
 */

import {
  PHASE3_ALLOWED_SCOPE_LABEL,
  PHASE3_FORBIDDEN_ACTIONS,
  PHASE3_GATE_ORDER,
} from "./boundary";
import type {
  Phase3OperationalizationPlanningState,
  Phase3PlanningReadiness,
} from "./types";

const PLANNING_READINESS_LABELS: readonly Phase3PlanningReadiness[] = [
  "not_started",
  "boundary_scaffold_recorded",
  "awaiting_p3_rw_gate",
  "awaiting_p3_psa_gate",
  "awaiting_p3_route_gate",
  "blocked_fail_unclear",
];

export function isPhase3PlanningReadiness(
  value: string,
): value is Phase3PlanningReadiness {
  return (PLANNING_READINESS_LABELS as readonly string[]).includes(value);
}

export function isAllowedPhase3ScopeLabel(scopeLabel: string): boolean {
  return scopeLabel === PHASE3_ALLOWED_SCOPE_LABEL;
}

export function isPhase3GateId(value: string): value is (typeof PHASE3_GATE_ORDER)[number] {
  return (PHASE3_GATE_ORDER as readonly string[]).includes(value);
}

export function assertPlanningStateInvariants(
  state: Phase3OperationalizationPlanningState,
): boolean {
  if (!isAllowedPhase3ScopeLabel(state.scopeLabel)) {
    return false;
  }
  if (!isPhase3PlanningReadiness(state.readiness)) {
    return false;
  }
  if (!isPhase3GateId(state.currentGate)) {
    return false;
  }
  if (state.nextGate !== null && !isPhase3GateId(state.nextGate)) {
    return false;
  }
  if (state.runtimeWired !== false) {
    return false;
  }
  if (state.notReadyForApplyUnchanged !== true) {
    return false;
  }
  for (const action of state.activeForbiddenActions) {
    if (!(PHASE3_FORBIDDEN_ACTIONS as readonly string[]).includes(action)) {
      return false;
    }
  }
  return true;
}

export function createDefaultPlanningState(): Phase3OperationalizationPlanningState {
  return {
    scopeLabel: PHASE3_ALLOWED_SCOPE_LABEL,
    readiness: "boundary_scaffold_recorded",
    currentGate: "P3-IMPL",
    nextGate: "P3-RW",
    activeForbiddenActions: [...PHASE3_FORBIDDEN_ACTIONS],
    notReadyForApplyUnchanged: true,
    runtimeWired: false,
  };
}
