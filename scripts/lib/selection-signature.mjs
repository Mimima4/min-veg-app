/**
 * Keep in sync with src/lib/routes/selection-signature.ts (smoke runtime).
 */
function normalizeJsonValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeJsonValue(item));
  }
  if (value && typeof value === "object") {
    const sortedEntries = Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nestedValue]) => [key, normalizeJsonValue(nestedValue)]);
    return Object.fromEntries(sortedEntries);
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(normalizeJsonValue(value));
}

function buildProgrammeSelectionOptionId(option, index) {
  const institutionId = String(option.institution_id ?? "").trim();
  const programSlug = String(option.program_slug ?? "").trim();
  if (institutionId) {
    if (programSlug) {
      return `programme-${institutionId}-${programSlug}`;
    }
    return `programme-${institutionId}-${index}`;
  }
  return `programme-index-${index}`;
}

export function buildSelectionSignatureFromPayload(selectedStepsPayload) {
  if (!Array.isArray(selectedStepsPayload)) {
    return stableStringify([]);
  }

  const signatureEntries = [];

  selectedStepsPayload.forEach((step, index) => {
    if (!step || typeof step !== "object" || Array.isArray(step)) return;
    const stepType = step.type;
    if (stepType !== "programme_selection" && stepType !== "apprenticeship_step") return;

    const stepKey = `snap-${index}-${String(stepType)}-${String(step.program_slug ?? "none")}`;

    if (stepType === "programme_selection") {
      const options = Array.isArray(step.options) ? step.options : [];
      if (options.length === 0) return;

      const targetSchool =
        typeof step.institution_name === "string" ? step.institution_name : null;
      const targetLocation =
        typeof step.institution_city === "string"
          ? step.institution_city
          : typeof step.institution_municipality === "string"
            ? step.institution_municipality
            : null;
      const targetWebsite =
        typeof step.institution_website === "string" ? step.institution_website : null;

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

    const apprenticeshipOptions = Array.isArray(step.apprenticeship_options)
      ? step.apprenticeship_options
      : [];
    const selectedApprenticeshipId =
      typeof step.selected_apprenticeship_option_id === "string"
        ? step.selected_apprenticeship_option_id
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
