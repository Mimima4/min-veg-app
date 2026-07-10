#!/usr/bin/env node
/**
 * LOSA cross-profession read path: county LOSA PSA rows surface on non-electrician
 * Contour B routes in the same fylke (Finnmark reference pilot).
 *
 * Mirrors county LOSA merge in get-availability-truth.ts without @/ path imports.
 */
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const LOSA_SCOPE = "losa_fjern_delivery_municipality";
const ORDINARY_SCOPE = "programme_in_school";
const countyCode = "56";

const PAINTER_PROGRAMME_SLUGS = [
  "painter-vg1-bygg-finnmark",
  "carpenter-vg1-bygg-finnmark",
];
const ELECTRICIAN_PROGRAMME_SLUGS = ["electrician-vg1-elektro-finnmark"];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(url, key);

async function countCountyLosaPsaRows() {
  const { count, error } = await supabase
    .from("programme_school_availability")
    .select("*", { count: "exact", head: true })
    .eq("county_code", countyCode)
    .eq("is_active", true)
    .eq("availability_scope", LOSA_SCOPE);

  if (error) {
    throw new Error(`LOSA PSA count failed: ${error.message}`);
  }
  return count ?? 0;
}

async function loadProgramIdsBySlugs(slugs) {
  const { data, error } = await supabase
    .from("education_programs")
    .select("id, slug")
    .in("slug", slugs)
    .eq("is_active", true);

  if (error) {
    throw new Error(`Program lookup failed: ${error.message}`);
  }

  const rows = data ?? [];
  assert.ok(rows.length > 0, `No active programmes for slugs: ${slugs.join(", ")}`);
  return rows.map((row) => row.id);
}

async function countMergedLosaRowsForRoute(programmeSlugs) {
  const programIds = await loadProgramIdsBySlugs(programmeSlugs);

  const { data: routeRows, error: routeError } = await supabase
    .from("programme_school_availability")
    .select("institution_id, municipality_code, stage, education_program_id, availability_scope")
    .in("education_program_id", programIds)
    .eq("county_code", countyCode)
    .eq("is_active", true)
    .in("availability_scope", [ORDINARY_SCOPE, LOSA_SCOPE])
    .in("verification_status", ["verified", "needs_review"]);

  if (routeError) {
    throw new Error(`Route PSA load failed: ${routeError.message}`);
  }

  const losaKeys = new Set(
    (routeRows ?? [])
      .filter((row) => row.availability_scope === LOSA_SCOPE)
      .map((row) =>
        [row.institution_id, row.municipality_code ?? "", row.stage, row.education_program_id].join(
          "::"
        )
      )
  );

  const { data: countyLosaRows, error: countyLosaError } = await supabase
    .from("programme_school_availability")
    .select("institution_id, municipality_code, stage, education_program_id, availability_scope")
    .eq("county_code", countyCode)
    .eq("is_active", true)
    .eq("availability_scope", LOSA_SCOPE)
    .in("verification_status", ["verified", "needs_review"])
    .in("stage", ["VG1", "VG2"]);

  if (countyLosaError) {
    throw new Error(`County LOSA PSA load failed: ${countyLosaError.message}`);
  }

  for (const row of countyLosaRows ?? []) {
    const key = [
      row.institution_id,
      row.municipality_code ?? "",
      row.stage,
      row.education_program_id,
    ].join("::");
    if (!losaKeys.has(key)) {
      losaKeys.add(key);
    }
  }

  return losaKeys.size;
}

const losaPsaCount = await countCountyLosaPsaRows();
assert.ok(losaPsaCount >= 18, `Expected >=18 Finnmark LOSA PSA rows, got ${losaPsaCount}`);

const painterLosaCount = await countMergedLosaRowsForRoute(PAINTER_PROGRAMME_SLUGS);
assert.ok(
  painterLosaCount >= 18,
  `Expected >=18 merged LOSA rows for painter route read, got ${painterLosaCount}`
);

const electricianLosaCount = await countMergedLosaRowsForRoute(ELECTRICIAN_PROGRAMME_SLUGS);
assert.ok(
  electricianLosaCount >= 18,
  `Expected >=18 merged LOSA rows for electrician route read, got ${electricianLosaCount}`
);

console.error(
  `[smoke:losa-cross-profession] PASS — Finnmark LOSA PSA=${losaPsaCount}; painter+electrician merged LOSA each >=18`
);
