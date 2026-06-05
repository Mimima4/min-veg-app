/** Translatable UI locales (full product copy target). */
export const CONTENT_LOCALES = ["nb", "nn", "en", "se"] as const;

export type ContentLocale = (typeof CONTENT_LOCALES)[number];

/** App routing locales (content + auxiliary UI languages). */
export const APP_LOCALES = ["nb", "nn", "en", "se", "ru", "ar"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

/** @deprecated Prefer ContentLocale; kept for existing imports. */
export type SupportedLocale = ContentLocale;

export const APP_LOCALE_BUTTON_LABELS: Record<AppLocale, string> = {
  nb: "NB",
  nn: "NN",
  en: "EN",
  se: "SE",
  ru: "RU",
  ar: "AR",
};

export const APP_LOCALE_MENU_LABELS: Record<AppLocale, string> = {
  nb: "Norsk Bokmål",
  nn: "Norsk Nynorsk",
  en: "English",
  se: "Davvisámegiella",
  ru: "Русский",
  ar: "العربية",
};

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}

export function isContentLocale(value: string): value is ContentLocale {
  return (CONTENT_LOCALES as readonly string[]).includes(value);
}

/** Map routing locale to translatable content locale (ru/ar → nb). */
export function resolveContentLocale(locale: string): ContentLocale {
  if (isContentLocale(locale)) {
    return locale;
  }
  return "nb";
}
