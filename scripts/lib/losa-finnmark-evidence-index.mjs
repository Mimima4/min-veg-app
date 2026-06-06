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
    note: "Alta VGS programme deep — partial for Nordkapp LOSA Alta row only",
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
];

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

export function isAltaDeliverySite(deliverySiteLabel) {
  return normalizeDeliverySiteLabel(deliverySiteLabel) === "alta";
}
