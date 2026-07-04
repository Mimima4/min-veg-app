#!/usr/bin/env node
/**
 * Smoke: V.BA VG2 cross-profession slug parsing and switch eligibility.
 */
import assert from "node:assert/strict";
import {
  extractRegionalCountySuffixFromProgramSlugs,
  isVbaSharedVg1CrossProfessionSwitch,
  isVbaSharedVg1Profession,
  parseRegionalProgrammeSlug,
  resolveProfessionSlugFromProgramSlug,
} from "../src/lib/vgs/vg2-cross-profession.ts";

assert.deepEqual(parseRegionalProgrammeSlug("carpenter-vg2-tomrer-vestland"), {
  professionPrefix: "carpenter",
  regionSuffix: "vestland",
});
assert.deepEqual(parseRegionalProgrammeSlug("plumber-vg2-rorlegger-vestland"), {
  professionPrefix: "plumber",
  regionSuffix: "vestland",
});

assert.equal(
  resolveProfessionSlugFromProgramSlug("plumber-vg2-rorlegger-vestland"),
  "plumber"
);
assert.equal(
  resolveProfessionSlugFromProgramSlug("carpenter-vg2-tomrer-trondelag"),
  "carpenter"
);

assert.equal(isVbaSharedVg1Profession("carpenter"), true);
assert.equal(isVbaSharedVg1Profession("plumber"), true);
assert.equal(isVbaSharedVg1Profession("electrician"), false);

assert.equal(
  isVbaSharedVg1CrossProfessionSwitch({
    fromProfessionSlug: "carpenter",
    toProfessionSlug: "plumber",
  }),
  true
);
assert.equal(
  isVbaSharedVg1CrossProfessionSwitch({
    fromProfessionSlug: "carpenter",
    toProfessionSlug: "carpenter",
  }),
  false
);
assert.equal(
  isVbaSharedVg1CrossProfessionSwitch({
    fromProfessionSlug: "electrician",
    toProfessionSlug: "mechanic",
  }),
  false
);

assert.equal(
  extractRegionalCountySuffixFromProgramSlugs([
    "carpenter-vg1-bygg-vestland",
    "carpenter-vg2-tomrer-vestland",
  ]),
  "vestland"
);

console.log("OK vg2-cross-profession smoke");
