/** Nationwide VGS transport sort (Entur). Vestland pilot validated 2026-06-10. */
export const KOMMUNE_TRANSPORT_NATIONAL_ACTIVE = true;

/** Bump when transport sort logic changes (invalidates route_input_signature). */
export const KOMMUNE_TRANSPORT_LOGIC_VERSION = "v4-national-rollout";

export const KOMMUNE_TRANSPORT_ARRIVAL_BUFFER_MINUTES = 5;

export const ENTUR_JOURNEY_PLANNER_URL =
  "https://api.entur.io/journey-planner/v3/graphql";

export const ENTUR_GEOCODER_AUTOCOMPLETE_URL =
  "https://api.entur.io/geocoder/v1/autocomplete";

export const ENTUR_CLIENT_NAME =
  process.env.ENTUR_CLIENT_NAME?.trim() || "min-veg-minvegapp";

/** Tier C school-day start times (sort-only fallback; not shown as fact in UI). */
export const DEFAULT_SCHOOL_START_TIME_BY_STAGE: Record<
  "VG1" | "VG2" | "VG3",
  { hour: number; minute: number }
> = {
  VG1: { hour: 8, minute: 15 },
  VG2: { hour: 8, minute: 0 },
  VG3: { hour: 8, minute: 0 },
};

/** Morning window for dynamic sparse-route detection. */
export const SPARSE_ROUTE_MAX_MORNING_DEPARTURES = 2;

export const MORNING_DEPARTURE_WINDOW = {
  fromHour: 6,
  toHour: 9,
} as const;

/** Evening return window for exception-mode round-trip check. */
export const EVENING_RETURN_WINDOW = {
  fromHour: 14,
  toHour: 22,
} as const;
