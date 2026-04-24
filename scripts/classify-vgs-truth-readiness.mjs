import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import { getVgsPathDefinition, mapProgrammeToPathNode } from "./vgs-path-definitions.mjs";
import { extractVilbliStagesFromHtml } from "./vilbli-stage-extraction-helper.mjs";

const READYNESS_STATUSES = {
  READY_FOR_WRITE: "ready_for_write",
  MISSING_PROGRAMME_ROWS: "missing_programme_rows",
  MISSING_PROFESSION_LINKS: "missing_profession_links",
  CANONICAL_MATCHING_REVIEW: "canonical_matching_review",
  SOURCE_EXTRACTION_FAILED: "source_extraction_failed",
  VERIFICATION_READY_AFTER_WRITE: "verification_ready_after_write",
};

const COUNTY_CODE_TO_VILBLI = {
  "03": { slug: "oslo", label: "Oslo" },
  "31": { slug: "ostfold", label: "Østfold" },
  "32": { slug: "akershus", label: "Akershus" },
  "33": { slug: "buskerud", label: "Buskerud" },
  "34": { slug: "innlandet", label: "Innlandet" },
  "39": { slug: "vestfold", label: "Vestfold" },
  "40": { slug: "telemark", label: "Telemark" },
  "42": { slug: "agder", label: "Agder" },
  "46": { slug: "vestland", label: "Vestland" },
  "50": { slug: "trondelag", label: "Trøndelag" },
  "55": { slug: "troms", label: "Troms" },
  "56": { slug: "finnmark", label: "Finnmark" },
  "11": { slug: "rogaland", label: "Rogaland" },
  "15": { slug: "more-og-romsdal", label: "Møre og Romsdal" },
  "18": { slug: "nordland", label: "Nordland" },
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = "true";
      continue;
    }
    args[key] = next;
    i += 1;
  }
  return args;
}

function normalizeBasic(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSchoolName(value) {
  return normalizeBasic(value)
    .replace(/\bvideregaende skole\b/g, " ")
    .replace(/\bvideregande skule\b/g, " ")
    .replace(/\bvidaregaande skule\b/g, " ")
    .replace(/\bvgs\b/g, " ")
    .replace(/\bas\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyInstitutionMatch(vilbliName, institutionName) {
  const vilbliNorm = normalizeSchoolName(vilbliName);
  const nsrNorm = normalizeSchoolName(institutionName);

  if (vilbliNorm && nsrNorm && vilbliNorm === nsrNorm) {
    return { matchType: "exact_normalized", score: 1 };
  }

  const vilbliCore = vilbliNorm.replace(/\bavd\b.*$/, "").trim();
  const nsrCore = nsrNorm.replace(/\bavd\b.*$/, "").trim();
  if (vilbliCore && nsrCore && vilbliCore === nsrCore) {
    return { matchType: "core_name_match", score: 0.9 };
  }

  const vt = vilbliNorm.split(" ").filter(Boolean);
  const nt = nsrNorm.split(" ").filter(Boolean);
  const sharedTokens = vt.filter((token) => token.length >= 4 && nt.includes(token)).length;
  if (sharedTokens >= 2) {
    return { matchType: "fallback_fuzzy", score: 0.6 };
  }

  return { matchType: "none", score: 0 };
}

function summarizeByVerification(rows) {
  return rows.reduce((acc, row) => {
    const key = row.verification_status ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function chooseStatus(params) {
  if (params.sourceExtractionFailed) {
    return READYNESS_STATUSES.SOURCE_EXTRACTION_FAILED;
  }
  if (params.missingProfessionLinks) {
    return READYNESS_STATUSES.MISSING_PROFESSION_LINKS;
  }
  if (params.missingProgrammeRows.length > 0) {
    return READYNESS_STATUSES.MISSING_PROGRAMME_ROWS;
  }
  if (params.unmatchedSchools.length > 0 || params.ambiguousMatches.length > 0) {
    return READYNESS_STATUSES.CANONICAL_MATCHING_REVIEW;
  }
  if (params.writeReady && params.utdanningReady) {
    return READYNESS_STATUSES.VERIFICATION_READY_AFTER_WRITE;
  }
  if (params.writeReady) {
    return READYNESS_STATUSES.READY_FOR_WRITE;
  }
  return READYNESS_STATUSES.SOURCE_EXTRACTION_FAILED;
}

function countyTokenFromMeta(countyMeta) {
  return String(countyMeta?.slug ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_");
}

function isCountyScopedMaterializedProgramme({
  program,
  countyMeta,
  pathNode,
}) {
  if (!pathNode) return false;
  const slug = String(program.slug ?? "").toLowerCase();
  const countySlug = String(countyMeta?.slug ?? "").toLowerCase();
  const programCode = String(program.program_code ?? "").toUpperCase();
  const countyToken = countyTokenFromMeta(countyMeta);

  if (!countySlug) return false;

  const stage = pathNode.stage;
  if (stage === "VG1") {
    const slugMatch = slug === `electrician-vg1-elektro-${countySlug}`;
    const codeMatch = programCode === `EL-VG1-${countyToken}`;
    return slugMatch || codeMatch;
  }

  if (stage === "VG2") {
    const slugMatch = slug === `electrician-vg2-elenergi-${countySlug}`;
    const codeMatch = programCode === `EL-VG2-${countyToken}`;
    return slugMatch || codeMatch;
  }

  return false;
}

async function classifyReadiness({ professionSlug, countyCode }) {
  const countyMeta = COUNTY_CODE_TO_VILBLI[countyCode] ?? null;
  const pathDefinition = getVgsPathDefinition(professionSlug);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: links, error: linksError } = await supabase
    .from("profession_program_links")
    .select("program_slug, fit_band")
    .eq("profession_slug", professionSlug);
  if (linksError) throw linksError;

  const linkedProgramSlugs = Array.from(
    new Set((links ?? []).map((row) => row.program_slug).filter(Boolean))
  );
  const missingProfessionLinks = linkedProgramSlugs.length === 0;

  const { data: linkedPrograms, error: linkedProgramsError } = linkedProgramSlugs.length
    ? await supabase
        .from("education_programs")
        .select("id, slug, title, program_code, institution_id, is_active")
        .in("slug", linkedProgramSlugs)
        .eq("is_active", true)
    : { data: [], error: null };
  if (linkedProgramsError) throw linkedProgramsError;

  const linkedInstitutionIds = Array.from(
    new Set((linkedPrograms ?? []).map((row) => row.institution_id).filter(Boolean))
  );
  const { data: linkedInstitutions, error: linkedInstitutionsError } = linkedInstitutionIds.length
    ? await supabase
        .from("education_institutions")
        .select("id, name, county_code, municipality_name")
        .in("id", linkedInstitutionIds)
    : { data: [], error: null };
  if (linkedInstitutionsError) throw linkedInstitutionsError;

  const linkedInstitutionById = new Map((linkedInstitutions ?? []).map((row) => [row.id, row]));
  const linkedProgrammesForCounty = (linkedPrograms ?? []).map((program) => {
    const institution = linkedInstitutionById.get(program.institution_id) ?? null;
    const pathNode = pathDefinition ? mapProgrammeToPathNode(program, pathDefinition) : null;
    const hasInstitutionCountyMatch = institution?.county_code === countyCode;
    const hasCountyScopedMaterializedMatch = isCountyScopedMaterializedProgramme({
      program,
      countyMeta,
      pathNode,
    });

    return {
      ...program,
      institution,
      pathNode,
      includedForCounty: hasInstitutionCountyMatch || hasCountyScopedMaterializedMatch,
    };
  })
  .filter((program) => program.includedForCounty);

  const requiredPathNodes = (pathDefinition?.stageNodes ?? []).filter(
    (node) => node.requiredForWrite
  );
  const linkedByNodeKey = linkedProgrammesForCounty.reduce((acc, program) => {
    const key = program.pathNode?.nodeKey;
    if (!key) return acc;
    if (!acc.has(key)) {
      acc.set(key, []);
    }
    acc.get(key).push(program);
    return acc;
  }, new Map());

  const missingPathNodes = requiredPathNodes
    .filter((node) => !linkedByNodeKey.has(node.nodeKey))
    .map((node) => ({
      nodeKey: node.nodeKey,
      stage: node.stage,
      branchKey: node.branchKey ?? null,
      reason: "no linked programme rows for required path node in county",
    }));

  const missingProgrammeRows = missingPathNodes.map((node) => node.stage);

  let sourceExtractionFailed = false;
  let extractedStages = {};
  let extractedSchoolCounts = {};
  let uniqueExtractedSchools = [];
  let sourceUrl = null;

  if (!pathDefinition || !countyMeta) {
    sourceExtractionFailed = true;
  } else {
    sourceUrl = pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);
    try {
      const response = await fetch(sourceUrl, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        },
      });
      const html = await response.text();
      if (!response.ok) {
        sourceExtractionFailed = true;
      } else {
        const extracted = extractVilbliStagesFromHtml({
          html,
          countySlug: countyMeta.slug,
          countyLabel: countyMeta.label,
        });
        extractedStages = extracted.extractedStages;
        extractedSchoolCounts = Object.fromEntries(
          Object.entries(extractedStages).map(([stage, schools]) => [stage, schools.length])
        );
        uniqueExtractedSchools = Array.from(
          new Map(
            Object.values(extractedStages)
              .flat()
              .map((school) => [school.schoolCode, school])
          ).values()
        );
        if (uniqueExtractedSchools.length === 0) {
          sourceExtractionFailed = true;
        }
      }
    } catch {
      sourceExtractionFailed = true;
    }
  }

  const { data: nsrInstitutions, error: nsrError } = await supabase
    .from("education_institutions")
    .select("id, name, county_code, source")
    .eq("county_code", countyCode)
    .eq("source", "nsr")
    .eq("is_active", true);
  if (nsrError) throw nsrError;

  const matchedSchools = [];
  const unmatchedSchools = [];
  const ambiguousMatches = [];
  for (const school of uniqueExtractedSchools) {
    const ranked = (nsrInstitutions ?? [])
      .map((institution) => ({
        institution,
        ...classifyInstitutionMatch(school.schoolName, institution.name),
      }))
      .filter((candidate) => candidate.matchType !== "none")
      .sort((a, b) => b.score - a.score || a.institution.name.localeCompare(b.institution.name));

    if (ranked.length === 0) {
      unmatchedSchools.push(school);
      continue;
    }

    const best = ranked[0];
    const ties = ranked.filter((candidate) => candidate.score === best.score);
    if (ties.length > 1) {
      ambiguousMatches.push({
        school,
        candidates: ties.slice(0, 3).map((tie) => ({
          institutionId: tie.institution.id,
          institutionName: tie.institution.name,
          matchType: tie.matchType,
          score: tie.score,
        })),
      });
    }

    matchedSchools.push({
      schoolCode: school.schoolCode,
      schoolName: school.schoolName,
      institutionId: best.institution.id,
      institutionName: best.institution.name,
      matchType: best.matchType,
      score: best.score,
    });
  }

  const linkedProgrammeIds = (linkedProgrammesForCounty ?? []).map((program) => program.id);
  const { data: existingAvailability, error: existingAvailabilityError } = linkedProgrammeIds.length
    ? await supabase
        .from("programme_school_availability")
        .select("education_program_id, institution_id, stage, verification_status")
        .in("education_program_id", linkedProgrammeIds)
        .eq("county_code", countyCode)
        .eq("is_active", true)
    : { data: [], error: null };
  if (existingAvailabilityError) throw existingAvailabilityError;

  const writeReady =
    !sourceExtractionFailed &&
    !missingProfessionLinks &&
    missingPathNodes.length === 0 &&
    unmatchedSchools.length === 0 &&
    ambiguousMatches.length === 0 &&
    matchedSchools.length > 0;

  const utdanningChecks = [];
  for (const school of uniqueExtractedSchools) {
    const url = `https://utdanning.no/org/vilbli_no_adr_${school.schoolCode}`;
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0" },
      });
      const body = await response.text();
      const discoverable = response.status === 200;
      const likelyUsable = discoverable && /utdanningstilbud|fagtilbud|skole/i.test(body);
      utdanningChecks.push({
        schoolCode: school.schoolCode,
        schoolName: school.schoolName,
        url,
        status: response.status,
        discoverable,
        likelyUsable,
      });
    } catch (error) {
      utdanningChecks.push({
        schoolCode: school.schoolCode,
        schoolName: school.schoolName,
        url,
        status: null,
        discoverable: false,
        likelyUsable: false,
        error: error.message,
      });
    }
  }
  const utdanningReady =
    utdanningChecks.length > 0 &&
    utdanningChecks.every((check) => check.discoverable && check.likelyUsable);

  const status = chooseStatus({
    sourceExtractionFailed,
    missingProfessionLinks,
    missingProgrammeRows,
    unmatchedSchools,
    ambiguousMatches,
    writeReady,
    utdanningReady,
  });

  const stageReadiness = (pathDefinition?.stageNodes ?? []).map((node) => {
    const linkedForNode = linkedByNodeKey.get(node.nodeKey) ?? [];
    const extractedCount = Number(extractedSchoolCounts[node.stage] ?? 0);
    const isRequired = Boolean(node.requiredForWrite);

    let nodeStatus = "informational";
    if (isRequired) {
      nodeStatus = linkedForNode.length > 0 ? "ready" : "missing_programme_rows";
    } else if (node.stageType === "progression" || node.stageType === "progression_outcome") {
      nodeStatus = "modeled_progression";
    } else if (node.stageType === "awareness_only") {
      nodeStatus = "awareness";
    }

    return {
      nodeKey: node.nodeKey,
      stage: node.stage,
      stageType: node.stageType,
      branchSpecific: node.branchSpecific,
      branchKey: node.branchKey ?? null,
      requiredForWrite: isRequired,
      expectedLabel: node.expectedLabel ?? null,
      status: nodeStatus,
      linkedProgrammes: linkedForNode.map((program) => ({
        id: program.id,
        slug: program.slug,
        title: program.title,
        programCode: program.program_code,
        institutionId: program.institution_id,
        institutionName: program.institution?.name ?? null,
      })),
      extractedSchoolCount: extractedCount,
    };
  });

  return {
    professionSlug,
    countyCode,
    status,
    pathDefinition: pathDefinition
      ? {
          professionSlug: pathDefinition.professionSlug,
          contour: pathDefinition.contour,
          description: pathDefinition.description,
          stageNodes: pathDefinition.stageNodes.map((node) => ({
            nodeKey: node.nodeKey,
            stage: node.stage,
            stageType: node.stageType,
            branchSpecific: node.branchSpecific,
            requiredForWrite: node.requiredForWrite,
            branchKey: node.branchKey ?? null,
            expectedLabel: node.expectedLabel ?? null,
          })),
        }
      : null,
    details: {
      sourceUrl,
      stageReadiness,
      linkedProgrammes: linkedProgrammesForCounty.map((program) => ({
        id: program.id,
        slug: program.slug,
        title: program.title,
        programCode: program.program_code,
        stage: program.pathNode?.stage ?? null,
        nodeKey: program.pathNode?.nodeKey ?? null,
        branchKey: program.pathNode?.branchKey ?? null,
        institutionId: program.institution_id,
        institutionName: program.institution?.name ?? null,
      })),
      missingProgrammeRows,
      missingPathNodes,
      missingProfessionLinks,
      extractedStages: Object.fromEntries(
        Object.entries(extractedStages).map(([stage, schools]) => [
          stage,
          schools.map((school) => ({
            schoolName: school.schoolName,
            schoolCode: school.schoolCode,
            schoolType: school.schoolType,
          })),
        ])
      ),
      extractedSchoolCounts,
      matchedSchools,
      unmatchedSchools,
      ambiguousMatches,
      writeReadiness: {
        ready: writeReady,
        requiredPathNodes: requiredPathNodes.map((node) => node.nodeKey),
        existingAvailabilityRows: (existingAvailability ?? []).length,
        existingAvailabilityVerificationSummary: summarizeByVerification(existingAvailability ?? []),
      },
      utdanningReady,
      utdanningChecksSummary: {
        total: utdanningChecks.length,
        discoverableYes: utdanningChecks.filter((check) => check.discoverable).length,
        likelyUsableYes: utdanningChecks.filter((check) => check.likelyUsable).length,
      },
    },
  };
}

async function run() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  const args = parseArgs(process.argv.slice(2));
  const professionSlug = String(args.profession ?? "").trim();
  const countyCode = String(args.county ?? "").trim();

  if (!professionSlug || !countyCode) {
    throw new Error(
      "Usage: node scripts/classify-vgs-truth-readiness.mjs --profession electrician --county 46"
    );
  }

  const result = await classifyReadiness({ professionSlug, countyCode });
  console.log(JSON.stringify(result, null, 2));
}

run().catch((error) => {
  console.error("Readiness classification failed:", error.message);
  process.exit(1);
});
