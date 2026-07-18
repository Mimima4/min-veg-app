/**
 * Contour B operational ingest: when Contour A would ABORT or readiness is not green,
 * write only NSR-verified, non-LOSA Vilbli rows into programme_school_availability.
 */
import { assessContourBOperationalEligibility } from "./lib/contour-b-operational-eligibility.mjs";
import { isMainModule } from "./lib/is-main-module.mjs";
import { classifyReadiness } from "./classify-vgs-truth-readiness.mjs";
import { runVgsTruthPipeline } from "./run-vgs-truth-pipeline.mjs";

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

export async function runContourBOperationalIngest({
  professionSlug,
  countyCode,
  dryRun = false,
  supabase,
  vilbliHtml = null,
  currentYearOfferingHtml = null,
}) {
  if (!supabase) {
    throw new Error("runContourBOperationalIngest requires a supabase client");
  }

  const profession = String(professionSlug ?? "").trim();
  const county = String(countyCode ?? "").trim();
  if (!profession || !county) {
    throw new Error("profession and county are required");
  }

  const readiness = await classifyReadiness({
    professionSlug: profession,
    countyCode: county,
    supabase,
    vilbliHtml,
  });

  const eligibility = assessContourBOperationalEligibility({
    countyCode: county,
    professionSlug: profession,
    readinessStatus: readiness.status,
  });

  if (!eligibility.eligible) {
    throw new Error(
      `Contour B operational ingest not applicable: ${eligibility.reason}` +
        (eligibility.readinessStatus ? ` (readiness=${eligibility.readinessStatus})` : "")
    );
  }

  console.error(
    `[contour-b-operational] county=${county} profession=${profession} readiness=${readiness.status}`
  );

  await runVgsTruthPipeline({
    professionSlug: profession,
    countyCode: county,
    isDryRun: dryRun,
    isContourBPartial: true,
    supabase,
    vilbliHtml,
    currentYearOfferingHtml,
  });
}

async function runCli() {
  const { createClient } = await import("@supabase/supabase-js");
  const args = parseArgs(process.argv.slice(2));
  const profession = String(args.profession ?? "").trim();
  const county = String(args.county ?? "").trim();
  const isDryRun = String(args["dry-run"] ?? "").toLowerCase() === "true";

  if (!profession || !county) {
    throw new Error(
      "Usage: node scripts/run-contour-b-operational-ingest.mjs --profession <slug> --county <code> [--dry-run]"
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  await runContourBOperationalIngest({
    professionSlug: profession,
    countyCode: county,
    dryRun: isDryRun,
    supabase,
  });
}

if (isMainModule(import.meta.url)) {
  runCli().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
