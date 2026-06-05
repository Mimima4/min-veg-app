import type { ContentLocale } from "@/lib/i18n/locales";
import type { LocalizedLabel } from "@/lib/i18n/localized-label";

type LocalizedValue = LocalizedLabel | Record<string, string> | null | undefined;

export function getLocalizedValue(
  value: LocalizedValue,
  locale: ContentLocale
): string {
  if (!value) return "";

  if (locale === "se" && value.se) {
    return value.se;
  }

  return (
    value[locale] ??
    value.nb ??
    value.en ??
    Object.values(value)[0] ??
    ""
  );
}