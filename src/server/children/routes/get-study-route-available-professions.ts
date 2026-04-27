import { createClient } from "@/lib/supabase/server";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import type {
  StudyRouteAvailableProfession,
  StudyRouteAvailableProfessionsBlock,
} from "@/lib/routes/route-types";
import type { ChildPlanningState } from "@/server/children/planning/get-child-planning-state";
import { getAdjacentProfessionsForPrograms } from "@/server/professions/adjacency/get-adjacent-professions-for-program";
import { buildPathVariants } from "./build-path-variants";
import { mapVilbliOutcomesToNav } from "./map-vilbli-outcomes-to-nav";
import { shouldUseAvailabilityTruth } from "./should-use-availability-truth";
import { buildAvailabilityTruthLookupInputs } from "./build-availability-truth-lookup-inputs";

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

  const truthSourceActive = steps.some(
    (step: any) => step?.source === "availability_truth"
  );
  if (truthSourceActive) {
    const selectedApprenticeshipStep = steps.find(
      (step: any) =>
        step?.type === "apprenticeship_step" && step?.source === "availability_truth"
    );
    const selectedSourceOutcomeUrl =
      typeof selectedApprenticeshipStep?.source_outcome_url === "string" &&
      selectedApprenticeshipStep.source_outcome_url.trim().length > 0
        ? selectedApprenticeshipStep.source_outcome_url
        : null;
    const programmeStep = steps.find(
      (step: any) =>
        step?.type === "programme_selection" &&
        typeof step?.program_slug === "string" &&
        step.program_slug.trim().length > 0
    );

    const { data: childProfile } = await supabase
      .from("study_routes")
      .select("child_id")
      .eq("id", params.routeId)
      .maybeSingle();

    const { data: planning } = childProfile?.child_id
      ? await supabase
          .from("child_profiles")
          .select("preferred_municipality_codes")
          .eq("id", childProfile.child_id)
          .maybeSingle()
      : { data: null };

    const preferredMunicipalityCodes = Array.isArray(
      planning?.preferred_municipality_codes
    )
      ? planning.preferred_municipality_codes.filter(
          (item): item is string => typeof item === "string"
        )
      : [];

    const { data: targetProfession } = await supabase
      .from("study_routes")
      .select("target_profession_id, professions!inner(slug)")
      .eq("id", params.routeId)
      .maybeSingle();

    const professionSlug =
      (targetProfession as any)?.professions?.slug ?? null;
    if (!professionSlug) {
      return { items: [], emptyState: EMPTY_STATE };
    }

    const { data: links } = await supabase
      .from("profession_program_links")
      .select("program_slug")
      .eq("profession_slug", professionSlug);
    const fallbackProgrammeSlugs = Array.from(
      new Set(
        ((links ?? []) as Array<{ program_slug: string | null }>)
          .map((row) => row.program_slug)
          .filter((value): value is string => Boolean(value))
      )
    );

    const truthLookupInputs = await buildAvailabilityTruthLookupInputs({
      supabase,
      preferredMunicipalityCodes,
      primaryProgrammeSlugs:
        typeof programmeStep?.program_slug === "string"
          ? [programmeStep.program_slug]
          : [],
      fallbackProgrammeSlugs,
    });
    const { useTruth, truth } = await shouldUseAvailabilityTruth({
      countyCodes: truthLookupInputs.countyCodes,
      programmeSlugsOrCodes: truthLookupInputs.programmeSlugsOrCodes,
    });

    if (!useTruth) {
      return { items: [], emptyState: EMPTY_STATE };
    }

    const variants = await buildPathVariants(truth.rows);
    const scopedOutcomes =
      selectedSourceOutcomeUrl !== null
        ? variants.outcomes.filter(
            (outcome) => outcome.sourceOutcomeUrl === selectedSourceOutcomeUrl
          )
        : variants.outcomes;
    if (selectedSourceOutcomeUrl === null) {
      console.info(
        "[get-study-route-available-professions] fallback_to_unscoped_outcomes",
        {
          routeId: params.routeId,
          reason: "missing_selected_source_outcome_url",
          outcomesCount: variants.outcomes.length,
        }
      );
    }
    const navMapped = await mapVilbliOutcomesToNav({
      outcomes: scopedOutcomes,
    });
    const { data: localProfessions } = await supabase
      .from("professions")
      .select("id, slug, title_i18n")
      .eq("is_active", true);

    const normalize = (value: string) =>
      value
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

    const localByTitle = new Map<string, { id: string; slug: string }>();
    for (const row of (localProfessions ?? []) as Array<{
      id: string;
      slug: string;
      title_i18n: Record<string, string> | null;
    }>) {
      for (const localeTitle of Object.values(row.title_i18n ?? {})) {
        const key = normalize(localeTitle);
        if (!localByTitle.has(key)) {
          localByTitle.set(key, { id: row.id, slug: row.slug });
        }
      }
    }

    const items: StudyRouteAvailableProfession[] = [];
    for (const item of navMapped.mapped) {
      const matchingTitle = item.navTitle ?? item.sourceOutcome.vilbliTitle;
      const local = localByTitle.get(normalize(matchingTitle));
      items.push({
        professionId:
          local?.id ??
          `review-${normalize(item.sourceOutcome.vilbliTitle).replace(/\s+/g, "-")}`,
        slug: local?.slug ?? null,
        title: item.sourceOutcome.vilbliTitle,
        navTitle: item.navTitle,
        navYrkeskategori: item.navYrkeskategori,
        reviewNeeded: item.reviewNeeded || !local,
        whyOpenedLabel: "Outcome from source-backed Vilbli path",
        similarityLabel: item.reviewNeeded ? "Review needed" : "NAV mapped",
      });
    }

    return {
      items,
      emptyState: items.length === 0 ? EMPTY_STATE : null,
    };
  }

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
          navTitle: null,
          navYrkeskategori: null,
          reviewNeeded: false,
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
