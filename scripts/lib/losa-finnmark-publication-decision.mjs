import { deliverySiteScopeForLabel } from "./losa-finnmark-evidence-index.mjs";

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
  {
    deliverySiteLabel: "Hammerfest",
    scope: "delivery_site_hammerfest",
    countyCode: "56",
    gate: "P4-LOSA-HAMMERFEST-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-HAMMERFEST-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-HAMMERFEST-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Sør-Varanger",
    scope: "delivery_site_sor_varanger",
    countyCode: "56",
    gate: "P4-LOSA-SOR-VARANGER-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-SOR-VARANGER-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-SOR-VARANGER-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Porsanger",
    scope: "delivery_site_porsanger",
    countyCode: "56",
    gate: "P4-LOSA-PORSANGER-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-PORSANGER-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-PORSANGER-2026-05-29-01",
    maxRows: 1,
  },
];

export function hasPublicationDecisionForManifestRow(manifestRow) {
  const deliveryScope = deliverySiteScopeForLabel(
    manifestRow.entity?.deliverySiteLabel ?? null
  );
  if (!deliveryScope) {
    return false;
  }

  return LOSA_FINNMARK_PUBLICATION_DECISION_INDEX.some(
    (entry) => entry.scope === deliveryScope
  );
}
