function normalizeBasic(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugToken(value) {
  return normalizeBasic(value).replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Parse Vilbli `vb_map_data_* = [...];` without `new Function` (blocked on Vercel serverless).
 */
function parseVilbliJsArrayLiteral(literal) {
  const trimmed = String(literal ?? "").trim();
  if (!trimmed.startsWith("[")) return null;

  const sanitized = trimmed.replace(/,\s*]/g, "]").replace(/,\s*}/g, "}");
  try {
    const parsed = JSON.parse(sanitized);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    try {
      const parsed = new Function(`return (${trimmed});`)();
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

function extractBracketedArrayLiteral(html, openBracketIndex) {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let escape = false;

  for (let i = openBracketIndex; i < html.length; i += 1) {
    const ch = html[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === "\\") {
      escape = true;
      continue;
    }
    if (!inDouble && ch === "'") {
      inSingle = !inSingle;
      continue;
    }
    if (!inSingle && ch === '"') {
      inDouble = !inDouble;
      continue;
    }
    if (inSingle || inDouble) continue;
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        return html.slice(openBracketIndex, i + 1);
      }
    }
  }
  return null;
}

function parseStageArraysFromHtml(html) {
  const stageMap = {};
  const assignRegex = /(?:window\.)?(vb_map_data_[A-Za-z0-9_]+)\s*=\s*\[/gi;
  let match = assignRegex.exec(html);
  while (match) {
    const varName = match[1];
    const openIndex = match.index + match[0].length - 1;
    const literal = extractBracketedArrayLiteral(html, openIndex);
    const parsed = literal ? parseVilbliJsArrayLiteral(literal) : null;
    if (parsed) {
      const suffix = varName.replace(/^vb_map_data_/i, "");
      const stageMatch = suffix.match(/vg\d/i);
      const stage = (stageMatch ? stageMatch[0] : suffix).toUpperCase();
      stageMap[stage] = parsed;
    }
    match = assignRegex.exec(html);
  }
  return stageMap;
}

function mapVilbliSchool(item) {
  if (Array.isArray(item)) {
    return {
      schoolName: String(item[3] || ""),
      schoolCode: String(item[4] || ""),
      schoolType: String(item[2] || ""),
      fylkeName: String(item[8] || ""),
      schoolPagePath: String(item[9] || ""),
      source: "vb_map_data",
    };
  }

  return {
    schoolName: String(item.schoolName || item.school_name || item.name || ""),
    schoolCode: String(
      item.schoolCode || item.orgOrSchoolCode || item.orgnr || item.orgnr_skole || ""
    ),
    schoolType: String(item.schoolType || item.type || ""),
    fylkeName: String(item.fylkeName || item.fylke || item.county || ""),
    schoolPagePath: String(item.schoolPagePath || item.url || item.href || ""),
    source: "vb_map_data",
  };
}

function parseStageAdrLinksFromHtml(html) {
  const stageBlocks = {};
  const blockRegex =
    /<div id="kursKolonne\d+"[\s\S]*?<h4>[\s\S]*?Vg([1-3])[^<]*<\/span><\/h4>[\s\S]*?(?=<div id="kursKolonne\d+"|<\/div>\s*<\/div>\s*<\/div>)/gi;
  let blockMatch = blockRegex.exec(html);
  while (blockMatch) {
    const stage = `VG${blockMatch[1]}`;
    const blockHtml = blockMatch[0];
    const schoolLinkRegex = /<a href="([^"]*\/adr\/(\d+)\/[^"]*)">([^<]+)<\/a>/gi;
    let linkMatch = schoolLinkRegex.exec(blockHtml);
    while (linkMatch) {
      if (!stageBlocks[stage]) stageBlocks[stage] = [];
      stageBlocks[stage].push({
        schoolName: String(linkMatch[3] ?? "").trim(),
        schoolCode: String(linkMatch[2] ?? "").trim(),
        schoolType: "",
        fylkeName: "",
        schoolPagePath: String(linkMatch[1] ?? "").trim(),
        source: "html_stage_block",
      });
      linkMatch = schoolLinkRegex.exec(blockHtml);
    }
    blockMatch = blockRegex.exec(html);
  }
  return stageBlocks;
}

function dedupeSchoolsByCodeAndName(schools) {
  return Array.from(
    new Map(
      schools.map((school) => [
        `${String(school.schoolCode ?? "")}__${String(school.schoolName ?? "")}`,
        school,
      ])
    ).values()
  );
}

const EXCLUDED_PROGRAMME_PATTERNS = [
  /\bpåbygging\b/i,
  /\bpabygging\b/i,
  /\bgenerell studiekompetanse\b/i,
  /\bcompletion\b/i,
  /\badult\b/i,
  /\bvoksen\b/i,
  /\bvoksenoppl[aæ]ring\b/i,
  /\bgrunnkompetanse\b/i,
];

function inferStageFromColumnId(columnId) {
  const match = String(columnId ?? "").match(/kursKolonne(\d+)/i);
  if (!match?.[1]) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n < 1) return null;
  return `VG${n}`;
}

export function resolveStageFromVilbliKurs(urlOrHref) {
  try {
    const url = String(urlOrHref ?? "").includes("://")
      ? new URL(String(urlOrHref))
      : new URL(String(urlOrHref ?? ""), "https://www.vilbli.no");
    const kurs = String(url.searchParams.get("kurs") ?? "");
    if (!kurs) return null;
    const tokens = kurs
      .split("_")
      .map((token) => token.trim().toUpperCase())
      .filter(Boolean);
    const lastToken = tokens.at(-1);
    if (!lastToken) return null;
    const stageMatch = lastToken.match(/([123])(?=-|$)/);
    if (!stageMatch?.[1]) return null;
    return `VG${stageMatch[1]}`;
  } catch {
    return null;
  }
}

function parseSchoolProgrammeLinksFromHtml({ html, sourceUrl, countySlug }) {
  const rows = [];
  const columnRegex =
    /<div id="(kursKolonne\d+)"[\s\S]*?<ul class="kursList">([\s\S]*?)<\/ul>/gi;
  let columnMatch = columnRegex.exec(html);
  while (columnMatch) {
    const columnId = String(columnMatch[1] ?? "");
    const stageFromColumn = inferStageFromColumnId(columnId);
    const ul = String(columnMatch[2] ?? "");
    const entryRegex =
      /<li class="([^"]*)"[\s\S]*?<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/li>/gi;
    let entryMatch = entryRegex.exec(ul);
    while (entryMatch) {
      const classAttr = String(entryMatch[1] ?? "");
      const href = String(entryMatch[2] ?? "").trim();
      const stageFromKurs = resolveStageFromVilbliKurs(href);
      const stage = stageFromKurs ?? stageFromColumn;
      const rawTitle = String(entryMatch[3] ?? "").replace(/<[^>]+>/g, " ");
      const title = normalizeBasic(rawTitle);

      const isSchoolBased = /\bskole\b/i.test(classAttr);
      const isApprenticeshipBedrift = /\bbedrift\b/i.test(classAttr);
      const hasAdrStyleUrl = /skoler-og-laerebedrifter/i.test(href);
      const inCountyPath = href.includes(`/${countySlug}/`);
      const excludedContour = EXCLUDED_PROGRAMME_PATTERNS.some((re) => re.test(title));

      const linkPayload = {
        stage,
        title: normalizeBasic(rawTitle),
        titleDisplay: rawTitle.replace(/\s+/g, " ").trim(),
        href: new URL(href, sourceUrl).toString(),
        excluded: excludedContour,
        skipReason: excludedContour ? "adult_or_completion_contour" : null,
        columnId,
        optionId: `opt-${slugToken(rawTitle)}-${slugToken(stage ?? "unknown")}`,
      };

      if (isSchoolBased && !isApprenticeshipBedrift && hasAdrStyleUrl && inCountyPath) {
        rows.push({
          ...linkPayload,
          linkType: "school_programme",
        });
      } else if (isApprenticeshipBedrift && hasAdrStyleUrl && inCountyPath && !excludedContour) {
        // VG3 / Opplæring i bedrift branch pages (e.g. Bilfaget, Elektrikerfaget).
        rows.push({
          ...linkPayload,
          linkType: "apprenticeship_branch_programme",
        });
      }
      entryMatch = entryRegex.exec(ul);
    }
    columnMatch = columnRegex.exec(html);
  }

  return Array.from(
    new Map(rows.map((row) => [`${row.stage ?? "UNK"}::${row.titleDisplay}`, row])).values()
  );
}

/**
 * National (NO county filter) extraction of `vb_map_data_Vg*` pins, keyed by stage (VG1/VG2/…).
 *
 * Unlike {@link extractVilbliStagesFromHtml} this does not drop pins by county — every pin on the
 * page is returned. Used by the current-year offering gate, where a «landslinje / landstilbud»
 * course (e.g. anleggsteknikk VG2) pins the *national* set of offering schools on every county
 * page regardless of the page's own county.
 *
 * @returns {Record<string, Array<{schoolName:string, schoolCode:string, schoolType:string, fylkeName:string, schoolPagePath:string, source:string}>>}
 */
export function extractVilbliMapPinsByStage(html) {
  const rawMapStageArrays = parseStageArraysFromHtml(String(html ?? ""));
  const byStage = {};
  for (const [stage, items] of Object.entries(rawMapStageArrays)) {
    byStage[stage] = (items ?? [])
      .map(mapVilbliSchool)
      .filter((school) => school.schoolName && school.schoolCode);
  }
  return byStage;
}

export function extractVilbliStagesFromHtml({ html, countySlug, countyLabel }) {
  const rawMapStageArrays = parseStageArraysFromHtml(html);
  const htmlStageLinks = parseStageAdrLinksFromHtml(html);

  const allStages = new Set([
    ...Object.keys(rawMapStageArrays),
    ...Object.keys(htmlStageLinks),
  ]);

  const extractedStages = {};
  for (const stage of allStages) {
    const mapSchools = (rawMapStageArrays[stage] ?? [])
      .map(mapVilbliSchool)
      .filter((school) => school.schoolName && school.schoolCode)
      .filter(
        (school) =>
          normalizeBasic(school.fylkeName) === normalizeBasic(countyLabel) ||
          school.schoolPagePath.includes(`/${countySlug}/`)
      );

    const htmlSchools = (htmlStageLinks[stage] ?? [])
      .map((school) => ({
        ...school,
        schoolPagePath: school.schoolPagePath.startsWith("/")
          ? school.schoolPagePath
          : `/${school.schoolPagePath}`,
      }))
      .filter((school) => school.schoolName && school.schoolCode)
      .filter((school) => school.schoolPagePath.includes(`/${countySlug}/`));

    extractedStages[stage] = dedupeSchoolsByCodeAndName([...mapSchools, ...htmlSchools]);
  }

  return {
    extractedStages,
    schoolProgrammeLinks: parseSchoolProgrammeLinksFromHtml({
      html,
      sourceUrl: `https://www.vilbli.no/nb/${countySlug}/`,
      countySlug,
    }),
    diagnostics: {
      mapStageCounts: Object.fromEntries(
        Object.entries(rawMapStageArrays).map(([stage, rows]) => [stage, rows.length])
      ),
      htmlStageCounts: Object.fromEntries(
        Object.entries(htmlStageLinks).map(([stage, rows]) => [stage, rows.length])
      ),
      mergedStageCounts: Object.fromEntries(
        Object.entries(extractedStages).map(([stage, rows]) => [stage, rows.length])
      ),
    },
  };
}
