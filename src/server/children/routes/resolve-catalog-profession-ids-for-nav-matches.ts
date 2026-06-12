import type { SupabaseClient } from "@supabase/supabase-js";
import type { PathFamilyNavMatch } from "./resolve-path-family-nav-matches";

export async function resolveCatalogProfessionIdsForNavMatches(params: {
  supabase: SupabaseClient;
  navMatches: PathFamilyNavMatch[];
}): Promise<Map<string, string>> {
  const slugs = Array.from(
    new Set(
      params.navMatches
        .map((match) => match.catalogProfessionSlug)
        .filter((slug): slug is string => Boolean(slug))
    )
  );

  if (slugs.length === 0) {
    return new Map();
  }

  const { data, error } = await params.supabase
    .from("professions")
    .select("id, slug")
    .in("slug", slugs)
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to resolve catalog profession ids: ${error.message}`);
  }

  return new Map(
    ((data ?? []) as Array<{ id: string; slug: string }>).map((row) => [row.slug, row.id])
  );
}

export function attachCatalogProfessionIdsToNavMatches(params: {
  navMatches: PathFamilyNavMatch[];
  professionIdBySlug: Map<string, string>;
}): Array<{
  navTitle: string;
  navYrkeskategori: string | null;
  reviewNeeded: false;
  catalogProfessionId: string | null;
  sourceOutcome: PathFamilyNavMatch["sourceOutcome"];
}> {
  return params.navMatches.map((match) => ({
    navTitle: match.navTitle,
    navYrkeskategori: match.navYrkeskategori,
    reviewNeeded: false,
    catalogProfessionId:
      params.professionIdBySlug.get(match.catalogProfessionSlug) ?? null,
    sourceOutcome: match.sourceOutcome,
  }));
}
