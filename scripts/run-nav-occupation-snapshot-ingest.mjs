#!/usr/bin/env node
/**
 * P4-NM-B — ingest NAV / STYRK occupation snapshot to production DB.
 *
 * Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 *   node --experimental-strip-types scripts/run-nav-occupation-snapshot-ingest.mjs
 *   node --experimental-strip-types scripts/run-nav-occupation-snapshot-ingest.mjs --dry-run
 */
import { createClient } from "@supabase/supabase-js";
import { parseNavTaxonomyHtml } from "../src/lib/nav/parse-nav-taxonomy-html.ts";
import {
  PATH_FAMILY_OUTCOME_NAV_MAP_ROWS,
  PATH_FAMILY_OUTCOME_NAV_MAP_VERSION,
} from "../src/lib/nav/path-family-outcome-nav-map.ts";

function collectPathFamilyMapStyrkCodes(mapVersion = PATH_FAMILY_OUTCOME_NAV_MAP_VERSION) {
  return Array.from(
    new Set(
      PATH_FAMILY_OUTCOME_NAV_MAP_ROWS.filter((row) => row.mapVersion === mapVersion).map(
        (row) => row.navStyrkCode
      )
    )
  );
}

function validatePathFamilyMapAgainstSnapshot({ occupationCodes, mapVersion }) {
  const version = mapVersion ?? PATH_FAMILY_OUTCOME_NAV_MAP_VERSION;
  const missingStyrkCodes = collectPathFamilyMapStyrkCodes(version).filter(
    (code) => !occupationCodes.has(code)
  );
  if (missingStyrkCodes.length > 0) {
    return { ok: false, missingStyrkCodes };
  }
  return { ok: true };
}

const NAV_TAXONOMY_SOURCE_URL = "https://arbeidsplassen.nav.no/stillinger";

async function fetchNavTaxonomyFromSource() {
  const response = await fetch(NAV_TAXONOMY_SOURCE_URL, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) {
    throw new Error(`NAV taxonomy request failed (${response.status})`);
  }
  const parsed = parseNavTaxonomyHtml(await response.text(), NAV_TAXONOMY_SOURCE_URL);

  return {
    sourceUrl: parsed.sourceUrl,
    sourceFetchedAt: new Date().toISOString(),
    level1Categories: parsed.level1Categories,
    occupations: parsed.occupations,
  };
}

function parseArgs(argv) {
  return { dryRun: argv.includes("--dry-run") };
}

async function getNextSnapshotVersion(supabase) {
  const { data, error } = await supabase
    .from("nav_occupation_snapshots")
    .select("snapshot_version")
    .order("snapshot_version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to read latest NAV snapshot version: ${error.message}`);
  }

  return (data?.snapshot_version ?? 0) + 1;
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2));

  const fetched = await fetchNavTaxonomyFromSource();
  const occupationCodes = new Set(fetched.occupations.map((row) => row.code));

  const mapValidation = validatePathFamilyMapAgainstSnapshot({
    occupationCodes,
    mapVersion: PATH_FAMILY_OUTCOME_NAV_MAP_VERSION,
  });

  if (!mapValidation.ok) {
    throw new Error(
      `path_family_outcome_nav_map v${PATH_FAMILY_OUTCOME_NAV_MAP_VERSION} references STYRK codes missing from NAV source: ${mapValidation.missingStyrkCodes.join(", ")}`
    );
  }

  const requiredMapCodes = collectPathFamilyMapStyrkCodes(PATH_FAMILY_OUTCOME_NAV_MAP_VERSION);

  if (dryRun) {
    console.error(
      `[nav-snapshot-ingest] occupations=${fetched.occupations.length} mapCodes=${requiredMapCodes.length} dryRun=true`
    );
    console.error("[nav-snapshot-ingest] dry_run_ok");
    return;
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const nextVersion = await getNextSnapshotVersion(supabase);
  console.error(
    `[nav-snapshot-ingest] occupations=${fetched.occupations.length} nextVersion=${nextVersion} mapCodes=${requiredMapCodes.length} dryRun=false`
  );

  const { error: clearCurrentError } = await supabase
    .from("nav_occupation_snapshots")
    .update({ is_current: false })
    .eq("is_current", true);

  if (clearCurrentError) {
    throw new Error(`Failed to clear current NAV snapshot flag: ${clearCurrentError.message}`);
  }

  const { error: insertHeaderError } = await supabase.from("nav_occupation_snapshots").insert({
    snapshot_version: nextVersion,
    source_url: fetched.sourceUrl,
    source_fetched_at: fetched.sourceFetchedAt,
    occupation_count: fetched.occupations.length,
    path_family_map_version: PATH_FAMILY_OUTCOME_NAV_MAP_VERSION,
    is_current: true,
  });

  if (insertHeaderError) {
    throw new Error(`Failed to insert NAV snapshot header: ${insertHeaderError.message}`);
  }

  const rowPayload = fetched.occupations.map((occupation) => ({
    snapshot_version: nextVersion,
    styrk_code: occupation.code,
    label: occupation.label,
    level1_code: occupation.level1Code,
    level1_label: occupation.level1Label,
    source_reference_url: fetched.sourceUrl,
  }));

  const chunkSize = 100;
  for (let offset = 0; offset < rowPayload.length; offset += chunkSize) {
    const chunk = rowPayload.slice(offset, offset + chunkSize);
    const { error: insertRowsError } = await supabase
      .from("nav_occupation_snapshot_rows")
      .insert(chunk);

    if (insertRowsError) {
      throw new Error(`Failed to insert NAV snapshot rows: ${insertRowsError.message}`);
    }
  }

  console.error(`[nav-snapshot-ingest] ingested version=${nextVersion}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
