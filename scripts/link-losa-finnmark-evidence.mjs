#!/usr/bin/env node
/**
 * Tranche 2: link repo-safe CONFIRMED/SNIPPET index to Finnmark LOSA manifest rows.
 * No PSA / Phase 2 DML / owner-held JSON reads.
 */
import { readFile } from "node:fs/promises";

import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";
import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import { vilbliFetch } from "./lib/vilbli-fetch.mjs";
import { extractVilbliStagesFromHtml } from "./vilbli-stage-extraction-helper.mjs";
import { collectLosaSchoolsFromExtractedStages } from "./lib/losa-finnmark-entity.mjs";
import {
  linkEvidenceToManifest,
  summarizeEvidenceLinkReport,
} from "./lib/losa-finnmark-evidence-link.mjs";

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
      console.log(`Usage: node scripts/link-losa-finnmark-evidence.mjs [options]

Options:
  --profession <slug>   Default: ${DEFAULT_PROFESSION}
  --html-file <path>    Offline Vilbli HTML
  --json                Full linked manifest JSON
  --expect-count <n>    Default: ${EXPECTED_LOSA_ROW_COUNT}
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
    return { html, sourceUrl };
  }

  const response = await vilbliFetch(sourceUrl);
  const html = await response.text();
  return { html, sourceUrl };
}

function formatClaimStatus(link) {
  const sources =
    link.sourceIds?.length > 0 ? ` [${link.sourceIds.join(", ")}]` : "";
  return `${link.claimClass}: ${link.status}${sources}`;
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
  const report = summarizeEvidenceLinkReport(linkedRows);

  const payload = {
    ...report,
    sourceUrl,
    profession: args.profession,
    countyCode: COUNTY_CODE,
    rows: linkedRows,
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(
      [
        `P4-LOSA evidence-link (${COUNTY_CODE} / ${args.profession})`,
        `rows: ${report.rowCount} | §4 satisfied: ${report.rowsSection4Satisfied} | still blocked: ${report.rowsStillBlocked}`,
        `county CONFIRMED index: ${report.countyWideConfirmedCount}`,
        `posture: ${report.publishabilityPosture}`,
        "",
        `Alta row partial: ${report.altaPartialClaims.join(", ") || "(none)"}`,
        `Alta row snippet: ${report.altaSnippetClaims.join(", ") || "(none)"}`,
        "",
        "Per-row blocked claims (sample):",
        ...linkedRows.slice(0, 3).map((row) => {
          const delivery = row.entity.deliverySiteLabel;
          const blocked =
            row.evidenceLink.summary.blockedClaimClasses.join(", ") || "(none)";
          const suffix = row.evidenceLink.summary.psaEligible
            ? "§4 satisfied"
            : `blocked → ${blocked}`;
          return `- ${delivery}: ${suffix}`;
        }),
        `… (${linkedRows.length} total)`,
        "",
        "Alta row claim detail:",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Alta")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
        "",
        "Hammerfest row (row 2):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Hammerfest")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
      ].join("\n")
    );
  }

  if (report.allRowsPsaEligible) {
    console.error("\nABORT: unexpected — all rows PSA-eligible (§4 should stay blocked)");
    process.exit(1);
  }

  if (report.rowsSection4Satisfied !== 2) {
    console.error(
      `\nABORT: expected exactly 2 rows §4 satisfied (Alta + Hammerfest), got ${report.rowsSection4Satisfied}`
    );
    process.exit(1);
  }

  if (report.rowsStillBlocked !== report.rowCount - 2) {
    console.error(
      `\nABORT: expected ${report.rowCount - 2} rows still blocked, got ${report.rowsStillBlocked}`
    );
    process.exit(1);
  }

  const altaRow = linkedRows.find((r) => r.entity.deliverySiteLabel === "Alta");
  if (!altaRow) {
    console.error("\nABORT: Alta delivery row missing from manifest");
    process.exit(1);
  }

  if (!altaRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Alta row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const altaBlocked = altaRow.evidenceLink.summary.blockedClaimClasses;
  if (altaBlocked.length !== 0) {
    console.error(
      `\nABORT: Alta row should have no blocked claims, got: ${altaBlocked.join(", ")}`
    );
    process.exit(1);
  }

  const hammerfestRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Hammerfest"
  );
  if (!hammerfestRow) {
    console.error("\nABORT: Hammerfest delivery row missing from manifest");
    process.exit(1);
  }

  const hammerfestDeliveryLink = hammerfestRow.evidenceLink.claimLinks.find(
    (link) => link.claimClass === "delivery_municipality"
  );
  if (hammerfestDeliveryLink?.status !== "row_confirmed") {
    console.error(
      `\nABORT: Hammerfest delivery_municipality should be row_confirmed, got ${hammerfestDeliveryLink?.status ?? "missing"}`
    );
    process.exit(1);
  }

  if (!hammerfestRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Hammerfest row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const hammerfestBlocked =
    hammerfestRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (hammerfestBlocked.length !== 0) {
    console.error(
      `\nABORT: Hammerfest row should have no blocked claims, got: ${hammerfestBlocked.join(", ")}`
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
