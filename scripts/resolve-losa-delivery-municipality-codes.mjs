#!/usr/bin/env node
/**
 * Resolve Vilbli LOSA delivery_site_label → municipality_code (Finnmark reference).
 * Read-only — no PSA writes.
 */
import { readFile } from "node:fs/promises";

import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";
import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import { vilbliFetch } from "./lib/vilbli-fetch.mjs";
import { extractVilbliStagesFromHtml } from "./vilbli-stage-extraction-helper.mjs";
import { collectLosaSchoolsFromExtractedStages } from "./lib/losa-finnmark-entity.mjs";
import { resolveAllLosaDeliveryMunicipalityCodes } from "./lib/norway-kommune-reference.mjs";

const DEFAULT_COUNTY = "56";
const DEFAULT_PROFESSION = "electrician";
const EXPECTED_ROW_COUNT = 18;

function parseArgs(argv) {
  const args = {
    profession: DEFAULT_PROFESSION,
    county: DEFAULT_COUNTY,
    htmlFile: null,
    json: false,
    expectCount: EXPECTED_ROW_COUNT,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--profession" && argv[i + 1]) {
      args.profession = argv[++i];
      continue;
    }
    if (token === "--county" && argv[i + 1]) {
      args.county = argv[++i];
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
      console.log(`Usage: node scripts/resolve-losa-delivery-municipality-codes.mjs [options]`);
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

async function loadVilbliHtml({ profession, county, htmlFile }) {
  const pathDefinition = getVgsPathDefinition(profession);
  const countyMeta = COUNTY_CODE_TO_VILBLI[county];
  if (!pathDefinition || !countyMeta) {
    throw new Error(`Unsupported profession/county: ${profession}/${county}`);
  }

  const sourceUrl = pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);
  if (htmlFile) {
    return { html: await readFile(htmlFile, "utf8"), sourceUrl };
  }

  const response = await vilbliFetch(sourceUrl);
  return { html: await response.text(), sourceUrl };
}

async function main() {
  const args = parseArgs(process.argv);
  const countyMeta = COUNTY_CODE_TO_VILBLI[args.county];

  const { html } = await loadVilbliHtml({
    profession: args.profession,
    county: args.county,
    htmlFile: args.htmlFile,
  });

  const extracted = extractVilbliStagesFromHtml({
    html,
    countySlug: countyMeta.slug,
    countyLabel: countyMeta.label,
  });

  const manifestRows = collectLosaSchoolsFromExtractedStages(
    extracted.extractedStages
  );

  if (manifestRows.length !== args.expectCount) {
    console.error(
      `ABORT: expected ${args.expectCount} LOSA rows, got ${manifestRows.length}`
    );
    process.exit(1);
  }

  const report = resolveAllLosaDeliveryMunicipalityCodes(manifestRows, {
    countyCode: args.county,
  });

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      [
        `P4-LOSA kommune resolve (${args.county} / ${args.profession})`,
        `resolved: ${report.resolvedCount}/${report.rowCount}`,
        "",
        ...report.rows.map((row) => {
          const label = row.entity?.deliverySiteLabel;
          const code = row.deliveryMunicipality?.municipalityCode ?? "?";
          return `- ${label} → ${code}`;
        }),
      ].join("\n")
    );
  }

  if (report.unresolvedCount > 0) {
    console.error(`\nABORT: ${report.unresolvedCount} unresolved delivery labels`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
