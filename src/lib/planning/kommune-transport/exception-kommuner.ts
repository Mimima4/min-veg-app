import { normalizeMunicipalityCode } from "@/lib/planning/geo-distance";

/**
 * Static sparse-transport kommuner (owner-record 2026-06-10).
 * Exception mode: round-trip feasibility, not buffer-first.
 */
const STATIC_EXCEPTION_KOMMUNE_CODES = new Set<string>([
  // Finnmark (except Alta, Hammerfest, Sør-Varanger hubs)
  "5607",
  "5610",
  "5612",
  "5614",
  "5616",
  "5618",
  "5620",
  "5622",
  "5624",
  "5626",
  "5628",
  "5630",
  "5632",
  "5634",
  "5636",
  // Troms
  "5516",
  "5528",
  "5534",
  "5536",
  "5540",
  "5542",
  "5544",
  "5546",
  // Nordland
  "1811",
  "1825",
  "1826",
  "1827",
  "1834",
  "1835",
  "1836",
  "1837",
  "1838",
  "1856",
  "1857",
  "1859",
  "1874",
  // Innlandet
  "3424",
  "3425",
  "3429",
  "3440",
  "3450",
  "5042",
  "5044",
  // Møre og Romsdal
  "1514",
  "1532",
  "1547",
  "1579",
  // Vestland pilot exceptions
  "4633",
  "4636",
  // Agder
  "4221",
  "4222",
  // Rogaland
  "1111",
]);

export function isStaticTransportExceptionKommune(
  municipalityCode: string | null | undefined
): boolean {
  const normalized = normalizeMunicipalityCode(municipalityCode);
  if (!normalized) return false;
  return STATIC_EXCEPTION_KOMMUNE_CODES.has(normalized);
}

export function isTransportExceptionCorridor(params: {
  homeMunicipalityCodes: string[];
  schoolMunicipalityCode: string | null | undefined;
}): boolean {
  const schoolCode = normalizeMunicipalityCode(params.schoolMunicipalityCode);
  if (!schoolCode) return false;

  const homeCodes = params.homeMunicipalityCodes
    .map((code) => normalizeMunicipalityCode(code))
    .filter((code): code is string => Boolean(code));

  if (homeCodes.some((code) => code === schoolCode)) {
    return false;
  }

  if (isStaticTransportExceptionKommune(schoolCode)) {
    return true;
  }

  return homeCodes.some((code) => isStaticTransportExceptionKommune(code));
}
