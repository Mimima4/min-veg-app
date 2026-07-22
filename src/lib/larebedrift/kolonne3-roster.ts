/**
 * Kolonne-3 VIGO lærefag rosters — one JSON file per signed Vilbli VG1→VG2 chain.
 * Primary match key for Fagvalg → bedrift is `apiQueryCode` parsed from Vilbli `programme_url`.
 *
 * Add a new profession: extract with `scripts/extract-vilbli-kolonne3-roster.mjs`,
 * commit JSON under `data/larebedrift/kolonne3-rosters/`, wire ingest batch in template §4.4.
 */
import anleggsgartnerRoster from "../../../data/larebedrift/kolonne3-rosters/anleggsgartner.json" with { type: "json" };
import anleggsteknikkRoster from "../../../data/larebedrift/kolonne3-rosters/anleggsteknikk.json" with { type: "json" };
import klimaRoster from "../../../data/larebedrift/kolonne3-rosters/klima.json" with { type: "json" };
import murerRoster from "../../../data/larebedrift/kolonne3-rosters/murer.json" with { type: "json" };

export type Kolonne3RosterEntry = {
  apiQueryCode: string;
  code: string;
  label: string;
  labelAliases?: string[];
  /** Override roster-level default cron batch for this fag. */
  ingestBatch?: number;
};

export type Kolonne3ProfessionRoster = {
  professionSlug: string;
  vilbliChainTokens: string;
  extractReferenceCountySlug?: string;
  ingestBatch?: number;
  entries: Kolonne3RosterEntry[];
};

export const KOLONNE3_PROFESSION_ROSTERS: ReadonlyArray<Kolonne3ProfessionRoster> = [
  anleggsgartnerRoster as Kolonne3ProfessionRoster,
  anleggsteknikkRoster as Kolonne3ProfessionRoster,
  klimaRoster as Kolonne3ProfessionRoster,
  murerRoster as Kolonne3ProfessionRoster,
];

export function kolonne3RosterEntriesFlat(): Kolonne3RosterEntry[] {
  return KOLONNE3_PROFESSION_ROSTERS.flatMap((roster) => roster.entries);
}

export function kolonne3RosterByApiQueryCode(): Readonly<
  Record<string, { code: string; label: string }>
> {
  const map: Record<string, { code: string; label: string }> = {};
  for (const entry of kolonne3RosterEntriesFlat()) {
    map[entry.apiQueryCode.toUpperCase()] = { code: entry.code, label: entry.label };
  }
  return map;
}

export function kolonne3RosterForProfession(
  professionSlug: string
): Kolonne3ProfessionRoster | null {
  const slug = String(professionSlug ?? "").trim();
  return KOLONNE3_PROFESSION_ROSTERS.find((roster) => roster.professionSlug === slug) ?? null;
}

export function scheduledIngestEntriesFromKolonne3Rosters(): Array<{
  apiQueryCode: string;
  code: string;
  label: string;
  ingestBatch: number;
}> {
  const rows: Array<{
    apiQueryCode: string;
    code: string;
    label: string;
    ingestBatch: number;
  }> = [];

  for (const roster of KOLONNE3_PROFESSION_ROSTERS) {
    const defaultBatch = roster.ingestBatch ?? 7;
    for (const entry of roster.entries) {
      rows.push({
        apiQueryCode: entry.apiQueryCode,
        code: entry.code,
        label: entry.label,
        ingestBatch: entry.ingestBatch ?? defaultBatch,
      });
    }
  }

  return rows;
}
