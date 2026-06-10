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
    categories?: string[];
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

function pickBestStopFeature(features: GeocoderFeature[]): GeocoderFeature | null {
  const stopPlaces = features.filter((feature) => isStopPlaceId(feature.properties?.id));
  if (stopPlaces.length === 0) return null;

  const railway = stopPlaces.find((feature) =>
    (feature.properties?.categories ?? []).some((category) =>
      /rail|train|railway/i.test(category)
    )
  );
  if (railway) return railway;

  const stationName = stopPlaces.find((feature) =>
    /stasjon/i.test(feature.properties?.name ?? "")
  );
  if (stationName) return stationName;

  return stopPlaces[0] ?? null;
}

export async function resolveKommuneHubStopPlaceId(params: {
  municipalityName: string;
}): Promise<string | null> {
  const queries = [
    `${params.municipalityName} stasjon`,
    `${params.municipalityName} rutebileterminal`,
    params.municipalityName,
  ];

  for (const text of queries) {
    const url = new URL(ENTUR_GEOCODER_AUTOCOMPLETE_URL);
    url.searchParams.set("text", text);
    url.searchParams.set("size", "8");
    url.searchParams.set("lang", "no");

    try {
      const json = await enturFetchJson<GeocoderResponse>(url.toString());
      const best = pickBestStopFeature(json.features ?? []);
      if (best?.properties?.id && isStopPlaceId(best.properties.id)) {
        return best.properties.id;
      }
    } catch {
      continue;
    }
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
