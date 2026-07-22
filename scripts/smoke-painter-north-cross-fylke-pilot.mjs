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
  "anleggsgartner",
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
    professionSlug: "anleggsgartner",
    homeFylkeCode: "56",
    neighborCountyCode: "55",
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
    .filter((row) => row.institutionIsPrivateSchool !== true)
    .map((row) =>
      row.stage === "VG2"
        ? { ...row, programSlug: PAINTER_NORTH_NABOFYLKE_VG2_PROGRAMME_SLUG }
        : row
    );
  return [...homeVg1, ...neighborFromVg2];
}

const mergedWithPrivateFiltered = mergeSplitTruthRows(
  [
    {
      stage: "VG1",
      county: "55",
      school: "Kvaløya",
      availabilityScope: "programme_in_school",
      institutionIsPrivateSchool: false,
    },
  ],
  [
    {
      stage: "VG2",
      county: "50",
      school: "Øya",
      availabilityScope: "programme_in_school",
      institutionIsPrivateSchool: true,
    },
    {
      stage: "VG2",
      county: "50",
      school: "Mære",
      availabilityScope: "programme_in_school",
      institutionIsPrivateSchool: false,
    },
  ]
);
assert.deepEqual(
  mergedWithPrivateFiltered.map((row) => row.school),
  ["Kvaløya", "Mære"],
  "P-7 merge must drop neighbor privatskole"
);

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

// Normalize must keep sibling programme_options (V.BA switcher on nabofylke alts).
function normalizeNabofylkeVg2Presentation(step, professionSlug, canonicalSlug) {
  const existing = Array.isArray(step.programme_options) ? step.programme_options : [];
  const bySlug = new Map();
  for (const option of existing) {
    if (option.program_slug) bySlug.set(option.program_slug, option);
  }
  bySlug.set(canonicalSlug, {
    program_slug: canonicalSlug,
    program_title: step.program_title ?? `VG2 ${professionSlug}`,
    profession_slug: professionSlug,
  });
  return {
    ...step,
    program_slug: canonicalSlug,
    programme_options: Array.from(bySlug.values()),
    options: (step.options ?? []).map((o) => ({ ...o, program_slug: canonicalSlug })),
  };
}

const normalized = normalizeNabofylkeVg2Presentation(
  {
    type: "programme_selection",
    stage: "VG2",
    program_title: "VG2 Klima, energi og miljøteknikk",
    programme_options: [
      {
        program_slug: "klima-vg2-klima-nabofylke",
        program_title: "VG2 Klima, energi og miljøteknikk",
        profession_slug: "klima",
      },
      {
        program_slug: "plumber-vg2-rorlegger-finnmark",
        program_title: "VG2 Rørleggerfaget",
        profession_slug: "plumber",
      },
      {
        program_slug: "painter-vg2-overflateteknikk-nabofylke",
        program_title: "VG2 Overflateteknikk",
        profession_slug: "painter",
      },
    ],
    options: [{ institution_name: "Kvaløya", program_slug: "klima-vg2-klima-troms" }],
  },
  "klima",
  "klima-vg2-klima-nabofylke"
);
assert.equal(normalized.programme_options.length, 3);
assert.ok(
  normalized.programme_options.some((o) => o.program_slug === "plumber-vg2-rorlegger-finnmark")
);
assert.ok(
  normalized.options.every((o) => o.program_slug === "klima-vg2-klima-nabofylke")
);

// Vilbli home VG2 continuation overlay: union adjacency ∪ allowlisted destination PSA.
function mergeWithContinuations(homeRows, neighborRows, continuationRows) {
  const byKey = new Map();
  for (const row of mergeSplitTruthRows(homeRows, [...neighborRows, ...continuationRows])) {
    const key = `${row.school}:${row.stage}`;
    if (!byKey.has(key)) byKey.set(key, row);
  }
  return Array.from(byKey.values());
}

function assessSplitEligible(homeRows, neighborRows, continuationRows = []) {
  const homeHasVg1 = homeRows.some(
    (row) => row.stage === "VG1" && row.availabilityScope !== LOSA_SCOPE
  );
  const homeHasVg2 = homeRows.some(
    (row) => row.stage === "VG2" && row.availabilityScope !== LOSA_SCOPE
  );
  const neighborHasVg2 = neighborRows.some(
    (row) =>
      row.stage === "VG2" &&
      row.availabilityScope !== LOSA_SCOPE &&
      row.institutionIsPrivateSchool !== true
  );
  const continuationHasVg2 = continuationRows.some(
    (row) =>
      row.stage === "VG2" &&
      row.availabilityScope !== LOSA_SCOPE &&
      row.institutionIsPrivateSchool !== true
  );
  return homeHasVg1 && !homeHasVg2 && (neighborHasVg2 || continuationHasVg2);
}

const tromsHome = [
  {
    stage: "VG1",
    county: "55",
    school: "Kvaløya",
    availabilityScope: "programme_in_school",
    institutionIsPrivateSchool: false,
  },
];
const emptyNeighbors = [];
const gjermundnesContinuation = [
  {
    stage: "VG2",
    county: "15",
    school: "Gjermundnes",
    availabilityScope: "programme_in_school",
    institutionIsPrivateSchool: false,
    programSlug: "anleggsgartner-vg2-anleggsgartner-more-og-romsdal",
  },
];

assert.equal(
  assessSplitEligible(tromsHome, emptyNeighbors, gjermundnesContinuation),
  true,
  "continuation-only VG2 must make P-7 eligible (Troms anleggsgartner)"
);
assert.equal(
  assessSplitEligible(tromsHome, emptyNeighbors, []),
  false,
  "no neighbor and no continuation → not eligible"
);

const unionMerged = mergeWithContinuations(
  tromsHome,
  [
    {
      stage: "VG2",
      county: "50",
      school: "Mære",
      availabilityScope: "programme_in_school",
      institutionIsPrivateSchool: false,
    },
  ],
  gjermundnesContinuation
);
assert.deepEqual(
  unionMerged.filter((row) => row.stage === "VG2").map((row) => row.school).sort(),
  ["Gjermundnes", "Mære"],
  "membership = adjacency ∪ Vilbli continuation"
);

// False positive guard: dense/local profession must not invent Møre bleed without allowlist.
assert.equal(
  assessSplitEligible(
    [
      {
        stage: "VG1",
        county: "55",
        school: "Home",
        availabilityScope: "programme_in_school",
      },
      {
        stage: "VG2",
        county: "55",
        school: "LocalVG2",
        availabilityScope: "programme_in_school",
      },
    ],
    emptyNeighbors,
    gjermundnesContinuation
  ),
  false,
  "home local VG2 present → continuation overlay must not open P-7"
);

const painterNeighborOnly = [
  {
    stage: "VG2",
    county: "18",
    school: "Bodø",
    availabilityScope: "programme_in_school",
    institutionIsPrivateSchool: false,
  },
];
assert.equal(
  assessSplitEligible(tromsHome, painterNeighborOnly, []),
  true,
  "adjacency-only still eligible without continuations"
);
assert.equal(
  mergeWithContinuations(tromsHome, painterNeighborOnly, []).some(
    (row) => row.school === "Gjermundnes"
  ),
  false,
  "without allowlist rows, Møre schools must not appear"
);

console.error("[smoke:painter-north-cross-fylke] PASS");
