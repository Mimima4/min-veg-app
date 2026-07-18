function normalizeBasic(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseStageFromProgramme(program) {
  const fromCode = String(program.program_code ?? "").toUpperCase();
  const codeMatch = fromCode.match(/VG([1-3])/);
  if (codeMatch) return `VG${codeMatch[1]}`;

  const fromTitle = String(program.title ?? "").toUpperCase();
  const titleMatch = fromTitle.match(/\bVG([1-3])\b/);
  if (titleMatch) return `VG${titleMatch[1]}`;
  return null;
}

function detectMechanicBranch(program) {
  const title = normalizeBasic(program.title);
  const code = normalizeBasic(program.program_code);

  if (
    title.includes("kjoretoy") ||
    title.includes("bilfaget") ||
    code.includes("kjt") ||
    code.includes("bmk")
  ) {
    return "kjoretoy_bilfaget";
  }
  if (title.includes("teknologi") || title.includes("industrifag") || code.includes("tip")) {
    return "teknologi_industrifag";
  }
  return "unspecified";
}

function detectCarpenterBranch(program) {
  const title = normalizeBasic(program.title);
  const code = normalizeBasic(program.program_code);

  if (title.includes("tomrer") || title.includes("tømrer") || code.includes("tmf")) {
    return "tomrerfaget";
  }
  if (title.includes("bygg") || title.includes("anlegg") || code.includes("bat")) {
    return "bygg_og_anlegg";
  }
  return "unspecified";
}

function detectPlumberBranch(program) {
  const title = normalizeBasic(program.title);
  const code = normalizeBasic(program.program_code);

  if (title.includes("rorlegger") || code.includes("rlf") || code.includes("barlf")) {
    return "rorleggerfaget";
  }
  if (title.includes("bygg") || title.includes("anlegg") || code.includes("bat")) {
    return "bygg_og_anlegg";
  }
  return "unspecified";
}

function detectPainterBranch(program) {
  const title = normalizeBasic(program.title);
  const code = normalizeBasic(program.program_code);

  if (
    title.includes("overflateteknikk") ||
    title.includes("maler") ||
    code.includes("baoft") ||
    code.includes("bamot")
  ) {
    return "overflateteknikk";
  }
  if (title.includes("bygg") || title.includes("anlegg") || code.includes("bat")) {
    return "bygg_og_anlegg";
  }
  return "unspecified";
}

function detectAnleggsteknikkBranch(program) {
  const title = normalizeBasic(program.title);
  const code = normalizeBasic(program.program_code);

  if (
    title.includes("anleggsteknikk") ||
    title.includes("anleggsmaskinforer") ||
    title.includes("veg og anlegg") ||
    code.includes("baanl")
  ) {
    return "anleggsteknikfaget";
  }
  if (title.includes("bygg") || title.includes("anlegg") || code.includes("bat")) {
    return "bygg_og_anlegg";
  }
  return "unspecified";
}

function detectElectricianBranch(program) {
  const title = normalizeBasic(program.title);
  const code = normalizeBasic(program.program_code);

  if (title.includes("elenergi") || title.includes("ekom") || code.includes("elenergi")) {
    return "elenergi_ekom";
  }
  if (title.includes("automatisering")) {
    return "automatisering";
  }
  if (title.includes("datateknologi")) {
    return "datateknologi";
  }
  return "unspecified";
}

/**
 * Mechanic (catalog: mechanic / Mekaniker) — Vilbli area v.tp, signed 2026-06-10:
 * VG1 Teknologi- og industrifag → VG2 Kjøretøy → VG3 / Opplæring i bedrift specializations (full Vilbli list).
 * Excludes Påbygging til generell studiekompetanse (separate academic contour).
 */
const MECHANIC_PATH_DEFINITION = {
  professionSlug: "mechanic",
  contour: "vgs",
  description:
    "Mekaniker VGS path: VG1 Teknologi- og industrifag, VG2 Kjøretøy, full Kjøretøy-related VG3/bedrift specialization list from Vilbli.",
  sourceModel: {
    buildVilbliUrl(countySlug) {
      return `https://www.vilbli.no/nb/${countySlug}/strukturkart/v.tp/kjoretoy-skoler-og-laerebedrifter?kurs=v.tptip1----_v.tpkjt2----_v.tpbmk3----&side=p5`;
    },
    strukturkartReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/v.tp/bilfaget-lette-kjoretoy?kurs=v.tptip1----_v.tpkjt2----_v.tpbmk3----&side=p2",
  },
  stageNodes: [
    {
      nodeKey: "VG1_TEKNOLOGI",
      stage: "VG1",
      stageType: "school_programme",
      branchSpecific: false,
      requiredForWrite: true,
      expectedLabel: "VG1 Teknologi- og industrifag",
      programmeMatcher: {
        includesAny: ["vg1 teknologi og industrifag", "teknologi- og industrifag", "teknologi og industrifag"],
      },
    },
    {
      nodeKey: "VG2_KJORETOY",
      stage: "VG2",
      stageType: "school_programme",
      branchSpecific: true,
      requiredForWrite: true,
      branchKey: "kjoretoy_bilfaget",
      expectedLabel: "VG2 Kjøretøy",
      programmeMatcher: {
        includesAny: ["vg2 kjoretoy", "vg2 kjøretøy", "kjoretoy"],
      },
      branchResolver: detectMechanicBranch,
    },
    {
      nodeKey: "VG3_OR_BEDRIFT_SPECIALIZATIONS",
      stage: "VG3",
      stageType: "awareness_only",
      branchSpecific: false,
      requiredForWrite: false,
      expectedLabel:
        "VG3 or Opplæring i bedrift — full Kjøretøy-related specialization list from Vilbli (not Påbygging)",
    },
    {
      nodeKey: "APPRENTICESHIP_PROGRESS",
      stage: "APPRENTICESHIP",
      stageType: "progression",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Opplæring i bedrift (lære / fagbrev) after VG2 or VG3 specialization choice",
    },
    {
      nodeKey: "FAGBREV_OUTCOME",
      stage: "FAGBREV",
      stageType: "progression_outcome",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Fagbrev outcomes per selected Vilbli specialization",
    },
  ],
};

/**
 * Carpenter (catalog: carpenter / Tømrer) — Vilbli area V.BA, signed 2026-06-10:
 * VG1 Bygg- og anleggsteknikk → VG2 Tømrerfaget → kolonne-3 bedrift specializations (full Vilbli list for this chain).
 * Excludes other V.BA VG2 columns and Påbygging.
 */
const CARPENTER_PATH_DEFINITION = {
  professionSlug: "carpenter",
  contour: "vgs",
  description:
    "Tømrer VGS path: VG1 Bygg- og anleggsteknikk, VG2 Tømrerfaget, full Bygg→Tømrer kolonne-3/bedrift list from Vilbli.",
  sourceModel: {
    buildVilbliUrl(countySlug) {
      return `https://www.vilbli.no/nb/${countySlug}/strukturkart/V.BA/bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BATMF2----_V.BATMF3----&side=p5`;
    },
    strukturkartReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/V.BA/tomrer-fag-og-timefordeling?kurs=V.BABAT1----_V.BATMF2----&side=p2",
  },
  stageNodes: [
    {
      nodeKey: "VG1_BYGG",
      stage: "VG1",
      stageType: "school_programme",
      branchSpecific: false,
      requiredForWrite: true,
      expectedLabel: "VG1 Bygg- og anleggsteknikk",
      programmeMatcher: {
        includesAny: [
          "vg1 bygg og anleggsteknikk",
          "vg1 bygg- og anleggsteknikk",
          "bygg- og anleggsteknikk",
          "bygg og anlegg",
        ],
      },
    },
    {
      nodeKey: "VG2_TOMRER",
      stage: "VG2",
      stageType: "school_programme",
      branchSpecific: true,
      requiredForWrite: true,
      branchKey: "tomrerfaget",
      expectedLabel: "VG2 Tømrerfaget",
      programmeMatcher: {
        includesAny: ["vg2 tomrerfaget", "vg2 tømrerfaget", "tomrerfaget", "tømrerfaget"],
      },
      branchResolver: detectCarpenterBranch,
    },
    {
      nodeKey: "VG3_OR_BEDRIFT_SPECIALIZATIONS",
      stage: "VG3",
      stageType: "awareness_only",
      branchSpecific: false,
      requiredForWrite: false,
      expectedLabel:
        "VG3 or Opplæring i bedrift — full Bygg→Tømrer kolonne-3 list from Vilbli (not Påbygging)",
    },
    {
      nodeKey: "APPRENTICESHIP_PROGRESS",
      stage: "APPRENTICESHIP",
      stageType: "progression",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Opplæring i bedrift (lære / fagbrev) after VG2 or VG3 specialization choice",
    },
    {
      nodeKey: "FAGBREV_OUTCOME",
      stage: "FAGBREV",
      stageType: "progression_outcome",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Fagbrev Tømrer",
    },
  ],
};

/**
 * Plumber (catalog: plumber / Rørlegger) — Vilbli area V.BA:
 * VG1 Bygg- og anleggsteknikk → VG2 Rørleggerfaget → kolonne-3 bedrift (typically single fag).
 * Excludes other V.BA VG2 columns and Påbygging.
 */
/**
 * Painter (catalog: painter / Maler) — Vilbli area V.BA:
 * VG1 Bygg- og anleggsteknikk → VG2 Overflateteknikk → kolonne-3/bedrift list from Vilbli.
 * Excludes other V.BA VG2 columns and Påbygging.
 */
const PAINTER_PATH_DEFINITION = {
  professionSlug: "painter",
  contour: "vgs",
  description:
    "Maler VGS path: VG1 Bygg- og anleggsteknikk, VG2 Overflateteknikk, kolonne-3/bedrift list from Vilbli.",
  sourceModel: {
    buildVilbliUrl(countySlug) {
      return `https://www.vilbli.no/nb/${countySlug}/strukturkart/V.BA/bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAOFT2----_V.BAMOT3----&side=p5`;
    },
    strukturkartReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/V.BA/overflateteknikk?kurs=V.BAOFT2----&side=p2",
  },
  stageNodes: [
    {
      nodeKey: "VG1_BYGG",
      stage: "VG1",
      stageType: "school_programme",
      branchSpecific: false,
      requiredForWrite: true,
      expectedLabel: "VG1 Bygg- og anleggsteknikk",
      programmeMatcher: {
        includesAny: [
          "vg1 bygg og anleggsteknikk",
          "vg1 bygg- og anleggsteknikk",
          "bygg- og anleggsteknikk",
          "bygg og anlegg",
        ],
      },
    },
    {
      nodeKey: "VG2_OVERFLATETEKNIKK",
      stage: "VG2",
      stageType: "school_programme",
      branchSpecific: true,
      requiredForWrite: true,
      branchKey: "overflateteknikk",
      expectedLabel: "VG2 Overflateteknikk",
      programmeMatcher: {
        includesAny: [
          "vg2 overflateteknikk",
          "overflateteknikk",
          "maler og overflateteknikk",
          "malerfaget",
        ],
      },
      branchResolver: detectPainterBranch,
    },
    {
      nodeKey: "VG3_OR_BEDRIFT_SPECIALIZATIONS",
      stage: "VG3",
      stageType: "awareness_only",
      branchSpecific: false,
      requiredForWrite: false,
      expectedLabel:
        "VG3 or Opplæring i bedrift — kolonne-3 list from Vilbli for Bygg→Overflateteknikk chain (not Påbygging)",
    },
    {
      nodeKey: "APPRENTICESHIP_PROGRESS",
      stage: "APPRENTICESHIP",
      stageType: "progression",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Opplæring i bedrift (lære / fagbrev) after VG2 or VG3 specialization choice",
    },
    {
      nodeKey: "FAGBREV_OUTCOME",
      stage: "FAGBREV",
      stageType: "progression_outcome",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Fagbrev Maler- og overflateteknikk",
    },
  ],
};

/**
 * Anleggsteknikk (catalog: anleggsteknikk / Anleggsmaskinfører) — Vilbli area V.BA:
 * VG1 Bygg- og anleggsteknikk → VG2 Anleggsteknikfaget → kolonne-3/bedrift list from Vilbli.
 * Excludes other V.BA VG2 columns and Påbygging.
 */
const ANLEGSTEKNIKK_PATH_DEFINITION = {
  professionSlug: "anleggsteknikk",
  contour: "vgs",
  description:
    "Anleggsteknikk VGS path: VG1 Bygg- og anleggsteknikk, VG2 Anleggsteknikfaget, kolonne-3/bedrift list from Vilbli.",
  sourceModel: {
    buildVilbliUrl(countySlug) {
      return `https://www.vilbli.no/nb/${countySlug}/strukturkart/V.BA/bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAANL2----&side=p5`;
    },
    // Current-year offering source (owner P4-CURRENT-YEAR-OFFERING §4a). Anleggsteknikk VG2 is a
    // «landslinje / landstilbud»: its `vb_map_data_Vg2` pins the national offering schools on every
    // county's course-specific p5 page. We read it from Oslo — a PROBE county that offers no local
    // anleggsteknikk — so the VG2 map is exactly the national offering (no local-structure noise).
    // The national p2 «fag- og timefordeling» page carries no `vb_map_data`, which is why the gate
    // previously never engaged. Live-validate the count (expect 6) before enabling enforcement.
    strukturkartReferenceUrl:
      "https://www.vilbli.no/nb/oslo/strukturkart/V.BA/anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAANL2----&side=p5",
  },
  stageNodes: [
    {
      nodeKey: "VG1_BYGG",
      stage: "VG1",
      stageType: "school_programme",
      branchSpecific: false,
      requiredForWrite: true,
      expectedLabel: "VG1 Bygg- og anleggsteknikk",
      programmeMatcher: {
        includesAny: [
          "vg1 bygg og anleggsteknikk",
          "vg1 bygg- og anleggsteknikk",
          "bygg- og anleggsteknikk",
          "bygg og anlegg",
        ],
      },
    },
    {
      nodeKey: "VG2_ANLEGSTEKNIKK",
      stage: "VG2",
      stageType: "school_programme",
      branchSpecific: true,
      requiredForWrite: true,
      branchKey: "anleggsteknikfaget",
      expectedLabel: "VG2 Anleggsteknikfaget",
      programmeMatcher: {
        includesAny: [
          "vg2 anleggsteknikfaget",
          "anleggsteknikfaget",
          "anleggsteknikk",
          "anleggsmaskinforer",
          "veg og anlegg",
        ],
      },
      branchResolver: detectAnleggsteknikkBranch,
    },
    {
      nodeKey: "VG3_OR_BEDRIFT_SPECIALIZATIONS",
      stage: "VG3",
      stageType: "awareness_only",
      branchSpecific: false,
      requiredForWrite: false,
      expectedLabel:
        "VG3 or Opplæring i bedrift — kolonne-3 list from Vilbli for Bygg→Anleggsteknikfaget chain (not Påbygging)",
    },
    {
      nodeKey: "APPRENTICESHIP_PROGRESS",
      stage: "APPRENTICESHIP",
      stageType: "progression",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Opplæring i bedrift (lære / fagbrev) after VG2 or VG3 specialization choice",
    },
    {
      nodeKey: "FAGBREV_OUTCOME",
      stage: "FAGBREV",
      stageType: "progression_outcome",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Fagbrev Anleggsmaskinfører",
    },
  ],
};

const PLUMBER_PATH_DEFINITION = {
  professionSlug: "plumber",
  contour: "vgs",
  description:
    "Rørlegger VGS path: VG1 Bygg- og anleggsteknikk, VG2 Rørleggerfaget, kolonne-3/bedrift list from Vilbli.",
  sourceModel: {
    buildVilbliUrl(countySlug) {
      return `https://www.vilbli.no/nb/${countySlug}/strukturkart/V.BA/bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BARLF2----_V.BARLF3----&side=p5`;
    },
    strukturkartReferenceUrl:
      "https://www.vilbli.no/nb/no/strukturkart/V.BA/rorlegger-fag-og-timefordeling?kurs=V.BABAT1----_V.BARLF2----&side=p2",
  },
  stageNodes: [
    {
      nodeKey: "VG1_BYGG",
      stage: "VG1",
      stageType: "school_programme",
      branchSpecific: false,
      requiredForWrite: true,
      expectedLabel: "VG1 Bygg- og anleggsteknikk",
      programmeMatcher: {
        includesAny: [
          "vg1 bygg og anleggsteknikk",
          "vg1 bygg- og anleggsteknikk",
          "bygg- og anleggsteknikk",
          "bygg og anlegg",
        ],
      },
    },
    {
      nodeKey: "VG2_RORLEGGER",
      stage: "VG2",
      stageType: "school_programme",
      branchSpecific: true,
      requiredForWrite: true,
      branchKey: "rorleggerfaget",
      expectedLabel: "VG2 Rørleggerfaget",
      programmeMatcher: {
        includesAny: [
          "vg2 rorleggerfaget",
          "vg2 rørleggerfaget",
          "rorleggerfaget",
          "rørleggerfaget",
        ],
      },
      branchResolver: detectPlumberBranch,
    },
    {
      nodeKey: "VG3_OR_BEDRIFT_SPECIALIZATIONS",
      stage: "VG3",
      stageType: "awareness_only",
      branchSpecific: false,
      requiredForWrite: false,
      expectedLabel:
        "VG3 or Opplæring i bedrift — kolonne-3 list from Vilbli for Bygg→Rørlegger chain (not Påbygging)",
    },
    {
      nodeKey: "APPRENTICESHIP_PROGRESS",
      stage: "APPRENTICESHIP",
      stageType: "progression",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Opplæring i bedrift (lære / fagbrev) after VG2 or VG3 specialization choice",
    },
    {
      nodeKey: "FAGBREV_OUTCOME",
      stage: "FAGBREV",
      stageType: "progression_outcome",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Fagbrev Rørlegger",
    },
  ],
};

const ELECTRICIAN_PATH_DEFINITION = {
  professionSlug: "electrician",
  contour: "vgs",
  description:
    "Elektriker VGS path: VG1 foundation, branch-specific VG2, progression via apprenticeship/fagbrev, VG3 awareness.",
  sourceModel: {
    buildVilbliUrl(countySlug) {
      return `https://www.vilbli.no/nb/${countySlug}/strukturkart/v.el/skoler-og-laerebedrifter-elektro-og-datateknologi?kurs=v.elele2----&side=p5`;
    },
  },
  stageNodes: [
    {
      nodeKey: "VG1_ELEKTRO",
      stage: "VG1",
      stageType: "school_programme",
      branchSpecific: false,
      requiredForWrite: true,
      expectedLabel: "VG1 Elektro og datateknologi",
      programmeMatcher: {
        includesAny: ["vg1 elektro og datateknologi", "vg1 elektro"],
      },
    },
    {
      nodeKey: "VG2_EL_BRANCH",
      stage: "VG2",
      stageType: "school_programme",
      branchSpecific: true,
      requiredForWrite: true,
      branchKey: "elenergi_ekom",
      expectedLabel: "VG2 Elenergi og ekom",
      programmeMatcher: {
        includesAny: ["vg2 elenergi og ekom", "vg2 elenergi", "vg2 elektro"],
      },
      branchResolver: detectElectricianBranch,
    },
    {
      nodeKey: "VG3_AWARENESS",
      stage: "VG3",
      stageType: "awareness_only",
      branchSpecific: false,
      requiredForWrite: false,
      expectedLabel: "VG3 school-based option may exist by county",
    },
    {
      nodeKey: "APPRENTICESHIP_PROGRESS",
      stage: "APPRENTICESHIP",
      stageType: "progression",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Apprenticeship (laerling) progression after VG2",
    },
    {
      nodeKey: "FAGBREV_OUTCOME",
      stage: "FAGBREV",
      stageType: "progression_outcome",
      branchSpecific: true,
      requiredForWrite: false,
      expectedLabel: "Fagbrev outcome in profession path",
    },
  ],
};

export const VGS_PATH_DEFINITIONS = {
  electrician: ELECTRICIAN_PATH_DEFINITION,
  mechanic: MECHANIC_PATH_DEFINITION,
  carpenter: CARPENTER_PATH_DEFINITION,
  plumber: PLUMBER_PATH_DEFINITION,
  painter: PAINTER_PATH_DEFINITION,
  anleggsteknikk: ANLEGSTEKNIKK_PATH_DEFINITION,
};

export function getVgsPathDefinition(professionSlug) {
  return VGS_PATH_DEFINITIONS[professionSlug] ?? null;
}

/** R-VG3-CATALOG: true only when path definition requires school-based VG3 PSA writes. */
export function expectsVg3SchoolProgrammeInContour(professionSlug) {
  const definition = getVgsPathDefinition(professionSlug);
  if (!definition) {
    return false;
  }
  return definition.stageNodes.some(
    (node) =>
      node.stage === "VG3" &&
      node.stageType === "school_programme" &&
      node.requiredForWrite === true
  );
}

export function getVg3StageNode(professionSlug) {
  const definition = getVgsPathDefinition(professionSlug);
  if (!definition) {
    return null;
  }
  return definition.stageNodes.find((node) => node.stage === "VG3") ?? null;
}

/**
 * Expanded pipeline may create education_programs only when PSA rows will follow.
 * @param {{ stage: string, schools?: unknown[], source?: string | null }} entry
 */
export function shouldMaterializeExpandedProgrammeCatalog(entry) {
  const stage = String(entry?.stage ?? "").toUpperCase();
  if (stage !== "VG3") {
    return true;
  }

  const source = String(entry?.source ?? "");
  if (source === "apprenticeship_branch_programme") {
    // Kolonne-3 bedrift branches are not programme_in_school catalog rows.
    return false;
  }

  const schools = Array.isArray(entry?.schools) ? entry.schools : [];
  // No school availability ⇒ no orphan VG3 catalog slug.
  return schools.length > 0;
}

export function mapProgrammeToPathNode(program, pathDefinition) {
  const stage = parseStageFromProgramme(program);
  if (!stage) return null;

  const titleNorm = normalizeBasic(program.title);
  const codeNorm = normalizeBasic(program.program_code);

  const matchingNode = pathDefinition.stageNodes.find((node) => {
    if (node.stage !== stage || !node.programmeMatcher) return false;
    return node.programmeMatcher.includesAny.some(
      (hint) => titleNorm.includes(hint) || codeNorm.includes(hint)
    );
  });

  if (!matchingNode) return null;
  const branchKey = matchingNode.branchResolver
    ? matchingNode.branchResolver(program)
    : matchingNode.branchKey ?? null;

  return {
    nodeKey: matchingNode.nodeKey,
    stage: matchingNode.stage,
    branchKey,
  };
}
