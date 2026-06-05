import type { ContentLocale } from "@/lib/i18n/locales";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";

export type LocalizedLabel = {
  nb: string;
  nn: string;
  en: string;
  se?: string;
};

export function labelFrom(
  labels: LocalizedLabel | undefined,
  locale: ContentLocale,
  fallback: string
): string {
  if (!labels) {
    return fallback;
  }
  return getLocalizedValue(labels, locale) || fallback;
}
