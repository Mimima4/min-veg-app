import type { SupabaseClient } from "@supabase/supabase-js";

export type NavOccupationSnapshotRow = {
  styrkCode: string;
  label: string;
  level1Code: string | null;
  level1Label: string | null;
  sourceReferenceUrl: string;
};

export type NavOccupationSnapshot = {
  snapshotVersion: number;
  sourceUrl: string;
  sourceFetchedAt: string;
  occupationCount: number;
  pathFamilyMapVersion: number | null;
  occupations: NavOccupationSnapshotRow[];
  occupationsByCode: Map<string, NavOccupationSnapshotRow>;
};

export async function getCurrentNavOccupationSnapshot(
  supabase: SupabaseClient
): Promise<NavOccupationSnapshot | null> {
  const { data: header, error: headerError } = await supabase
    .from("nav_occupation_snapshots")
    .select(
      "snapshot_version, source_url, source_fetched_at, occupation_count, path_family_map_version"
    )
    .eq("is_current", true)
    .maybeSingle();

  if (headerError) {
    throw new Error(`Failed to load NAV occupation snapshot header: ${headerError.message}`);
  }
  if (!header) {
    return null;
  }

  const { data: rows, error: rowsError } = await supabase
    .from("nav_occupation_snapshot_rows")
    .select("styrk_code, label, level1_code, level1_label, source_reference_url")
    .eq("snapshot_version", header.snapshot_version);

  if (rowsError) {
    throw new Error(`Failed to load NAV occupation snapshot rows: ${rowsError.message}`);
  }

  const occupations: NavOccupationSnapshotRow[] = (rows ?? []).map((row) => ({
    styrkCode: row.styrk_code,
    label: row.label,
    level1Code: row.level1_code,
    level1Label: row.level1_label,
    sourceReferenceUrl: row.source_reference_url,
  }));

  return {
    snapshotVersion: header.snapshot_version,
    sourceUrl: header.source_url,
    sourceFetchedAt: header.source_fetched_at,
    occupationCount: header.occupation_count,
    pathFamilyMapVersion: header.path_family_map_version,
    occupations,
    occupationsByCode: new Map(occupations.map((row) => [row.styrkCode, row])),
  };
}
