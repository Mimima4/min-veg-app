import { createClient } from "@/lib/supabase/server";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import type { StudyRouteSnapshotContext } from "@/lib/routes/route-types";
import {
  getChildPlanningState,
  type ChildPlanningSourceRow,
} from "@/server/children/planning/get-child-planning-state";

type Params = {
  locale: string;
  childId: string;
  routeId: string;
  routeVariantId: string | null;
  targetProfessionId: string;
  supabase?: Awaited<ReturnType<typeof createClient>>;
};

type ProfessionRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
};

type ChildPlanningContextRow = ChildPlanningSourceRow & {
  relocation_willingness: "no" | "maybe" | "yes" | null;
};

export async function buildStudyRouteSnapshotContext(
  params: Params
): Promise<StudyRouteSnapshotContext> {
  const supabase = params.supabase ?? (await createClient());
  const supportedLocale = params.locale as SupportedLocale;

  const [{ data: child, error: childError }, { data: profession, error: professionError }] =
    await Promise.all([
      supabase
        .from("child_profiles")
        .select(
          "interests, observed_traits, desired_income_band, preferred_work_style, preferred_education_level, preferred_municipality_codes, relocation_willingness"
        )
        .eq("id", params.childId)
        .maybeSingle(),
      supabase
        .from("professions")
        .select("id, slug, title_i18n")
        .eq("id", params.targetProfessionId)
        .eq("is_active", true)
        .maybeSingle(),
    ]);

  if (childError) {
    throw new Error(
      `Failed to build study route snapshot context from child profile: ${childError.message}`
    );
  }

  if (!child) {
    throw new Error(
      `Child profile ${params.childId} not found for study route snapshot context`
    );
  }

  if (professionError) {
    throw new Error(
      `Failed to build study route snapshot context from profession: ${professionError.message}`
    );
  }

  if (!profession) {
    throw new Error(
      `Target profession ${params.targetProfessionId} missing or inactive for study route snapshot context`
    );
  }

  const childRow = child as ChildPlanningContextRow;
  const professionRow = profession as ProfessionRow;
  const planningState = getChildPlanningState(childRow);

  return {
    locale: params.locale,
    childId: params.childId,
    routeId: params.routeId,
    routeVariantId: params.routeVariantId,
    currentProfession: {
      id: professionRow.id,
      slug: professionRow.slug,
      title:
        getLocalizedValue(professionRow.title_i18n ?? {}, supportedLocale) ||
        professionRow.slug,
    },
    planning: {
      preferredMunicipalityCodes: planningState.preferredMunicipalityCodes,
      relocationWillingness: childRow.relocation_willingness,
      interestIds: planningState.interestIds,
      observedTraitIds: planningState.observedTraitIds,
      derivedStrengthIds: planningState.derivedStrengthIds,
      desiredIncomeBand: planningState.desiredIncomeBand,
      preferredWorkStyle: planningState.preferredWorkStyle,
      preferredEducationLevel: planningState.preferredEducationLevel,
    },
  };
}