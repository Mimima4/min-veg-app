/**
 * P1 — curated Steigen × carpenter veksling path variant (not PSA).
 * Charter: phase-4-nordland-steigen-carpenter-veksling-pilot-charter.md §10
 */

import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import { formatCuratedRegionalVariantReason } from "./curated-regional-variant-reason";
import {
  STEIGEN_CARPENTER_VEKSLING_BADGE,
  shouldShowSteigenCarpenterVekslingInfo,
} from "./steigen-carpenter-veksling-pilot";

export const STEIGEN_CARPENTER_VEKSLING_VARIANT_ID = "steigen-carpenter-veksling-0-4";

export const STEIGEN_CARPENTER_VEKSLING_VARIANT_LABEL = STEIGEN_CARPENTER_VEKSLING_BADGE;

export const STEIGEN_CARPENTER_VEKSLING_VARIANT_REASON = formatCuratedRegionalVariantReason(
  STEIGEN_CARPENTER_VEKSLING_VARIANT_ID
);

const HUB_INSTITUTION_NAME = "Nord-Salten vgs avd Steigen";
const HUB_MUNICIPALITY = "Steigen";
const HUB_CITY = "Leinesfjord";

export function buildSteigenCarpenterVekslingSteps(
  professionSlug: string
): StudyRouteSnapshotStep[] {
  return [
    {
      type: "progression_step",
      title: "Fellesfag — Nord-Salten vgs avd Steigen",
      institution_name: HUB_INSTITUTION_NAME,
      institution_municipality: HUB_MUNICIPALITY,
      institution_city: HUB_CITY,
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
      apprenticeship_options: [],
      current_profession_slug: professionSlug,
      source: "curated_regional_delivery",
    },
  ];
}

export function isSteigenCarpenterVekslingPathVariantEligible(params: {
  professionSlug: string | null | undefined;
  preferredMunicipalityCodes: string[];
}): boolean {
  return shouldShowSteigenCarpenterVekslingInfo(params);
}
