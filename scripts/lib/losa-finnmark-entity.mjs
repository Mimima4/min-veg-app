import { classifyIdentitySemantics } from "../school-identity-semantics.mjs";

/** §4 claim classes from phase-4-losa-finnmark-publishability-contract-draft.md */
export const LOSA_FINNMARK_CLAIM_CLASSES = [
  "legal_status",
  "fjernundervisning_rules",
  "provider_school",
  "delivery_municipality",
  "programme_stage_availability",
  "publication_supporting_evidence",
];

const LOSA_LABEL_SPLIT =
  /^(.+?)\s*(?:[–—-]\s*|\s+)(?:LOSA|lokal\s+oppl(?:æ|a)ring)\s+(.+)$/iu;

/**
 * Parse Vilbli LOSA label into provider school vs delivery municipality/site.
 * Does not infer NSR linkage or publishability.
 */
export function parseLosaVilbliLabel(schoolName) {
  const originalLabel = String(schoolName ?? "").replace(/\s+/g, " ").trim();
  const semantics = classifyIdentitySemantics(originalLabel);

  if (!semantics.isLosa) {
    return {
      originalLabel,
      isLosa: false,
      providerSchoolLabel: null,
      deliverySiteLabel: null,
      parseStatus: "not_losa",
      losaReason: semantics.losaReason,
    };
  }

  const splitMatch = originalLabel.match(LOSA_LABEL_SPLIT);
  if (splitMatch) {
    return {
      originalLabel,
      isLosa: true,
      providerSchoolLabel: splitMatch[1].trim(),
      deliverySiteLabel: splitMatch[2].trim(),
      parseStatus: "parsed_provider_and_delivery",
      losaReason: semantics.losaReason,
    };
  }

  return {
    originalLabel,
    isLosa: true,
    providerSchoolLabel: originalLabel,
    deliverySiteLabel: null,
    parseStatus: "losa_unparsed_delivery_site",
    losaReason: semantics.losaReason,
  };
}

/**
 * Read-only §4 posture — planning evidence does not satisfy per-row publication.
 */
export function assessLosaFinnmarkPublishabilityPosture() {
  return {
    posture: "STILL_BLOCKED_ALL_SECTION_4",
    phase2ConceptualState: "unsupported_losa",
    psaEligible: false,
    routeEligible: false,
    blockedClaimClasses: [...LOSA_FINNMARK_CLAIM_CLASSES],
    rationale:
      "Owner-held planning evidence (5 CONFIRMED) does not close per-municipality Tier 2 provider/delivery/programme claims.",
  };
}

export function buildLosaFinnmarkManifestRow(school, context = {}) {
  const parsed = parseLosaVilbliLabel(school.schoolName);
  const posture = assessLosaFinnmarkPublishabilityPosture();

  return {
    vilbliSchoolCode: school.schoolCode ?? null,
    vilbliSchoolPagePath: school.schoolPagePath ?? null,
    vilbliStagesSeen: context.stagesSeen ?? [],
    countyCode: context.countyCode ?? "56",
    entity: {
      providerSchoolLabel: parsed.providerSchoolLabel,
      deliverySiteLabel: parsed.deliverySiteLabel,
      gatheringLocationLabel: null,
    },
    semantics: {
      isLosa: parsed.isLosa,
      losaReason: parsed.losaReason,
      parseStatus: parsed.parseStatus,
      matcherCase: "CASE_4",
    },
    publishability: posture,
  };
}

export function dedupeLosaSchoolsByCode(schools) {
  const byCode = new Map();
  for (const school of schools) {
    const code = String(school.schoolCode ?? "").trim();
    if (!code) continue;
    if (!byCode.has(code)) {
      byCode.set(code, { ...school });
      continue;
    }
    const existing = byCode.get(code);
    if ((school.schoolName ?? "").length > (existing.schoolName ?? "").length) {
      byCode.set(code, { ...school });
    }
  }
  return Array.from(byCode.values());
}

export function collectLosaSchoolsFromExtractedStages(extractedStages) {
  const stageToSchools = extractedStages ?? {};
  const losaByCode = new Map();

  for (const [stage, schools] of Object.entries(stageToSchools)) {
    for (const school of schools ?? []) {
      const parsed = parseLosaVilbliLabel(school.schoolName);
      if (!parsed.isLosa) continue;

      const code = String(school.schoolCode ?? "").trim();
      if (!code) continue;

      const existing = losaByCode.get(code);
      if (!existing) {
        losaByCode.set(code, { school, stagesSeen: [stage] });
        continue;
      }

      if (!existing.stagesSeen.includes(stage)) {
        existing.stagesSeen.push(stage);
      }
    }
  }

  return Array.from(losaByCode.values())
    .sort((a, b) =>
      String(a.school.schoolName ?? "").localeCompare(
        String(b.school.schoolName ?? ""),
        "nb"
      )
    )
    .map(({ school, stagesSeen }) =>
      buildLosaFinnmarkManifestRow(school, {
        stagesSeen: stagesSeen.sort(),
        countyCode: "56",
      })
    );
}
