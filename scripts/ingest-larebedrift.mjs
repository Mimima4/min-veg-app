#!/usr/bin/env node
/**
 * Verified lærebedrift ingest (P1) — source-agnostic orchestrator.
 *
 * Pipeline:  source → resolve fag → (optional) Brønnøysund verify → upsert → soft-retire
 *
 * Charter: docs/architecture/phase-4-verified-larebedrift-employer-layer-charter.md
 * Spec:    docs/architecture/phase-4-verified-larebedrift-employer-layer-p1-ingest-spec.md
 *
 * Runtime NEVER calls this — ops only (dry-run → review → write). Routes do not
 * consume larebedrift_truth yet (that is P3).
 *
 * Usage:
 *   node --env-file=.env.local scripts/ingest-larebedrift.mjs --source file --file seed.json --dry-run
 *   node --env-file=.env.local scripts/ingest-larebedrift.mjs --source nlr --county 18
 *   node --env-file=.env.local scripts/ingest-larebedrift.mjs --source nlr            # carpenter nationwide
 *
 * Flags:
 *   --source <nlr|file|vilbli>   required
 *   --file <path>                JSON for --source file
 *   --larefag <code|label>       restrict to one fag (default: all supported, P1 = carpenter)
 *   --county <2-digit>           restrict scope (also limits soft-retire to that county)
 *   --export-date <YYYY-MM-DD>   stored in source_export_date
 *   --verify-brreg               cross-check + enrich each orgnr via Brønnøysund
 *   --no-soft-retire             do not deactivate rows missing from this run
 *   --dry-run                    parse/normalize/report only, write nothing
 */
import { createClient } from "@supabase/supabase-js";
import { fetchGodkjentEmployers, AVAILABLE_SOURCES } from "./lib/larebedrift-source.mjs";
import { resolveLarefag } from "./lib/larebedrift-fagkode.mjs";
import { lookupBrregEnhet, countyCodeFromKommunenummer } from "./lib/brreg-enhet.mjs";
import { isMainModule } from "./lib/is-main-module.mjs";

function parseArgs(argv) {
  const args = {
    source: null,
    file: null,
    larefag: null,
    county: null,
    exportDate: null,
    verifyBrreg: false,
    softRetire: true,
    dryRun: false,
  };
  const tokens = argv.slice(2);
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const next = () => tokens[(i += 1)];
    if (token === "--source") args.source = next();
    else if (token === "--file") args.file = next();
    else if (token === "--larefag") args.larefag = next();
    else if (token === "--county") args.county = next();
    else if (token === "--export-date") args.exportDate = next();
    else if (token === "--verify-brreg") args.verifyBrreg = true;
    else if (token === "--no-soft-retire") args.softRetire = false;
    else if (token === "--dry-run") args.dryRun = true;
  }
  return args;
}

function normalizeWebsite(value) {
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

function log(message) {
  console.error(`[ingest:larebedrift] ${message}`);
}

export async function runIngest(args) {
  if (!args.source || !AVAILABLE_SOURCES.includes(args.source)) {
    throw new Error(`--source must be one of: ${AVAILABLE_SOURCES.join(", ")}`);
  }

  const targetFag = args.larefag ? resolveLarefag({ code: args.larefag, label: args.larefag }) : null;
  if (args.larefag && !targetFag) {
    throw new Error(`--larefag "${args.larefag}" did not resolve to a supported fag`);
  }

  log(`source=${args.source} larefag=${targetFag?.code ?? "ALL"} county=${args.county ?? "ALL"} dryRun=${args.dryRun}`);

  const raws = await fetchGodkjentEmployers(args.source, {
    countyCode: args.county,
    filePath: args.file,
  });
  log(`source returned ${raws.length} raw record(s)`);

  const accepted = new Map(); // key `${org}|${fagCode}` → row
  const rejected = [];
  const needsReview = [];

  // Cache brreg lookups per orgnr to avoid duplicate calls across fag rows.
  const brregCache = new Map();

  for (const raw of raws) {
    const orgNumber = String(raw.orgNumber ?? "").replace(/\s/g, "");
    if (!/^\d{9}$/.test(orgNumber)) {
      rejected.push({ orgNumber: raw.orgNumber ?? null, reason: "invalid_orgnr" });
      continue;
    }

    const fag = resolveLarefag({ code: raw.larefagCodeRaw, label: raw.larefagLabelRaw });
    if (!fag) {
      rejected.push({ orgNumber, reason: "unresolved_fag", detail: raw.larefagLabelRaw ?? raw.larefagCodeRaw ?? null });
      continue;
    }
    if (targetFag && fag.code !== targetFag.code) {
      continue; // silently out of requested fag scope
    }

    let legalName = raw.legalName ?? null;
    let municipalityCode = raw.municipalityCode ? String(raw.municipalityCode) : null;
    let countyCode = raw.countyCode ? String(raw.countyCode) : countyCodeFromKommunenummer(municipalityCode);

    if (args.verifyBrreg) {
      let brreg = brregCache.get(orgNumber);
      if (!brreg) {
        brreg = await lookupBrregEnhet(orgNumber);
        brregCache.set(orgNumber, brreg);
      }
      if (brreg.status === "not_found") {
        rejected.push({ orgNumber, reason: "brreg_not_found" });
        continue;
      }
      if (brreg.status === "deleted") {
        rejected.push({ orgNumber, reason: "brreg_deleted", detail: brreg.deletedAt });
        continue;
      }
      if (brreg.status === "error") {
        needsReview.push({ orgNumber, reason: `brreg_error:${brreg.httpStatus}` });
        continue;
      }
      legalName = brreg.legalName ?? legalName;
      municipalityCode = brreg.municipalityCode ?? municipalityCode;
      countyCode = brreg.countyCode ?? countyCode;
    }

    if (args.county && countyCode && String(countyCode) !== String(args.county)) {
      continue; // out of county scope after resolution
    }

    if (!legalName || !municipalityCode || !countyCode) {
      needsReview.push({
        orgNumber,
        reason: "missing_identity_or_geo",
        detail: { legalName: Boolean(legalName), municipalityCode, countyCode },
      });
      continue;
    }

    const row = {
      org_number: orgNumber,
      legal_name: legalName,
      display_name: raw.displayName ?? null,
      county_code: String(countyCode),
      municipality_code: String(municipalityCode),
      latitude: typeof raw.latitude === "number" ? raw.latitude : null,
      longitude: typeof raw.longitude === "number" ? raw.longitude : null,
      larefag_code: fag.code,
      larefag_label: fag.label,
      opplaringskontor_name: raw.opplaringskontorName ?? null,
      opplaringskontor_org: raw.opplaringskontorOrg ?? null,
      verification_status: "godkjent",
      source_reference_url: raw.sourceReferenceUrl ?? null,
      source_system: raw.sourceSystem ?? args.source,
      source_export_date: args.exportDate ?? null,
      is_active: true,
      updated_at: new Date().toISOString(),
    };
    if (!row.source_reference_url) {
      needsReview.push({ orgNumber, reason: "missing_source_reference_url" });
      continue;
    }
    accepted.set(`${orgNumber}|${fag.code}`, row);
  }

  const acceptedRows = [...accepted.values()];
  const ingestedFagCodes = [...new Set(acceptedRows.map((r) => r.larefag_code))];

  log(`accepted=${acceptedRows.length} rejected=${rejected.length} needs_review=${needsReview.length}`);
  for (const r of rejected) log(`  REJECT ${r.orgNumber ?? "?"} — ${r.reason}${r.detail ? ` (${JSON.stringify(r.detail)})` : ""}`);
  for (const r of needsReview) log(`  REVIEW ${r.orgNumber} — ${r.reason}${r.detail ? ` (${JSON.stringify(r.detail)})` : ""}`);

  if (args.dryRun) {
    log("dry-run: no writes performed");
    return { dryRun: true, accepted: acceptedRows.length, rejected: rejected.length, needsReview: needsReview.length, ingestedFagCodes };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  const supabase = createClient(url, serviceKey);

  let upserted = 0;
  for (let i = 0; i < acceptedRows.length; i += 500) {
    const batch = acceptedRows.slice(i, i + 500);
    const { error } = await supabase
      .from("larebedrift_truth")
      .upsert(batch, { onConflict: "org_number,larefag_code" });
    if (error) throw new Error(`upsert failed: ${error.message}`);
    upserted += batch.length;
  }
  log(`upserted ${upserted} row(s)`);

  let retired = 0;
  if (args.softRetire && ingestedFagCodes.length > 0) {
    const keepKeys = new Set(acceptedRows.map((r) => `${r.org_number}|${r.larefag_code}`));
    let query = supabase
      .from("larebedrift_truth")
      .select("id, org_number, larefag_code")
      .eq("is_active", true)
      .in("larefag_code", ingestedFagCodes);
    if (args.county) query = query.eq("county_code", String(args.county));
    const { data: existing, error: selError } = await query;
    if (selError) throw new Error(`soft-retire select failed: ${selError.message}`);

    const toRetire = (existing ?? [])
      .filter((r) => !keepKeys.has(`${r.org_number}|${r.larefag_code}`))
      .map((r) => r.id);
    if (toRetire.length > 0) {
      const { error: retireError } = await supabase
        .from("larebedrift_truth")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .in("id", toRetire);
      if (retireError) throw new Error(`soft-retire update failed: ${retireError.message}`);
      retired = toRetire.length;
    }
  }
  log(`soft-retired ${retired} row(s)`);

  return { dryRun: false, upserted, retired, ingestedFagCodes };
}

if (isMainModule(import.meta.url)) {
  runIngest(parseArgs(process.argv))
    .then((result) => {
      log(`PASS ${JSON.stringify(result)}`);
    })
    .catch((error) => {
      log(`FAIL ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    });
}
