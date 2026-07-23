#!/usr/bin/env node
/**
 * Smoke: every catalog profession builds a label-based Arbeidsplassen category URL
 * (occupationLevel1 + occupationLevel2), not slug-code params that fail to filter.
 */
import assert from "node:assert/strict";
import { CATALOG_PROFESSION_ARBEIDSPLASSEN } from "../src/lib/nav/catalog-profession-arbeidsplassen-styrk.ts";

const LABEL = "Arbeidsplassen.nav.no";
const BASE = "https://arbeidsplassen.nav.no/stillinger";

function buildUrl(entry) {
  const level2 = `${entry.level1Label}.${entry.occupationLabel}`;
  const params = new URLSearchParams();
  params.set("occupationLevel1", entry.level1Label);
  params.set("occupationLevel2", level2);
  return `${BASE}?${params.toString()}`;
}

assert.equal(LABEL, "Arbeidsplassen.nav.no");

const slugs = Object.keys(CATALOG_PROFESSION_ARBEIDSPLASSEN).sort();
assert.ok(slugs.length >= 15, `expected ≥15 catalogue rows, got ${slugs.length}`);

for (const slug of slugs) {
  const entry = CATALOG_PROFESSION_ARBEIDSPLASSEN[slug];
  assert.ok(entry?.styrkCode, slug);
  assert.ok(entry.level1Label, `${slug} level1Label`);
  assert.ok(entry.occupationLabel, `${slug} occupationLabel`);
  const url = buildUrl(entry);
  assert.match(url, /^https:\/\/arbeidsplassen\.nav\.no\/stillinger\?/);
  assert.match(url, /occupationLevel1=/);
  assert.match(url, /occupationLevel2=/);
  assert.doesNotMatch(url, /occupationFirstLevel/);
  assert.doesNotMatch(url, /occupationSecondLevel/);
  // Must carry human labels, not styrk slug codes as filter values.
  assert.ok(url.includes(encodeURIComponent(entry.level1Label).replace(/%20/g, "+")) || url.includes(entry.level1Label.replace(/ /g, "+")) || decodeURIComponent(url).includes(entry.level1Label));
  console.log(`OK ${slug} -> ${entry.level1Label} / ${entry.occupationLabel}`);
  console.log(`   ${url}`);
}

assert.equal(CATALOG_PROFESSION_ARBEIDSPLASSEN["not-a-profession"], undefined);
console.log("arbeidsplassen-occupation-url smoke passed");
