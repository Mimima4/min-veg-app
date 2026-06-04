/**
 * Contour B operational ingest: when Contour A would ABORT or readiness is not green,
 * write only NSR-verified, non-LOSA Vilbli rows into programme_school_availability.
 *
 * Usage:
 *   node scripts/run-contour-b-operational-ingest.mjs --profession <slug> --county <code> [--dry-run]
 *   (any profession in `vgs-path-definitions.mjs`, e.g. electrician)
 */
import { spawnSync } from "node:child_process";
import { assessContourBOperationalEligibility } from "./lib/contour-b-operational-eligibility.mjs";

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

function runNodeScript(scriptPath, scriptArgs) {
  const result = spawnSync("node", [scriptPath, ...scriptArgs], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf-8",
  });
  if (result.status !== 0) {
    throw new Error(
      `Script failed: node ${scriptPath} ${scriptArgs.join(" ")}\n${result.stderr || result.stdout}`
    );
  }
  const output = result.stdout.trim();
  const jsonStart = output.indexOf("{");
  if (jsonStart < 0) {
    throw new Error(`Expected JSON from ${scriptPath}`);
  }
  return JSON.parse(output.slice(jsonStart));
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  const profession = String(args.profession ?? "").trim();
  const county = String(args.county ?? "").trim();
  const isDryRun = String(args["dry-run"] ?? "").toLowerCase() === "true";

  if (!profession || !county) {
    throw new Error(
      "Usage: node scripts/run-contour-b-operational-ingest.mjs --profession <slug> --county <code> [--dry-run]"
    );
  }

  const readiness = runNodeScript("scripts/classify-vgs-truth-readiness.mjs", [
    "--profession",
    profession,
    "--county",
    county,
  ]);

  const eligibility = assessContourBOperationalEligibility({
    countyCode: county,
    professionSlug: profession,
    readinessStatus: readiness.status,
  });

  if (!eligibility.eligible) {
    throw new Error(
      `Contour B operational ingest not applicable: ${eligibility.reason}` +
        (eligibility.readinessStatus ? ` (readiness=${eligibility.readinessStatus})` : "")
    );
  }

  console.error(
    `[contour-b-operational] county=${county} profession=${profession} readiness=${readiness.status}`
  );

  const pipelineArgs = [
    "scripts/run-vgs-truth-pipeline.mjs",
    "--profession",
    profession,
    "--county",
    county,
    "--contour-b-partial",
  ];
  if (isDryRun) {
    pipelineArgs.push("--dry-run");
  }

  const result = spawnSync("node", pipelineArgs, {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run();
