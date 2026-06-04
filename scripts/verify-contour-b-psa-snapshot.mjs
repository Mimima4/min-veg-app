/**
 * Block C read-only snapshot: active programme_school_availability for electrician
 * per pipeline county (after relay). No writes.
 *
 *   set -a && source .env.local && set +a
 *   node scripts/verify-contour-b-psa-snapshot.mjs [--county 56]
 */
import { createClient } from "@supabase/supabase-js";
import {
  CONTOUR_A_OPERATIONAL_BY_PROFESSION,
  VGS_PIPELINE_COUNTY_CODES,
} from "./lib/contour-b-operational-eligibility.mjs";

const PILOT_COUNTIES = ["56", "15", "18", "55"];
const PROFESSION = "electrician";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

async function loadElectricianProgramIds(supabase) {
  const { data: links, error: linksError } = await supabase
    .from("profession_program_links")
    .select("program_slug")
    .eq("profession_slug", PROFESSION);
  if (linksError) throw linksError;

  const slugs = Array.from(
    new Set((links ?? []).map((row) => String(row.program_slug ?? "").trim()).filter(Boolean))
  );
  if (slugs.length === 0) {
    return { slugs, programIds: [] };
  }

  const { data: programs, error: programsError } = await supabase
    .from("education_programs")
    .select("id, slug")
    .in("slug", slugs)
    .eq("is_active", true);
  if (programsError) throw programsError;

  const programIds = (programs ?? []).map((row) => row.id);
  return { slugs, programIds };
}

async function snapshotCounty(supabase, programIds, countyCode) {
  if (programIds.length === 0) {
    return {
      countyCode,
      hasTruth: false,
      activeRowCount: 0,
      byStage: {},
      byVerification: {},
      latestUpdatedAt: null,
    };
  }

  const { data: rows, error } = await supabase
    .from("programme_school_availability")
    .select("stage, verification_status, updated_at, is_active")
    .in("education_program_id", programIds)
    .eq("county_code", countyCode)
    .eq("is_active", true)
    .in("verification_status", ["verified", "needs_review"]);
  if (error) throw error;

  const typed = rows ?? [];
  const byStage = {};
  const byVerification = {};
  let latestUpdatedAt = null;

  for (const row of typed) {
    const stage = String(row.stage ?? "unknown");
    const status = String(row.verification_status ?? "unknown");
    byStage[stage] = (byStage[stage] ?? 0) + 1;
    byVerification[status] = (byVerification[status] ?? 0) + 1;
    const updated = row.updated_at ? new Date(row.updated_at).toISOString() : null;
    if (updated && (!latestUpdatedAt || updated > latestUpdatedAt)) {
      latestUpdatedAt = updated;
    }
  }

  return {
    countyCode,
    hasTruth: typed.length > 0,
    activeRowCount: typed.length,
    byStage,
    byVerification,
    latestUpdatedAt,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const countyFilter = String(args.county ?? "").trim();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { slugs, programIds } = await loadElectricianProgramIds(supabase);
  const contourA = CONTOUR_A_OPERATIONAL_BY_PROFESSION[PROFESSION] ?? new Set();

  const counties = [...VGS_PIPELINE_COUNTY_CODES].filter(
    (code) => !countyFilter || code === countyFilter
  );

  const snapshots = [];
  for (const countyCode of counties.sort()) {
    snapshots.push(await snapshotCounty(supabase, programIds, countyCode));
  }

  const pilot = snapshots.filter((s) => PILOT_COUNTIES.includes(s.countyCode));
  const pilotAllHaveTruth = pilot.every((s) => s.hasTruth);
  const contourBIngested = snapshots.filter(
    (s) => !contourA.has(s.countyCode) && s.hasTruth
  );

  const report = {
    profession: PROFESSION,
    programSlugCount: slugs.length,
    programIdCount: programIds.length,
    pilotCounties: PILOT_COUNTIES,
    pilotAllHaveTruth,
    contourACounties: [...contourA].sort(),
    contourBCountiesWithTruth: contourBIngested.map((s) => s.countyCode),
    snapshots,
    blockCHints: {
      e2e:
        "Child in pilot fylke → electrician route → programme_selection options from availability_truth",
      refresh:
        "Re-run relay for one county; latestUpdatedAt should advance on changed rows",
      greenCounties:
        "03/11/46/50 should keep Contour A truth; compare activeRowCount before/after B batch",
    },
  };

  console.log(JSON.stringify(report, null, 2));
  if (!pilotAllHaveTruth && !countyFilter) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
