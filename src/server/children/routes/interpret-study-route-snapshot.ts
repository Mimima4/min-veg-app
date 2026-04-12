type RouteSnapshotSignalRecord = Record<string, unknown>;

export type InterpretedStudyRouteSnapshot = {
  warningsCount: number;
  hasNewRouteAvailable: boolean;
};

function countWarnings(value: unknown): number {
  if (!Array.isArray(value)) {
    return 0;
  }

  return value.length;
}

function readNewRouteAvailable(signals: unknown): boolean {
  if (!signals || typeof signals !== "object") {
    return false;
  }

  const record = signals as RouteSnapshotSignalRecord;

  if (record.newRouteAvailable === true) {
    return true;
  }

  if (record.new_route_available === true) {
    return true;
  }

  return false;
}

export function interpretStudyRouteSnapshot({
  warnings,
  signals,
}: {
  warnings: unknown;
  signals: unknown;
}): InterpretedStudyRouteSnapshot {
  return {
    warningsCount: countWarnings(warnings),
    hasNewRouteAvailable: readNewRouteAvailable(signals),
  };
}