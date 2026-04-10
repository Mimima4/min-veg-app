import { createClient } from "@/lib/supabase/server";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import type {
  ChildStudyRoutesOverview,
  ChildStudyRouteOverviewItem,
} from "@/lib/routes/route-types";

type Params = {
  childId: string;
  locale?: string;
  childDisplayName?: string | null;
};

type ProfessionRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
};

export async function getChildStudyRoutesOverview(
  params: Params
): Promise<ChildStudyRoutesOverview> {
  const supabase = await createClient();
  const supportedLocale = (params.locale ?? "en") as SupportedLocale;

  const { data: routes, error } = await supabase
    .from("study_routes")
    .select(
      `
        id,
        target_profession_id,
        status,
        updated_at
      `
    )
    .eq("child_id", params.childId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch study routes overview: ${error.message}`);
  }

  const professionIds = Array.from(
    new Set((routes ?? []).map((route) => route.target_profession_id).filter(Boolean))
  );

  let professionMap = new Map<string, ProfessionRow>();

  if (professionIds.length > 0) {
    const { data: professions, error: professionsError } = await supabase
      .from("professions")
      .select("id, slug, title_i18n")
      .in("id", professionIds)
      .eq("is_active", true);

    if (professionsError) {
      throw new Error(
        `Failed to fetch professions for study routes overview: ${professionsError.message}`
      );
    }

    professionMap = new Map(
      ((professions ?? []) as ProfessionRow[]).map((profession) => [
        profession.id,
        profession,
      ])
    );
  }

  const mapped: ChildStudyRouteOverviewItem[] = (routes ?? []).map((route) => {
    const profession = professionMap.get(route.target_profession_id);

    if (!profession) {
      throw new Error(
        `Study route ${route.id} references missing or inactive profession ${route.target_profession_id}`
      );
    }

    const professionTitle =
      getLocalizedValue(profession.title_i18n ?? {}, supportedLocale) ||
      profession.slug;

    return {
      routeId: route.id,
      targetProfessionId: route.target_profession_id,
      targetProfessionSlug: profession.slug,
      professionTitle,
      routeLabel: professionTitle,
      status: route.status,
      overallFitLabel: null,
      feasibilityLabel: null,
      warningsCount: 0,
      newRouteAvailable: false,
      updatedAt: route.updated_at,
    };
  });

  return {
    childId: params.childId,
    childDisplayName: params.childDisplayName ?? "Child",
    routes: mapped,
  };
}