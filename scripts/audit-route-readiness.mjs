#!/usr/bin/env node
/**
 * R-VG3-CATALOG audit: VG3 catalog vs PSA with contour-aware classification.
 *
 * Usage:
 *   node --env-file=.env.local scripts/audit-route-readiness.mjs
 *   node --env-file=.env.local scripts/audit-route-readiness.mjs --strict
 *   node --env-file=.env.local scripts/audit-route-readiness.mjs --json
 */
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import { isMainModule } from "./lib/is-main-module.mjs";
import {
  classifyVg3CatalogPsaStatus,
  isStrictAuditFailureStatus,
  statusLabel,
} from "./lib/vg3-catalog-status.mjs";
import { SUPPORTED_VGS_PROFESSION_SLUGS } from "./lib/contour-b-operational-eligibility.mjs";

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
    for (const profession of SUPPORTED_VGS_PROFESSION_SLUGS) {
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

      const status = classifyVg3CatalogPsaStatus({
        professionSlug: profession,
        countyCode,
        catalogVg3Count: vg3CatalogSlugs.length,
        psaVg3Count,
      });

      report.push({
        countyCode,
        countySlug: meta.slug,
        profession,
        status,
        statusLabel: statusLabel(status),
        catalogVg3Count: vg3CatalogSlugs.length,
        catalogVg3Slugs: vg3CatalogSlugs,
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

  const actionableGaps = report.filter((row) => row.status === "actionable_gap");
  const catalogOrphans = report.filter((row) => row.status === "catalog_orphan");
  const liveRows = report.filter((row) => row.status === "live");

  runInvariantSmoke();

  const payload = {
    live: liveRows.length,
    catalogOrphans,
    actionableGaps,
    invariantSmoke: "pass",
  };

  if (args.json) {
    console.log(JSON.stringify({ report, ...payload }, null, 2));
  } else {
    console.log("Route readiness audit (R-VG3-CATALOG)\n");
    console.log("Invariant smoke: PASS");
    console.log(`Live VG3 PSA pairs: ${liveRows.length}`);
    console.log(`Catalog orphans (cleanup candidates): ${catalogOrphans.length}`);
    for (const row of catalogOrphans) {
      console.log(
        `  - ${row.countySlug} (${row.countyCode}) / ${row.profession}: catalog=${row.catalogVg3Count}, PSA=0`
      );
    }
    console.log(`Actionable VG3 PSA gaps (ingest required): ${actionableGaps.length}`);
    for (const gap of actionableGaps) {
      console.log(
        `  - ${gap.countySlug} (${gap.countyCode}) / ${gap.profession}: catalog=${gap.catalogVg3Count}, PSA=0`
      );
    }
  }

  const strictFailures = report.filter((row) => isStrictAuditFailureStatus(row.status));
  if (args.strict && strictFailures.length > 0) {
    throw new Error(
      `Strict audit failed: ${strictFailures.length} pair(s) with actionable VG3 PSA gaps`
    );
  }
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
