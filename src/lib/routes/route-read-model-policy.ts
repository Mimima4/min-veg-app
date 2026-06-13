/** Working draft pages expose outcome-filter alternatives; saved routes do not. */
/** Keep in sync with scripts/lib/route-read-model-policy.mjs (smoke runtime). */
export function shouldShowAlternativeRoutesPanel(routeStatus: string): boolean {
  return routeStatus !== "saved";
}

/** Route entry must open a working draft when one exists (never a saved route row). */
export function resolveRouteEntryTargetRouteId(params: {
  draftRouteIds: string[];
  savedRouteIds: string[];
}): string | null {
  if (params.draftRouteIds.length > 0) {
    return params.draftRouteIds[0] ?? null;
  }
  return null;
}
