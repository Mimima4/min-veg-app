import { createClient } from "@/lib/supabase/server";
import { RouteDomainError } from "./route-errors";

type Params = {
  childId: string;
  professionId: string;
};

export async function removeSavedProfession(params: Params) {
  const supabase = await createClient();

  const { data: savedLink, error: savedLinkError } = await supabase
    .from("child_profession_interests")
    .select("id")
    .eq("child_profile_id", params.childId)
    .eq("profession_id", params.professionId)
    .maybeSingle();

  if (savedLinkError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to check saved profession before removal: ${savedLinkError.message}`
    );
  }

  if (!savedLink) {
    throw new RouteDomainError(
      "profession_not_saved_for_child",
      "Saved profession link not found for this child",
      {
        childId: params.childId,
        professionId: params.professionId,
      }
    );
  }

  const now = new Date().toISOString();

  const { error: archiveRoutesError } = await supabase
    .from("study_routes")
    .update({
      status: "archived",
      archived_at: now,
      updated_at: now,
      last_meaningful_change_at: now,
    })
    .eq("child_id", params.childId)
    .eq("target_profession_id", params.professionId)
    .is("archived_at", null);

  if (archiveRoutesError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to archive study routes for removed profession: ${archiveRoutesError.message}`,
      {
        childId: params.childId,
        professionId: params.professionId,
      }
    );
  }

  const { error: removeLinkError } = await supabase
    .from("child_profession_interests")
    .delete()
    .eq("child_profile_id", params.childId)
    .eq("profession_id", params.professionId);

  if (removeLinkError) {
    throw new RouteDomainError(
      "internal_error",
      `Failed to remove saved profession link: ${removeLinkError.message}`,
      {
        childId: params.childId,
        professionId: params.professionId,
      }
    );
  }

  return {
    childId: params.childId,
    professionId: params.professionId,
    removed: true,
    archivedRoutes: true,
  };
}