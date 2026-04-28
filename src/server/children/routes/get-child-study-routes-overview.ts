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
  generated_at: string;
  selected_steps_payload: unknown;
  signals_payload: unknown;
};

type VariantRow = {
  route_id: string;
  status: ChildStudyRouteOverviewItem["status"];
  is_current: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (!isRecord(value)) {
    return JSON.stringify(value);
  }

  const keys = Object.keys(value).sort();
  const serialized = keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",");
  return `{${serialized}}`;
}

function extractMaterialSignalsSubset(signals: unknown): {
  warnings: unknown;
  feasibilitySummary: unknown;
} {
  if (!isRecord(signals)) {
    return {
      warnings: null,
      feasibilitySummary: null,
    };
  }

  return {
    warnings: signals.warnings ?? null,
    feasibilitySummary: signals.feasibilitySummary ?? null,
  };
}

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
  let currentVariantStatusByRouteId = new Map<
    string,
    ChildStudyRouteOverviewItem["status"]
  >();

  if (variantIds.length > 0) {
    const { data: variants, error: variantsError } = await supabase
      .from("study_route_variants")
      .select("route_id, status, is_current")
      .in("route_id", typedRoutes.map((route) => route.id))
      .eq("is_current", true);

    if (variantsError) {
      throw new Error(
        `Failed to fetch current variants for study routes overview: ${variantsError.message}`
      );
    }

    currentVariantStatusByRouteId = new Map(
      ((variants ?? []) as VariantRow[]).map((variant) => [
        variant.route_id,
        variant.status,
      ])
    );

    const { data: snapshots, error: snapshotsError } = await supabase
      .from("study_route_snapshots")
      .select("route_variant_id, generated_at, selected_steps_payload, signals_payload")
      .in("route_variant_id", variantIds)
      .eq("is_current_snapshot", true);

    if (snapshotsError) {
      throw new Error(
        `Failed to fetch snapshots for study routes overview: ${snapshotsError.message}`
      );
    }

    const latestSnapshotByVariantId = new Map<string, SnapshotRow>();
    for (const snapshot of (snapshots ?? []) as SnapshotRow[]) {
      const current = latestSnapshotByVariantId.get(snapshot.route_variant_id);
      if (
        !current ||
        new Date(snapshot.generated_at).getTime() >
          new Date(current.generated_at).getTime()
      ) {
        latestSnapshotByVariantId.set(snapshot.route_variant_id, snapshot);
      }
    }
    snapshotMap = latestSnapshotByVariantId;
  }

  const routesByProfessionId = new Map<string, RouteRow[]>();
  for (const route of typedRoutes) {
    const current = routesByProfessionId.get(route.target_profession_id) ?? [];
    current.push(route);
    routesByProfessionId.set(route.target_profession_id, current);
  }

  const primaryRoutes = Array.from(routesByProfessionId.values())
    .map((routesForProfession) => {
      const sorted = [...routesForProfession].sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
      const drafts = sorted.filter((route) => {
        if (route.status === "draft") {
          return true;
        }
        const currentVariantStatus = currentVariantStatusByRouteId.get(route.id);
        return currentVariantStatus === "draft";
      });
      const saved = sorted.filter((route) => route.status === "saved");

      for (const draftRoute of drafts) {
        const draftSnapshot = draftRoute.current_variant_id
          ? snapshotMap.get(draftRoute.current_variant_id)
          : undefined;

        if (!draftSnapshot) {
          continue;
        }

        const equivalentSavedRoute = saved.find((savedRoute) => {
          const savedSnapshot = savedRoute.current_variant_id
            ? snapshotMap.get(savedRoute.current_variant_id)
            : undefined;
          if (!savedSnapshot) {
            return false;
          }

          return (
            stableStringify(savedSnapshot.selected_steps_payload ?? []) ===
              stableStringify(draftSnapshot.selected_steps_payload ?? []) &&
            stableStringify(
              extractMaterialSignalsSubset(savedSnapshot.signals_payload)
            ) ===
              stableStringify(
                extractMaterialSignalsSubset(draftSnapshot.signals_payload)
              )
          );
        });

        if (equivalentSavedRoute) {
          return equivalentSavedRoute;
        }
      }

      // Product-phase strict rule:
      // main Route entry resolves only from working routes.
      // Saved/non-working siblings are excluded from candidate set.
      return drafts[0] ?? null;
    })
    .filter((route): route is RouteRow => Boolean(route))
    .sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  const mapped: ChildStudyRouteOverviewItem[] = primaryRoutes.map((route) => {
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
      professionId: route.target_profession_id,
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