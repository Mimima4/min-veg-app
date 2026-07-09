import fetch from "./lib/http-fetch.mjs";
import { createClient } from "@supabase/supabase-js";
import { isMainModule } from "./lib/is-main-module.mjs";
import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";
import { extractVilbliStagesFromHtml } from "./vilbli-stage-extraction-helper.mjs";
import {
  buildRequiredProgrammeSpecs,
  CARPENTER_MATERIALIZATION_NODE_KEYS,
  ELECTRICIAN_MATERIALIZATION_NODE_KEYS,
  MECHANIC_MATERIALIZATION_NODE_KEYS,
  PLUMBER_MATERIALIZATION_NODE_KEYS,
  PAINTER_MATERIALIZATION_NODE_KEYS,
  stagePresentInCounty,
} from "./vgs-programme-materialization-planner.mjs";

const MATERIALIZATION_NODE_KEYS_BY_PROFESSION = {
  electrician: ELECTRICIAN_MATERIALIZATION_NODE_KEYS,
  mechanic: MECHANIC_MATERIALIZATION_NODE_KEYS,
  carpenter: CARPENTER_MATERIALIZATION_NODE_KEYS,
  plumber: PLUMBER_MATERIALIZATION_NODE_KEYS,
  painter: PAINTER_MATERIALIZATION_NODE_KEYS,
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

function materializationNodeKeysForProfession(professionSlug) {
  return MATERIALIZATION_NODE_KEYS_BY_PROFESSION[professionSlug] ?? null;
}

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

async function upsertProgrammeBySlugOrCode(supabase, spec) {
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

async function ensureProfessionLink(supabase, professionSlug, programSlug) {
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
    note: "Materialized from Vilbli source-backed required VGS node.",
  });
  if (insertError) throw insertError;
  return "inserted";
}

function resolveSupportedRequiredNodes(pathDefinition, professionSlug) {
  const materializationNodeKeys = materializationNodeKeysForProfession(professionSlug);
  if (!materializationNodeKeys) {
    throw new Error(`Unsupported profession for materialization: ${professionSlug}`);
  }
  const requiredNodeKeySet = new Set(materializationNodeKeys);

  const requiredNodes = pathDefinition.stageNodes.filter(
    (node) => node.requiredForWrite && node.stageType === "school_programme"
  );
  const supportedRequiredNodes = requiredNodes.filter((node) =>
    requiredNodeKeySet.has(node.nodeKey)
  );
  if (supportedRequiredNodes.length !== materializationNodeKeys.length) {
    throw new Error(
      `Required ${professionSlug} nodes not fully present in path definition (${materializationNodeKeys.join(", ")}).`
    );
  }
  return supportedRequiredNodes;
}

/**
 * In-process materialization (Vercel-safe — no child `node scripts/...` spawn).
 */
export async function materializeVgsProgrammesFromVilbli({
  professionSlug,
  countyCode,
  supabase,
  extractedStages,
  sourceUrl = null,
}) {
  if (!supabase) {
    throw new Error("materializeVgsProgrammesFromVilbli requires a supabase client");
  }

  const profession = String(professionSlug ?? "").trim();
  const county = String(countyCode ?? "").trim();
  if (!profession || !county) {
    throw new Error("professionSlug and countyCode are required");
  }
  if (!extractedStages || typeof extractedStages !== "object") {
    throw new Error("extractedStages is required");
  }

  const countyMeta = COUNTY_CODE_TO_VILBLI[county] ?? null;
  if (!countyMeta) {
    throw new Error(`Unsupported county code: ${county}`);
  }

  const pathDefinition = getVgsPathDefinition(profession);
  if (!pathDefinition) {
    throw new Error(`No VGS path definition found for profession: ${profession}`);
  }

  const supportedRequiredNodes = resolveSupportedRequiredNodes(pathDefinition, profession);
  const resolvedSourceUrl =
    sourceUrl ?? pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);

  const missingStages = supportedRequiredNodes
    .filter((node) => !stagePresentInCounty(extractedStages[node.stage] ?? [], countyMeta))
    .map((node) => node.stage);
  if (missingStages.length > 0) {
    throw new Error(
      `ABORT: required Vilbli stage(s) not found in extracted data for county ${county}: ${missingStages.join(", ")}`
    );
  }

  const plan = buildRequiredProgrammeSpecs({
    professionSlug: profession,
    countyCode: county,
    countyMeta,
    requiredNodes: supportedRequiredNodes,
    extractedStages,
  });
  const programmeSpecsByNodeKey = plan.programmeSpecsByNodeKey;

  const materialized = [];
  for (const node of supportedRequiredNodes) {
    const row = programmeSpecsByNodeKey[node.nodeKey];
    if (!row) {
      throw new Error(`No deterministic programme spec defined for ${node.nodeKey}`);
    }
    const spec = {
      slug: row.slug,
      programCode: row.programCode,
      title: row.title,
    };
    const programmeResult = await upsertProgrammeBySlugOrCode(supabase, spec);
    const linkAction = await ensureProfessionLink(supabase, profession, spec.slug);
    materialized.push({
      nodeKey: node.nodeKey,
      stage: node.stage,
      slug: spec.slug,
      programCode: spec.programCode,
      programmeAction: programmeResult.action,
      linkAction,
    });
  }

  return {
    professionSlug: profession,
    countyCode: county,
    sourceUrl: resolvedSourceUrl,
    requiredNodes: supportedRequiredNodes.map((node) => node.nodeKey),
    materialized,
  };
}

async function runCli() {
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
      "Usage: node scripts/materialize-vgs-programmes-from-vilbli.mjs --profession electrician --county 50"
    );
  }

  const countyMeta = COUNTY_CODE_TO_VILBLI[countyCode] ?? null;
  if (!countyMeta) {
    throw new Error(`Unsupported county code: ${countyCode}`);
  }

  const pathDefinition = getVgsPathDefinition(professionSlug);
  if (!pathDefinition) {
    throw new Error(`No VGS path definition found for profession: ${professionSlug}`);
  }

  const sourceUrl = pathDefinition.sourceModel.buildVilbliUrl(countyMeta.slug);
  const response = await fetch(sourceUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch Vilbli source: ${response.status}`);
  }

  const html = await response.text();
  const extracted = extractVilbliStagesFromHtml({
    html,
    countySlug: countyMeta.slug,
    countyLabel: countyMeta.label,
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const result = await materializeVgsProgrammesFromVilbli({
    professionSlug,
    countyCode,
    supabase,
    extractedStages: extracted.extractedStages,
    sourceUrl,
  });

  console.log(JSON.stringify(result, null, 2));
}

if (isMainModule(import.meta.url)) {
  runCli().catch((error) => {
    console.error(`Materialization failed: ${error.message}`);
    process.exit(1);
  });
}
