/**
 * Contour B — Vilbli home VG2 continuation allowlist.
 * Charter: docs/architecture/phase-4-vilbli-home-vg2-continuation-overlay-owner-record.md
 */
import { COUNTY_CODE_TO_VILBLI } from "./vilbli-county-meta.mjs";
import {
  classifyInstitutionMatchForVilbliSchool,
  pickInstitutionMatchesForVilbliSchool,
  pickInstitutionsForPsaEmission,
} from "./vilbli-nsr-institution-match.mjs";
import { extractOutOfCountyVg2ContinuationSchools } from "../vilbli-stage-extraction-helper.mjs";

const MIN_MATCH_SCORE = 0.6;

function normalizeBasic(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveDestinationCountyCodeFromVilbliPin(school) {
  const pinLabel = normalizeBasic(school?.fylkeName);
  const path = String(school?.schoolPagePath ?? "");

  for (const [code, meta] of Object.entries(COUNTY_CODE_TO_VILBLI)) {
    if (pinLabel && pinLabel === normalizeBasic(meta.label)) {
      return code;
    }
    if (meta.slug && path.includes(`/${meta.slug}/`)) {
      return code;
    }
  }
  return null;
}

/**
 * Match out-of-county Vilbli VG2 pins to NSR institutions (fail-closed).
 * @returns {Promise<{
 *   rows: Array<{ institutionId: string, vilbliSchoolCode: string, destinationCountyCode: string }>,
 *   unmatched: Array<object>,
 *   ambiguous: Array<object>,
 * }>}
 */
export async function matchVilbliHomeVg2ContinuationsToNsr({
  supabase,
  schools,
}) {
  const byDest = new Map();
  for (const school of schools ?? []) {
    const dest = resolveDestinationCountyCodeFromVilbliPin(school);
    if (!dest) continue;
    if (!byDest.has(dest)) byDest.set(dest, []);
    byDest.get(dest).push(school);
  }

  const rows = [];
  const unmatched = [];
  const ambiguous = [];

  for (const [destinationCountyCode, destSchools] of byDest.entries()) {
    const { data: nsrInstitutions, error } = await supabase
      .from("education_institutions")
      .select("id, name, county_code, municipality_code, municipality_name, is_private_school, source")
      .eq("county_code", destinationCountyCode)
      .eq("source", "nsr")
      .eq("is_active", true);
    if (error) throw error;

    for (const school of destSchools) {
      const ranked = (nsrInstitutions ?? [])
        .map((institution) => ({
          institution,
          ...classifyInstitutionMatchForVilbliSchool(
            school.schoolName,
            institution.name,
            institution.municipality_name
          ),
        }))
        .filter((candidate) => candidate.matchType !== "none" && candidate.score >= MIN_MATCH_SCORE)
        .sort(
          (a, b) =>
            b.score - a.score || String(a.institution.name).localeCompare(String(b.institution.name))
        );

      const picked = pickInstitutionMatchesForVilbliSchool({
        vilbliSchoolName: school.schoolName,
        ranked,
      });

      if (picked.unmatched) {
        unmatched.push({ ...school, destinationCountyCode });
        continue;
      }
      if (picked.ambiguous) {
        ambiguous.push({ ...school, destinationCountyCode });
        continue;
      }

      const forPsa = pickInstitutionsForPsaEmission(
        picked.matches.map((match) => ({
          institutionId: match.institution.id,
          institutionName: match.institution.name,
          institutionMunicipalityCode: match.institution.municipality_code,
          resolvedVia: match.resolvedVia ?? null,
        }))
      );

      for (const match of forPsa) {
        rows.push({
          institutionId: match.institutionId,
          vilbliSchoolCode: String(school.schoolCode ?? "").trim() || null,
          destinationCountyCode,
        });
      }
    }
  }

  const deduped = Array.from(
    new Map(rows.map((row) => [`${row.institutionId}:${row.destinationCountyCode}`, row])).values()
  );

  return { rows: deduped, unmatched, ambiguous };
}

export async function replaceVilbliHomeVg2Continuations({
  supabase,
  professionSlug,
  homeCountyCode,
  rows,
  isDryRun = false,
}) {
  const profession = String(professionSlug ?? "").trim();
  const home = String(homeCountyCode ?? "").trim();
  if (!profession || !home) {
    throw new Error("replaceVilbliHomeVg2Continuations requires professionSlug and homeCountyCode");
  }

  if (isDryRun) {
    return { written: 0, cleared: true, dryRun: true, rowCount: (rows ?? []).length };
  }

  const { error: deleteError } = await supabase
    .from("vgs_vilbli_home_vg2_continuations")
    .delete()
    .eq("profession_slug", profession)
    .eq("home_county_code", home);
  if (deleteError) throw deleteError;

  const payload = (rows ?? []).map((row) => ({
    profession_slug: profession,
    home_county_code: home,
    institution_id: row.institutionId,
    vilbli_school_code: row.vilbliSchoolCode,
    destination_county_code: row.destinationCountyCode,
    updated_at: new Date().toISOString(),
  }));

  if (payload.length === 0) {
    return { written: 0, cleared: true, dryRun: false };
  }

  const { error: insertError } = await supabase
    .from("vgs_vilbli_home_vg2_continuations")
    .insert(payload);
  if (insertError) throw insertError;

  return { written: payload.length, cleared: true, dryRun: false };
}

/**
 * Extract out-of-county VG2 pins, match NSR, replace allowlist for home pair.
 * Call when Contour B is about to ABORT on missing local VG2 (HTML already loaded).
 */
export async function persistVilbliHomeVg2ContinuationsFromHtml({
  supabase,
  professionSlug,
  homeCountyCode,
  homeCountySlug,
  homeCountyLabel,
  html,
  isDryRun = false,
}) {
  const schools = extractOutOfCountyVg2ContinuationSchools({
    html,
    countySlug: homeCountySlug,
    countyLabel: homeCountyLabel,
  });

  const matched = await matchVilbliHomeVg2ContinuationsToNsr({
    supabase,
    schools,
  });

  const write = await replaceVilbliHomeVg2Continuations({
    supabase,
    professionSlug,
    homeCountyCode,
    rows: matched.rows,
    isDryRun,
  });

  return {
    pinCount: schools.length,
    matchedCount: matched.rows.length,
    unmatchedCount: matched.unmatched.length,
    ambiguousCount: matched.ambiguous.length,
    unmatched: matched.unmatched,
    ambiguous: matched.ambiguous,
    write,
  };
}

export async function clearVilbliHomeVg2Continuations({
  supabase,
  professionSlug,
  homeCountyCode,
  isDryRun = false,
}) {
  return replaceVilbliHomeVg2Continuations({
    supabase,
    professionSlug,
    homeCountyCode,
    rows: [],
    isDryRun,
  });
}
