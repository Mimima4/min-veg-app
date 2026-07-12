/**
 * Loads kolonne-3 VIGO rosters from data/larebedrift/kolonne3-rosters/*.json
 * (shared by ingest CLI and roster extract verification).
 */
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROSTER_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../data/larebedrift/kolonne3-rosters"
);

export function loadKolonne3ProfessionRosters() {
  const files = readdirSync(ROSTER_DIR).filter((name) => name.endsWith(".json"));
  return files.map((file) => {
    const raw = readFileSync(join(ROSTER_DIR, file), "utf8");
    return JSON.parse(raw);
  });
}

export function loadKolonne3RosterEntriesFlat() {
  return loadKolonne3ProfessionRosters().flatMap((roster) => roster.entries ?? []);
}

export function mergeKolonne3RosterIntoFagRegistry(baseRegistry) {
  const byApiCode = new Map(
    baseRegistry.map((fag) => [String(fag.apiQueryCodes?.[0] ?? "").toUpperCase(), fag])
  );

  for (const entry of loadKolonne3RosterEntriesFlat()) {
    const apiQueryCode = String(entry.apiQueryCode ?? "").toUpperCase();
    if (!apiQueryCode) continue;

    const codeAliases = [
      `${apiQueryCode.toLowerCase()}----`,
      apiQueryCode.toLowerCase(),
    ];
    const labelAliases = entry.labelAliases ?? [];

    const existing = byApiCode.get(apiQueryCode);
    if (existing) {
      existing.code = entry.code;
      existing.label = entry.label;
      existing.labelAliases = Array.from(
        new Set([...(existing.labelAliases ?? []), ...labelAliases])
      );
      existing.codeAliases = Array.from(
        new Set([...(existing.codeAliases ?? []), ...codeAliases])
      );
      existing.apiQueryCodes = [apiQueryCode];
      continue;
    }

    const fag = {
      code: entry.code,
      label: entry.label,
      labelAliases,
      codeAliases,
      apiQueryCodes: [apiQueryCode],
    };
    byApiCode.set(apiQueryCode, fag);
    baseRegistry.push(fag);
  }

  return baseRegistry;
}
