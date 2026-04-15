import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createInitialStudyRoute } from "@/server/children/routes/create-initial-study-route";

type RouteRow = {
  id: string;
  current_variant_id: string | null;
  status: string;
  updated_at: string;
};

type RouteVariantRow = {
  route_id: string;
  status: string;
  is_current: boolean;
};

type SnapshotRow = {
  route_variant_id: string;
  generated_at: string;
  selected_steps_payload: unknown;
  signals_payload: unknown;
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

export default async function RouteEntryResolverPage({
  params,
}: {
  params: Promise<{
    locale: string;
    childId: string;
    targetProfessionId: string;
  }>;
}) {
  const { locale, childId, targetProfessionId } = await params;
  const supabase = await createClient();

  const { data: routes, error } = await supabase
    .from("study_routes")
    .select("id, current_variant_id, status, updated_at")
    .eq("child_id", childId)
    .eq("target_profession_id", targetProfessionId)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to resolve route entry target: ${error.message}`);
  }

  const typedRoutes = (routes ?? []) as RouteRow[];
  if (typedRoutes.length === 0) {
    notFound();
  }

  const routeIds = typedRoutes.map((route) => route.id);
  const { data: variants, error: variantsError } = await supabase
    .from("study_route_variants")
    .select("route_id, status, is_current")
    .in("route_id", routeIds)
    .eq("is_current", true);

  if (variantsError) {
    throw new Error(
      `Failed to resolve route entry current variants: ${variantsError.message}`
    );
  }

  const currentVariantByRouteId = new Map<string, RouteVariantRow>();
  for (const variant of (variants ?? []) as RouteVariantRow[]) {
    currentVariantByRouteId.set(variant.route_id, variant);
  }

  const drafts = typedRoutes.filter((route) => {
    if (route.status === "draft") {
      return true;
    }
    const currentVariant = currentVariantByRouteId.get(route.id);
    return currentVariant?.status === "draft";
  });

  if (drafts.length > 0) {
    const savedRoutes = typedRoutes.filter((route) => route.status === "saved");
    const compareVariantIds = Array.from(
      new Set(
        [...drafts, ...savedRoutes]
          .map((route) => route.current_variant_id)
          .filter((value): value is string => Boolean(value))
      )
    );

    if (compareVariantIds.length > 0) {
      const { data: snapshots, error: snapshotsError } = await supabase
        .from("study_route_snapshots")
        .select(
          "route_variant_id, generated_at, selected_steps_payload, signals_payload"
        )
        .in("route_variant_id", compareVariantIds)
        .eq("is_current_snapshot", true);

      if (snapshotsError) {
        throw new Error(
          `Failed to resolve route entry snapshots for equivalence: ${snapshotsError.message}`
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

      for (const draftRoute of drafts) {
        const draftVariantId = draftRoute.current_variant_id;
        if (!draftVariantId) {
          continue;
        }

        const draftSnapshot = latestSnapshotByVariantId.get(draftVariantId);
        if (!draftSnapshot) {
          continue;
        }

        const equivalentSavedRoute = savedRoutes.find((savedRoute) => {
          const savedVariantId = savedRoute.current_variant_id;
          if (!savedVariantId) {
            return false;
          }
          const savedSnapshot = latestSnapshotByVariantId.get(savedVariantId);
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
          redirect(
            `/${locale}/app/children/${childId}/route/${equivalentSavedRoute.id}`
          );
        }
      }
    }

    redirect(`/${locale}/app/children/${childId}/route/${drafts[0].id}`);
  }

  const createdWorkingRoute = await createInitialStudyRoute({
    childId,
    targetProfessionId,
    locale,
    createdByType: "system",
    createdByUserId: null,
  });

  if (!createdWorkingRoute?.identity?.routeId) {
    notFound();
  }

  redirect(
    `/${locale}/app/children/${childId}/route/${createdWorkingRoute.identity.routeId}`
  );
}
