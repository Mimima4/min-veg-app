/**
 * R-VG3-CATALOG: classify VG3 catalog vs PSA truth per (profession, county).
 * Keep audit + cleanup aligned — UI truth is PSA programme_in_school only.
 */
import { expectsVg3SchoolProgrammeInContour } from "../vgs-path-definitions.mjs";

/** @typedef {'live' | 'no_vg3_catalog' | 'catalog_orphan' | 'actionable_gap'} Vg3CatalogStatus */

/**
 * @param {object} params
 * @param {string} params.professionSlug
 * @param {string} params.countyCode
 * @param {number} params.catalogVg3Count
 * @param {number} params.psaVg3Count
 * @returns {Vg3CatalogStatus}
 */
export function classifyVg3CatalogPsaStatus(params) {
  const catalogVg3Count = Number(params.catalogVg3Count ?? 0);
  const psaVg3Count = Number(params.psaVg3Count ?? 0);

  if (psaVg3Count > 0) {
    return "live";
  }
  if (catalogVg3Count === 0) {
    return "no_vg3_catalog";
  }

  const professionSlug = String(params.professionSlug ?? "").trim();

  return expectsVg3SchoolProgrammeInContour(professionSlug)
    ? "actionable_gap"
    : "catalog_orphan";
}

export function isStrictAuditFailureStatus(status) {
  return status === "actionable_gap";
}

export function statusLabel(status) {
  switch (status) {
    case "live":
      return "live";
    case "no_vg3_catalog":
      return "no VG3 catalog";
    case "catalog_orphan":
      return "catalog orphan (non-truth; cleanup)";
    case "actionable_gap":
      return "actionable gap (ingest required)";
    default:
      return status;
  }
}
