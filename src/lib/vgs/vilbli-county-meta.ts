/**
 * Keep in sync with `scripts/lib/vilbli-county-meta.mjs`.
 */
export const FYLKE_CODE_TO_VILBLI_COUNTY_SLUG: Record<string, string> = {
  "03": "oslo",
  "11": "rogaland",
  "15": "more-og-romsdal",
  "18": "nordland",
  "31": "ostfold",
  "32": "akershus",
  "33": "buskerud",
  "34": "innlandet",
  "39": "vestfold",
  "40": "telemark",
  "42": "agder",
  "46": "vestland",
  "50": "trondelag",
  "55": "troms",
  "56": "finnmark",
};

export function vilbliCountySlugsForFylkeCodes(fylkeCodes: string[]): Set<string> {
  return new Set(
    fylkeCodes
      .map((code) => FYLKE_CODE_TO_VILBLI_COUNTY_SLUG[code.trim()])
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => slug.toLowerCase())
  );
}
