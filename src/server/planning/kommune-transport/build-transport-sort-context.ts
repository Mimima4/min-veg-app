import "server-only";

import { normalizeMunicipalityCode } from "@/lib/planning/geo-distance";
import { normalizeFylkeCodesFromMunicipalityCodes } from "@/lib/planning/norway-geo-code-normalization";
import { KOMMUNE_TRANSPORT_PILOT_FYLKE_CODES } from "@/lib/planning/kommune-transport/constants";
import {
  countMorningDeparturesFromStop,
  planEnturTrip,
  planMorningTripsFromHub,
  resolveKommuneHubStopPlaceId,
} from "@/lib/planning/kommune-transport/entur-client";
import { buildInstitutionReachability } from "@/lib/planning/kommune-transport/evaluate-reachability";
import {
  formatReferenceDateTimeIso,
  nextMondayUtc,
  resolveSchoolStartTimeIso,
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

function isPilotActiveForHomeMunicipalities(homeMunicipalityCodes: string[]): boolean {
  const homeFylkeCodes = normalizeFylkeCodesFromMunicipalityCodes(homeMunicipalityCodes);
  return homeFylkeCodes.some((code) =>
    KOMMUNE_TRANSPORT_PILOT_FYLKE_CODES.includes(
      code as (typeof KOMMUNE_TRANSPORT_PILOT_FYLKE_CODES)[number]
    )
  );
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

  if (homeMunicipalityCodes.length === 0) {
    return emptyTransportSortContext();
  }

  if (!isPilotActiveForHomeMunicipalities(homeMunicipalityCodes)) {
    return emptyTransportSortContext();
  }

  const vg1Institutions = uniqueVg1Institutions(params.rows);
  if (vg1Institutions.length === 0) {
    return emptyTransportSortContext();
  }

  const referenceDate = nextMondayUtc();
  const schoolStartIso = resolveSchoolStartTimeIso({
    stage: "VG1",
    referenceDate,
  });
  const eveningDepartIso = formatReferenceDateTimeIso({
    referenceDate,
    hour: 15,
    minute: 0,
  });

  const hubCache = new Map<string, string | null>();
  const nameCache = new Map<string, string | null>();
  const institutionReachabilityById = new Map<string, InstitutionReachability>();

  const homeHubIds = new Map<string, string | null>();
  for (const homeCode of homeMunicipalityCodes) {
    const homeName =
      vg1Institutions.find((row) => row.municipalityCode === homeCode)?.municipalityName ??
      homeCode;
    homeHubIds.set(
      homeCode,
      await resolveHubForMunicipality({
        municipalityCode: homeCode,
        municipalityName: homeName,
        hubCache,
        nameCache,
      })
    );
  }

  const primaryHomeCode = homeMunicipalityCodes[0]!;
  const primaryHomeHub = homeHubIds.get(primaryHomeCode) ?? null;

  let morningDeparturesFromHomeHub: number | null = null;
  if (primaryHomeHub) {
    try {
      morningDeparturesFromHomeHub = await countMorningDeparturesFromStop({
        stopPlaceId: primaryHomeHub,
        referenceDateIso: schoolStartIso,
      });
    } catch {
      morningDeparturesFromHomeHub = null;
    }
  }

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
          morningDeparturesFromHomeHub,
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
          morningDeparturesFromHomeHub,
          morningTripPatterns: null,
          eveningReturnTripPatterns: null,
        })
      );
      continue;
    }

    const schoolHub = await resolveHubForMunicipality({
      municipalityCode: schoolCode,
      municipalityName: institution.municipalityName,
      hubCache,
      nameCache,
    });

    if (!schoolHub) {
      institutionReachabilityById.set(
        institution.institutionId,
        buildInstitutionReachability({
          institutionId: institution.institutionId,
          schoolMunicipalityCode: schoolCode,
          homeMunicipalityCodes,
          stage: "VG1",
          referenceDate,
          morningDeparturesFromHomeHub,
          morningTripPatterns: null,
          eveningReturnTripPatterns: null,
        })
      );
      continue;
    }

    let morningTripPatterns = null;
    let eveningReturnTripPatterns = null;
    try {
      morningTripPatterns = await planMorningTripsFromHub({
        fromStopPlaceId: primaryHomeHub,
        toStopPlaceId: schoolHub,
        referenceDate,
      });
      eveningReturnTripPatterns = await planEnturTrip({
        fromStopPlaceId: schoolHub,
        toStopPlaceId: primaryHomeHub,
        arriveBy: false,
        dateTimeIso: eveningDepartIso,
      });
    } catch {
      morningTripPatterns = null;
      eveningReturnTripPatterns = null;
    }

    institutionReachabilityById.set(
      institution.institutionId,
      buildInstitutionReachability({
        institutionId: institution.institutionId,
        schoolMunicipalityCode: schoolCode,
        homeMunicipalityCodes,
        stage: "VG1",
        referenceDate,
        morningDeparturesFromHomeHub,
        morningTripPatterns,
        eveningReturnTripPatterns,
      })
    );
  }

  return {
    computed: true,
    institutionReachabilityById,
    vg1Vg2ChainInstitutionIds: collectVg1Vg2ChainInstitutionIds(params.rows),
  };
}
