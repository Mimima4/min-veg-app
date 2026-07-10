import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import { CONTENT_LOCALES, type ContentLocale } from "@/lib/i18n/locales";

const ROUTE_STEPS_EMPTY_MESSAGE: Record<ContentLocale, string> = {
  nb: "Ingen rutetrinn er tilgjengelige ennå.",
  nn: "Ingen rutetrinn er tilgjengelige enno.",
  en: "No route steps are available yet.",
  se: "Ingen rutetrinn er tilgjengelige ennå.",
};

function resolveContentLocale(locale?: string): ContentLocale {
  if (locale && (CONTENT_LOCALES as readonly string[]).includes(locale)) {
    return locale as ContentLocale;
  }
  return "en";
}

export function getRouteStepsEmptyMessage(locale?: string): string {
  return getLocalizedValue(ROUTE_STEPS_EMPTY_MESSAGE, resolveContentLocale(locale));
}
