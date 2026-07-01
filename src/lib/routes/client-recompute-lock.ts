/** Dedupes client-triggered recompute across remounts, Strict Mode, and HMR races. */
const inFlightRouteRecomputes = new Map<string, Promise<unknown>>();

export function runClientRecomputeOnce<T>(
  routeKey: string,
  run: () => Promise<T>
): Promise<T> {
  const existing = inFlightRouteRecomputes.get(routeKey);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = run().finally(() => {
    if (inFlightRouteRecomputes.get(routeKey) === promise) {
      inFlightRouteRecomputes.delete(routeKey);
    }
  });

  inFlightRouteRecomputes.set(routeKey, promise);
  return promise;
}
