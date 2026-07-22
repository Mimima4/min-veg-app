#!/usr/bin/env node
/**
 * Smoke: current-year programme offering gate (I-1…I-3), DB-free.
 * Owner: docs/architecture/phase-4-current-year-programme-offering-owner-decision-record.md
 *
 * Asserts (against a fixture shaped like the REAL county `side=p5` markup — `vb_map_data_Vg*`
 * arrays, NOT the school-less national p2 «fag- og timefordeling» page):
 *   - The «landslinje / landstilbud» stage (VG2, pins spanning several fylke) → national offering
 *     set keyed by schoolCode + normalized name.
 *   - A broad single-fylke stage (VG1) is NOT treated as an offering set → gate stays fail-open.
 *   - resolveOfferingDecision: offered school kept; structure-only school flagged (enforceable).
 *   - Fail-open when offering HTML is absent / a stub / has no landslinje stage.
 *
 * Live mode (home IP only — Vilbli blocks Vercel):
 *   node scripts/smoke-current-year-offering-gate.mjs --live
 *   Fetches the anleggsteknikk reference page and asserts the national VG2 offering count == 6.
 */
import assert from "node:assert/strict";
import {
  buildCurrentYearOfferingSet,
  isCurrentYearOfferingEnforcementEnabled,
  resolveOfferingDecision,
} from "../scripts/lib/vilbli-current-year-offering.mjs";

// vb_map_data pin shape (see mapVilbliSchool): [lat, lng, type, name, code, addr, phone, email, fylke, path].
function pin({ name, code, fylke, path }) {
  return JSON.stringify([0, 0, "Offentlig", name, code, "", "", "", fylke, path]);
}

// VG2 = anleggsteknikk landslinje: the 6 national offering schools across 6 fylke (real audit set).
const VG2_LANDSLINJE_PINS = [
  pin({ name: "Sam Eyde videregående skole", code: "303535", fylke: "Agder", path: "/nb/agder/adr/303535/sam-eyde-videregaende-skole" }),
  pin({ name: "Kirkenes videregående skole / Girkonjárgga joatkkaskuvla", code: "8858", fylke: "Finnmark", path: "/nb/finnmark/adr/8858/kirkenes-videregaende-skole" }),
  pin({ name: "Solør videregående skole", code: "8158", fylke: "Innlandet", path: "/nb/innlandet/adr/8158/solor-videregaende-skole" }),
  pin({ name: "Fauske videregående skole", code: "8741", fylke: "Nordland", path: "/nb/nordland/adr/8741/fauske-videregaende-skole" }),
  pin({ name: "Øksnevad vidaregåande skole", code: "6586", fylke: "Rogaland", path: "/nb/rogaland/adr/6586/oksnevad-vidaregande-skole" }),
  pin({ name: "Os vidaregåande skule", code: "8524", fylke: "Vestland", path: "/nb/vestland/adr/8524/os-vidaregande-skule" }),
];

// VG1 = broad Bygg- og anleggsteknikk: single-fylke on the (Oslo) probe page → NOT a landslinje.
const VG1_BROAD_PINS = [
  pin({ name: "Etterstad videregående skole", code: "111111", fylke: "Oslo", path: "/nb/oslo/adr/111111/etterstad" }),
  pin({ name: "Kuben videregående skole", code: "222222", fylke: "Oslo", path: "/nb/oslo/adr/222222/kuben" }),
];

const PADDING = `<!-- ${"x".repeat(11_000)} -->`;
const P5_HTML = `<html><body>${PADDING}
<script>vb_map_data_Vg1 = [${VG1_BROAD_PINS.join(",")}];</script>
<script>vb_map_data_Vg2 = [${VG2_LANDSLINJE_PINS.join(",")}];</script>
</body></html>`;

// --- national landslinje offering set (VG2 across all fylke, no county filter) ---
const offering = buildCurrentYearOfferingSet({
  offeringHtml: P5_HTML,
  countySlug: "oslo",
  countyLabel: "Oslo",
});
assert.ok(offering, "offering parsed from p5 landslinje markup");
assert.equal(offering.source, "vilbli_strukturkart_landstilbud_p5");
assert.equal(offering.stageCounts.VG2, 6, "national VG2 offering = 6 schools");
assert.ok(offering.byStage.VG2.codes.has("6586"), "Øksnevad (Rogaland) in national VG2 set by code");
assert.ok(offering.byStage.VG2.codes.has("303535"), "Sam Eyde (Agder) in national VG2 set by code");
assert.ok(offering.byStage.VG2.fylkeCount >= 2, "landslinje stage spans multiple fylke");

// --- broad single-fylke VG1 is NOT an offering set → gate must stay fail-open ---
assert.ok(!offering.byStage.VG1, "single-fylke VG1 excluded from offering set");

// --- offered school kept (any county); structure-only school flagged (enforceable) ---
const offered = resolveOfferingDecision({
  offering,
  stage: "VG2",
  school: { schoolCode: "6586", schoolName: "Øksnevad vidaregåande skole" },
});
assert.deepEqual(offered, { enforceable: true, isOffered: true, matchedVia: "code" });

const structureOnly = resolveOfferingDecision({
  offering,
  stage: "VG2",
  school: { schoolCode: "8430", schoolName: "Dalane videregående skole" },
});
assert.equal(structureOnly.enforceable, true, "offering present → decision is enforceable");
assert.equal(structureOnly.isOffered, false, "structure-only Rogaland school not in current-year offering");

// --- name fallback when schoolCode differs (Vilbli vs NSR code drift) ---
const byName = resolveOfferingDecision({
  offering,
  stage: "VG2",
  school: { schoolCode: "DIFFERENT-CODE", schoolName: "Sam Eyde Videregående Skole" },
});
assert.equal(byName.isOffered, true, "matched via normalized name");
assert.equal(byName.matchedVia, "name");

// --- fail-open: broad VG1 stage → not enforceable (never deactivate broadly-offered stages) ---
const vg1Decision = resolveOfferingDecision({
  offering,
  stage: "VG1",
  school: { schoolCode: "999", schoolName: "Noen skole" },
});
assert.equal(vg1Decision.enforceable, false, "no landslinje offering for VG1 → fail-open");
assert.equal(vg1Decision.isOffered, true);

// --- fail-open: absent HTML → null offering → not enforceable ---
assert.equal(buildCurrentYearOfferingSet({ offeringHtml: null, countySlug: "oslo", countyLabel: "Oslo" }), null);
assert.equal(
  buildCurrentYearOfferingSet({ offeringHtml: "<html>stub</html>", countySlug: "oslo", countyLabel: "Oslo" }),
  null,
  "sub-10k stub → null"
);

// --- fail-open: p5-sized page with only a single-fylke stage (no landslinje) → null ---
const NO_LANDSLINJE_HTML = `<html><body>${PADDING}
<script>vb_map_data_Vg2 = [${VG1_BROAD_PINS.join(",")}];</script></body></html>`;
assert.equal(
  buildCurrentYearOfferingSet({ offeringHtml: NO_LANDSLINJE_HTML, countySlug: "oslo", countyLabel: "Oslo" }),
  null,
  "single-fylke-only page → no landslinje stage → null (fail-open)"
);

const failOpen = resolveOfferingDecision({ offering: null, stage: "VG2", school: { schoolCode: "X", schoolName: "Y" } });
assert.deepEqual(failOpen, { enforceable: false, isOffered: true, matchedVia: null });

// --- enforcement flag: default ON after home-IP validation; opt out with =0 ---
assert.equal(isCurrentYearOfferingEnforcementEnabled({}), true, "default enforcement ON");
assert.equal(isCurrentYearOfferingEnforcementEnabled({ CONTOUR_B_ENFORCE_CURRENT_YEAR_OFFERING: "1" }), true);
assert.equal(isCurrentYearOfferingEnforcementEnabled({ CONTOUR_B_ENFORCE_CURRENT_YEAR_OFFERING: "0" }), false);
assert.equal(isCurrentYearOfferingEnforcementEnabled({ CONTOUR_B_ENFORCE_CURRENT_YEAR_OFFERING: "false" }), false);

// --- county page is authority (no Oslo gold list): Troms page keeps Bardufoss ---
const TROMS_EXTRA_PIN = pin({
  name: "Bardufoss videregående skole",
  code: "8824",
  fylke: "Troms",
  path: "/nb/troms/adr/8824/bardufoss-videregaende-skole",
});
const TROMS_PAGE_HTML = `<html><body>${PADDING}
<script>vb_map_data_Vg2 = [${[...VG2_LANDSLINJE_PINS, TROMS_EXTRA_PIN].join(",")}];</script>
</body></html>`;
const tromsPageOffering = buildCurrentYearOfferingSet({ offeringHtml: TROMS_PAGE_HTML });
assert.equal(tromsPageOffering.stageCounts.VG2, 7, "Troms page landslinje = 7");
assert.ok(tromsPageOffering.byStage.VG2.codes.has("8824"), "Troms page keeps Bardufoss");
assert.ok(
  resolveOfferingDecision({
    offering: tromsPageOffering,
    stage: "VG2",
    school: { schoolCode: "8824", schoolName: "Bardufoss videregående skole" },
  }).isOffered,
  "Bardufoss offered from Troms county page"
);

// Rogaland page includes local non-probe schools → offered under county authority
const ROGALAND_LOCAL = pin({
  name: "Dalane videregående skole",
  code: "8430",
  fylke: "Rogaland",
  path: "/nb/rogaland/adr/8430/dalane",
});
const ROGALAND_PAGE_HTML = `<html><body>${PADDING}
<script>vb_map_data_Vg2 = [${[...VG2_LANDSLINJE_PINS, ROGALAND_LOCAL].join(",")}];</script>
</body></html>`;
const rogalandOffering = buildCurrentYearOfferingSet({ offeringHtml: ROGALAND_PAGE_HTML });
assert.ok(
  resolveOfferingDecision({
    offering: rogalandOffering,
    stage: "VG2",
    school: { schoolCode: "8430", schoolName: "Dalane videregående skole" },
  }).isOffered,
  "Rogaland local offered from Rogaland page"
);

console.error("[smoke:current-year-offering] PASS");

// --- optional live validation (home IP only) ---
if (process.argv.includes("--live")) {
  const { vilbliFetch } = await import("../scripts/lib/vilbli-fetch.mjs");
  const tromsUrl =
    "https://www.vilbli.no/nb/troms/strukturkart/V.BA/bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAANL2----&side=p5";
  console.error(`[smoke:current-year-offering:live] fetching ${tromsUrl}`);
  const tromsRes = await vilbliFetch(tromsUrl);
  const tromsHtml = await tromsRes.text();
  const tromsLive = buildCurrentYearOfferingSet({ offeringHtml: tromsHtml });
  assert.ok(tromsLive?.byStage.VG2.codes.has("8824"), "live: Troms page includes Bardufoss 8824");
  console.error(
    `[smoke:current-year-offering:live] Troms VG2 count=${tromsLive.byStage.VG2.codes.size} codes=${[...tromsLive.byStage.VG2.codes].join(",")}`
  );

  const rogalandUrl =
    "https://www.vilbli.no/nb/rogaland/strukturkart/V.BA/bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAANL2----&side=p5";
  console.error(`[smoke:current-year-offering:live] fetching ${rogalandUrl}`);
  const rogRes = await vilbliFetch(rogalandUrl);
  const rogHtml = await rogRes.text();
  const rogLive = buildCurrentYearOfferingSet({ offeringHtml: rogHtml });
  assert.ok(rogLive?.byStage.VG2.codes.has("8430"), "live: Rogaland page includes Dalane 8430");
  console.error(
    `[smoke:current-year-offering:live] Rogaland VG2 count=${rogLive.byStage.VG2.codes.size}`
  );
  console.error("[smoke:current-year-offering:live] PASS — county-page authority");
}
