#!/usr/bin/env node
/**
 * Smoke: P-8 anleggsteknikk sparse national VG2 alternative gate logic.
 * No DB required — asserts the sparse PSA gate, relocation gating, slug canonicalization,
 * and the "schools outside primary scope" geography filter from the owner records.
 *
 * The real sparse-VG2 eligibility module is imported directly (it has no path-alias imports).
 * Geography scope + merge are mirrored here to stay DB-free (see school-geography-scope smoke).
 */
import assert from "node:assert/strict";
import {
  ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_LABEL_NB,
  ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_ID,
  ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG,
  SPARSE_VG2_NATIONAL_PSA_THRESHOLD,
  assessSparseVg2AlternativeEligibility,
  isSparseVg2NationalPsaCountEligible,
  isSparseVg2PilotProfession,
} from "../src/lib/vgs/sparse-vg2-alternative-eligibility.ts";

// --- sparse PSA gate (owner §P8-7: national_vg2_psa_count ≤ 50) ---
assert.equal(SPARSE_VG2_NATIONAL_PSA_THRESHOLD, 50);
assert.equal(isSparseVg2NationalPsaCountEligible(0), false, "zero PSA → gate off");
assert.equal(isSparseVg2NationalPsaCountEligible(35), true, "sparse count → gate on");
assert.equal(isSparseVg2NationalPsaCountEligible(50), true, "at threshold → gate on");
assert.equal(isSparseVg2NationalPsaCountEligible(120), false, "dense count → gate off");

// --- pilot profession gate (anleggsteknikk only) ---
assert.equal(isSparseVg2PilotProfession("anleggsteknikk"), true);
assert.equal(isSparseVg2PilotProfession("carpenter"), false);
assert.equal(isSparseVg2PilotProfession("painter"), false);

// carpenter never activates even at a low count; anleggsteknikk gated by count.
assert.equal(
  assessSparseVg2AlternativeEligibility({ professionSlug: "carpenter", nationalVg2PsaCount: 30 }),
  false
);
assert.equal(
  assessSparseVg2AlternativeEligibility({ professionSlug: "anleggsteknikk", nationalVg2PsaCount: 30 }),
  true
);
assert.equal(
  assessSparseVg2AlternativeEligibility({ professionSlug: "anleggsteknikk", nationalVg2PsaCount: 200 }),
  false
);

// --- canonical slug + variant identity (owner §P8-8 / UI contract) ---
assert.equal(
  ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG,
  "anleggsteknikk-vg2-anleggsteknikk-nasjonalt"
);
assert.equal(
  ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_ID,
  "anleggsteknikk-sparse-vg2-andre-steder"
);
assert.equal(ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_LABEL_NB, "Anleggsteknikk — VG2 andre steder");

// --- geography scope (mirrors school-geography-scope.ts; contract §4.1/§4.2) ---
const NORTH_HOME = new Set(["55", "56"]);
const NORTH_FRIENDLY = new Set(["18"]);

function resolvePrimaryAllowedFylke({ homeFylke, sparseGate }) {
  if (!sparseGate) {
    return new Set(homeFylke);
  }
  const allowed = new Set(homeFylke);
  if (homeFylke.some((c) => NORTH_HOME.has(c))) {
    for (const c of NORTH_FRIENDLY) allowed.add(c);
  }
  return allowed;
}

function allowNationalSparseAlternative(relocation) {
  return relocation === "maybe" || relocation === "yes";
}

// relocation gating: no/null → omit; maybe/yes → allow.
assert.equal(allowNationalSparseAlternative("no"), false);
assert.equal(allowNationalSparseAlternative(null), false);
assert.equal(allowNationalSparseAlternative("maybe"), true);
assert.equal(allowNationalSparseAlternative("yes"), true);

// North primary scope widens to include Nordland (18) but not Agder/Vestland.
const northPrimary = resolvePrimaryAllowedFylke({ homeFylke: ["56"], sparseGate: true });
assert.ok(northPrimary.has("56"));
assert.ok(northPrimary.has("18"));
assert.ok(!northPrimary.has("42"));

// Non-north primary scope stays home-only.
const vestPrimary = resolvePrimaryAllowedFylke({ homeFylke: ["46"], sparseGate: true });
assert.deepEqual([...vestPrimary], ["46"]);

// --- national VG2 rows OUTSIDE primary scope (requirement #8) ---
function selectNationalVg2OutsidePrimary(nationalRows, primaryAllowed) {
  return nationalRows.filter(
    (row) => row.stage === "VG2" && row.county && !primaryAllowed.has(row.county)
  );
}

const NATIONAL_VG2 = [
  { stage: "VG2", county: "56", school: "Kirkenes" },
  { stage: "VG2", county: "18", school: "Bodø" },
  { stage: "VG2", county: "46", school: "Voss" },
  { stage: "VG2", county: "42", school: "Sør-Norge" },
  { stage: "VG2", county: "11", school: "Stavanger" },
];

// Finnmark (north) family: 56 + 18 are in primary picker → alternative shows only 46/42/11.
const finnmarkOutside = selectNationalVg2OutsidePrimary(NATIONAL_VG2, northPrimary);
assert.deepEqual(
  finnmarkOutside.map((r) => r.county).sort(),
  ["11", "42", "46"]
);

// North primary must ALSO load Nordland VG2 into primary (not only exclude from alt) —
// otherwise Fauske vanishes from both layers (regression covered by enrich helper).
const northPrimaryExtraFylke = [...northPrimary].filter((c) => c !== "56");
assert.deepEqual(northPrimaryExtraFylke, ["18"]);

// Vestland family: only 46 in primary → alternative shows all others.
const vestOutside = selectNationalVg2OutsidePrimary(NATIONAL_VG2, vestPrimary);
assert.deepEqual(
  vestOutside.map((r) => r.county).sort(),
  ["11", "18", "42", "56"]
);

// --- merge canonicalizes VG2 slug (owner §P8-8) ---
function mergeSparseVg2(homeVg1Rows, nationalVg2Outside) {
  const homeVg1 = homeVg1Rows.filter((row) => row.stage === "VG1");
  const nationalVg2 = nationalVg2Outside
    .filter((row) => row.stage === "VG2")
    .map((row) => ({ ...row, programSlug: ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG }));
  return [...homeVg1, ...nationalVg2];
}

const merged = mergeSparseVg2(
  [{ stage: "VG1", county: "46", school: "Voss VG1", programSlug: "anleggsteknikk-vg1-bygg-vestland" }],
  vestOutside
);
assert.equal(merged[0].stage, "VG1");
assert.ok(
  merged
    .filter((row) => row.stage === "VG2")
    .every((row) => row.programSlug === ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG),
  "all VG2 rows canonicalized to national slug"
);
assert.equal(merged.filter((row) => row.stage === "VG2").length, 4);

// --- Oslo / ABORT counties: shared V.BA VG1 slug fallback (carpenter) ---
function anleggsteknikkHomeVg1ProgrammeSlugsForFylke(fylkeCode, countySlugByCode) {
  const countySlug = countySlugByCode[fylkeCode];
  if (!countySlug) return [];
  const anlegg = [`anleggsteknikk-vg1-bygg-${countySlug}`];
  const carpenter =
    fylkeCode === "50"
      ? "carpenter-vg1-bygg-trondelag"
      : `carpenter-vg1-bygg-${countySlug}`;
  return Array.from(new Set([...anlegg, carpenter]));
}

const osloVg1Slugs = anleggsteknikkHomeVg1ProgrammeSlugsForFylke("03", { "03": "oslo" });
assert.ok(osloVg1Slugs.includes("anleggsteknikk-vg1-bygg-oslo"));
assert.ok(
  osloVg1Slugs.includes("carpenter-vg1-bygg-oslo"),
  "Oslo must fall back to carpenter shared VG1 when anlegg VG1 was never materialized"
);

// --- distance rank: nearer schools beat alphabetical (Åfjord must not win from Oslo) ---
function distanceToSortRank(distanceKm) {
  if (!Number.isFinite(distanceKm)) return 399;
  return Math.min(399, Math.max(0, Math.floor(distanceKm)));
}
assert.ok(distanceToSortRank(25) < distanceToSortRank(600), "Skedsmo nearer than Åfjord");
assert.equal(distanceToSortRank(25) < distanceToSortRank(100), true);

function filterMaybe(rows, softMaxKm, hardMaxKm) {
  return rows.filter((r) => r.distanceKm <= hardMaxKm).map((r) => ({
    ...r,
    soft: r.distanceKm > softMaxKm,
  }));
}
const scored = [
  { school: "Skedsmo", distanceKm: 25 },
  { school: "Åfjord", distanceKm: 480 },
  { school: "Kalnes", distanceKm: 90 },
  { school: "SoftEdge", distanceKm: 520 },
  { school: "TooFar", distanceKm: 600 },
];
const maybeBand = filterMaybe(scored, 500, 550);
assert.deepEqual(
  maybeBand.map((r) => r.school),
  ["Skedsmo", "Åfjord", "Kalnes", "SoftEdge"]
);
assert.equal(maybeBand.find((r) => r.school === "SoftEdge")?.soft, true);
assert.equal(maybeBand.find((r) => r.school === "Åfjord")?.soft, false);

// --- P-8 Fagvalg parity: copy LAREFAG from primary when alt skipped it ---
function ensureLarefagParity(alt, primary) {
  if (alt.some((s) => String(s.stage ?? "").toUpperCase() === "LAREFAG")) return alt;
  const primaryLarefag = primary.find(
    (s) => s.type === "programme_selection" && String(s.stage ?? "").toUpperCase() === "LAREFAG"
  );
  if (!primaryLarefag) return alt;
  const bedriftIndex = alt.findIndex((s) => s.type === "apprenticeship_step");
  if (bedriftIndex < 0) return [...alt, primaryLarefag];
  return [...alt.slice(0, bedriftIndex), primaryLarefag, ...alt.slice(bedriftIndex)];
}

const primaryWithFag = [
  { type: "programme_selection", stage: "VG1", title: "VG1" },
  { type: "programme_selection", stage: "VG2", title: "VG2" },
  {
    type: "programme_selection",
    stage: "LAREFAG",
    title: "Fagvalg",
    program_title: "Anleggsmaskinførerfaget",
    options: [{ program_title: "Anleggsmaskinførerfaget" }, { program_title: "Asfaltfaget" }],
  },
  { type: "apprenticeship_step", title: "Opplæring i bedrift (Anleggsmaskinførerfaget)" },
];
const altMissingFag = [
  { type: "programme_selection", stage: "VG1", title: "VG1" },
  { type: "programme_selection", stage: "VG2", title: "VG2" },
  { type: "apprenticeship_step", title: "Opplæring i bedrift (Anleggsmaskinførerfaget)" },
];
const repaired = ensureLarefagParity(altMissingFag, primaryWithFag);
assert.equal(repaired.length, 4);
assert.equal(repaired[2].stage, "LAREFAG");
assert.equal(repaired[3].type, "apprenticeship_step");
assert.equal(
  ensureLarefagParity(primaryWithFag, primaryWithFag).filter((s) => s.stage === "LAREFAG").length,
  1,
  "already has LAREFAG → unchanged"
);

console.error("[smoke:anleggsteknikk-sparse-vg2] PASS");
