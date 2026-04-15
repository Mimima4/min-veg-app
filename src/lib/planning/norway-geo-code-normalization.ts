const CURRENT_FYLKE_CODES = new Set([
  "03",
  "11",
  "15",
  "18",
  "31",
  "32",
  "33",
  "34",
  "39",
  "40",
  "42",
  "46",
  "50",
  "55",
  "56",
]);

// Legacy county splits that can still appear in stored datasets.
const LEGACY_TO_CURRENT_FYLKE: Record<string, string[]> = {
  "30": ["31", "32", "33"], // Viken
  "38": ["39", "40"], // Vestfold og Telemark
  "54": ["55", "56"], // Troms og Finnmark
};

function normalizeTwoDigitCode(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length < 2) {
    return null;
  }

  return trimmed.slice(0, 2).padStart(2, "0");
}

function normalizeFylkeCode(value: string | null | undefined): string[] {
  const code = normalizeTwoDigitCode(value);
  if (!code) {
    return [];
  }

  if (CURRENT_FYLKE_CODES.has(code)) {
    return [code];
  }

  return LEGACY_TO_CURRENT_FYLKE[code] ?? [];
}

function dedupeAndSort(codes: string[]): string[] {
  return Array.from(new Set(codes)).sort((a, b) => a.localeCompare(b));
}

export function normalizeFylkeCodesFromMunicipalityCodes(
  municipalityCodes: string[]
): string[] {
  return dedupeAndSort(
    municipalityCodes.flatMap((municipalityCode) =>
      normalizeFylkeCode(municipalityCode)
    )
  );
}

export function normalizeFylkeCodes(fylkeCodes: string[]): string[] {
  return dedupeAndSort(fylkeCodes.flatMap((fylkeCode) => normalizeFylkeCode(fylkeCode)));
}

export function normalizeInstitutionFylkeCodes(params: {
  countyCode?: string | null;
  municipalityCode?: string | null;
}): string[] {
  const fromCounty = normalizeFylkeCode(params.countyCode);
  const fromMunicipality = normalizeFylkeCode(params.municipalityCode);

  return dedupeAndSort([...fromCounty, ...fromMunicipality]);
}
