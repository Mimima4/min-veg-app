#!/usr/bin/env node
/**
 * Extract kolonne-3 / bedrift fag list from a Vilbli county chain page (side=p5).
 * Use when onboarding a new profession — paste output into
 * data/larebedrift/kolonne3-rosters/<professionSlug>.json
 *
 * Usage:
 *   node scripts/extract-vilbli-kolonne3-roster.mjs \
 *     --profession maskin-og-kranforer \
 *     --county-slug vestland \
 *     --chain "V.BABAT1----_V.BAANL2----"
 *
 *   node scripts/extract-vilbli-kolonne3-roster.mjs --verify maskin-og-kranforer
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadKolonne3ProfessionRosters } from "./lib/load-kolonne3-rosters.mjs";

const ROSTER_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  "../data/larebedrift/kolonne3-rosters"
);

function parseArgs(argv) {
  const args = {
    verify: null,
    profession: "maskin-og-kranforer",
    countySlug: "vestland",
    chain: "V.BABAT1----_V.BAANL2----",
    ingestBatch: 7,
    write: false,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--verify" && argv[i + 1]) {
      args.verify = argv[++i];
      continue;
    }
    if (token === "--profession" && argv[i + 1]) {
      args.profession = argv[++i];
      continue;
    }
    if (token === "--county-slug" && argv[i + 1]) {
      args.countySlug = argv[++i];
      continue;
    }
    if (token === "--chain" && argv[i + 1]) {
      args.chain = argv[++i];
      continue;
    }
    if (token === "--ingest-batch" && argv[i + 1]) {
      args.ingestBatch = Number(argv[++i]);
      continue;
    }
    if (token === "--write") {
      args.write = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log(`Usage: node scripts/extract-vilbli-kolonne3-roster.mjs [options]`);
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

function slugifyLabel(label) {
  return String(label ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function defaultLabelAliases(title) {
  const base = title
    .replace(/faget$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return Array.from(
    new Set([
      base,
      `${base}faget`,
      title.toLowerCase(),
    ])
  );
}

async function extractFromVilbli({ countySlug, chain }) {
  const url = `https://www.vilbli.no/nb/${countySlug}/strukturkart/V.BA/bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=${chain}&side=p5`;
  const html = await (await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } })).text();
  const block = html.match(
    /Vg3\s*[–-]\s*Videregående trinn 3 eller opplæring i bedrift[\s\S]*?<ul class="kursList">([\s\S]*?)<\/ul>/i
  );
  if (!block?.[1]) {
    throw new Error(`No kolonne-3 block in Vilbli HTML (${url})`);
  }

  const entries = [...block[1].matchAll(
    /<li[^>]*class="[^"]*(?:skole|bedrift)[^"]*"[^>]*>[\s\S]*?<a href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>/gi
  )]
    .map((match) => ({
      href: match[1],
      title: match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    }))
    .filter((entry) => entry.title && !/^påbygging/i.test(entry.title));

  return entries.map((entry) => {
    const codes = [...entry.href.matchAll(/_v\.([a-z0-9]+)----/gi)].map((m) => m[1].toUpperCase());
    const apiQueryCode = codes[codes.length - 1];
    if (!apiQueryCode) {
      throw new Error(`Missing VIGO tail code for ${entry.title}`);
    }
    return {
      apiQueryCode,
      code: `${slugifyLabel(entry.title)}FAGET`.replace(/_FAGET$/, "FAGET"),
      label: entry.title,
      labelAliases: defaultLabelAliases(entry.title),
      programmeUrl: entry.href,
    };
  });
}

function verifyRoster(professionSlug) {
  const path = join(ROSTER_DIR, `${professionSlug}.json`);
  const roster = JSON.parse(readFileSync(path, "utf8"));
  const expected = new Map(
    roster.entries.map((entry) => [entry.apiQueryCode.toUpperCase(), entry])
  );

  return extractFromVilbli({
    countySlug: roster.extractReferenceCountySlug ?? "vestland",
    chain: roster.vilbliChainTokens,
  }).then((extracted) => {
    let failed = 0;
    for (const row of extracted) {
      const committed = expected.get(row.apiQueryCode);
      if (!committed) {
        failed += 1;
        console.error(`MISSING in roster JSON: ${row.apiQueryCode} ${row.label}`);
        continue;
      }
      console.log(`OK ${row.apiQueryCode} ${row.label}`);
    }
    for (const code of expected.keys()) {
      if (!extracted.some((row) => row.apiQueryCode === code)) {
        failed += 1;
        console.error(`EXTRA in roster JSON (not on Vilbli): ${code}`);
      }
    }
    if (failed > 0) {
      throw new Error(`Roster verify failed (${failed} mismatch(es))`);
    }
    console.error(`[extract-vilbli-kolonne3-roster] verify PASS — ${extracted.length} fag`);
  });
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.verify) {
    await verifyRoster(args.verify);
    return;
  }

  const extracted = await extractFromVilbli({
    countySlug: args.countySlug,
    chain: args.chain,
  });

  const roster = {
    professionSlug: args.profession,
    vilbliChainTokens: args.chain,
    extractReferenceCountySlug: args.countySlug,
    ingestBatch: args.ingestBatch,
    entries: extracted.map(({ programmeUrl: _programmeUrl, ...entry }) => entry),
  };

  const json = `${JSON.stringify(roster, null, 2)}\n`;
  if (args.write) {
    const path = join(ROSTER_DIR, `${args.profession}.json`);
    writeFileSync(path, json, "utf8");
    console.error(`[extract-vilbli-kolonne3-roster] wrote ${path}`);
  } else {
    console.log(json);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
