import "server-only";

import {
  assessContourBOperationalEligibility,
  SUPPORTED_VGS_PROFESSION_SLUGS,
  VGS_PIPELINE_COUNTY_CODES,
} from "@/lib/vgs/contour-b-operational-eligibility";
import { spawnVgsNodeScript } from "@/server/vgs/spawn-vgs-node-script";

export type RunContourBSchedulerOptions = {
  dryRun?: boolean;
  profession?: string;
  county?: string;
};

export type SchedulerPairResult = {
  professionSlug: string;
  countyCode: string;
  action: string | null;
  reason: string | null;
  readiness: string | null;
};

export type RunContourBSchedulerOutput = {
  exitCode: number;
  summary: Record<string, unknown>;
  results: SchedulerPairResult[];
};

function buildPairList(options: RunContourBSchedulerOptions) {
  const professionFilter = options.profession?.trim() ?? "";
  const countyFilter = options.county?.trim() ?? "";
  const pairs: Array<{ professionSlug: string; countyCode: string }> = [];

  for (const professionSlug of SUPPORTED_VGS_PROFESSION_SLUGS) {
    if (professionFilter && professionSlug !== professionFilter) continue;
    for (const countyCode of VGS_PIPELINE_COUNTY_CODES) {
      if (countyFilter && countyCode !== countyFilter) continue;
      pairs.push({ professionSlug, countyCode });
    }
  }

  return pairs;
}

/**
 * Contour B batch scheduler (classify → eligibility → ingest).
 * Loop runs in TypeScript; only classify/ingest spawn Node scripts (Vercel-traced).
 */
export function runContourBOperationalScheduler(
  options: RunContourBSchedulerOptions = {}
): RunContourBSchedulerOutput {
  const isDryRun = Boolean(options.dryRun);
  const maxConsecutiveFailures = Number(
    process.env.CONTOUR_B_SCHEDULER_MAX_CONSECUTIVE_FAILURES ?? "5"
  );
  const startedAt = new Date().toISOString();
  const pairs = buildPairList(options);
  const results: SchedulerPairResult[] = [];
  let consecutiveFailures = 0;
  let ingested = 0;
  let skipped = 0;
  let failed = 0;

  for (const { professionSlug, countyCode } of pairs) {
    const entry: SchedulerPairResult = {
      professionSlug,
      countyCode,
      action: null,
      reason: null,
      readiness: null,
    };

    try {
      const classify = spawnVgsNodeScript("scripts/classify-vgs-truth-readiness.mjs", [
        "--profession",
        professionSlug,
        "--county",
        countyCode,
      ]);
      if (classify.status !== 0) {
        throw new Error(
          classify.stderr || classify.stdout || `classify exit ${classify.status}`
        );
      }

      const readinessStatus = String(classify.parsed?.status ?? "unknown");
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

      const ingestArgs = ["--profession", professionSlug, "--county", countyCode];
      if (isDryRun) {
        ingestArgs.push("--dry-run");
      }

      const ingest = spawnVgsNodeScript(
        "scripts/run-contour-b-operational-ingest.mjs",
        ingestArgs
      );
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
      break;
    }
  }

  const summary: Record<string, unknown> = {
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

  const exitCode = failed > 0 && !isDryRun ? 1 : 0;

  return { exitCode, summary, results };
}

/** @deprecated CLI wrapper only — API uses `runContourBOperationalScheduler`. */
export function runContourBOperationalSchedulerScript(
  options: RunContourBSchedulerOptions = {}
): { exitCode: number; stdout: string; stderr: string } {
  const output = runContourBOperationalScheduler(options);
  const stdout = JSON.stringify(
    { summary: output.summary, results: output.results },
    null,
    2
  );
  return {
    exitCode: output.exitCode,
    stdout,
    stderr: "",
  };
}
