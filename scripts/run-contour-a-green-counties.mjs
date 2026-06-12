/**
 * Contour A operational truth refresh for green counties (03/11/46/50).
 * Runs full run-vgs-truth-pipeline from home IP (Vilbli fetch local).
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 *   node scripts/run-contour-a-green-counties.mjs [--dry-run] [--profession electrician] [--county 46]
 */
import { createClient } from "@supabase/supabase-js";
import { classifyReadiness } from "./classify-vgs-truth-readiness.mjs";
import {
  CONTOUR_A_OPERATIONAL_BY_PROFESSION,
  CONTOUR_A_GREEN_READINESS_STATUSES,
  SUPPORTED_VGS_PROFESSION_SLUGS,
} from "./lib/contour-b-operational-eligibility.mjs";
import { runVgsTruthPipeline } from "./run-vgs-truth-pipeline.mjs";

function parseArgs(argv) {
  const args = { "dry-run": "false" };
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = String(args["dry-run"] ?? "").toLowerCase() === "true";
  const professionFilter = String(args.profession ?? "").trim();
  const countyFilter = String(args.county ?? "").trim();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const results = [];
  const plannedPairs = Object.entries(CONTOUR_A_OPERATIONAL_BY_PROFESSION).reduce(
    (count, [professionSlug, countySet]) => {
      if (professionFilter && professionSlug !== professionFilter) return count;
      if (!SUPPORTED_VGS_PROFESSION_SLUGS.has(professionSlug)) return count;
      return (
        count +
        [...countySet].filter((code) => !countyFilter || code === countyFilter).length
      );
    },
    0
  );
  let pairIndex = 0;

  console.error(
    `[green-a] starting ${plannedPairs} pair(s) dryRun=${dryRun} (Vilbli + truth pipeline per pair)`
  );

  for (const [professionSlug, countySet] of Object.entries(
    CONTOUR_A_OPERATIONAL_BY_PROFESSION
  )) {
    if (professionFilter && professionSlug !== professionFilter) continue;
    if (!SUPPORTED_VGS_PROFESSION_SLUGS.has(professionSlug)) continue;

    for (const countyCode of countySet) {
      if (countyFilter && countyCode !== countyFilter) continue;

      pairIndex += 1;
      const entry = { professionSlug, countyCode, action: null, reason: null };
      try {
        console.error(
          `[green-a] (${pairIndex}/${plannedPairs}) ${professionSlug}/${countyCode} classifying readiness…`
        );
        const readiness = await classifyReadiness({
          professionSlug,
          countyCode,
          supabase,
        });

        if (!CONTOUR_A_GREEN_READINESS_STATUSES.has(readiness.status)) {
          entry.action = "skipped";
          entry.reason = `readiness_not_green:${readiness.status}`;
          results.push(entry);
          console.error(
            `[green-a] skip ${professionSlug}/${countyCode} readiness=${readiness.status}`
          );
          continue;
        }

        await runVgsTruthPipeline({
          professionSlug,
          countyCode,
          isDryRun: dryRun,
          isContourBPartial: false,
          supabase,
        });

        entry.action = dryRun ? "dry_run_ok" : "refreshed";
        entry.reason = readiness.status;
      } catch (error) {
        entry.action = "failed";
        entry.reason = error instanceof Error ? error.message : String(error);
      }

      results.push(entry);
      console.error(
        `[green-a] ${entry.professionSlug}/${entry.countyCode} ${entry.action} ${entry.reason ?? ""}`
      );
    }
  }

  console.log(JSON.stringify({ dryRun, results }, null, 2));
  const failed = results.filter((row) => row.action === "failed").length;
  if (failed > 0 && !dryRun) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
