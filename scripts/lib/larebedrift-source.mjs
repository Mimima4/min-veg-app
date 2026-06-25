/**
 * Pluggable source layer for the verified lærebedrift ingest.
 *
 * Every source returns a flat array of RawGodkjentEmployer records; the ingest
 * orchestrator then resolves fag, (optionally) verifies identity against
 * Brønnøysund, and upserts into larebedrift_truth. Swapping the source must not
 * require any change to the table, the orchestrator, or the route engine.
 *
 * RawGodkjentEmployer:
 *   {
 *     orgNumber: string,                 // 9 digits
 *     legalName: string | null,
 *     displayName?: string | null,
 *     countyCode?: string | null,        // 2-digit fylke (may be filled from brreg)
 *     municipalityCode?: string | null,  // 4-digit kommune
 *     latitude?: number | null,
 *     longitude?: number | null,
 *     website?: string | null,
 *     larefagCodeRaw?: string | null,    // source fag code (resolved later)
 *     larefagLabelRaw?: string | null,   // source fag label (resolved later)
 *     opplaringskontorName?: string | null,
 *     opplaringskontorOrg?: string | null,
 *     sourceSystem: "nlr" | "vilbli" | "manual",
 *     sourceReferenceUrl: string,
 *   }
 *
 * Sources:
 *   - nlr    : Udir Register for lærebedrifter API (data-nlr.udir.no). PRIMARY once
 *              an Udir key is granted. Requires env NLR_API_AUTH (basic). Inert
 *              (throws a clear message) until the key exists.
 *   - file   : local JSON array of RawGodkjentEmployer — manual seed / pipeline test.
 *   - vilbli : FALLBACK (keyless via our relay). Not wired yet; throws until built.
 */

import { readFile } from "node:fs/promises";

const NLR_BASE = "https://data-nlr.udir.no/v4";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nlrAuthHeader() {
  const raw = process.env.NLR_API_AUTH;
  if (!raw) return null;
  return raw.trim().toLowerCase().startsWith("basic ") ? raw.trim() : `Basic ${raw.trim()}`;
}

/**
 * NLR source. Walks /v4/enheter (paginated, prefiltered by county when given),
 * then /v4/enhet/{orgnr} for Programområder + coordinates, emitting one raw
 * record per programområde that the caller's fag resolver can match.
 */
async function fetchNlr({ countyCode = null, fetchImpl = fetch, pageSize = 1000, requestDelayMs = 60 } = {}) {
  const auth = nlrAuthHeader();
  if (!auth) {
    throw new Error(
      "NLR source needs env NLR_API_AUTH (basic auth from Udir). Key not granted yet — " +
        "use --source file (manual seed) or --source vilbli (fallback) until then."
    );
  }

  const headers = { accept: "application/json", authorization: auth };

  // 1) page the simple list, prefilter by county client-side
  const simple = [];
  let page = 1;
  while (true) {
    const url = `${NLR_BASE}/enheter?sidenummer=${page}&antallperside=${pageSize}`;
    const res = await fetchImpl(url, { headers });
    if (!res.ok) {
      throw new Error(`NLR /enheter page ${page} → HTTP ${res.status}`);
    }
    const body = await res.json();
    const list = body?.EnhetListe ?? [];
    if (list.length === 0) break;
    for (const unit of list) {
      if (unit?.ErAktiv !== true || unit?.ErLaerebedrift !== true) continue;
      if (countyCode && String(unit?.Fylkesnummer ?? "") !== String(countyCode)) continue;
      simple.push(unit);
    }
    if (list.length < pageSize) break;
    page += 1;
  }

  // 2) detail per enhet → programområder + coords
  const raws = [];
  for (const unit of simple) {
    const orgnr = String(unit?.Organisasjonsnummer ?? "");
    if (!/^\d{9}$/.test(orgnr)) continue;
    const res = await fetchImpl(`${NLR_BASE}/enhet/${orgnr}`, { headers });
    if (!res.ok) continue;
    const detail = await res.json();
    if (detail?.ErLaerebedrift !== true || detail?.ErAktiv !== true) continue;

    const programs = Array.isArray(detail?.Programomraader) ? detail.Programomraader : [];
    for (const program of programs) {
      raws.push({
        orgNumber: orgnr,
        legalName: detail?.Navn ?? null,
        displayName: detail?.FulltNavn ?? null,
        countyCode: detail?.Fylke?.Fylkesnummer ?? unit?.Fylkesnummer ?? null,
        municipalityCode: detail?.Kommune?.Kommunenummer ?? unit?.Kommunenummer ?? null,
        latitude: detail?.Koordinat?.Breddegrad ?? null,
        longitude: detail?.Koordinat?.Lengdegrad ?? null,
        website: detail?.Internettadresse ?? null,
        larefagCodeRaw: program?.Id ?? null,
        larefagLabelRaw: program?.Navn ?? null,
        opplaringskontorName: null,
        opplaringskontorOrg: null,
        sourceSystem: "nlr",
        sourceReferenceUrl: `${NLR_BASE}/enhet/${orgnr}`,
      });
    }
    if (requestDelayMs > 0) await sleep(requestDelayMs);
  }

  return raws;
}

/** File source: a local JSON array of RawGodkjentEmployer (manual seed / test). */
async function fetchFile({ filePath } = {}) {
  if (!filePath) {
    throw new Error("file source requires --file <path-to-json>");
  }
  const text = await readFile(filePath, "utf8");
  const parsed = JSON.parse(text);
  const rows = Array.isArray(parsed) ? parsed : parsed?.employers;
  if (!Array.isArray(rows)) {
    throw new Error("file source: JSON must be an array or { employers: [...] }");
  }
  return rows.map((row) => ({
    sourceSystem: "manual",
    sourceReferenceUrl: row.sourceReferenceUrl ?? `file://${filePath}`,
    opplaringskontorName: null,
    opplaringskontorOrg: null,
    ...row,
  }));
}

/** Vilbli fallback — keyless via our relay; parser not built yet. */
async function fetchVilbli() {
  throw new Error(
    "vilbli source not wired yet (fallback). Pending: locate Vilbli lærebedrift feed + parser. " +
      "Prefer --source nlr once the Udir key is granted."
  );
}

const SOURCES = {
  nlr: fetchNlr,
  file: fetchFile,
  vilbli: fetchVilbli,
};

export const AVAILABLE_SOURCES = Object.keys(SOURCES);

export async function fetchGodkjentEmployers(sourceName, options = {}) {
  const source = SOURCES[sourceName];
  if (!source) {
    throw new Error(`Unknown source "${sourceName}". Available: ${AVAILABLE_SOURCES.join(", ")}`);
  }
  return source(options);
}
