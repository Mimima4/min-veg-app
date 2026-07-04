import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import type { StudyRouteReadModel } from "@/lib/routes/route-types";
import { resolveProfessionSlugFromProgramSlug } from "@/lib/vgs/vg2-cross-profession";
import { createInitialStudyRoute } from "./create-initial-study-route";
import { RouteDomainError } from "./route-errors";
import { triggerStudyRouteRecompute } from "./trigger-study-route-recompute";

type Params = {
  supabase: SupabaseClient;
  childId: string;
  sourceRouteId: string;
  sourceProfessionSlug: string;
  targetProfessionSlug: string;
  vg2ProgramSlug: string;
  locale?: string;
  triggeredByType?: string;
  triggeredByUserId?: string | null;
};

async function ensureChildProfessionInterest(params: {
  childId: string;
  professionId: string;
}) {
  // Service role: parent JWT cannot upsert sibling professions under current RLS.
  // Caller must have verified family child access (trigger-study-route-recompute API).
  const admin = createAdminClient();
  const { error } = await admin.from("child_profession_interests").upsert(
    {
      child_profile_id: params.childId,
      profession_id: params.professionId,
    },
    { onConflict: "child_profile_id,profession_id" }
  );

  if (error) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to save target profession before VG2 route switch: ${error.message}`
    );
  }
}

export async function switchStudyRouteForVg2Programme(
  params: Params
): Promise<StudyRouteReadModel> {
  const targetProfessionSlug = String(params.targetProfessionSlug ?? "").trim();
  const vg2ProgramSlug = String(params.vg2ProgramSlug ?? "").trim();
  const resolvedFromSlug = resolveProfessionSlugFromProgramSlug(vg2ProgramSlug);

  if (!targetProfessionSlug || !vg2ProgramSlug || resolvedFromSlug !== targetProfessionSlug) {
    throw new RouteDomainError(
      "invalid_request",
      "VG2 programme slug does not match the target profession for route switch"
    );
  }

  const { data: targetProfession, error: targetProfessionError } = await params.supabase
    .from("professions")
    .select("id, slug")
    .eq("slug", targetProfessionSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (targetProfessionError || !targetProfession) {
    throw new RouteDomainError(
      "route_recompute_failed",
      `Failed to resolve target profession for VG2 route switch: ${targetProfessionError?.message ?? "Missing profession"}`
    );
  }

  await ensureChildProfessionInterest({
    childId: params.childId,
    professionId: targetProfession.id,
  });

  const initialRoute = await createInitialStudyRoute({
    childId: params.childId,
    targetProfessionId: targetProfession.id,
    locale: params.locale,
    createdByType: params.triggeredByType ?? "parent",
    createdByUserId: params.triggeredByUserId ?? null,
  });

  const targetRouteId = initialRoute.identity.routeId;
  if (!targetRouteId) {
    throw new RouteDomainError(
      "route_recompute_failed",
      "Failed to materialize target working route for VG2 profession switch"
    );
  }

  return triggerStudyRouteRecompute({
    supabase: params.supabase,
    childId: params.childId,
    routeId: targetRouteId,
    locale: params.locale,
    vg2ProgramSlug,
    triggeredByType: params.triggeredByType,
    triggeredByUserId: params.triggeredByUserId,
    triggerReason: "vg2_cross_profession_programme_switch",
    skipCrossProfessionVg2Switch: true,
  });
}
