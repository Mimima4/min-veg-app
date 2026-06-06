/**
 * Read-only LOSA PSA publication plan (Phase 4 Tranche 3 — model only).
 * No DB writes; no schema migration.
 */

import { resolveMunicipalityCodeForDeliveryLabel } from "./norway-kommune-reference.mjs";
import { hasPublicationDecisionForManifestRow } from "./losa-finnmark-publication-decision.mjs";

export const LOSA_ORDINARY_AVAILABILITY_SCOPE = "programme_in_school";

/** Proposed — requires P4-LOSA-PSA schema gate before DB use. */
export const LOSA_PROPOSED_AVAILABILITY_SCOPE = "losa_fjern_delivery_municipality";

export const LOSA_PIPELINE_RULES = [
  "R1: isLosa rows must not use pickInstitutionsForPsaEmission",
  "R2: separate planLosaFinnmarkPsaEmission path",
  "R3: institution_id only when provider_school CONFIRMED at row scope",
  "R4: municipality_code only when delivery_municipality CONFIRMED at row scope",
  "R5: county_reference_confirmed Tier 1 does not unlock emission",
  "R6: verification_status default needs_review for LOSA until Utdanning path defined",
  "R7: Contour B partial continues skipping isLosa until PSA write gate",
];

/**
 * @param {ReturnType<import('./losa-finnmark-evidence-link.mjs').linkEvidenceToManifestRow>} linkedRow
 */
export function planLosaFinnmarkPsaEmission(linkedRow, context = {}) {
  const summary = linkedRow.evidenceLink?.summary ?? {};
  const claimLinks = linkedRow.evidenceLink?.claimLinks ?? [];
  const publicationDecisionRecorded = hasPublicationDecisionForManifestRow(linkedRow);
  const section4Satisfied = Boolean(summary.psaEligible);
  const emissionAllowed = section4Satisfied && publicationDecisionRecorded;

  const providerLink = claimLinks.find((l) => l.claimClass === "provider_school");
  const deliveryLink = claimLinks.find((l) => l.claimClass === "delivery_municipality");
  const deliverySiteLabel = linkedRow.entity?.deliverySiteLabel ?? null;
  const countyCode = linkedRow.countyCode ?? "56";

  const municipalityResolution = resolveMunicipalityCodeForDeliveryLabel(
    deliverySiteLabel,
    { countyCode }
  );

  const providerRowConfirmed = providerLink?.status === "row_confirmed";
  const deliveryRowConfirmed = deliveryLink?.status === "row_confirmed";

  const blockedReasons = [];
  if (!section4Satisfied) {
    blockedReasons.push("row_section_4_not_satisfied");
  }
  if (!publicationDecisionRecorded) {
    blockedReasons.push("publication_decision_gate_not_passed");
  }
  if (emissionAllowed) {
    if (!providerRowConfirmed) {
      blockedReasons.push("provider_school_not_row_confirmed");
    }
    if (!deliveryRowConfirmed) {
      blockedReasons.push("delivery_municipality_not_row_confirmed");
    }
    if (!municipalityResolution.municipalityCode) {
      blockedReasons.push("delivery_municipality_code_unresolved");
    }
  } else if (providerLink?.status === "snippet_only") {
    blockedReasons.push("provider_school_snippet_only");
  } else if (providerLink?.status === "blocked") {
    blockedReasons.push("provider_school_blocked");
  }
  if (!emissionAllowed && deliveryLink?.status === "snippet_only") {
    blockedReasons.push("delivery_municipality_snippet_only");
  } else if (!emissionAllowed && deliveryLink?.status === "blocked") {
    blockedReasons.push("delivery_municipality_blocked");
  }
  blockedReasons.push("p4_losa_psa_write_no_execution_session");

  return {
    section: "P4-LOSA-PUBLICATION-MODEL-PLAN",
    vilbliSchoolCode: linkedRow.vilbliSchoolCode,
    vilbliSchoolPagePath: linkedRow.vilbliSchoolPagePath,
    countyCode,
    profession: context.profession ?? "electrician",
    emissionAllowed,
    publicationDecisionRecorded,
    section4Satisfied,
    proposedAvailabilityScope: LOSA_PROPOSED_AVAILABILITY_SCOPE,
    ordinaryScopeForbidden: LOSA_ORDINARY_AVAILABILITY_SCOPE,
    entity: linkedRow.entity,
    bindings: {
      providerInstitutionId: null,
      providerInstitutionIdBinding: providerRowConfirmed
        ? "row_confirmed_resolve_at_write_session"
        : "blocked",
      deliveryMunicipalityCode: deliveryRowConfirmed
        ? municipalityResolution.municipalityCode
        : null,
      deliverySiteLabel,
      deliveryMunicipalityBinding: deliveryRowConfirmed
        ? "row_confirmed"
        : "blocked",
    },
    pipelineRules: LOSA_PIPELINE_RULES,
    routeConsumption: {
      allowed: false,
      proposedOptionKind: "losa_fjern_delivery_municipality",
      gate: "P4-LOSA-ROUTE",
    },
    blockedReasons: Array.from(new Set(blockedReasons)),
    evidencePosture: summary.posture ?? "STILL_BLOCKED_SECTION_4",
  };
}

export function planLosaFinnmarkPublication(linkedRows, context = {}) {
  const plans = linkedRows.map((row) =>
    planLosaFinnmarkPsaEmission(row, context)
  );

  return {
    section: "P4-LOSA-PUBLICATION-MODEL-PLAN",
    rowCount: plans.length,
    emissionAllowedCount: plans.filter((p) => p.emissionAllowed).length,
    proposedScope: LOSA_PROPOSED_AVAILABILITY_SCOPE,
    schemaMigrationRequired: false,
    schemaMigrationApplied: true,
    psaWriteGate: "P4-LOSA-PSA",
    plans,
  };
}

export function summarizePublicationPlan(report) {
  return {
    rowCount: report.rowCount,
    emissionAllowedCount: report.emissionAllowedCount,
    allEmissionBlocked: report.emissionAllowedCount === 0,
    proposedScope: report.proposedScope,
    schemaMigrationRequired: report.schemaMigrationRequired,
    schemaMigrationApplied: report.schemaMigrationApplied ?? false,
    nextGate: report.psaWriteGate,
  };
}
