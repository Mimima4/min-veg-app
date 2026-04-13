import { createClient } from "@/lib/supabase/server";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import type {
  ChildStudyRouteOverviewItem,
  ChildStudyRoutesOverview,
} from "@/lib/routes/route-types";
import { resolveProfessionCompetitionLevel } from "./resolve-profession-competition-level";
import { resolveStudyRouteState } from "./resolve-study-route-state";

type Params = {
  childId: string;
  locale?: string;
  childDisplayName?: string | null;
};

type RouteRow = {
  id: string;
  target_profession_id: string;
  status: ChildStudyRouteOverviewItem["status"];
  updated_at: string;
  current_variant_id: string | null;
};

type ProfessionRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
  competition_level?: string | null;
};

type SnapshotRow = {
  route_variant_id: string;
  selected_steps_payload: unknown;
  signals_payload: unknown;
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
        updated_at,
        current_variant_id
      `
    )
    .eq("child_id", params.childId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch study routes overview: ${error.message}`);
  }

  const typedRoutes = (routes ?? []) as RouteRow[];

  const professionIds = Array.from(
    new Set(typedRoutes.map((route) => route.target_profession_id).filter(Boolean))
  );

  const variantIds = Array.from(
    new Set(
      typedRoutes
        .map((route) => route.current_variant_id)
        .filter((value): value is string => Boolean(value))
    )
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

  let snapshotMap = new Map<string, SnapshotRow>();

  if (variantIds.length > 0) {
    const { data: snapshots, error: snapshotsError } = await supabase
      .from("study_route_snapshots")
      .select("route_variant_id, selected_steps_payload, signals_payload")
      .in("route_variant_id", variantIds)
      .eq("is_current_snapshot", true);

    if (snapshotsError) {
      throw new Error(
        `Failed to fetch snapshots for study routes overview: ${snapshotsError.message}`
      );
    }

    snapshotMap = new Map(
      ((snapshots ?? []) as SnapshotRow[]).map((snapshot) => [
        snapshot.route_variant_id,
        snapshot,
      ])
    );
  }

  const mapped: ChildStudyRouteOverviewItem[] = typedRoutes.map((route) => {
    const profession = professionMap.get(route.target_profession_id);

    if (!profession) {
      throw new Error(
        `Study route ${route.id} references missing or inactive profession ${route.target_profession_id}`
      );
    }

    const professionTitle =
      getLocalizedValue(profession.title_i18n ?? {}, supportedLocale) ||
      profession.slug;

    const competitionLevel = resolveProfessionCompetitionLevel(profession);

    const snapshot = route.current_variant_id
      ? snapshotMap.get(route.current_variant_id)
      : undefined;

    const resolvedState = resolveStudyRouteState({
      selectedStepsPayload: snapshot?.selected_steps_payload,
      snapshotSignals: snapshot?.signals_payload,
    });

    return {
      routeId: route.id,
      targetProfessionId: route.target_profession_id,
      targetProfessionSlug: profession.slug,
      professionTitle,
      routeLabel: professionTitle,
      competitionLevel,
      status: route.status,
      overallFitLabel: resolvedState.headerSummary.overallFitLabel,
      feasibilityLabel: resolvedState.headerSummary.feasibilityLabel,
      warningsCount: resolvedState.warningsCount,
      newRouteAvailable: resolvedState.newRouteAvailable,
      updatedAt: route.updated_at,
    };
  });

  return {
    childId: params.childId,
    childDisplayName: params.childDisplayName ?? "Child",
    routes: mapped,
  };
}