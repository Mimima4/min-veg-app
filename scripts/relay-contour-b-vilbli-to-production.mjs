/**
 * Production Contour B when Vilbli blocks Vercel (HTTP 202 / ~2KB stub).
 * Fetches Vilbli on THIS machine, POSTs HTML to production API for ingest.
 *
 * Env: VERCEL_APP_URL, CRON_SECRET (e.g. from .env.local)
 *
 *   node scripts/relay-contour-b-vilbli-to-production.mjs [--dry-run] [--county 56]
 */
import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";
import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import {
  SUPPORTED_VGS_PROFESSION_SLUGS,
  VGS_PIPELINE_COUNTY_CODES,
} from "./lib/contour-b-operational-eligibility.mjs";
import { vilbliFetch } from "./lib/vilbli-fetch.mjs";

function parseArgs(argv) {
  const args = { "dry-run": "false" };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = String(args["dry-run"] ?? "").toLowerCase() === "true";
  const professionFilter = String(args.profession ?? "").trim();
  const countyFilter = String(args.county ?? "").trim();

  const baseUrl = String(process.env.VERCEL_APP_URL ?? "").trim().replace(/\/$/, "");
  const cronSecret = String(process.env.CRON_SECRET ?? "").trim();
  if (!baseUrl || !cronSecret) {
    throw new Error("Set VERCEL_APP_URL and CRON_SECRET (e.g. source .env.local)");
  }

  const relayUrl = `${baseUrl}/api/internal/vgs/ingest-contour-b-vilbli-relay`;
  const results = [];

  for (const professionSlug of SUPPORTED_VGS_PROFESSION_SLUGS) {
    if (professionFilter && professionSlug !== professionFilter) continue;
    if (!getVgsPathDefinition(professionSlug)) continue;

    for (const countyCode of VGS_PIPELINE_COUNTY_CODES) {
      if (countyFilter && countyCode !== countyFilter) continue;

      const countyMeta = COUNTY_CODE_TO_VILBLI[countyCode];
      const entry = { professionSlug, countyCode, action: null, reason: null };
      if (!countyMeta) {
        entry.action = "skipped";
        entry.reason = "unsupported_county";
        results.push(entry);
        continue;
      }

      try {
        const sourceUrl = getVgsPathDefinition(professionSlug).sourceModel.buildVilbliUrl(
          countyMeta.slug
        );
        const fetchRes = await vilbliFetch(sourceUrl);
        const vilbliHtml = await fetchRes.text();
        if (fetchRes.status < 200 || fetchRes.status >= 300 || vilbliHtml.length < 10_000) {
          throw new Error(
            `local vilbli fetch failed: status=${fetchRes.status} len=${vilbliHtml.length}`
          );
        }

        const response = await fetch(relayUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cronSecret}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            professionSlug,
            countyCode,
            dryRun,
            vilbliHtml,
          }),
        });

        const body = await response.json();
        if (!response.ok || !body.ok) {
          throw new Error(body.error ?? `relay HTTP ${response.status}`);
        }

        entry.action = body.action ?? "ok";
        entry.reason = body.reason ?? null;
        entry.readiness = body.readiness ?? null;
      } catch (error) {
        entry.action = "failed";
        entry.reason = error instanceof Error ? error.message : String(error);
      }

      results.push(entry);
      console.error(
        `[relay] ${entry.professionSlug}/${entry.countyCode} ${entry.action} ${entry.reason ?? ""}`
      );
    }
  }

  console.log(JSON.stringify({ dryRun, relayUrl, results }, null, 2));
  const failed = results.filter((r) => r.action === "failed").length;
  if (failed > 0 && !dryRun) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
