#!/usr/bin/env node
/**
 * Tranche 3: read-only LOSA PSA publication plan for Finnmark manifest rows.
 */
import { readFile } from "node:fs/promises";

import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";
import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import { vilbliFetch } from "./lib/vilbli-fetch.mjs";
import { extractVilbliStagesFromHtml } from "./vilbli-stage-extraction-helper.mjs";
import { collectLosaSchoolsFromExtractedStages } from "./lib/losa-finnmark-entity.mjs";
import { linkEvidenceToManifest } from "./lib/losa-finnmark-evidence-link.mjs";
import {
  planLosaFinnmarkPublication,
  summarizePublicationPlan,
  LOSA_PROPOSED_AVAILABILITY_SCOPE,
} from "./lib/losa-finnmark-publication-model.mjs";

const COUNTY_CODE = "56";
const DEFAULT_PROFESSION = "electrician";
const EXPECTED_LOSA_ROW_COUNT = 18;
const EXPECTED_EMISSION_ALLOWED_COUNT = 7;

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
      console.log(`Usage: node scripts/plan-losa-finnmark-publication.mjs [options]`);
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

async function loadVilbliHtml({ profession, htmlFile }) {
  const pathDefinition = getVgsPathDefinition(profession);
  const countyMeta = COUNTY_CODE_TO_VILBLI[COUNTY_CODE];
  const sourceUrl = pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);

  if (htmlFile) {
    return { html: await readFile(htmlFile, "utf8"), sourceUrl };
  }

  const response = await vilbliFetch(sourceUrl);
  return { html: await response.text(), sourceUrl };
}

async function main() {
  const args = parseArgs(process.argv);
  const countyMeta = COUNTY_CODE_TO_VILBLI[COUNTY_CODE];

  const { html, sourceUrl } = await loadVilbliHtml({
    profession: args.profession,
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

  const linkedRows = linkEvidenceToManifest(manifestRows);
  const report = planLosaFinnmarkPublication(linkedRows, {
    profession: args.profession,
  });
  const summary = summarizePublicationPlan(report);

  const payload = { ...report, summary, sourceUrl };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(
      [
        `P4-LOSA publication-plan (${COUNTY_CODE} / ${args.profession})`,
        `rows: ${summary.rowCount} | emission allowed: ${summary.emissionAllowedCount}`,
        `proposed scope: ${LOSA_PROPOSED_AVAILABILITY_SCOPE}`,
        summary.schemaMigrationApplied
          ? `schema migration: applied (main) | emission allowed: ${summary.emissionAllowedCount}`
          : `schema migration: required → gate ${summary.nextGate}`,
        "",
        "Sample plans:",
        ...report.plans.slice(0, 2).map((plan) => {
          const delivery = plan.entity?.deliverySiteLabel;
          const reasons = plan.blockedReasons.slice(0, 3).join(", ");
          return `- ${delivery}: emission=${plan.emissionAllowed} (${reasons}…)`;
        }),
        `… (${report.plans.length} total)`,
      ].join("\n")
    );
  }

  if (summary.emissionAllowedCount !== EXPECTED_EMISSION_ALLOWED_COUNT) {
    console.error(
      `\nABORT: expected ${EXPECTED_EMISSION_ALLOWED_COUNT} emission-allowed row(s), got ${summary.emissionAllowedCount}`
    );
    process.exit(1);
  }

  const wrongScope = report.plans.filter(
    (p) => p.proposedAvailabilityScope !== LOSA_PROPOSED_AVAILABILITY_SCOPE
  );
  if (wrongScope.length > 0) {
    console.error("\nABORT: all plans must use proposed LOSA scope");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
