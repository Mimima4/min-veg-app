export type ParsedNavTaxonomyCategory = {
  code: string;
  label: string;
};

export type ParsedNavTaxonomyOccupation = {
  code: string;
  label: string;
  level1Code: string | null;
  level1Label: string | null;
};

export type ParsedNavTaxonomySnapshot = {
  sourceUrl: string;
  level1Categories: ParsedNavTaxonomyCategory[];
  occupations: ParsedNavTaxonomyOccupation[];
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function parseNavTaxonomyHtml(
  html: string,
  sourceUrl: string
): ParsedNavTaxonomySnapshot {
  const level1Categories = new Map<string, ParsedNavTaxonomyCategory>();
  const level1Regex =
    /id="[^"]*option-occupationlevel1-([^"]+)"[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi;
  let match = level1Regex.exec(html);
  while (match) {
    const code = normalizeWhitespace(match[1] ?? "");
    const label = normalizeWhitespace((match[2] ?? "").replace(/\s*\(Kategori\)\s*$/i, ""));
    if (code && label && !level1Categories.has(code)) {
      level1Categories.set(code, { code, label });
    }
    match = level1Regex.exec(html);
  }

  const occupations: ParsedNavTaxonomyOccupation[] = [];
  const seenCodes = new Set<string>();
  const level2Regex =
    /id="[^"]*option-occupationlevel2-([^"]+)"[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi;
  match = level2Regex.exec(html);
  while (match) {
    const code = normalizeWhitespace(match[1] ?? "");
    const label = normalizeWhitespace((match[2] ?? "").replace(/\s*\(Kategori\)\s*$/i, ""));
    if (!code || !label || seenCodes.has(code)) {
      match = level2Regex.exec(html);
      continue;
    }
    seenCodes.add(code);
    const level1Code = code.includes(".") ? (code.split(".")[0] ?? null) : null;
    occupations.push({
      code,
      label,
      level1Code,
      level1Label: level1Code ? (level1Categories.get(level1Code)?.label ?? null) : null,
    });
    match = level2Regex.exec(html);
  }

  return {
    sourceUrl,
    level1Categories: Array.from(level1Categories.values()),
    occupations,
  };
}
