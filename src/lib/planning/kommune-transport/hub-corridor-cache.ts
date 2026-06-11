import { planEnturTrip, planMorningTripsFromHub } from "./entur-client";
import {
  ENTUR_CORRIDOR_CACHE_MAX_ENTRIES,
  ENTUR_CORRIDOR_CACHE_TTL_MS,
} from "./constants";
import type { EnturTripPattern } from "./types";

export type HubCorridorTrips = {
  morningTripPatterns: EnturTripPattern[] | null;
  eveningReturnTripPatterns: EnturTripPattern[] | null;
};

type CacheEntry = {
  expiresAt: number;
  value: HubCorridorTrips;
};

const corridorCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<HubCorridorTrips>>();

export function buildHubCorridorCacheKey(params: {
  homeHubId: string;
  schoolHubId: string;
  referenceDate: Date;
}): string {
  return `${params.homeHubId}|${params.schoolHubId}|${params.referenceDate.toISOString().slice(0, 10)}`;
}

function trimCorridorCache(): void {
  if (corridorCache.size <= ENTUR_CORRIDOR_CACHE_MAX_ENTRIES) {
    return;
  }

  const entries = [...corridorCache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
  const removeCount = Math.ceil(entries.length / 2);
  for (let index = 0; index < removeCount; index += 1) {
    corridorCache.delete(entries[index]![0]);
  }
}

export async function getHubCorridorTrips(params: {
  homeHubId: string;
  schoolHubId: string;
  referenceDate: Date;
  eveningDepartIso: string;
}): Promise<HubCorridorTrips> {
  const key = buildHubCorridorCacheKey({
    homeHubId: params.homeHubId,
    schoolHubId: params.schoolHubId,
    referenceDate: params.referenceDate,
  });

  const cached = corridorCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending;
  }

  const promise = (async (): Promise<HubCorridorTrips> => {
    const [morningResult, eveningResult] = await Promise.allSettled([
      planMorningTripsFromHub({
        fromStopPlaceId: params.homeHubId,
        toStopPlaceId: params.schoolHubId,
        referenceDate: params.referenceDate,
      }),
      planEnturTrip({
        fromStopPlaceId: params.schoolHubId,
        toStopPlaceId: params.homeHubId,
        arriveBy: false,
        dateTimeIso: params.eveningDepartIso,
      }),
    ]);

    const value: HubCorridorTrips = {
      morningTripPatterns:
        morningResult.status === "fulfilled" ? morningResult.value : null,
      eveningReturnTripPatterns:
        eveningResult.status === "fulfilled" ? eveningResult.value : null,
    };

    trimCorridorCache();
    corridorCache.set(key, {
      expiresAt: Date.now() + ENTUR_CORRIDOR_CACHE_TTL_MS,
      value,
    });
    return value;
  })();

  inFlight.set(key, promise);

  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

/** Test-only: reset module cache between unit tests. */
export function clearHubCorridorCacheForTests(): void {
  corridorCache.clear();
  inFlight.clear();
}
