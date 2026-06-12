export const ORDINARY_AVAILABILITY_SCOPE = "programme_in_school" as const;

export const LOSA_AVAILABILITY_SCOPE = "losa_fjern_delivery_municipality" as const;

export type AvailabilityScope =
  | typeof ORDINARY_AVAILABILITY_SCOPE
  | typeof LOSA_AVAILABILITY_SCOPE;

/**
 * Permission #3 — bounded LOSA Route wiring (Alta pilot on reference county 56).
 * Nationwide scope rules; not a Finnmark-only runtime branch.
 */
export const LOSA_ROUTE_UI_INTEGRATION_APPROVED = true;

export function availabilityScopesForRouteTruth(): AvailabilityScope[] {
  const scopes: AvailabilityScope[] = [ORDINARY_AVAILABILITY_SCOPE];
  if (LOSA_ROUTE_UI_INTEGRATION_APPROVED) {
    scopes.push(LOSA_AVAILABILITY_SCOPE);
  }
  return scopes;
}

export function isLosaAvailabilityScope(
  scope: string | null | undefined
): scope is typeof LOSA_AVAILABILITY_SCOPE {
  return scope === LOSA_AVAILABILITY_SCOPE;
}

export type LosaPsaNotesMeta = {
  providerSchoolLabel?: string | null;
  deliverySiteLabel?: string | null;
};

const LOSA_INLINE_LABEL_SPLIT =
  /^(.+?)\s*(?:[–—-]\s*|\s+)(?:LOSA|lokal\s+oppl(?:æ|a)ring)\s+(.+)$/iu;

const LOSA_DELIVERY_PREFIX = /^(?:LOSA|lokal\s+oppl(?:æ|a)ring)\s+/iu;

export type ProgrammeSelectionOptionIdentityInput = {
  institution_id?: string | null;
  program_slug?: string | null;
  option_kind?: string | null;
  delivery_municipality_code?: string | null;
  delivery_site_label?: string | null;
  institution_city?: string | null;
  institution_municipality?: string | null;
};

export function parseLosaPsaNotes(notes: string | null | undefined): LosaPsaNotesMeta {
  if (!notes?.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>;
    return {
      providerSchoolLabel:
        typeof parsed.provider_school_label === "string"
          ? normalizeLosaProviderLabel(parsed.provider_school_label)
          : null,
      deliverySiteLabel:
        typeof parsed.delivery_site_label === "string"
          ? normalizeLosaDeliverySiteLabel(parsed.delivery_site_label)
          : null,
    };
  } catch {
    return {};
  }
}

/** Strip Vilbli-style `Provider – LOSA Alta` down to provider-only. */
export function normalizeLosaProviderLabel(
  label: string | null | undefined
): string | null {
  const trimmed = String(label ?? "").trim();
  if (!trimmed) return null;
  const splitMatch = trimmed.match(LOSA_INLINE_LABEL_SPLIT);
  if (splitMatch?.[1]) {
    return splitMatch[1].trim() || trimmed;
  }
  return trimmed;
}

/** kommune line only — badge carries LOSA semantics. */
export function normalizeLosaDeliverySiteLabel(
  label: string | null | undefined
): string | null {
  const trimmed = String(label ?? "").trim();
  if (!trimmed) return null;
  const splitMatch = trimmed.match(LOSA_INLINE_LABEL_SPLIT);
  if (splitMatch?.[2]) {
    return splitMatch[2].trim() || trimmed;
  }
  const withoutPrefix = trimmed.replace(LOSA_DELIVERY_PREFIX, "").trim();
  return withoutPrefix || trimmed;
}

export function resolveLosaDeliverySiteLabel(
  option: ProgrammeSelectionOptionIdentityInput
): string | null {
  return normalizeLosaDeliverySiteLabel(
    option.delivery_site_label ??
      option.institution_city ??
      option.institution_municipality
  );
}

export function formatLosaDropdownLabel(params: {
  providerLabel: string;
  deliverySiteLabel: string | null | undefined;
}): string {
  const provider = normalizeLosaProviderLabel(params.providerLabel) ?? params.providerLabel.trim();
  const delivery = normalizeLosaDeliverySiteLabel(params.deliverySiteLabel);
  if (!delivery) return provider;
  return `${provider} · ${delivery}`;
}

export function isLosaProgrammeOption(
  option: ProgrammeSelectionOptionIdentityInput
): boolean {
  if (isLosaAvailabilityScope(option.option_kind)) {
    return true;
  }
  const municipalityCode = String(option.delivery_municipality_code ?? "").trim();
  return municipalityCode.length > 0;
}

export function buildProgrammeSelectionOptionId(
  option: ProgrammeSelectionOptionIdentityInput,
  index: number
): string {
  const institutionId = String(option.institution_id ?? "").trim();
  const programSlug = String(option.program_slug ?? "").trim();
  if (isLosaProgrammeOption(option)) {
    const municipalityCode = String(option.delivery_municipality_code ?? "").trim();
    if (institutionId && municipalityCode) {
      return `programme-losa-${institutionId}-${municipalityCode}`;
    }
    const deliveryKey = resolveLosaDeliverySiteLabel(option);
    if (institutionId && deliveryKey) {
      const slug = deliveryKey.toLowerCase().replace(/\s+/g, "-");
      return `programme-losa-${institutionId}-${slug}`;
    }
  }
  if (institutionId) {
    if (programSlug) {
      return `programme-${institutionId}-${programSlug}`;
    }
    return `programme-${institutionId}-${index}`;
  }
  return `programme-index-${index}`;
}

/** Provider school label only — delivery kommune is shown separately; LOSA via route UI badge. */
export function buildLosaOptionDisplayTitle(params: {
  providerLabel: string | null | undefined;
  deliverySiteLabel?: string | null | undefined;
}): string | null {
  const provider = String(params.providerLabel ?? "").trim();
  return provider || null;
}

export const LOSA_ROUTE_BADGE_LABEL = "LOSA" as const;

export const LOSA_ROUTE_BADGE_TITLE =
  "Lokal opplæringsordning / fjernundervisning" as const;
