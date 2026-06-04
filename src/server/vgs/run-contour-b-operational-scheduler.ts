import "server-only";

import { spawnSync } from "node:child_process";
import path from "node:path";

export type RunContourBSchedulerOptions = {
  dryRun?: boolean;
  profession?: string;
  county?: string;
};

export type RunContourBSchedulerResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

/**
 * Runs the Node batch scheduler (classify → eligibility → ingest).
 * Intended for Vercel Cron / internal HTTP — not for route page load.
 */
export function runContourBOperationalSchedulerScript(
  options: RunContourBSchedulerOptions = {}
): RunContourBSchedulerResult {
  const scriptPath = path.join(
    process.cwd(),
    "scripts/run-contour-b-operational-scheduler.mjs"
  );
  const args: string[] = [];
  if (options.profession?.trim()) {
    args.push("--profession", options.profession.trim());
  }
  if (options.county?.trim()) {
    args.push("--county", options.county.trim());
  }
  if (options.dryRun) {
    args.push("--dry-run");
  }

  const result = spawnSync("node", [scriptPath, ...args], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf-8",
    maxBuffer: 20 * 1024 * 1024,
  });

  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}
