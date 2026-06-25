/**
 * Lærefag resolver for the verified lærebedrift layer (P1 scope: carpenter).
 *
 * Source data (NLR / Vilbli / manual seed) carries fag as a free-ish label and/or
 * a VIGO programområde code. We normalize both to a single canonical fag identity
 * so the same employer maps consistently regardless of source or fagfornyelse
 * (old/new fagkode). P1 ships Tømrerfaget only; add entries to FAG_REGISTRY to grow.
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
 * accept from a source label; `codeAliases` are known VIGO/programområde codes.
 */
const FAG_REGISTRY = [
  {
    code: "TOMRERFAGET",
    label: "Tømrerfaget",
    labelAliases: ["tomrerfaget", "tomrerfag", "tomrer"],
    // Known VIGO programområde/lærefag codes across fagfornyelse (LK06 → LK20).
    codeAliases: ["tomrer3----", "btomr3----", "tomrer1----"],
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

export const SUPPORTED_LAREFAG_CODES = FAG_REGISTRY.map((fag) => fag.code);
