/**
 * Contour B operational scheduler (P06-CLOSURE Block B).
 * Iterates all VGS profession × pipeline county pairs; runs ingest only when eligible.
 * Does NOT run on route load — use cron, GitHub Actions, or owner-held shell wrapper.
 *
 * Usage:
 *   node scripts/run-contour-b-operational-scheduler.mjs [--dry-run]
 *   node scripts/run-contour-b-operational-scheduler.mjs --profession electrician --county 56 [--dry-run]
 *
 * Env:
 *   CONTOUR_B_SCHEDULER_MAX_CONSECUTIVE_FAILURES (default 5) — abort batch after N ingest failures in a row
 */
import {
  assessContourBOperationalEligibility,
  SUPPORTED_VGS_PROFESSION_SLUGS,
  VGS_PIPELINE_COUNTY_CODES,
} from "./lib/contour-b-operational-eligibility.mjs";
import { parseArgs, runNodeScript, spawnNodeScript } from "./lib/node-script-runner.mjs";

function buildPairList(args) {
  const professionFilter = String(args.profession ?? "").trim();
  const countyFilter = String(args.county ?? "").trim();
  const pairs = [];

  for (const professionSlug of SUPPORTED_VGS_PROFESSION_SLUGS) {
    if (professionFilter && professionSlug !== professionFilter) continue;
    for (const countyCode of VGS_PIPELINE_COUNTY_CODES) {
      if (countyFilter && countyCode !== countyFilter) continue;
      pairs.push({ professionSlug, countyCode });
    }
  }

  return pairs;
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  const isDryRun = String(args["dry-run"] ?? "").toLowerCase() === "true";
  const maxConsecutiveFailures = Number(
    process.env.CONTOUR_B_SCHEDULER_MAX_CONSECUTIVE_FAILURES ?? "5"
  );
  const startedAt = new Date().toISOString();
  const pairs = buildPairList(args);
  const results = [];
  let consecutiveFailures = 0;
  let ingested = 0;
  let skipped = 0;
  let failed = 0;

  for (const { professionSlug, countyCode } of pairs) {
    const entry = { professionSlug, countyCode, action: null, reason: null, readiness: null };

    try {
      const classify = runNodeScript("scripts/classify-vgs-truth-readiness.mjs", [
        "--profession",
        professionSlug,
        "--county",
        countyCode,
      ]);
      const readinessStatus = classify.parsed?.status ?? "unknown";
      entry.readiness = readinessStatus;

      const eligibility = assessContourBOperationalEligibility({
        countyCode,
        professionSlug,
        readinessStatus,
      });

      if (!eligibility.eligible) {
        entry.action = "skipped";
        entry.reason = eligibility.reason;
        skipped += 1;
        results.push(entry);
        consecutiveFailures = 0;
        continue;
      }

      const ingestArgs = [
        "scripts/run-contour-b-operational-ingest.mjs",
        "--profession",
        professionSlug,
        "--county",
        countyCode,
      ];
      if (isDryRun) {
        ingestArgs.push("--dry-run");
      }

      const ingest = spawnNodeScript(ingestArgs[0], ingestArgs.slice(1));
      if (ingest.status !== 0) {
        throw new Error(ingest.stderr || ingest.stdout || `ingest exit ${ingest.status}`);
      }

      entry.action = isDryRun ? "dry_run_ok" : "ingested";
      entry.reason = eligibility.reason;
      ingested += 1;
      consecutiveFailures = 0;
    } catch (error) {
      entry.action = "failed";
      entry.reason = error instanceof Error ? error.message : String(error);
      failed += 1;
      consecutiveFailures += 1;
    }

    results.push(entry);

    if (consecutiveFailures >= maxConsecutiveFailures) {
      console.error(
        `[contour-b-scheduler] aborting: ${consecutiveFailures} consecutive failures (max=${maxConsecutiveFailures})`
      );
      break;
    }
  }

  const summary = {
    scheduler: "contour_b_operational",
    startedAt,
    finishedAt: new Date().toISOString(),
    dryRun: isDryRun,
    pairCount: pairs.length,
    processed: results.length,
    ingested,
    skipped,
    failed,
    consecutiveFailuresAtEnd: consecutiveFailures,
    alert:
      failed > 0 || consecutiveFailures >= maxConsecutiveFailures
        ? "CONTOUR_B_SCHEDULER_FAILURES"
        : null,
  };

  console.log(JSON.stringify({ summary, results }, null, 2));

  if (failed > 0 && !isDryRun) {
    process.exit(1);
  }
}

run();
