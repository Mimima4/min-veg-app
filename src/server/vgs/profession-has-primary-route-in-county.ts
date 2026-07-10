import { assessHomeCountyPrimaryRouteEligibility } from "@/lib/vgs/home-county-primary-route-completeness";
import { getAvailabilityTruth } from "@/server/children/routes/get-availability-truth";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Primary route only: county-scoped VG1+VG2 PSA in home fylke. */
export async function professionHasPrimaryRouteInCounty(params: {
  supabase: SupabaseClient;
  professionSlug: string;
  countyCode: string;
}): Promise<boolean> {
  const countyCode = String(params.countyCode ?? "").trim();
  const professionSlug = String(params.professionSlug ?? "").trim();
  if (!countyCode || !professionSlug) {
    return false;
  }

  const { data: links, error } = await params.supabase
    .from("profession_program_links")
    .select("program_slug")
    .eq("profession_slug", professionSlug);

  if (error) {
    throw new Error(
      `Failed to load profession programme links for ${professionSlug}: ${error.message}`
    );
  }

  const programmeSlugs = Array.from(
    new Set(
      ((links ?? []) as Array<{ program_slug: string | null }>)
        .map((link) => link.program_slug)
        .filter((slug): slug is string => typeof slug === "string" && slug.trim().length > 0)
    )
  );

  if (programmeSlugs.length === 0) {
    return false;
  }

  const truth = await getAvailabilityTruth({
    countyCode,
    programmeSlugsOrCodes: programmeSlugs,
  });

  if (!truth.hasTruth) {
    return false;
  }

  return assessHomeCountyPrimaryRouteEligibility({
    truthRows: truth.rows,
    professionSlug,
  }).eligible;
}
