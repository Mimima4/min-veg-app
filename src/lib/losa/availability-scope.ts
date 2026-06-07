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

export function parseLosaPsaNotes(notes: string | null | undefined): LosaPsaNotesMeta {
  if (!notes?.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(notes) as Record<string, unknown>;
    return {
      providerSchoolLabel:
        typeof parsed.provider_school_label === "string"
          ? parsed.provider_school_label
          : null,
      deliverySiteLabel:
        typeof parsed.delivery_site_label === "string" ? parsed.delivery_site_label : null,
    };
  } catch {
    return {};
  }
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
