import "server-only";

import { normalizeMunicipalityCode } from "@/lib/planning/geo-distance";
import {
  ENTUR_CORRIDOR_FETCH_CONCURRENCY,
  KOMMUNE_TRANSPORT_NATIONAL_ACTIVE,
} from "@/lib/planning/kommune-transport/constants";
import { resolveKommuneHubStopPlaceId } from "@/lib/planning/kommune-transport/entur-client";
import { buildInstitutionReachability } from "@/lib/planning/kommune-transport/evaluate-reachability";
import {
  buildHubCorridorCacheKey,
  getHubCorridorTrips,
  type HubCorridorTrips,
} from "@/lib/planning/kommune-transport/hub-corridor-cache";
import {
  formatReferenceDateTimeIso,
  nextMondayUtc,
} from "@/lib/planning/kommune-transport/school-start-time";
import {
  emptyTransportSortContext,
  type InstitutionReachability,
  type KommuneTransportSortContext,
} from "@/lib/planning/kommune-transport/types";
import type { AvailabilityTruthRow } from "@/server/children/routes/get-availability-truth";

const GEONORGE_KOMMUNE_URL = "https://ws.geonorge.no/kommuneinfo/v1/kommuner";

type MunicipalityNameRow = {
  institutionId: string;
  municipalityCode: string;
  municipalityName: string;
  stage: "VG1" | "VG2" | "VG3";
};

async function resolveMunicipalityName(municipalityCode: string): Promise<string | null> {
  try {
    const response = await fetch(`${GEONORGE_KOMMUNE_URL}/${municipalityCode}`, {
      next: { revalidate: 60 * 60 * 24 * 30 },
    });
    if (!response.ok) return null;
    const json = (await response.json()) as {
      kommunenavnNorsk?: string;
      kommunenavn?: string;
    };
    return json.kommunenavnNorsk ?? json.kommunenavn ?? null;
  } catch {
    return null;
  }
}

function collectVg1Vg2ChainInstitutionIds(rows: AvailabilityTruthRow[]): Set<string> {
  const vg1 = new Set(
    rows.filter((row) => row.stage === "VG1").map((row) => row.institutionId)
  );
  const vg2 = new Set(
    rows.filter((row) => row.stage === "VG2").map((row) => row.institutionId)
  );
  const chain = new Set<string>();
  for (const institutionId of vg1) {
    if (vg2.has(institutionId)) {
      chain.add(institutionId);
    }
  }
  return chain;
}

function uniqueVg1Institutions(rows: AvailabilityTruthRow[]): MunicipalityNameRow[] {
  const seen = new Set<string>();
  const result: MunicipalityNameRow[] = [];

  for (const row of rows) {
    if (row.stage !== "VG1") continue;
    const municipalityCode = normalizeMunicipalityCode(row.municipalityCode);
    if (!municipalityCode || !row.institutionId) continue;
    const key = row.institutionId;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      institutionId: row.institutionId,
      municipalityCode,
      municipalityName: row.institutionMunicipality ?? municipalityCode,
      stage: "VG1",
    });
  }

  return result;
}

async function resolveHubForMunicipality(params: {
  municipalityCode: string;
  municipalityName: string;
  hubCache: Map<string, string | null>;
  nameCache: Map<string, string | null>;
}): Promise<string | null> {
  if (params.hubCache.has(params.municipalityCode)) {
    return params.hubCache.get(params.municipalityCode) ?? null;
  }

  let municipalityName = params.nameCache.get(params.municipalityCode) ?? null;
  if (!municipalityName) {
    municipalityName = await resolveMunicipalityName(params.municipalityCode);
    params.nameCache.set(params.municipalityCode, municipalityName);
  }

  const hubId = await resolveKommuneHubStopPlaceId({
    municipalityName: municipalityName ?? params.municipalityName,
  });
  params.hubCache.set(params.municipalityCode, hubId);
  return hubId;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]!);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return results;
}

export async function buildKommuneTransportSortContext(params: {
  rows: AvailabilityTruthRow[];
  homeMunicipalityCodes: string[];
}): Promise<KommuneTransportSortContext> {
  const homeMunicipalityCodes = Array.from(
    new Set(
      params.homeMunicipalityCodes
        .map((code) => normalizeMunicipalityCode(code))
        .filter((code): code is string => Boolean(code))
    )
  );

  if (homeMunicipalityCodes.length === 0 || !KOMMUNE_TRANSPORT_NATIONAL_ACTIVE) {
    return emptyTransportSortContext();
  }

  const vg1Institutions = uniqueVg1Institutions(params.rows);
  if (vg1Institutions.length === 0) {
    return emptyTransportSortContext();
  }

  const referenceDate = nextMondayUtc();
  const eveningDepartIso = formatReferenceDateTimeIso({
    referenceDate,
    hour: 15,
    minute: 0,
  });

  const hubCache = new Map<string, string | null>();
  const nameCache = new Map<string, string | null>();
  const institutionReachabilityById = new Map<string, InstitutionReachability>();

  const primaryHomeCode = homeMunicipalityCodes[0]!;

  await Promise.all(
    homeMunicipalityCodes.map(async (homeCode) => {
      const homeName =
        vg1Institutions.find((row) => row.municipalityCode === homeCode)?.municipalityName ??
        homeCode;
      await resolveHubForMunicipality({
        municipalityCode: homeCode,
        municipalityName: homeName,
        hubCache,
        nameCache,
      });
    })
  );

  const primaryHomeHub = hubCache.get(primaryHomeCode) ?? null;

  const crossMunicipalityInstitutions: MunicipalityNameRow[] = [];
  for (const institution of vg1Institutions) {
    const schoolCode = institution.municipalityCode;
    if (homeMunicipalityCodes.includes(schoolCode)) {
      institutionReachabilityById.set(
        institution.institutionId,
        buildInstitutionReachability({
          institutionId: institution.institutionId,
          schoolMunicipalityCode: schoolCode,
          homeMunicipalityCodes,
          stage: "VG1",
          referenceDate,
          morningTripPatterns: [],
          eveningReturnTripPatterns: [],
        })
      );
      continue;
    }

    if (!primaryHomeHub) {
      institutionReachabilityById.set(
        institution.institutionId,
        buildInstitutionReachability({
          institutionId: institution.institutionId,
          schoolMunicipalityCode: schoolCode,
          homeMunicipalityCodes,
          stage: "VG1",
          referenceDate,
          morningTripPatterns: null,
          eveningReturnTripPatterns: null,
        })
      );
      continue;
    }

    crossMunicipalityInstitutions.push(institution);
  }

  const uniqueSchoolMunicipalityCodes = Array.from(
    new Set(crossMunicipalityInstitutions.map((row) => row.municipalityCode))
  );

  await Promise.all(
    uniqueSchoolMunicipalityCodes.map(async (municipalityCode) => {
      const municipalityName =
        crossMunicipalityInstitutions.find(
          (row) => row.municipalityCode === municipalityCode
        )?.municipalityName ?? municipalityCode;
      await resolveHubForMunicipality({
        municipalityCode,
        municipalityName,
        hubCache,
        nameCache,
      });
    })
  );

  const corridorKeys = new Map<
    string,
    { schoolHubId: string; institutionIds: string[] }
  >();

  for (const institution of crossMunicipalityInstitutions) {
    const schoolHub = hubCache.get(institution.municipalityCode) ?? null;
    if (!schoolHub) {
      institutionReachabilityById.set(
        institution.institutionId,
        buildInstitutionReachability({
          institutionId: institution.institutionId,
          schoolMunicipalityCode: institution.municipalityCode,
          homeMunicipalityCodes,
          stage: "VG1",
          referenceDate,
          morningTripPatterns: null,
          eveningReturnTripPatterns: null,
        })
      );
      continue;
    }

    const corridorKey = buildHubCorridorCacheKey({
      homeHubId: primaryHomeHub!,
      schoolHubId: schoolHub,
      referenceDate,
    });
    const existing = corridorKeys.get(corridorKey);
    if (existing) {
      existing.institutionIds.push(institution.institutionId);
    } else {
      corridorKeys.set(corridorKey, {
        schoolHubId: schoolHub,
        institutionIds: [institution.institutionId],
      });
    }
  }

  if (primaryHomeHub && corridorKeys.size > 0) {
    const homeHubId = primaryHomeHub;
    const corridorTripsByKey = new Map<string, HubCorridorTrips>();

    await mapWithConcurrency(
      [...corridorKeys.entries()],
      ENTUR_CORRIDOR_FETCH_CONCURRENCY,
      async ([corridorKey, corridor]) => {
        const trips = await getHubCorridorTrips({
          homeHubId,
          schoolHubId: corridor.schoolHubId,
          referenceDate,
          eveningDepartIso,
        });
        corridorTripsByKey.set(corridorKey, trips);
      }
    );

    for (const [corridorKey, corridor] of corridorKeys.entries()) {
      const trips = corridorTripsByKey.get(corridorKey) ?? {
        morningTripPatterns: null,
        eveningReturnTripPatterns: null,
      };

      for (const institutionId of corridor.institutionIds) {
        const institution = crossMunicipalityInstitutions.find(
          (row) => row.institutionId === institutionId
        );
        if (!institution) continue;

        institutionReachabilityById.set(
          institutionId,
          buildInstitutionReachability({
            institutionId,
            schoolMunicipalityCode: institution.municipalityCode,
            homeMunicipalityCodes,
            stage: "VG1",
            referenceDate,
            morningTripPatterns: trips.morningTripPatterns,
            eveningReturnTripPatterns: trips.eveningReturnTripPatterns,
          })
        );
      }
    }
  }

  return {
    computed: true,
    institutionReachabilityById,
    vg1Vg2ChainInstitutionIds: collectVg1Vg2ChainInstitutionIds(params.rows),
  };
}
