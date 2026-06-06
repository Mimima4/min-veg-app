import { normalizeDeliverySiteLabel } from "./losa-finnmark-evidence-index.mjs";

/**
 * Kommune numbers for fylke **56** (Finnmark) — reference for LOSA delivery_site_label resolution.
 * Source: Norwegian standard kommunenummer (4-digit); verify at write session against NSR/SSB.
 * Nationwide pattern: other counties add separate reference tables — not hardcoded in write logic.
 */
export const FINNMARK_KOMMUNE_NUMBER_BY_LABEL = {
  alta: "5601",
  berlevag: "5618",
  batsfjord: "5620",
  gamvik: "5616",
  hammerfest: "5603",
  hasvik: "5624",
  karasjok: "5612",
  kautokeino: "5607",
  lebesby: "5614",
  loppa: "5634",
  masoy: "5626",
  nesseby: "5622",
  nordkapp: "5628",
  porsanger: "5630",
  "sor-varanger": "5636",
  tana: "5605",
  vadso: "5610",
  vardo: "5638",
};

const FINNMARK_LABEL_ALIASES = {
  "sor varanger": "sor-varanger",
  "sør-varanger": "sor-varanger",
  masøy: "masoy",
  vadsø: "vadso",
  vardø: "vardo",
};

function normalizeKommuneLookupLabel(label) {
  let normalized = normalizeDeliverySiteLabel(label)
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a");

  if (FINNMARK_LABEL_ALIASES[normalized]) {
    normalized = FINNMARK_LABEL_ALIASES[normalized];
  }

  return normalized;
}

export function resolveMunicipalityCodeForDeliveryLabel(deliverySiteLabel, context = {}) {
  const countyCode = String(context.countyCode ?? "56").trim();
  if (countyCode !== "56") {
    return {
      resolved: false,
      municipalityCode: null,
      countyCode,
      deliverySiteLabel,
      reason: "kommune_reference_not_defined_for_county",
    };
  }

  const normalized = normalizeKommuneLookupLabel(deliverySiteLabel);

  const municipalityCode = FINNMARK_KOMMUNE_NUMBER_BY_LABEL[normalized] ?? null;

  return {
    resolved: Boolean(municipalityCode),
    municipalityCode,
    countyCode,
    deliverySiteLabel,
    normalizedLabel: normalized,
    reason: municipalityCode ? "finnmark_kommune_reference" : "kommune_label_unresolved",
  };
}

export function enrichManifestRowWithMunicipalityCode(manifestRow, context = {}) {
  const deliverySiteLabel = manifestRow.entity?.deliverySiteLabel ?? null;
  const resolution = resolveMunicipalityCodeForDeliveryLabel(deliverySiteLabel, context);

  return {
    ...manifestRow,
    deliveryMunicipality: resolution,
  };
}

export function resolveAllLosaDeliveryMunicipalityCodes(manifestRows, context = {}) {
  const enriched = manifestRows.map((row) =>
    enrichManifestRowWithMunicipalityCode(row, context)
  );

  const unresolved = enriched.filter((row) => !row.deliveryMunicipality?.resolved);

  return {
    section: "P4-LOSA-KOMMUNE-RESOLVE",
    countyCode: context.countyCode ?? "56",
    rowCount: enriched.length,
    resolvedCount: enriched.length - unresolved.length,
    unresolvedCount: unresolved.length,
    rows: enriched,
  };
}
