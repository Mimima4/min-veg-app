import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import { spawnSync } from "node:child_process";
import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";
import {
  extractVilbliStagesFromHtml,
  resolveStageFromVilbliKurs,
} from "./vilbli-stage-extraction-helper.mjs";

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

const GREEN_READINESS_STATUSES = new Set(["ready_for_write", "verification_ready_after_write"]);
const SOURCE = "vilbli";
const AVAILABILITY_SCOPE = "programme_in_school";
const VERIFICATION_STATUS = "needs_review";

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
  const output = result.stdout.trim();
  return JSON.parse(output);
}

async function upsertAvailabilityRow(supabase, payload) {
  const { data: existing, error: existingError } = await supabase
    .from("programme_school_availability")
    .select("id")
    .eq("education_program_id", payload.education_program_id)
    .eq("institution_id", payload.institution_id)
    .eq("county_code", payload.county_code)
    .eq("stage", payload.stage)
    .eq("source", payload.source)
    .limit(1)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("programme_school_availability")
      .update({
        ...payload,
        first_seen_at: undefined,
      })
      .eq("id", existing.id);
    if (updateError) throw updateError;
    return "updated";
  }

  const { error: insertError } = await supabase
    .from("programme_school_availability")
    .insert(payload);
  if (insertError) throw insertError;
  return "inserted";
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
  if (expectedLabelNorm && titleNorm === expectedLabelNorm) {
    return true;
  }

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
    if (!selected) {
      skipped.push({
        stage,
        title: link.titleDisplay,
        href: link.href,
        skipReason: "not_path_relevant_sibling",
      });
      continue;
    }
    if (selected.href !== link.href) {
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

function countyProgramCodeToken(countyMeta) {
  return slugify(String(countyMeta?.slug ?? ""))
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_");
}

function deterministicProgrammeIdentity({
  professionSlug,
  countySlug,
  stage,
  titleDisplay,
}) {
  const stageToken = String(stage ?? "VGX").toUpperCase();
  const titleToken = slugify(titleDisplay).slice(0, 48) || "programme";
  const slug = `${professionSlug}-${stageToken.toLowerCase()}-${titleToken}-${countySlug}`.slice(0, 96);
  const code = `${slugify(professionSlug).slice(0, 8).toUpperCase()}-${stageToken}-${slugify(
    countySlug
  )
    .toUpperCase()
    .slice(0, 16)}-${titleToken.toUpperCase().slice(0, 24)}`.slice(0, 64);
  return { slug, programCode: code };
}

async function upsertEducationProgrammeByIdentity(supabase, spec) {
  const { data: existing, error: existingError } = await supabase
    .from("education_programs")
    .select("id, slug, program_code")
    .or(`slug.eq.${spec.slug},program_code.eq.${spec.programCode}`)
    .limit(1)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("education_programs")
      .update({
        slug: spec.slug,
        program_code: spec.programCode,
        title: spec.title,
        education_level: "upper_secondary",
        study_mode: "full_time",
        is_active: true,
      })
      .eq("id", existing.id);
    if (updateError) throw updateError;
    return { id: existing.id, action: "updated" };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("education_programs")
    .insert({
      slug: spec.slug,
      program_code: spec.programCode,
      title: spec.title,
      education_level: "upper_secondary",
      study_mode: "full_time",
      is_active: true,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;
  return { id: inserted.id, action: "inserted" };
}

async function ensureProfessionProgrammeLink(supabase, professionSlug, programSlug) {
  const { data: existing, error: existingError } = await supabase
    .from("profession_program_links")
    .select("id")
    .eq("profession_slug", professionSlug)
    .eq("program_slug", programSlug)
    .limit(1)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing?.id) return "kept";

  const { error: insertError } = await supabase.from("profession_program_links").insert({
    profession_slug: professionSlug,
    program_slug: programSlug,
    fit_band: "strong",
    note: "Materialized from Vilbli school-based stage programme (generic pipeline).",
  });
  if (insertError) throw insertError;
  return "inserted";
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
      "Usage: node scripts/run-vgs-truth-pipeline.mjs --profession electrician --county 50"
    );
  }

  const pathDefinition = getVgsPathDefinition(professionSlug);
  if (!pathDefinition) {
    throw new Error(`No path definition for profession: ${professionSlug}`);
  }
  const countyMeta = COUNTY_CODE_TO_VILBLI[countyCode];
  if (!countyMeta) {
    throw new Error(`Unsupported county code: ${countyCode}`);
  }
  const sourceUrl = pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);

  // 1) Load/extract Vilbli structure + availability.
  const response = await fetch(sourceUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
  });
  if (!response.ok) {
    throw new Error(`ABORT: Vilbli extraction failed with status ${response.status}`);
  }
  const html = await response.text();
  const extracted = extractVilbliStagesFromHtml({
    html,
    countySlug: countyMeta.slug,
    countyLabel: countyMeta.label,
  });
  const extractedStages = extracted.extractedStages;
  const schoolProgrammeLinks = extracted.schoolProgrammeLinks ?? [];

  const requiredProgrammeNodes = collectRequiredStageNodes(pathDefinition);
  const missingRequiredStages = requiredProgrammeNodes
    .filter((node) => (extractedStages[node.stage] ?? []).length === 0)
    .map((node) => node.stage);
  if (missingRequiredStages.length > 0) {
    throw new Error(
      `ABORT: Missing required extracted stages from Vilbli: ${missingRequiredStages.join(", ")}`
    );
  }

  // Stage expansion: include only path-relevant school-based links.
  const routeCandidateLinks = schoolProgrammeLinks.filter((link) => !link.excluded);
  const excludedProgrammeLinks = schoolProgrammeLinks.filter((link) => link.excluded);
  const requiredSelection = pickRequiredLinksByPathDefinition({
    schoolProgrammeLinks: routeCandidateLinks,
    requiredNodes: requiredProgrammeNodes,
  });
  const continuationSelection = allowContinuationLinks({
    schoolProgrammeLinks: routeCandidateLinks,
    requiredNodes: requiredProgrammeNodes,
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
  const skippedSiblingProgrammeLinks = [
    ...requiredSelection.skipped,
    ...continuationSelection.skipped,
  ];

  const expandedStageEntries = [];
  const skippedNoSchoolAvailability = [];
  for (const link of includedProgrammeLinks) {
    const responseProgramme = await fetch(link.href, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    if (!responseProgramme.ok) {
      throw new Error(`ABORT: Failed to fetch programme page ${link.href} (${responseProgramme.status})`);
    }
    const programmeHtml = await responseProgramme.text();
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
      optionId: link.optionId,
      source: "school_programme_link",
    });
  }

  // 2) Match Vilbli schools to NSR.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const { data: nsrInstitutions, error: nsrError } = await supabase
    .from("education_institutions")
    .select("id, name, county_code, municipality_code, source")
    .eq("county_code", countyCode)
    .eq("source", "nsr")
    .eq("is_active", true);
  if (nsrError) throw nsrError;

  const uniqueExtractedSchools = Array.from(
    new Map(
      Object.values(extractedStages)
        .flat()
        .map((school) => [school.schoolCode, school])
    ).values()
  );

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
    matchedBySchoolCode.set(school.schoolCode, {
      institutionId: best.institution.id,
      institutionMunicipalityCode: best.institution.municipality_code ?? null,
    });

    const ties = ranked.filter((candidate) => candidate.score === best.score);
    if (ties.length > 1) {
      ambiguousMatches.push({
        schoolCode: school.schoolCode,
        schoolName: school.schoolName,
      });
    }
  }

  if (unmatchedSchools.length > 0 || ambiguousMatches.length > 0) {
    throw new Error(
      `ABORT: School matching not clean. unmatched=${unmatchedSchools.length}, ambiguous=${ambiguousMatches.length}`
    );
  }

  // 3) Materialize required VGS programme rows from confirmed Vilbli structure.
  const materializeResult = runNodeScript("scripts/materialize-vgs-programmes-from-vilbli.mjs", [
    "--profession",
    professionSlug,
    "--county",
    countyCode,
  ]);

  // 4) Run readiness gate.
  const readiness = runNodeScript("scripts/classify-vgs-truth-readiness.mjs", [
    "--profession",
    professionSlug,
    "--county",
    countyCode,
  ]);

  if (!GREEN_READINESS_STATUSES.has(readiness.status)) {
    throw new Error(`ABORT: Readiness not green after materialization. status=${readiness.status}`);
  }

  // 3b) Materialize expanded included school-based programme nodes.
  const expandedProgrammeMaterialization = [];
  const expandedProgrammesByStage = new Map();
  for (const entry of expandedStageEntries) {
    const identity = deterministicProgrammeIdentity({
      professionSlug,
      countySlug: countyMeta.slug,
      stage: entry.stage,
      titleDisplay: entry.titleDisplay,
    });
    const programmeResult = await upsertEducationProgrammeByIdentity(supabase, {
      slug: identity.slug,
      programCode: identity.programCode,
      title: entry.titleDisplay,
    });
    const linkAction = await ensureProfessionProgrammeLink(supabase, professionSlug, identity.slug);
    const key = `${entry.stage}::${identity.slug}`;
    if (!expandedProgrammesByStage.has(entry.stage)) {
      expandedProgrammesByStage.set(entry.stage, []);
    }
    expandedProgrammesByStage.get(entry.stage).push({
      key,
      id: programmeResult.id,
      slug: identity.slug,
      programCode: identity.programCode,
      stage: entry.stage,
      title: entry.titleDisplay,
      href: entry.href,
      schools: entry.schools,
    });
    expandedProgrammeMaterialization.push({
      stage: entry.stage,
      title: entry.titleDisplay,
      slug: identity.slug,
      programCode: identity.programCode,
      programmeAction: programmeResult.action,
      linkAction,
    });
  }

  // 5) If readiness green -> write programme_school_availability.
  const readinessProgrammes = readiness.details?.linkedProgrammes ?? [];
  const requiredProgrammesByStage = new Map();
  const countySlugSuffix = `-${countyMeta.slug}`;
  const countyToken = countyProgramCodeToken(countyMeta);
  for (const node of requiredProgrammeNodes) {
    const candidates = readinessProgrammes.filter((programme) => programme.nodeKey === node.nodeKey);
    if (candidates.length === 0) {
      throw new Error(`ABORT: Missing programme candidate for required node ${node.nodeKey}`);
    }
    const countyCanonical = candidates.find((candidate) => {
      const slug = String(candidate.slug ?? "").toLowerCase();
      const programCode = String(candidate.programCode ?? "").toUpperCase();
      return slug.endsWith(countySlugSuffix) || programCode.endsWith(countyToken);
    });
    const preferredBroad = candidates.find(
      (candidate) =>
        candidate.programCode && candidate.programCode.startsWith(`EL-${node.stage.replace("VG", "VG")}-`)
    );
    requiredProgrammesByStage.set(node.stage, countyCanonical ?? preferredBroad ?? candidates[0]);
  }

  const snapshotLabel = `vilbli-${countyMeta.slug}-${professionSlug}-pipeline-${new Date()
    .toISOString()
    .slice(0, 10)}`;
  const writeCounters = { inserted: 0, updated: 0 };
  const writeRows = [];
  for (const [stage, schools] of Object.entries(extractedStages)) {
    if (!requiredProgrammesByStage.has(stage)) continue;
    const programme = requiredProgrammesByStage.get(stage);
    for (const school of schools) {
      const matched = matchedBySchoolCode.get(school.schoolCode);
      if (!matched) {
        throw new Error(`ABORT: Missing matched NSR institution for schoolCode=${school.schoolCode}`);
      }
      const payload = {
        education_program_id: programme.id,
        institution_id: matched.institutionId,
        country_code: "NO",
        county_code: countyCode,
        municipality_code: matched.institutionMunicipalityCode,
        availability_scope: AVAILABILITY_SCOPE,
        stage,
        source: SOURCE,
        source_reference_url: sourceUrl,
        source_snapshot_label: snapshotLabel,
        is_active: true,
        first_seen_at: new Date().toISOString(),
        last_verified_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
        verification_status: VERIFICATION_STATUS,
        notes: null,
      };
      const action = await upsertAvailabilityRow(supabase, payload);
      writeCounters[action] += 1;
      writeRows.push({
        stage,
        schoolCode: school.schoolCode,
        institutionId: matched.institutionId,
        programSlug: programme.slug,
        action,
      });
    }
  }

  // 5b) Write availability for expanded programmes.
  for (const [stage, programmes] of expandedProgrammesByStage.entries()) {
    for (const programme of programmes) {
      for (const school of programme.schools) {
        const matched = matchedBySchoolCode.get(school.schoolCode);
        if (!matched) {
          throw new Error(`ABORT: Missing matched NSR institution for schoolCode=${school.schoolCode}`);
        }
        const payload = {
          education_program_id: programme.id,
          institution_id: matched.institutionId,
          country_code: "NO",
          county_code: countyCode,
          municipality_code: matched.institutionMunicipalityCode,
          availability_scope: AVAILABILITY_SCOPE,
          stage,
          source: SOURCE,
          source_reference_url: programme.href,
          source_snapshot_label: snapshotLabel,
          is_active: true,
          first_seen_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          verification_status: VERIFICATION_STATUS,
          notes: null,
        };
        const action = await upsertAvailabilityRow(supabase, payload);
        writeCounters[action] += 1;
        writeRows.push({
          stage,
          schoolCode: school.schoolCode,
          institutionId: matched.institutionId,
          programSlug: programme.slug,
          action,
        });
      }
    }
  }

  // 5c) Stale deactivation for this profession/county/source.
  const currentActiveSet = new Set(
    writeRows.map((row) => `${row.programSlug}::${row.institutionId}::${String(row.stage).toUpperCase()}`)
  );

  const { data: professionLinks, error: professionLinksError } = await supabase
    .from("profession_program_links")
    .select("program_slug")
    .eq("profession_slug", professionSlug);
  if (professionLinksError) throw professionLinksError;

  const professionProgramSlugs = Array.from(
    new Set((professionLinks ?? []).map((row) => row.program_slug).filter(Boolean))
  );
  const { data: professionProgramRows, error: professionProgramRowsError } = professionProgramSlugs.length
    ? await supabase
        .from("education_programs")
        .select("id, slug")
        .in("slug", professionProgramSlugs)
    : { data: [], error: null };
  if (professionProgramRowsError) throw professionProgramRowsError;

  const programSlugById = new Map(
    (professionProgramRows ?? []).map((row) => [
      row.id,
      row.slug,
    ])
  );
  const professionProgramIds = Array.from(programSlugById.keys());

  const { data: activeRowsForScope, error: activeRowsForScopeError } = professionProgramIds.length
    ? await supabase
        .from("programme_school_availability")
        .select("id, education_program_id, institution_id, stage")
        .in("education_program_id", professionProgramIds)
        .eq("county_code", countyCode)
        .eq("source", SOURCE)
        .eq("is_active", true)
    : { data: [], error: null };
  if (activeRowsForScopeError) throw activeRowsForScopeError;

  const staleRowIds = [];
  let keptCount = 0;
  for (const row of activeRowsForScope ?? []) {
    const slug = programSlugById.get(row.education_program_id);
    if (!slug) continue;
    const key = `${slug}::${row.institution_id}::${String(row.stage ?? "").toUpperCase()}`;
    if (currentActiveSet.has(key)) {
      keptCount += 1;
    } else {
      staleRowIds.push(row.id);
    }
  }

  let deactivatedCount = 0;
  if (staleRowIds.length > 0) {
    const { data: deactivatedRows, error: deactivateError } = await supabase
      .from("programme_school_availability")
      .update({ is_active: false })
      .in("id", staleRowIds)
      .select("id");
    if (deactivateError) throw deactivateError;
    deactivatedCount = (deactivatedRows ?? []).length;
  }

  // 6) Print summary.
  console.log(
    JSON.stringify(
      {
        professionSlug,
        countyCode,
        sourceUrl,
        extractedStageCounts: Object.fromEntries(
          Object.entries(extractedStages).map(([stage, schools]) => [stage, schools.length])
        ),
        matching: {
          matched: matchedBySchoolCode.size,
          unmatched: unmatchedSchools.length,
          ambiguous: ambiguousMatches.length,
        },
        materialize: materializeResult,
        stageExpansion: {
          includedProgrammes: includedProgrammeLinks.length,
          excludedProgrammes: excludedProgrammeLinks.length,
          skippedSiblings: skippedSiblingProgrammeLinks,
          skippedNoSchoolAvailability,
          excluded: excludedProgrammeLinks.map((entry) => ({
            stage: entry.stage,
            title: entry.titleDisplay,
            skipReason: entry.skipReason,
          })),
          expandedMaterialized: expandedProgrammeMaterialization,
        },
        readiness: {
          status: readiness.status,
          missingProgrammeRows: readiness.details?.missingProgrammeRows ?? [],
          missingPathNodes: readiness.details?.missingPathNodes ?? [],
        },
        availabilityWrite: {
          inserted: writeCounters.inserted,
          updated: writeCounters.updated,
          total: writeRows.length,
        },
        staleDeactivation: {
          checked: (activeRowsForScope ?? []).length,
          deactivated: deactivatedCount,
          kept: keptCount,
        },
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error(`VGS truth pipeline failed: ${error.message}`);
  process.exit(1);
});
