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
};

export function getVgsPathDefinition(professionSlug) {
  return VGS_PATH_DEFINITIONS[professionSlug] ?? null;
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
