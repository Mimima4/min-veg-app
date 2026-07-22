/** Nationwide VGS transport sort (Entur). Vestland pilot validated 2026-06-10. */
export const KOMMUNE_TRANSPORT_NATIONAL_ACTIVE = true;

/** Bump when transport sort logic changes (invalidates route_input_signature). */
export const KOMMUNE_TRANSPORT_LOGIC_VERSION = "v8-maybe-pt-vg2-monthly-hubs";

/**
 * Relocation `maybe` — Entur public-transport network km soft band
 * (`phase-4-relocation-maybe-public-transport-reach-owner-draft.md`).
 * Normal admit ≤ soft; soft admit (soft, soft]…hard]; deny > hard.
 * Widened 2026-07-22: VG2 adults may travel home monthly / bi-monthly.
 */
export const MAYBE_PT_SOFT_MAX_KM = 700;
export const MAYBE_PT_HARD_MAX_KM = 800;

/**
 * One-way Entur duration caps when admitting via air.
 * Home eligibility = Troms 55 + Finnmark 56 + Nordland 18
 * (`MAYBE_AIR_HOME_FYLKE_CODES` in evaluate-maybe-reach).
 * Widened 2026-07-22 for monthly/bi-monthly VG2 home visits (was 5h / 8h).
 */
export const MAYBE_AIR_SOFT_MAX_DURATION_SEC = 8 * 60 * 60; // 8h
export const MAYBE_AIR_HARD_MAX_DURATION_SEC = 12 * 60 * 60; // 12h

/** Bump to invalidate durable maybe-reach cache rows. */
export const MAYBE_PT_REACH_POLICY_VERSION = "v6-entur-pt-700-800-air-8-12-hubs";

export const KOMMUNE_TRANSPORT_ARRIVAL_BUFFER_MINUTES = 5;

export const ENTUR_JOURNEY_PLANNER_URL =
  "https://api.entur.io/journey-planner/v3/graphql";

export const ENTUR_GEOCODER_AUTOCOMPLETE_URL =
  "https://api.entur.io/geocoder/v1/autocomplete";

export const ENTUR_CLIENT_NAME =
  process.env.ENTUR_CLIENT_NAME?.trim() || "min-veg-minvegapp";

/** Hub→hub Entur corridor cache (sort-only; keyed by reference Monday date). */
export const ENTUR_CORRIDOR_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export const ENTUR_CORRIDOR_CACHE_MAX_ENTRIES = 500;

/** Max parallel hub→hub Entur fetches per route recompute. */
export const ENTUR_CORRIDOR_FETCH_CONCURRENCY = 8;

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
