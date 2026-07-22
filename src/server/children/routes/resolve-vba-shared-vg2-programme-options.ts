import type { SupabaseClient } from "@supabase/supabase-js";

import {
  NORTH_CROSS_FYLKE_HOME_FYLKE_CODES,
  northCrossFylkeNabofylkeVg2ProgrammeSlug,
  northCrossFylkeVg2TitleNb,
} from "@/lib/regional-delivery/painter-north-cross-fylke-pilot";
import { toStageAwareProgrammeTitle } from "@/lib/vgs/stage-aware-programme-title";
import {
  buildVg2ProgrammeOptionsFromTruthRows,
  dedupeVg2ProgrammeOptionsByProfession,
  isNabofylkeVg2ProgrammeSlug,
  type Vg2ProgrammeOption,
} from "@/lib/vgs/vg2-programme-options";
import {
  extractRegionalCountySuffixFromProgramSlugs,
  isVbaSharedVg1Profession,
  resolveProfessionSlugFromProgramSlug,
  VBA_SHARED_VG1_PROFESSION_SLUGS,
} from "@/lib/vgs/vg2-cross-profession";
import { professionHasBuildableRouteInFylke } from "@/server/vgs/profession-has-buildable-route-in-fylke";
import { professionHasPrimaryRouteInCounty } from "@/server/vgs/profession-has-primary-route-in-county";

type TruthRowSlice = {
  stage: string;
  programSlug: string;
  programTitle: string | null;
  countyCode?: string;
};

function sortProgrammeOptions(options: Vg2ProgrammeOption[]): Vg2ProgrammeOption[] {
  return [...options].sort((a, b) =>
    a.program_title.localeCompare(b.program_title, "nb")
  );
}

async function resolveEligibleVbaSiblingProfessions(params: {
  supabase: SupabaseClient;
  countyCode: string;
  preferredMunicipalityCodes?: string[];
}): Promise<Set<string>> {
  const eligible = new Set<string>();
  await Promise.all(
    VBA_SHARED_VG1_PROFESSION_SLUGS.map(async (professionSlug) => {
      const hasRoute = await professionHasBuildableRouteInFylke({
        supabase: params.supabase,
        professionSlug,
        countyCode: params.countyCode,
        preferredMunicipalityCodes: params.preferredMunicipalityCodes,
      });
      if (hasRoute) {
        eligible.add(professionSlug);
      }
    })
  );
  return eligible;
}

function isVg2OptionAllowedForProfession(params: {
  option: Vg2ProgrammeOption;
  routeProfessionSlug: string;
  eligibleSiblingProfessions: Set<string>;
}): boolean {
  const optionProfession =
    params.option.profession_slug ??
    resolveProfessionSlugFromProgramSlug(params.option.program_slug) ??
    params.routeProfessionSlug;

  return params.eligibleSiblingProfessions.has(optionProfession);
}

function nabofylkeDisplayTitle(professionSlug: string): string {
  return toStageAwareProgrammeTitle({
    stage: "VG2",
    title: northCrossFylkeVg2TitleNb(professionSlug),
  });
}

export async function resolveVbaSharedVg2ProgrammeOptions(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  truthRows: TruthRowSlice[];
  preferredMunicipalityCodes?: string[];
}): Promise<Vg2ProgrammeOption[]> {
  const homeCountyCode =
    params.truthRows.map((row) => String(row.countyCode ?? "").trim()).find(Boolean) ?? "";

  const fromTruth = buildVg2ProgrammeOptionsFromTruthRows(params.truthRows).map((option) => ({
    ...option,
    profession_slug:
      option.profession_slug ??
      resolveProfessionSlugFromProgramSlug(option.program_slug) ??
      params.professionSlug,
  }));

  if (!isVbaSharedVg1Profession(params.professionSlug)) {
    return sortProgrammeOptions(fromTruth);
  }

  const countySuffix = extractRegionalCountySuffixFromProgramSlugs(
    params.truthRows.map((row) => row.programSlug)
  );
  if (!countySuffix || !homeCountyCode) {
    return sortProgrammeOptions(fromTruth);
  }

  const eligibleSiblingProfessions = await resolveEligibleVbaSiblingProfessions({
    supabase: params.supabase,
    countyCode: homeCountyCode,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
  });

  const bySlug = new Map<string, Vg2ProgrammeOption>();
  for (const option of fromTruth) {
    if (
      !isVg2OptionAllowedForProfession({
        option,
        routeProfessionSlug: params.professionSlug,
        eligibleSiblingProfessions,
      })
    ) {
      continue;
    }
    bySlug.set(option.program_slug, option);
  }

  const isNorthHome = NORTH_CROSS_FYLKE_HOME_FYLKE_CODES.has(homeCountyCode);

  for (const siblingProfessionSlug of VBA_SHARED_VG1_PROFESSION_SLUGS) {
    if (!eligibleSiblingProfessions.has(siblingProfessionSlug)) {
      continue;
    }

    const hasPrimary = isNorthHome
      ? await professionHasPrimaryRouteInCounty({
          supabase: params.supabase,
          professionSlug: siblingProfessionSlug,
          countyCode: homeCountyCode,
        })
      : true;

    // North + no local PSA primary → nabofylke only (ignore catalogue county rows).
    if (isNorthHome && !hasPrimary) {
      for (const [slug, option] of [...bySlug.entries()]) {
        if (
          option.profession_slug === siblingProfessionSlug &&
          !isNabofylkeVg2ProgrammeSlug(slug) &&
          slug.endsWith(`-${countySuffix}`)
        ) {
          bySlug.delete(slug);
        }
      }

      const nabofylkeSlug = northCrossFylkeNabofylkeVg2ProgrammeSlug(siblingProfessionSlug);
      bySlug.set(nabofylkeSlug, {
        program_slug: nabofylkeSlug,
        program_title: nabofylkeDisplayTitle(siblingProfessionSlug),
        profession_slug: siblingProfessionSlug,
      });
      continue;
    }

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
      if (!slug || isNabofylkeVg2ProgrammeSlug(slug) || bySlug.has(slug)) continue;
      bySlug.set(slug, {
        program_slug: slug,
        program_title: String(row.title ?? slug).trim(),
        profession_slug: siblingProfessionSlug,
      });
    }
  }

  return dedupeVg2ProgrammeOptionsByProfession({
    options: Array.from(bySlug.values()),
    countySuffix,
    routeProfessionSlug: params.professionSlug,
  });
}
