#!/usr/bin/env node
/**
 * Resolve Playwright Steigen carpenter veksling fixture.
 *
 * Usage:
 *   node --env-file=.env.local scripts/resolve-e2e-steigen-carpenter-fixture.mjs
 *
 * Env:
 *   E2E_CHILD_ID — Steigen child UUID (preferred_municipality_codes includes 1848)
 */
import { createClient } from "@supabase/supabase-js";
import { isMainModule } from "./lib/is-main-module.mjs";

const STEIGEN_MUNICIPALITY_CODE = "1848";
const VEKSLING_VARIANT_REASON = "curated:steigen-carpenter-veksling-0-4";
const HUB_INSTITUTION_NAME = "Nord-Salten vgs avd Steigen";
const EMPLOYER_OPTION_ID = "employer-steigen-carpenter-local-bedrift";
const EMPLOYER_OPTION_TITLE = "Lokal opplæringsbedrift (Steigen)";

function parsePreferredMunicipalityCodes(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stableStringify(value) {
  return JSON.stringify(value);
}

/**
 * A saved veksling route is detected by its snapshot signature, NOT by
 * variant_reason: saveStudyRoute persists the copied steps under a generic
 * "User selection" variant, so the curated reason is not present on saved rows.
 */
function snapshotStepsHaveVekslingSignature(steps) {
  if (!Array.isArray(steps)) {
    return false;
  }
  const hasHubStep = steps.some(
    (step) =>
      step &&
      typeof step === "object" &&
      step.type === "progression_step" &&
      step.institution_name === HUB_INSTITUTION_NAME
  );
  const apprenticeshipStep = steps.find(
    (step) => step && typeof step === "object" && step.type === "apprenticeship_step"
  );
  const apprenticeshipOptions = Array.isArray(apprenticeshipStep?.apprenticeship_options)
    ? apprenticeshipStep.apprenticeship_options
    : [];
  const hasEmployerOption = apprenticeshipOptions.some(
    (option) => option && option.option_id === EMPLOYER_OPTION_ID
  );
  return hasHubStep && hasEmployerOption;
}

async function main() {
  const childId = String(process.env.E2E_CHILD_ID ?? "").trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!childId) {
    throw new Error("Missing E2E_CHILD_ID");
  }
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key);

  const { data: child, error: childError } = await supabase
    .from("child_profiles")
    .select("id, preferred_municipality_codes")
    .eq("id", childId)
    .maybeSingle();

  if (childError) {
    throw new Error(`child_profiles: ${childError.message}`);
  }
  if (!child?.id) {
    throw new Error(`Child ${childId} not found`);
  }

  const preferredMunicipalityCodes = parsePreferredMunicipalityCodes(
    child.preferred_municipality_codes
  );
  if (!preferredMunicipalityCodes.includes(STEIGEN_MUNICIPALITY_CODE)) {
    throw new Error(
      `Child ${childId} is missing Steigen municipality code ${STEIGEN_MUNICIPALITY_CODE}`
    );
  }

  const { data: profession, error: professionError } = await supabase
    .from("professions")
    .select("id, slug, title_i18n")
    .eq("slug", "carpenter")
    .eq("is_active", true)
    .maybeSingle();

  if (professionError) {
    throw new Error(`professions: ${professionError.message}`);
  }
  if (!profession?.id) {
    throw new Error("Active carpenter profession not found");
  }

  const { data: draftRoute, error: draftRouteError } = await supabase
    .from("study_routes")
    .select("id, current_variant_id")
    .eq("child_id", childId)
    .eq("target_profession_id", profession.id)
    .eq("status", "draft")
    .is("archived_at", null)
    .maybeSingle();

  if (draftRouteError) {
    throw new Error(`study_routes draft: ${draftRouteError.message}`);
  }
  if (!draftRoute?.id) {
    throw new Error(`No draft carpenter route for child ${childId}`);
  }

  const { data: vekslingVariant, error: vekslingVariantError } = await supabase
    .from("study_route_variants")
    .select("id, variant_label, variant_reason, status")
    .eq("route_id", draftRoute.id)
    .eq("variant_reason", VEKSLING_VARIANT_REASON)
    .neq("status", "archived")
    .maybeSingle();

  if (vekslingVariantError) {
    throw new Error(`study_route_variants veksling: ${vekslingVariantError.message}`);
  }
  if (!vekslingVariant?.id) {
    throw new Error(`No active veksling variant on carpenter route ${draftRoute.id}`);
  }

  const { data: vekslingSnapshot, error: vekslingSnapshotError } = await supabase
    .from("study_route_snapshots")
    .select("selected_steps_payload")
    .eq("route_variant_id", vekslingVariant.id)
    .eq("is_current_snapshot", true)
    .maybeSingle();

  if (vekslingSnapshotError) {
    throw new Error(`study_route_snapshots veksling: ${vekslingSnapshotError.message}`);
  }

  const steps = Array.isArray(vekslingSnapshot?.selected_steps_payload)
    ? vekslingSnapshot.selected_steps_payload
    : [];
  if (steps.length < 2) {
    throw new Error(`Veksling variant ${vekslingVariant.id} has no current snapshot steps`);
  }

  const hubStep = steps.find(
    (step) =>
      step &&
      typeof step === "object" &&
      step.type === "progression_step" &&
      step.institution_name === HUB_INSTITUTION_NAME
  );
  if (!hubStep) {
    throw new Error(`Veksling snapshot missing hub step (${HUB_INSTITUTION_NAME})`);
  }

  const apprenticeshipStep = steps.find(
    (step) => step && typeof step === "object" && step.type === "apprenticeship_step"
  );
  const apprenticeshipOptions = Array.isArray(apprenticeshipStep?.apprenticeship_options)
    ? apprenticeshipStep.apprenticeship_options
    : [];
  const employerOption = apprenticeshipOptions.find(
    (option) => option && option.option_id === EMPLOYER_OPTION_ID
  );
  if (!employerOption) {
    throw new Error(
      `Veksling snapshot missing employer option ${EMPLOYER_OPTION_ID} — run npm run test:e2e:steigen or recompute the carpenter draft route`
    );
  }
  if (employerOption.option_title !== EMPLOYER_OPTION_TITLE) {
    throw new Error(
      `Unexpected employer option title: ${stableStringify(employerOption.option_title)}`
    );
  }

  const { data: savedRoutes } = await supabase
    .from("study_routes")
    .select("id, current_variant_id")
    .eq("child_id", childId)
    .eq("target_profession_id", profession.id)
    .eq("status", "saved")
    .is("archived_at", null)
    .order("updated_at", { ascending: false })
    .limit(10);

  let savedVekslingRouteId = null;
  for (const savedRoute of savedRoutes ?? []) {
    if (!savedRoute?.current_variant_id) {
      continue;
    }
    const { data: savedSnapshot } = await supabase
      .from("study_route_snapshots")
      .select("selected_steps_payload")
      .eq("route_variant_id", savedRoute.current_variant_id)
      .eq("is_current_snapshot", true)
      .maybeSingle();
    if (snapshotStepsHaveVekslingSignature(savedSnapshot?.selected_steps_payload)) {
      savedVekslingRouteId = savedRoute.id;
      break;
    }
  }

  console.log(
    JSON.stringify({
      childId,
      carpenterProfessionId: profession.id,
      draftRouteId: draftRoute.id,
      vekslingVariantId: vekslingVariant.id,
      savedVekslingRouteId,
      steigenMunicipalityCode: STEIGEN_MUNICIPALITY_CODE,
      hubInstitutionName: HUB_INSTITUTION_NAME,
      employerOptionId: EMPLOYER_OPTION_ID,
      employerOptionTitle: EMPLOYER_OPTION_TITLE,
      vekslingVariantLabel: vekslingVariant.variant_label,
    })
  );
}

if (isMainModule(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
