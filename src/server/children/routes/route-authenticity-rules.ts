export type RouteAuthenticityKind =
  | "vocational"
  | "regulated_profession"
  | "academic";

export type RouteCompetitionLevel = "standard" | "high";

export type RouteAlternativeStrategyType =
  | "score_improvement"
  | "related_profession"
  | "delayed_entry";

export type RouteAuthenticityStep = {
  type: "progression_step" | "outcome_step";
  title: string;
  education_level: string;
  fit_band: "strong" | "broader";
};

export type RouteAuthenticityRule = {
  professionSlug: string;
  routeKind: RouteAuthenticityKind;
  competitionLevel: RouteCompetitionLevel;
  progressionAndOutcomeSteps: RouteAuthenticityStep[];
  alternativeStrategyTypes: RouteAlternativeStrategyType[];
};

type RouteAuthenticityContext = {
  source?: "availability_truth" | "legacy";
};

const RULES: RouteAuthenticityRule[] = [
  {
    professionSlug: "electrician",
    routeKind: "vocational",
    competitionLevel: "standard",
    progressionAndOutcomeSteps: [
      {
        type: "progression_step",
        title: "Apprenticeship (læretid)",
        education_level: "apprenticeship",
        fit_band: "strong",
      },
      {
        type: "outcome_step",
        title: "Fagbrev (Electrician)",
        education_level: "certificate",
        fit_band: "strong",
      },
    ],
    alternativeStrategyTypes: [],
  },
  {
    professionSlug: "doctor",
    routeKind: "regulated_profession",
    competitionLevel: "high",
    progressionAndOutcomeSteps: [
      {
        type: "progression_step",
        title: "LIS1 (turnustjeneste)",
        education_level: "professional_degree",
        fit_band: "strong",
      },
      {
        type: "outcome_step",
        title: "Autorisasjon (Lege)",
        education_level: "professional_degree",
        fit_band: "strong",
      },
    ],
    alternativeStrategyTypes: ["score_improvement", "related_profession"],
  },
];

export function getRouteAuthenticityRule(
  professionSlug: string,
  context?: RouteAuthenticityContext
) {
  if (context?.source === "availability_truth") {
    return null;
  }
  const rule = RULES.find((entry) => entry.professionSlug === professionSlug) ?? null;
  if (!rule) {
    return null;
  }
  return rule;
}