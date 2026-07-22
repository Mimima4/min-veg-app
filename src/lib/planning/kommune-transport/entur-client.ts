import {
  ENTUR_CLIENT_NAME,
  ENTUR_GEOCODER_AUTOCOMPLETE_URL,
  ENTUR_JOURNEY_PLANNER_URL,
  MORNING_DEPARTURE_WINDOW,
} from "./constants";
import { formatReferenceDateTimeIso } from "./school-start-time";
import type { EnturTripPattern } from "./types";

type GeocoderFeature = {
  properties?: {
    id?: string;
    name?: string;
    label?: string;
    county?: string;
    category?: string[];
    categories?: string[];
  };
  geometry?: {
    coordinates?: number[];
  };
};

type GeocoderResponse = {
  features?: GeocoderFeature[];
};

type JourneyPlannerResponse = {
  data?: {
    trip?: {
      tripPatterns?: EnturTripPattern[];
    };
    stopPlace?: {
      estimatedCalls?: Array<{
        expectedDepartureTime?: string;
      }>;
    };
  };
  errors?: Array<{ message?: string }>;
};

async function enturFetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "ET-Client-Name": ENTUR_CLIENT_NAME,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Entur request failed (${response.status}): ${url}`);
  }

  return (await response.json()) as T;
}

function isStopPlaceId(id: string | undefined): id is string {
  return typeof id === "string" && id.startsWith("NSR:StopPlace:");
}

function isGroupOfStopPlacesId(id: string | undefined): id is string {
  return typeof id === "string" && id.startsWith("NSR:GroupOfStopPlaces:");
}

function isUsableHubId(id: string | undefined): id is string {
  return isStopPlaceId(id) || isGroupOfStopPlacesId(id);
}

function haversineKmBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Max distance from kommune centroid to accept a geocoder hit (blocks Os→Innlandet, Kirkenes→Kirkenær). */
const MAX_HUB_DISTANCE_FROM_CENTROID_KM = 45;

function pickBestStopFeature(
  features: GeocoderFeature[],
  focus?: { lat: number; lng: number } | null
): GeocoderFeature | null {
  const hubs = features.filter((feature) => isUsableHubId(feature.properties?.id));
  if (hubs.length === 0) return null;

  const withDistance = hubs.map((feature) => {
    const coords = feature.geometry?.coordinates;
    const lng = Array.isArray(coords) ? Number(coords[0]) : NaN;
    const lat = Array.isArray(coords) ? Number(coords[1]) : NaN;
    const distanceKm =
      focus && Number.isFinite(lat) && Number.isFinite(lng)
        ? haversineKmBetween(focus, { lat, lng })
        : Number.POSITIVE_INFINITY;
    return { feature, distanceKm, lat, lng };
  });

  const nearFocus = focus
    ? withDistance.filter((item) => item.distanceKm <= MAX_HUB_DISTANCE_FROM_CENTROID_KM)
    : withDistance;
  const pool = nearFocus.length > 0 ? nearFocus : [];
  if (pool.length === 0) return null;

  pool.sort((a, b) => a.distanceKm - b.distanceKm);

  const categoryOf = (item: (typeof pool)[number]) => {
    const props = item.feature.properties;
    const cats = [...(props?.categories ?? []), ...(props?.category ?? [])];
    return cats.join(" ").toLowerCase();
  };
  const nameOf = (item: (typeof pool)[number]) =>
    (item.feature.properties?.name ?? "").toLowerCase();

  // Prefer real transport hubs — airport / rail / ferry — over random onstreetBus.
  // Last-mile to lodging may be private car (owner 2026-07-22).
  const airport = pool.find(
    (item) =>
      /airport|lufthavn/.test(categoryOf(item)) || /lufthavn/.test(nameOf(item))
  );
  if (airport) return airport.feature;

  const railway = pool.find(
    (item) =>
      /rail|train|railway/.test(categoryOf(item)) || /stasjon/.test(nameOf(item))
  );
  if (railway) return railway.feature;

  const ferry = pool.find(
    (item) =>
      /ferry|harbour|water|boat/.test(categoryOf(item)) ||
      /ferjekai|hurtigbåt|kai/.test(nameOf(item))
  );
  if (ferry) return ferry.feature;

  const terminal = pool.find((item) =>
    /terminal|rutebil/.test(nameOf(item))
  );
  if (terminal) return terminal.feature;

  const stopPlace = pool.find((item) => isStopPlaceId(item.feature.properties?.id));
  if (stopPlace) return stopPlace.feature;

  return pool[0]?.feature ?? null;
}

async function resolveHubViaReverse(focus: { lat: number; lng: number }): Promise<string | null> {
  const url = new URL("https://api.entur.io/geocoder/v1/reverse");
  url.searchParams.set("point.lat", String(focus.lat));
  url.searchParams.set("point.lon", String(focus.lng));
  url.searchParams.set("size", "15");
  url.searchParams.set("layers", "venue");
  url.searchParams.set("boundary.circle.radius", "25");

  try {
    const json = await enturFetchJson<GeocoderResponse>(url.toString());
    const scored = (json.features ?? [])
      .filter((feature) => isStopPlaceId(feature.properties?.id))
      .map((feature) => {
        const coords = feature.geometry?.coordinates;
        const lng = Array.isArray(coords) ? Number(coords[0]) : NaN;
        const lat = Array.isArray(coords) ? Number(coords[1]) : NaN;
        const distanceKm =
          Number.isFinite(lat) && Number.isFinite(lng)
            ? haversineKmBetween(focus, { lat, lng })
            : Number.POSITIVE_INFINITY;
        const name = feature.properties?.name ?? "";
        let score = distanceKm;
        if (/lufthavn|airport/i.test(name)) score -= 12;
        if (/stasjon/i.test(name)) score -= 8;
        if (/ferjekai|hurtigbåt|kai|terminal|sentrum/i.test(name)) score -= 5;
        if (/skole|barneskole|ungdomsskole/i.test(name)) score += 8;
        return { id: feature.properties?.id, score, distanceKm, name };
      })
      .filter((item) => item.distanceKm <= MAX_HUB_DISTANCE_FROM_CENTROID_KM)
      .sort((a, b) => a.score - b.score);
    return scored[0]?.id && isStopPlaceId(scored[0].id) ? scored[0].id : null;
  } catch {
    return null;
  }
}

export async function resolveKommuneHubStopPlaceId(params: {
  municipalityName: string;
  /** Kommune centroid — required for disambiguation (Os vs Os Innlandet, Kirkenes vs Kirkenær). */
  focusLat?: number | null;
  focusLng?: number | null;
}): Promise<string | null> {
  const focus =
    typeof params.focusLat === "number" &&
    typeof params.focusLng === "number" &&
    Number.isFinite(params.focusLat) &&
    Number.isFinite(params.focusLng)
      ? { lat: params.focusLat, lng: params.focusLng }
      : null;

  const queries = [
    params.municipalityName,
    `${params.municipalityName} lufthavn`,
    `${params.municipalityName} stasjon`,
    `${params.municipalityName} ferjekai`,
    `${params.municipalityName} hurtigbåtkai`,
    `${params.municipalityName} rutebileterminal`,
    `${params.municipalityName} bussterminal`,
  ];

  for (const text of queries) {
    const url = new URL(ENTUR_GEOCODER_AUTOCOMPLETE_URL);
    url.searchParams.set("text", text);
    url.searchParams.set("size", "10");
    url.searchParams.set("lang", "no");
    if (focus) {
      url.searchParams.set("focus.point.lat", String(focus.lat));
      url.searchParams.set("focus.point.lon", String(focus.lng));
    }

    try {
      const json = await enturFetchJson<GeocoderResponse>(url.toString());
      const best = pickBestStopFeature(json.features ?? [], focus);
      if (best?.properties?.id && isUsableHubId(best.properties.id)) {
        return best.properties.id;
      }
    } catch {
      continue;
    }
  }

  if (focus) {
    return resolveHubViaReverse(focus);
  }

  return null;
}

export async function planEnturTrip(params: {
  fromStopPlaceId: string;
  toStopPlaceId: string;
  arriveBy: boolean;
  dateTimeIso: string;
  numTripPatterns?: number;
}): Promise<EnturTripPattern[]> {
  const query = `query Trip($from: String!, $to: String!, $dateTime: DateTime!, $arriveBy: Boolean!, $num: Int!) {
    trip(
      from: { place: $from }
      to: { place: $to }
      dateTime: $dateTime
      arriveBy: $arriveBy
      numTripPatterns: $num
    ) {
      tripPatterns {
        startTime
        endTime
        duration
        legs {
          mode
          distance
          expectedStartTime
          expectedEndTime
        }
      }
    }
  }`;

  const json = await enturFetchJson<JourneyPlannerResponse>(ENTUR_JOURNEY_PLANNER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: {
        from: params.fromStopPlaceId,
        to: params.toStopPlaceId,
        dateTime: params.dateTimeIso,
        arriveBy: params.arriveBy,
        num: params.numTripPatterns ?? 3,
      },
    }),
  });

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).filter(Boolean).join("; "));
  }

  return json.data?.trip?.tripPatterns ?? [];
}

/**
 * Morning hub→hub trips: departAt from 06:00 (stable with Entur OTP).
 * arriveBy at exact school-start often returns zero patterns for valid corridors.
 */
export async function planMorningTripsFromHub(params: {
  fromStopPlaceId: string;
  toStopPlaceId: string;
  referenceDate: Date;
  timeZoneOffset?: string;
}): Promise<EnturTripPattern[]> {
  const departAtIso = formatReferenceDateTimeIso({
    referenceDate: params.referenceDate,
    hour: 6,
    minute: 0,
    timeZoneOffset: params.timeZoneOffset,
  });

  const departPatterns = await planEnturTrip({
    fromStopPlaceId: params.fromStopPlaceId,
    toStopPlaceId: params.toStopPlaceId,
    arriveBy: false,
    dateTimeIso: departAtIso,
    numTripPatterns: 8,
  });

  if (departPatterns.length > 0) {
    return departPatterns;
  }

  const arriveByIso = formatReferenceDateTimeIso({
    referenceDate: params.referenceDate,
    hour: 9,
    minute: 0,
    timeZoneOffset: params.timeZoneOffset,
  });

  return planEnturTrip({
    fromStopPlaceId: params.fromStopPlaceId,
    toStopPlaceId: params.toStopPlaceId,
    arriveBy: true,
    dateTimeIso: arriveByIso,
    numTripPatterns: 5,
  });
}

export async function countMorningDeparturesFromStop(params: {
  stopPlaceId: string;
  referenceDateIso: string;
}): Promise<number> {
  const query = `query Departures($id: String!) {
    stopPlace(id: $id) {
      estimatedCalls(numberOfDepartures: 30) {
        expectedDepartureTime
      }
    }
  }`;

  const json = await enturFetchJson<JourneyPlannerResponse>(ENTUR_JOURNEY_PLANNER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { id: params.stopPlaceId },
    }),
  });

  const referenceDay = params.referenceDateIso.slice(0, 10);
  const calls = json.data?.stopPlace?.estimatedCalls ?? [];
  let count = 0;

  for (const call of calls) {
    const departure = call.expectedDepartureTime;
    if (!departure || !departure.startsWith(referenceDay)) continue;
    const hour = Number.parseInt(departure.slice(11, 13), 10);
    if (
      hour >= MORNING_DEPARTURE_WINDOW.fromHour &&
      hour < MORNING_DEPARTURE_WINDOW.toHour
    ) {
      count += 1;
    }
  }

  return count;
}
