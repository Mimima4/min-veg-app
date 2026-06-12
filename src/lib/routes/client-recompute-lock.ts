/** Dedupes client-triggered recompute across React Strict Mode remounts. */
const inFlightRouteRecomputes = new Set<string>();

export function tryAcquireClientRecomputeLock(routeKey: string): boolean {
  if (inFlightRouteRecomputes.has(routeKey)) {
    return false;
  }
  inFlightRouteRecomputes.add(routeKey);
  return true;
}

export function releaseClientRecomputeLock(routeKey: string): void {
  inFlightRouteRecomputes.delete(routeKey);
}
