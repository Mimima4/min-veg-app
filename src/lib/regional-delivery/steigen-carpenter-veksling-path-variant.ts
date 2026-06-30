/**
 * P1 — curated Steigen × carpenter veksling path variant (not PSA).
 * Charter: phase-4-nordland-steigen-carpenter-veksling-pilot-charter.md §10
 */

import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import { formatCuratedRegionalVariantReason } from "./curated-regional-variant-reason";
import { getSteigenCarpenterVekslingApprenticeshipOptions } from "./steigen-carpenter-veksling-employers";
import {
  STEIGEN_CARPENTER_VEKSLING_BADGE,
  shouldShowSteigenCarpenterVekslingInfo,
} from "./steigen-carpenter-veksling-pilot";

/** larebedrift_truth fag code for Tømrerfaget (see scripts/lib/larebedrift-fagkode.mjs). */
export const STEIGEN_CARPENTER_VEKSLING_LAREFAG_CODE = "TOMRERFAGET";

type ApprenticeshipOption = NonNullable<
  Extract<
    StudyRouteSnapshotStep,
    { type: "apprenticeship_step" }
  >["apprenticeship_options"]
>[number];

export const STEIGEN_CARPENTER_VEKSLING_VARIANT_ID = "steigen-carpenter-veksling-0-4";

export const STEIGEN_CARPENTER_VEKSLING_VARIANT_LABEL = STEIGEN_CARPENTER_VEKSLING_BADGE;

export const STEIGEN_CARPENTER_VEKSLING_VARIANT_REASON = formatCuratedRegionalVariantReason(
  STEIGEN_CARPENTER_VEKSLING_VARIANT_ID
);

/** Canonical NSR name (orgnr 912885070, Steigen 1848); NSR carries no website. */
const HUB_INSTITUTION_NAME = "Nord-Salten videregående skole avd Steigen";
/** Operator/kommune curated — see levisteigen.no + NFK; not Vilbli strukturkart PSA. */
const HUB_MUNICIPALITY = "Steigen";
const HUB_CITY = "Leinesfjord";
/** Official school site (Utdanningstilbud + Finn ansatte/kontakt) — curated; NSR Internettadresse is null. */
const HUB_INSTITUTION_WEBSITE = "https://nord-salten.vgs.no/";

function buildSteigenSteps(
  professionSlug: string,
  apprenticeshipOptions: ApprenticeshipOption[]
): StudyRouteSnapshotStep[] {
  return [
    {
      type: "progression_step",
      title: "Fellesfag — Nord-Salten videregående skole avd Steigen",
      institution_name: HUB_INSTITUTION_NAME,
      institution_municipality: HUB_MUNICIPALITY,
      institution_city: HUB_CITY,
      institution_website: HUB_INSTITUTION_WEBSITE,
      education_level: "vgs",
      fit_band: "recommended",
      program_slug: null,
      program_title: "Fellesfag (Steigenmodellen)",
      duration_label: "År 1–2 (2 d/uke fellesfag)",
      current_profession_slug: professionSlug,
      source: "curated_regional_delivery",
    },
    {
      type: "apprenticeship_step",
      title: "Lærling i lokal bedrift (Tømrerfaget)",
      institution_name: null,
      institution_municipality: HUB_MUNICIPALITY,
      education_level: "apprenticeship",
      fit_band: "recommended",
      program_slug: null,
      program_title: "Tømrerfaget",
      duration_label: "ca. 2 år (år 3–4)",
      apprenticeship_options: apprenticeshipOptions,
      current_profession_slug: professionSlug,
      source: "curated_regional_delivery",
    },
  ];
}

/** Curated fallback (charter §4 stop rule): used when no verified rows exist. */
export function buildSteigenCarpenterVekslingSteps(
  professionSlug: string
): StudyRouteSnapshotStep[] {
  return buildSteigenSteps(
    professionSlug,
    getSteigenCarpenterVekslingApprenticeshipOptions()
  );
}

/**
 * P3: prefer the verified `larebedrift_truth` roster (godkjent, geography-first
 * ordered). Falls back to the curated placeholder only when the (fag, county)
 * cell has no auditable rows (charter §4 stop rule — never synthesize).
 */
export async function buildSteigenCarpenterVekslingStepsWithVerifiedEmployers(params: {
  professionSlug: string;
  preferredMunicipalityCodes: string[];
  loadVerifiedOptions: (input: {
    larefagCode: string;
    preferredMunicipalityCodes: string[];
  }) => Promise<ApprenticeshipOption[]>;
}): Promise<StudyRouteSnapshotStep[]> {
  const verifiedOptions = await params.loadVerifiedOptions({
    larefagCode: STEIGEN_CARPENTER_VEKSLING_LAREFAG_CODE,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
  });

  if (verifiedOptions.length === 0) {
    return buildSteigenCarpenterVekslingSteps(params.professionSlug);
  }

  return buildSteigenSteps(params.professionSlug, verifiedOptions);
}

export function isSteigenCarpenterVekslingPathVariantEligible(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
}): boolean {
  return shouldShowSteigenCarpenterVekslingInfo(params);
}
