/**
 * P-8 sparse VG2 alternative eligibility — PSA-derived, not a static profession list.
 * Charter: phase-0-6-contour-b-anleggsteknikk-p8-sparse-vg2-relocation-owner-record.md §P8-7
 *
 * Catalog profession is maskin-og-kranforer; school VG2 remains Anleggsteknikk (BAANL2).
 */

/** Professions at or below this national VG2 PSA count may use P-8 relocation geography. */
export const SPARSE_VG2_NATIONAL_PSA_THRESHOLD = 50;

const SPARSE_VG2_PILOT_PROFESSION_SLUGS = new Set(["maskin-og-kranforer"]);

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

/** Canonical slug for multi-county sparse VG2 school dropdown (school middle stays anleggsteknikk). */
export const MASKIN_OG_KRANFORER_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG =
  "maskin-og-kranforer-vg2-anleggsteknikk-nasjonalt" as const;

/** @deprecated use MASKIN_OG_KRANFORER_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG */
export const ANLEGGSTEKNIKK_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG =
  MASKIN_OG_KRANFORER_SPARSE_VG2_NATIONAL_PROGRAMME_SLUG;

export const MASKIN_OG_KRANFORER_SPARSE_VG2_ALTERNATIVE_VARIANT_ID =
  "maskin-og-kranforer-sparse-vg2-andre-steder" as const;

/** @deprecated use MASKIN_OG_KRANFORER_SPARSE_VG2_ALTERNATIVE_VARIANT_ID */
export const ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_VARIANT_ID =
  MASKIN_OG_KRANFORER_SPARSE_VG2_ALTERNATIVE_VARIANT_ID;

/** School VG2 label — Anleggsteknikk remains the programme name at school. */
export const MASKIN_OG_KRANFORER_SPARSE_VG2_ALTERNATIVE_LABEL_NB =
  "Anleggsteknikk — VG2 andre steder" as const;

/** @deprecated use MASKIN_OG_KRANFORER_SPARSE_VG2_ALTERNATIVE_LABEL_NB */
export const ANLEGGSTEKNIKK_SPARSE_VG2_ALTERNATIVE_LABEL_NB =
  MASKIN_OG_KRANFORER_SPARSE_VG2_ALTERNATIVE_LABEL_NB;
