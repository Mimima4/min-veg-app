/**
 * P06-CLOSURE Block F regression smoke.
 *
 * 1) CLI must reject --contour-b-partial on run-vgs-truth-pipeline (Contour B via ingest only).
 * 2) Contour B operational ingest dry-run exits 0 for Finnmark 56 (LOSA partial path).
 *
 * Usage:
 *   set -a && source .env.local && set +a
 *   node scripts/smoke-contour-b-regression.mjs
 */
import { spawnSync } from "node:child_process";
import { isMainModule } from "./lib/is-main-module.mjs";

function assertCliContourBPartialRejected() {
  const result = spawnSync(
    process.execPath,
    [
      "scripts/run-vgs-truth-pipeline.mjs",
      "--profession",
      "electrician",
      "--county",
      "56",
      "--contour-b-partial",
      "--dry-run",
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL:
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://smoke.example.invalid",
        SUPABASE_SERVICE_ROLE_KEY:
          process.env.SUPABASE_SERVICE_ROLE_KEY ?? "smoke-key",
      },
    }
  );

  const combined = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  if (result.status === 0) {
    throw new Error(
      "Expected run-vgs-truth-pipeline to reject --contour-b-partial on CLI, but it exited 0"
    );
  }
  if (!combined.includes("CLI --contour-b-partial is not allowed")) {
    throw new Error(
      `Expected contour-b-partial CLI guard message, got exit=${result.status}: ${combined.slice(0, 400)}`
    );
  }
  console.error("[smoke] contour-b-partial CLI guard: OK");
}

function assertOperationalIngestDryRun() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — source .env.local before smoke"
    );
  }

  const result = spawnSync(
    process.execPath,
    [
      "scripts/run-contour-b-operational-ingest.mjs",
      "--profession",
      "electrician",
      "--county",
      "56",
      "--dry-run",
    ],
    {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: "pipe",
    }
  );

  if (result.status !== 0) {
    const combined = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    throw new Error(
      `Contour B operational ingest dry-run failed (exit=${result.status}): ${combined.slice(-800)}`
    );
  }
  console.error("[smoke] contour-b operational ingest dry-run (56): OK");
}

function assertRouteTruthInvariantSmoke() {
  const result = spawnSync(process.execPath, ["scripts/smoke-route-truth-invariants.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status !== 0) {
    const combined = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    throw new Error(`Route truth invariant smoke failed:\n${combined.slice(-800)}`);
  }
  console.error("[smoke] route-truth invariants: OK");
}

async function run() {
  assertCliContourBPartialRejected();
  assertOperationalIngestDryRun();
  assertRouteTruthInvariantSmoke();
  const vg3CatalogResult = spawnSync(process.execPath, ["scripts/smoke-vg3-catalog-status.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "pipe",
  });
  if (vg3CatalogResult.status !== 0) {
    const combined = `${vg3CatalogResult.stdout ?? ""}${vg3CatalogResult.stderr ?? ""}`;
    throw new Error(`VG3 catalog status smoke failed:\n${combined.slice(-800)}`);
  }
  console.error("[smoke] vg3-catalog status: OK");
  console.error("[smoke] contour-b regression: PASS");
}

if (isMainModule(import.meta.url)) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
