/**
 * Lærefag resolver for the verified lærebedrift layer.
 *
 * Source data (NLR / Vilbli / manual seed) carries fag as a free-ish label and/or
 * a VIGO programområde code. We normalize both to a single canonical fag identity
 * so the same employer maps consistently regardless of source or fagfornyelse.
 *
 * Registry: Tømrerfaget + Rørleggerfaget + eleven elektro kolonne-3 + ten kjøretøy kolonne-3 (P3b).
 */

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/å/g, "a")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Canonical fag identities. `code` is our stable internal key (stored in
 * larebedrift_truth.larefag_code). `labelAliases` are normalized substrings we
 * accept from a source label; `codeAliases` are known VIGO/programområde codes
 * (incl. the Finnlærebedrift lærefag code). `apiQueryCodes` are the codes passed
 * to the Finnlærebedrift API `fag=` filter.
 */
const FAG_REGISTRY = [
  {
    code: "TOMRERFAGET",
    label: "Tømrerfaget",
    labelAliases: ["tomrerfaget", "tomrerfag", "tomrer"],
    // VIGO programområde/lærefag codes (LK06 → LK20) + Finnlærebedrift lærefag
    // code BATMF3 (Vg3 Tømrerfaget). BATMF2 is Vg2 (programområde), not the
    // lærefag godkjenning, so it is intentionally excluded.
    codeAliases: ["tomrer3----", "btomr3----", "tomrer1----", "batmf3"],
    apiQueryCodes: ["BATMF3"],
  },
  {
    code: "RORLEGGERFAGET",
    label: "Rørleggerfaget",
    labelAliases: ["rorleggerfaget", "rorleggerfag", "rorlegger"],
    codeAliases: ["rorlegger3----", "barlf3", "barlf3----"],
    apiQueryCodes: ["BARLF3"],
  },
  {
    code: "MALER_OG_OVERFLATETEKNIKKFAGET",
    label: "Maler- og overflateteknikkfaget",
    labelAliases: [
      "maler og overflateteknikk",
      "malerfaget",
      "overflateteknikk",
      "maler",
    ],
    codeAliases: ["bamot3----", "bamot3"],
    apiQueryCodes: ["BAMOT3"],
  },
  {
    code: "INDUSTRIMALERFAGET",
    label: "Industrimalerfaget",
    labelAliases: ["industrimaler", "industrimalerfaget"],
    codeAliases: ["baimf3----", "baimf3"],
    apiQueryCodes: ["BAIMF3"],
  },
  {
    code: "ANLEGGSMASKINFORERFAGET",
    label: "Anleggsmaskinførerfaget",
    labelAliases: [
      "anleggsmaskinforer",
      "anleggsmaskinforerfaget",
      "anleggsmaskinfører",
      "anleggsmaskinførerfaget",
    ],
    codeAliases: ["baamf3----", "baamf3"],
    apiQueryCodes: ["BAAMF3"],
  },
  {
    code: "VEG_OG_ANLEGGSFAGET",
    label: "Veg- og anleggsfaget",
    labelAliases: ["veg og anlegg", "vegog anlegg", "veganlegg"],
    codeAliases: ["baanl3----", "baanl3"],
    apiQueryCodes: ["BAANL3"],
  },
  {
    code: "ELEKTRIKERFAGET",
    label: "Elektrikerfaget",
    labelAliases: ["elektrikerfaget", "elektrikerfag", "elektriker"],
    codeAliases: ["elele3----", "belel3----", "elele3"],
    apiQueryCodes: ["ELELE3"],
  },
  {
    code: "MARITIM_ELEKTRIKERFAGET",
    label: "Maritim elektrikerfaget",
    labelAliases: ["maritim elektriker", "maritim elektrikerfaget"],
    codeAliases: ["elmel3----", "elmel3"],
    apiQueryCodes: ["ELMEL3"],
  },
  {
    code: "ELEKTROREPARATORFAGET",
    label: "Elektroreparatørfaget",
    labelAliases: ["elektroreparator", "elektroreparatorfaget"],
    codeAliases: ["elerf3----", "elerf3"],
    apiQueryCodes: ["ELERF3"],
  },
  {
    code: "ENERGIMONTORFAGET",
    label: "Energimontørfaget",
    labelAliases: ["energimontor", "energimontorfaget"],
    codeAliases: ["elemo3----", "elemo3"],
    apiQueryCodes: ["ELEMO3"],
  },
  {
    code: "ENERGIOPERATORFAGET",
    label: "Energioperatørfaget",
    labelAliases: ["energioperator", "energioperatorfaget"],
    codeAliases: ["eleop3----", "eleop3"],
    apiQueryCodes: ["ELEOP3"],
  },
  {
    code: "HEISMONTORFAGET",
    label: "Heismontørfaget",
    labelAliases: ["heismontor", "heismontorfaget"],
    codeAliases: ["elhei3----", "elhei3"],
    apiQueryCodes: ["ELHEI3"],
  },
  {
    code: "SIGNALMONTORFAGET",
    label: "Signalmontørfaget",
    labelAliases: ["signalmontor", "signalmontorfaget"],
    codeAliases: ["elsig3----", "elsig3"],
    apiQueryCodes: ["ELSIG3"],
  },
  {
    code: "TAVLEMONTORFAGET",
    label: "Tavlemontørfaget",
    labelAliases: ["tavlemontor", "tavlemontorfaget"],
    codeAliases: ["eltav3----", "eltav3"],
    apiQueryCodes: ["ELTAV3"],
  },
  {
    code: "TELEKOMMUNIKASJONSMONTORFAGET",
    label: "Telekommunikasjonsmontørfaget",
    labelAliases: ["telekommunikasjonsmontor", "telekommunikasjonsmontorfaget"],
    codeAliases: ["eltel3----", "eltel3"],
    apiQueryCodes: ["ELTEL3"],
  },
  {
    code: "TOGELEKTRIKERFAGET",
    label: "Togelektrikerfaget",
    labelAliases: ["togelektriker", "togelektrikerfaget"],
    codeAliases: ["eltog3----", "eltog3"],
    apiQueryCodes: ["ELTOG3"],
  },
  {
    code: "VIKLERFAGET",
    label: "Viklerfaget",
    labelAliases: ["vikler", "viklerfaget"],
    codeAliases: ["elvik3----", "elvik3"],
    apiQueryCodes: ["ELVIK3"],
  },
  {
    code: "BILFAGET_DEMONTERING_KJORETOY",
    label: "Bilfaget, demontering av kjøretøy",
    labelAliases: ["demontering av kjoretoy", "demontering av kjøretøy", "bilfaget demontering"],
    codeAliases: ["tpbdk3----", "tpbdk3"],
    apiQueryCodes: ["TPBDK3"],
  },
  {
    code: "BILFAGET_LETTE_KJORETOY",
    label: "Bilfaget, lette kjøretøy",
    labelAliases: ["bilfaget lette kjoretoy", "bilfaget lette kjøretøy", "lette kjoretoy"],
    codeAliases: ["tpbmk3----", "tpbmk3"],
    apiQueryCodes: ["TPBMK3"],
  },
  {
    code: "BILFAGET_TUNGE_KJORETOY",
    label: "Bilfaget, tunge kjøretøy",
    labelAliases: ["bilfaget tunge kjoretoy", "bilfaget tunge kjøretøy", "tunge kjoretoy"],
    codeAliases: ["tpbtk3----", "tpbtk3"],
    apiQueryCodes: ["TPBTK3"],
  },
  {
    code: "HJULUTRUSTNINGSFAGET",
    label: "Hjulutrustningsfaget",
    labelAliases: ["hjulutrustning", "hjulutrustningsfaget"],
    codeAliases: ["tphju3----", "tphju3"],
    apiQueryCodes: ["TPHJU3"],
  },
  {
    code: "LANDBRUKMASKINMEKANIKERFAGET",
    label: "Landbruksmaskinmekanikerfaget",
    labelAliases: ["landbruksmaskinmekaniker", "landbruksmaskinmekanikerfaget"],
    codeAliases: ["tplmm3----", "tplmm3"],
    apiQueryCodes: ["TPLMM3"],
  },
  {
    code: "MOTORMEKANIKERFAGET",
    label: "Motormekanikerfaget",
    labelAliases: ["motormekaniker", "motormekanikerfaget"],
    codeAliases: ["tpmme3----", "tpmme3"],
    apiQueryCodes: ["TPMME3"],
  },
  {
    code: "MOTORSYKKELFAGET",
    label: "Motorsykkelfaget",
    labelAliases: ["motorsykkel", "motorsykkelfaget"],
    codeAliases: ["tpmsy3----", "tpmsy3"],
    apiQueryCodes: ["TPMSY3"],
  },
  {
    code: "RESERVEDELSFAGET",
    label: "Reservedelsfaget",
    labelAliases: ["reservedel", "reservedelsfaget"],
    codeAliases: ["tprsd3----", "tprsd3"],
    apiQueryCodes: ["TPRSD3"],
  },
  {
    code: "SYKKELMEKANIKERFAGET",
    label: "Sykkelmekanikerfaget",
    labelAliases: ["sykkelmekaniker", "sykkelmekanikerfaget"],
    codeAliases: ["tpsym3----", "tpsym3"],
    apiQueryCodes: ["TPSYM3"],
  },
  {
    code: "TRUCK_OG_LIFTMEKANIKERFAGET",
    label: "Truck- og liftmekanikerfaget",
    labelAliases: ["truck og liftmekaniker", "truck- og liftmekaniker", "liftmekaniker"],
    codeAliases: ["tptlm3----", "tptlm3"],
    apiQueryCodes: ["TPTLM3"],
  },
];

function buildLookup() {
  const byCode = new Map();
  const labelMatchers = [];
  for (const fag of FAG_REGISTRY) {
    byCode.set(normalize(fag.code), fag);
    for (const codeAlias of fag.codeAliases) {
      byCode.set(normalize(codeAlias), fag);
    }
    for (const labelAlias of fag.labelAliases) {
      labelMatchers.push({ needle: normalize(labelAlias), fag });
    }
  }
  // Longest needle first so "tomrerfaget" wins over "tomrer".
  labelMatchers.sort((a, b) => b.needle.length - a.needle.length);
  return { byCode, labelMatchers };
}

const LOOKUP = buildLookup();

/**
 * Resolve a raw fag code and/or label to a canonical fag identity.
 * @returns {{ code: string, label: string } | null}
 */
export function resolveLarefag({ code = null, label = null } = {}) {
  const normCode = normalize(code);
  if (normCode && LOOKUP.byCode.has(normCode)) {
    const fag = LOOKUP.byCode.get(normCode);
    return { code: fag.code, label: fag.label };
  }

  const normLabel = normalize(label);
  if (normLabel) {
    for (const matcher of LOOKUP.labelMatchers) {
      if (normLabel.includes(matcher.needle)) {
        return { code: matcher.fag.code, label: matcher.fag.label };
      }
    }
  }

  return null;
}

/** Canonical fag identity for a known internal code, or null. */
export function getLarefagByCode(code) {
  const fag = LOOKUP.byCode.get(normalize(code));
  return fag ? { code: fag.code, label: fag.label } : null;
}

/**
 * Finnlærebedrift API `fag=` query codes for a canonical fag code, or [] if
 * unknown. With no argument, returns the query codes for all supported fag.
 */
export function getLarefagApiQueryCodes(canonicalCode = null) {
  if (canonicalCode == null) {
    return FAG_REGISTRY.flatMap((fag) => fag.apiQueryCodes ?? []);
  }
  const norm = normalize(canonicalCode);
  const fag = FAG_REGISTRY.find((entry) => normalize(entry.code) === norm);
  return fag?.apiQueryCodes ?? [];
}

export const SUPPORTED_LAREFAG_CODES = FAG_REGISTRY.map((fag) => fag.code);
