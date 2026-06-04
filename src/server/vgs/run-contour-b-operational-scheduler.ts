import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  assessContourBOperationalEligibility,
  SUPPORTED_VGS_PROFESSION_SLUGS,
  VGS_PIPELINE_COUNTY_CODES,
} from "@/lib/vgs/contour-b-operational-eligibility";
import { loadContourBSchedulerBundle } from "@/server/vgs/load-contour-b-scheduler-bundle";
import { loadVgsScriptModule } from "@/server/vgs/load-vgs-script-module";

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

type ClassifyModule = {
  classifyReadiness: (args: {
    professionSlug: string;
    countyCode: string;
    supabase: ReturnType<typeof createAdminClient>;
  }) => Promise<{ status: string }>;
};

type IngestModule = {
  runContourBOperationalIngest: (args: {
    professionSlug: string;
    countyCode: string;
    dryRun: boolean;
    supabase: ReturnType<typeof createAdminClient>;
  }) => Promise<void>;
};

function useVercelSchedulerBundle(): boolean {
  return process.env.VERCEL === "1";
}

async function runViaVercelBundle(
  options: RunContourBSchedulerOptions
): Promise<RunContourBSchedulerOutput> {
  const mod = await loadContourBSchedulerBundle();
  return mod.runContourBOperationalSchedulerBundled(options);
}

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

async function runViaDynamicScripts(
  options: RunContourBSchedulerOptions
): Promise<RunContourBSchedulerOutput> {
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

  const supabase = createAdminClient();
  const classifyModule = await loadVgsScriptModule<ClassifyModule>(
    "scripts/classify-vgs-truth-readiness.mjs"
  );
  const ingestModule = await loadVgsScriptModule<IngestModule>(
    "scripts/run-contour-b-operational-ingest.mjs"
  );

  for (const { professionSlug, countyCode } of pairs) {
    const entry: SchedulerPairResult = {
      professionSlug,
      countyCode,
      action: null,
      reason: null,
      readiness: null,
    };

    try {
      const readiness = await classifyModule.classifyReadiness({
        professionSlug,
        countyCode,
        supabase,
      });
      const readinessStatus = String(readiness.status ?? "unknown");
      entry.readiness = readinessStatus;

      if (readinessStatus === "source_extraction_failed") {
        entry.action = "failed";
        entry.reason =
          "vilbli_source_extraction_failed (run ?vilbliProbe=<county> on this API for httpStatus/htmlLen)";
        failed += 1;
        consecutiveFailures += 1;
        results.push(entry);
        continue;
      }

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

      await ingestModule.runContourBOperationalIngest({
        professionSlug,
        countyCode,
        dryRun: isDryRun,
        supabase,
      });

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

/**
 * Contour B batch scheduler. On Vercel uses prebuilt esbuild bundle from `npm run build`.
 */
export async function runContourBOperationalScheduler(
  options: RunContourBSchedulerOptions = {}
): Promise<RunContourBSchedulerOutput> {
  if (useVercelSchedulerBundle()) {
    return runViaVercelBundle(options);
  }
  return runViaDynamicScripts(options);
}
