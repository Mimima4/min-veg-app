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

function parseStageArraysFromHtml(html) {
  const stageMap = {};
  const regex = /(?:window\.)?(vb_map_data_[A-Za-z0-9_]+)\s*=\s*(\[[\s\S]*?\]);/g;
  let match = regex.exec(html);
  while (match) {
    try {
      const parsed = new Function(`return (${match[2]});`)();
      if (Array.isArray(parsed)) {
        const suffix = match[1].replace(/^vb_map_data_/i, "");
        const stageMatch = suffix.match(/vg\d/i);
        const stage = (stageMatch ? stageMatch[0] : suffix).toUpperCase();
        stageMap[stage] = parsed;
      }
    } catch {
      // Ignore malformed script blocks.
    }
    match = regex.exec(html);
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

function parseSchoolProgrammeLinksFromHtml({ html, sourceUrl, countySlug }) {
  const rows = [];
  const columnRegex =
    /<div id="(kursKolonne\d+)"[\s\S]*?<ul class="kursList">([\s\S]*?)<\/ul>/gi;
  let columnMatch = columnRegex.exec(html);
  while (columnMatch) {
    const columnId = String(columnMatch[1] ?? "");
    const stage = inferStageFromColumnId(columnId);
    const ul = String(columnMatch[2] ?? "");
    const entryRegex =
      /<li class="([^"]*)"[\s\S]*?<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/li>/gi;
    let entryMatch = entryRegex.exec(ul);
    while (entryMatch) {
      const classAttr = String(entryMatch[1] ?? "");
      const href = String(entryMatch[2] ?? "").trim();
      const rawTitle = String(entryMatch[3] ?? "").replace(/<[^>]+>/g, " ");
      const title = normalizeBasic(rawTitle);

      const isSchoolBased = /\bskole\b/i.test(classAttr);
      const isApprenticeshipBedrift = /\bbedrift\b/i.test(classAttr);
      const hasAdrStyleUrl = /skoler-og-laerebedrifter/i.test(href);
      const inCountyPath = href.includes(`/${countySlug}/`);
      const excludedContour = EXCLUDED_PROGRAMME_PATTERNS.some((re) => re.test(title));

      if (isSchoolBased && !isApprenticeshipBedrift && hasAdrStyleUrl && inCountyPath) {
        rows.push({
          stage,
          title: normalizeBasic(rawTitle),
          titleDisplay: rawTitle.replace(/\s+/g, " ").trim(),
          href: new URL(href, sourceUrl).toString(),
          excluded: excludedContour,
          skipReason: excludedContour ? "adult_or_completion_contour" : null,
          linkType: "school_programme",
          columnId,
          optionId: `opt-${slugToken(rawTitle)}-${slugToken(stage ?? "unknown")}`,
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
