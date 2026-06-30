import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cloud (Vercel Cron) ingest of verified lærebedrifter — self-sufficient refresh
 * of `larebedrift_truth`, no human or agent in the loop.
 *
 * Why this lives in TS (not the `scripts/*.mjs` CLI): bare-node CLI scripts and
 * the Next app cannot share modules directly. Our sources (Finnlærebedrift API +
 * Brønnøysund) are keyless and datacenter-safe (unlike Vilbli), so the refresh
 * runs from Vercel — no home-IP/launchd dependency. The `.mjs` CLI stays for
 * manual dry-runs/debugging; this module is the scheduled source of truth.
 *
 * P1 scope = carpenter (Tømrerfaget) nationwide. When P5 generalizes to more fag,
 * lift the fag mapping below into shared config.
 *
 * Flow: Finnlærebedrift (godkjent only) → Brønnøysund verify/enrich → upsert →
 * soft-retire rows no longer godkjent. Idempotent on (org_number, larefag_code).
 */

const UTDANNING_BASE = "https://api.utdanning.no/finnlarebedrift";
const BRREG_BASE = "https://data.brreg.no/enhetsregisteret/api/enheter";

/** P1 carpenter mapping — mirrors scripts/lib/larebedrift-fagkode.mjs (TOMRERFAGET). */
const CARPENTER = {
  apiQueryCode: "BATMF3",
  code: "TOMRERFAGET",
  label: "Tømrerfaget",
} as const;

const BRREG_CONCURRENCY = 6;
const UPSERT_BATCH = 500;

export type LarebedriftIngestSummary = {
  dryRun: boolean;
  larefagCode: string;
  fetched: number;
  accepted: number;
  rejected: number;
  needsReview: number;
  upserted: number;
  retired: number;
  rejections: Array<{ orgNumber: string | null; reason: string }>;
};

type UtdanningBedrift = {
  orgnr?: string | number;
  navn?: string;
  forradrfylkenr?: string | number;
  forradrkommnr?: string | number;
};

type RawEmployer = {
  orgNumber: string;
  legalName: string | null;
  countyCode: string | null;
  municipalityCode: string | null;
  sourceReferenceUrl: string;
};

type IngestRow = {
  org_number: string;
  legal_name: string;
  display_name: string | null;
  county_code: string;
  municipality_code: string;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  larefag_code: string;
  larefag_label: string;
  opplaringskontor_name: string | null;
  opplaringskontor_org: string | null;
  verification_status: "godkjent";
  source_reference_url: string;
  source_system: string;
  source_export_date: string | null;
  is_active: true;
  updated_at: string;
};

function countyCodeFromKommunenummer(kommunenummer: string | null): string | null {
  const digits = String(kommunenummer ?? "").trim();
  return /^\d{4}$/.test(digits) ? digits.slice(0, 2) : null;
}

function normalizeWebsite(value: string | null | undefined): string | null {
  const raw = String(value ?? "").trim();
  if (!raw || raw.includes("@")) return null;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (!url.hostname.includes(".")) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchCarpenterGodkjente(
  fetchImpl: typeof fetch = fetch
): Promise<RawEmployer[]> {
  const out: RawEmployer[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const params = new URLSearchParams({
      sporring_type: "bedrifter_godkjente",
      fag: CARPENTER.apiQueryCode,
      page: String(page),
    });
    const res = await fetchImpl(`${UTDANNING_BASE}/bedrift?${params.toString()}`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(
        `Finnlærebedrift /bedrift fag=${CARPENTER.apiQueryCode} page=${page} → HTTP ${res.status}`
      );
    }
    const body = (await res.json()) as {
      pagination?: { total_pages?: number };
      bedrifter?: UtdanningBedrift[];
    };
    totalPages = body?.pagination?.total_pages ?? 1;
    for (const b of body?.bedrifter ?? []) {
      const orgNumber = String(b?.orgnr ?? "").replace(/\s/g, "");
      out.push({
        orgNumber,
        legalName: b?.navn ?? null,
        countyCode: b?.forradrfylkenr != null ? String(b.forradrfylkenr) : null,
        municipalityCode: b?.forradrkommnr != null ? String(b.forradrkommnr) : null,
        sourceReferenceUrl: `https://utdanning.no/finnlarebedrift/bedrift/${orgNumber}/`,
      });
    }
    page += 1;
    if (page <= totalPages) await sleep(50);
  } while (page <= totalPages);
  return out;
}

type BrregResult =
  | {
      status: "ok";
      legalName: string | null;
      municipalityCode: string | null;
      countyCode: string | null;
      website: string | null;
    }
  | { status: "not_found" }
  | { status: "deleted"; deletedAt: string }
  | { status: "error"; httpStatus: number };

async function lookupBrreg(
  orgNumber: string,
  fetchImpl: typeof fetch = fetch
): Promise<BrregResult> {
  let res: Response;
  try {
    res = await fetchImpl(`${BRREG_BASE}/${orgNumber}`, {
      headers: { accept: "application/json" },
    });
  } catch {
    return { status: "error", httpStatus: 0 };
  }
  if (res.status === 404) return { status: "not_found" };
  if (!res.ok) return { status: "error", httpStatus: res.status };
  const raw = (await res.json()) as {
    navn?: string;
    slettedato?: string;
    hjemmeside?: string;
    forretningsadresse?: { kommunenummer?: string };
  };
  if (raw?.slettedato) return { status: "deleted", deletedAt: String(raw.slettedato) };
  const kommunenummer = raw?.forretningsadresse?.kommunenummer ?? null;
  return {
    status: "ok",
    legalName: raw?.navn ?? null,
    municipalityCode: kommunenummer ? String(kommunenummer) : null,
    countyCode: countyCodeFromKommunenummer(kommunenummer),
    website: raw?.hjemmeside ? String(raw.hjemmeside) : null,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      results[i] = await mapper(items[i]!, i);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  );
  return results;
}

export async function runLarebedriftIngest(params: {
  dryRun?: boolean;
  fetchImpl?: typeof fetch;
  supabase?: SupabaseClient;
} = {}): Promise<LarebedriftIngestSummary> {
  const dryRun = params.dryRun ?? false;
  const fetchImpl = params.fetchImpl ?? fetch;

  const raws = await fetchCarpenterGodkjente(fetchImpl);

  const rejections: Array<{ orgNumber: string | null; reason: string }> = [];
  let needsReview = 0;
  const now = new Date().toISOString();

  const enriched = await mapWithConcurrency(raws, BRREG_CONCURRENCY, async (raw) => {
    const orgNumber = String(raw.orgNumber ?? "").replace(/\s/g, "");
    if (!/^\d{9}$/.test(orgNumber)) {
      rejections.push({ orgNumber: raw.orgNumber ?? null, reason: "invalid_orgnr" });
      return null;
    }
    const brreg = await lookupBrreg(orgNumber, fetchImpl);
    if (brreg.status === "not_found") {
      rejections.push({ orgNumber, reason: "brreg_not_found" });
      return null;
    }
    if (brreg.status === "deleted") {
      rejections.push({ orgNumber, reason: `brreg_deleted:${brreg.deletedAt}` });
      return null;
    }
    if (brreg.status === "error") {
      needsReview += 1;
      return null;
    }
    const legalName = brreg.legalName ?? raw.legalName;
    const municipalityCode = brreg.municipalityCode ?? raw.municipalityCode;
    const countyCode =
      brreg.countyCode ?? raw.countyCode ?? countyCodeFromKommunenummer(municipalityCode);
    if (!legalName || !municipalityCode || !countyCode) {
      needsReview += 1;
      return null;
    }
    const row: IngestRow = {
      org_number: orgNumber,
      legal_name: legalName,
      display_name: null,
      county_code: String(countyCode),
      municipality_code: String(municipalityCode),
      website: normalizeWebsite(brreg.website),
      latitude: null,
      longitude: null,
      larefag_code: CARPENTER.code,
      larefag_label: CARPENTER.label,
      opplaringskontor_name: null,
      opplaringskontor_org: null,
      verification_status: "godkjent",
      source_reference_url: raw.sourceReferenceUrl,
      source_system: "utdanning",
      source_export_date: null,
      is_active: true,
      updated_at: now,
    };
    return row;
  });

  const acceptedRows: IngestRow[] = [];
  const seen = new Set<string>();
  for (const row of enriched) {
    if (!row) continue;
    const key = `${row.org_number}|${row.larefag_code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    acceptedRows.push(row);
  }

  const summary: LarebedriftIngestSummary = {
    dryRun,
    larefagCode: CARPENTER.code,
    fetched: raws.length,
    accepted: acceptedRows.length,
    rejected: rejections.length,
    needsReview,
    upserted: 0,
    retired: 0,
    rejections: rejections.slice(0, 50),
  };

  if (dryRun) {
    return summary;
  }

  const supabase =
    params.supabase ??
    createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY")
    );

  for (let i = 0; i < acceptedRows.length; i += UPSERT_BATCH) {
    const batch = acceptedRows.slice(i, i + UPSERT_BATCH);
    const { error } = await supabase
      .from("larebedrift_truth")
      .upsert(batch, { onConflict: "org_number,larefag_code" });
    if (error) throw new Error(`upsert failed: ${error.message}`);
    summary.upserted += batch.length;
  }

  // Soft-retire: carpenter rows no longer in the godkjent set (nationwide).
  const keep = new Set(acceptedRows.map((r) => r.org_number));
  const { data: existing, error: selError } = await supabase
    .from("larebedrift_truth")
    .select("id, org_number")
    .eq("larefag_code", CARPENTER.code)
    .eq("is_active", true);
  if (selError) throw new Error(`soft-retire select failed: ${selError.message}`);

  const toRetire = (existing ?? [])
    .filter((r: { org_number: string }) => !keep.has(r.org_number))
    .map((r: { id: string }) => r.id);
  if (toRetire.length > 0) {
    const { error: retireError } = await supabase
      .from("larebedrift_truth")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in("id", toRetire);
    if (retireError) throw new Error(`soft-retire update failed: ${retireError.message}`);
    summary.retired = toRetire.length;
  }

  return summary;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing env ${name}`);
  return value;
}
