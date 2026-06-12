#!/usr/bin/env node
/**
 * Route readiness audit:
 * - electrician VG3 PSA gaps (actionable ingest targets)
 * - mechanic VG3 catalog-only rows (informational; bedrift path expected)
 *
 * Usage:
 *   node --env-file=.env.local scripts/audit-route-readiness.mjs
 *   node --env-file=.env.local scripts/audit-route-readiness.mjs --strict
 */
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import { isMainModule } from "./lib/is-main-module.mjs";

const PROFESSIONS = ["mechanic", "electrician"];

function parseArgs(argv) {
  const args = { strict: false, json: false };
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--strict") args.strict = true;
    if (token === "--json") args.json = true;
  }
  return args;
}

async function loadVg3CoverageReport() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key);
  const report = [];

  for (const [countyCode, meta] of Object.entries(COUNTY_CODE_TO_VILBLI)) {
    for (const profession of PROFESSIONS) {
      const slugPattern = `${profession}%-${meta.slug}`;
      const { data: programs, error: programsError } = await supabase
        .from("education_programs")
        .select("id, slug")
        .ilike("slug", slugPattern)
        .eq("is_active", true);
      if (programsError) {
        throw new Error(`programmes: ${programsError.message}`);
      }

      const vg3CatalogSlugs = (programs ?? [])
        .map((row) => row.slug)
        .filter((slug) => /-vg3-/i.test(slug));
      const programIds = (programs ?? []).map((row) => row.id);

      let psaVg3Count = 0;
      if (programIds.length > 0) {
        const { count, error } = await supabase
          .from("programme_school_availability")
          .select("id", { count: "exact", head: true })
          .eq("county_code", countyCode)
          .eq("stage", "VG3")
          .eq("availability_scope", "programme_in_school")
          .eq("is_active", true)
          .in("education_program_id", programIds);
        if (error) {
          throw new Error(`psa: ${error.message}`);
        }
        psaVg3Count = count ?? 0;
      }

      const status =
        psaVg3Count > 0
          ? "live"
          : vg3CatalogSlugs.length > 0
            ? "catalog_only_gap"
            : "no_vg3_expected";

      report.push({
        countyCode,
        countySlug: meta.slug,
        profession,
        status,
        catalogVg3Count: vg3CatalogSlugs.length,
        psaVg3Count,
      });
    }
  }

  return report;
}

function runInvariantSmoke() {
  const result = spawnSync(process.execPath, ["scripts/smoke-route-truth-invariants.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status !== 0) {
    const combined = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    throw new Error(`route-truth invariant smoke failed:\n${combined.slice(-1200)}`);
  }
}

async function main() {
  const args = parseArgs(process.argv);
  const report = await loadVg3CoverageReport();

  const electricianGaps = report.filter(
    (row) => row.profession === "electrician" && row.status === "catalog_only_gap"
  );
  const mechanicCatalogOnly = report.filter(
    (row) => row.profession === "mechanic" && row.status === "catalog_only_gap"
  );

  runInvariantSmoke();

  const payload = {
    electricianActionableGaps: electricianGaps,
    mechanicCatalogOnlyInformational: mechanicCatalogOnly.length,
    invariantSmoke: "pass",
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log("Route readiness audit\n");
    console.log(`Invariant smoke: PASS`);
    console.log(
      `Electrician VG3 PSA gaps (actionable ingest): ${electricianGaps.length}`
    );
    for (const gap of electricianGaps) {
      console.log(`  - ${gap.countySlug} (${gap.countyCode}): catalog=${gap.catalogVg3Count}, PSA=0`);
    }
    console.log(
      `Mechanic VG3 catalog-only rows (informational, bedrift path): ${mechanicCatalogOnly.length}`
    );
  }

  if (args.strict && electricianGaps.length > 0) {
    throw new Error(
      `Strict audit failed: ${electricianGaps.length} electrician county(ies) missing VG3 PSA rows`
    );
  }
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
