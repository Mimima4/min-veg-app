import { getRouteStepsEmptyMessage } from "@/lib/i18n/route-steps-empty-copy";

export const PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY_CODE =
  "PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY" as const;

export function getPrimaryRouteIncompleteHomeCountyCopy(locale: string): string {
  return getRouteStepsEmptyMessage(locale);
}

export function resolvePrimaryRouteEmptyStateFromWarnings(
  locale: string,
  warnings: Array<{ code: string }> | undefined
): { code: typeof PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY_CODE; message: string } | null {
  if (
    !warnings?.some((warning) => warning.code === PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY_CODE)
  ) {
    return null;
  }
  return {
    code: PRIMARY_ROUTE_INCOMPLETE_HOME_COUNTY_CODE,
    message: getPrimaryRouteIncompleteHomeCountyCopy(locale),
  };
}
