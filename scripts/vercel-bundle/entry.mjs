/**
 * Self-contained Contour B scheduler for Vercel (esbuild output).
 * Bundles classify + ingest + pipeline; reads Supabase env at runtime.
 */
import { createClient } from "@supabase/supabase-js";
import { classifyReadiness } from "../classify-vgs-truth-readiness.mjs";
import { runContourBOperationalIngest } from "../run-contour-b-operational-ingest.mjs";
import {
  assessContourBOperationalEligibility,
  SUPPORTED_VGS_PROFESSION_SLUGS,
  VGS_PIPELINE_COUNTY_CODES,
} from "../lib/contour-b-operational-eligibility.mjs";
import { probeVilbliCounty } from "../lib/vilbli-probe.mjs";

export { probeVilbliCounty };

function buildPairList({ profession, county }) {
  const professionFilter = String(profession ?? "").trim();
  const countyFilter = String(county ?? "").trim();
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

export async function runContourBOperationalSchedulerBundled({
  dryRun = false,
  profession,
  county,
} = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const isDryRun = Boolean(dryRun);
  const maxConsecutiveFailures = Number(
    process.env.CONTOUR_B_SCHEDULER_MAX_CONSECUTIVE_FAILURES ?? "5"
  );
  const startedAt = new Date().toISOString();
  const pairs = buildPairList({ profession, county });
  const results = [];
  let consecutiveFailures = 0;
  let ingested = 0;
  let skipped = 0;
  let failed = 0;

  for (const { professionSlug, countyCode } of pairs) {
    const entry = {
      professionSlug,
      countyCode,
      action: null,
      reason: null,
      readiness: null,
    };

    try {
      const readiness = await classifyReadiness({
        professionSlug,
        countyCode,
        supabase,
      });
      const readinessStatus = String(readiness.status ?? "unknown");
      entry.readiness = readinessStatus;

      if (readinessStatus === "source_extraction_failed") {
        const probe = await probeVilbliCounty({ professionSlug, countyCode });
        entry.action = "failed";
        entry.reason = `vilbli_unavailable: status=${probe.httpStatus} htmlLen=${probe.htmlLength} vb_map=${probe.hasVbMapData} VG1=${probe.stageCounts?.VG1 ?? 0}`;
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

      await runContourBOperationalIngest({
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

  const exitCode = failed > 0 && !isDryRun ? 1 : 0;
  return { exitCode, summary, results };
}
