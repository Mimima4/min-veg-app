import { normalizeMunicipalityCode } from "@/lib/planning/geo-distance";
import {
  KOMMUNE_TRANSPORT_ARRIVAL_BUFFER_MINUTES,
  SPARSE_ROUTE_MAX_MORNING_DEPARTURES,
} from "./constants";
import type { EnturTripPattern } from "./types";
import { isTransportExceptionCorridor } from "./exception-kommuner";
import { parseIsoToMinutes, resolveSchoolStartTimeIso } from "./school-start-time";
import type { InstitutionReachability, ReachabilityMode } from "./types";

const RANK_NORM_REACHABLE = 0;
const RANK_EXCEPTION_REACHABLE = 200;
const RANK_UNKNOWN = 400;
const RANK_NOT_REACHABLE = 800;

function bestOnTimeMorningArrival(params: {
  tripPatterns: EnturTripPattern[];
  schoolStartIso: string;
  bufferMinutes: number;
}): string | null {
  const deadlineMs =
    Date.parse(params.schoolStartIso) - params.bufferMinutes * 60_000;
  if (Number.isNaN(deadlineMs)) return null;

  let bestArrival: string | null = null;
  let bestArrivalMs = Number.NEGATIVE_INFINITY;

  for (const pattern of params.tripPatterns) {
    const arrivalMs = Date.parse(pattern.endTime);
    if (Number.isNaN(arrivalMs)) continue;
    if (arrivalMs > deadlineMs) continue;
    if (arrivalMs > bestArrivalMs) {
      bestArrivalMs = arrivalMs;
      bestArrival = pattern.endTime;
    }
  }

  return bestArrival;
}

function isNormModeReachable(params: {
  arrivalIso: string;
  schoolStartIso: string;
  bufferMinutes: number;
}): { reachable: boolean; marginMinutes: number } {
  const arrivalMs = Date.parse(params.arrivalIso);
  const startMs = Date.parse(params.schoolStartIso);
  if (Number.isNaN(arrivalMs) || Number.isNaN(startMs)) {
    return { reachable: false, marginMinutes: Number.NEGATIVE_INFINITY };
  }
  const marginMinutes = Math.floor((startMs - arrivalMs) / 60_000);
  return {
    reachable: marginMinutes >= params.bufferMinutes,
    marginMinutes,
  };
}

function hasEveningReturnTrip(params: {
  outbound: EnturTripPattern[];
  inbound: EnturTripPattern[];
}): boolean {
  if (params.outbound.length === 0 || params.inbound.length === 0) {
    return false;
  }

  const latestOutboundDepart = params.outbound.reduce((latest, pattern) => {
    if (!latest) return pattern.startTime;
    return pattern.startTime > latest ? pattern.startTime : latest;
  }, params.outbound[0]?.startTime ?? null);

  if (!latestOutboundDepart) return false;

  const outboundDepartMinutes = parseIsoToMinutes(latestOutboundDepart);
  if (outboundDepartMinutes === null) return false;

  return params.inbound.some((pattern) => {
    const departMinutes = parseIsoToMinutes(pattern.startTime);
    return departMinutes !== null && departMinutes >= 14 * 60;
  });
}

export function buildInstitutionReachability(params: {
  institutionId: string;
  schoolMunicipalityCode: string | null | undefined;
  homeMunicipalityCodes: string[];
  stage: "VG1" | "VG2" | "VG3";
  referenceDate: Date;
  morningTripPatterns: EnturTripPattern[] | null;
  eveningReturnTripPatterns: EnturTripPattern[] | null;
}): InstitutionReachability {
  const schoolCode = normalizeMunicipalityCode(params.schoolMunicipalityCode);
  const homeCodes = params.homeMunicipalityCodes
    .map((code) => normalizeMunicipalityCode(code))
    .filter((code): code is string => Boolean(code));

  if (schoolCode && homeCodes.some((code) => code === schoolCode)) {
    return {
      institutionId: params.institutionId,
      schoolMunicipalityCode: schoolCode,
      mode: "skipped_same_kommune",
      sortRank: RANK_NORM_REACHABLE,
      reachable: null,
      morningArrivalIso: null,
      marginMinutes: null,
    };
  }

  if (params.morningTripPatterns === null) {
    return {
      institutionId: params.institutionId,
      schoolMunicipalityCode: schoolCode,
      mode: "norm_buffer",
      sortRank: RANK_UNKNOWN,
      reachable: null,
      morningArrivalIso: null,
      marginMinutes: null,
    };
  }

  const schoolStartIso = resolveSchoolStartTimeIso({
    stage: params.stage,
    referenceDate: params.referenceDate,
  });
  const onTimeArrivalIso = bestOnTimeMorningArrival({
    tripPatterns: params.morningTripPatterns,
    schoolStartIso,
    bufferMinutes: KOMMUNE_TRANSPORT_ARRIVAL_BUFFER_MINUTES,
  });

  if (onTimeArrivalIso) {
    const norm = isNormModeReachable({
      arrivalIso: onTimeArrivalIso,
      schoolStartIso,
      bufferMinutes: KOMMUNE_TRANSPORT_ARRIVAL_BUFFER_MINUTES,
    });

    if (norm.reachable) {
      return {
        institutionId: params.institutionId,
        schoolMunicipalityCode: schoolCode,
        mode: "norm_buffer",
        sortRank: RANK_NORM_REACHABLE,
        reachable: true,
        morningArrivalIso: onTimeArrivalIso,
        marginMinutes: norm.marginMinutes,
      };
    }
  }

  const staticException = isTransportExceptionCorridor({
    homeMunicipalityCodes: homeCodes,
    schoolMunicipalityCode: schoolCode,
  });
  const dynamicSparseCorridor =
    params.morningTripPatterns.length > 0 &&
    params.morningTripPatterns.length <= SPARSE_ROUTE_MAX_MORNING_DEPARTURES;

  if (staticException || dynamicSparseCorridor) {
    const reachable = hasEveningReturnTrip({
      outbound: params.morningTripPatterns,
      inbound: params.eveningReturnTripPatterns ?? [],
    });
    const arrivalIso =
      params.morningTripPatterns.length > 0
        ? params.morningTripPatterns.reduce((best, pattern) => {
            if (!best) return pattern.endTime;
            return pattern.endTime < best ? pattern.endTime : best;
          }, params.morningTripPatterns[0]?.endTime ?? null)
        : null;
    return {
      institutionId: params.institutionId,
      schoolMunicipalityCode: schoolCode,
      mode: "exception_round_trip",
      sortRank: reachable ? RANK_EXCEPTION_REACHABLE : RANK_NOT_REACHABLE,
      reachable,
      morningArrivalIso: arrivalIso,
      marginMinutes: null,
    };
  }

  return {
    institutionId: params.institutionId,
    schoolMunicipalityCode: schoolCode,
    mode: "norm_buffer",
    sortRank: RANK_NOT_REACHABLE,
    reachable: false,
    morningArrivalIso: null,
    marginMinutes: null,
  };
}

export function compareInstitutionTransportRank(
  aInstitutionId: string | null | undefined,
  bInstitutionId: string | null | undefined,
  context: {
    computed: boolean;
    institutionReachabilityById: Map<string, InstitutionReachability>;
    vg1Vg2ChainInstitutionIds: Set<string>;
  }
): number {
  if (!context.computed) return 0;

  const aId = aInstitutionId ?? "";
  const bId = bInstitutionId ?? "";

  const aReach = aId ? context.institutionReachabilityById.get(aId) : undefined;
  const bReach = bId ? context.institutionReachabilityById.get(bId) : undefined;
  const aRank = aReach?.sortRank ?? RANK_UNKNOWN;
  const bRank = bReach?.sortRank ?? RANK_UNKNOWN;
  if (aRank !== bRank) return aRank - bRank;

  const aMargin = aReach?.marginMinutes;
  const bMargin = bReach?.marginMinutes;
  if (
    aMargin !== null &&
    aMargin !== undefined &&
    bMargin !== null &&
    bMargin !== undefined &&
    aMargin !== bMargin
  ) {
    return bMargin - aMargin;
  }

  const aChain = aId ? context.vg1Vg2ChainInstitutionIds.has(aId) : false;
  const bChain = bId ? context.vg1Vg2ChainInstitutionIds.has(bId) : false;
  if (aChain !== bChain) {
    return aChain ? -1 : 1;
  }

  return 0;
}
