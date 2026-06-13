#!/usr/bin/env node
/**
 * Read-only VG3 PSA vs catalog audit (R-VG3-CATALOG classification).
 */
import { createClient } from "@supabase/supabase-js";

import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import { isMainModule } from "./lib/is-main-module.mjs";
import {
  classifyVg3CatalogPsaStatus,
  statusLabel,
} from "./lib/vg3-catalog-status.mjs";
import { SUPPORTED_VGS_PROFESSION_SLUGS } from "./lib/contour-b-operational-eligibility.mjs";

function parseArgs(argv) {
  const args = { json: false };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--json") args.json = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
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
        throw new Error(`Failed to load programmes: ${programsError.message}`);
      }

      const vg3CatalogSlugs = (programs ?? [])
        .map((row) => row.slug)
        .filter((slug) => /-vg3-/i.test(slug));
      const programIds = (programs ?? []).map((row) => row.id);

      let psaVg3Rows = [];
      if (programIds.length > 0) {
        const { data, error } = await supabase
          .from("programme_school_availability")
          .select("education_program_id, institution_id, stage, verification_status")
          .eq("county_code", countyCode)
          .eq("stage", "VG3")
          .eq("availability_scope", "programme_in_school")
          .eq("is_active", true)
          .in("education_program_id", programIds);

        if (error) {
          throw new Error(`Failed to load PSA rows: ${error.message}`);
        }
        psaVg3Rows = data ?? [];
      }

      const psaProgramSlugs = [];
      for (const row of psaVg3Rows) {
        const program = (programs ?? []).find((item) => item.id === row.education_program_id);
        if (program?.slug) {
          psaProgramSlugs.push(program.slug);
        }
      }

      const status = classifyVg3CatalogPsaStatus({
        professionSlug: profession,
        countyCode,
        catalogVg3Count: vg3CatalogSlugs.length,
        psaVg3Count: psaVg3Rows.length,
      });

      report.push({
        countyCode,
        countySlug: meta.slug,
        profession,
        status,
        statusLabel: statusLabel(status),
        catalogVg3Count: vg3CatalogSlugs.length,
        psaVg3Count: psaVg3Rows.length,
        catalogVg3Slugs: vg3CatalogSlugs,
        psaVg3Slugs: [...new Set(psaProgramSlugs)],
      });
    }
  }

  const actionableGaps = report.filter((row) => row.status === "actionable_gap");
  const catalogOrphans = report.filter((row) => row.status === "catalog_orphan");

  if (args.json) {
    console.log(JSON.stringify({ report, actionableGaps, catalogOrphans }, null, 2));
    return;
  }

  console.log("VG3 PSA coverage audit (R-VG3-CATALOG)\n");
  for (const row of report) {
    if (row.status === "no_vg3_catalog") continue;
    console.log(
      `${row.countyCode} ${row.countySlug} / ${row.profession}: PSA=${row.psaVg3Count} catalog=${row.catalogVg3Count} [${row.status}]`
    );
    if (row.psaVg3Slugs.length > 0) {
      console.log(`  live: ${row.psaVg3Slugs.join(", ")}`);
    }
    if (row.status === "catalog_orphan") {
      console.log(
        `  orphan slugs: ${row.catalogVg3Slugs.slice(0, 3).join(", ")}${row.catalogVg3Slugs.length > 3 ? "…" : ""}`
      );
    }
    if (row.status === "actionable_gap") {
      console.log(
        `  gap slugs: ${row.catalogVg3Slugs.slice(0, 3).join(", ")}${row.catalogVg3Slugs.length > 3 ? "…" : ""}`
      );
    }
  }

  console.log(`\nCatalog orphans: ${catalogOrphans.length}`);
  console.log(`Actionable gaps: ${actionableGaps.length}`);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
