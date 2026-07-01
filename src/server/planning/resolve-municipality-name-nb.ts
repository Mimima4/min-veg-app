import "server-only";

import { getNorwayCountyMunicipalityOptions } from "@/lib/planning/norway-admin";
import { normalizeMunicipalityCode } from "@/lib/planning/geo-distance";

let municipalityNameByCodeCache: Map<string, string> | null = null;

async function loadMunicipalityNameByCode(): Promise<Map<string, string>> {
  if (municipalityNameByCodeCache) {
    return municipalityNameByCodeCache;
  }

  const counties = await getNorwayCountyMunicipalityOptions();
  const map = new Map<string, string>();
  for (const county of counties) {
    for (const municipality of county.municipalities) {
      map.set(municipality.code, municipality.name);
    }
  }
  municipalityNameByCodeCache = map;
  return map;
}

/** Norwegian kommune display name for a 4-digit kommunenummer (snapshot build). */
export async function resolveMunicipalityNameNb(
  municipalityCode: string | null | undefined
): Promise<string | null> {
  const code = normalizeMunicipalityCode(municipalityCode);
  if (!code) return null;
  const names = await loadMunicipalityNameByCode();
  return names.get(code) ?? null;
}

export async function resolveMunicipalityNamesByCode(
  municipalityCodes: string[]
): Promise<Map<string, string>> {
  const names = await loadMunicipalityNameByCode();
  const result = new Map<string, string>();
  for (const raw of municipalityCodes) {
    const code = normalizeMunicipalityCode(raw);
    if (!code) continue;
    const name = names.get(code);
    if (name) {
      result.set(code, name);
    }
  }
  return result;
}
