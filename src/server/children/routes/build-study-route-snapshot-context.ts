import { createClient } from "@/lib/supabase/server";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import type { StudyRouteSnapshotContext } from "@/lib/routes/route-types";

type Params = {
  locale: string;
  childId: string;
  routeId: string;
  routeVariantId: string | null;
  targetProfessionId: string;
};

type ChildPlanningRow = {
  interests: unknown;
  desired_income_band: string | null;
  preferred_work_style: string | null;
  preferred_education_level: string | null;
  derived_strengths?: unknown;
};

type ProfessionRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
};

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export async function buildStudyRouteSnapshotContext(
  params: Params
): Promise<StudyRouteSnapshotContext> {
  const supabase = await createClient();
  const supportedLocale = params.locale as SupportedLocale;

  const [{ data: child, error: childError }, { data: profession, error: professionError }] =
    await Promise.all([
      supabase
        .from("child_profiles")
        .select(
          "interests, desired_income_band, preferred_work_style, preferred_education_level, derived_strengths"
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
    throw new Error(`Child profile ${params.childId} not found for study route snapshot context`);
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

  const childRow = child as ChildPlanningRow;
  const professionRow = profession as ProfessionRow;

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
      interestIds: toStringArray(childRow.interests),
      derivedStrengthIds: toStringArray(childRow.derived_strengths),
      desiredIncomeBand: childRow.desired_income_band,
      preferredWorkStyle: childRow.preferred_work_style,
      preferredEducationLevel: childRow.preferred_education_level,
    },
  };
}