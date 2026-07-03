import assert from "node:assert/strict";
import {
  buildVg2ProgrammeOptionId,
  buildVg2ProgrammeOptionsFromTruthRows,
  parseVg2ProgrammeOptionId,
  resolveVg2ProgrammeOptionsFromStep,
} from "../src/lib/vgs/vg2-programme-options.ts";

const truthRows = [
  {
    stage: "VG2",
    programSlug: "electrician-vg2-elenergi-vestland",
    programTitle: "VG2 Elenergi og ekom",
  },
  {
    stage: "VG2",
    programSlug: "electrician-vg2-elenergi-vestland",
    programTitle: "VG2 Elenergi og ekom",
  },
  {
    stage: "VG2",
    programSlug: "electrician-vg2-elenergi-alt-vestland",
    programTitle: "VG2 Alternativ",
  },
];

const programmes = buildVg2ProgrammeOptionsFromTruthRows(truthRows);
assert.equal(programmes.length, 2);
assert.equal(programmes[0]?.program_slug, "electrician-vg2-elenergi-alt-vestland");

const optionId = buildVg2ProgrammeOptionId("plumber-vg2-rorlegger-vestland");
assert.equal(parseVg2ProgrammeOptionId(optionId), "plumber-vg2-rorlegger-vestland");

const fromStep = resolveVg2ProgrammeOptionsFromStep({
  type: "programme_selection",
  title: "VG2",
  institution_name: null,
  education_level: "vg2",
  fit_band: "strong",
  program_slug: "plumber-vg2-rorlegger-vestland",
  program_title: "VG2 Rørlegger",
  current_profession_slug: "plumber",
  stage: "VG2",
  options: [
    {
      institution_id: "school-1",
      institution_name: "Skole A",
      program_slug: "plumber-vg2-rorlegger-vestland",
      program_title: "VG2 Rørlegger",
      verification_status: "verified",
    },
  ],
});

assert.equal(fromStep.length, 1);
assert.equal(fromStep[0]?.program_slug, "plumber-vg2-rorlegger-vestland");

console.log("OK vg2-programme-options smoke");
