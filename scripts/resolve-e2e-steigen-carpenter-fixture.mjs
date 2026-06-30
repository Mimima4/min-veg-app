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
const HUB_INSTITUTION_NAME = "Nord-Salten videregående skole avd Steigen";
/** Verified larebedrift_truth options use this id prefix (org-keyed). */
const VERIFIED_OPTION_PREFIX = "larebedrift-";
/** Retired curated placeholder — must NOT appear once verified rows exist. */
const RETIRED_CURATED_OPTION_ID = "employer-steigen-carpenter-local-bedrift";
/** Charter §3 worked example (ÅLSTADØYA TRELAST AS) — must be in the roster. */
const ANCHOR_EMPLOYER_OPTION_ID = "larebedrift-995810166";

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
  const hasVerifiedEmployerOption = apprenticeshipOptions.some(
    (option) =>
      option &&
      typeof option.option_id === "string" &&
      option.option_id.startsWith(VERIFIED_OPTION_PREFIX)
  );
  return hasHubStep && hasVerifiedEmployerOption;
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

  // Verified end-state (charter success criterion): the curated placeholder is
  // replaced by godkjent larebedrift_truth rows. Assert by SHAPE (durable as the
  // roster grows) + the charter anchor employer, not a pinned exact list.
  if (apprenticeshipOptions.length === 0) {
    throw new Error(
      `Veksling snapshot has no apprenticeship options — recompute the carpenter draft route`
    );
  }
  const retiredOption = apprenticeshipOptions.find(
    (option) => option && option.option_id === RETIRED_CURATED_OPTION_ID
  );
  if (retiredOption) {
    throw new Error(
      `Retired curated placeholder ${RETIRED_CURATED_OPTION_ID} is still present — verified ingest did not replace it`
    );
  }
  const nonVerified = apprenticeshipOptions.find(
    (option) =>
      !option ||
      typeof option.option_id !== "string" ||
      !option.option_id.startsWith(VERIFIED_OPTION_PREFIX)
  );
  if (nonVerified) {
    throw new Error(
      `Non-verified apprenticeship option present: ${stableStringify(nonVerified?.option_id)}`
    );
  }
  const anchorOption = apprenticeshipOptions.find(
    (option) => option && option.option_id === ANCHOR_EMPLOYER_OPTION_ID
  );
  if (!anchorOption) {
    throw new Error(
      `Charter anchor employer ${ANCHOR_EMPLOYER_OPTION_ID} missing — re-run npm run ingest:larebedrift for Steigen`
    );
  }

  // First option is the default-selected one shown on the card (visible to E2E).
  const selectedOption = apprenticeshipOptions[0];
  if (!selectedOption?.option_title) {
    throw new Error(`Selected apprenticeship option has no title`);
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
      // employerOption* describe the default-selected (first) verified employer
      // — the one rendered on the card, used by the Playwright visibility checks.
      employerOptionId: selectedOption.option_id,
      employerOptionTitle: selectedOption.option_title,
      anchorEmployerOptionId: ANCHOR_EMPLOYER_OPTION_ID,
      verifiedEmployerCount: apprenticeshipOptions.length,
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
