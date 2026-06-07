#!/usr/bin/env node
/**
 * P4-LOSA-ROUTE read-only consumption plan — no app/API wiring.
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
import { planLosaRouteConsumption } from "./lib/losa-route-consumption.mjs";

const DEFAULT_COUNTY = "56";
const DEFAULT_PROFESSION = "electrician";

function parseArgs(argv) {
  const args = {
    profession: DEFAULT_PROFESSION,
    county: DEFAULT_COUNTY,
    htmlFile: null,
    json: false,
    expectRouteEligible: 9,
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
    if (token === "--expect-route-eligible" && argv[i + 1]) {
      args.expectRouteEligible = Number(argv[++i]);
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log(`Usage: node scripts/plan-losa-route-consumption.mjs [options]`);
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

  const writePreview = buildLosaPsaWritePreview(publicationReport, {
    profession: args.profession,
    countyCode: args.county,
    sourceUrl,
  });

  const routePlan = planLosaRouteConsumption(writePreview, {
    profession: args.profession,
    countyCode: args.county,
  });

  const payload = { routePlan, sourceUrl };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(
      [
        `P4-LOSA-ROUTE plan (${args.county} / ${args.profession})`,
        `option plans: ${routePlan.routeOptionPlanCount}`,
        `route eligible: ${routePlan.routeEligibleCount} (expect ${args.expectRouteEligible})`,
        `ui #3 approved: ${routePlan.uiIntegrationApproved}`,
        `ordinary kind: ${routePlan.ordinaryOptionKind}`,
        `losa kind: ${routePlan.losaOptionKind}`,
        "",
        routePlan.routeEligibleCount === 0
          ? "No route-eligible LOSA options — check PSA write + #3 wiring."
          : "Route-eligible LOSA option plans present (#3 wired).",
      ].join("\n")
    );
  }

  if (routePlan.routeEligibleCount !== args.expectRouteEligible) {
    console.error(
      `\nABORT: expected ${args.expectRouteEligible} route-eligible options, got ${routePlan.routeEligibleCount}`
    );
    process.exit(1);
  }

  if (!routePlan.uiIntegrationApproved) {
    console.error("\nABORT: #3 wiring gate not approved");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
