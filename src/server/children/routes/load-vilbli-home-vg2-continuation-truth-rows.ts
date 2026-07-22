/**
 * Load PSA truth rows for Vilbli home VG2 continuation allowlist institutions.
 * Charter: docs/architecture/phase-4-vilbli-home-vg2-continuation-overlay-owner-record.md
 */
import "server-only";

import { northCrossFylkeProgrammeSlugsForFylke } from "@/lib/regional-delivery/painter-north-cross-fylke-pilot";
import { loadVilbliHomeVg2Continuations } from "@/lib/regional-delivery/vilbli-home-vg2-continuations";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getAvailabilityTruth,
  type AvailabilityTruthRow,
} from "@/server/children/routes/get-availability-truth";

export async function loadVilbliHomeVg2ContinuationTruthRows(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  homeCountyCode: string;
  locale?: string;
}): Promise<AvailabilityTruthRow[]> {
  const allowlist = await loadVilbliHomeVg2Continuations({
    supabase: params.supabase,
    professionSlug: params.professionSlug,
    homeCountyCode: params.homeCountyCode,
  });
  if (allowlist.length === 0) {
    return [];
  }

  const allowedIds = new Set(allowlist.map((row) => row.institutionId));
  const destCodes = Array.from(
    new Set(
      allowlist
        .map((row) => row.destinationCountyCode)
        .filter((code): code is string => Boolean(code && code.trim()))
    )
  );

  if (destCodes.length === 0) {
    return [];
  }

  const truths = await Promise.all(
    destCodes.map((destinationCountyCode) => {
      const programmeSlugs = northCrossFylkeProgrammeSlugsForFylke({
        professionSlug: params.professionSlug,
        fylkeCode: destinationCountyCode,
      });
      if (programmeSlugs.length === 0) {
        return Promise.resolve({ hasTruth: false as const, rows: [] as AvailabilityTruthRow[] });
      }
      return getAvailabilityTruth({
        countyCode: destinationCountyCode,
        programmeSlugsOrCodes: programmeSlugs,
        locale: params.locale,
      });
    })
  );

  return truths
    .flatMap((truth) => truth.rows)
    .filter((row) => allowedIds.has(row.institutionId));
}
