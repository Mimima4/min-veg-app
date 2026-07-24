/**
 * Arbeidsplassen category mapping for every catalogue profession.
 *
 * Identity key remains vacancy-catalog STYRK (`styrkCode`).
 * Deep-links must use human-readable filter labels that Arbeidsplassen accepts:
 *   occupationLevel1=<level1Label>
 *   occupationLevel2=<level1Label>.<occupationLabel>
 *
 * When adding a profession: add a row here (required). Labels must match the
 * current NAV occupation snapshot (`nav_occupation_snapshot_rows`).
 */

export type CatalogProfessionArbeidsplassenEntry = {
  styrkCode: string;
  level1Label: string;
  occupationLabel: string;
};

export const CATALOG_PROFESSION_ARBEIDSPLASSEN: Readonly<
  Record<string, CatalogProfessionArbeidsplassenEntry>
> = {
  // Contour B / VGS
  electrician: {
    styrkCode: "håndverkere.elektriker/elektro",
    level1Label: "Håndverkere",
    occupationLabel: "Elektriker/elektro",
  },
  mechanic: {
    styrkCode: "håndverkere.mekaniker",
    level1Label: "Håndverkere",
    occupationLabel: "Mekaniker",
  },
  carpenter: {
    styrkCode: "håndverkere.tømrer-og-snekker",
    level1Label: "Håndverkere",
    occupationLabel: "Tømrer og snekker",
  },
  plumber: {
    styrkCode: "håndverkere.rørlegger",
    level1Label: "Håndverkere",
    occupationLabel: "Rørlegger",
  },
  painter: {
    styrkCode: "håndverkere.maler",
    level1Label: "Håndverkere",
    occupationLabel: "Maler",
  },
  "maskin-og-kranforer": {
    styrkCode: "bygg-og-anlegg.maskin--og-kranfører",
    level1Label: "Bygg og anlegg",
    occupationLabel: "Maskin- og kranfører",
  },
  "platearbeider-og-sveiser": {
    styrkCode: "håndverkere.platearbeider-og-sveiser",
    level1Label: "Håndverkere",
    occupationLabel: "Platearbeider og sveiser",
  },
  murer: {
    styrkCode: "håndverkere.murer",
    level1Label: "Håndverkere",
    occupationLabel: "Murer",
  },
  anleggsgartner: {
    styrkCode: "natur-og-miljø.skogbruk,-gartnerarbeid-og-hagebruk",
    level1Label: "Natur og miljø",
    occupationLabel: "Skogbruk, gartnerarbeid og hagebruk",
  },
  snekker: {
    styrkCode: "håndverkere.tømrer-og-snekker",
    level1Label: "Håndverkere",
    occupationLabel: "Tømrer og snekker",
  },
  kokk: {
    styrkCode: "reiseliv-og-mat.kokk",
    level1Label: "Reiseliv og mat",
    occupationLabel: "Kokk",
  },

  // Non-VGS catalogue
  doctor: {
    styrkCode: "helse-og-sosial.lege",
    level1Label: "Helse og sosial",
    occupationLabel: "Lege",
  },
  nurse: {
    styrkCode: "helse-og-sosial.sykepleier",
    level1Label: "Helse og sosial",
    occupationLabel: "Sykepleier",
  },
  teacher: {
    styrkCode: "utdanning.grunnskole",
    level1Label: "Utdanning",
    occupationLabel: "Grunnskole",
  },
  "software-developer": {
    styrkCode: "it.utvikling",
    level1Label: "IT",
    occupationLabel: "Utvikling",
  },
  "financial-analyst": {
    styrkCode: "kontor-og-økonomi.bank-finans-forsikring",
    level1Label: "Kontor og økonomi",
    occupationLabel: "Bank finans forsikring",
  },
};

/** @deprecated use CATALOG_PROFESSION_ARBEIDSPLASSEN — kept for smoke/import compatibility */
export const CATALOG_PROFESSION_ARBEIDSPLASSEN_STYRK: Readonly<Record<string, string>> =
  Object.fromEntries(
    Object.entries(CATALOG_PROFESSION_ARBEIDSPLASSEN).map(([slug, entry]) => [
      slug,
      entry.styrkCode,
    ])
  );
