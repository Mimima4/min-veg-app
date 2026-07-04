import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildVg2ProgrammeOptionsFromTruthRows,
  type Vg2ProgrammeOption,
} from "@/lib/vgs/vg2-programme-options";
import {
  extractRegionalCountySuffixFromProgramSlugs,
  isVbaSharedVg1Profession,
  resolveProfessionSlugFromProgramSlug,
  VBA_SHARED_VG1_PROFESSION_SLUGS,
} from "@/lib/vgs/vg2-cross-profession";

type TruthRowSlice = {
  stage: string;
  programSlug: string;
  programTitle: string | null;
};

function sortProgrammeOptions(options: Vg2ProgrammeOption[]): Vg2ProgrammeOption[] {
  return [...options].sort((a, b) =>
    a.program_title.localeCompare(b.program_title, "nb")
  );
}

export async function resolveVbaSharedVg2ProgrammeOptions(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  truthRows: TruthRowSlice[];
}): Promise<Vg2ProgrammeOption[]> {
  const fromTruth = buildVg2ProgrammeOptionsFromTruthRows(params.truthRows).map((option) => ({
    ...option,
    profession_slug:
      option.profession_slug ?? resolveProfessionSlugFromProgramSlug(option.program_slug) ?? params.professionSlug,
  }));

  if (!isVbaSharedVg1Profession(params.professionSlug)) {
    return sortProgrammeOptions(fromTruth);
  }

  const countySuffix = extractRegionalCountySuffixFromProgramSlugs(
    params.truthRows.map((row) => row.programSlug)
  );
  if (!countySuffix) {
    return sortProgrammeOptions(fromTruth);
  }

  const bySlug = new Map<string, Vg2ProgrammeOption>();
  for (const option of fromTruth) {
    bySlug.set(option.program_slug, option);
  }

  for (const siblingProfessionSlug of VBA_SHARED_VG1_PROFESSION_SLUGS) {
    const pattern = `${siblingProfessionSlug}-vg2-%-${countySuffix}`;
    const { data, error } = await params.supabase
      .from("education_programs")
      .select("slug, title")
      .ilike("slug", pattern)
      .eq("is_active", true);

    if (error) {
      throw new Error(
        `Failed to resolve V.BA sibling VG2 programmes for ${siblingProfessionSlug}: ${error.message}`
      );
    }

    for (const row of (data ?? []) as Array<{ slug: string; title: string | null }>) {
      const slug = String(row.slug ?? "").trim();
      if (!slug || bySlug.has(slug)) continue;
      bySlug.set(slug, {
        program_slug: slug,
        program_title: String(row.title ?? slug).trim(),
        profession_slug: siblingProfessionSlug,
      });
    }
  }

  return sortProgrammeOptions(Array.from(bySlug.values()));
}
