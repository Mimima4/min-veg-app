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
assert.deepEqual(parseRegionalProgrammeSlug("painter-vg2-overflateteknikk-vestland"), {
  professionPrefix: "painter",
  regionSuffix: "vestland",
});
assert.deepEqual(parseRegionalProgrammeSlug("anleggsteknikk-vg2-anleggsteknikk-vestland"), {
  professionPrefix: "anleggsteknikk",
  regionSuffix: "vestland",
});

assert.equal(
  resolveProfessionSlugFromProgramSlug("plumber-vg2-rorlegger-vestland"),
  "plumber"
);
assert.equal(
  resolveProfessionSlugFromProgramSlug("painter-vg2-overflateteknikk-vestland"),
  "painter"
);
assert.equal(
  resolveProfessionSlugFromProgramSlug("anleggsteknikk-vg2-anleggsteknikk-vestland"),
  "anleggsteknikk"
);
assert.equal(
  resolveProfessionSlugFromProgramSlug("carpenter-vg2-tomrer-trondelag"),
  "carpenter"
);

assert.equal(isVbaSharedVg1Profession("carpenter"), true);
assert.equal(isVbaSharedVg1Profession("plumber"), true);
assert.equal(isVbaSharedVg1Profession("painter"), true);
assert.equal(isVbaSharedVg1Profession("anleggsteknikk"), true);
assert.equal(isVbaSharedVg1Profession("klima"), true);
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
    fromProfessionSlug: "painter",
    toProfessionSlug: "carpenter",
  }),
  true
);
assert.equal(
  isVbaSharedVg1CrossProfessionSwitch({
    fromProfessionSlug: "anleggsteknikk",
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
