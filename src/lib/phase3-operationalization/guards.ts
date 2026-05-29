/**
 * Pure planning-label guards for Phase 3 scaffold (no IO).
 */

import {
  PHASE3_ALLOWED_SCOPE_LABEL,
  PHASE3_FORBIDDEN_ACTIONS,
  PHASE3_GATE_ORDER,
} from "./boundary";
import {
  PHASE3_PSA_PLANNING_FORBIDDEN,
  PHASE3_PSA_PLANNING_SCOPE_LABEL,
} from "./psa-planning";
import {
  PHASE3_ROUTE_PLANNING_FORBIDDEN,
  PHASE3_ROUTE_PLANNING_SCOPE_LABEL,
} from "./route-planning";
import {
  PHASE3_RW_PLANNING_FORBIDDEN,
  PHASE3_RW_PLANNING_SCOPE_LABEL,
} from "./runtime-write-planning";
import type {
  Phase3OperationalizationPlanningState,
  Phase3PlanningReadiness,
  Phase3PsaPlanningReadiness,
  Phase3PsaPlanningState,
  Phase3RoutePlanningReadiness,
  Phase3RoutePlanningState,
  Phase3RuntimeWritePlanningReadiness,
  Phase3RuntimeWritePlanningState,
} from "./types";

const PLANNING_READINESS_LABELS: readonly Phase3PlanningReadiness[] = [
  "not_started",
  "boundary_scaffold_recorded",
  "p3_rw_planning_boundary_recorded",
  "p3_psa_planning_boundary_recorded",
  "p3_route_planning_boundary_recorded",
  "awaiting_p3_rw_gate",
  "awaiting_p3_psa_gate",
  "awaiting_p3_route_gate",
  "blocked_fail_unclear",
];

const RW_PLANNING_READINESS_LABELS: readonly Phase3RuntimeWritePlanningReadiness[] =
  ["not_started", "rw_planning_labels_recorded", "blocked_fail_unclear"];

const PSA_PLANNING_READINESS_LABELS: readonly Phase3PsaPlanningReadiness[] = [
  "not_started",
  "psa_planning_labels_recorded",
  "blocked_fail_unclear",
];

const ROUTE_PLANNING_READINESS_LABELS: readonly Phase3RoutePlanningReadiness[] =
  ["not_started", "route_planning_labels_recorded", "blocked_fail_unclear"];

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

export function isPhase3RuntimeWritePlanningReadiness(
  value: string,
): value is Phase3RuntimeWritePlanningReadiness {
  return (RW_PLANNING_READINESS_LABELS as readonly string[]).includes(value);
}

export function isAllowedPhase3RwScopeLabel(scopeLabel: string): boolean {
  return scopeLabel === PHASE3_RW_PLANNING_SCOPE_LABEL;
}

export function assertRuntimeWritePlanningInvariants(
  state: Phase3RuntimeWritePlanningState,
): boolean {
  if (!isAllowedPhase3RwScopeLabel(state.scopeLabel)) {
    return false;
  }
  if (!isPhase3RuntimeWritePlanningReadiness(state.readiness)) {
    return false;
  }
  if (state.writePathActivated !== false) {
    return false;
  }
  if (state.runtimePathActivatedInProduct !== false) {
    return false;
  }
  if (state.notReadyForApplyUnchanged !== true) {
    return false;
  }
  for (const action of state.activeRwForbidden) {
    if (!(PHASE3_RW_PLANNING_FORBIDDEN as readonly string[]).includes(action)) {
      return false;
    }
  }
  return true;
}

export function createDefaultRuntimeWritePlanningState(): Phase3RuntimeWritePlanningState {
  return {
    scopeLabel: PHASE3_RW_PLANNING_SCOPE_LABEL,
    readiness: "rw_planning_labels_recorded",
    activeRwForbidden: [...PHASE3_RW_PLANNING_FORBIDDEN],
    writePathActivated: false,
    runtimePathActivatedInProduct: false,
    notReadyForApplyUnchanged: true,
  };
}

export function isPhase3PsaPlanningReadiness(
  value: string,
): value is Phase3PsaPlanningReadiness {
  return (PSA_PLANNING_READINESS_LABELS as readonly string[]).includes(value);
}

export function isAllowedPhase3PsaScopeLabel(scopeLabel: string): boolean {
  return scopeLabel === PHASE3_PSA_PLANNING_SCOPE_LABEL;
}

export function assertPsaPlanningInvariants(state: Phase3PsaPlanningState): boolean {
  if (!isAllowedPhase3PsaScopeLabel(state.scopeLabel)) {
    return false;
  }
  if (!isPhase3PsaPlanningReadiness(state.readiness)) {
    return false;
  }
  if (state.materializationExecuted !== false) {
    return false;
  }
  if (state.publicationExecuted !== false) {
    return false;
  }
  if (state.xPostRoutePsaProductRuntime !== "NO_TOUCH") {
    return false;
  }
  if (state.notReadyForApplyUnchanged !== true) {
    return false;
  }
  for (const action of state.activePsaForbidden) {
    if (!(PHASE3_PSA_PLANNING_FORBIDDEN as readonly string[]).includes(action)) {
      return false;
    }
  }
  return true;
}

export function createDefaultPsaPlanningState(): Phase3PsaPlanningState {
  return {
    scopeLabel: PHASE3_PSA_PLANNING_SCOPE_LABEL,
    readiness: "psa_planning_labels_recorded",
    activePsaForbidden: [...PHASE3_PSA_PLANNING_FORBIDDEN],
    materializationExecuted: false,
    publicationExecuted: false,
    xPostRoutePsaProductRuntime: "NO_TOUCH",
    notReadyForApplyUnchanged: true,
  };
}

export function isPhase3RoutePlanningReadiness(
  value: string,
): value is Phase3RoutePlanningReadiness {
  return (ROUTE_PLANNING_READINESS_LABELS as readonly string[]).includes(value);
}

export function isAllowedPhase3RouteScopeLabel(scopeLabel: string): boolean {
  return scopeLabel === PHASE3_ROUTE_PLANNING_SCOPE_LABEL;
}

export function assertRoutePlanningInvariants(
  state: Phase3RoutePlanningState,
): boolean {
  if (!isAllowedPhase3RouteScopeLabel(state.scopeLabel)) {
    return false;
  }
  if (!isPhase3RoutePlanningReadiness(state.readiness)) {
    return false;
  }
  if (state.routeConsumptionExecuted !== false) {
    return false;
  }
  if (state.routeEnablementInProduct !== false) {
    return false;
  }
  if (state.xPostRoutePsaProductRuntime !== "NO_TOUCH") {
    return false;
  }
  if (state.notReadyForApplyUnchanged !== true) {
    return false;
  }
  for (const action of state.activeRouteForbidden) {
    if (!(PHASE3_ROUTE_PLANNING_FORBIDDEN as readonly string[]).includes(action)) {
      return false;
    }
  }
  return true;
}

export function createDefaultRoutePlanningState(): Phase3RoutePlanningState {
  return {
    scopeLabel: PHASE3_ROUTE_PLANNING_SCOPE_LABEL,
    readiness: "route_planning_labels_recorded",
    activeRouteForbidden: [...PHASE3_ROUTE_PLANNING_FORBIDDEN],
    routeConsumptionExecuted: false,
    routeEnablementInProduct: false,
    xPostRoutePsaProductRuntime: "NO_TOUCH",
    notReadyForApplyUnchanged: true,
  };
}

export function createDefaultPlanningState(): Phase3OperationalizationPlanningState {
  return {
    scopeLabel: PHASE3_ALLOWED_SCOPE_LABEL,
    readiness: "p3_route_planning_boundary_recorded",
    currentGate: "P3-ROUTE",
    nextGate: null,
    activeForbiddenActions: [...PHASE3_FORBIDDEN_ACTIONS],
    notReadyForApplyUnchanged: true,
    runtimeWired: false,
  };
}
