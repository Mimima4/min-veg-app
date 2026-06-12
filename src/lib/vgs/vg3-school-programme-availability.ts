import { isLosaAvailabilityScope } from "@/lib/losa/availability-scope";
import type { AvailabilityTruthRow } from "@/server/children/routes/get-availability-truth";

/** Truth-backed VG3 school programmes only — not kolonne-3 bedrift branching on Vilbli. */
export function hasVg3SchoolProgrammeAvailability(
  rows: AvailabilityTruthRow[]
): boolean {
  return rows.some(
    (row) => row.stage === "VG3" && !isLosaAvailabilityScope(row.availabilityScope)
  );
}
