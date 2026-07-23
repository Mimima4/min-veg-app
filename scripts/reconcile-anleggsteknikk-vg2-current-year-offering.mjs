#!/usr/bin/env node
/**
 * Reconcile anleggsteknikk VG2 PSA to Vilbli current-year «Skoler som tilbyr dette».
 *
 * Owner: docs/architecture/phase-4-current-year-programme-offering-owner-decision-record.md
 *
 * Default: dry-run. Apply with --apply
 *
 * Usage:
 *   node --env-file=.env.local scripts/reconcile-anleggsteknikk-vg2-current-year-offering.mjs
 *   node --env-file=.env.local scripts/reconcile-anleggsteknikk-vg2-current-year-offering.mjs --apply
 */
import { createClient } from "@supabase/supabase-js";

const APPLY = process.argv.includes("--apply");

/** Vilbli national strukturkart offering set — audit 2026-07-18 (CY-3). */
const CURRENT_YEAR_OFFERING_NAME_MATCHERS = [
  { countyCode: "42", nameIncludes: ["sam eyde"] },
  { countyCode: "56", nameIncludes: ["kirkenes"] },
  { countyCode: "34", nameIncludes: ["solør", "solor"] },
  { countyCode: "18", nameIncludes: ["fauske"] },
  { countyCode: "11", nameIncludes: ["øksnevad", "oksnevad"] },
  { countyCode: "46", nameIncludes: ["os vidaregåande", "os videregående"] },
  // Viewer-fylke pin on Troms p5 (missing from Oslo probe) — verified 2026-07-22.
  { countyCode: "55", nameIncludes: ["bardufoss"] },
];

function normalizeName(name) {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a");
}

function isCurrentYearOffering(row) {
  const name = normalizeName(row.institutions?.name);
  const county = String(row.county_code ?? "").trim();
  return CURRENT_YEAR_OFFERING_NAME_MATCHERS.some((matcher) => {
    if (matcher.countyCode !== county) return false;
    return matcher.nameIncludes.some((token) => name.includes(normalizeName(token)));
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key);

const { data: progs, error: progError } = await sb
  .from("education_programs")
  .select("id, slug")
  .ilike("slug", "maskin-og-kranforer-vg2-anleggsteknikk-%")
  .eq("is_active", true);

if (progError) {
  throw new Error(progError.message);
}

const programIds = (progs ?? []).map((p) => p.id);
const { data: psa, error: psaError } = await sb
  .from("programme_school_availability")
  .select(
    "id, county_code, stage, is_active, verification_status, institution_id, institutions:institution_id(name)"
  )
  .in("education_program_id", programIds)
  .eq("stage", "VG2")
  .eq("is_active", true)
  .eq("availability_scope", "programme_in_school");

if (psaError) {
  throw new Error(psaError.message);
}

const rows = psa ?? [];
const keep = rows.filter(isCurrentYearOffering);
const deactivate = rows.filter((row) => !isCurrentYearOffering(row));

console.log(`[reconcile:anlegg-vg2] mode=${APPLY ? "APPLY" : "DRY-RUN"}`);
console.log(`[reconcile:anlegg-vg2] active VG2 PSA=${rows.length}`);
console.log(`[reconcile:anlegg-vg2] keep (current-year offering)=${keep.length}`);
for (const row of keep) {
  console.log(`  KEEP  ${row.county_code}  ${row.institutions?.name}`);
}
console.log(`[reconcile:anlegg-vg2] deactivate (structure-only)=${deactivate.length}`);
for (const row of deactivate) {
  console.log(`  DROP  ${row.county_code}  ${row.institutions?.name}`);
}

if (keep.length !== 6) {
  console.error(
    `[reconcile:anlegg-vg2] ABORT: expected exactly 6 keep rows, got ${keep.length}. Check name matchers.`
  );
  process.exit(2);
}

if (!APPLY) {
  console.log("[reconcile:anlegg-vg2] dry-run only — re-run with --apply to write");
  process.exit(0);
}

const deactivateIds = deactivate.map((row) => row.id);
const note = {
  current_year_offering_reconcile: "P4-CURRENT-YEAR-OFFERING",
  reconciled_at: new Date().toISOString(),
  reason: "Not in Vilbli national strukturkart Skoler som tilbyr dette (anleggsteknikk VG2 audit 2026-07-18)",
};

for (let i = 0; i < deactivateIds.length; i += 50) {
  const chunk = deactivateIds.slice(i, i + 50);
  const { data: existing } = await sb
    .from("programme_school_availability")
    .select("id, notes")
    .in("id", chunk);

  for (const row of existing ?? []) {
    let notes = {};
    try {
      notes = row.notes && typeof row.notes === "object" ? { ...row.notes } : {};
      if (typeof row.notes === "string" && row.notes.trim()) {
        notes = { legacy_notes: row.notes };
      }
    } catch {
      notes = {};
    }
    notes.current_year_offering_reconcile = note;

    const { error } = await sb
      .from("programme_school_availability")
      .update({
        is_active: false,
        verification_status: "superseded",
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (error) {
      throw new Error(`Failed to deactivate ${row.id}: ${error.message}`);
    }
  }
}

console.log(`[reconcile:anlegg-vg2] deactivated ${deactivateIds.length} rows`);
process.exit(0);
