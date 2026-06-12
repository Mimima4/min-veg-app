import { buildProgrammeSelectionOptionId } from "@/lib/losa/availability-scope";

function normalizeJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonValue(item));
  }
  if (value && typeof value === "object") {
    const sortedEntries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nestedValue]) => [key, normalizeJsonValue(nestedValue)]);
    return Object.fromEntries(sortedEntries);
  }
  return value;
}

function stableStringify(value: unknown): string {
  return JSON.stringify(normalizeJsonValue(value));
}

/** Canonical signature for comparing working-route selections to saved snapshots. */
export function buildSelectionSignatureFromPayload(selectedStepsPayload: unknown): string {
  if (!Array.isArray(selectedStepsPayload)) {
    return stableStringify([]);
  }

  const signatureEntries: Array<{ stepKey: string; optionId: string }> = [];

  selectedStepsPayload.forEach((step, index) => {
    if (!step || typeof step !== "object" || Array.isArray(step)) return;
    const typedStep = step as Record<string, unknown>;
    const stepType = typedStep.type;
    if (stepType !== "programme_selection" && stepType !== "apprenticeship_step") return;

    const stepKey = `snap-${index}-${String(stepType)}-${String(typedStep.program_slug ?? "none")}`;

    if (stepType === "programme_selection") {
      const options = Array.isArray(typedStep.options)
        ? (typedStep.options as Array<Record<string, unknown>>)
        : [];
      if (options.length === 0) return;

      const targetSchool =
        typeof typedStep.institution_name === "string" ? typedStep.institution_name : null;
      const targetLocation =
        typeof typedStep.institution_city === "string"
          ? typedStep.institution_city
          : typeof typedStep.institution_municipality === "string"
            ? typedStep.institution_municipality
            : null;
      const targetWebsite =
        typeof typedStep.institution_website === "string" ? typedStep.institution_website : null;

      const matchedOptionIndex = options.findIndex((option) => {
        const schoolName =
          typeof option.institution_name === "string" ? option.institution_name : null;
        if (!targetSchool || schoolName !== targetSchool) return false;

        const location =
          typeof option.institution_city === "string"
            ? option.institution_city
            : typeof option.institution_municipality === "string"
              ? option.institution_municipality
              : null;
        if (targetLocation && location && location !== targetLocation) return false;

        const website =
          typeof option.institution_website === "string" ? option.institution_website : null;
        if (targetWebsite && website && website !== targetWebsite) return false;

        return true;
      });

      const selectedIndex = matchedOptionIndex >= 0 ? matchedOptionIndex : 0;
      const selectedOption = options[selectedIndex];
      signatureEntries.push({
        stepKey,
        optionId: buildProgrammeSelectionOptionId(selectedOption ?? {}, selectedIndex),
      });
      return;
    }

    const apprenticeshipOptions = Array.isArray(typedStep.apprenticeship_options)
      ? (typedStep.apprenticeship_options as Array<Record<string, unknown>>)
      : [];
    const selectedApprenticeshipId =
      typeof typedStep.selected_apprenticeship_option_id === "string"
        ? typedStep.selected_apprenticeship_option_id
        : null;
    const fallbackApprenticeshipId =
      apprenticeshipOptions[0] && typeof apprenticeshipOptions[0].option_id === "string"
        ? apprenticeshipOptions[0].option_id
        : null;
    const optionId = selectedApprenticeshipId ?? fallbackApprenticeshipId;
    if (!optionId) return;
    signatureEntries.push({ stepKey, optionId });
  });

  return stableStringify(signatureEntries);
}
