import "server-only";

export type MunicipalityOption = {
  code: string;
  name: string;
  countyCode: string;
  countyName: string;
};

export type CountyMunicipalityGroup = {
  code: string;
  name: string;
  municipalities: MunicipalityOption[];
};

const COUNTY_META = [
  { code: "03", name: "Oslo" },
  { code: "11", name: "Rogaland" },
  { code: "15", name: "Møre og Romsdal" },
  { code: "18", name: "Nordland" },
  { code: "31", name: "Østfold" },
  { code: "32", name: "Akershus" },
  { code: "33", name: "Buskerud" },
  { code: "34", name: "Innlandet" },
  { code: "39", name: "Vestfold" },
  { code: "40", name: "Telemark" },
  { code: "42", name: "Agder" },
  { code: "46", name: "Vestland" },
  { code: "50", name: "Trøndelag" },
  { code: "55", name: "Troms" },
  { code: "56", name: "Finnmark" },
] as const;

const COUNTY_NAME_BY_CODE = Object.fromEntries(
  COUNTY_META.map((county) => [county.code, county.name])
) as Record<string, string>;

const MUNICIPALITIES_URL = "https://ws.geonorge.no/kommuneinfo/v1/kommuner";

function toCleanString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function padMunicipalityCode(value: string): string {
  return value.padStart(4, "0");
}

function padCountyCode(value: string): string {
  return value.padStart(2, "0");
}

function pickFirstString(
  source: Record<string, unknown>,
  keys: string[]
): string | null {
  for (const key of keys) {
    const value = toCleanString(source[key]);

    if (value) {
      return value;
    }
  }

  return null;
}

function extractMunicipalityArray(input: unknown): Record<string, unknown>[] {
  if (Array.isArray(input)) {
    return input.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null
    );
  }

  if (typeof input !== "object" || input === null) {
    return [];
  }

  const source = input as Record<string, unknown>;

  const nestedCandidates = [
    source.kommuner,
    source.items,
    source.data,
    source.content,
    source.results,
    source._embedded,
  ];

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null
      );
    }

    if (typeof candidate === "object" && candidate !== null) {
      const nestedObject = candidate as Record<string, unknown>;

      if (Array.isArray(nestedObject.kommuner)) {
        return nestedObject.kommuner.filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null
        );
      }
    }
  }

  return Object.values(source).filter(
    (item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null
  );
}

function normalizeMunicipality(
  item: Record<string, unknown>
): MunicipalityOption | null {
  const rawMunicipalityCode = pickFirstString(item, [
    "kommunenummer",
    "kommunekode",
    "kommunenr",
    "nummer",
    "id",
  ]);

  const name = pickFirstString(item, [
    "kommunenavnNorsk",
    "kommunenavn",
    "navn",
    "name",
  ]);

  const rawCountyCode = pickFirstString(item, [
    "fylkesnummer",
    "fylkeskode",
    "fylkesnr",
  ]);

  const countyName = pickFirstString(item, [
    "fylkesnavn",
    "fylkenavn",
    "countyName",
  ]);

  if (!rawMunicipalityCode || !name) {
    return null;
  }

  const municipalityCode = padMunicipalityCode(rawMunicipalityCode);
  const countyCode = rawCountyCode
    ? padCountyCode(rawCountyCode)
    : municipalityCode.slice(0, 2);

  return {
    code: municipalityCode,
    name,
    countyCode,
    countyName: countyName ?? COUNTY_NAME_BY_CODE[countyCode] ?? countyCode,
  };
}

export async function getNorwayCountyMunicipalityOptions(): Promise<
  CountyMunicipalityGroup[]
> {
  const response = await fetch(MUNICIPALITIES_URL, {
    next: { revalidate: 60 * 60 * 24 * 30 },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load municipalities from Kartverket: ${response.status}`
    );
  }

  const json = (await response.json()) as unknown;
  const municipalityItems = extractMunicipalityArray(json);
  const municipalities = municipalityItems
    .map(normalizeMunicipality)
    .filter((item): item is MunicipalityOption => item !== null);

  const grouped = new Map<string, CountyMunicipalityGroup>();

  for (const county of COUNTY_META) {
    grouped.set(county.code, {
      code: county.code,
      name: county.name,
      municipalities: [],
    });
  }

  for (const municipality of municipalities) {
    const county =
      grouped.get(municipality.countyCode) ??
      ({
        code: municipality.countyCode,
        name:
          COUNTY_NAME_BY_CODE[municipality.countyCode] ??
          municipality.countyName,
        municipalities: [],
      } satisfies CountyMunicipalityGroup);

    county.municipalities.push(municipality);
    grouped.set(county.code, county);
  }

  return Array.from(grouped.values())
    .map((county) => ({
      ...county,
      municipalities: [...county.municipalities].sort((a, b) =>
        a.name.localeCompare(b.name, "nb")
      ),
    }))
    .filter((county) => county.municipalities.length > 0)
    .sort(
      (a, b) =>
        COUNTY_META.findIndex((county) => county.code === a.code) -
        COUNTY_META.findIndex((county) => county.code === b.code)
    );
}