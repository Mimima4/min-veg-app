import { LOSA_PROPOSED_AVAILABILITY_SCOPE } from "./losa-finnmark-publication-model.mjs";

export const LOSA_ROUTE_OPTION_KIND = "losa_fjern_delivery_municipality";
export const LOSA_ORDINARY_ROUTE_OPTION_KIND = "programme_in_school";
export const LOSA_ROUTE_GATE = "P4-LOSA-ROUTE";
export const LOSA_ROUTE_UI_GATE = "permission_3_not_approved";

/**
 * Plan a programme_selection option from a PSA write candidate (read-only).
 */
export function planLosaRouteOption(writeCandidate) {
  if (!writeCandidate?.writeAllowed || !writeCandidate.payload) {
    return {
      section: "P4-LOSA-ROUTE-OPTION-PLAN",
      routeEligible: false,
      optionKind: LOSA_ROUTE_OPTION_KIND,
      vilbliSchoolCode: writeCandidate?.vilbliSchoolCode ?? null,
      deliverySiteLabel: writeCandidate?.deliverySiteLabel ?? null,
      blockedReasons: [
        ...(writeCandidate?.blockedReasons ?? []),
        "no_psa_row_or_section_4_blocked",
      ],
      displayHint: null,
      metadata: null,
    };
  }

  const payload = writeCandidate.payload;
  let notesMeta = {};
  try {
    notesMeta = JSON.parse(payload.notes ?? "{}");
  } catch {
    notesMeta = {};
  }

  const providerLabel = notesMeta.provider_school_label ?? null;
  const deliveryLabel =
    notesMeta.delivery_site_label ?? writeCandidate.deliverySiteLabel ?? null;

  return {
    section: "P4-LOSA-ROUTE-OPTION-PLAN",
    routeEligible: false,
    optionKind: LOSA_ROUTE_OPTION_KIND,
    vilbliSchoolCode: writeCandidate.vilbliSchoolCode,
    deliverySiteLabel: deliveryLabel,
    blockedReasons: [LOSA_ROUTE_UI_GATE, "get_availability_truth_not_wired"],
    displayHint: providerLabel && deliveryLabel
      ? `${providerLabel} – LOSA ${deliveryLabel}`
      : null,
    metadata: {
      availabilityScope: payload.availability_scope ?? LOSA_PROPOSED_AVAILABILITY_SCOPE,
      providerInstitutionId: payload.institution_id,
      deliveryMunicipalityCode: payload.municipality_code,
      stage: payload.stage,
      verificationStatus: payload.verification_status,
      ordinaryCampusOptionForbidden: true,
    },
  };
}

export function planLosaRouteConsumption(writePreview, context = {}) {
  const optionPlans = (writePreview.candidates ?? []).map((candidate) =>
    planLosaRouteOption(candidate)
  );

  const routeEligiblePlans = optionPlans.filter((p) => p.routeEligible);

  return {
    section: "P4-LOSA-ROUTE-CONSUMPTION-PLAN",
    gate: LOSA_ROUTE_GATE,
    countyCode: context.countyCode ?? writePreview.countyCode ?? "56",
    profession: context.profession ?? writePreview.profession ?? "electrician",
    nationwideApplicable: true,
    ordinaryOptionKind: LOSA_ORDINARY_ROUTE_OPTION_KIND,
    losaOptionKind: LOSA_ROUTE_OPTION_KIND,
    writeCandidateCount: writePreview.writeCandidateCount ?? 0,
    routeOptionPlanCount: optionPlans.length,
    routeEligibleCount: routeEligiblePlans.length,
    uiIntegrationApproved: false,
    optionPlans,
  };
}
