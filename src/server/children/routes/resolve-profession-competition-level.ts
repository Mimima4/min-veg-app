import type { StudyRouteCompetitionLevel } from "@/lib/routes/route-types";

const LEVELS = new Set<StudyRouteCompetitionLevel>([
  "very_high",
  "high",
  "medium",
  "low",
]);

export function parseProfessionCompetitionLevel(
  raw: string | null | undefined
): StudyRouteCompetitionLevel | null {
  if (raw != null && LEVELS.has(raw as StudyRouteCompetitionLevel)) {
    return raw as StudyRouteCompetitionLevel;
  }
  return null;
}

/** Uses `profession.competition_level` when present; otherwise slug-based baseline. */
export function resolveProfessionCompetitionLevel(profession: {
  slug: string;
  competition_level?: string | null;
}): StudyRouteCompetitionLevel {
  const fromData = parseProfessionCompetitionLevel(profession.competition_level);
  if (fromData) {
    return fromData;
  }
  if (profession.slug === "doctor") {
    return "very_high";
  }
  if (profession.slug === "electrician") {
    return "low";
  }
  return "low";
}

export function competitionLevelToLabel(
  level: StudyRouteCompetitionLevel
): string | null {
  switch (level) {
    case "very_high":
      return "Very high competition";
    case "high":
      return "High competition";
    case "medium":
      return "Moderate competition";
    case "low":
      return null;
  }
}
