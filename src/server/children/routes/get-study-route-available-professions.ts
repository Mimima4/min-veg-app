import { createClient } from "@/lib/supabase/server";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import type {
  StudyRouteAvailableProfession,
  StudyRouteAvailableProfessionsBlock,
} from "@/lib/routes/route-types";
import type { ChildPlanningState } from "@/server/children/planning/get-child-planning-state";
import { getAdjacentProfessionsForPrograms } from "@/server/professions/adjacency/get-adjacent-professions-for-program";

type Params = {
  routeId: string;
  locale?: string;
};

const EMPTY_STATE = {
  title: "No additional professions can be shown yet",
  message: "Adjust route inputs or selected filters to expand available professions",
};

export async function getStudyRouteAvailableProfessions(
  params: Params
): Promise<StudyRouteAvailableProfessionsBlock> {
  const supabase = await createClient();
  const supportedLocale = (params.locale ?? "en") as SupportedLocale;

  const { data: route, error } = await supabase
    .from("study_routes")
    .select("current_variant_id, target_profession_id")
    .eq("id", params.routeId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch route: ${error.message}`);
  }

  if (!route?.current_variant_id) {
    return {
      items: [],
      emptyState: EMPTY_STATE,
    };
  }

  const { data: snapshot } = await supabase
    .from("study_route_snapshots")
    .select("selected_steps_payload")
    .eq("route_variant_id", route.current_variant_id)
    .eq("is_current_snapshot", true)
    .maybeSingle();

  if (!snapshot?.selected_steps_payload) {
    return {
      items: [],
      emptyState: EMPTY_STATE,
    };
  }

  const steps = Array.isArray(snapshot.selected_steps_payload)
    ? snapshot.selected_steps_payload
    : [];

  const programPairs = steps
    .map((step: any) => ({
      programSlug: step?.programme?.slug ?? step?.program_slug,
      currentProfessionSlug:
        step?.meta?.currentProfessionSlug ??
        step?.current_profession_slug ??
        null,
    }))
    .filter((x) => x.programSlug);

  if (programPairs.length === 0) {
    return {
      items: [],
      emptyState: EMPTY_STATE,
    };
  }

  const adjacency = await getAdjacentProfessionsForPrograms({
    locale: supportedLocale,
    planningState: {
      interestIds: [],
      derivedStrengthIds: [],
      desiredIncomeBand: null,
      preferredWorkStyle: null,
      preferredEducationLevel: null,
    } as unknown as Pick<
      ChildPlanningState,
      | "interestIds"
      | "derivedStrengthIds"
      | "desiredIncomeBand"
      | "preferredWorkStyle"
      | "preferredEducationLevel"
    >,
    programCurrentProfessionPairs: programPairs,
  });

  if (adjacency.kind !== "ok") {
    return {
      items: [],
      emptyState: EMPTY_STATE,
    };
  }

  const slugSet = new Set<string>();

  for (const professions of adjacency.byProgramSlug.values()) {
    for (const p of professions) {
      slugSet.add(p.slug);
    }
  }

  const slugs = [...slugSet];

  if (slugs.length === 0) {
    return {
      items: [],
      emptyState: EMPTY_STATE,
    };
  }

  const { data: professionRows, error: professionsError } = await supabase
    .from("professions")
    .select("id, slug")
    .in("slug", slugs)
    .eq("is_active", true);

  if (professionsError) {
    throw new Error(
      `Failed to resolve profession ids for available professions: ${professionsError.message}`
    );
  }

  const idBySlug = new Map(
    (professionRows ?? []).map((row) => [row.slug as string, row.id as string])
  );

  const uniqueMap = new Map<string, StudyRouteAvailableProfession>();

  for (const professions of adjacency.byProgramSlug.values()) {
    for (const p of professions) {
      const professionId = idBySlug.get(p.slug);

      if (!professionId || professionId === route.target_profession_id) {
        continue;
      }

      if (!uniqueMap.has(professionId)) {
        uniqueMap.set(professionId, {
          professionId,
          slug: p.slug,
          title: p.title,
          whyOpenedLabel: "Also reachable via this route",
          similarityLabel: "Related path",
        });
      }
    }
  }

  const items = Array.from(uniqueMap.values()).slice(0, 12);

  return {
    items,
    emptyState: items.length === 0 ? EMPTY_STATE : null,
  };
}
