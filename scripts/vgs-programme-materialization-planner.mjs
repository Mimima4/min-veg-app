/** Pure programme identity + required-node rules for electrician VGS materialization. No IO. */

/** Policy: only these electrician path nodes participate in deterministic materialization. */
export const ELECTRICIAN_MATERIALIZATION_NODE_KEYS = ["VG1_ELEKTRO", "VG2_EL_BRANCH"];

const ELECTRICIAN_MATERIALIZATION_NODE_KEY_SET = new Set(
  ELECTRICIAN_MATERIALIZATION_NODE_KEYS
);

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

/** @internal — same derivation as legacy script (no fetch / no DB). */
function deriveElectricianProgrammeIdentitySpecs({ professionSlug, countyCode, countyMeta }) {
  if (professionSlug !== "electrician") {
    return null;
  }

  if (countyMeta == null || typeof countyMeta.slug !== "string" || countyMeta.slug.length === 0) {
    return null;
  }

  if (countyCode === "50") {
    return {
      VG1_ELEKTRO: {
        slug: "electrician-vg1-elektro-trondelag",
        programCode: "EL-VG1-TRONDELAG",
        title: "VG1 Elektro og datateknologi",
      },
      VG2_EL_BRANCH: {
        slug: "electrician-vg2-elenergi-trondelag",
        programCode: "EL-VG2-TRONDELAG",
        title: "VG2 Elenergi og ekom",
      },
    };
  }

  const countyUpper = countyMeta.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_");

  return {
    VG1_ELEKTRO: {
      slug: `${professionSlug}-vg1-elektro-${countyMeta.slug}`,
      programCode: `EL-VG1-${countyUpper}`,
      title: "VG1 Elektro og datateknologi",
    },
    VG2_EL_BRANCH: {
      slug: `${professionSlug}-vg2-elenergi-${countyMeta.slug}`,
      programCode: `EL-VG2-${countyUpper}`,
      title: "VG2 Elenergi og ekom",
    },
  };
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
 * Single source of deterministic programme/link identity for electrician required nodes.
 *
 * Does not fetch, write, or read env. Safe on incomplete inputs — returns warnings + stable shape.
 *
 * Definition alignment with execution-plan text:
 * - unsupported_required_node: required policy nodes (VG1_ELEKTRO / VG2_EL_BRANCH) absent from supplied path `requiredNodes`
 * - missing_required_node: path row exists but stage data absent in county / planner context cannot satisfy it
 *
 * Behaviour aligned with legacy `materialize-vgs-programmes-from-vilbli.mjs`: programmeSpecs are emitted only once
 * path completeness + Vilbli stage presence checks pass for both policy nodes (same order as legacy success path).
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

  if (professionSlug !== "electrician") {
    pushUniqueInto(plannerWarnings, PLANNER_WARNING_CODES.UNSUPPORTED_PROFESSION_SLUG);
    return emptyStableResult(plannerWarnings);
  }

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

  /** Paths not part of VG1/VG2 electrician deterministic policy — tracked as skipped intentionally. */
  const skippedNodeKeys = [];
  for (const node of requiredNodes) {
    const key = typeof node.nodeKey === "string" ? node.nodeKey : "";
    if (key && !ELECTRICIAN_MATERIALIZATION_NODE_KEY_SET.has(key)) {
      if (!skippedNodeKeys.includes(key)) {
        skippedNodeKeys.push(key);
      }
    }
  }
  skippedNodeKeys.sort();

  const supportedRequiredNodes = requiredNodes.filter(
    (node) =>
      typeof node.nodeKey === "string" &&
      ELECTRICIAN_MATERIALIZATION_NODE_KEY_SET.has(node.nodeKey)
  );

  const byKey = {};
  for (const node of supportedRequiredNodes) {
    if (typeof node.nodeKey !== "string") continue;
    byKey[node.nodeKey] = node;
  }

  /** Nodes required by deterministic policy order. */
  const missingFromPathDefinitions = [];

  /** @type {string[]} */
  const missingStages = [];

  /** Nodes that exist in policy but Vilbli county presence failed. */
  const missingPresenceNodeKeys = [];

  for (const nodeKey of ELECTRICIAN_MATERIALIZATION_NODE_KEYS) {
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

  /** Match legacy semantics: specs only after BOTH policy nodes resolve (path-def + stages). */
  const pathCompleteLegacy =
    supportedRequiredNodes.length === ELECTRICIAN_MATERIALIZATION_NODE_KEYS.length;
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

  const identitySpecs = deriveElectricianProgrammeIdentitySpecs({
    professionSlug,
    countyCode,
    countyMeta,
  });

  if (!identitySpecs) {
    pushUniqueInto(plannerWarnings, PLANNER_WARNING_CODES.DETERMINISTIC_IDENTITY_UNAVAILABLE);
    return {
      programmeSpecsByNodeKey: {},
      plannedLinkSpecs: [],
      missingRequiredNodeKeys: ELECTRICIAN_MATERIALIZATION_NODE_KEYS.slice(),
      skippedNodeKeys,
      plannerWarnings: finalizedWarnings(plannerWarnings),
    };
  }

  /** Preserve legacy iteration order: pathDefinition filter order equivalent is supportedRequiredNodes order. */
  const orderedNodes =
    supportedRequiredNodes.length === ELECTRICIAN_MATERIALIZATION_NODE_KEYS.length
      ? supportedRequiredNodes
      : ELECTRICIAN_MATERIALIZATION_NODE_KEYS.map((nk) => byKey[nk]).filter(Boolean);

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
        missingRequiredNodeKeys: [...ELECTRICIAN_MATERIALIZATION_NODE_KEYS],
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
