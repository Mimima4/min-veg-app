import "server-only";

import type { RelocationWillingness } from "@/lib/planning/school-geography-scope";
import type { AvailabilityTruthRow } from "./get-availability-truth";

/**
 * P-8 primary enrich — retired for nabofylke injection (owner 2026-07-22).
 *
 * Primary stays home-fylke PSA only (G-2 / G-3). Nordland seats for Troms/Finnmark
 * homes belong in P-7 / P-8 alternative cards, not the prime picker.
 *
 * Kept as a named no-op so create/recompute call sites stay stable.
 */
export async function enrichAnleggsteknikkNorthZonePrimaryTruthRows(params: {
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  relocationWillingness: RelocationWillingness;
  homeTruthRows: AvailabilityTruthRow[];
  locale?: string;
}): Promise<AvailabilityTruthRow[]> {
  void params.professionSlug;
  void params.preferredMunicipalityCodes;
  void params.relocationWillingness;
  void params.locale;
  return params.homeTruthRows;
}
