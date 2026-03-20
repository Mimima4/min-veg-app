export const LOCALES = ["nb", "nn", "en"] as const;

export type Locale = (typeof LOCALES)[number];

