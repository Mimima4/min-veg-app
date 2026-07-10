import {
  assessPainterNorthSplitRouteTruthEligibility,
  listPainterNorthReachableNeighborCountyCodes,
  PAINTER_NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS,
  PAINTER_NORTH_HOME_FYLKE_CODES,
  painterHomeVg1ProgrammeSlugsForFylke,
  painterProgrammeSlugsForFylke,
} from "@/lib/regional-delivery/painter-north-cross-fylke-pilot";
import { getAvailabilityTruth } from "@/server/children/routes/get-availability-truth";
import { professionHasPrimaryRouteInCounty } from "@/server/vgs/profession-has-primary-route-in-county";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * V.BA VG2 programme picker gate: show a sibling profession when a full route is
 * buildable in the home fylke context — primary (local VG1+VG2) or curated
 * alternative (e.g. painter P-7 north split).
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

  if (professionSlug === "painter" && PAINTER_NORTH_HOME_FYLKE_CODES.has(countyCode)) {
    return professionHasPainterNorthSplitRouteInHomeFylke({
      supabase: params.supabase,
      countyCode,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    });
  }

  return false;
}

async function professionHasPainterNorthSplitRouteInHomeFylke(params: {
  supabase: SupabaseClient;
  countyCode: string;
  preferredMunicipalityCodes?: string[];
}): Promise<boolean> {
  const homeFylkeCode = String(params.countyCode ?? "").trim();
  const municipalityCodes = (params.preferredMunicipalityCodes ?? []).filter(
    (code) => typeof code === "string" && code.trim().length > 0
  );

  const neighborCountyCodes =
    municipalityCodes.length > 0
      ? listPainterNorthReachableNeighborCountyCodes(municipalityCodes)
      : PAINTER_NORTH_CROSS_FYLKE_NEIGHBOR_CONFIGS.map((neighbor) => neighbor.countyCode);

  if (neighborCountyCodes.length === 0) {
    return false;
  }

  const homeVg1Slugs = painterHomeVg1ProgrammeSlugsForFylke(homeFylkeCode);
  if (homeVg1Slugs.length === 0) {
    return false;
  }

  const homeTruth = await getAvailabilityTruth({
    countyCode: homeFylkeCode,
    programmeSlugsOrCodes: homeVg1Slugs,
  });

  for (const neighborCountyCode of neighborCountyCodes) {
    const neighborProgrammeSlugs = painterProgrammeSlugsForFylke(neighborCountyCode);
    if (neighborProgrammeSlugs.length === 0) {
      continue;
    }

    const neighborTruth = await getAvailabilityTruth({
      countyCode: neighborCountyCode,
      programmeSlugsOrCodes: neighborProgrammeSlugs,
    });

    if (
      assessPainterNorthSplitRouteTruthEligibility({
        homeRows: homeTruth.rows,
        neighborRows: neighborTruth.rows,
      }).eligible
    ) {
      return true;
    }
  }

  return false;
}
