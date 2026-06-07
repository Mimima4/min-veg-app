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
        "",
        "Sør-Varanger row (row 3):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Sør-Varanger")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
        "",
        "Porsanger row (row 4):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Porsanger")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
        "",
        "Karasjok row (row 5):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Karasjok")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
        "",
        "Kautokeino row (row 6):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Kautokeino")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
        "",
        "Vardø row (row 7):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Vardø")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
        "",
        "Nesseby row (row 8):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Nesseby")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
        "",
        "Tana row (row 9):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Tana")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
        "",
        "Lebesby row (row 10):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Lebesby")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
        "",
        "Gamvik row (row 11):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Gamvik")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
        "",
        "Berlevåg row (row 12):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Berlevåg")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
        "",
        "Hasvik row (row 13):",
        ...(
          linkedRows.find((r) => r.entity.deliverySiteLabel === "Hasvik")
            ?.evidenceLink.claimLinks ?? []
        ).map((link) => `  ${formatClaimStatus(link)}`),
      ].join("\n")
    );
  }

  if (report.allRowsPsaEligible) {
    console.error("\nABORT: unexpected — all rows PSA-eligible (§4 should stay blocked)");
    process.exit(1);
  }

  if (report.rowsSection4Satisfied !== 13) {
    console.error(
      `\nABORT: expected exactly 13 rows §4 satisfied (Alta + Hammerfest + Sør-Varanger + Porsanger + Karasjok + Kautokeino + Vardø + Nesseby + Tana + Lebesby + Gamvik + Berlevåg + Hasvik), got ${report.rowsSection4Satisfied}`
    );
    process.exit(1);
  }

  if (report.rowsStillBlocked !== report.rowCount - 13) {
    console.error(
      `\nABORT: expected ${report.rowCount - 13} rows still blocked, got ${report.rowsStillBlocked}`
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

  const sorVarangerRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Sør-Varanger"
  );
  if (!sorVarangerRow) {
    console.error("\nABORT: Sør-Varanger delivery row missing from manifest");
    process.exit(1);
  }

  const sorVarangerDeliveryLink = sorVarangerRow.evidenceLink.claimLinks.find(
    (link) => link.claimClass === "delivery_municipality"
  );
  if (sorVarangerDeliveryLink?.status !== "row_confirmed") {
    console.error(
      `\nABORT: Sør-Varanger delivery_municipality should be row_confirmed, got ${sorVarangerDeliveryLink?.status ?? "missing"}`
    );
    process.exit(1);
  }

  if (!sorVarangerRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Sør-Varanger row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const sorVarangerBlocked =
    sorVarangerRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (sorVarangerBlocked.length !== 0) {
    console.error(
      `\nABORT: Sør-Varanger row should have no blocked claims, got: ${sorVarangerBlocked.join(", ")}`
    );
    process.exit(1);
  }

  const porsangerRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Porsanger"
  );
  if (!porsangerRow) {
    console.error("\nABORT: Porsanger delivery row missing from manifest");
    process.exit(1);
  }

  const porsangerDeliveryLink = porsangerRow.evidenceLink.claimLinks.find(
    (link) => link.claimClass === "delivery_municipality"
  );
  if (porsangerDeliveryLink?.status !== "row_confirmed") {
    console.error(
      `\nABORT: Porsanger delivery_municipality should be row_confirmed, got ${porsangerDeliveryLink?.status ?? "missing"}`
    );
    process.exit(1);
  }

  if (!porsangerRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Porsanger row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const porsangerBlocked =
    porsangerRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (porsangerBlocked.length !== 0) {
    console.error(
      `\nABORT: Porsanger row should have no blocked claims, got: ${porsangerBlocked.join(", ")}`
    );
    process.exit(1);
  }

  const karasjokRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Karasjok"
  );
  if (!karasjokRow) {
    console.error("\nABORT: Karasjok delivery row missing from manifest");
    process.exit(1);
  }

  if (!karasjokRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Karasjok row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const karasjokBlocked =
    karasjokRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (karasjokBlocked.length !== 0) {
    console.error(
      `\nABORT: Karasjok row should have no blocked claims, got: ${karasjokBlocked.join(", ")}`
    );
    process.exit(1);
  }

  const kautokeinoRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Kautokeino"
  );
  if (!kautokeinoRow) {
    console.error("\nABORT: Kautokeino delivery row missing from manifest");
    process.exit(1);
  }

  if (!kautokeinoRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Kautokeino row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const kautokeinoBlocked =
    kautokeinoRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (kautokeinoBlocked.length !== 0) {
    console.error(
      `\nABORT: Kautokeino row should have no blocked claims, got: ${kautokeinoBlocked.join(", ")}`
    );
    process.exit(1);
  }

  const vardoRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Vardø"
  );
  if (!vardoRow) {
    console.error("\nABORT: Vardø delivery row missing from manifest");
    process.exit(1);
  }

  if (!vardoRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Vardø row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const vardoBlocked =
    vardoRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (vardoBlocked.length !== 0) {
    console.error(
      `\nABORT: Vardø row should have no blocked claims, got: ${vardoBlocked.join(", ")}`
    );
    process.exit(1);
  }

  const nessebyRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Nesseby"
  );
  if (!nessebyRow) {
    console.error("\nABORT: Nesseby delivery row missing from manifest");
    process.exit(1);
  }

  if (!nessebyRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Nesseby row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const nessebyBlocked =
    nessebyRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (nessebyBlocked.length !== 0) {
    console.error(
      `\nABORT: Nesseby row should have no blocked claims, got: ${nessebyBlocked.join(", ")}`
    );
    process.exit(1);
  }

  const tanaRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Tana"
  );
  if (!tanaRow) {
    console.error("\nABORT: Tana delivery row missing from manifest");
    process.exit(1);
  }

  if (!tanaRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Tana row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const tanaBlocked =
    tanaRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (tanaBlocked.length !== 0) {
    console.error(
      `\nABORT: Tana row should have no blocked claims, got: ${tanaBlocked.join(", ")}`
    );
    process.exit(1);
  }

  const lebesbyRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Lebesby"
  );
  if (!lebesbyRow) {
    console.error("\nABORT: Lebesby delivery row missing from manifest");
    process.exit(1);
  }

  if (!lebesbyRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Lebesby row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const lebesbyBlocked =
    lebesbyRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (lebesbyBlocked.length !== 0) {
    console.error(
      `\nABORT: Lebesby row should have no blocked claims, got: ${lebesbyBlocked.join(", ")}`
    );
    process.exit(1);
  }

  const gamvikRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Gamvik"
  );
  if (!gamvikRow) {
    console.error("\nABORT: Gamvik delivery row missing from manifest");
    process.exit(1);
  }

  if (!gamvikRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Gamvik row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const gamvikBlocked =
    gamvikRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (gamvikBlocked.length !== 0) {
    console.error(
      `\nABORT: Gamvik row should have no blocked claims, got: ${gamvikBlocked.join(", ")}`
    );
    process.exit(1);
  }

  const berlevagRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Berlevåg"
  );
  if (!berlevagRow) {
    console.error("\nABORT: Berlevåg delivery row missing from manifest");
    process.exit(1);
  }

  if (!berlevagRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Berlevåg row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const berlevagBlocked =
    berlevagRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (berlevagBlocked.length !== 0) {
    console.error(
      `\nABORT: Berlevåg row should have no blocked claims, got: ${berlevagBlocked.join(", ")}`
    );
    process.exit(1);
  }

  const hasvikRow = linkedRows.find(
    (r) => r.entity.deliverySiteLabel === "Hasvik"
  );
  if (!hasvikRow) {
    console.error("\nABORT: Hasvik delivery row missing from manifest");
    process.exit(1);
  }

  if (!hasvikRow.evidenceLink.summary.psaEligible) {
    console.error("\nABORT: Hasvik row should have ROW_SECTION_4_SATISFIED (psaEligible)");
    process.exit(1);
  }

  const hasvikBlocked =
    hasvikRow.evidenceLink.summary.blockedClaimClasses ?? [];
  if (hasvikBlocked.length !== 0) {
    console.error(
      `\nABORT: Hasvik row should have no blocked claims, got: ${hasvikBlocked.join(", ")}`
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
