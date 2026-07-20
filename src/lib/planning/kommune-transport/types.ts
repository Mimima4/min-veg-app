export type EnturTripLeg = {
  mode: string;
  expectedStartTime: string;
  expectedEndTime: string;
  /** Metres when journey-planner returns leg.distance (maybe-reach + analytics). */
  distance?: number | null;
};

export type EnturTripPattern = {
  startTime: string;
  endTime: string;
  duration: number;
  legs: EnturTripLeg[];
};

export type ReachabilityMode = "skipped_same_kommune" | "norm_buffer" | "exception_round_trip";

export type InstitutionReachability = {
  institutionId: string;
  schoolMunicipalityCode: string | null;
  mode: ReachabilityMode;
  /** Lower is better for sorting. Unreachable computed ranks higher than unknown. */
  sortRank: number;
  reachable: boolean | null;
  morningArrivalIso: string | null;
  marginMinutes: number | null;
};

export type KommuneTransportSortContext = {
  computed: boolean;
  institutionReachabilityById: Map<string, InstitutionReachability>;
  /** Institutions offering both VG1 and VG2 (same campus chain bonus). */
  vg1Vg2ChainInstitutionIds: Set<string>;
};

export function emptyTransportSortContext(): KommuneTransportSortContext {
  return {
    computed: false,
    institutionReachabilityById: new Map(),
    vg1Vg2ChainInstitutionIds: new Set(),
  };
}
