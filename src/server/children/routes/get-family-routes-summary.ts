import { createClient } from "@/lib/supabase/server";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import { resolveStudyRouteState } from "./resolve-study-route-state";

type ChildRow = {
  id: string;
  display_name: string | null;
  school_stage: string | null;
  created_at: string;
};

type RouteRow = {
  id: string;
  child_id: string;
  target_profession_id: string;
  status: string;
  updated_at: string;
  current_variant_id: string | null;
};

type SnapshotRow = {
  route_variant_id: string;
  selected_steps_payload: unknown;
  signals_payload: unknown;
  generated_at: string;
};

type ProfessionRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
};

export type FamilyRouteChildSummary = {
  childId: string;
  displayName: string;
  schoolStageLabel: string;
  routeCount: number;
  warningsCount: number;
  hasNewRouteAvailable: boolean;
  status: "empty" | "healthy" | "attention";
  latestRouteUpdatedAt: string | null;
  targetProfessionTitles: string[];
};

function getSchoolStageLabel(
  schoolStage: string | null | undefined,
  locale: SupportedLocale
): string {
  if (!schoolStage) {
    return "—";
  }

  const labels: Record<string, Record<SupportedLocale, string>> = {
    barneskole: {
      nb: "Barneskole",
      nn: "Barneskule",
      en: "Primary school",
    },
    ungdomsskole: {
      nb: "Ungdomsskole",
      nn: "Ungdomsskule",
      en: "Lower secondary school",
    },
    vgs: {
      nb: "Videregående skole",
      nn: "Vidaregåande skule",
      en: "Upper secondary school",
    },
    student: {
      nb: "Student",
      nn: "Student",
      en: "Student",
    },
    young_adult: {
      nb: "Ung voksen",
      nn: "Ung vaksen",
      en: "Young adult",
    },
  };

  return labels[schoolStage]?.[locale] ?? schoolStage;
}

export async function getFamilyRoutesSummary({
  locale,
  familyAccountId,
}: {
  locale: string;
  familyAccountId: string;
}): Promise<FamilyRouteChildSummary[]> {
  const supabase = await createClient();
  const supportedLocale = locale as SupportedLocale;

  const { data: children, error: childrenError } = await supabase
    .from("child_profiles")
    .select("id, display_name, school_stage, created_at")
    .eq("family_account_id", familyAccountId)
    .order("created_at", { ascending: true });

  if (childrenError) {
    throw new Error(
      `Failed to fetch child profiles for family routes summary: ${childrenError.message}`
    );
  }

  const typedChildren = (children ?? []) as ChildRow[];
  const childIds = typedChildren.map((child) => child.id);

  if (childIds.length === 0) {
    return [];
  }

  const { data: routes, error: routesError } = await supabase
    .from("study_routes")
    .select("id, child_id, target_profession_id, status, updated_at, current_variant_id")
    .in("child_id", childIds)
    .is("archived_at", null);

  if (routesError) {
    throw new Error(
      `Failed to fetch study routes for family routes summary: ${routesError.message}`
    );
  }

  const typedRoutes = (routes ?? []) as RouteRow[];
  const variantIds = Array.from(
    new Set(
      typedRoutes
        .map((route) => route.current_variant_id)
        .filter((value): value is string => Boolean(value))
    )
  );
  const professionIds = Array.from(
    new Set(
      typedRoutes
        .map((route) => route.target_profession_id)
        .filter((value): value is string => Boolean(value))
    )
  );

  let snapshotRows: SnapshotRow[] = [];

  if (variantIds.length > 0) {
    const { data: snapshots, error: snapshotsError } = await supabase
      .from("study_route_snapshots")
      .select("route_variant_id, selected_steps_payload, signals_payload, generated_at")
      .in("route_variant_id", variantIds)
      .eq("is_current_snapshot", true);

    if (snapshotsError) {
      throw new Error(
        `Failed to fetch route snapshots for family routes summary: ${snapshotsError.message}`
      );
    }

    snapshotRows = (snapshots ?? []) as SnapshotRow[];
  }

  let professionMap = new Map<string, ProfessionRow>();

  if (professionIds.length > 0) {
    const { data: professions, error: professionsError } = await supabase
      .from("professions")
      .select("id, slug, title_i18n")
      .in("id", professionIds)
      .eq("is_active", true);

    if (professionsError) {
      throw new Error(
        `Failed to fetch professions for family routes summary: ${professionsError.message}`
      );
    }

    professionMap = new Map(
      ((professions ?? []) as ProfessionRow[]).map((profession) => [
        profession.id,
        profession,
      ])
    );
  }

  const snapshotByVariantId = new Map<string, SnapshotRow>();
  for (const snapshot of snapshotRows) {
    snapshotByVariantId.set(snapshot.route_variant_id, snapshot);
  }

  const routesByChildId = new Map<string, RouteRow[]>();
  for (const route of typedRoutes) {
    const current = routesByChildId.get(route.child_id) ?? [];
    current.push(route);
    routesByChildId.set(route.child_id, current);
  }

  return typedChildren.map((child) => {
    const childRoutes = routesByChildId.get(child.id) ?? [];

    let warningsCount = 0;
    let hasNewRouteAvailable = false;
    let hasRouteMarkedForReview = false;
    let latestRouteUpdatedAt: string | null = null;
    const targetProfessionTitles: string[] = [];

    for (const route of childRoutes) {
      const snapshot = route.current_variant_id
        ? snapshotByVariantId.get(route.current_variant_id)
        : undefined;

      const resolvedState = resolveStudyRouteState({
        selectedStepsPayload: snapshot?.selected_steps_payload,
        snapshotSignals: snapshot?.signals_payload,
      });

      warningsCount += resolvedState.warningsCount;

      if (resolvedState.newRouteAvailable) {
        hasNewRouteAvailable = true;
      }

      if (route.status === "needs_review" || route.status === "outdated") {
        hasRouteMarkedForReview = true;
      }

      if (
        !latestRouteUpdatedAt ||
        new Date(route.updated_at).getTime() > new Date(latestRouteUpdatedAt).getTime()
      ) {
        latestRouteUpdatedAt = route.updated_at;
      }

      const profession = professionMap.get(route.target_profession_id);
      if (profession) {
        const title =
          getLocalizedValue(profession.title_i18n ?? {}, supportedLocale) ||
          profession.slug;

        if (!targetProfessionTitles.includes(title)) {
          targetProfessionTitles.push(title);
        }
      }
    }

    let status: "empty" | "healthy" | "attention" = "healthy";

    if (childRoutes.length === 0) {
      status = "empty";
    } else if (hasNewRouteAvailable || hasRouteMarkedForReview) {
      status = "attention";
    }

    return {
      childId: child.id,
      displayName: child.display_name || "Unnamed child",
      schoolStageLabel: getSchoolStageLabel(child.school_stage, supportedLocale),
      routeCount: childRoutes.length,
      warningsCount,
      hasNewRouteAvailable,
      status,
      latestRouteUpdatedAt,
      targetProfessionTitles,
    };
  });
}