import {
  assessNorthCrossFylkeSplitRouteTruthEligibility,
  listNorthCrossFylkeReachableNeighborCountyCodes,
  NORTH_CROSS_FYLKE_HOME_FYLKE_CODES,
  NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS,
  northCrossFylkeHomeVg1ProgrammeSlugsForFylke,
  northCrossFylkeProgrammeSlugsForFylke,
} from "@/lib/regional-delivery/painter-north-cross-fylke-pilot";
import { SUPPORTED_VGS_PROFESSION_SLUGS } from "@/lib/vgs/contour-b-operational-eligibility";
import { getAvailabilityTruth } from "@/server/children/routes/get-availability-truth";
import { loadVilbliHomeVg2ContinuationTruthRows } from "@/server/children/routes/load-vilbli-home-vg2-continuation-truth-rows";
import { professionHasPrimaryRouteInCounty } from "@/server/vgs/profession-has-primary-route-in-county";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * V.BA VG2 programme picker gate: show a sibling profession when a full route is
 * buildable in the home fylke context — primary (local VG1+VG2) or curated
 * alternative (P-7 north nabofylke split).
 */
export async function professionHasBuildableRouteInFylke(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  countyCode: string;
  preferredMunicipalityCodes?: string[];
}): Promise<boolean> {
  const countyCode = String(params.countyCode ?? "").trim();
  const professionSlug = String(params.professionSlug ?? "").trim();
  if (!countyCode || !professionSlug) {
    return false;
  }

  if (
    await professionHasPrimaryRouteInCounty({
      supabase: params.supabase,
      professionSlug,
      countyCode,
    })
  ) {
    return true;
  }

  if (
    SUPPORTED_VGS_PROFESSION_SLUGS.has(professionSlug) &&
    NORTH_CROSS_FYLKE_HOME_FYLKE_CODES.has(countyCode)
  ) {
    return professionHasNorthCrossFylkeSplitRouteInHomeFylke({
      supabase: params.supabase,
      professionSlug,
      countyCode,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    });
  }

  return false;
}

async function professionHasNorthCrossFylkeSplitRouteInHomeFylke(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  countyCode: string;
  preferredMunicipalityCodes?: string[];
}): Promise<boolean> {
  const homeFylkeCode = String(params.countyCode ?? "").trim();
  const municipalityCodes = (params.preferredMunicipalityCodes ?? []).filter(
    (code) => typeof code === "string" && code.trim().length > 0
  );

  const neighborCountyCodes =
    municipalityCodes.length > 0
      ? listNorthCrossFylkeReachableNeighborCountyCodes(municipalityCodes)
      : NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS.map((neighbor) => neighbor.countyCode).filter(
          (code) => code !== homeFylkeCode
        );

  if (neighborCountyCodes.length === 0) {
    return false;
  }

  const homeProgrammeSlugs = Array.from(
    new Set([
      ...northCrossFylkeHomeVg1ProgrammeSlugsForFylke({
        professionSlug: params.professionSlug,
        fylkeCode: homeFylkeCode,
      }),
      ...northCrossFylkeProgrammeSlugsForFylke({
        professionSlug: params.professionSlug,
        fylkeCode: homeFylkeCode,
      }),
    ])
  );
  if (homeProgrammeSlugs.length === 0) {
    return false;
  }

  const [homeTruth, continuationRows] = await Promise.all([
    getAvailabilityTruth({
      countyCode: homeFylkeCode,
      programmeSlugsOrCodes: homeProgrammeSlugs,
    }),
    loadVilbliHomeVg2ContinuationTruthRows({
      supabase: params.supabase,
      professionSlug: params.professionSlug,
      homeCountyCode: homeFylkeCode,
    }),
  ]);

  for (const neighborCountyCode of neighborCountyCodes) {
    const neighborProgrammeSlugs = northCrossFylkeProgrammeSlugsForFylke({
      professionSlug: params.professionSlug,
      fylkeCode: neighborCountyCode,
    });
    if (neighborProgrammeSlugs.length === 0) {
      continue;
    }

    const neighborTruth = await getAvailabilityTruth({
      countyCode: neighborCountyCode,
      programmeSlugsOrCodes: neighborProgrammeSlugs,
    });

    if (
      assessNorthCrossFylkeSplitRouteTruthEligibility({
        professionSlug: params.professionSlug,
        homeRows: homeTruth.rows,
        neighborRows: neighborTruth.rows,
        continuationRows,
      }).eligible
    ) {
      return true;
    }
  }

  return assessNorthCrossFylkeSplitRouteTruthEligibility({
    professionSlug: params.professionSlug,
    homeRows: homeTruth.rows,
    neighborRows: [],
    continuationRows,
  }).eligible;
}
