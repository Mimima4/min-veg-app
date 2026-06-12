import { normalizeFylkeCodesFromMunicipalityCodes } from "@/lib/planning/norway-geo-code-normalization";
import { vilbliCountySlugsForFylkeCodes } from "@/lib/vgs/vilbli-county-meta";
import type { SupabaseClient } from "@supabase/supabase-js";

const PROGRAMME_SLUG_LOOKUP_CHUNK_SIZE = 80;

function parseRegionalProgrammeSlug(slug: string): {
  professionPrefix: string;
  regionSuffix: string;
} | null {
  const normalized = slug.trim().toLowerCase();
  const match = normalized.match(/^(.*)-vg[1-3]-.+-([a-z0-9]+)$/);
  if (!match) {
    return null;
  }
  const professionPrefix = match[1]?.trim();
  const regionSuffix = match[2]?.trim();
  if (!professionPrefix || !regionSuffix) {
    return null;
  }
  return { professionPrefix, regionSuffix };
}

function scopeProgrammeSlugsToChildCounties(params: {
  slugs: string[];
  countyCodes: string[];
}): string[] {
  const countySlugs = vilbliCountySlugsForFylkeCodes(params.countyCodes);
  if (countySlugs.size === 0) {
    return params.slugs;
  }

  const scoped = params.slugs.filter((slug) => {
    const parsed = parseRegionalProgrammeSlug(slug);
    if (!parsed) {
      return false;
    }
    return countySlugs.has(parsed.regionSuffix.toLowerCase());
  });

  return scoped.length > 0 ? scoped : params.slugs;
}

async function loadActiveProgrammeRowsBySlug(
  supabase: SupabaseClient,
  slugs: string[]
): Promise<Array<{ slug: string; program_code: string | null }>> {
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));
  if (uniqueSlugs.length === 0) {
    return [];
  }

  const rows: Array<{ slug: string; program_code: string | null }> = [];
  for (let index = 0; index < uniqueSlugs.length; index += PROGRAMME_SLUG_LOOKUP_CHUNK_SIZE) {
    const chunk = uniqueSlugs.slice(index, index + PROGRAMME_SLUG_LOOKUP_CHUNK_SIZE);
    const { data, error } = await supabase
      .from("education_programs")
      .select("slug, program_code")
      .in("slug", chunk)
      .eq("is_active", true);

    if (error) {
      throw new Error(
        `Failed to resolve programme codes for availability lookup: ${error.message}`
      );
    }

    rows.push(...((data ?? []) as Array<{ slug: string; program_code: string | null }>));
  }

  return rows;
}

export async function buildAvailabilityTruthLookupInputs(params: {
  supabase: SupabaseClient;
  preferredMunicipalityCodes: string[];
  primaryProgrammeSlugs: string[];
  fallbackProgrammeSlugs: string[];
}): Promise<{
  countyCodes: string[];
  programmeSlugsOrCodes: string[];
}> {
  const countyCodes = normalizeFylkeCodesFromMunicipalityCodes(
    params.preferredMunicipalityCodes
  );

  const orderedSlugs = scopeProgrammeSlugsToChildCounties({
    slugs: Array.from(
      new Set([...params.primaryProgrammeSlugs, ...params.fallbackProgrammeSlugs].filter(Boolean))
    ),
    countyCodes,
  });

  const countySlugs = vilbliCountySlugsForFylkeCodes(countyCodes);

  const regionalSignatures = Array.from(
    new Set(
      orderedSlugs
        .map((slug) => parseRegionalProgrammeSlug(slug))
        .filter(
          (
            value
          ): value is {
            professionPrefix: string;
            regionSuffix: string;
          } => Boolean(value)
        )
        .map((value) => `${value.professionPrefix}|${value.regionSuffix}`)
    )
  );

  const regionalSiblingSlugs: string[] = [];
  for (const signature of regionalSignatures) {
    const [professionPrefix, regionSuffix] = signature.split("|");
    if (!professionPrefix || !regionSuffix) {
      continue;
    }
    if (countySlugs.size > 0 && !countySlugs.has(regionSuffix.toLowerCase())) {
      continue;
    }

    const pattern = `${professionPrefix}-vg%-%-${regionSuffix}`;
    const { data: siblingRows, error: siblingError } = await params.supabase
      .from("education_programs")
      .select("slug")
      .ilike("slug", pattern)
      .eq("is_active", true);

    if (siblingError) {
      throw new Error(
        `Failed to resolve regional sibling programme slugs for availability lookup: ${siblingError.message}`
      );
    }

    for (const row of (siblingRows ?? []) as Array<{ slug: string }>) {
      if (row.slug) {
        regionalSiblingSlugs.push(row.slug);
      }
    }
  }

  const expandedOrderedSlugs = Array.from(
    new Set([...orderedSlugs, ...regionalSiblingSlugs].filter(Boolean))
  );

  if (expandedOrderedSlugs.length === 0) {
    return {
      countyCodes,
      programmeSlugsOrCodes: [],
    };
  }

  const rows = await loadActiveProgrammeRowsBySlug(params.supabase, expandedOrderedSlugs);

  const codeBySlug = new Map(
    rows.map((row) => [row.slug, row.program_code])
  );

  const orderedInputs: string[] = [];
  for (const slug of expandedOrderedSlugs) {
    orderedInputs.push(slug);
    const code = codeBySlug.get(slug);
    if (code && code.trim().length > 0) {
      orderedInputs.push(code);
    }
  }

  return {
    countyCodes,
    programmeSlugsOrCodes: Array.from(new Set(orderedInputs)),
  };
}
