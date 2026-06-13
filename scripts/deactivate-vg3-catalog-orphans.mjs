#!/usr/bin/env node
/**
 * Deactivate VG3 education_programs catalog orphans (R-VG3-CATALOG).
 * Orphans = active VG3 slugs with zero PSA where contour does not require school VG3.
 *
 * Usage:
 *   node --env-file=.env.local scripts/deactivate-vg3-catalog-orphans.mjs --dry-run
 *   node --env-file=.env.local scripts/deactivate-vg3-catalog-orphans.mjs --apply
 */
import { createClient } from "@supabase/supabase-js";

import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import { isMainModule } from "./lib/is-main-module.mjs";
import { classifyVg3CatalogPsaStatus } from "./lib/vg3-catalog-status.mjs";
import { SUPPORTED_VGS_PROFESSION_SLUGS } from "./lib/contour-b-operational-eligibility.mjs";

function parseArgs(argv) {
  const args = { dryRun: true, apply: false };
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--apply") {
      args.apply = true;
      args.dryRun = false;
    }
    if (argv[i] === "--dry-run") {
      args.dryRun = true;
      args.apply = false;
    }
  }
  return args;
}

async function collectOrphanProgramIds(supabase) {
  const orphanProgramIds = new Set();
  const orphanDetails = [];

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

      const vg3Programs = (programs ?? []).filter((row) => /-vg3-/i.test(row.slug ?? ""));
      if (vg3Programs.length === 0) {
        continue;
      }

      const programIds = vg3Programs.map((row) => row.id);
      const { count, error: psaError } = await supabase
        .from("programme_school_availability")
        .select("id", { count: "exact", head: true })
        .eq("county_code", countyCode)
        .eq("stage", "VG3")
        .eq("availability_scope", "programme_in_school")
        .eq("is_active", true)
        .in("education_program_id", programIds);
      if (psaError) {
        throw new Error(`psa: ${psaError.message}`);
      }

      const status = classifyVg3CatalogPsaStatus({
        professionSlug: profession,
        countyCode,
        catalogVg3Count: vg3Programs.length,
        psaVg3Count: count ?? 0,
      });
      if (status !== "catalog_orphan") {
        continue;
      }

      for (const program of vg3Programs) {
        orphanProgramIds.add(program.id);
        orphanDetails.push({
          countyCode,
          countySlug: meta.slug,
          profession,
          programId: program.id,
          slug: program.slug,
        });
      }
    }
  }

  return { orphanProgramIds: [...orphanProgramIds], orphanDetails };
}

async function main() {
  const args = parseArgs(process.argv);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key);
  const { orphanProgramIds, orphanDetails } = await collectOrphanProgramIds(supabase);

  if (orphanDetails.length === 0) {
    console.log("No VG3 catalog orphans to deactivate.");
    return;
  }

  console.log(
    `${args.dryRun ? "[dry-run] " : ""}VG3 catalog orphans: ${orphanDetails.length} programme row(s)`
  );
  for (const row of orphanDetails) {
    console.log(`  - ${row.slug} (${row.countySlug}/${row.profession})`);
  }

  if (args.dryRun) {
    console.log("\nDry-run only. Re-run with --apply to set is_active=false.");
    return;
  }

  const { error } = await supabase
    .from("education_programs")
    .update({ is_active: false })
    .in("id", orphanProgramIds);
  if (error) {
    throw new Error(`Failed to deactivate orphan programmes: ${error.message}`);
  }

  console.log(`\nDeactivated ${orphanProgramIds.length} orphan education_programs row(s).`);
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
