import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import { CONTENT_LOCALES, type ContentLocale } from "@/lib/i18n/locales";

const ROUTE_LOADER_MESSAGE: Record<ContentLocale, string> = {
  nb: "Bygger rute…",
  nn: "Byggjer rute…",
  en: "Building route…",
  se: "Hukse ráhkadan…",
};

function resolveContentLocale(locale?: string): ContentLocale {
  if (locale && (CONTENT_LOCALES as readonly string[]).includes(locale)) {
    return locale as ContentLocale;
  }
  return "en";
}

export function getRouteLoaderMessage(locale?: string): string {
  return getLocalizedValue(ROUTE_LOADER_MESSAGE, resolveContentLocale(locale));
}
