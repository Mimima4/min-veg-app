export type RouteRequirementRule = {
    professionSlug: string;
    programmeStepOnly: boolean;
    items: string[];
  };
  
  const RULES: RouteRequirementRule[] = [
    {
      professionSlug: "doctor",
      programmeStepOnly: true,
      items: [
        "Generell studiekompetanse",
        "Mathematics: R1 or S1+S2",
        "Physics 1",
        "Chemistry 1 + 2",
      ],
    },
  ];
  
  export function getRouteRequirementsRule(professionSlug: string) {
    return RULES.find((rule) => rule.professionSlug === professionSlug) ?? null;
  }