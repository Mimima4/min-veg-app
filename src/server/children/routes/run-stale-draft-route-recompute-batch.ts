import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeFylkeCodesFromMunicipalityCodes } from "@/lib/planning/norway-geo-code-normalization";
import { evaluateStudyRouteStaleness } from "./evaluate-study-route-staleness";
import { triggerStudyRouteRecompute } from "./trigger-study-route-recompute";

export type StaleDraftRecomputeScope = {
  professionSlug?: string;
  /** Child home fylke must include this code (e.g. after Contour B county relay). */
  countyCode?: string;
};

export type StaleDraftRecomputeBatchParams = {
  supabase: SupabaseClient;
  scope?: StaleDraftRecomputeScope;
  locale?: string;
  maxRoutes?: number;
  concurrency?: number;
  dryRun?: boolean;
  triggerReason?: string;
};

export type StaleDraftRecomputeBatchResult = {
  scanned: number;
  stale: number;
  recomputed: number;
  failed: number;
  skippedNotStale: number;
  dryRun: boolean;
  errors: Array<{ childId: string; routeId: string; message: string }>;
};

const DEFAULT_MAX_ROUTES = 40;
const DEFAULT_CONCURRENCY = 2;

function parsePreferredMunicipalityCodes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function childHomeFylkeCodes(preferredMunicipalityCodes: unknown): string[] {
  return normalizeFylkeCodesFromMunicipalityCodes(
    parsePreferredMunicipalityCodes(preferredMunicipalityCodes)
  );
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]!);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

export function isOsloMaintenanceWindow(now = new Date()): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Oslo",
      hour: "numeric",
      hour12: false,
    }).format(now)
  );
  return hour >= 3 && hour < 5;
}

export async function runStaleDraftRouteRecomputeBatch(
  params: StaleDraftRecomputeBatchParams
): Promise<StaleDraftRecomputeBatchResult> {
  const scope = params.scope ?? {};
  const maxRoutes = params.maxRoutes ?? DEFAULT_MAX_ROUTES;
  const concurrency = params.concurrency ?? DEFAULT_CONCURRENCY;
  const dryRun = Boolean(params.dryRun);
  const triggerReason = params.triggerReason ?? "scheduled_stale_batch";

  let scopedProfessionIds: string[] | null = null;
  if (scope.professionSlug) {
    const { data: professionRows, error: professionError } = await params.supabase
      .from("professions")
      .select("id")
      .eq("slug", scope.professionSlug)
      .eq("is_active", true);

    if (professionError) {
      throw new Error(
        `Failed to resolve profession for batch recompute: ${professionError.message}`
      );
    }

    scopedProfessionIds = (professionRows ?? []).map((row) => row.id);
    if (scopedProfessionIds.length === 0) {
      return {
        scanned: 0,
        stale: 0,
        recomputed: 0,
        failed: 0,
        skippedNotStale: 0,
        dryRun,
        errors: [],
      };
    }
  }

  let query = params.supabase
    .from("study_routes")
    .select("id, child_id, target_profession_id, current_variant_id")
    .eq("status", "draft")
    .is("archived_at", null)
    .not("current_variant_id", "is", null)
    .limit(maxRoutes * 4);

  if (scopedProfessionIds) {
    query = query.in("target_profession_id", scopedProfessionIds);
  }

  const { data: routeRows, error: routeError } = await query;

  if (routeError) {
    throw new Error(`Failed to list draft routes for batch recompute: ${routeError.message}`);
  }

  type RouteRow = {
    id: string;
    child_id: string;
    target_profession_id: string;
    current_variant_id: string | null;
  };

  let candidates = (routeRows ?? []) as RouteRow[];

  if (scope.countyCode) {
    const normalizedCounty = scope.countyCode.trim().padStart(2, "0").slice(0, 2);
    const childIds = Array.from(new Set(candidates.map((row) => row.child_id)));
    const { data: childRows, error: childError } = await params.supabase
      .from("child_profiles")
      .select("id, preferred_municipality_codes")
      .in("id", childIds);

    if (childError) {
      throw new Error(
        `Failed to load child profiles for county-scoped recompute: ${childError.message}`
      );
    }

    const childFylkeById = new Map<string, string[]>();
    for (const child of childRows ?? []) {
      childFylkeById.set(
        child.id,
        childHomeFylkeCodes(child.preferred_municipality_codes)
      );
    }

    candidates = candidates.filter((row) =>
      (childFylkeById.get(row.child_id) ?? []).includes(normalizedCounty)
    );
  }

  candidates = candidates.slice(0, maxRoutes);

  const result: StaleDraftRecomputeBatchResult = {
    scanned: candidates.length,
    stale: 0,
    recomputed: 0,
    failed: 0,
    skippedNotStale: 0,
    dryRun,
    errors: [],
  };

  await mapWithConcurrency(candidates, concurrency, async (row) => {
    const staleness = await evaluateStudyRouteStaleness({
      childId: row.child_id,
      routeId: row.id,
      locale: params.locale,
      supabase: params.supabase,
    });

    if (!staleness?.isDraft || !staleness.isStale) {
      result.skippedNotStale += 1;
      return;
    }

    result.stale += 1;

    if (dryRun) {
      return;
    }

    try {
      await triggerStudyRouteRecompute({
        childId: row.child_id,
        routeId: row.id,
        locale: params.locale,
        triggeredByType: "system",
        triggeredByUserId: null,
        triggerReason,
        supabase: params.supabase,
      });
      result.recomputed += 1;
    } catch (error) {
      result.failed += 1;
      result.errors.push({
        childId: row.child_id,
        routeId: row.id,
        message: error instanceof Error ? error.message : "Unknown recompute error",
      });
    }
  });

  return result;
}
