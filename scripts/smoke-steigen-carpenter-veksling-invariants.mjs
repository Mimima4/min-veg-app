#!/usr/bin/env node
/**
 * Steigen carpenter veksling invariants smoke (no browser).
 *
 * Usage:
 *   npm run smoke:steigen-carpenter-veksling
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { isMainModule } from "./lib/is-main-module.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadFixture() {
  const scriptPath = path.join(process.cwd(), "scripts", "resolve-e2e-steigen-carpenter-fixture.mjs");
  const output = execFileSync(process.execPath, ["--env-file=.env.local", scriptPath], {
    encoding: "utf8",
    cwd: process.cwd(),
  }).trim();
  return JSON.parse(output);
}

export function runSteigenCarpenterVekslingSmoke() {
  const fixture = loadFixture();

  assert(fixture.childId, "fixture.childId missing");
  assert(fixture.draftRouteId, "fixture.draftRouteId missing");
  assert(fixture.vekslingVariantId, "fixture.vekslingVariantId missing");
  assert(
    fixture.steigenMunicipalityCode === "1848",
    "fixture must target Steigen municipality 1848"
  );
  assert(
    fixture.hubInstitutionName === "Nord-Salten vgs avd Steigen",
    "fixture hub institution must match curated Steigen hub"
  );
  assert(
    fixture.employerOptionId === "employer-steigen-carpenter-local-bedrift",
    "fixture employer option id must match curated employer table"
  );
  assert(
    fixture.vekslingVariantLabel === "Veksling / Steigenmodellen",
    "fixture veksling variant label must match pilot badge copy"
  );

  console.error("[smoke:steigen-carpenter-veksling] fixture invariants: OK");
  console.error(
    `[smoke:steigen-carpenter-veksling] draft=${fixture.draftRouteId} vekslingVariant=${fixture.vekslingVariantId}`
  );
  if (fixture.savedVekslingRouteId) {
    console.error(
      `[smoke:steigen-carpenter-veksling] saved veksling route=${fixture.savedVekslingRouteId}`
    );
  }
}

if (isMainModule(import.meta.url)) {
  try {
    runSteigenCarpenterVekslingSmoke();
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}
