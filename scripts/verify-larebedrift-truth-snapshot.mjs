#!/usr/bin/env node
/**
 * Read-only audit of larebedrift_truth (verified lærebedrift layer, P1).
 *
 * Asserts the publishable invariants and prints per-(fag, county) coverage:
 *   - every active row has verification_status = "godkjent"
 *   - no duplicate (org_number, larefag_code)
 *   - active rows have legal_name + county_code + municipality_code + source_reference_url
 *
 * Usage:
 *   node --env-file=.env.local scripts/verify-larebedrift-truth-snapshot.mjs
 *   node --env-file=.env.local scripts/verify-larebedrift-truth-snapshot.mjs --county 18
 */
import { createClient } from "@supabase/supabase-js";
import { isMainModule } from "./lib/is-main-module.mjs";

function parseArgs(argv) {
  const args = { county: null, json: false };
  const tokens = argv.slice(2);
  for (let i = 0; i < tokens.length; i += 1) {
    if (tokens[i] === "--county") args.county = tokens[(i += 1)];
    else if (tokens[i] === "--json") args.json = true;
  }
  return args;
}

function assert(condition, message, failures) {
  if (!condition) failures.push(message);
}

export async function runVerify(args) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  const supabase = createClient(url, serviceKey);

  let query = supabase
    .from("larebedrift_truth")
    .select(
      "org_number, legal_name, county_code, municipality_code, latitude, longitude, larefag_code, larefag_label, verification_status, source_reference_url, source_system, is_active"
    );
  if (args.county) query = query.eq("county_code", String(args.county));

  const { data, error } = await query;
  if (error) throw new Error(`select failed: ${error.message}`);
  const rows = data ?? [];
  const active = rows.filter((r) => r.is_active);

  const failures = [];

  for (const row of active) {
    assert(row.verification_status === "godkjent", `non-godkjent active row: ${row.org_number} (${row.verification_status})`, failures);
    assert(Boolean(row.legal_name), `missing legal_name: ${row.org_number}`, failures);
    assert(Boolean(row.county_code), `missing county_code: ${row.org_number}`, failures);
    assert(Boolean(row.municipality_code), `missing municipality_code: ${row.org_number}`, failures);
    assert(Boolean(row.source_reference_url), `missing source_reference_url: ${row.org_number}`, failures);
  }

  const seen = new Set();
  for (const row of rows) {
    const key = `${row.org_number}|${row.larefag_code}`;
    assert(!seen.has(key), `duplicate (org_number, larefag_code): ${key}`, failures);
    seen.add(key);
  }

  const byFagCounty = new Map();
  for (const row of active) {
    const key = `${row.larefag_label ?? row.larefag_code} @ ${row.county_code}`;
    byFagCounty.set(key, (byFagCounty.get(key) ?? 0) + 1);
  }
  const withCoords = active.filter((r) => r.latitude != null && r.longitude != null).length;

  const summary = {
    totalRows: rows.length,
    activeRows: active.length,
    inactiveRows: rows.length - active.length,
    activeWithCoords: withCoords,
    coverage: Object.fromEntries([...byFagCounty.entries()].sort()),
    failures,
  };

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.error(`[verify:larebedrift] rows=${summary.totalRows} active=${summary.activeRows} inactive=${summary.inactiveRows} coords=${withCoords}`);
    for (const [key, count] of [...byFagCounty.entries()].sort()) {
      console.error(`  ${key}: ${count}`);
    }
  }

  if (failures.length > 0) {
    for (const f of failures) console.error(`[verify:larebedrift] FAIL ${f}`);
    throw new Error(`${failures.length} invariant failure(s)`);
  }
  return summary;
}

if (isMainModule(import.meta.url)) {
  runVerify(parseArgs(process.argv))
    .then(() => console.error("[verify:larebedrift] PASS"))
    .catch((error) => {
      console.error(`[verify:larebedrift] FAIL ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    });
}
