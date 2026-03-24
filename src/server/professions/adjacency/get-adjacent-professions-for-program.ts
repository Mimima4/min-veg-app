import { createClient } from "@/lib/supabase/server";
import { getLocalizedValue } from "@/lib/i18n/get-localized-value";
import type { SupportedLocale } from "@/lib/i18n/site-copy";
import {
  getDerivedStrengthLabel,
  getInterestLabel,
} from "@/lib/planning/child-tag-catalog";
import { getProfessionChildFit } from "@/lib/planning/get-profession-child-fit";
import type { ChildPlanningState } from "@/server/children/planning/get-child-planning-state";

type ProfessionProgramLinkRow = {
  profession_slug: string;
  program_slug: string;
  fit_band: "strong" | "broader";
};

type ProfessionRow = {
  slug: string;
  title_i18n: Record<string, string> | null;
  interest_tags: unknown;
  strength_tags: unknown;
  development_focus_tags: unknown;
  school_subject_tags: unknown;
  work_style: string;
  education_level: string;
  avg_salary_nok: number | null;
};

export type AdjacentProfessionCard = {
  slug: string;
  title: string;
  fitScore: number;
  matchedInterestLabels: string[];
  matchedStrengthLabels: string[];
};

export type AdjacentProfessionsByProgram = Map<string, AdjacentProfessionCard[]>;

export type AdjacentProfessionsForProgramsResult =
  | { kind: "ok"; byProgramSlug: AdjacentProfessionsByProgram }
  | { kind: "error"; message: string };

export async function getAdjacentProfessionsForPrograms({
  locale,
  planningState,
  programCurrentProfessionPairs,
}: {
  locale: string;
  planningState: Pick<
    ChildPlanningState,
    | "interestIds"
    | "derivedStrengthIds"
    | "desiredIncomeBand"
    | "preferredWorkStyle"
    | "preferredEducationLevel"
  >;
  programCurrentProfessionPairs: Array<{
    programSlug: string;
    currentProfessionSlug: string;
  }>;
}): Promise<AdjacentProfessionsForProgramsResult> {
  if (programCurrentProfessionPairs.length === 0) {
    return { kind: "ok", byProgramSlug: new Map() };
  }

  const supportedLocale = locale as SupportedLocale;
  const supabase = await createClient();

  const programSlugs = Array.from(
    new Set(programCurrentProfessionPairs.map((item) => item.programSlug))
  );

  const { data: links, error: linksError } = await supabase
    .from("profession_program_links")
    .select("profession_slug, program_slug, fit_band")
    .in("program_slug", programSlugs);

  if (linksError) {
    return { kind: "error", message: linksError.message };
  }

  const typedLinks = (links ?? []) as ProfessionProgramLinkRow[];
  const adjacentProfessionSlugs = Array.from(
    new Set(typedLinks.map((item) => item.profession_slug))
  );

  if (adjacentProfessionSlugs.length === 0) {
    return { kind: "ok", byProgramSlug: new Map() };
  }

  const { data: professions, error: professionsError } = await supabase
    .from("professions")
    .select(
      "slug, title_i18n, interest_tags, strength_tags, development_focus_tags, school_subject_tags, work_style, education_level, avg_salary_nok"
    )
    .in("slug", adjacentProfessionSlugs);

  if (professionsError) {
    return { kind: "error", message: professionsError.message };
  }

  const professionMap = new Map(
    ((professions ?? []) as ProfessionRow[]).map((item) => [item.slug, item])
  );

  const linksByProgram = new Map<string, ProfessionProgramLinkRow[]>();

  for (const link of typedLinks) {
    const current = linksByProgram.get(link.program_slug) ?? [];
    current.push(link);
    linksByProgram.set(link.program_slug, current);
  }

  const currentProfessionByProgram = new Map<string, string>(
    programCurrentProfessionPairs.map((item) => [
      item.programSlug,
      item.currentProfessionSlug,
    ])
  );

  const byProgramSlug: AdjacentProfessionsByProgram = new Map();

  for (const programSlug of programSlugs) {
    const currentProfessionSlug = currentProfessionByProgram.get(programSlug);

    if (!currentProfessionSlug) {
      byProgramSlug.set(programSlug, []);
      continue;
    }

    const openDoorProfessions: AdjacentProfessionCard[] = (
      linksByProgram.get(programSlug) ?? []
    )
      .filter((item) => item.profession_slug !== currentProfessionSlug)
      .map((item) => {
        const adjacentProfession = professionMap.get(item.profession_slug);

        if (!adjacentProfession) {
          return null;
        }

        const fit = getProfessionChildFit({
          profession: {
            interest_tags: adjacentProfession.interest_tags,
            strength_tags: adjacentProfession.strength_tags,
            development_focus_tags: adjacentProfession.development_focus_tags,
            school_subject_tags: adjacentProfession.school_subject_tags,
            avg_salary_nok: adjacentProfession.avg_salary_nok,
            work_style: adjacentProfession.work_style,
            education_level: adjacentProfession.education_level,
          },
          childInterestIds: planningState.interestIds,
          childDerivedStrengthIds: planningState.derivedStrengthIds,
          desiredIncomeBand: planningState.desiredIncomeBand,
          preferredWorkStyle: planningState.preferredWorkStyle,
          preferredEducationLevel: planningState.preferredEducationLevel,
        });

        const fitScore =
          fit.matchedInterestIds.length * 2 +
          fit.matchedStrengthIds.length * 3 +
          fit.preferenceMatches.length;

        return {
          slug: adjacentProfession.slug,
          title: getLocalizedValue(
            adjacentProfession.title_i18n ?? {},
            supportedLocale
          ),
          fitScore,
          matchedInterestLabels: fit.matchedInterestIds.map((id) =>
            getInterestLabel(id, supportedLocale)
          ),
          matchedStrengthLabels: fit.matchedStrengthIds.map((id) =>
            getDerivedStrengthLabel(id, supportedLocale)
          ),
        } satisfies AdjacentProfessionCard;
      })
      .filter((item): item is AdjacentProfessionCard => Boolean(item))
      .sort((a, b) => {
        if (b.fitScore !== a.fitScore) {
          return b.fitScore - a.fitScore;
        }

        return a.title.localeCompare(b.title);
      })
      .slice(0, 3);

    byProgramSlug.set(programSlug, openDoorProfessions);
  }

  return { kind: "ok", byProgramSlug };
}