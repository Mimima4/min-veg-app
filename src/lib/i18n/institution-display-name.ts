import { resolveContentLocale } from "@/lib/i18n/locales";

export type InstitutionNameI18n = {
  nb: string;
  se?: string;
  nn?: string;
  en?: string;
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForMatch(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function parseSlashAliasLabels(label: string): string[] {
  const raw = normalizeWhitespace(label);
  if (!raw) {
    return [];
  }

  const parts = raw
    .split("/")
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);
  const unique = Array.from(new Set(parts));

  return unique.length > 1 ? unique : [];
}

function looksLikeSami(text: string): boolean {
  return /[áčđŋšŧžÁČĐŊŠŦŽ]/.test(text) || /\bjoatkkaskuvla\b/i.test(text);
}

function scoreAliasAgainstNsr(alias: string, nsrName: string): number {
  const aliasNorm = normalizeForMatch(alias);
  const nsrNorm = normalizeForMatch(nsrName);
  if (!aliasNorm || !nsrNorm) {
    return 0;
  }
  if (aliasNorm === nsrNorm) {
    return 1;
  }
  if (nsrNorm.includes(aliasNorm) || aliasNorm.includes(nsrNorm)) {
    return 0.8;
  }
  return 0;
}

export function buildInstitutionNameI18nFromVilbliLabel(params: {
  vilbliLabel: string;
  nsrName: string | null;
}): InstitutionNameI18n | null {
  const aliases = parseSlashAliasLabels(params.vilbliLabel);
  if (aliases.length < 2) {
    return null;
  }

  const nsr = normalizeWhitespace(params.nsrName ?? "");
  const scored = aliases.map((alias) => ({
    alias,
    score: nsr ? scoreAliasAgainstNsr(alias, nsr) : 0,
  }));
  scored.sort((a, b) => b.score - a.score);

  const nbAlias = nsr || scored[0]?.alias || aliases[0];
  const remaining = aliases.filter(
    (alias) =>
      alias !== nbAlias && normalizeForMatch(alias) !== normalizeForMatch(nbAlias)
  );
  const seCandidate = remaining.find(looksLikeSami) ?? remaining[0];

  if (!seCandidate || normalizeForMatch(seCandidate) === normalizeForMatch(nbAlias)) {
    return null;
  }

  return {
    nb: nbAlias,
    se: seCandidate,
  };
}

export function resolveInstitutionDisplayName(params: {
  locale: string;
  institutionName: string | null;
  nameI18n?: InstitutionNameI18n | Record<string, string> | null;
}): string | null {
  const canonical = normalizeWhitespace(params.institutionName ?? "") || null;
  const i18n = params.nameI18n;
  const contentLocale = resolveContentLocale(params.locale);

  if (contentLocale === "se") {
    const se = typeof i18n?.se === "string" ? normalizeWhitespace(i18n.se) : "";
    if (se) {
      return se;
    }
  }

  if (i18n) {
    const localized = i18n[contentLocale];
    if (typeof localized === "string" && localized.trim()) {
      return normalizeWhitespace(localized);
    }
    const nb = typeof i18n.nb === "string" ? normalizeWhitespace(i18n.nb) : "";
    if (nb) {
      return nb;
    }
  }

  return canonical;
}
