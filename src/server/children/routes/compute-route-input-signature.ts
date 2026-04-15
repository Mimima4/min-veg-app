import { createHash } from "crypto";

type RouteRelevantInputs = {
  preferredMunicipalityCodes: string[];
  relocationWillingness: "no" | "maybe" | "yes" | null;
  interestIds: string[];
  observedTraitIds: string[];
  desiredIncomeBand: string | null;
  preferredWorkStyle: string | null;
  preferredEducationLevel: string | null;
};

function normalizeStringArray(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))
  ).sort((a, b) => a.localeCompare(b));
}

function normalizeScalar(value: string | null): string {
  return value && value.trim().length > 0 ? value.trim() : "__null__";
}

export function computeRouteInputSignature(inputs: RouteRelevantInputs): string {
  const canonicalPayload = JSON.stringify({
    preferred_municipality_codes: normalizeStringArray(inputs.preferredMunicipalityCodes),
    relocation_willingness: normalizeScalar(inputs.relocationWillingness),
    interest_ids: normalizeStringArray(inputs.interestIds),
    observed_trait_ids: normalizeStringArray(inputs.observedTraitIds),
    desired_income_band: normalizeScalar(inputs.desiredIncomeBand),
    preferred_work_style: normalizeScalar(inputs.preferredWorkStyle),
    preferred_education_level: normalizeScalar(inputs.preferredEducationLevel),
  });

  return createHash("sha256").update(canonicalPayload).digest("hex");
}
