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
assert.deepEqual(parseRegionalProgrammeSlug("maskin-og-kranforer-vg2-anleggsteknikk-vestland"), {
  professionPrefix: "maskin-og-kranforer",
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
  resolveProfessionSlugFromProgramSlug("maskin-og-kranforer-vg2-anleggsteknikk-vestland"),
  "maskin-og-kranforer"
);
assert.equal(
  resolveProfessionSlugFromProgramSlug("carpenter-vg2-tomrer-trondelag"),
  "carpenter"
);

assert.equal(isVbaSharedVg1Profession("carpenter"), true);
assert.equal(isVbaSharedVg1Profession("plumber"), true);
assert.equal(isVbaSharedVg1Profession("painter"), true);
assert.equal(isVbaSharedVg1Profession("maskin-og-kranforer"), true);
assert.equal(isVbaSharedVg1Profession("platearbeider-og-sveiser"), true);
assert.equal(isVbaSharedVg1Profession("murer"), true);
assert.equal(isVbaSharedVg1Profession("anleggsgartner"), true);
assert.equal(isVbaSharedVg1Profession("snekker"), true);
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
    fromProfessionSlug: "maskin-og-kranforer",
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
