import { isAltaDeliverySite } from "./losa-finnmark-evidence-index.mjs";

/**
 * Repo-safe publication decision index (owner charter refs — not secrets).
 * Nationwide pattern: one row per delivery scope at ops time.
 */
export const LOSA_FINNMARK_PUBLICATION_DECISION_INDEX = [
  {
    deliverySiteLabel: "Alta",
    scope: "delivery_site_alta",
    countyCode: "56",
    gate: "P4-LOSA-ALTA-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-ALTA-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-ALTA-2026-05-29-01",
    maxRows: 1,
  },
];

export function hasPublicationDecisionForManifestRow(manifestRow) {
  const delivery = manifestRow.entity?.deliverySiteLabel ?? null;

  return LOSA_FINNMARK_PUBLICATION_DECISION_INDEX.some((entry) => {
    if (entry.scope === "delivery_site_alta") {
      return isAltaDeliverySite(delivery);
    }
    return false;
  });
}
