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

function stepDownCompetition(
  level: StudyRouteCompetitionLevel,
  steps: number
): StudyRouteCompetitionLevel {
  const ordered: StudyRouteCompetitionLevel[] = [
    "low",
    "medium",
    "high",
    "very_high",
  ];
  const index = ordered.indexOf(level);
  const nextIndex = Math.max(0, index - steps);
  return ordered[nextIndex] ?? level;
}

/**
 * Applies official-source competition tuning while keeping existing scale.
 * Lower confidence never forces strong competition changes.
 */
export function applyAdmissionCompetitionAdjustment(params: {
  baseLevel: StudyRouteCompetitionLevel;
  competitionAdjustment: number | null;
  confidenceLevel: "low" | "medium" | "high" | null;
}): StudyRouteCompetitionLevel {
  const { baseLevel, competitionAdjustment, confidenceLevel } = params;

  if (confidenceLevel === "low") {
    return baseLevel;
  }

  if (typeof competitionAdjustment !== "number" || !Number.isFinite(competitionAdjustment)) {
    return baseLevel;
  }

  // Keep top-pressure programmes in very_high unless adjustment is materially softer.
  if (competitionAdjustment > -0.4) {
    return stepDownCompetition(baseLevel, 2);
  }

  if (competitionAdjustment > -1.0) {
    return stepDownCompetition(baseLevel, 1);
  }

  return baseLevel;
}
