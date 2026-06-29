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
