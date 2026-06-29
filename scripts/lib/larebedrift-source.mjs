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
 *   - utdanning : Finnlærebedrift open API (api.utdanning.no). PRIMARY — keyless,
 *                 complete godkjent set (incl. without a current lærekontrakt),
 *                 recommended by Udir NXR. Filters: fag (lærefag codes), sted
 *                 (kommune/fylke), sporring_type=bedrifter_godkjente.
 *   - nlr       : Udir Register for lærebedrifter API (data-nlr.udir.no). Subset
 *                 (only godkjent WITH a running contract); needs NLR_API_AUTH key.
 *                 Kept as a secondary; inert until the key exists.
 *   - file      : local JSON array of RawGodkjentEmployer — manual seed / test.
 *   - vilbli    : FALLBACK (keyless via our relay). Not wired yet; throws.
 */

import { readFile } from "node:fs/promises";

const UTDANNING_BASE = "https://api.utdanning.no/finnlarebedrift";
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

/**
 * Finnlærebedrift open API source. One paginated query per fag code
 * (sporring_type=bedrifter_godkjente → only godkjent, excludes potensielle),
 * optionally scoped by `sted` (kommune 4-digit / fylke 2-digit). Emits one raw
 * record per (bedrift, queried fag). Coordinates/website are not in the list
 * response → left null (enrich later via --verify-brreg or the detail endpoint).
 */
async function fetchUtdanning({ fagCodes = [], sted = null, fetchImpl = fetch, requestDelayMs = 60 } = {}) {
  const codes = (fagCodes ?? []).filter(Boolean);
  if (codes.length === 0) {
    throw new Error("utdanning source requires fag query codes (resolve --larefag first)");
  }

  const headers = { accept: "application/json" };
  const raws = [];

  for (const fagCode of codes) {
    let page = 1;
    let totalPages = 1;
    do {
      const params = new URLSearchParams({
        sporring_type: "bedrifter_godkjente",
        fag: fagCode,
        page: String(page),
      });
      if (sted) params.set("sted", String(sted));

      const res = await fetchImpl(`${UTDANNING_BASE}/bedrift?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error(`Finnlærebedrift /bedrift fag=${fagCode} page=${page} → HTTP ${res.status}`);
      }
      const body = await res.json();
      totalPages = body?.pagination?.total_pages ?? 1;
      const bedrifter = Array.isArray(body?.bedrifter) ? body.bedrifter : [];

      for (const b of bedrifter) {
        raws.push({
          orgNumber: String(b?.orgnr ?? ""),
          legalName: b?.navn ?? null,
          displayName: null,
          countyCode: b?.forradrfylkenr ?? null,
          municipalityCode: b?.forradrkommnr ?? null,
          latitude: null,
          longitude: null,
          website: null,
          larefagCodeRaw: fagCode,
          larefagLabelRaw: null,
          opplaringskontorName: null,
          opplaringskontorOrg: null,
          sourceSystem: "utdanning",
          sourceReferenceUrl: `https://utdanning.no/finnlarebedrift/bedrift/${b?.orgnr ?? ""}/`,
        });
      }

      page += 1;
      if (requestDelayMs > 0 && page <= totalPages) await sleep(requestDelayMs);
    } while (page <= totalPages);
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
  utdanning: fetchUtdanning,
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
