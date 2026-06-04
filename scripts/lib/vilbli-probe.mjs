import { getVgsPathDefinition } from "../vgs-path-definitions.mjs";
import { COUNTY_CODE_TO_VILBLI } from "./vilbli-county-meta.mjs";
import { extractVilbliStagesFromHtml } from "../vilbli-stage-extraction-helper.mjs";
import { vilbliFetch } from "./vilbli-fetch.mjs";

export async function probeVilbliCounty({ professionSlug, countyCode }) {
  const profession = String(professionSlug ?? "").trim();
  const county = String(countyCode ?? "").trim();
  const pathDefinition = getVgsPathDefinition(profession);
  const countyMeta = COUNTY_CODE_TO_VILBLI[county] ?? null;

  if (!pathDefinition || !countyMeta) {
    return {
      ok: false,
      error: "unsupported_profession_or_county",
      profession,
      county,
    };
  }

  const sourceUrl = pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);
  const response = await vilbliFetch(sourceUrl);
  const html = await response.text();
  const extracted = extractVilbliStagesFromHtml({
    html,
    countySlug: countyMeta.slug,
    countyLabel: countyMeta.label,
  });

  const stageCounts = Object.fromEntries(
    Object.entries(extracted.extractedStages ?? {}).map(([stage, rows]) => [
      stage,
      rows.length,
    ])
  );

  return {
    ok: response.ok && (extracted.extractedStages?.VG1?.length ?? 0) > 0,
    profession,
    county,
    countySlug: countyMeta.slug,
    sourceUrl,
    httpStatus: response.status,
    htmlLength: html.length,
    hasVbMapData: html.includes("vb_map_data"),
    hasKursKolonne: html.includes("kursKolonne1"),
    stageCounts,
    programmeLinkCount: extracted.schoolProgrammeLinks?.length ?? 0,
    diagnostics: extracted.diagnostics ?? null,
  };
}
