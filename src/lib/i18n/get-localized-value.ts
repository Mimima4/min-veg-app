import type { SupportedLocale } from "@/lib/i18n/site-copy";

type LocalizedValue = Record<string, string> | null | undefined;

export function getLocalizedValue(
  value: LocalizedValue,
  locale: SupportedLocale
): string {
  if (!value) return "";

  return (
    value[locale] ??
    value.nb ??
    value.en ??
    Object.values(value)[0] ??
    ""
  );
}