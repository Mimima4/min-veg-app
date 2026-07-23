#!/usr/bin/env node
/**
 * P3b — carpenter primary-route lærebedrift eligibility invariants (no browser).
 *
 * Usage:
 *   npm run smoke:carpenter-primary-larebedrift-pilot
 */
import { isMainModule } from "./lib/is-main-module.mjs";

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
  const slug = String(professionSlug ?? "").trim();
  if (!["carpenter", "electrician", "mechanic", "plumber", "painter", "anleggsteknikk", "klima", "murer", "anleggsgartner", "treteknikk"].includes(slug)) return false;
  return childHomeCountyCodes(preferredMunicipalityCodes).length > 0;
}

export function runCarpenterPrimaryLarebedriftPilotSmoke() {
  assert(isPilotEligible("carpenter", ["1507"]), "Møre kommune 1507 must be eligible");
  assert(isPilotEligible("carpenter", ["5501"]), "Troms kommune 5501 must be eligible");
  assert(
    isPilotEligible("carpenter", ["1848"]),
    "Steigen 1848 (Nordland) must be eligible in Phase 2 nationwide rollout"
  );
  assert(isPilotEligible("carpenter", ["0301"]), "Oslo must be eligible");
  assert(isPilotEligible("electrician", ["0301"]), "Oslo electrician must be eligible");
  assert(isPilotEligible("electrician", ["5601"]), "Finnmark electrician must be eligible");
  assert(isPilotEligible("mechanic", ["4601"]), "Vestland mechanic must be eligible");
  assert(isPilotEligible("mechanic", ["0301"]), "Oslo mechanic must be eligible");
  assert(isPilotEligible("plumber", ["1848"]), "Nordland plumber must be eligible");
  assert(isPilotEligible("plumber", ["0301"]), "Oslo plumber must be eligible");
  assert(isPilotEligible("painter", ["4601"]), "Vestland painter must be eligible");
  assert(isPilotEligible("painter", ["0301"]), "Oslo painter must be eligible");
  assert(isPilotEligible("anleggsteknikk", ["4601"]), "Vestland anleggsteknikk must be eligible");
  assert(isPilotEligible("anleggsteknikk", ["5601"]), "Finnmark anleggsteknikk must be eligible");
  assert(!isPilotEligible("anleggsteknikk", []), "anleggsteknikk without home kommune must not be eligible");
  assert(isPilotEligible("klima", ["4601"]), "Vestland klima must be eligible");
  assert(isPilotEligible("klima", ["0301"]), "Oslo klima must be eligible");
  assert(!isPilotEligible("klima", []), "klima without home kommune must not be eligible");
  assert(isPilotEligible("murer", ["4601"]), "Vestland murer must be eligible");
  assert(isPilotEligible("murer", ["5601"]), "Finnmark murer must be eligible");
  assert(!isPilotEligible("murer", []), "murer without home kommune must not be eligible");
  assert(isPilotEligible("anleggsgartner", ["4601"]), "Vestland anleggsgartner must be eligible");
  assert(isPilotEligible("anleggsgartner", ["5601"]), "Finnmark anleggsgartner must be eligible");
  assert(!isPilotEligible("anleggsgartner", []), "anleggsgartner without home kommune must not be eligible");
  assert(isPilotEligible("treteknikk", ["4601"]), "Vestland treteknikk must be eligible");
  assert(isPilotEligible("treteknikk", ["5601"]), "Finnmark treteknikk must be eligible");
  assert(!isPilotEligible("treteknikk", []), "treteknikk without home kommune must not be eligible");
  assert(!isPilotEligible("painter", []), "painter without home kommune must not be eligible");
  assert(!isPilotEligible("mechanic", []), "mechanic without home kommune must not be eligible");
  assert(!isPilotEligible("electrician", []), "electrician without home kommune must not be eligible");
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
