#!/usr/bin/env node
/**
 * Systematic carpenter expansion parity audit vs electrician/mechanic.
 * Mirrors mechanic closure DB cross-check (phase-0-6-contour-b-second-profession-expansion).
 *
 * Usage:
 *   node --env-file=.env.local scripts/audit-carpenter-expansion-parity.mjs
 *   node --env-file=.env.local scripts/audit-carpenter-expansion-parity.mjs --json
 */
import { createClient } from "@supabase/supabase-js";
import { spawnSync } from "node:child_process";
import { isMainModule } from "./lib/is-main-module.mjs";
import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import {
  SUPPORTED_VGS_PROFESSION_SLUGS,
  VGS_PIPELINE_COUNTY_CODES,
  usesContourBOperationalRouteReadPath,
  getContourAOperationalCounties,
} from "./lib/contour-b-operational-eligibility.mjs";
import { classifyReadiness } from "./classify-vgs-truth-readiness.mjs";
import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";

const PROFESSIONS = ["electrician", "mechanic", "carpenter"];
const STAGES = ["VG1", "VG2", "VG3"];

function parseArgs(argv) {
  const args = { json: false };
  for (const token of argv.slice(2)) {
    if (token === "--json") args.json = true;
  }
  return args;
}

async function loadProfessionCatalog(supabase) {
  const { data, error } = await supabase
    .from("professions")
    .select("id, slug, title_i18n, is_active")
    .in("slug", PROFESSIONS);
  if (error) throw new Error(`professions: ${error.message}`);
  return new Map((data ?? []).map((row) => [row.slug, row]));
}

async function loadProgramIdsByProfession(supabase, profession, countySlug) {
  const slugPattern = `${profession}%-${countySlug}`;
  const { data, error } = await supabase
    .from("education_programs")
    .select("id, slug, title")
    .ilike("slug", slugPattern)
    .eq("is_active", true);
  if (error) throw new Error(`programs ${profession}/${countySlug}: ${error.message}`);
  return data ?? [];
}

async function countPsaByStage(supabase, programIds, countyCode) {
  const counts = { VG1: 0, VG2: 0, VG3: 0, total: 0 };
  if (programIds.length === 0) return counts;

  for (const stage of STAGES) {
    const { count, error } = await supabase
      .from("programme_school_availability")
      .select("id", { count: "exact", head: true })
      .eq("county_code", countyCode)
      .eq("stage", stage)
      .eq("availability_scope", "programme_in_school")
      .eq("is_active", true)
      .in("education_program_id", programIds);
    if (error) throw new Error(`psa ${countyCode}/${stage}: ${error.message}`);
    counts[stage] = count ?? 0;
  }
  counts.total = counts.VG1 + counts.VG2 + counts.VG3;
  return counts;
}

async function countProfessionLinks(supabase, profession) {
  const { count, error } = await supabase
    .from("profession_program_links")
    .select("id", { count: "exact", head: true })
    .eq("profession_slug", profession);
  if (error) throw new Error(`links ${profession}: ${error.message}`);
  return count ?? 0;
}

function runClassifyBatch(profession) {
  const counties = [...VGS_PIPELINE_COUNTY_CODES].sort();
  const results = [];
  for (const countyCode of counties) {
    const child = spawnSync(
      process.execPath,
      [
        "scripts/classify-vgs-truth-readiness.mjs",
        "--profession",
        profession,
        "--county",
        countyCode,
      ],
      { cwd: process.cwd(), encoding: "utf8", env: process.env }
    );
    if (child.status !== 0) {
      results.push({ countyCode, status: "classify_failed", error: child.stderr?.slice(-200) });
      continue;
    }
    try {
      const parsed = JSON.parse(child.stdout);
      results.push({
        countyCode,
        status: parsed.status,
        missingProgrammeRows: parsed.missingProgrammeRows?.length ?? 0,
        missingPathNodes: parsed.missingPathNodes?.length ?? 0,
      });
    } catch {
      results.push({ countyCode, status: "parse_failed" });
    }
  }
  return results;
}

async function main() {
  const args = parseArgs(process.argv);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key);
  const issues = [];
  const catalog = await loadProfessionCatalog(supabase);

  for (const slug of PROFESSIONS) {
    const row = catalog.get(slug);
    if (!row) issues.push({ code: "missing_profession_row", profession: slug });
    else if (!row.is_active) issues.push({ code: "inactive_profession", profession: slug });
  }

  if (!getVgsPathDefinition("carpenter")) {
    issues.push({ code: "missing_path_definition", profession: "carpenter" });
  }

  if (!SUPPORTED_VGS_PROFESSION_SLUGS.has("carpenter")) {
    issues.push({ code: "unsupported_in_eligibility", profession: "carpenter" });
  }

  const linkCounts = {};
  for (const profession of PROFESSIONS) {
    linkCounts[profession] = await countProfessionLinks(supabase, profession);
    if (profession === "carpenter" && linkCounts[profession] < 30) {
      issues.push({
        code: "low_program_link_count",
        profession,
        count: linkCounts[profession],
        hint: "expected ~45 county programmes × links",
      });
    }
  }

  const countyMatrix = [];
  for (const countyCode of [...VGS_PIPELINE_COUNTY_CODES].sort()) {
    const meta = COUNTY_CODE_TO_VILBLI[countyCode];
    const row = { countyCode, countySlug: meta?.slug ?? null, professions: {} };

    for (const profession of PROFESSIONS) {
      const programs = await loadProgramIdsByProfession(supabase, profession, meta.slug);
      const programIds = programs.map((p) => p.id);
      const psa = await countPsaByStage(supabase, programIds, countyCode);
      const routeReadPath = usesContourBOperationalRouteReadPath({
        countyCode,
        professionSlug: profession,
      });
      const contourA = getContourAOperationalCounties(profession).has(countyCode);

      row.professions[profession] = {
        catalogPrograms: programs.length,
        vg1Catalog: programs.filter((p) => /-vg1-/i.test(p.slug)).length,
        vg2Catalog: programs.filter((p) => /-vg2-/i.test(p.slug)).length,
        vg3Catalog: programs.filter((p) => /-vg3-/i.test(p.slug)).length,
        psa,
        contourBRouteRead: routeReadPath,
        contourA,
      };

      if (profession === "carpenter") {
        if (psa.VG1 === 0) {
          issues.push({ code: "carpenter_missing_vg1_psa", countyCode });
        }
        if (psa.VG2 === 0) {
          issues.push({ code: "carpenter_missing_vg2_psa", countyCode });
        }
        if (!routeReadPath) {
          issues.push({ code: "carpenter_not_contour_b_read", countyCode, contourA });
        }
      }
    }
    countyMatrix.push(row);
  }

  const carpenterReadiness = runClassifyBatch("carpenter");
  const carpenterMissingProgrammes = carpenterReadiness.filter(
    (r) => r.missingProgrammeRows > 0 || r.missingPathNodes > 0
  );
  const carpenterNoPsa = countyMatrix.filter((r) => r.professions.carpenter.psa.total === 0);

  const payload = {
    audit: "carpenter_expansion_parity",
    at: new Date().toISOString(),
    professionCatalog: Object.fromEntries(catalog),
    programLinkCounts: linkCounts,
    carpenterReadiness,
    carpenterPartialReadiness: carpenterReadiness.filter((r) =>
      ["canonical_matching_review", "missing_programme_rows"].includes(r.status)
    ),
    countyMatrix,
    issues,
    summary: {
      countiesWithCarpenterPsa: countyMatrix.filter((r) => r.professions.carpenter.psa.total > 0)
        .length,
      countiesExpected: VGS_PIPELINE_COUNTY_CODES.size,
      issueCount: issues.length,
      carpenterVg1SchoolsTotal: countyMatrix.reduce(
        (sum, r) => sum + r.professions.carpenter.psa.VG1,
        0
      ),
      carpenterVg2SchoolsTotal: countyMatrix.reduce(
        (sum, r) => sum + r.professions.carpenter.psa.VG2,
        0
      ),
      carpenterNoPsaCounties: carpenterNoPsa.map((r) => r.countyCode),
      carpenterMissingProgrammesCounties: carpenterMissingProgrammes.map((r) => r.countyCode),
    },
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log("Carpenter expansion parity audit\n");
    console.log(`Professions catalog: ${PROFESSIONS.map((p) => (catalog.has(p) ? `${p}=OK` : `${p}=MISSING`)).join(", ")}`);
    console.log(`Program links: electrician=${linkCounts.electrician}, mechanic=${linkCounts.mechanic}, carpenter=${linkCounts.carpenter}`);
    console.log(`Carpenter PSA counties: ${payload.summary.countiesWithCarpenterPsa}/${payload.summary.countiesExpected}`);
    console.log(`Carpenter VG1 schools (sum): ${payload.summary.carpenterVg1SchoolsTotal}`);
    console.log(`Carpenter VG2 schools (sum): ${payload.summary.carpenterVg2SchoolsTotal}`);
    console.log("\nPer county (carpenter PSA | readiness):");
    for (const row of countyMatrix) {
      const c = row.professions.carpenter.psa;
      const readiness =
        carpenterReadiness.find((r) => r.countyCode === row.countyCode)?.status ?? "?";
      console.log(
        `  ${row.countyCode} ${row.countySlug}: VG1=${c.VG1} VG2=${c.VG2} VG3=${c.VG3} total=${c.total} | ${readiness}`
      );
    }
    if (issues.length > 0) {
      console.log(`\nISSUES (${issues.length}):`);
      for (const issue of issues) {
        console.log(`  - ${issue.code}: ${JSON.stringify(issue)}`);
      }
    } else {
      console.log("\nISSUES: none");
    }
  }

  if (issues.length > 0 || payload.summary.countiesWithCarpenterPsa < payload.summary.countiesExpected) {
    process.exit(1);
  }
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
