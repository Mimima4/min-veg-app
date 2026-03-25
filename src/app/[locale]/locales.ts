export const LOCALES = ["nb", "nn", "en", "ru", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_BUTTON_LABELS: Record<Locale, string> = {
  nb: "NB",
  nn: "NN",
  en: "EN",
  ru: "RU",
  ar: "AR",
};

export const LOCALE_MENU_LABELS: Record<Locale, string> = {
  nb: "Norsk Bokmål",
  nn: "Norsk Nynorsk",
  en: "English",
  ru: "Русский",
  ar: "العربية",
};

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}
