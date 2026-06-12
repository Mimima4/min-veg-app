/**
 * Unified scheduled VGS ops (home IP): Contour B relay → Contour A green → stale-draft batch.
 *
 * Env: .env.local typical — VERCEL_APP_URL, CRON_SECRET, Supabase service role.
 *
 *   node scripts/run-vgs-scheduled-ops.mjs [--dry-run]
 *   node scripts/run-vgs-scheduled-ops.mjs --skip-relay --skip-green-a   # batch only
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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

function runNodeScript(scriptName, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(ROOT, "scripts", scriptName);
    const child = spawn(process.execPath, [scriptPath, ...extraArgs], {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptName} exited with code ${code}`));
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = String(args["dry-run"] ?? "").toLowerCase() === "true";
  const dryRunFlag = dryRun ? ["--dry-run"] : [];
  const skipRelay = String(args["skip-relay"] ?? "").toLowerCase() === "true";
  const skipGreenA = String(args["skip-green-a"] ?? "").toLowerCase() === "true";
  const skipStaleBatch = String(args["skip-stale-batch"] ?? "").toLowerCase() === "true";

  const steps = [];

  if (!skipRelay) {
    steps.push({
      name: "contour-b-relay",
      run: () =>
        runNodeScript("relay-contour-b-vilbli-to-production.mjs", [...dryRunFlag]),
    });
  }

  if (!skipGreenA) {
    steps.push({
      name: "contour-a-green",
      run: () => runNodeScript("run-contour-a-green-counties.mjs", [...dryRunFlag]),
    });
  }

  if (!skipStaleBatch) {
    steps.push({
      name: "stale-draft-batch",
      run: () =>
        runNodeScript("run-stale-draft-recompute-batch.mjs", [
          ...dryRunFlag,
          ...(dryRun ? ["--force"] : []),
        ]),
    });
  }

  if (steps.length === 0) {
    throw new Error("All steps skipped — nothing to run");
  }

  console.error(`[scheduled-ops] starting ${steps.length} step(s) dryRun=${dryRun}`);

  for (const step of steps) {
    console.error(`[scheduled-ops] → ${step.name}`);
    await step.run();
  }

  console.error("[scheduled-ops] complete");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
