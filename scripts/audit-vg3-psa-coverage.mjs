#!/usr/bin/env node
/**
 * Read-only audit: VG3 programme_in_school PSA rows vs education_programs slugs
 * for mechanic and electrician per county.
 */
import { createClient } from "@supabase/supabase-js";

import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";

const PROFESSIONS = ["mechanic", "electrician"];

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
  const counties = Object.entries(COUNTY_CODE_TO_VILBLI).map(([countyCode, meta]) => [
    countyCode,
    meta.slug,
  ]);
  const report = [];

  for (const [countyCode, countySlug] of counties) {
    for (const profession of PROFESSIONS) {
      const slugPattern = `${profession}%-${countySlug}`;
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

      const status =
        psaVg3Rows.length > 0
          ? "live"
          : vg3CatalogSlugs.length > 0
            ? "catalog_only_gap"
            : "no_vg3_expected";

      report.push({
        countyCode,
        countySlug,
        profession,
        status,
        catalogVg3Count: vg3CatalogSlugs.length,
        psaVg3Count: psaVg3Rows.length,
        catalogVg3Slugs: vg3CatalogSlugs,
        psaVg3Slugs: [...new Set(psaProgramSlugs)],
      });
    }
  }

  const gaps = report.filter((row) => row.status === "catalog_only_gap");

  if (args.json) {
    console.log(JSON.stringify({ report, gaps }, null, 2));
    return;
  }

  console.log("VG3 PSA coverage audit (mechanic + electrician)\n");
  for (const row of report) {
    if (row.status === "no_vg3_expected") continue;
    console.log(
      `${row.countyCode} ${row.countySlug} / ${row.profession}: PSA=${row.psaVg3Count} catalog=${row.catalogVg3Count} [${row.status}]`
    );
    if (row.psaVg3Slugs.length > 0) {
      console.log(`  live: ${row.psaVg3Slugs.join(", ")}`);
    }
    if (row.status === "catalog_only_gap") {
      console.log(`  GAP slugs (no PSA): ${row.catalogVg3Slugs.slice(0, 3).join(", ")}${row.catalogVg3Slugs.length > 3 ? "…" : ""}`);
    }
  }

  console.log(`\nCatalog-only gaps (need Contour B ingest): ${gaps.length}`);
  for (const gap of gaps) {
    console.log(`- ${gap.countySlug} / ${gap.profession}: ${gap.catalogVg3Count} VG3 programme slug(s), 0 PSA`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
