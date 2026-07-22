import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import { CONTENT_LOCALES, type ContentLocale } from "@/lib/i18n/locales";

const ROUTE_STEPS_EMPTY_MESSAGE: Record<ContentLocale, string> = {
  nb: "Ingen rutetrinn i hjemfylket i år.",
  nn: "Ingen rutetrinn i heimfylket i år.",
  en: "No route steps in the home county this year.",
  se: "Ingen rutetrinn i hjemfylket i år.",
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
