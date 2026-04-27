import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";
import {
  extractVilbliStagesFromHtml,
  resolveStageFromVilbliKurs,
} from "./vilbli-stage-extraction-helper.mjs";
import { spawnSync } from "node:child_process";

const COUNTY_CODE_TO_VILBLI = {
  "03": { slug: "oslo", label: "Oslo" },
  "31": { slug: "ostfold", label: "Ostfold" },
  "32": { slug: "akershus", label: "Akershus" },
  "33": { slug: "buskerud", label: "Buskerud" },
  "34": { slug: "innlandet", label: "Innlandet" },
  "39": { slug: "vestfold", label: "Vestfold" },
  "40": { slug: "telemark", label: "Telemark" },
  "42": { slug: "agder", label: "Agder" },
  "46": { slug: "vestland", label: "Vestland" },
  "50": { slug: "trondelag", label: "Trondelag" },
  "55": { slug: "troms", label: "Troms" },
  "56": { slug: "finnmark", label: "Finnmark" },
  "11": { slug: "rogaland", label: "Rogaland" },
  "15": { slug: "more-og-romsdal", label: "More og Romsdal" },
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

function parseCourseTokensFromHref(href) {
  try {
    const url = new URL(href);
    const kurs = url.searchParams.get("kurs") ?? "";
    return kurs
      .split("_")
      .map((token) => token.trim().toUpperCase())
      .filter(Boolean)
      .filter((token) => token !== "&SIDE=P5");
  } catch {
    return [];
  }
}

function collectRequiredStageNodes(pathDefinition) {
  return (pathDefinition.stageNodes ?? []).filter(
    (node) => node.requiredForWrite && node.stageType === "school_programme"
  );
}

function matchesPathNodeLabel(link, node) {
  const titleNorm = normalizeBasic(link.titleDisplay ?? link.title ?? "");
  const expectedLabelNorm = normalizeBasic(node.expectedLabel ?? "");
  if (expectedLabelNorm && titleNorm === expectedLabelNorm) return true;

  const includesAny = node.programmeMatcher?.includesAny ?? [];
  return includesAny.some((hint) => titleNorm.includes(normalizeBasic(hint)));
}

function pickRequiredLinksByPathDefinition({ schoolProgrammeLinks, requiredNodes }) {
  const selectedByStage = new Map();
  const skipped = [];

  for (const node of requiredNodes) {
    const stageLinks = schoolProgrammeLinks.filter(
      (link) => String(link.stage ?? "").toUpperCase() === String(node.stage ?? "").toUpperCase()
    );
    const matched = stageLinks.filter((link) => matchesPathNodeLabel(link, node));
    if (matched.length === 0) continue;
    const selected = matched.sort((a, b) => a.titleDisplay.localeCompare(b.titleDisplay))[0];
    selectedByStage.set(node.stage, selected);
  }

  for (const link of schoolProgrammeLinks) {
    const stage = String(link.stage ?? "").toUpperCase();
    if (!requiredNodes.some((node) => node.stage === stage)) continue;
    const selected = selectedByStage.get(stage);
    if (!selected || selected.href !== link.href) {
      skipped.push({
        stage,
        title: link.titleDisplay,
        href: link.href,
        skipReason: "not_path_relevant_sibling",
      });
    }
  }

  return { selectedByStage, skipped };
}

function allowContinuationLinks({ schoolProgrammeLinks, requiredNodes, selectedByStage }) {
  const requiredStages = new Set(requiredNodes.map((node) => String(node.stage ?? "").toUpperCase()));
  const selectedTokens = new Set();
  for (const selected of selectedByStage.values()) {
    for (const token of parseCourseTokensFromHref(selected.href)) {
      selectedTokens.add(token);
    }
  }

  const allowed = [];
  const skipped = [];
  for (const link of schoolProgrammeLinks) {
    const stage = String(link.stage ?? "").toUpperCase();
    if (requiredStages.has(stage)) continue;

    const tokens = parseCourseTokensFromHref(link.href);
    const hasRequiredChainTokens =
      selectedTokens.size === 0 ||
      Array.from(selectedTokens).every((token) => tokens.includes(token));

    if (hasRequiredChainTokens) {
      allowed.push(link);
    } else {
      skipped.push({
        stage,
        title: link.titleDisplay,
        href: link.href,
        skipReason: "not_path_relevant_sibling",
      });
    }
  }
  return { allowed, skipped };
}

function slugify(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function deterministicProgrammeIdentity({ professionSlug, countySlug, stage, titleDisplay }) {
  const stageToken = String(stage ?? "VGX").toUpperCase();
  const titleToken = slugify(titleDisplay).slice(0, 48) || "programme";
  const slug = `${professionSlug}-${stageToken.toLowerCase()}-${titleToken}-${countySlug}`.slice(0, 96);
  return { slug };
}

function runNodeScript(scriptPath, args) {
  const result = spawnSync("node", [scriptPath, ...args], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf-8",
  });
  if (result.status !== 0) {
    throw new Error(
      `Script failed: node ${scriptPath} ${args.join(" ")}\n${result.stderr || result.stdout}`
    );
  }
  return JSON.parse(result.stdout.trim());
}

async function ensureAvailabilityHasIsActive(supabase) {
  const { error } = await supabase.from("programme_school_availability").select("is_active").limit(1);
  if (error) {
    throw new Error("ABORT: programme_school_availability.is_active is required for safe cleanup");
  }
}

async function buildExpectedTruthSet({ supabase, professionSlug, countyCode }) {
  const pathDefinition = getVgsPathDefinition(professionSlug);
  if (!pathDefinition) {
    throw new Error(`No path definition for profession: ${professionSlug}`);
  }
  const countyMeta = COUNTY_CODE_TO_VILBLI[countyCode];
  if (!countyMeta) {
    throw new Error(`Unsupported county code: ${countyCode}`);
  }

  const sourceUrl = pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);
  const sourceResponse = await fetch(sourceUrl, { headers: { "user-agent": "Mozilla/5.0" } });
  if (!sourceResponse.ok) {
    throw new Error(`ABORT: Vilbli extraction failed with status ${sourceResponse.status}`);
  }
  const sourceHtml = await sourceResponse.text();
  const extracted = extractVilbliStagesFromHtml({
    html: sourceHtml,
    countySlug: countyMeta.slug,
    countyLabel: countyMeta.label,
  });

  const extractedStages = extracted.extractedStages;
  const schoolProgrammeLinks = extracted.schoolProgrammeLinks ?? [];
  const requiredNodes = collectRequiredStageNodes(pathDefinition);

  const routeCandidateLinks = schoolProgrammeLinks.filter((link) => !link.excluded);
  const excludedProgrammes = schoolProgrammeLinks
    .filter((link) => link.excluded)
    .map((entry) => ({
      stage: entry.stage,
      title: entry.titleDisplay,
      skipReason: entry.skipReason,
    }));

  const requiredSelection = pickRequiredLinksByPathDefinition({
    schoolProgrammeLinks: routeCandidateLinks,
    requiredNodes,
  });
  const continuationSelection = allowContinuationLinks({
    schoolProgrammeLinks: routeCandidateLinks,
    requiredNodes,
    selectedByStage: requiredSelection.selectedByStage,
  });
  const includedProgrammeLinks = Array.from(
    new Map(
      [
        ...Array.from(requiredSelection.selectedByStage.values()),
        ...continuationSelection.allowed,
      ].map((link) => [link.href, link])
    ).values()
  );
  const skippedProgrammes = [...requiredSelection.skipped, ...continuationSelection.skipped];

  const expandedStageEntries = [];
  const skippedNoSchoolAvailability = [];
  for (const link of includedProgrammeLinks) {
    const programmeResponse = await fetch(link.href, { headers: { "user-agent": "Mozilla/5.0" } });
    if (!programmeResponse.ok) {
      throw new Error(`ABORT: Failed to fetch programme page ${link.href} (${programmeResponse.status})`);
    }
    const programmeHtml = await programmeResponse.text();
    const extractedProgramme = extractVilbliStagesFromHtml({
      html: programmeHtml,
      countySlug: countyMeta.slug,
      countyLabel: countyMeta.label,
    });

    const stageFromKurs = resolveStageFromVilbliKurs(link.href);
    const stageHint = String(link.stage ?? "").toUpperCase();
    const stageCandidates = Object.entries(extractedProgramme.extractedStages)
      .filter(([_, schools]) => Array.isArray(schools) && schools.length > 0)
      .map(([stage]) => stage.toUpperCase());
    let resolvedStage = null;
    if (stageFromKurs && stageCandidates.includes(stageFromKurs)) {
      resolvedStage = stageFromKurs;
    } else if (stageFromKurs) {
      resolvedStage = stageFromKurs;
    } else if (stageHint && stageCandidates.includes(stageHint)) {
      resolvedStage = stageHint;
    } else if (stageCandidates.length === 1) {
      resolvedStage = stageCandidates[0];
    }
    if (!resolvedStage) {
      throw new Error(
        `ABORT: Unable to confidently resolve stage for programme page ${link.href}. stageFromKurs=${
          stageFromKurs ?? "null"
        }, stageHint=${stageHint || "null"}, stageCandidates=${stageCandidates.join(",") || "none"}`
      );
    }

    const resolvedSchools = extractedProgramme.extractedStages[resolvedStage] ?? [];
    if (resolvedSchools.length === 0) {
      skippedNoSchoolAvailability.push({
        stage: resolvedStage,
        title: link.titleDisplay,
        href: link.href,
        skipReason: "no_school_availability_for_resolved_stage",
      });
      continue;
    }

    expandedStageEntries.push({
      stage: resolvedStage,
      titleDisplay: link.titleDisplay,
      href: link.href,
      schools: resolvedSchools,
    });
  }

  const uniqueExtractedSchools = Array.from(
    new Map(
      [
        ...Object.values(extractedStages).flat(),
        ...expandedStageEntries.flatMap((entry) => entry.schools),
      ].map((school) => [school.schoolCode, school])
    ).values()
  );

  const { data: nsrInstitutions, error: nsrError } = await supabase
    .from("education_institutions")
    .select("id, name, municipality_code")
    .eq("county_code", countyCode)
    .eq("source", "nsr")
    .eq("is_active", true);
  if (nsrError) throw nsrError;

  const matchedBySchoolCode = new Map();
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
      ambiguousMatches.push({ schoolCode: school.schoolCode, schoolName: school.schoolName });
      continue;
    }

    matchedBySchoolCode.set(school.schoolCode, {
      institutionId: best.institution.id,
      municipalityCode: best.institution.municipality_code ?? null,
    });
  }

  if (unmatchedSchools.length > 0 || ambiguousMatches.length > 0) {
    throw new Error(
      `ABORT: School matching not clean. unmatched=${unmatchedSchools.length}, ambiguous=${ambiguousMatches.length}`
    );
  }

  const readiness = runNodeScript("scripts/classify-vgs-truth-readiness.mjs", [
    "--profession",
    professionSlug,
    "--county",
    countyCode,
  ]);
  const readinessProgrammes = readiness.details?.linkedProgrammes ?? [];

  const requiredProgrammesByStage = new Map();
  for (const node of requiredNodes) {
    const candidates = readinessProgrammes.filter((programme) => programme.nodeKey === node.nodeKey);
    if (candidates.length === 0) {
      throw new Error(`ABORT: Missing programme candidate for required node ${node.nodeKey}`);
    }
    const selected = [...candidates].sort((a, b) => {
      const aNoInstitution = a.institutionId ? 1 : 0;
      const bNoInstitution = b.institutionId ? 1 : 0;
      if (aNoInstitution !== bNoInstitution) return aNoInstitution - bNoInstitution;
      const aCountySlug = String(a.slug ?? "").includes(`-${countyMeta.slug}`) ? 0 : 1;
      const bCountySlug = String(b.slug ?? "").includes(`-${countyMeta.slug}`) ? 0 : 1;
      if (aCountySlug !== bCountySlug) return aCountySlug - bCountySlug;
      const aExpected = normalizeBasic(a.title ?? "") === normalizeBasic(node.expectedLabel ?? "") ? 0 : 1;
      const bExpected = normalizeBasic(b.title ?? "") === normalizeBasic(node.expectedLabel ?? "") ? 0 : 1;
      if (aExpected !== bExpected) return aExpected - bExpected;
      return String(a.slug ?? "").localeCompare(String(b.slug ?? ""));
    })[0];
    requiredProgrammesByStage.set(node.stage, selected);
  }

  const expectedRows = [];
  for (const [stage, schools] of Object.entries(extractedStages)) {
    if (!requiredProgrammesByStage.has(stage)) continue;
    const programme = requiredProgrammesByStage.get(stage);
    for (const school of schools) {
      const matched = matchedBySchoolCode.get(school.schoolCode);
      if (!matched) {
        throw new Error(`ABORT: Missing matched NSR institution for schoolCode=${school.schoolCode}`);
      }
      expectedRows.push({
        slug: programme.slug,
        stage,
        institutionId: matched.institutionId,
      });
    }
  }

  for (const entry of expandedStageEntries) {
    const identity = deterministicProgrammeIdentity({
      professionSlug,
      countySlug: countyMeta.slug,
      stage: entry.stage,
      titleDisplay: entry.titleDisplay,
    });
    for (const school of entry.schools) {
      const matched = matchedBySchoolCode.get(school.schoolCode);
      if (!matched) {
        throw new Error(`ABORT: Missing matched NSR institution for schoolCode=${school.schoolCode}`);
      }
      expectedRows.push({
        slug: identity.slug,
        stage: entry.stage,
        institutionId: matched.institutionId,
      });
    }
  }

  return {
    countyCode,
    countySlug: countyMeta.slug,
    expectedActiveSlugs: Array.from(new Set(expectedRows.map((row) => row.slug))).sort(),
    expectedRowKeys: new Set(
      expectedRows.map((row) => `${row.slug}::${row.institutionId}::${String(row.stage).toUpperCase()}`)
    ),
    excludedProgrammes,
    skippedProgrammes,
    skippedNoSchoolAvailability,
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
  const countiesRaw = String(args.counties ?? "").trim();
  const countyCodes = countiesRaw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (!professionSlug || countyCodes.length === 0) {
    throw new Error(
      "Usage: node scripts/cleanup-vgs-truth-contamination.mjs --profession electrician --counties 03,46,50"
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  await ensureAvailabilityHasIsActive(supabase);

  const summaries = [];
  for (const countyCode of countyCodes) {
    const expected = await buildExpectedTruthSet({
      supabase,
      professionSlug,
      countyCode,
    });

    const { data: links, error: linksError } = await supabase
      .from("profession_program_links")
      .select("id, program_slug, note")
      .eq("profession_slug", professionSlug);
    if (linksError) throw linksError;
    const linkRows = links ?? [];
    const linkSlugs = Array.from(new Set(linkRows.map((row) => row.program_slug).filter(Boolean)));

    const { data: programs, error: programsError } = linkSlugs.length
      ? await supabase
          .from("education_programs")
          .select("id, slug")
          .in("slug", linkSlugs)
      : { data: [], error: null };
    if (programsError) throw programsError;
    const programById = new Map((programs ?? []).map((row) => [row.id, row]));
    const programIdBySlug = new Map((programs ?? []).map((row) => [row.slug, row.id]));
    const linkedProgramIds = (programs ?? []).map((row) => row.id);

    const { data: activeAvailability, error: activeAvailabilityError } = linkedProgramIds.length
      ? await supabase
          .from("programme_school_availability")
          .select("id, education_program_id, institution_id, stage, is_active")
          .in("education_program_id", linkedProgramIds)
          .eq("county_code", countyCode)
          .eq("source", "vilbli")
          .eq("is_active", true)
      : { data: [], error: null };
    if (activeAvailabilityError) throw activeAvailabilityError;

    const toDeactivateIds = [];
    for (const row of activeAvailability ?? []) {
      const slug = programById.get(row.education_program_id)?.slug;
      if (!slug) continue;
      const key = `${slug}::${row.institution_id}::${String(row.stage ?? "").toUpperCase()}`;
      if (!expected.expectedRowKeys.has(key)) {
        toDeactivateIds.push(row.id);
      }
    }

    let deactivatedAvailabilityRows = 0;
    if (toDeactivateIds.length > 0) {
      const { data, error } = await supabase
        .from("programme_school_availability")
        .update({ is_active: false })
        .in("id", toDeactivateIds)
        .select("id");
      if (error) throw error;
      deactivatedAvailabilityRows = (data ?? []).length;
    }

    const generatedCountyScopedLinks = linkRows.filter((row) => {
      const isGenerated = String(row.note ?? "").toLowerCase().startsWith("materialized from vilbli");
      if (!isGenerated) return false;
      if (String(row.program_slug).includes(`-${expected.countySlug}`)) return true;
      return false;
    });
    const staleLinksToRemove = generatedCountyScopedLinks.filter(
      (row) => !expected.expectedActiveSlugs.includes(row.program_slug)
    );

    let removedStaleLinks = 0;
    if (staleLinksToRemove.length > 0) {
      const { data, error } = await supabase
        .from("profession_program_links")
        .delete()
        .in(
          "id",
          staleLinksToRemove.map((row) => row.id)
        )
        .select("id");
      if (error) throw error;
      removedStaleLinks = (data ?? []).length;
    }

    const expectedProgramIds = expected.expectedActiveSlugs
      .map((slug) => programIdBySlug.get(slug))
      .filter(Boolean);
    const { data: duplicateRows, error: duplicateError } = expectedProgramIds.length
      ? await supabase
          .from("programme_school_availability")
          .select("stage, institution_id")
          .in("education_program_id", expectedProgramIds)
          .eq("county_code", countyCode)
          .eq("source", "vilbli")
          .eq("is_active", true)
      : { data: [], error: null };
    if (duplicateError) throw duplicateError;

    const duplicateCounter = new Map();
    for (const row of duplicateRows ?? []) {
      const key = `${String(row.stage ?? "").toUpperCase()}::${row.institution_id}`;
      duplicateCounter.set(key, (duplicateCounter.get(key) ?? 0) + 1);
    }
    const duplicates = Array.from(duplicateCounter.entries())
      .filter(([, count]) => count > 1)
      .map(([key, count]) => ({ key, count }));

    summaries.push({
      county: countyCode,
      expectedActiveSlugs: expected.expectedActiveSlugs,
      deactivatedAvailabilityRows,
      removedStaleLinks,
      skippedOrExcludedProgrammes: {
        excluded: expected.excludedProgrammes,
        skippedSiblings: expected.skippedProgrammes,
        skippedNoSchoolAvailability: expected.skippedNoSchoolAvailability,
      },
      duplicateCheck: {
        duplicateStageInstitutionPairs: duplicates,
        hasDuplicates: duplicates.length > 0,
      },
    });
  }

  console.log(
    JSON.stringify(
      {
        professionSlug,
        counties: countyCodes,
        summary: summaries,
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error(`Cleanup failed: ${error.message}`);
  process.exit(1);
});
