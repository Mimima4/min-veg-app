export const MAX_COMPARE_ROUTES = 5;

function uniqueIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean))).slice(0, MAX_COMPARE_ROUTES);
}

export function getRouteCompareStorageKey(childId: string): string {
  return `minveg_route_compare_${childId}`;
}

export function readRouteCompareIds(childId: string): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getRouteCompareStorageKey(childId));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return uniqueIds(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return [];
  }
}

export function writeRouteCompareIds(childId: string, ids: string[]) {
  if (typeof window === "undefined") return;

  const nextIds = uniqueIds(ids);
  window.localStorage.setItem(getRouteCompareStorageKey(childId), JSON.stringify(nextIds));
}

export function emitRouteCompareChanged(childId: string) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("minveg-route-compare-changed", {
      detail: { childId },
    })
  );
}
