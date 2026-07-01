import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { isPrimaryRouteLarebedriftPilotEligible } from "@/lib/larebedrift/primary-route-larebedrift-pilot";
import {
  resolveLarefagCodeForProfession,
  resolveLarefagLabelForProfession,
} from "@/lib/larebedrift/profession-larefag-mapping";
import type { StudyRouteSnapshotStep } from "@/lib/routes/route-types";
import { getVerifiedLarebedriftApprenticeshipOptions } from "./get-verified-larebedrift-options";

/**
 * P3b Phase 1 — inject verified godkjent lærebedrifter into ordinary
 * `availability_truth` apprenticeship steps at snapshot build time (recompute /
 * initial route / outcome-filter alternatives). Curated-regional / veksling steps
 * are unchanged (they already load verified rows via their own builders).
 *
 * Stop rule: no pilot eligibility, no fag mapping, or zero DB rows → steps unchanged.
 */
export async function applyVerifiedLarebedriftToApprenticeshipSteps(params: {
  supabase: SupabaseClient;
  steps: StudyRouteSnapshotStep[];
  professionSlug: string;
  preferredMunicipalityCodes: string[];
}): Promise<StudyRouteSnapshotStep[]> {
  if (
    !isPrimaryRouteLarebedriftPilotEligible({
      professionSlug: params.professionSlug,
      preferredMunicipalityCodes: params.preferredMunicipalityCodes,
    })
  ) {
    return params.steps;
  }

  const larefagCode = resolveLarefagCodeForProfession(params.professionSlug);
  if (!larefagCode) {
    return params.steps;
  }

  const verifiedOptions = await getVerifiedLarebedriftApprenticeshipOptions({
    supabase: params.supabase,
    larefagCode,
    preferredMunicipalityCodes: params.preferredMunicipalityCodes,
  });
  if (verifiedOptions.length === 0) {
    return params.steps;
  }

  const larefagLabel = resolveLarefagLabelForProfession(params.professionSlug);

  let applied = false;
  const nextSteps = params.steps.map((step) => {
    if (step.type !== "apprenticeship_step") {
      return step;
    }
    if (step.source !== "availability_truth") {
      return step;
    }
    applied = true;
    const baseTitle = String(step.title ?? "Opplæring i bedrift").trim();
    const title =
      larefagLabel && !baseTitle.includes(larefagLabel)
        ? `${baseTitle} (${larefagLabel})`
        : baseTitle;
    return {
      ...step,
      title,
      program_title: larefagLabel ?? step.program_title ?? null,
      apprenticeship_options: verifiedOptions,
    };
  });

  return applied ? nextSteps : params.steps;
}
