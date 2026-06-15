#!/usr/bin/env node
/**
 * Read-only Nordland (`18`) regional delivery scout — Steigen / LOSA / veksling signals.
 * Charter: phase-4-nordland-steigen-regional-delivery-research-owner-record.md
 *
 * Usage:
 *   node --env-file=.env.local scripts/scout-nordland-regional-delivery-vilbli.mjs
 *   node scripts/scout-nordland-regional-delivery-vilbli.mjs --json
 */
import { createClient } from "@supabase/supabase-js";
import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";
import { COUNTY_CODE_TO_VILBLI } from "./lib/vilbli-county-meta.mjs";
import { loadVilbliCountyHtml } from "./lib/load-vilbli-county-html.mjs";
import { extractVilbliStagesFromHtml } from "./vilbli-stage-extraction-helper.mjs";
import { classifyIdentitySemantics } from "./school-identity-semantics.mjs";
import { parseLosaVilbliLabel } from "./lib/losa-finnmark-entity.mjs";
import { isMainModule } from "./lib/is-main-module.mjs";

const COUNTY_CODE = "18";
const PROFESSIONS = ["electrician", "mechanic", "carpenter"];

const REGIONAL_SIGNALS = [
  { id: "steigen", pattern: /steigen/i },
  { id: "knut_hamsun", pattern: /knut\s+hamsun/i },
  { id: "losa_keyword", pattern: /\blosa\b/i },
  { id: "lokal_opplaring", pattern: /lokal\s+oppl/i },
  { id: "veksling", pattern: /veksl/i },
  { id: "nord_salten", pattern: /nord-salten|nuortta/i },
  { id: "hamaroy", pattern: /hamarøy|hamaroy/i },
  { id: "bedrift", pattern: /bedrift|lærebedrift|laerebedrift/i },
];

function parseArgs(argv) {
  const args = { json: false };
  for (const token of argv.slice(2)) {
    if (token === "--json") args.json = true;
  }
  return args;
}

function matchRegionalSignals(label) {
  const text = String(label ?? "");
  return REGIONAL_SIGNALS.filter((signal) => signal.pattern.test(text)).map((s) => s.id);
}

function summarizeProfessionVilbli(professionSlug, extractedStages, sourceUrl) {
  const hits = [];
  let losaCount = 0;
  let slashCount = 0;

  for (const [stage, schools] of Object.entries(extractedStages)) {
    for (const school of schools ?? []) {
      const label = school.schoolName ?? "";
      const semantics = classifyIdentitySemantics(label);
      const losaParsed = parseLosaVilbliLabel(label);
      const signals = matchRegionalSignals(label);

      if (semantics.isLosa) losaCount += 1;
      if (semantics.hasSlashAliases) slashCount += 1;

      if (signals.length > 0 || semantics.isLosa || semantics.hasSlashAliases) {
        hits.push({
          stage,
          schoolCode: school.schoolCode ?? null,
          label,
          signals,
          isLosa: semantics.isLosa,
          losaReason: semantics.losaReason,
          hasSlashAliases: semantics.hasSlashAliases,
          aliasLabels: semantics.aliasLabels ?? [],
          losaParseStatus: losaParsed.parseStatus,
          providerSchoolLabel: losaParsed.providerSchoolLabel,
          deliverySiteLabel: losaParsed.deliverySiteLabel,
        });
      }
    }
  }

  const stageCounts = Object.fromEntries(
    Object.entries(extractedStages).map(([stage, rows]) => [stage, (rows ?? []).length])
  );

  return {
    professionSlug,
    sourceUrl,
    stageCounts,
    losaRowCount: losaCount,
    slashAliasRowCount: slashCount,
    regionalHits: hits,
  };
}

async function loadDbSteigenContext() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { error: "missing_supabase_env", institutions: [], psaByProfession: {} };
  }

  const supabase = createClient(url, key);
  const { data: institutions, error } = await supabase
    .from("education_institutions")
    .select("id, name, municipality_name, municipality_code")
    .or("municipality_name.ilike.%Steigen%,name.ilike.%Steigen%,name.ilike.%Knut Hamsun%")
    .limit(50);

  if (error) {
    return { error: error.message, institutions: [], psaByProfession: {} };
  }

  const instRows = institutions ?? [];
  const instIds = instRows.map((row) => row.id);
  const psaByProfession = {};

  for (const profession of PROFESSIONS) {
    const countySlug = COUNTY_CODE_TO_VILBLI[COUNTY_CODE].slug;
    const { data: programs } = await supabase
      .from("education_programs")
      .select("id")
      .ilike("slug", `${profession}%-${countySlug}`)
      .eq("is_active", true);
    const programIds = (programs ?? []).map((row) => row.id);

    if (programIds.length === 0 || instIds.length === 0) {
      psaByProfession[profession] = [];
      continue;
    }

    const { data: psa } = await supabase
      .from("programme_school_availability")
      .select("stage, institution_id, education_program_id")
      .eq("county_code", COUNTY_CODE)
      .eq("is_active", true)
      .in("education_program_id", programIds)
      .in("institution_id", instIds);

    psaByProfession[profession] = (psa ?? []).map((row) => ({
      stage: row.stage,
      institutionId: row.institution_id,
      institutionName:
        instRows.find((inst) => inst.id === row.institution_id)?.name ?? null,
    }));
  }

  return {
    error: null,
    institutions: instRows,
    psaByProfession,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const countyMeta = COUNTY_CODE_TO_VILBLI[COUNTY_CODE];
  if (!countyMeta) {
    throw new Error(`Unknown county code: ${COUNTY_CODE}`);
  }

  const vilbliReports = [];
  for (const professionSlug of PROFESSIONS) {
    const pathDefinition = getVgsPathDefinition(professionSlug);
    if (!pathDefinition) {
      throw new Error(`Missing path definition: ${professionSlug}`);
    }

    const sourceUrl = pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);
    const loaded = await loadVilbliCountyHtml({ sourceUrl });
    const extracted = extractVilbliStagesFromHtml({
      html: loaded.html,
      professionSlug,
      countySlug: countyMeta.slug,
    });

    vilbliReports.push(
      summarizeProfessionVilbli(professionSlug, extracted.extractedStages ?? {}, sourceUrl)
    );
  }

  const dbContext = await loadDbSteigenContext();

  const payload = {
    scout: "nordland_regional_delivery",
    countyCode: COUNTY_CODE,
    countySlug: countyMeta.slug,
    at: new Date().toISOString(),
    vilbli: vilbliReports,
    dbSteigen: dbContext,
    synthesis: {
      losaOnNordland: vilbliReports.map((r) => ({
        profession: r.professionSlug,
        losaRows: r.losaRowCount,
      })),
      nordSaltenSlashOnlyOn: vilbliReports
        .filter((r) =>
          r.regionalHits.some((h) => h.signals.includes("nord_salten") && h.hasSlashAliases)
        )
        .map((r) => r.professionSlug),
      steigenLabelProfessions: vilbliReports
        .filter((r) => r.regionalHits.some((h) => h.signals.includes("steigen")))
        .map((r) => r.professionSlug),
    },
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log("Nordland regional delivery Vilbli scout (read-only)\n");
  for (const report of vilbliReports) {
    console.log(
      `${report.professionSlug}: VG1=${report.stageCounts.VG1 ?? 0} VG2=${report.stageCounts.VG2 ?? 0} VG3=${report.stageCounts.VG3 ?? 0} | LOSA rows=${report.losaRowCount} slash=${report.slashAliasRowCount}`
    );
    for (const hit of report.regionalHits) {
      console.log(`  [${hit.stage}] ${hit.label}`);
      if (hit.signals.length) console.log(`    signals: ${hit.signals.join(", ")}`);
    }
    console.log("");
  }

  console.log("DB Steigen / Knut Hamsun institutions:", dbContext.institutions.length);
  for (const inst of dbContext.institutions) {
    console.log(`  - ${inst.name} (${inst.municipality_name ?? "?"})`);
  }
  for (const profession of PROFESSIONS) {
    const rows = dbContext.psaByProfession[profession] ?? [];
    if (rows.length) {
      console.log(`PSA ${profession} @ Steigen-area institutions: ${rows.length}`);
      for (const row of rows) {
        console.log(`  - ${row.stage} ${row.institutionName}`);
      }
    }
  }
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
