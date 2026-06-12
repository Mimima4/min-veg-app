import { parseNavTaxonomyHtml } from "@/lib/nav/parse-nav-taxonomy-html";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCurrentNavOccupationSnapshot } from "@/server/nav/get-nav-occupation-snapshot";

export type NavTaxonomyCategory = {
  code: string;
  label: string;
};

export type NavTaxonomyOccupation = {
  code: string;
  label: string;
  level1Code: string | null;
};

export type NavTaxonomySnapshot = {
  sourceUrl: string;
  snapshotVersion: number;
  level1Categories: NavTaxonomyCategory[];
  occupations: NavTaxonomyOccupation[];
};

export const NAV_TAXONOMY_SOURCE_URL = "https://arbeidsplassen.nav.no/stillinger";

/** Ingest only — never call from route request path. */
export async function fetchNavTaxonomyFromSource(): Promise<{
  sourceUrl: string;
  sourceFetchedAt: string;
  level1Categories: NavTaxonomyCategory[];
  occupations: Array<NavTaxonomyOccupation & { level1Label: string | null }>;
}> {
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

/** Production read path — materialized snapshot only. */
export async function getNavTaxonomySnapshot(
  supabase: SupabaseClient
): Promise<NavTaxonomySnapshot> {
  const snapshot = await getCurrentNavOccupationSnapshot(supabase);
  if (!snapshot) {
    throw new Error(
      "NAV occupation snapshot is not loaded. Run scripts/run-nav-occupation-snapshot-ingest.mjs"
    );
  }

  const level1Categories = new Map<string, NavTaxonomyCategory>();
  for (const row of snapshot.occupations) {
    if (row.level1Code && row.level1Label && !level1Categories.has(row.level1Code)) {
      level1Categories.set(row.level1Code, {
        code: row.level1Code,
        label: row.level1Label,
      });
    }
  }

  return {
    sourceUrl: snapshot.sourceUrl,
    snapshotVersion: snapshot.snapshotVersion,
    level1Categories: Array.from(level1Categories.values()),
    occupations: snapshot.occupations.map((row) => ({
      code: row.styrkCode,
      label: row.label,
      level1Code: row.level1Code,
    })),
  };
}
