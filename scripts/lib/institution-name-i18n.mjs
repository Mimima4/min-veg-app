import { detectSlashAliases } from "../school-identity-semantics.mjs";

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeForMatch(value) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function looksLikeSami(text) {
  return /[áčđŋšŧžÁČĐŊŠŦŽ]/.test(text) || /\bjoatkkaskuvla\b/i.test(text);
}

function scoreAliasAgainstNsr(alias, nsrName) {
  const aliasNorm = normalizeForMatch(alias);
  const nsrNorm = normalizeForMatch(nsrName);
  if (!aliasNorm || !nsrNorm) return 0;
  if (aliasNorm === nsrNorm) return 1;
  if (nsrNorm.includes(aliasNorm) || aliasNorm.includes(nsrNorm)) return 0.8;
  return 0;
}

export function buildInstitutionNameI18nFromVilbliLabel({ vilbliLabel, nsrName }) {
  const { hasSlashAliases, aliasLabels } = detectSlashAliases(vilbliLabel);
  if (!hasSlashAliases || aliasLabels.length < 2) {
    return null;
  }

  const nsr = normalizeWhitespace(nsrName ?? "");
  const scored = aliasLabels.map((alias) => ({
    alias,
    score: nsr ? scoreAliasAgainstNsr(alias, nsr) : 0,
  }));
  scored.sort((a, b) => b.score - a.score);

  const nbAlias = nsr || scored[0]?.alias || aliasLabels[0];
  const remaining = aliasLabels.filter(
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

export async function syncInstitutionNameI18nFromVilbliMatches({
  supabase,
  matchedBySchoolCode,
  schools,
}) {
  const schoolByCode = new Map(schools.map((school) => [school.schoolCode, school]));
  let updated = 0;

  for (const [schoolCode, match] of matchedBySchoolCode.entries()) {
    const school = schoolByCode.get(schoolCode);
    if (!school) continue;

    for (const institution of match.institutions ?? []) {
      const nameI18n = buildInstitutionNameI18nFromVilbliLabel({
        vilbliLabel: school.schoolName,
        nsrName: institution.institutionName,
      });
      if (!nameI18n) continue;

      const { error } = await supabase
        .from("education_institutions")
        .update({ name_i18n: nameI18n })
        .eq("id", institution.institutionId);

      if (error) {
        throw new Error(
          `Failed to sync institution name_i18n for ${institution.institutionId}: ${error.message}`
        );
      }
      updated += 1;
    }
  }

  return { updated };
}
