/** Pure programme identity + required-node rules for VGS materialization. No IO. */

/** Policy: only these path nodes participate in deterministic materialization. */
export const ELECTRICIAN_MATERIALIZATION_NODE_KEYS = ["VG1_ELEKTRO", "VG2_EL_BRANCH"];
export const MECHANIC_MATERIALIZATION_NODE_KEYS = ["VG1_TEKNOLOGI", "VG2_KJORETOY"];
export const CARPENTER_MATERIALIZATION_NODE_KEYS = ["VG1_BYGG", "VG2_TOMRER"];
export const PLUMBER_MATERIALIZATION_NODE_KEYS = ["VG1_BYGG", "VG2_RORLEGGER"];
export const PAINTER_MATERIALIZATION_NODE_KEYS = ["VG1_BYGG", "VG2_OVERFLATETEKNIKK"];
export const ANLEGSTEKNIKK_MATERIALIZATION_NODE_KEYS = ["VG1_BYGG", "VG2_ANLEGSTEKNIKK"];
export const KLIMA_MATERIALIZATION_NODE_KEYS = ["VG1_BYGG", "VG2_KLIMA"];
export const MURER_MATERIALIZATION_NODE_KEYS = ["VG1_BYGG", "VG2_BETONG_MUR"];
export const ANLEGGSGARTNER_MATERIALIZATION_NODE_KEYS = ["VG1_BYGG", "VG2_ANLEGGSGARTNER"];
export const TRETEKNIKK_MATERIALIZATION_NODE_KEYS = ["VG1_BYGG", "VG2_TRETEKNIKK"];

const PROFESSION_MATERIALIZATION_CONFIG = {
  electrician: {
    nodeKeys: ELECTRICIAN_MATERIALIZATION_NODE_KEYS,
    deriveIdentitySpecs: deriveElectricianProgrammeIdentitySpecs,
    countyScopedSlugPatterns: {
      VG1: { slugMiddle: "vg1-elektro", codePrefix: "EL-VG1" },
      VG2: { slugMiddle: "vg2-elenergi", codePrefix: "EL-VG2" },
    },
    trondelagSlugPatterns: {
      VG1: { slug: "electrician-vg1-elektro-trondelag", code: "EL-VG1-TRONDELAG" },
      VG2: { slug: "electrician-vg2-elenergi-trondelag", code: "EL-VG2-TRONDELAG" },
    },
  },
  mechanic: {
    nodeKeys: MECHANIC_MATERIALIZATION_NODE_KEYS,
    deriveIdentitySpecs: deriveMechanicProgrammeIdentitySpecs,
    countyScopedSlugPatterns: {
      VG1: { slugMiddle: "vg1-teknologi", codePrefix: "MECH-VG1" },
      VG2: { slugMiddle: "vg2-kjoretoy", codePrefix: "MECH-VG2" },
    },
    trondelagSlugPatterns: {
      VG1: { slug: "mechanic-vg1-teknologi-trondelag", code: "MECH-VG1-TRONDELAG" },
      VG2: { slug: "mechanic-vg2-kjoretoy-trondelag", code: "MECH-VG2-TRONDELAG" },
    },
  },
  carpenter: {
    nodeKeys: CARPENTER_MATERIALIZATION_NODE_KEYS,
    deriveIdentitySpecs: deriveCarpenterProgrammeIdentitySpecs,
    countyScopedSlugPatterns: {
      VG1: { slugMiddle: "vg1-bygg", codePrefix: "CARP-VG1" },
      VG2: { slugMiddle: "vg2-tomrer", codePrefix: "CARP-VG2" },
    },
    trondelagSlugPatterns: {
      VG1: { slug: "carpenter-vg1-bygg-trondelag", code: "CARP-VG1-TRONDELAG" },
      VG2: { slug: "carpenter-vg2-tomrer-trondelag", code: "CARP-VG2-TRONDELAG" },
    },
  },
  plumber: {
    nodeKeys: PLUMBER_MATERIALIZATION_NODE_KEYS,
    deriveIdentitySpecs: derivePlumberProgrammeIdentitySpecs,
    countyScopedSlugPatterns: {
      VG1: { slugMiddle: "vg1-bygg", codePrefix: "PLUMB-VG1" },
      VG2: { slugMiddle: "vg2-rorlegger", codePrefix: "PLUMB-VG2" },
    },
    trondelagSlugPatterns: {
      VG1: { slug: "plumber-vg1-bygg-trondelag", code: "PLUMB-VG1-TRONDELAG" },
      VG2: { slug: "plumber-vg2-rorlegger-trondelag", code: "PLUMB-VG2-TRONDELAG" },
    },
  },
  painter: {
    nodeKeys: PAINTER_MATERIALIZATION_NODE_KEYS,
    deriveIdentitySpecs: derivePainterProgrammeIdentitySpecs,
    countyScopedSlugPatterns: {
      VG1: { slugMiddle: "vg1-bygg", codePrefix: "PAINT-VG1" },
      VG2: { slugMiddle: "vg2-overflateteknikk", codePrefix: "PAINT-VG2" },
    },
    trondelagSlugPatterns: {
      VG1: { slug: "painter-vg1-bygg-trondelag", code: "PAINT-VG1-TRONDELAG" },
      VG2: { slug: "painter-vg2-overflateteknikk-trondelag", code: "PAINT-VG2-TRONDELAG" },
    },
  },
  anleggsteknikk: {
    nodeKeys: ANLEGSTEKNIKK_MATERIALIZATION_NODE_KEYS,
    deriveIdentitySpecs: deriveAnleggsteknikkProgrammeIdentitySpecs,
    countyScopedSlugPatterns: {
      VG1: { slugMiddle: "vg1-bygg", codePrefix: "ANLEG-VG1" },
      VG2: { slugMiddle: "vg2-anleggsteknikk", codePrefix: "ANLEG-VG2" },
    },
    trondelagSlugPatterns: {
      VG1: { slug: "anleggsteknikk-vg1-bygg-trondelag", code: "ANLEG-VG1-TRONDELAG" },
      VG2: {
        slug: "anleggsteknikk-vg2-anleggsteknikk-trondelag",
        code: "ANLEG-VG2-TRONDELAG",
      },
    },
  },
  klima: {
    nodeKeys: KLIMA_MATERIALIZATION_NODE_KEYS,
    deriveIdentitySpecs: deriveKlimaProgrammeIdentitySpecs,
    countyScopedSlugPatterns: {
      VG1: { slugMiddle: "vg1-bygg", codePrefix: "KLIMA-VG1" },
      VG2: { slugMiddle: "vg2-klima", codePrefix: "KLIMA-VG2" },
    },
    trondelagSlugPatterns: {
      VG1: { slug: "klima-vg1-bygg-trondelag", code: "KLIMA-VG1-TRONDELAG" },
      VG2: { slug: "klima-vg2-klima-trondelag", code: "KLIMA-VG2-TRONDELAG" },
    },
  },
  murer: {
    nodeKeys: MURER_MATERIALIZATION_NODE_KEYS,
    deriveIdentitySpecs: deriveMurerProgrammeIdentitySpecs,
    countyScopedSlugPatterns: {
      VG1: { slugMiddle: "vg1-bygg", codePrefix: "MURER-VG1" },
      VG2: { slugMiddle: "vg2-betong-mur", codePrefix: "MURER-VG2" },
    },
    trondelagSlugPatterns: {
      VG1: { slug: "murer-vg1-bygg-trondelag", code: "MURER-VG1-TRONDELAG" },
      VG2: { slug: "murer-vg2-betong-mur-trondelag", code: "MURER-VG2-TRONDELAG" },
    },
  },
  anleggsgartner: {
    nodeKeys: ANLEGGSGARTNER_MATERIALIZATION_NODE_KEYS,
    deriveIdentitySpecs: deriveAnleggsgartnerProgrammeIdentitySpecs,
    countyScopedSlugPatterns: {
      VG1: { slugMiddle: "vg1-bygg", codePrefix: "ANLEGGSGARTNER-VG1" },
      VG2: { slugMiddle: "vg2-anleggsgartner", codePrefix: "ANLEGGSGARTNER-VG2" },
    },
    trondelagSlugPatterns: {
      VG1: { slug: "anleggsgartner-vg1-bygg-trondelag", code: "ANLEGGSGARTNER-VG1-TRONDELAG" },
      VG2: {
        slug: "anleggsgartner-vg2-anleggsgartner-trondelag",
        code: "ANLEGGSGARTNER-VG2-TRONDELAG",
      },
    },
  },
  snekker: {
    nodeKeys: TRETEKNIKK_MATERIALIZATION_NODE_KEYS,
    deriveIdentitySpecs: deriveSnekkerProgrammeIdentitySpecs,
    countyScopedSlugPatterns: {
      VG1: { slugMiddle: "vg1-bygg", codePrefix: "SNEKKER-VG1" },
      // School VG2 programme name stays Treteknikk (Vilbli BATRT2).
      VG2: { slugMiddle: "vg2-treteknikk", codePrefix: "SNEKKER-VG2" },
    },
    trondelagSlugPatterns: {
      VG1: { slug: "snekker-vg1-bygg-trondelag", code: "SNEKKER-VG1-TRONDELAG" },
      VG2: {
        slug: "snekker-vg2-treteknikk-trondelag",
        code: "SNEKKER-VG2-TRONDELAG",
      },
    },
  },
};

const SUPPORTED_PROFESSION_SLUGS = new Set(Object.keys(PROFESSION_MATERIALIZATION_CONFIG));

/** Semantics aligned with Vilbli-backed pipeline materialization (informational — not necessarily a DB column). */
export const PLANNER_PROGRAMME_SOURCE = "vilbli";

/** Allowed stable warning / reason codes (reason-code discipline). */
export const PLANNER_WARNING_CODES = {
  MISSING_REQUIRED_NODE: "missing_required_node",
  UNSUPPORTED_PROFESSION_SLUG: "unsupported_profession_slug",
  MISSING_COUNTY_CODE: "missing_county_code",
  MISSING_COUNTY_META: "missing_county_meta",
  MISSING_EXTRACTED_STAGES: "missing_extracted_stages",
  UNSUPPORTED_REQUIRED_NODE: "unsupported_required_node",
  DETERMINISTIC_IDENTITY_UNAVAILABLE: "deterministic_identity_unavailable",
};

export function normalizeBasic(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapVilbliSchool(item) {
  if (Array.isArray(item)) {
    return {
      schoolName: String(item[3] || ""),
      schoolCode: String(item[4] || ""),
      fylkeName: String(item[8] || ""),
      schoolPagePath: String(item[9] || ""),
    };
  }

  return {
    schoolName: String(item.schoolName || item.school_name || item.name || ""),
    schoolCode: String(
      item.schoolCode || item.orgOrSchoolCode || item.orgnr || item.orgnr_skole || ""
    ),
    fylkeName: String(item.fylkeName || item.fylke || item.county || ""),
    schoolPagePath: String(item.schoolPagePath || item.url || item.href || ""),
  };
}

/**
 * Mirrors legacy materialize semantics: consumes already-extracted stage rows only.
 * @returns {boolean}
 */
export function stagePresentInCounty(stageRows, countyMeta) {
  if (
    countyMeta == null ||
    typeof countyMeta !== "object" ||
    typeof countyMeta.label !== "string" ||
    typeof countyMeta.slug !== "string"
  ) {
    return false;
  }
  if (!Array.isArray(stageRows)) {
    return false;
  }

  const normalizedCountyLabel = normalizeBasic(countyMeta.label);
  const filtered = stageRows
    .map(mapVilbliSchool)
    .filter((school) => school.schoolName && school.schoolCode)
    .filter(
      (school) =>
        normalizeBasic(school.fylkeName) === normalizedCountyLabel ||
        school.schoolPagePath.includes(`/${countyMeta.slug}/`)
    );
  return filtered.length > 0;
}

function countyTokenFromMeta(countyMeta) {
  return String(countyMeta?.slug ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_");
}

/** @internal — same derivation as legacy script (no fetch / no DB). */
function deriveElectricianProgrammeIdentitySpecs({ professionSlug, countyCode, countyMeta }) {
  if (professionSlug !== "electrician") {
    return null;
  }

  if (countyMeta == null || typeof countyMeta.slug !== "string" || countyMeta.slug.length === 0) {
    return null;
  }

  const config = PROFESSION_MATERIALIZATION_CONFIG.electrician;

  if (countyCode === "50") {
    return {
      VG1_ELEKTRO: {
        slug: config.trondelagSlugPatterns.VG1.slug,
        programCode: config.trondelagSlugPatterns.VG1.code,
        title: "VG1 Elektro og datateknologi",
      },
      VG2_EL_BRANCH: {
        slug: config.trondelagSlugPatterns.VG2.slug,
        programCode: config.trondelagSlugPatterns.VG2.code,
        title: "VG2 Elenergi og ekom",
      },
    };
  }

  const countyUpper = countyTokenFromMeta(countyMeta);
  const patterns = config.countyScopedSlugPatterns;

  return {
    VG1_ELEKTRO: {
      slug: `${professionSlug}-${patterns.VG1.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG1.codePrefix}-${countyUpper}`,
      title: "VG1 Elektro og datateknologi",
    },
    VG2_EL_BRANCH: {
      slug: `${professionSlug}-${patterns.VG2.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG2.codePrefix}-${countyUpper}`,
      title: "VG2 Elenergi og ekom",
    },
  };
}

/** @internal */
function deriveCarpenterProgrammeIdentitySpecs({ professionSlug, countyCode, countyMeta }) {
  if (professionSlug !== "carpenter") {
    return null;
  }

  if (countyMeta == null || typeof countyMeta.slug !== "string" || countyMeta.slug.length === 0) {
    return null;
  }

  const config = PROFESSION_MATERIALIZATION_CONFIG.carpenter;

  if (countyCode === "50") {
    return {
      VG1_BYGG: {
        slug: config.trondelagSlugPatterns.VG1.slug,
        programCode: config.trondelagSlugPatterns.VG1.code,
        title: "VG1 Bygg- og anleggsteknikk",
      },
      VG2_TOMRER: {
        slug: config.trondelagSlugPatterns.VG2.slug,
        programCode: config.trondelagSlugPatterns.VG2.code,
        title: "VG2 Tømrerfaget",
      },
    };
  }

  const countyUpper = countyTokenFromMeta(countyMeta);
  const patterns = config.countyScopedSlugPatterns;

  return {
    VG1_BYGG: {
      slug: `${professionSlug}-${patterns.VG1.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG1.codePrefix}-${countyUpper}`,
      title: "VG1 Bygg- og anleggsteknikk",
    },
    VG2_TOMRER: {
      slug: `${professionSlug}-${patterns.VG2.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG2.codePrefix}-${countyUpper}`,
      title: "VG2 Tømrerfaget",
    },
  };
}

/** @internal */
function derivePlumberProgrammeIdentitySpecs({ professionSlug, countyCode, countyMeta }) {
  if (professionSlug !== "plumber") {
    return null;
  }

  if (countyMeta == null || typeof countyMeta.slug !== "string" || countyMeta.slug.length === 0) {
    return null;
  }

  const config = PROFESSION_MATERIALIZATION_CONFIG.plumber;

  if (countyCode === "50") {
    return {
      VG1_BYGG: {
        slug: config.trondelagSlugPatterns.VG1.slug,
        programCode: config.trondelagSlugPatterns.VG1.code,
        title: "VG1 Bygg- og anleggsteknikk",
      },
      VG2_RORLEGGER: {
        slug: config.trondelagSlugPatterns.VG2.slug,
        programCode: config.trondelagSlugPatterns.VG2.code,
        title: "VG2 Rørleggerfaget",
      },
    };
  }

  const countyUpper = countyTokenFromMeta(countyMeta);
  const patterns = config.countyScopedSlugPatterns;

  return {
    VG1_BYGG: {
      slug: `${professionSlug}-${patterns.VG1.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG1.codePrefix}-${countyUpper}`,
      title: "VG1 Bygg- og anleggsteknikk",
    },
    VG2_RORLEGGER: {
      slug: `${professionSlug}-${patterns.VG2.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG2.codePrefix}-${countyUpper}`,
      title: "VG2 Rørleggerfaget",
    },
  };
}

/** @internal */
function derivePainterProgrammeIdentitySpecs({ professionSlug, countyCode, countyMeta }) {
  if (professionSlug !== "painter") {
    return null;
  }

  if (countyMeta == null || typeof countyMeta.slug !== "string" || countyMeta.slug.length === 0) {
    return null;
  }

  const config = PROFESSION_MATERIALIZATION_CONFIG.painter;

  if (countyCode === "50") {
    return {
      VG1_BYGG: {
        slug: config.trondelagSlugPatterns.VG1.slug,
        programCode: config.trondelagSlugPatterns.VG1.code,
        title: "VG1 Bygg- og anleggsteknikk",
      },
      VG2_OVERFLATETEKNIKK: {
        slug: config.trondelagSlugPatterns.VG2.slug,
        programCode: config.trondelagSlugPatterns.VG2.code,
        title: "VG2 Overflateteknikk",
      },
    };
  }

  const countyUpper = countyTokenFromMeta(countyMeta);
  const patterns = config.countyScopedSlugPatterns;

  return {
    VG1_BYGG: {
      slug: `${professionSlug}-${patterns.VG1.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG1.codePrefix}-${countyUpper}`,
      title: "VG1 Bygg- og anleggsteknikk",
    },
    VG2_OVERFLATETEKNIKK: {
      slug: `${professionSlug}-${patterns.VG2.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG2.codePrefix}-${countyUpper}`,
      title: "VG2 Overflateteknikk",
    },
  };
}

/** @internal */
function deriveAnleggsteknikkProgrammeIdentitySpecs({ professionSlug, countyCode, countyMeta }) {
  if (professionSlug !== "anleggsteknikk") {
    return null;
  }

  if (countyMeta == null || typeof countyMeta.slug !== "string" || countyMeta.slug.length === 0) {
    return null;
  }

  const config = PROFESSION_MATERIALIZATION_CONFIG.anleggsteknikk;

  if (countyCode === "50") {
    return {
      VG1_BYGG: {
        slug: config.trondelagSlugPatterns.VG1.slug,
        programCode: config.trondelagSlugPatterns.VG1.code,
        title: "VG1 Bygg- og anleggsteknikk",
      },
      VG2_ANLEGSTEKNIKK: {
        slug: config.trondelagSlugPatterns.VG2.slug,
        programCode: config.trondelagSlugPatterns.VG2.code,
        title: "VG2 Anleggsteknikfaget",
      },
    };
  }

  const countyUpper = countyTokenFromMeta(countyMeta);
  const patterns = config.countyScopedSlugPatterns;

  return {
    VG1_BYGG: {
      slug: `${professionSlug}-${patterns.VG1.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG1.codePrefix}-${countyUpper}`,
      title: "VG1 Bygg- og anleggsteknikk",
    },
    VG2_ANLEGSTEKNIKK: {
      slug: `${professionSlug}-${patterns.VG2.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG2.codePrefix}-${countyUpper}`,
      title: "VG2 Anleggsteknikfaget",
    },
  };
}

/** @internal */
function deriveKlimaProgrammeIdentitySpecs({ professionSlug, countyCode, countyMeta }) {
  if (professionSlug !== "klima") {
    return null;
  }

  if (countyMeta == null || typeof countyMeta.slug !== "string" || countyMeta.slug.length === 0) {
    return null;
  }

  const config = PROFESSION_MATERIALIZATION_CONFIG.klima;

  if (countyCode === "50") {
    return {
      VG1_BYGG: {
        slug: config.trondelagSlugPatterns.VG1.slug,
        programCode: config.trondelagSlugPatterns.VG1.code,
        title: "VG1 Bygg- og anleggsteknikk",
      },
      VG2_KLIMA: {
        slug: config.trondelagSlugPatterns.VG2.slug,
        programCode: config.trondelagSlugPatterns.VG2.code,
        title: "VG2 Klima, energi og miljøteknikk",
      },
    };
  }

  const countyUpper = countyTokenFromMeta(countyMeta);
  const patterns = config.countyScopedSlugPatterns;

  return {
    VG1_BYGG: {
      slug: `${professionSlug}-${patterns.VG1.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG1.codePrefix}-${countyUpper}`,
      title: "VG1 Bygg- og anleggsteknikk",
    },
    VG2_KLIMA: {
      slug: `${professionSlug}-${patterns.VG2.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG2.codePrefix}-${countyUpper}`,
      title: "VG2 Klima, energi og miljøteknikk",
    },
  };
}

/** @internal */
function deriveMurerProgrammeIdentitySpecs({ professionSlug, countyCode, countyMeta }) {
  if (professionSlug !== "murer") {
    return null;
  }

  if (countyMeta == null || typeof countyMeta.slug !== "string" || countyMeta.slug.length === 0) {
    return null;
  }

  const config = PROFESSION_MATERIALIZATION_CONFIG.murer;

  if (countyCode === "50") {
    return {
      VG1_BYGG: {
        slug: config.trondelagSlugPatterns.VG1.slug,
        programCode: config.trondelagSlugPatterns.VG1.code,
        title: "VG1 Bygg- og anleggsteknikk",
      },
      VG2_BETONG_MUR: {
        slug: config.trondelagSlugPatterns.VG2.slug,
        programCode: config.trondelagSlugPatterns.VG2.code,
        title: "VG2 Betong og mur",
      },
    };
  }

  const countyUpper = countyTokenFromMeta(countyMeta);
  const patterns = config.countyScopedSlugPatterns;

  return {
    VG1_BYGG: {
      slug: `${professionSlug}-${patterns.VG1.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG1.codePrefix}-${countyUpper}`,
      title: "VG1 Bygg- og anleggsteknikk",
    },
    VG2_BETONG_MUR: {
      slug: `${professionSlug}-${patterns.VG2.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG2.codePrefix}-${countyUpper}`,
      title: "VG2 Betong og mur",
    },
  };
}

/** @internal */
function deriveAnleggsgartnerProgrammeIdentitySpecs({ professionSlug, countyCode, countyMeta }) {
  if (professionSlug !== "anleggsgartner") {
    return null;
  }

  if (countyMeta == null || typeof countyMeta.slug !== "string" || countyMeta.slug.length === 0) {
    return null;
  }

  const config = PROFESSION_MATERIALIZATION_CONFIG.anleggsgartner;

  if (countyCode === "50") {
    return {
      VG1_BYGG: {
        slug: config.trondelagSlugPatterns.VG1.slug,
        programCode: config.trondelagSlugPatterns.VG1.code,
        title: "VG1 Bygg- og anleggsteknikk",
      },
      VG2_ANLEGGSGARTNER: {
        slug: config.trondelagSlugPatterns.VG2.slug,
        programCode: config.trondelagSlugPatterns.VG2.code,
        title: "VG2 Anleggsgartner",
      },
    };
  }

  const countyUpper = countyTokenFromMeta(countyMeta);
  const patterns = config.countyScopedSlugPatterns;

  return {
    VG1_BYGG: {
      slug: `${professionSlug}-${patterns.VG1.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG1.codePrefix}-${countyUpper}`,
      title: "VG1 Bygg- og anleggsteknikk",
    },
    VG2_ANLEGGSGARTNER: {
      slug: `${professionSlug}-${patterns.VG2.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG2.codePrefix}-${countyUpper}`,
      title: "VG2 Anleggsgartner",
    },
  };
}

/** @internal */
function deriveSnekkerProgrammeIdentitySpecs({ professionSlug, countyCode, countyMeta }) {
  if (professionSlug !== "snekker") {
    return null;
  }

  if (countyMeta == null || typeof countyMeta.slug !== "string" || countyMeta.slug.length === 0) {
    return null;
  }

  const config = PROFESSION_MATERIALIZATION_CONFIG.snekker;

  if (countyCode === "50") {
    return {
      VG1_BYGG: {
        slug: config.trondelagSlugPatterns.VG1.slug,
        programCode: config.trondelagSlugPatterns.VG1.code,
        title: "VG1 Bygg- og anleggsteknikk",
      },
      VG2_TRETEKNIKK: {
        slug: config.trondelagSlugPatterns.VG2.slug,
        programCode: config.trondelagSlugPatterns.VG2.code,
        title: "VG2 Treteknikk",
      },
    };
  }

  const countyUpper = countyTokenFromMeta(countyMeta);
  const patterns = config.countyScopedSlugPatterns;

  return {
    VG1_BYGG: {
      slug: `${professionSlug}-${patterns.VG1.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG1.codePrefix}-${countyUpper}`,
      title: "VG1 Bygg- og anleggsteknikk",
    },
    VG2_TRETEKNIKK: {
      slug: `${professionSlug}-${patterns.VG2.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG2.codePrefix}-${countyUpper}`,
      title: "VG2 Treteknikk",
    },
  };
}

/** @internal */
function deriveMechanicProgrammeIdentitySpecs({ professionSlug, countyCode, countyMeta }) {
  if (professionSlug !== "mechanic") {
    return null;
  }

  if (countyMeta == null || typeof countyMeta.slug !== "string" || countyMeta.slug.length === 0) {
    return null;
  }

  const config = PROFESSION_MATERIALIZATION_CONFIG.mechanic;

  if (countyCode === "50") {
    return {
      VG1_TEKNOLOGI: {
        slug: config.trondelagSlugPatterns.VG1.slug,
        programCode: config.trondelagSlugPatterns.VG1.code,
        title: "VG1 Teknologi- og industrifag",
      },
      VG2_KJORETOY: {
        slug: config.trondelagSlugPatterns.VG2.slug,
        programCode: config.trondelagSlugPatterns.VG2.code,
        title: "VG2 Kjøretøy",
      },
    };
  }

  const countyUpper = countyTokenFromMeta(countyMeta);
  const patterns = config.countyScopedSlugPatterns;

  return {
    VG1_TEKNOLOGI: {
      slug: `${professionSlug}-${patterns.VG1.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG1.codePrefix}-${countyUpper}`,
      title: "VG1 Teknologi- og industrifag",
    },
    VG2_KJORETOY: {
      slug: `${professionSlug}-${patterns.VG2.slugMiddle}-${countyMeta.slug}`,
      programCode: `${patterns.VG2.codePrefix}-${countyUpper}`,
      title: "VG2 Kjøretøy",
    },
  };
}

/**
 * County-scoped materialized programme identity (slug / program_code) for classify-readiness.
 * Keeps slug patterns aligned with `derive*ProgrammeIdentitySpecs`.
 */
export function isCountyScopedMaterializedProgramme({
  professionSlug,
  program,
  countyMeta,
  pathNode,
}) {
  if (!pathNode) return false;

  const profession = String(professionSlug ?? "").trim();
  const config = PROFESSION_MATERIALIZATION_CONFIG[profession];
  if (!config) return false;

  const slug = String(program.slug ?? "").toLowerCase();
  const countySlug = String(countyMeta?.slug ?? "").toLowerCase();
  const programCode = String(program.program_code ?? "").toUpperCase();
  const countyToken = countyTokenFromMeta(countyMeta);

  if (!countySlug) return false;

  const stage = pathNode.stage;
  if (stage === "VG1") {
    const trondelag = config.trondelagSlugPatterns?.VG1;
    if (countySlug === "trondelag" && trondelag) {
      return slug === trondelag.slug || programCode === trondelag.code;
    }
    const patterns = config.countyScopedSlugPatterns.VG1;
    const slugMatch = slug === `${profession}-${patterns.slugMiddle}-${countySlug}`;
    const codeMatch = programCode === `${patterns.codePrefix}-${countyToken}`;
    return slugMatch || codeMatch;
  }

  if (stage === "VG2") {
    const trondelag = config.trondelagSlugPatterns?.VG2;
    if (countySlug === "trondelag" && trondelag) {
      return slug === trondelag.slug || programCode === trondelag.code;
    }
    const patterns = config.countyScopedSlugPatterns.VG2;
    const slugMatch = slug === `${profession}-${patterns.slugMiddle}-${countySlug}`;
    const codeMatch = programCode === `${patterns.codePrefix}-${countyToken}`;
    return slugMatch || codeMatch;
  }

  return false;
}

function pushUniqueInto(into, codes) {
  const list = Array.isArray(codes) ? codes : [codes];
  for (const c of list) {
    if (!into.includes(c)) {
      into.push(c);
    }
  }
}

/** Stable deterministic ordering + dedupe for exported warning arrays. */
function finalizedWarnings(ws) {
  return [...new Set(ws)].sort();
}

function emptyStableResult(warningsExtra = []) {
  return {
    programmeSpecsByNodeKey: {},
    plannedLinkSpecs: [],
    missingRequiredNodeKeys: [],
    skippedNodeKeys: [],
    plannerWarnings: finalizedWarnings(warningsExtra),
  };
}

/**
 * Single source of deterministic programme/link identity for required VGS path nodes.
 *
 * Does not fetch, write, or read env. Safe on incomplete inputs — returns warnings + stable shape.
 */
export function buildRequiredProgrammeSpecs({
  professionSlug: professionSlugRaw,
  countyCode: countyCodeRaw,
  countyMeta,
  requiredNodes: requiredNodesRaw,
  extractedStages: extractedStagesRaw,
}) {
  const professionSlug =
    typeof professionSlugRaw === "string" ? professionSlugRaw.trim() : "";
  const countyCode = typeof countyCodeRaw === "string" ? countyCodeRaw.trim() : "";

  let plannerWarnings = [];

  const requiredNodes = Array.isArray(requiredNodesRaw) ? requiredNodesRaw : [];
  let extractedStages = extractedStagesRaw;
  if (
    extractedStagesRaw === undefined ||
    extractedStagesRaw === null ||
    typeof extractedStagesRaw !== "object"
  ) {
    pushUniqueInto(plannerWarnings, PLANNER_WARNING_CODES.MISSING_EXTRACTED_STAGES);
    extractedStages = {};
  }

  const sanitizedStages = Object.fromEntries(
    Object.entries(extractedStages).map(([stage, rows]) => [
      stage,
      Array.isArray(rows) ? rows : [],
    ])
  );

  if (!professionSlug) {
    pushUniqueInto(plannerWarnings, PLANNER_WARNING_CODES.DETERMINISTIC_IDENTITY_UNAVAILABLE);
    return emptyStableResult(plannerWarnings);
  }

  const professionConfig = PROFESSION_MATERIALIZATION_CONFIG[professionSlug];
  if (!professionConfig || !SUPPORTED_PROFESSION_SLUGS.has(professionSlug)) {
    pushUniqueInto(plannerWarnings, PLANNER_WARNING_CODES.UNSUPPORTED_PROFESSION_SLUG);
    return emptyStableResult(plannerWarnings);
  }

  const materializationNodeKeys = professionConfig.nodeKeys;
  const materializationNodeKeySet = new Set(materializationNodeKeys);

  if (!countyCode) {
    pushUniqueInto(plannerWarnings, PLANNER_WARNING_CODES.MISSING_COUNTY_CODE);
    return emptyStableResult(plannerWarnings);
  }

  if (
    countyMeta == null ||
    typeof countyMeta !== "object" ||
    typeof countyMeta.slug !== "string" ||
    countyMeta.slug.length === 0 ||
    typeof countyMeta.label !== "string" ||
    countyMeta.label.length === 0
  ) {
    pushUniqueInto(plannerWarnings, PLANNER_WARNING_CODES.MISSING_COUNTY_META);
    return emptyStableResult(plannerWarnings);
  }

  /** Paths not part of VG1/VG2 deterministic policy — tracked as skipped intentionally. */
  const skippedNodeKeys = [];
  for (const node of requiredNodes) {
    const key = typeof node.nodeKey === "string" ? node.nodeKey : "";
    if (key && !materializationNodeKeySet.has(key)) {
      if (!skippedNodeKeys.includes(key)) {
        skippedNodeKeys.push(key);
      }
    }
  }
  skippedNodeKeys.sort();

  const supportedRequiredNodes = requiredNodes.filter(
    (node) =>
      typeof node.nodeKey === "string" && materializationNodeKeySet.has(node.nodeKey)
  );

  const byKey = {};
  for (const node of supportedRequiredNodes) {
    if (typeof node.nodeKey !== "string") continue;
    byKey[node.nodeKey] = node;
  }

  const missingFromPathDefinitions = [];
  const missingStages = [];
  const missingPresenceNodeKeys = [];

  for (const nodeKey of materializationNodeKeys) {
    if (!byKey[nodeKey]) {
      missingFromPathDefinitions.push(nodeKey);
      pushUniqueInto(plannerWarnings, PLANNER_WARNING_CODES.UNSUPPORTED_REQUIRED_NODE);
      continue;
    }

    const node = byKey[nodeKey];
    const stageRows = sanitizedStages[node.stage] ?? [];

    if (!stagePresentInCounty(stageRows, countyMeta)) {
      missingPresenceNodeKeys.push(nodeKey);
      if (!missingStages.includes(node.stage)) {
        missingStages.push(node.stage);
      }
    }
  }

  if (missingPresenceNodeKeys.length > 0) {
    pushUniqueInto(plannerWarnings, PLANNER_WARNING_CODES.MISSING_REQUIRED_NODE);
  }

  const pathCompleteLegacy =
    supportedRequiredNodes.length === materializationNodeKeys.length;
  const stageOkLegacy = missingStages.length === 0;

  if (!pathCompleteLegacy || !stageOkLegacy) {
    return {
      programmeSpecsByNodeKey: {},
      plannedLinkSpecs: [],
      missingRequiredNodeKeys: [
        ...new Set([...missingPresenceNodeKeys, ...missingFromPathDefinitions]),
      ].sort(),
      skippedNodeKeys,
      plannerWarnings: finalizedWarnings(plannerWarnings),
    };
  }

  const identitySpecs = professionConfig.deriveIdentitySpecs({
    professionSlug,
    countyCode,
    countyMeta,
  });

  if (!identitySpecs) {
    pushUniqueInto(plannerWarnings, PLANNER_WARNING_CODES.DETERMINISTIC_IDENTITY_UNAVAILABLE);
    return {
      programmeSpecsByNodeKey: {},
      plannedLinkSpecs: [],
      missingRequiredNodeKeys: materializationNodeKeys.slice(),
      skippedNodeKeys,
      plannerWarnings: finalizedWarnings(plannerWarnings),
    };
  }

  const orderedNodes =
    supportedRequiredNodes.length === materializationNodeKeys.length
      ? supportedRequiredNodes
      : materializationNodeKeys.map((nk) => byKey[nk]).filter(Boolean);

  /** @type {Record<string, object>} */
  const programmeSpecsByNodeKey = {};
  /** @type {Array<{ professionSlug: string, programmeSlug: string, nodeKey: string }>} */
  const plannedLinkSpecs = [];

  for (const node of orderedNodes) {
    const idPart = identitySpecs[node.nodeKey];
    if (!idPart) {
      pushUniqueInto(plannerWarnings, PLANNER_WARNING_CODES.DETERMINISTIC_IDENTITY_UNAVAILABLE);
      return {
        programmeSpecsByNodeKey: {},
        plannedLinkSpecs: [],
        missingRequiredNodeKeys: [...materializationNodeKeys],
        skippedNodeKeys,
        plannerWarnings: finalizedWarnings(plannerWarnings),
      };
    }

    programmeSpecsByNodeKey[node.nodeKey] = {
      nodeKey: node.nodeKey,
      slug: idPart.slug,
      programCode: idPart.programCode,
      title: idPart.title,
      level: "upper_secondary",
      stage: node.stage,
      countyCode,
      source: PLANNER_PROGRAMME_SOURCE,
    };

    plannedLinkSpecs.push({
      professionSlug,
      programmeSlug: idPart.slug,
      nodeKey: node.nodeKey,
    });
  }

  return {
    programmeSpecsByNodeKey,
    plannedLinkSpecs,
    missingRequiredNodeKeys: [],
    skippedNodeKeys,
    plannerWarnings: finalizedWarnings(plannerWarnings),
  };
}
