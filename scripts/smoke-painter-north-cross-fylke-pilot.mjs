#!/usr/bin/env node
import assert from "node:assert/strict";

const NORTH_CROSS_FYLKE_HOME_FYLKE_CODES = new Set(["18", "55", "56"]);
const NORTH_CROSS_FYLKE_NEIGHBOR_CODES = ["18", "50", "55"];
const SUPPORTED = new Set([
  "electrician",
  "mechanic",
  "carpenter",
  "plumber",
  "painter",
  "anleggsteknikk",
  "klima",
  "murer",
]);

const NORWAY_FYLKE_ADJACENCY_GRAPH = {
  "18": ["50", "55"],
  "50": ["15", "18", "34", "46"],
  "55": ["18", "56"],
  "56": ["55"],
};

function deriveFylkeAdjacencyRings(homeFylkeCodes) {
  const normalizedHomes = Array.from(new Set(homeFylkeCodes)).sort();
  const visited = new Set(normalizedHomes);
  let frontier = normalizedHomes;
  const rings = [];
  while (frontier.length > 0) {
    const next = new Set();
    for (const fylkeCode of frontier) {
      for (const adjacentCode of NORWAY_FYLKE_ADJACENCY_GRAPH[fylkeCode] ?? []) {
        if (!visited.has(adjacentCode)) {
          next.add(adjacentCode);
        }
      }
    }
    const nextRing = Array.from(next).sort();
    if (nextRing.length === 0) {
      break;
    }
    rings.push(nextRing);
    for (const code of nextRing) {
      visited.add(code);
    }
    frontier = nextRing;
  }
  return rings;
}

function nabofylkeVariantId(professionSlug) {
  if (professionSlug === "painter") {
    return "painter-north-overflateteknikk-nabofylke";
  }
  return `${professionSlug}-north-vg2-nabofylke`;
}

function isNorthCrossFylkeEligible({ professionSlug, homeFylkeCode, neighborCountyCode }) {
  if (!SUPPORTED.has(professionSlug)) return false;
  if (!NORTH_CROSS_FYLKE_HOME_FYLKE_CODES.has(homeFylkeCode)) return false;
  if (homeFylkeCode === neighborCountyCode) return false;
  if (!NORTH_CROSS_FYLKE_NEIGHBOR_CODES.includes(neighborCountyCode)) return false;
  const rings = deriveFylkeAdjacencyRings([homeFylkeCode]);
  return rings.flat().includes(neighborCountyCode);
}

assert.equal(nabofylkeVariantId("painter"), "painter-north-overflateteknikk-nabofylke");
assert.equal(nabofylkeVariantId("klima"), "klima-north-vg2-nabofylke");
assert.equal(
  isNorthCrossFylkeEligible({
    professionSlug: "painter",
    homeFylkeCode: "56",
    neighborCountyCode: "18",
  }),
  true
);
assert.equal(
  isNorthCrossFylkeEligible({
    professionSlug: "klima",
    homeFylkeCode: "56",
    neighborCountyCode: "55",
  }),
  true
);
assert.equal(
  isNorthCrossFylkeEligible({
    professionSlug: "klima",
    homeFylkeCode: "56",
    neighborCountyCode: "50",
  }),
  true
);
assert.equal(
  isNorthCrossFylkeEligible({
    professionSlug: "murer",
    homeFylkeCode: "18",
    neighborCountyCode: "55",
  }),
  true
);
assert.equal(
  isNorthCrossFylkeEligible({
    professionSlug: "murer",
    homeFylkeCode: "18",
    neighborCountyCode: "50",
  }),
  true
);
assert.equal(
  isNorthCrossFylkeEligible({
    professionSlug: "klima",
    homeFylkeCode: "03",
    neighborCountyCode: "18",
  }),
  false
);
assert.equal(
  isNorthCrossFylkeEligible({
    professionSlug: "klima",
    homeFylkeCode: "55",
    neighborCountyCode: "55",
  }),
  false
);

function shouldSyncCuratedRegionalAlternatives({ hasContourBProfessionLinks }) {
  return hasContourBProfessionLinks;
}

assert.equal(
  shouldSyncCuratedRegionalAlternatives({
    hasContourBProfessionLinks: true,
    contourBTruthPathUsed: false,
    professionSlug: "painter",
    homeFylkeCode: "55",
  }),
  true
);
assert.equal(
  shouldSyncCuratedRegionalAlternatives({
    hasContourBProfessionLinks: true,
    contourBTruthPathUsed: false,
    professionSlug: "painter",
    homeFylkeCode: "33",
  }),
  true
);
assert.equal(
  shouldSyncCuratedRegionalAlternatives({
    hasContourBProfessionLinks: false,
    contourBTruthPathUsed: false,
    professionSlug: "painter",
    homeFylkeCode: "55",
  }),
  false
);

const LOSA_SCOPE = "losa_fjern_delivery_municipality";
const PAINTER_NORTH_NABOFYLKE_VG2_PROGRAMME_SLUG =
  "painter-vg2-overflateteknikk-nabofylke";

function mergeSplitTruthRows(homeRows, neighborRows) {
  const homeVg1 = homeRows.filter((row) => row.stage === "VG1");
  const neighborFromVg2 = neighborRows
    .filter((row) => row.stage !== "VG1" && row.availabilityScope !== LOSA_SCOPE)
    .map((row) =>
      row.stage === "VG2"
        ? { ...row, programSlug: PAINTER_NORTH_NABOFYLKE_VG2_PROGRAMME_SLUG }
        : row
    );
  return [...homeVg1, ...neighborFromVg2];
}

const merged = mergeSplitTruthRows(
  [
    { stage: "VG1", county: "55", school: "Kvaløya", availabilityScope: "programme_in_school" },
    { stage: "VG2", county: "55", school: "should-drop", availabilityScope: "programme_in_school" },
  ],
  [
    {
      stage: "VG1",
      county: "18",
      school: "neighbor-vg1-drop",
      availabilityScope: "programme_in_school",
    },
    {
      stage: "VG2",
      county: "18",
      school: "Bodø",
      availabilityScope: "programme_in_school",
      programSlug: "painter-vg2-overflateteknikk-nordland",
    },
  ]
);
assert.equal(merged.length, 2);
assert.equal(merged[0].school, "Kvaløya");
assert.equal(merged[1].school, "Bodø");
assert.equal(merged[1].programSlug, PAINTER_NORTH_NABOFYLKE_VG2_PROGRAMME_SLUG);

const mergedWithLosaAndMultiVg2 = mergeSplitTruthRows(
  [
    { stage: "VG1", county: "56", school: "Kirkenes", availabilityScope: "programme_in_school" },
    { stage: "VG1", county: "56", school: "LOSA Alta", availabilityScope: LOSA_SCOPE },
  ],
  [
    {
      stage: "VG2",
      county: "18",
      school: "Bodø",
      availabilityScope: "programme_in_school",
      programSlug: "painter-vg2-overflateteknikk-nordland",
    },
    {
      stage: "VG2",
      county: "50",
      school: "Charlottenlund",
      availabilityScope: "programme_in_school",
      programSlug: "painter-vg2-overflateteknikk-trondelag",
    },
  ]
);
assert.equal(mergedWithLosaAndMultiVg2.length, 4);
assert.equal(
  mergedWithLosaAndMultiVg2.filter((row) => row.availabilityScope === LOSA_SCOPE).length,
  1
);
assert.ok(
  mergedWithLosaAndMultiVg2
    .filter((row) => row.stage === "VG2")
    .every((row) => row.programSlug === PAINTER_NORTH_NABOFYLKE_VG2_PROGRAMME_SLUG)
);

console.error("[smoke:painter-north-cross-fylke] PASS");
