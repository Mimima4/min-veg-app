import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import { getVgsPathDefinition } from "./vgs-path-definitions.mjs";
import {
  buildRequiredProgrammeSpecs,
  stagePresentInCounty,
} from "./vgs-programme-materialization-planner.mjs";

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

  const requiredNodes = pathDefinition.stageNodes.filter(
    (node) => node.requiredForWrite && node.stageType === "school_programme"
  );
  const requiredNodeKeys = new Set(["VG1_ELEKTRO", "VG2_EL_BRANCH"]);
  const supportedRequiredNodes = requiredNodes.filter((node) => requiredNodeKeys.has(node.nodeKey));

  if (supportedRequiredNodes.length !== requiredNodeKeys.size) {
    throw new Error(
      "Required electrician nodes not fully present in path definition (VG1_ELEKTRO, VG2_EL_BRANCH)."
    );
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
  const stageMap = parseStageArraysFromHtml(html);
  const extractedByStage = Object.fromEntries(
    Object.entries(stageMap).map(([stage, rows]) => [stage, Array.isArray(rows) ? rows : []])
  );

  const missingStages = supportedRequiredNodes
    .filter((node) => !stagePresentInCounty(extractedByStage[node.stage] ?? [], countyMeta))
    .map((node) => node.stage);
  if (missingStages.length > 0) {
    throw new Error(
      `ABORT: required Vilbli stage(s) not found in extracted data for county ${countyCode}: ${missingStages.join(", ")}`
    );
  }

  const plan = buildRequiredProgrammeSpecs({
    professionSlug,
    countyCode,
    countyMeta,
    requiredNodes: supportedRequiredNodes,
    extractedStages: extractedByStage,
  });
  const programmeSpecsByNodeKey = plan.programmeSpecsByNodeKey;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

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
    const linkAction = await ensureProfessionLink(supabase, professionSlug, spec.slug);
    materialized.push({
      nodeKey: node.nodeKey,
      stage: node.stage,
      slug: spec.slug,
      programCode: spec.programCode,
      programmeAction: programmeResult.action,
      linkAction,
    });
  }

  console.log(
    JSON.stringify(
      {
        professionSlug,
        countyCode,
        sourceUrl,
        requiredNodes: supportedRequiredNodes.map((node) => node.nodeKey),
        materialized,
      },
      null,
      2
    )
  );
}

run().catch((error) => {
  console.error(`Materialization failed: ${error.message}`);
  process.exit(1);
});
