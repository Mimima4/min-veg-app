type NavTaxonomyCategory = {
  code: string;
  label: string;
};

type NavTaxonomyOccupation = {
  code: string;
  label: string;
  level1Code: string | null;
};

export type NavTaxonomySnapshot = {
  sourceUrl: string;
  level1Categories: NavTaxonomyCategory[];
  occupations: NavTaxonomyOccupation[];
};

const NAV_TAXONOMY_SOURCE_URL = "https://arbeidsplassen.nav.no/stillinger";

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export async function getNavTaxonomySnapshot(): Promise<NavTaxonomySnapshot> {
  const response = await fetch(NAV_TAXONOMY_SOURCE_URL, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!response.ok) {
    throw new Error(`NAV taxonomy request failed (${response.status})`);
  }
  const html = await response.text();

  const level1Categories = new Map<string, NavTaxonomyCategory>();
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

  const occupations = new Map<string, NavTaxonomyOccupation>();
  const level2Regex =
    /id="[^"]*option-occupationlevel2-([^"]+)"[^>]*>[\s\S]*?<p[^>]*>([^<]+)<\/p>/gi;
  match = level2Regex.exec(html);
  while (match) {
    const code = normalizeWhitespace(match[1] ?? "");
    const label = normalizeWhitespace((match[2] ?? "").replace(/\s*\(Kategori\)\s*$/i, ""));
    if (!code || !label || occupations.has(code)) {
      match = level2Regex.exec(html);
      continue;
    }
    const level1Code = code.includes(".") ? code.split(".")[0] : null;
    occupations.set(code, {
      code,
      label,
      level1Code,
    });
    match = level2Regex.exec(html);
  }

  return {
    sourceUrl: NAV_TAXONOMY_SOURCE_URL,
    level1Categories: Array.from(level1Categories.values()),
    occupations: Array.from(occupations.values()),
  };
}
