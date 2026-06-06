import { LOSA_PROPOSED_AVAILABILITY_SCOPE } from "./losa-finnmark-publication-model.mjs";
import { resolveMunicipalityCodeForDeliveryLabel } from "./norway-kommune-reference.mjs";

export const LOSA_PSA_WRITE_GATE = "P4-LOSA-PSA-WRITE";
export const LOSA_PSA_DEFAULT_VERIFICATION_STATUS = "needs_review";
export const LOSA_PSA_SOURCE = "vilbli";

/**
 * Build a PSA insert payload shape for a publication plan row.
 * Returns writeAllowed=false unless plan.emissionAllowed (none today).
 */
export function buildLosaPsaWriteCandidate(plan, context = {}) {
  const blockedReasons = [...(plan.blockedReasons ?? [])];

  if (!plan.emissionAllowed) {
    return {
      section: "P4-LOSA-PSA-WRITE-CANDIDATE",
      writeAllowed: false,
      vilbliSchoolCode: plan.vilbliSchoolCode,
      deliverySiteLabel: plan.entity?.deliverySiteLabel ?? null,
      blockedReasons,
      payload: null,
    };
  }

  const providerInstitutionId = plan.bindings?.providerInstitutionId ?? null;
  const providerBinding = plan.bindings?.providerInstitutionIdBinding;
  const providerReady =
    providerBinding === "row_confirmed_resolve_at_write_session" ||
    Boolean(providerInstitutionId);

  const municipalityResolution = resolveMunicipalityCodeForDeliveryLabel(
    plan.entity?.deliverySiteLabel ?? plan.bindings?.deliverySiteLabel,
    { countyCode: plan.countyCode }
  );
  const municipalityCode =
    plan.bindings?.deliveryMunicipalityCode ??
    municipalityResolution.municipalityCode;

  if (!providerReady) {
    blockedReasons.push("provider_school_binding_blocked");
  }
  if (!municipalityCode) {
    blockedReasons.push("delivery_municipality_code_missing");
  }

  if (!providerReady || !municipalityCode) {
    return {
      section: "P4-LOSA-PSA-WRITE-CANDIDATE",
      writeAllowed: false,
      vilbliSchoolCode: plan.vilbliSchoolCode,
      deliverySiteLabel: plan.entity?.deliverySiteLabel ?? null,
      blockedReasons,
      payload: null,
    };
  }

  const resolveAtWriteSession = providerInstitutionId
    ? []
    : ["provider_institution_id"];

  return {
    section: "P4-LOSA-PSA-WRITE-CANDIDATE",
    writeAllowed: true,
    vilbliSchoolCode: plan.vilbliSchoolCode,
    deliverySiteLabel: plan.entity?.deliverySiteLabel ?? null,
    blockedReasons: [],
    payloadComplete: resolveAtWriteSession.length === 0,
    resolveAtWriteSession,
    payload: {
      education_program_id: context.educationProgramId ?? null,
      institution_id: providerInstitutionId,
      country_code: "NO",
      county_code: plan.countyCode,
      municipality_code: municipalityCode,
      availability_scope: LOSA_PROPOSED_AVAILABILITY_SCOPE,
      stage: context.stage ?? "VG1",
      source: LOSA_PSA_SOURCE,
      source_reference_url: plan.vilbliSchoolPagePath ?? context.sourceUrl ?? null,
      source_snapshot_label: context.snapshotLabel ?? null,
      is_active: true,
      verification_status: LOSA_PSA_DEFAULT_VERIFICATION_STATUS,
      notes: JSON.stringify({
        losa_write_gate: LOSA_PSA_WRITE_GATE,
        vilbli_school_code: plan.vilbliSchoolCode,
        delivery_site_label: plan.entity?.deliverySiteLabel ?? null,
        provider_school_label: plan.entity?.providerSchoolLabel ?? null,
      }),
    },
  };
}

export function buildLosaPsaWritePreview(publicationReport, context = {}) {
  const candidates = publicationReport.plans.map((plan) =>
    buildLosaPsaWriteCandidate(plan, context)
  );

  const writable = candidates.filter((c) => c.writeAllowed);

  return {
    section: "P4-LOSA-PSA-WRITE-PREVIEW",
    gate: LOSA_PSA_WRITE_GATE,
    countyCode: context.countyCode ?? "56",
    profession: context.profession ?? "electrician",
    rowCount: candidates.length,
    writeCandidateCount: writable.length,
    executionAuthorized: false,
    nationwidePattern: true,
    candidates,
  };
}
