#!/usr/bin/env node
/**
 * P3b Phase 1 — carpenter primary-route lærebedrift pilot invariants (no browser).
 *
 * Usage:
 *   npm run smoke:carpenter-primary-larebedrift-pilot
 */
import { isMainModule } from "./lib/is-main-module.mjs";

/** Keep in sync with `LAREBEDRIFT_PRIMARY_ROUTE_PILOT_COUNTY_CODES` in primary-route-larebedrift-pilot.ts */
const PILOT_COUNTIES = new Set(["15", "55"]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function childHomeCountyCodes(preferredMunicipalityCodes) {
  return Array.from(
    new Set(
      preferredMunicipalityCodes
        .map((code) => String(code ?? "").trim().slice(0, 2))
        .filter((code) => /^\d{2}$/.test(code))
    )
  );
}

function isPilotEligible(professionSlug, preferredMunicipalityCodes) {
  if (professionSlug !== "carpenter") return false;
  const homeCounties = childHomeCountyCodes(preferredMunicipalityCodes);
  if (homeCounties.length === 0) return false;
  return homeCounties.some((code) => PILOT_COUNTIES.has(code));
}

export function runCarpenterPrimaryLarebedriftPilotSmoke() {
  assert(isPilotEligible("carpenter", ["1507"]), "Møre kommune 1507 must be pilot-eligible");
  assert(isPilotEligible("carpenter", ["5501"]), "Troms kommune 5501 must be pilot-eligible");
  assert(
    !isPilotEligible("carpenter", ["1848"]),
    "Steigen 1848 (Nordland 18) must stay outside Phase 1 pilot"
  );
  assert(!isPilotEligible("mechanic", ["1507"]), "mechanic must not be pilot-eligible yet");
  assert(!isPilotEligible("carpenter", []), "missing home kommune must not be eligible");

  console.error("[smoke:carpenter-primary-larebedrift-pilot] pilot eligibility invariants: OK");
}

if (isMainModule(import.meta.url)) {
  try {
    runCarpenterPrimaryLarebedriftPilotSmoke();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
