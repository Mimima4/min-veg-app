#!/usr/bin/env node
import assert from "node:assert/strict";

const PAINTER_NORTH_HOME_FYLKE_CODES = new Set(["55", "56"]);

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

function painterNorthCrossFylkeVariantId(neighborCountyCode) {
  return `painter-north-overflateteknikk-${neighborCountyCode}`;
}

function isPainterNorthCrossFylkeEligible({ professionSlug, homeFylkeCode, neighborCountyCode }) {
  if (professionSlug !== "painter") return false;
  if (!PAINTER_NORTH_HOME_FYLKE_CODES.has(homeFylkeCode)) return false;
  const rings = deriveFylkeAdjacencyRings([homeFylkeCode]);
  return rings.flat().includes(neighborCountyCode);
}

assert.equal(painterNorthCrossFylkeVariantId("18"), "painter-north-overflateteknikk-18");
assert.equal(isPainterNorthCrossFylkeEligible({ professionSlug: "painter", homeFylkeCode: "56", neighborCountyCode: "18" }), true);
assert.equal(isPainterNorthCrossFylkeEligible({ professionSlug: "painter", homeFylkeCode: "56", neighborCountyCode: "50" }), true);
assert.equal(isPainterNorthCrossFylkeEligible({ professionSlug: "painter", homeFylkeCode: "03", neighborCountyCode: "18" }), false);
assert.equal(isPainterNorthCrossFylkeEligible({ professionSlug: "carpenter", homeFylkeCode: "56", neighborCountyCode: "18" }), false);

// P-7 sync runs for all Contour B professions so stale curated variants are pruned on recompute.
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

function mergeSplitTruthRows(homeRows, neighborRows) {
  const homeVg1 = homeRows.filter((row) => row.stage === "VG1");
  const neighborFromVg2 = neighborRows.filter((row) => row.stage !== "VG1");
  return [...homeVg1, ...neighborFromVg2];
}

const merged = mergeSplitTruthRows(
  [
    { stage: "VG1", county: "55", school: "Kvaløya" },
    { stage: "VG2", county: "55", school: "should-drop" },
  ],
  [
    { stage: "VG1", county: "18", school: "neighbor-vg1-drop" },
    { stage: "VG2", county: "18", school: "Bodø" },
  ]
);
assert.equal(merged.length, 2);
assert.equal(merged[0].school, "Kvaløya");
assert.equal(merged[1].school, "Bodø");

console.error("[smoke:painter-north-cross-fylke] PASS");
