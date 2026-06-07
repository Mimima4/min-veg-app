#!/usr/bin/env node
/**
 * P4-LOSA-PSA-WRITE bounded pilot execution — max 1 row per charter session.
 */
import {
  DEFAULT_ALTA_PILOT_CHARTER_ID,
  DEFAULT_HAMMERFEST_PILOT_CHARTER_ID,
  DEFAULT_SOR_VARANGER_PILOT_CHARTER_ID,
  DEFAULT_PORSANGER_PILOT_CHARTER_ID,
  DEFAULT_KARASJOK_PILOT_CHARTER_ID,
  DEFAULT_KAUTOKEINO_PILOT_CHARTER_ID,
  DEFAULT_VARDO_PILOT_CHARTER_ID,
  DEFAULT_NESSEBY_PILOT_CHARTER_ID,
  DEFAULT_TANA_PILOT_CHARTER_ID,
  DEFAULT_LEBESBY_PILOT_CHARTER_ID,
  DEFAULT_GAMVIK_PILOT_CHARTER_ID,
  DEFAULT_BERLEVAG_PILOT_CHARTER_ID,
  DEFAULT_HASVIK_PILOT_CHARTER_ID,
  DEFAULT_BATSFJORD_PILOT_CHARTER_ID,
  DEFAULT_LOPPA_PILOT_CHARTER_ID,
  DEFAULT_MASOY_PILOT_CHARTER_ID,
  buildResolvedWriteCandidate,
  createServiceSupabase,
  insertLosaPsaRow,
  loadLosaWritePreview,
  losaPsaRowExists,
  resolveCharteredWriteProfile,
  resolveEducationProgramId,
  selectCharteredCandidates,
} from "./lib/losa-psa-write-session.mjs";

const DEFAULT_COUNTY = "56";
const DEFAULT_PROFESSION = "electrician";
const DEFAULT_MAX_ROWS = 1;

function parseArgs(argv) {
  const args = {
    profession: DEFAULT_PROFESSION,
    county: DEFAULT_COUNTY,
    deliverySite: null,
    vilbliSchoolCode: null,
    charterId: null,
    htmlFile: null,
    execute: false,
    json: false,
    maxRows: DEFAULT_MAX_ROWS,
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
    if (token === "--delivery-site" && argv[i + 1]) {
      args.deliverySite = argv[++i];
      continue;
    }
    if (token === "--vilbli-school-code" && argv[i + 1]) {
      args.vilbliSchoolCode = argv[++i];
      continue;
    }
    if (token === "--charter-id" && argv[i + 1]) {
      args.charterId = argv[++i];
      continue;
    }
    if (token === "--html-file" && argv[i + 1]) {
      args.htmlFile = argv[++i];
      continue;
    }
    if (token === "--max-rows" && argv[i + 1]) {
      args.maxRows = Number(argv[++i]);
      continue;
    }
    if (token === "--execute") {
      args.execute = true;
      continue;
    }
    if (token === "--json") {
      args.json = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log(`Usage: node scripts/execute-losa-psa-write-pilot.mjs [options]

Options:
  --charter-id <id>     Required for --execute
  --execute             Perform insert (default: dry-run only)
  --delivery-site       Override chartered delivery site
  --vilbli-school-code  Override chartered Vilbli code
  --max-rows 1          Bounded row count (default: 1)
  --json                JSON output

Known charters:
  ${DEFAULT_ALTA_PILOT_CHARTER_ID}
  ${DEFAULT_HAMMERFEST_PILOT_CHARTER_ID}
  ${DEFAULT_SOR_VARANGER_PILOT_CHARTER_ID}
  ${DEFAULT_PORSANGER_PILOT_CHARTER_ID}
  ${DEFAULT_KARASJOK_PILOT_CHARTER_ID}
  ${DEFAULT_KAUTOKEINO_PILOT_CHARTER_ID}
  ${DEFAULT_VARDO_PILOT_CHARTER_ID}
  ${DEFAULT_NESSEBY_PILOT_CHARTER_ID}
  ${DEFAULT_TANA_PILOT_CHARTER_ID}
  ${DEFAULT_LEBESBY_PILOT_CHARTER_ID}
  ${DEFAULT_GAMVIK_PILOT_CHARTER_ID}
  ${DEFAULT_BERLEVAG_PILOT_CHARTER_ID}
  ${DEFAULT_HASVIK_PILOT_CHARTER_ID}
  ${DEFAULT_BATSFJORD_PILOT_CHARTER_ID}
  ${DEFAULT_LOPPA_PILOT_CHARTER_ID}
  ${DEFAULT_MASOY_PILOT_CHARTER_ID}`);
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  return args;
}

function applyCharterProfile(args) {
  if (!args.charterId) {
    return {
      ...args,
      deliverySite: args.deliverySite ?? "Alta",
      vilbliSchoolCode: args.vilbliSchoolCode ?? "872137",
      snapshotLabel: "losa-alta-pilot-2026-05-29",
    };
  }

  const profile = resolveCharteredWriteProfile(args.charterId);
  return {
    ...args,
    deliverySite: args.deliverySite ?? profile.deliverySite,
    vilbliSchoolCode: args.vilbliSchoolCode ?? profile.vilbliSchoolCode,
    snapshotLabel: profile.snapshotLabel,
  };
}

async function main() {
  const args = applyCharterProfile(parseArgs(process.argv));

  if (args.execute && !args.charterId) {
    throw new Error("--execute requires --charter-id");
  }

  if (args.execute) {
    resolveCharteredWriteProfile(args.charterId);
  }

  const { preview, sourceUrl } = await loadLosaWritePreview({
    profession: args.profession,
    countyCode: args.county,
    htmlFile: args.htmlFile,
  });

  const selected = selectCharteredCandidates(preview, {
    deliverySiteLabel: args.deliverySite,
    maxRows: args.maxRows,
    vilbliSchoolCode: args.vilbliSchoolCode,
  });

  if (selected.length !== 1) {
    throw new Error(
      `Expected exactly 1 chartered candidate for ${args.deliverySite}, got ${selected.length}`
    );
  }

  const supabase = createServiceSupabase();
  const programme = await resolveEducationProgramId(supabase, {
    profession: args.profession,
    countyCode: args.county,
    stage: "VG1",
  });

  const resolved = await buildResolvedWriteCandidate(supabase, {
    candidate: selected[0],
    educationProgramId: programme.educationProgramId,
    sourceUrl,
    snapshotLabel: args.snapshotLabel,
  });

  const exists = await losaPsaRowExists(supabase, resolved.insertPayload);

  const result = {
    section: "P4-LOSA-PSA-WRITE-PILOT",
    mode: args.execute ? "execute" : "dry-run",
    charterId: args.charterId,
    deliverySite: args.deliverySite,
    vilbliSchoolCode: args.vilbliSchoolCode,
    programmeSlug: programme.slug,
    providerInstitutionName: resolved.providerResolution.institutionName,
    availabilityScope: resolved.insertPayload.availability_scope,
    municipalityCode: resolved.insertPayload.municipality_code,
    alreadyExists: exists,
    inserted: false,
    rowId: null,
  };

  if (args.execute) {
    if (exists) {
      result.skipped = true;
      result.reason = "row_already_exists";
    } else {
      const row = await insertLosaPsaRow(supabase, resolved.insertPayload);
      result.inserted = true;
      result.rowId = row.id;
    }
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(
      [
        `P4-LOSA-PSA-WRITE pilot (${args.county} / ${args.profession})`,
        `mode: ${result.mode}`,
        `charter: ${args.charterId ?? "(dry-run)"}`,
        `delivery: ${args.deliverySite} | vilbli: ${args.vilbliSchoolCode}`,
        `programme: ${programme.slug}`,
        `provider: ${resolved.providerResolution.institutionName}`,
        `scope: ${resolved.insertPayload.availability_scope}`,
        `municipality_code: ${resolved.insertPayload.municipality_code}`,
        `already exists: ${exists}`,
        args.execute
          ? result.inserted
            ? `INSERTED row id: ${result.rowId}`
            : "SKIPPED (already exists)"
          : "DRY-RUN — pass --execute --charter-id to insert",
      ].join("\n")
    );
  }

  if (!args.execute && exists) {
    console.error("\nNote: row already exists in DB");
  }
}

main().catch((error) => {
  console.error(error?.message ?? error);
  process.exit(1);
});
