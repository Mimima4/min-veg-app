#!/usr/bin/env node
/**
 * Read-only Finnmark LOSA manifest (Phase 4 Tranche 1).
 * No PSA / Phase 2 DML / Route writes.
 */
import { readFile } from "node:fs/promises";

import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";
import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import { vilbliFetch } from "./lib/vilbli-fetch.mjs";
import { extractVilbliStagesFromHtml } from "./vilbli-stage-extraction-helper.mjs";
import { collectLosaSchoolsFromExtractedStages } from "./lib/losa-finnmark-entity.mjs";

const COUNTY_CODE = "56";
const DEFAULT_PROFESSION = "electrician";
const EXPECTED_LOSA_ROW_COUNT = 18;

function parseArgs(argv) {
  const args = {
    profession: DEFAULT_PROFESSION,
    htmlFile: null,
    json: false,
    expectCount: EXPECTED_LOSA_ROW_COUNT,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--profession" && argv[i + 1]) {
      args.profession = argv[++i];
      continue;
    }
    if (token === "--html-file" && argv[i + 1]) {
      args.htmlFile = argv[++i];
      continue;
    }
    if (token === "--json") {
      args.json = true;
      continue;
    }
    if (token === "--expect-count" && argv[i + 1]) {
      args.expectCount = Number(argv[++i]);
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log(`Usage: node scripts/extract-losa-finnmark-manifest.mjs [options]

Options:
  --profession <slug>   Default: ${DEFAULT_PROFESSION}
  --html-file <path>    Offline Vilbli HTML (skip network fetch)
  --json                Print full manifest JSON
  --expect-count <n>    Fail if LOSA row count differs (default: ${EXPECTED_LOSA_ROW_COUNT})
`);
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

async function loadVilbliHtml({ profession, htmlFile }) {
  const pathDefinition = getVgsPathDefinition(profession);
  const countyMeta = COUNTY_CODE_TO_VILBLI[COUNTY_CODE];

  if (!pathDefinition || !countyMeta) {
    throw new Error(`Unsupported profession/county: ${profession}/${COUNTY_CODE}`);
  }

  const sourceUrl = pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);

  if (htmlFile) {
    const html = await readFile(htmlFile, "utf8");
    return { html, sourceUrl, httpStatus: null, htmlLength: html.length, offline: true };
  }

  const response = await vilbliFetch(sourceUrl);
  const html = await response.text();
  return {
    html,
    sourceUrl,
    httpStatus: response.status,
    htmlLength: html.length,
    offline: false,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const countyMeta = COUNTY_CODE_TO_VILBLI[COUNTY_CODE];

  const fetchMeta = await loadVilbliHtml({
    profession: args.profession,
    htmlFile: args.htmlFile,
  });

  const extracted = extractVilbliStagesFromHtml({
    html: fetchMeta.html,
    countySlug: countyMeta.slug,
    countyLabel: countyMeta.label,
  });

  const losaRows = collectLosaSchoolsFromExtractedStages(extracted.extractedStages);

  const summary = {
    section: "P4-LOSA-MANIFEST-TRANCHE-1",
    countyCode: COUNTY_CODE,
    profession: args.profession,
    sourceUrl: fetchMeta.sourceUrl,
    offline: fetchMeta.offline,
    httpStatus: fetchMeta.httpStatus,
    htmlLength: fetchMeta.htmlLength,
    losaRowCount: losaRows.length,
    expectedLosaRowCount: args.expectCount,
    publishabilityPosture: "STILL_BLOCKED_ALL_SECTION_4",
    matcherCase: "CASE_4",
    psaWriteAuthorized: false,
    rows: losaRows,
  };

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(
      [
        `P4-LOSA manifest (${COUNTY_CODE} Finnmark / ${args.profession})`,
        `source: ${fetchMeta.sourceUrl}`,
        `losa rows: ${losaRows.length} (expect ${args.expectCount})`,
        `posture: STILL_BLOCKED_ALL_SECTION_4`,
        "",
        ...losaRows.map((row) => {
          const delivery = row.entity.deliverySiteLabel ?? "(unparsed)";
          const provider = row.entity.providerSchoolLabel ?? row.semantics.parseStatus;
          return `- ${row.vilbliSchoolCode}: ${provider} → ${delivery}`;
        }),
      ].join("\n")
    );
  }

  if (losaRows.length !== args.expectCount) {
    console.error(
      `\nABORT: expected ${args.expectCount} LOSA rows, got ${losaRows.length}`
    );
    process.exit(1);
  }

  const unparsed = losaRows.filter(
    (row) => row.semantics.parseStatus === "losa_unparsed_delivery_site"
  );
  if (unparsed.length > 0) {
    console.error(
      `\nABORT: ${unparsed.length} row(s) missing delivery site parse`
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
