/**
 * Repo-safe evidence index for Finnmark LOSA (from architecture posts only).
 * No owner-held JSON, snippets, or secrets in git.
 */

/** Owner-accepted CONFIRMED rows (P4-LOSA-OWNER-EVIDENCE-REVIEW-2026-06-03-post). */
export const LOSA_FINNMARK_CONFIRMED_INDEX = [
  {
    sourceId: "T1_UDIR_FJERNUNDERVISNING_DEEP",
    claimClass: "fjernundervisning_rules",
    tier: "T1",
    scope: "county_reference",
    ownerPost: "P4-LOSA-CONFIRMED-UDIR-FJERN-post",
  },
  {
    sourceId: "T1_UDIR_FJERNUNDERVISNING_DEEP",
    claimClass: "legal_status",
    tier: "T1",
    scope: "county_reference",
    ownerPost: "P4-LOSA-CONFIRMED-UDIR-FJERN-post",
  },
  {
    sourceId: "T2_SCHOOL_ALTA_VGS_PROGRAM_DEEP",
    claimClass: "programme_stage_availability",
    tier: "T2",
    scope: "delivery_site_alta",
    ownerPost: "P4-LOSA-CONFIRMED-ALTA-PROGRAMME-post",
    note: "Alta VGS programme deep — full row when provider+delivery CONFIRMED (P4-LOSA-ALTA-PROGRAMME-FULL)",
  },
  {
    sourceId: "T1_REGJERINGEN_PROP57_FJERN_DEEP",
    claimClass: "fjernundervisning_rules",
    tier: "T1",
    scope: "county_reference",
    ownerPost: "P4-LOSA-CONFIRMED-REGJERINGEN-3C-post",
  },
  {
    sourceId: "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
    claimClass: "legal_status",
    tier: "T1",
    scope: "county_reference",
    ownerPost: "P4-LOSA-CONFIRMED-LOVDATA-14-4-post",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS",
    claimClass: "provider_school",
    tier: "T2",
    scope: "provider_nordkapp",
    ownerPost: "P4-LOSA-CONFIRMED-NORDKAPP-PROVIDER-post",
    note: "Nordkapp official landing — provider for all Finnmark ref LOSA rows",
  },
  {
    sourceId: "T2_KOMMUNE_ALTA_REF",
    claimClass: "delivery_municipality",
    tier: "T2",
    scope: "delivery_site_alta",
    ownerPost: "P4-LOSA-CONFIRMED-ALTA-DELIVERY-post",
    note: "Alta kommune official landing — delivery site for Alta LOSA row only",
  },
  {
    sourceId: "T2_KOMMUNE_HAMMERFEST_REF",
    claimClass: "delivery_municipality",
    tier: "T2",
    scope: "delivery_site_hammerfest",
    ownerPost: "P4-LOSA-CONFIRMED-HAMMERFEST-DELIVERY-post",
    note: "Hammerfest kommune official landing — delivery site for Hammerfest LOSA row only",
  },
  {
    sourceId: "T2_KOMMUNE_SOR_VARANGER_REF",
    claimClass: "delivery_municipality",
    tier: "T2",
    scope: "delivery_site_sor_varanger",
    ownerPost: "P4-LOSA-CONFIRMED-SOR-VARANGER-DELIVERY-post",
    note: "Sør-Varanger kommune official landing — delivery site for Sør-Varanger LOSA row only",
  },
  {
    sourceId: "T2_KOMMUNE_PORSANGER_REF",
    claimClass: "delivery_municipality",
    tier: "T2",
    scope: "delivery_site_porsanger",
    ownerPost: "P4-LOSA-CONFIRMED-PORSANGER-DELIVERY-post",
    note: "Porsanger kommune official landing — delivery site for Porsanger LOSA row only",
  },
  {
    sourceId: "T2_KOMMUNE_KARASJOK_REF",
    claimClass: "delivery_municipality",
    tier: "T2",
    scope: "delivery_site_karasjok",
    ownerPost: "P4-LOSA-CONFIRMED-KARASJOK-DELIVERY-post",
    note: "Karasjok kommune official landing — delivery site for Karasjok LOSA row only",
  },
  {
    sourceId: "T2_KOMMUNE_KAUTOKEINO_REF",
    claimClass: "delivery_municipality",
    tier: "T2",
    scope: "delivery_site_kautokeino",
    ownerPost: "P4-LOSA-CONFIRMED-KAUTOKEINO-DELIVERY-post",
    note: "Guovdageaidnu/Kautokeino kommune official landing — delivery site for Kautokeino LOSA row only",
  },
  {
    sourceId: "T2_KOMMUNE_VARDO_REF",
    claimClass: "delivery_municipality",
    tier: "T2",
    scope: "delivery_site_vardo",
    ownerPost: "P4-LOSA-CONFIRMED-VARDO-DELIVERY-post",
    note: "Vardø kommune official landing — delivery site for Vardø LOSA row only",
  },
  {
    sourceId: "T2_KOMMUNE_NESSEBY_REF",
    claimClass: "delivery_municipality",
    tier: "T2",
    scope: "delivery_site_nesseby",
    ownerPost: "P4-LOSA-CONFIRMED-NESSEBY-DELIVERY-post",
    note: "Nesseby kommune official landing — delivery site for Nesseby LOSA row only",
  },
  {
    sourceId: "T2_KOMMUNE_TANA_REF",
    claimClass: "delivery_municipality",
    tier: "T2",
    scope: "delivery_site_tana",
    ownerPost: "P4-LOSA-CONFIRMED-TANA-DELIVERY-post",
    note: "Tana/Deanu gielda kommune official landing — delivery site for Tana LOSA row only",
  },
  {
    sourceId: "T2_KOMMUNE_LEBESBY_REF",
    claimClass: "delivery_municipality",
    tier: "T2",
    scope: "delivery_site_lebesby",
    ownerPost: "P4-LOSA-CONFIRMED-LEBESBY-DELIVERY-post",
    note: "Lebesby kommune official landing — delivery site for Lebesby LOSA row only",
  },
  {
    sourceId: "T2_KOMMUNE_GAMVIK_REF",
    claimClass: "delivery_municipality",
    tier: "T2",
    scope: "delivery_site_gamvik",
    ownerPost: "P4-LOSA-CONFIRMED-GAMVIK-DELIVERY-post",
    note: "Gamvik kommune official landing — delivery site for Gamvik LOSA row only",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    claimClass: "programme_stage_availability",
    tier: "T2",
    scope: "delivery_site_hammerfest",
    ownerPost: "P4-LOSA-CONFIRMED-HAMMERFEST-PROGRAMME-post",
    note: "Nordkapp VGS utdanningstilbud listing — provider programme for Hammerfest LOSA delivery row",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    claimClass: "programme_stage_availability",
    tier: "T2",
    scope: "delivery_site_sor_varanger",
    ownerPost: "P4-LOSA-CONFIRMED-SOR-VARANGER-PROGRAMME-post",
    note: "Nordkapp VGS utdanningstilbud listing — provider programme for Sør-Varanger LOSA delivery row",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    claimClass: "programme_stage_availability",
    tier: "T2",
    scope: "delivery_site_porsanger",
    ownerPost: "P4-LOSA-CONFIRMED-PORSANGER-PROGRAMME-post",
    note: "Nordkapp VGS utdanningstilbud listing — provider programme for Porsanger LOSA delivery row",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    claimClass: "programme_stage_availability",
    tier: "T2",
    scope: "delivery_site_karasjok",
    ownerPost: "P4-LOSA-CONFIRMED-KARASJOK-PROGRAMME-post",
    note: "Nordkapp VGS utdanningstilbud listing — provider programme for Karasjok LOSA delivery row",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    claimClass: "programme_stage_availability",
    tier: "T2",
    scope: "delivery_site_kautokeino",
    ownerPost: "P4-LOSA-CONFIRMED-KAUTOKEINO-PROGRAMME-post",
    note: "Nordkapp VGS utdanningstilbud listing — provider programme for Kautokeino LOSA delivery row",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    claimClass: "programme_stage_availability",
    tier: "T2",
    scope: "delivery_site_vardo",
    ownerPost: "P4-LOSA-CONFIRMED-VARDO-PROGRAMME-post",
    note: "Nordkapp VGS utdanningstilbud listing — provider programme for Vardø LOSA delivery row",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    claimClass: "programme_stage_availability",
    tier: "T2",
    scope: "delivery_site_nesseby",
    ownerPost: "P4-LOSA-CONFIRMED-NESSEBY-PROGRAMME-post",
    note: "Nordkapp VGS utdanningstilbud listing — provider programme for Nesseby LOSA delivery row",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    claimClass: "programme_stage_availability",
    tier: "T2",
    scope: "delivery_site_tana",
    ownerPost: "P4-LOSA-CONFIRMED-TANA-PROGRAMME-post",
    note: "Nordkapp VGS utdanningstilbud listing — provider programme for Tana LOSA delivery row",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    claimClass: "programme_stage_availability",
    tier: "T2",
    scope: "delivery_site_lebesby",
    ownerPost: "P4-LOSA-CONFIRMED-LEBESBY-PROGRAMME-post",
    note: "Nordkapp VGS utdanningstilbud listing — provider programme for Lebesby LOSA delivery row",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    claimClass: "programme_stage_availability",
    tier: "T2",
    scope: "delivery_site_gamvik",
    ownerPost: "P4-LOSA-CONFIRMED-GAMVIK-PROGRAMME-post",
    note: "Nordkapp VGS utdanningstilbud listing — provider programme for Gamvik LOSA delivery row",
  },
  {
    sourceId: "T1T2_ALTA_LOSA_PUBLICATION_SUPPORT_PACKET",
    claimClass: "publication_supporting_evidence",
    tier: "T1+T2",
    scope: "delivery_site_alta",
    ownerPost: "P4-LOSA-ALTA-SUPPORTING-EVIDENCE-post",
    note: "Combined Tier 1+2 packet — never alone; requires row Tier 2 closure",
    componentSourceIds: [
      "T1_UDIR_FJERNUNDERVISNING_DEEP",
      "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
      "T1_REGJERINGEN_PROP57_FJERN_DEEP",
      "T2_SCHOOL_NORDKAPP_VGS",
      "T2_KOMMUNE_ALTA_REF",
      "T2_SCHOOL_ALTA_VGS_PROGRAM_DEEP",
    ],
  },
  {
    sourceId: "T1T2_HAMMERFEST_LOSA_PUBLICATION_SUPPORT_PACKET",
    claimClass: "publication_supporting_evidence",
    tier: "T1+T2",
    scope: "delivery_site_hammerfest",
    ownerPost: "P4-LOSA-HAMMERFEST-SUPPORTING-EVIDENCE-post",
    note: "Combined Tier 1+2 packet — never alone; requires Hammerfest row Tier 2 closure",
    componentSourceIds: [
      "T1_UDIR_FJERNUNDERVISNING_DEEP",
      "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
      "T1_REGJERINGEN_PROP57_FJERN_DEEP",
      "T2_SCHOOL_NORDKAPP_VGS",
      "T2_KOMMUNE_HAMMERFEST_REF",
      "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    ],
  },
  {
    sourceId: "T1T2_SOR_VARANGER_LOSA_PUBLICATION_SUPPORT_PACKET",
    claimClass: "publication_supporting_evidence",
    tier: "T1+T2",
    scope: "delivery_site_sor_varanger",
    ownerPost: "P4-LOSA-SOR-VARANGER-SUPPORTING-EVIDENCE-post",
    note: "Combined Tier 1+2 packet — never alone; requires Sør-Varanger row Tier 2 closure",
    componentSourceIds: [
      "T1_UDIR_FJERNUNDERVISNING_DEEP",
      "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
      "T1_REGJERINGEN_PROP57_FJERN_DEEP",
      "T2_SCHOOL_NORDKAPP_VGS",
      "T2_KOMMUNE_SOR_VARANGER_REF",
      "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    ],
  },
  {
    sourceId: "T1T2_PORSANGER_LOSA_PUBLICATION_SUPPORT_PACKET",
    claimClass: "publication_supporting_evidence",
    tier: "T1+T2",
    scope: "delivery_site_porsanger",
    ownerPost: "P4-LOSA-PORSANGER-SUPPORTING-EVIDENCE-post",
    note: "Combined Tier 1+2 packet — never alone; requires Porsanger row Tier 2 closure",
    componentSourceIds: [
      "T1_UDIR_FJERNUNDERVISNING_DEEP",
      "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
      "T1_REGJERINGEN_PROP57_FJERN_DEEP",
      "T2_SCHOOL_NORDKAPP_VGS",
      "T2_KOMMUNE_PORSANGER_REF",
      "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    ],
  },
  {
    sourceId: "T1T2_KARASJOK_LOSA_PUBLICATION_SUPPORT_PACKET",
    claimClass: "publication_supporting_evidence",
    tier: "T1+T2",
    scope: "delivery_site_karasjok",
    ownerPost: "P4-LOSA-KARASJOK-SUPPORTING-EVIDENCE-post",
    note: "Combined Tier 1+2 packet — never alone; requires Karasjok row Tier 2 closure",
    componentSourceIds: [
      "T1_UDIR_FJERNUNDERVISNING_DEEP",
      "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
      "T1_REGJERINGEN_PROP57_FJERN_DEEP",
      "T2_SCHOOL_NORDKAPP_VGS",
      "T2_KOMMUNE_KARASJOK_REF",
      "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    ],
  },
  {
    sourceId: "T1T2_KAUTOKEINO_LOSA_PUBLICATION_SUPPORT_PACKET",
    claimClass: "publication_supporting_evidence",
    tier: "T1+T2",
    scope: "delivery_site_kautokeino",
    ownerPost: "P4-LOSA-KAUTOKEINO-SUPPORTING-EVIDENCE-post",
    note: "Combined Tier 1+2 packet — never alone; requires Kautokeino row Tier 2 closure",
    componentSourceIds: [
      "T1_UDIR_FJERNUNDERVISNING_DEEP",
      "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
      "T1_REGJERINGEN_PROP57_FJERN_DEEP",
      "T2_SCHOOL_NORDKAPP_VGS",
      "T2_KOMMUNE_KAUTOKEINO_REF",
      "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    ],
  },
  {
    sourceId: "T1T2_VARDO_LOSA_PUBLICATION_SUPPORT_PACKET",
    claimClass: "publication_supporting_evidence",
    tier: "T1+T2",
    scope: "delivery_site_vardo",
    ownerPost: "P4-LOSA-VARDO-SUPPORTING-EVIDENCE-post",
    note: "Combined Tier 1+2 packet — never alone; requires Vardø row Tier 2 closure",
    componentSourceIds: [
      "T1_UDIR_FJERNUNDERVISNING_DEEP",
      "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
      "T1_REGJERINGEN_PROP57_FJERN_DEEP",
      "T2_SCHOOL_NORDKAPP_VGS",
      "T2_KOMMUNE_VARDO_REF",
      "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    ],
  },
  {
    sourceId: "T1T2_NESSEBY_LOSA_PUBLICATION_SUPPORT_PACKET",
    claimClass: "publication_supporting_evidence",
    tier: "T1+T2",
    scope: "delivery_site_nesseby",
    ownerPost: "P4-LOSA-NESSEBY-SUPPORTING-EVIDENCE-post",
    note: "Combined Tier 1+2 packet — never alone; requires Nesseby row Tier 2 closure",
    componentSourceIds: [
      "T1_UDIR_FJERNUNDERVISNING_DEEP",
      "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
      "T1_REGJERINGEN_PROP57_FJERN_DEEP",
      "T2_SCHOOL_NORDKAPP_VGS",
      "T2_KOMMUNE_NESSEBY_REF",
      "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    ],
  },
  {
    sourceId: "T1T2_TANA_LOSA_PUBLICATION_SUPPORT_PACKET",
    claimClass: "publication_supporting_evidence",
    tier: "T1+T2",
    scope: "delivery_site_tana",
    ownerPost: "P4-LOSA-TANA-SUPPORTING-EVIDENCE-post",
    note: "Combined Tier 1+2 packet — never alone; requires Tana row Tier 2 closure",
    componentSourceIds: [
      "T1_UDIR_FJERNUNDERVISNING_DEEP",
      "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
      "T1_REGJERINGEN_PROP57_FJERN_DEEP",
      "T2_SCHOOL_NORDKAPP_VGS",
      "T2_KOMMUNE_TANA_REF",
      "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    ],
  },
  {
    sourceId: "T1T2_LEBESBY_LOSA_PUBLICATION_SUPPORT_PACKET",
    claimClass: "publication_supporting_evidence",
    tier: "T1+T2",
    scope: "delivery_site_lebesby",
    ownerPost: "P4-LOSA-LEBESBY-SUPPORTING-EVIDENCE-post",
    note: "Combined Tier 1+2 packet — never alone; requires Lebesby row Tier 2 closure",
    componentSourceIds: [
      "T1_UDIR_FJERNUNDERVISNING_DEEP",
      "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
      "T1_REGJERINGEN_PROP57_FJERN_DEEP",
      "T2_SCHOOL_NORDKAPP_VGS",
      "T2_KOMMUNE_LEBESBY_REF",
      "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    ],
  },
  {
    sourceId: "T1T2_GAMVIK_LOSA_PUBLICATION_SUPPORT_PACKET",
    claimClass: "publication_supporting_evidence",
    tier: "T1+T2",
    scope: "delivery_site_gamvik",
    ownerPost: "P4-LOSA-GAMVIK-SUPPORTING-EVIDENCE-post",
    note: "Combined Tier 1+2 packet — never alone; requires Gamvik row Tier 2 closure",
    componentSourceIds: [
      "T1_UDIR_FJERNUNDERVISNING_DEEP",
      "T1_LOVDATA_OPPLARINGSLOVA_14_4_DEEP",
      "T1_REGJERINGEN_PROP57_FJERN_DEEP",
      "T2_SCHOOL_NORDKAPP_VGS",
      "T2_KOMMUNE_GAMVIK_REF",
      "T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP",
    ],
  },
];

/** Component refs for Alta combined supporting-evidence packet (sub-gate 4). */
export const ALTA_PUBLICATION_SUPPORT_COMPONENT_SOURCE_IDS =
  LOSA_FINNMARK_CONFIRMED_INDEX.find(
    (entry) =>
      entry.sourceId === "T1T2_ALTA_LOSA_PUBLICATION_SUPPORT_PACKET"
  )?.componentSourceIds ?? [];

/** SNIPPET_CAPTURED rows — not CONFIRMED (P4-LOSA-SNIPPET-SESSION-post). */
export const LOSA_FINNMARK_SNIPPET_ONLY_INDEX = [
  {
    sourceId: "T2_KOMMUNE_ALTA_REF",
    claimClass: "delivery_municipality",
    scope: "delivery_site_alta",
    ownerPost: "P4-LOSA-SNIPPET-SESSION-post",
  },
  {
    sourceId: "T2_SCHOOL_NORDKAPP_VGS",
    claimClass: "provider_school",
    scope: "provider_nordkapp",
    tag: "LOSA_CONTEXT",
    ownerPost: "P4-LOSA-SNIPPET-SESSION-post",
  },
  {
    sourceId: "T2_SCHOOL_ALTA_VGS",
    claimClass: "provider_school",
    scope: "provider_alta",
    ownerPost: "P4-LOSA-SNIPPET-SESSION-post",
  },
  {
    sourceId: "T3_UTDANNING_NO",
    claimClass: "programme_stage_availability",
    scope: "county_supporting",
    tier: "T3",
    ownerPost: "P4-LOSA-SNIPPET-SESSION-post",
  },
];

export function normalizeDeliverySiteLabel(label) {
  return String(label ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function isNordkappProviderLabel(providerLabel) {
  const normalized = normalizeDeliverySiteLabel(providerLabel);
  return normalized.includes("nordkapp") && normalized.includes("videreg");
}

/** Normalized delivery label → evidence scope (nationwide pattern per delivery site). */
export const DELIVERY_SITE_SCOPE_BY_NORMALIZED_LABEL = {
  alta: "delivery_site_alta",
  hammerfest: "delivery_site_hammerfest",
  "sør-varanger": "delivery_site_sor_varanger",
  porsanger: "delivery_site_porsanger",
  karasjok: "delivery_site_karasjok",
  kautokeino: "delivery_site_kautokeino",
  vardø: "delivery_site_vardo",
  nesseby: "delivery_site_nesseby",
  tana: "delivery_site_tana",
  lebesby: "delivery_site_lebesby",
  gamvik: "delivery_site_gamvik",
};

export function deliverySiteScopeForLabel(deliverySiteLabel) {
  const normalized = normalizeDeliverySiteLabel(deliverySiteLabel);
  return DELIVERY_SITE_SCOPE_BY_NORMALIZED_LABEL[normalized] ?? null;
}

export function isAltaDeliverySite(deliverySiteLabel) {
  return normalizeDeliverySiteLabel(deliverySiteLabel) === "alta";
}

export function isHammerfestDeliverySite(deliverySiteLabel) {
  return normalizeDeliverySiteLabel(deliverySiteLabel) === "hammerfest";
}

export function isSorVarangerDeliverySite(deliverySiteLabel) {
  return (
    deliverySiteScopeForLabel(deliverySiteLabel) === "delivery_site_sor_varanger"
  );
}
