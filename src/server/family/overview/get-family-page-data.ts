import type { SupportedLocale } from "@/lib/i18n/site-copy";
import { getChildSummary } from "@/lib/planning/get-child-summary";
import { createClient } from "@/lib/supabase/server";
import {
  getAccountEntitlements,
  type AccountEntitlements,
  type FamilyAccountRow,
} from "@/server/billing/get-account-entitlements";
import {
  getChildPlanningState,
  type DesiredIncomeBand,
  type PreferredEducationLevel,
  type PreferredWorkStyle,
} from "@/server/children/planning/get-child-planning-state";

type ChildRow = {
  id: string;
  display_name: string | null;
  birth_year: number | null;
  school_stage: string | null;
  interests: unknown;
  observed_traits: unknown;
  desired_income_band: DesiredIncomeBand | null;
  preferred_work_style: PreferredWorkStyle | null;
  preferred_education_level: PreferredEducationLevel | null;
  preferred_municipality_codes?: unknown;
  created_at: string;
};

type ProfessionSummaryRow = {
  id: string;
  slug: string;
  title_i18n: Record<string, string> | null;
  summary_i18n: Record<string, string> | null;
  key_skills: unknown;
  interest_tags: unknown;
  strength_tags: unknown;
  development_focus_tags: unknown;
  school_subject_tags: unknown;
  avg_salary_nok: number | null;
  demand_level: string | null;
  education_level: string;
  work_style: string;
};

export type FamilyChildOverviewCard = {
  id: string;
  displayName: string;
  birthYear: number | null;
  schoolStageLabel: string;
  currentSignalsCount: number;
  derivedStrengthCount: number;
  matchingProfessionCount: number;
  savedProfessionCount: number;
  savedStudyRouteCount: number;
  summaryHref: string;
  profileHref: string;
  currentSignalsHref: string;
  derivedStrengthsHref: string;
  matchingProfessionsHref: string;
  savedProfessionsHref: string;
  savedStudyRoutesHref: string;
};

export type FamilyPageData = {
  locale: string;
  familyAccount: FamilyAccountRow;
  entitlements: AccountEntitlements;
  children: FamilyChildOverviewCard[];
};

export type FamilyPageResult =
  | { kind: "redirect"; href: string }
  | { kind: "error"; title: string; subtitle: string; message: string }
  | { kind: "no_family" }
  | { kind: "ok"; data: FamilyPageData };

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

export async function getFamilyPageData({
  locale,
}: {
  locale: string;
}): Promise<FamilyPageResult> {
  const supportedLocale = locale as SupportedLocale;
  const supabase = await createClient();

  const entitlementsResult = await getAccountEntitlements({
    locale,
    supabase,
  });

  if (entitlementsResult.kind === "redirect") {
    return entitlementsResult;
  }

  if (entitlementsResult.kind === "error") {
    return {
      kind: "error",
      title: "Family",
      subtitle: "There was a problem loading your family account.",
      message: entitlementsResult.message,
    };
  }

  if (entitlementsResult.kind === "no_family") {
    return { kind: "no_family" };
  }

  const entitlements = entitlementsResult.data;
  const childIds: string[] = [];

  const { data: children, error: childrenError } = await supabase
    .from("child_profiles")
    .select(
      "id, display_name, birth_year, school_stage, interests, observed_traits, desired_income_band, preferred_work_style, preferred_education_level, created_at"
    )
    .eq("family_account_id", entitlements.familyAccount.id)
    .order("created_at", { ascending: true });

  if (childrenError) {
    return {
      kind: "error",
      title: "Family",
      subtitle: "There was a problem loading child profiles.",
      message: childrenError.message,
    };
  }

  const typedChildren = (children ?? []) as ChildRow[];

  for (const child of typedChildren) {
    childIds.push(child.id);
  }

  const { data: savedLinks, error: savedLinksError } =
    childIds.length > 0
      ? await supabase
          .from("child_profession_interests")
          .select("child_profile_id, profession_id")
          .in("child_profile_id", childIds)
      : { data: [], error: null };

  if (savedLinksError) {
    return {
      kind: "error",
      title: "Family",
      subtitle: "There was a problem loading saved professions.",
      message: savedLinksError.message,
    };
  }

  const savedCountByChildId = new Map<string, number>();

  for (const link of savedLinks ?? []) {
    const current = savedCountByChildId.get(link.child_profile_id) ?? 0;
    savedCountByChildId.set(link.child_profile_id, current + 1);
  }

  const { data: savedStudyRoutes, error: savedStudyRoutesError } =
    childIds.length > 0
      ? await supabase
          .from("child_saved_education_routes")
          .select("child_profile_id, program_slug")
          .in("child_profile_id", childIds)
      : { data: [], error: null };

  if (savedStudyRoutesError) {
    return {
      kind: "error",
      title: "Family",
      subtitle: "There was a problem loading saved study routes.",
      message: savedStudyRoutesError.message,
    };
  }

  const savedStudyRouteCountByChildId = new Map<string, number>();

  for (const route of savedStudyRoutes ?? []) {
    const current = savedStudyRouteCountByChildId.get(route.child_profile_id) ?? 0;
    savedStudyRouteCountByChildId.set(route.child_profile_id, current + 1);
  }

  const { data: professions, error: professionsError } = await supabase
    .from("professions")
    .select(
      "id, slug, title_i18n, summary_i18n, key_skills, interest_tags, strength_tags, development_focus_tags, school_subject_tags, avg_salary_nok, demand_level, education_level, work_style"
    )
    .eq("is_active", true);

  if (professionsError) {
    return {
      kind: "error",
      title: "Family",
      subtitle: "There was a problem loading child summaries.",
      message: professionsError.message,
    };
  }

  const typedProfessions = (professions ?? []) as ProfessionSummaryRow[];

  const childCards: FamilyChildOverviewCard[] = typedChildren.map((child) => {
    const planningState = getChildPlanningState({
      interests: child.interests,
      observed_traits: child.observed_traits,
      desired_income_band: child.desired_income_band,
      preferred_work_style: child.preferred_work_style,
      preferred_education_level: child.preferred_education_level,
      preferred_municipality_codes: [],
    });

    const summary = getChildSummary({
      interestIds: planningState.interestIds,
      derivedStrengthIds: planningState.derivedStrengthIds,
      professions: typedProfessions,
      desiredIncomeBand: planningState.desiredIncomeBand,
      preferredWorkStyle: planningState.preferredWorkStyle,
      preferredEducationLevel: planningState.preferredEducationLevel,
      savedProfessionCount: savedCountByChildId.get(child.id) ?? 0,
    });

    return {
      id: child.id,
      displayName: child.display_name || "Unnamed child",
      birthYear: child.birth_year,
      schoolStageLabel: getSchoolStageLabel(child.school_stage, supportedLocale),
      currentSignalsCount: planningState.currentSignalsCount,
      derivedStrengthCount: planningState.derivedStrengthIds.length,
      matchingProfessionCount: summary.matchingProfessionCount,
      savedProfessionCount: summary.savedProfessionCount,
      savedStudyRouteCount: savedStudyRouteCountByChildId.get(child.id) ?? 0,
      summaryHref: `/${locale}/app/children/${child.id}/summary`,
      profileHref: `/${locale}/app/children/${child.id}`,
      currentSignalsHref: `/${locale}/app/children/${child.id}#current-signals`,
      derivedStrengthsHref: `/${locale}/app/children/${child.id}/summary#derived-strengths`,
      matchingProfessionsHref: `/${locale}/app/children/${child.id}/matches`,
      savedProfessionsHref: `/${locale}/app/children/${child.id}#saved-professions`,
      savedStudyRoutesHref: `/${locale}/app/children/${child.id}#saved-study-routes`,
    };
  });

  return {
    kind: "ok",
    data: {
      locale,
      familyAccount: entitlements.familyAccount,
      entitlements,
      children: childCards,
    },
  };
}