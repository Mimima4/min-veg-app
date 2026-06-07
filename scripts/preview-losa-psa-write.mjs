#!/usr/bin/env node
/**
 * P4-LOSA-PSA-WRITE dry-run preview — no DB writes.
 */
import { readFile } from "node:fs/promises";

import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";
import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import { vilbliFetch } from "./lib/vilbli-fetch.mjs";
import { extractVilbliStagesFromHtml } from "./vilbli-stage-extraction-helper.mjs";
import { collectLosaSchoolsFromExtractedStages } from "./lib/losa-finnmark-entity.mjs";
import { linkEvidenceToManifest } from "./lib/losa-finnmark-evidence-link.mjs";
import { planLosaFinnmarkPublication } from "./lib/losa-finnmark-publication-model.mjs";
import { buildLosaPsaWritePreview } from "./lib/losa-psa-write.mjs";
import { assessLosaPsaSchemaReadiness } from "./lib/losa-psa-schema.mjs";

const DEFAULT_COUNTY = "56";
const DEFAULT_PROFESSION = "electrician";
const DEFAULT_EXPECT_WRITE_COUNT = 15;

function parseArgs(argv) {
  const args = {
    profession: DEFAULT_PROFESSION,
    county: DEFAULT_COUNTY,
    htmlFile: null,
    json: false,
    expectWriteCount: DEFAULT_EXPECT_WRITE_COUNT,
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
    if (token === "--expect-write-count" && argv[i + 1]) {
      args.expectWriteCount = Number(argv[++i]);
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log(`Usage: node scripts/preview-losa-psa-write.mjs [options]`);
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
    return { html: await readFile(htmlFile, "utf8"), sourceUrl, countyMeta };
  }

  const response = await vilbliFetch(sourceUrl);
  return { html: await response.text(), sourceUrl, countyMeta };
}

async function main() {
  const args = parseArgs(process.argv);

  const { html, sourceUrl, countyMeta } = await loadVilbliHtml({
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

  const linkedRows = linkEvidenceToManifest(manifestRows);
  const publicationReport = planLosaFinnmarkPublication(linkedRows, {
    profession: args.profession,
  });

  const schemaReadiness = await assessLosaPsaSchemaReadiness();
  const preview = buildLosaPsaWritePreview(publicationReport, {
    profession: args.profession,
    countyCode: args.county,
    sourceUrl,
  });

  const payload = {
    preview,
    schemaReadiness: {
      migrationFileOk: schemaReadiness.migrationFile.ok,
      writeAuthorized: schemaReadiness.writeAuthorized,
    },
    sourceUrl,
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(
      [
        `P4-LOSA-PSA-WRITE preview (${args.county} / ${args.profession})`,
        `manifest rows: ${preview.rowCount}`,
        `write candidates: ${preview.writeCandidateCount} (expect ${args.expectWriteCount})`,
        `execution authorized: ${preview.executionAuthorized}`,
        `schema migration file: ${schemaReadiness.migrationFile.ok ? "OK" : "FAIL"}`,
        "",
        preview.writeCandidateCount === 0
          ? "No writable rows — check §4 / publication decision."
          : "Writable rows present — NSR institution_id at write session; charter required for insert.",
      ].join("\n")
    );
  }

  if (preview.writeCandidateCount !== args.expectWriteCount) {
    console.error(
      `\nABORT: expected ${args.expectWriteCount} write candidates, got ${preview.writeCandidateCount}`
    );
    process.exit(1);
  }

  if (preview.executionAuthorized) {
    console.error("\nABORT: execution must remain unauthorized at gate adoption");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
