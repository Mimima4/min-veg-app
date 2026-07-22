/**
 * Read Contour B Vilbli home VG2 continuation allowlist.
 * Charter: docs/architecture/phase-4-vilbli-home-vg2-continuation-overlay-owner-record.md
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export type VilbliHomeVg2ContinuationRow = {
  institutionId: string;
  destinationCountyCode: string | null;
  vilbliSchoolCode: string | null;
};

export async function loadVilbliHomeVg2Continuations(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  homeCountyCode: string;
}): Promise<VilbliHomeVg2ContinuationRow[]> {
  const profession = String(params.professionSlug ?? "").trim();
  const home = String(params.homeCountyCode ?? "").trim();
  if (!profession || !home) return [];

  const { data, error } = await params.supabase
    .from("vgs_vilbli_home_vg2_continuations")
    .select("institution_id, destination_county_code, vilbli_school_code")
    .eq("profession_slug", profession)
    .eq("home_county_code", home);

  if (error) {
    // Fail-open when migration not yet applied (table missing).
    const message = String(error.message ?? "");
    if (/vgs_vilbli_home_vg2_continuations|does not exist|42P01/i.test(message)) {
      return [];
    }
    throw error;
  }

  return (data ?? [])
    .map((row) => ({
      institutionId: String(row.institution_id ?? "").trim(),
      destinationCountyCode: row.destination_county_code
        ? String(row.destination_county_code).trim()
        : null,
      vilbliSchoolCode: row.vilbli_school_code
        ? String(row.vilbli_school_code).trim()
        : null,
    }))
    .filter((row) => row.institutionId.length > 0);
}
