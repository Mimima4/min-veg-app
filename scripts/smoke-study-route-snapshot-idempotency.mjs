#!/usr/bin/env node
/**
 * Study-route snapshot sync idempotency smoke (no browser).
 *
 * Regression guard for the curated-regional + outcome-filter alternative sync:
 * repeated recompute MUST NOT fail with a duplicate snapshot-version insert
 * (`study_route_snapshots_variant_version_uidx`) and MUST keep exactly one
 * current snapshot per non-archived variant.
 *
 * It actively re-runs the path we fixed:
 *   1. trigger recompute twice via the internal API (admin bypass), assert both ok
 *   2. assert exactly one is_current_snapshot per non-archived variant of the route
 *
 * Usage:
 *   npm run smoke:route-snapshot-idempotency
 *
 * Env (.env.local):
 *   E2E_CHILD_ID                 — Steigen child UUID (carpenter draft route)
 *   NEXT_PUBLIC_SUPABASE_URL     — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY    — service-role key (DB invariant read)
 *   BILLING_SYNC_SECRET          — internal secret for recompute admin bypass
 *   E2E_BASE_URL                 — app origin (default http://localhost:3000)
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { isMainModule } from "./lib/is-main-module.mjs";

const RECOMPUTE_RUNS = 2;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadFixture() {
  const scriptPath = path.join(
    process.cwd(),
    "scripts",
    "resolve-e2e-steigen-carpenter-fixture.mjs"
  );
  const output = execFileSync(process.execPath, ["--env-file=.env.local", scriptPath], {
    encoding: "utf8",
    cwd: process.cwd(),
  }).trim();
  return JSON.parse(output);
}

async function triggerRecompute({ baseUrl, secret, childId, routeId }) {
  const response = await fetch(
    `${baseUrl}/api/internal/routes/trigger-study-route-recompute`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": secret,
      },
      body: JSON.stringify({ childId, routeId, locale: "nb" }),
    }
  );
  const payload = await response.json().catch(() => null);
  return { status: response.status, payload };
}

async function assertSingleCurrentSnapshotPerVariant(supabase, routeId) {
  const { data: variants, error: variantsError } = await supabase
    .from("study_route_variants")
    .select("id, variant_label, variant_reason, status")
    .eq("route_id", routeId)
    .neq("status", "archived");

  if (variantsError) {
    throw new Error(`study_route_variants: ${variantsError.message}`);
  }

  assert((variants ?? []).length > 0, `route ${routeId} has no non-archived variants`);

  for (const variant of variants ?? []) {
    const { data: snapshots, error: snapshotsError } = await supabase
      .from("study_route_snapshots")
      .select("snapshot_version, is_current_snapshot")
      .eq("route_variant_id", variant.id);

    if (snapshotsError) {
      throw new Error(`study_route_snapshots (${variant.id}): ${snapshotsError.message}`);
    }

    const rows = snapshots ?? [];
    if (rows.length === 0) {
      continue;
    }

    const currentCount = rows.filter((row) => row.is_current_snapshot === true).length;
    assert(
      currentCount === 1,
      `variant ${variant.id} (${variant.variant_reason ?? "?"}) must have exactly one current snapshot, found ${currentCount}`
    );

    const versions = rows.map((row) => row.snapshot_version);
    const uniqueVersions = new Set(versions);
    assert(
      uniqueVersions.size === versions.length,
      `variant ${variant.id} has duplicate snapshot_version values`
    );
  }

  return (variants ?? []).length;
}

export async function runSnapshotIdempotencySmoke() {
  const baseUrl = (process.env.E2E_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = process.env.BILLING_SYNC_SECRET;

  assert(url && serviceKey, "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  assert(
    Boolean(secret),
    "Missing BILLING_SYNC_SECRET — required for recompute admin bypass in this smoke"
  );

  const fixture = loadFixture();
  assert(fixture.childId, "fixture.childId missing");
  assert(fixture.draftRouteId, "fixture.draftRouteId missing");

  const supabase = createClient(url, serviceKey);

  for (let attempt = 1; attempt <= RECOMPUTE_RUNS; attempt += 1) {
    const { status, payload } = await triggerRecompute({
      baseUrl,
      secret,
      childId: fixture.childId,
      routeId: fixture.draftRouteId,
    });
    assert(
      status === 200,
      `recompute attempt ${attempt} HTTP ${status} (is the app running at ${baseUrl}?)`
    );
    assert(
      payload?.ok === true,
      `recompute attempt ${attempt} not ok: ${payload?.error?.code ?? "?"} ${payload?.error?.message ?? ""}`.trim()
    );
    console.error(`[smoke:route-snapshot-idempotency] recompute ${attempt}/${RECOMPUTE_RUNS}: ok`);
  }

  const variantCount = await assertSingleCurrentSnapshotPerVariant(
    supabase,
    fixture.draftRouteId
  );

  console.error(
    `[smoke:route-snapshot-idempotency] invariants OK (${variantCount} variants, one current snapshot each)`
  );
}

if (isMainModule(import.meta.url)) {
  runSnapshotIdempotencySmoke()
    .then(() => {
      console.error("[smoke:route-snapshot-idempotency] PASS");
    })
    .catch((error) => {
      console.error(
        "[smoke:route-snapshot-idempotency] FAIL",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    });
}
