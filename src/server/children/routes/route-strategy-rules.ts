export type RouteStrategyType =
  | "score_improvement"
  | "related_profession";

export type RouteStrategy = {
  type: RouteStrategyType;
  title: string;
  description: string;
  leads_to_same_profession: boolean;
};

export function getRouteStrategies(professionSlug: string): RouteStrategy[] {
  if (professionSlug === "doctor") {
    return [
      {
        type: "score_improvement",
        title: "Choose Studiespesialisering (VGS)",
        description:
          "Select the academic track (Studiespesialisering) in upper secondary school to obtain general university admission (generell studiekompetanse).",
        leads_to_same_profession: true,
      },
      {
        type: "score_improvement",
        title: "Complete required science subjects",
        description:
          "Take Mathematics (R1 or S1+S2), Physics 1, and Chemistry 1 + 2. These are required for admission to medical studies in Norway.",
        leads_to_same_profession: true,
      },
      {
        type: "score_improvement",
        title: "Maximize grades (target 6.0)",
        description:
          "Medical studies require top grades. Focus on achieving the highest possible average, especially in science subjects.",
        leads_to_same_profession: true,
      },
      {
        type: "score_improvement",
        title: "Earn additional points (realfagspoeng)",
        description:
          "Advanced science subjects provide extra admission points (realfagspoeng), which are critical for highly competitive programs like medicine.",
        leads_to_same_profession: true,
      },
      {
        type: "score_improvement",
        title: "Consider advanced language for extra points",
        description:
          "Taking a foreign language at an advanced level may provide additional admission points (språkpoeng).",
        leads_to_same_profession: true,
      },
      {
        type: "related_profession",
        title: "Choose a related health profession",
        description:
          "Programs such as nursing or bioengineering lead to stable healthcare careers but do NOT lead to becoming a licensed doctor in Norway.",
        leads_to_same_profession: false,
      },
    ];
  }

  return [];
}