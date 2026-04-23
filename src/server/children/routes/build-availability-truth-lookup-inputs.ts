import { normalizeFylkeCodesFromMunicipalityCodes } from "@/lib/planning/norway-geo-code-normalization";
import type { SupabaseClient } from "@supabase/supabase-js";

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

  const orderedSlugs = Array.from(
    new Set([...params.primaryProgrammeSlugs, ...params.fallbackProgrammeSlugs].filter(Boolean))
  );

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

  const { data: rows, error } = await params.supabase
    .from("education_programs")
    .select("slug, program_code")
    .in("slug", expandedOrderedSlugs)
    .eq("is_active", true);

  if (error) {
    throw new Error(
      `Failed to resolve programme codes for availability lookup: ${error.message}`
    );
  }

  const codeBySlug = new Map(
    ((rows ?? []) as Array<{ slug: string; program_code: string | null }>).map((row) => [
      row.slug,
      row.program_code,
    ])
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
