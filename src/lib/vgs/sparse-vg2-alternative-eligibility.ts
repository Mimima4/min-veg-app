/**
 * P-8 sparse VG2 alternative eligibility — PSA-derived, not a static profession list.
 * Charter: phase-0-6-contour-b-anleggsteknikk-p8-sparse-vg2-relocation-owner-record.md §P8-7
 */

/** Professions at or below this national VG2 PSA count may use P-8 relocation geography. */
export const SPARSE_VG2_NATIONAL_PSA_THRESHOLD = 50;

const SPARSE_VG2_PILOT_PROFESSION_SLUGS = new Set(["anleggsteknikk"]);

export function isSparseVg2PilotProfession(professionSlug: string | null | undefined): boolean {
  return SPARSE_VG2_PILOT_PROFESSION_SLUGS.has(String(professionSlug ?? "").trim());
}

export function isSparseVg2NationalPsaCountEligible(nationalVg2PsaCount: number): boolean {
  return (
    Number.isFinite(nationalVg2PsaCount) &&
    nationalVg2PsaCount > 0 &&
    nationalVg2PsaCount <= SPARSE_VG2_NATIONAL_PSA_THRESHOLD
  );
}

export function assessSparseVg2AlternativeEligibility(params: {
  professionSlug: string | null | undefined;
  nationalVg2PsaCount: number;
}): boolean {
  if (!isSparseVg2PilotProfession(params.professionSlug)) {
    return false;
  }
  return isSparseVg2NationalPsaCountEligible(params.nationalVg2PsaCount);
}

/** Canonical slug for multi-county sparse VG2 school dropdown. */
export const ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG =
  "anleggsteknikk-vg2-anleggsteknikk-nasjonalt" as const;

export const ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_ID =
  "anleggsteknikk-sparse-vg2-andre-steder" as const;

export const ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_LABEL_NB =
  "Anleggsteknikk — VG2 andre steder" as const;
