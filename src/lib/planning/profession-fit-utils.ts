export type DesiredIncomeBand =
  | "open"
  | "up_to_600k"
  | "600k_to_800k"
  | "800k_plus";

export type PreferredWorkStyle =
  | "open"
  | "onsite"
  | "hybrid"
  | "remote"
  | "mixed";

export type PreferredEducationLevel =
  | "open"
  | "certificate"
  | "vocational"
  | "bachelor"
  | "master"
  | "flexible";

export function matchesIncomeBand(
  avgSalary: number | null,
  desiredIncomeBand: DesiredIncomeBand
): boolean {
  if (desiredIncomeBand === "open") return true;
  if (!avgSalary) return false;

  switch (desiredIncomeBand) {
    case "up_to_600k":
      return avgSalary < 600000;
    case "600k_to_800k":
      return avgSalary >= 600000 && avgSalary <= 800000;
    case "800k_plus":
      return avgSalary > 800000;
    default:
      return true;
  }
}

export function matchesWorkStyle(
  professionWorkStyle: string,
  preferredWorkStyle: PreferredWorkStyle
): boolean {
  if (preferredWorkStyle === "open") return true;
  return professionWorkStyle === preferredWorkStyle;
}

export function matchesEducationLevel(
  professionEducationLevel: string,
  preferredEducationLevel: PreferredEducationLevel
): boolean {
  if (preferredEducationLevel === "open") return true;
  return professionEducationLevel === preferredEducationLevel;
}

export function getPreferenceMatchLabels({
  avgSalaryNok,
  workStyle,
  educationLevel,
  desiredIncomeBand,
  preferredWorkStyle,
  preferredEducationLevel,
}: {
  avgSalaryNok: number | null;
  workStyle: string;
  educationLevel: string;
  desiredIncomeBand: DesiredIncomeBand;
  preferredWorkStyle: PreferredWorkStyle;
  preferredEducationLevel: PreferredEducationLevel;
}): string[] {
  const labels: string[] = [];

  if (
    desiredIncomeBand !== "open" &&
    matchesIncomeBand(avgSalaryNok, desiredIncomeBand)
  ) {
    labels.push("salary fit");
  }

  if (
    preferredWorkStyle !== "open" &&
    matchesWorkStyle(workStyle, preferredWorkStyle)
  ) {
    labels.push("work style fit");
  }

  if (
    preferredEducationLevel !== "open" &&
    matchesEducationLevel(educationLevel, preferredEducationLevel)
  ) {
    labels.push("education fit");
  }

  return labels;
}
