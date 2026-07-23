/**
 * Unit smoke for the Vilbli→NSR institution matcher (two-phase / brand-cohort).
 *
 * Covers:
 *  - identity core normalization strips BOTH `avd` and `avdeling`
 *  - Lillehammer `Avdeling Nord` → Lillehammer avd Nord (not Karriere / Nord-Fron)
 *  - Setesdal `Avdeling Hornnes` → 3 identical NSR rows → multi_avd_identity (1 PSA row)
 *  - Førde `avd. Høyanger` → Høyanger campus, not main Førde
 *  - invariant: avd_location never selects outside the brand cohort
 *
 * Usage:
 *   node scripts/smoke-vilbli-nsr-institution-match.mjs
 */
import { isMainModule } from "./lib/is-main-module.mjs";
import {
  classifyInstitutionMatch,
  classifyInstitutionMatchForVilbliSchool,
  pickInstitutionMatchesForVilbliSchool,
  pickInstitutionsForPsaEmission,
  isMultiAvdIdentityTie,
} from "./lib/vilbli-nsr-institution-match.mjs";

let passed = 0;
const failures = [];

function check(label, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.error(`  ok  ${label}`);
  } else {
    failures.push(`${label}${detail ? ` — ${detail}` : ""}`);
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

/** Reproduce the caller ranking: classify each NSR institution, drop none, sort by score then name. */
function rankAndPick(vilbliSchoolName, institutions) {
  const ranked = institutions
    .map((institution) => ({
      institution,
      ...classifyInstitutionMatchForVilbliSchool(
        vilbliSchoolName,
        institution.name,
        institution.municipality_name
      ),
    }))
    .filter((candidate) => candidate.matchType !== "none")
    .sort((a, b) => b.score - a.score || a.institution.name.localeCompare(b.institution.name));

  return {
    ranked,
    picked: pickInstitutionMatchesForVilbliSchool({ vilbliSchoolName, ranked }),
  };
}

function toEmissionShape(matches) {
  return matches.map((m) => ({
    institutionId: m.institution.id,
    institutionName: m.institution.name,
    institutionMunicipalityCode: m.institution.municipality_code ?? null,
    resolvedVia: m.resolvedVia ?? null,
  }));
}

// ---------------------------------------------------------------------------
// A) Core normalization: avd + avdeling both stripped → shared brand core.
// ---------------------------------------------------------------------------
function testCoreNormalization() {
  console.error("[case] core normalization avd/avdeling");

  const a = classifyInstitutionMatch(
    "Førde vidaregåande skule avd. Høyanger",
    "Førde vidaregåande skule Avdeling Sunnfjord"
  );
  check("avd vs avdeling reduce to same core", a.matchType === "core_name_match", JSON.stringify(a));

  const b = classifyInstitutionMatch(
    "Lillehammer videregående skole Avdeling Nord",
    "Lillehammer videregående skole"
  );
  check("avdeling suffix vs bare brand → core match", b.matchType === "core_name_match", JSON.stringify(b));

  const c = classifyInstitutionMatch(
    "Setesdal vidaregåande skule Avdeling Hornnes",
    "Setesdal vidaregåande skule avd Hornnes"
  );
  check("avdeling vs avd different label → core match", c.matchType === "core_name_match", JSON.stringify(c));

  const d = classifyInstitutionMatch(
    "Lillehammer videregående skole Avdeling Nord",
    "Karriere Innlandet avd Nord"
  );
  check("different brand sharing only location token → none", d.matchType === "none", JSON.stringify(d));
}

// ---------------------------------------------------------------------------
// B) Lillehammer Avdeling Nord → Lillehammer avd Nord, not Karriere/Nord-Fron.
// ---------------------------------------------------------------------------
function testLillehammer() {
  console.error("[case] Lillehammer Avdeling Nord");

  const institutions = [
    { id: "lil-nord", name: "Lillehammer videregående skole avd Nord", municipality_name: "Lillehammer" },
    { id: "lil-main", name: "Lillehammer videregående skole", municipality_name: "Lillehammer" },
    { id: "karriere-nord", name: "Karriere Innlandet avd Nord", municipality_name: "Nord-Fron" },
    { id: "nord-fron", name: "Nord-Fron videregående skole", municipality_name: "Nord-Fron" },
    { id: "nord-oster", name: "Nord-Østerdal videregående skole", municipality_name: "Tynset" },
  ];

  const { picked } = rankAndPick("Lillehammer videregående skole Avdeling Nord", institutions);

  check("not ambiguous", picked.ambiguous === false);
  check("not unmatched", picked.unmatched !== true);
  check("single match resolved", picked.matches.length === 1, `matches=${picked.matches.length}`);
  const id = picked.matches[0]?.institution?.id;
  check("resolves to Lillehammer avd Nord", id === "lil-nord", `got=${id}`);
  const ids = picked.matches.map((m) => m.institution.id);
  check("never selects Karriere", !ids.includes("karriere-nord"));
  check("never selects Nord-Fron / Nord-Østerdal", !ids.includes("nord-fron") && !ids.includes("nord-oster"));
}

// ---------------------------------------------------------------------------
// C) Setesdal Avdeling Hornnes → 3 identical NSR rows → multi_avd_identity, 1 PSA.
// ---------------------------------------------------------------------------
function testSetesdalDuplicates() {
  console.error("[case] Setesdal Avdeling Hornnes duplicates");

  const institutions = [
    { id: "set-1", name: "Setesdal vidaregåande skule avd Hornnes", municipality_name: "Evje og Hornnes", municipality_code: "4219" },
    { id: "set-2", name: "Setesdal vidaregåande skule avd Hornnes", municipality_name: "Evje og Hornnes", municipality_code: "4219" },
    { id: "set-3", name: "Setesdal vidaregåande skule avd Hornnes", municipality_name: "Evje og Hornnes", municipality_code: "4219" },
  ];

  const { picked } = rankAndPick("Setesdal vidaregåande skule Avdeling Hornnes", institutions);

  check("not ambiguous", picked.ambiguous === false);
  check("links all 3 avd rows", picked.matches.length === 3, `matches=${picked.matches.length}`);
  check(
    "all resolvedVia multi_avd_identity",
    picked.matches.length > 0 && picked.matches.every((m) => m.resolvedVia === "multi_avd_identity")
  );

  const emission = pickInstitutionsForPsaEmission(toEmissionShape(picked.matches));
  check("PSA emission collapses to a single row", emission.length === 1, `emission=${emission.length}`);
}

// ---------------------------------------------------------------------------
// D) Førde avd. Høyanger → Høyanger campus, not main Førde.
// ---------------------------------------------------------------------------
function testFordeHoyanger() {
  console.error("[case] Førde avd. Høyanger campus");

  const institutions = [
    { id: "forde-main", name: "Førde vidaregåande skule", municipality_name: "Sunnfjord" },
    { id: "forde-hoyanger", name: "Førde vidaregåande skule Avdeling Høyanger", municipality_name: "Høyanger" },
  ];

  const { picked } = rankAndPick("Førde vidaregåande skule avd. Høyanger", institutions);

  check("not ambiguous", picked.ambiguous === false);
  check("single campus match", picked.matches.length === 1, `matches=${picked.matches.length}`);
  const id = picked.matches[0]?.institution?.id;
  check("resolves to Høyanger campus", id === "forde-hoyanger", `got=${id}`);
  check("resolvedVia avd_location", picked.matches[0]?.resolvedVia === "avd_location");
  check("does NOT resolve to main Førde", id !== "forde-main");
}

// ---------------------------------------------------------------------------
// E) Invariant: avd_location never selects outside the brand cohort, even if a
//    non-cohort candidate is tied at the top score and contains the location token.
// ---------------------------------------------------------------------------
function testCohortInvariant() {
  console.error("[case] invariant: avd_location stays inside brand cohort");

  // Manually forced ranked list: cohort + artificially-tied outside brand.
  const ranked = [
    {
      institution: {
        id: "cohort",
        name: "Lillehammer videregående skole avd Nord",
        municipality_name: "Lillehammer",
      },
      matchType: "core_name_match",
      score: 0.9,
    },
    {
      institution: {
        id: "outside",
        name: "Karriere Innlandet Nord",
        municipality_name: "Nord-Fron",
      },
      matchType: "core_name_match",
      score: 0.9,
    },
  ];

  const picked = pickInstitutionMatchesForVilbliSchool({
    vilbliSchoolName: "Lillehammer videregående skole Avdeling Nord",
    ranked,
  });

  const ids = picked.matches.map((m) => m.institution.id);
  check("outside-cohort candidate never selected", !ids.includes("outside"), `ids=${ids.join(",")}`);
  check("selects the cohort campus", ids.length === 1 && ids[0] === "cohort", `ids=${ids.join(",")}`);

  // Direct guard: isMultiAvdIdentityTie must reject mixed-core ties.
  check(
    "isMultiAvdIdentityTie rejects mixed-core tie",
    isMultiAvdIdentityTie({
      vilbliSchoolName: "Lillehammer videregående skole Avdeling Nord",
      tiedCandidates: ranked,
    }) === false
  );
}

/** Rogaland privat: Vilbli brand without NSR site suffix (Tveit … Sti). */
function testBrandPrefixCampusSuffix() {
  console.error("[case] brand prefix vs NSR site suffix (Tveit Sti)");

  const match = classifyInstitutionMatch(
    "Tveit vidaregåande skule",
    "Tveit vidaregåande skule Sti"
  );
  check(
    "Tveit ↔ Tveit Sti = brand_prefix_match",
    match.matchType === "brand_prefix_match" && match.score >= 0.85,
    JSON.stringify(match)
  );

  const short = classifyInstitutionMatch("Os", "Os vidaregåande skule Sti");
  check(
    "short brand token does not prefix-match",
    short.matchType === "none" || short.score < 0.85,
    JSON.stringify(short)
  );

  const { picked } = rankAndPick("Tveit vidaregåande skule", [
    {
      id: "tveit-sti",
      name: "Tveit vidaregåande skule Sti",
      municipality_name: "Tysvær",
      municipality_code: "1146",
    },
    {
      id: "oksnevad",
      name: "Øksnevad videregående skole",
      municipality_name: "Klepp",
      municipality_code: "1120",
    },
  ]);
  check("picks Tveit Sti", !picked.unmatched && picked.matches?.[0]?.institution.id === "tveit-sti");
}

function run() {
  testCoreNormalization();
  testLillehammer();
  testSetesdalDuplicates();
  testFordeHoyanger();
  testCohortInvariant();
  testBrandPrefixCampusSuffix();

  console.error("");
  if (failures.length > 0) {
    console.error(`[smoke] vilbli-nsr-institution-match: FAIL (${failures.length} failed, ${passed} passed)`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.error(`[smoke] vilbli-nsr-institution-match: PASS (${passed} checks)`);
}

if (isMainModule(import.meta.url)) {
  run();
}
