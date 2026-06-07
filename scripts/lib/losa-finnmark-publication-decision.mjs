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
  {
    deliverySiteLabel: "Karasjok",
    scope: "delivery_site_karasjok",
    countyCode: "56",
    gate: "P4-LOSA-KARASJOK-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-KARASJOK-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-KARASJOK-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Kautokeino",
    scope: "delivery_site_kautokeino",
    countyCode: "56",
    gate: "P4-LOSA-KAUTOKEINO-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-KAUTOKEINO-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-KAUTOKEINO-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Vardø",
    scope: "delivery_site_vardo",
    countyCode: "56",
    gate: "P4-LOSA-VARDO-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-VARDO-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-VARDO-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Nesseby",
    scope: "delivery_site_nesseby",
    countyCode: "56",
    gate: "P4-LOSA-NESSEBY-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-NESSEBY-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-NESSEBY-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Tana",
    scope: "delivery_site_tana",
    countyCode: "56",
    gate: "P4-LOSA-TANA-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-TANA-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-TANA-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Lebesby",
    scope: "delivery_site_lebesby",
    countyCode: "56",
    gate: "P4-LOSA-LEBESBY-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-LEBESBY-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-LEBESBY-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Gamvik",
    scope: "delivery_site_gamvik",
    countyCode: "56",
    gate: "P4-LOSA-GAMVIK-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-GAMVIK-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-GAMVIK-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Berlevåg",
    scope: "delivery_site_berlevag",
    countyCode: "56",
    gate: "P4-LOSA-BERLEVAG-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-BERLEVAG-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-BERLEVAG-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Hasvik",
    scope: "delivery_site_hasvik",
    countyCode: "56",
    gate: "P4-LOSA-HASVIK-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-HASVIK-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-HASVIK-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Båtsfjord",
    scope: "delivery_site_batsfjord",
    countyCode: "56",
    gate: "P4-LOSA-BATSFJORD-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-BATSFJORD-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-BATSFJORD-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Loppa",
    scope: "delivery_site_loppa",
    countyCode: "56",
    gate: "P4-LOSA-LOPPA-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-LOPPA-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-LOPPA-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Måsøy",
    scope: "delivery_site_masoy",
    countyCode: "56",
    gate: "P4-LOSA-MASOY-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-MASOY-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-MASOY-2026-05-29-01",
    maxRows: 1,
  },
  {
    deliverySiteLabel: "Nordkapp",
    scope: "delivery_site_nordkapp",
    countyCode: "56",
    gate: "P4-LOSA-NORDKAPP-PUBLICATION-DECISION",
    ownerPost: "P4-LOSA-NORDKAPP-PUBLICATION-DECISION-post",
    charterRef: "MAIN-LOSA-PUBLICATION-DECISION-NORDKAPP-2026-05-29-01",
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
