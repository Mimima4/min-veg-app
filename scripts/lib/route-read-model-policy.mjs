/**
 * Keep in sync with src/lib/routes/route-read-model-policy.ts (smoke runtime).
 */
export function shouldShowAlternativeRoutesPanel(routeStatus) {
  return routeStatus !== "saved";
}

export function resolveRouteEntryTargetRouteId(params) {
  if (params.draftRouteIds.length > 0) {
    return params.draftRouteIds[0] ?? null;
  }
  return null;
}
