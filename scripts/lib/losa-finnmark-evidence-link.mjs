import {
  LOSA_FINNMARK_CLAIM_CLASSES,
} from "./losa-finnmark-entity.mjs";
import {
  LOSA_FINNMARK_CONFIRMED_INDEX,
  LOSA_FINNMARK_SNIPPET_ONLY_INDEX,
  isAltaDeliverySite,
  isNordkappProviderLabel,
} from "./losa-finnmark-evidence-index.mjs";

/**
 * Claim linkage status — read-only; not publication approval.
 * @typedef {'blocked' | 'county_reference_confirmed' | 'row_confirmed_partial' | 'snippet_only'} ClaimLinkStatus
 */

function confirmedForCountyReference(claimClass) {
  return LOSA_FINNMARK_CONFIRMED_INDEX.filter(
    (entry) =>
      entry.claimClass === claimClass && entry.scope === "county_reference"
  );
}

function snippetsForClaim(claimClass, predicate) {
  return LOSA_FINNMARK_SNIPPET_ONLY_INDEX.filter(
    (entry) => entry.claimClass === claimClass && predicate(entry)
  );
}

function isNordkappProviderConfirmed() {
  return LOSA_FINNMARK_CONFIRMED_INDEX.some(
    (entry) =>
      entry.claimClass === "provider_school" &&
      entry.scope === "provider_nordkapp"
  );
}

function isAltaDeliveryConfirmed() {
  return LOSA_FINNMARK_CONFIRMED_INDEX.some(
    (entry) =>
      entry.claimClass === "delivery_municipality" &&
      entry.scope === "delivery_site_alta"
  );
}

function isAltaProgrammeConfirmed() {
  return LOSA_FINNMARK_CONFIRMED_INDEX.some(
    (entry) =>
      entry.claimClass === "programme_stage_availability" &&
      entry.scope === "delivery_site_alta"
  );
}

function altaSupportingEvidencePacketEntry() {
  return LOSA_FINNMARK_CONFIRMED_INDEX.find(
    (entry) =>
      entry.claimClass === "publication_supporting_evidence" &&
      entry.scope === "delivery_site_alta"
  );
}

/** Tier 1+2 row prerequisites before supporting-evidence packet may publish (never alone). */
function altaSupportingEvidencePrerequisitesMet(provider, delivery) {
  return (
    isAltaDeliverySite(delivery) &&
    isNordkappProviderLabel(provider) &&
    isNordkappProviderConfirmed() &&
    isAltaDeliveryConfirmed() &&
    isAltaProgrammeConfirmed() &&
    countyTier1RowPublishable("legal_status") !== null &&
    countyTier1RowPublishable("fjernundervisning_rules") !== null
  );
}

/** P4LS4A1 — county Tier 1 CONFIRMED satisfies row-level legal/fjern claims (ref county). */
function countyTier1RowPublishable(claimClass) {
  const sources = confirmedForCountyReference(claimClass);
  if (sources.length === 0) {
    return null;
  }

  return {
    claimClass,
    status: "county_reference_confirmed",
    sourceIds: sources.map((s) => s.sourceId),
    publishable: true,
    rationale:
      "Tier 1 CONFIRMED at county reference satisfies row-level claim (P4-LOSA-COUNTY-TIER1-ROW-RULE)",
  };
}

export function assessClaimClassEvidenceLink(manifestRow, claimClass) {
  const delivery = manifestRow.entity?.deliverySiteLabel ?? null;
  const provider = manifestRow.entity?.providerSchoolLabel ?? null;

  switch (claimClass) {
    case "legal_status": {
      const countyRule = countyTier1RowPublishable("legal_status");
      if (countyRule) {
        return countyRule;
      }
      break;
    }
    case "fjernundervisning_rules": {
      const countyRule = countyTier1RowPublishable("fjernundervisning_rules");
      if (countyRule) {
        return countyRule;
      }
      break;
    }
    case "provider_school": {
      if (isNordkappProviderLabel(provider)) {
        const confirmed = LOSA_FINNMARK_CONFIRMED_INDEX.filter(
          (entry) =>
            entry.claimClass === "provider_school" &&
            entry.scope === "provider_nordkapp"
        );
        if (confirmed.length > 0) {
          return {
            claimClass,
            status: "row_confirmed",
            sourceIds: confirmed.map((s) => s.sourceId),
            publishable: true,
            rationale:
              "Nordkapp provider CONFIRMED at provider scope (P4-LOSA-CONFIRMED-NORDKAPP-PROVIDER-post)",
          };
        }
        const snippets = snippetsForClaim(
          "provider_school",
          (entry) => entry.scope === "provider_nordkapp"
        );
        if (snippets.length > 0) {
          return {
            claimClass,
            status: "snippet_only",
            sourceIds: snippets.map((s) => s.sourceId),
            tags: snippets.map((s) => s.tag).filter(Boolean),
            publishable: false,
            rationale: "Nordkapp provider SNIPPET_ONLY (LOSA_CONTEXT) — not CONFIRMED",
          };
        }
      }
      return {
        claimClass,
        status: "blocked",
        sourceIds: [],
        publishable: false,
        rationale: "No Tier 2 CONFIRMED provider evidence for this row",
      };
    }
    case "delivery_municipality": {
      if (isAltaDeliverySite(delivery)) {
        const confirmed = LOSA_FINNMARK_CONFIRMED_INDEX.filter(
          (entry) =>
            entry.claimClass === "delivery_municipality" &&
            entry.scope === "delivery_site_alta"
        );
        if (confirmed.length > 0) {
          return {
            claimClass,
            status: "row_confirmed",
            sourceIds: confirmed.map((s) => s.sourceId),
            publishable: true,
            rationale:
              "Alta delivery municipality CONFIRMED (P4-LOSA-CONFIRMED-ALTA-DELIVERY-post)",
          };
        }
        const snippets = snippetsForClaim(
          "delivery_municipality",
          (entry) => entry.scope === "delivery_site_alta"
        );
        if (snippets.length > 0) {
          return {
            claimClass,
            status: "snippet_only",
            sourceIds: snippets.map((s) => s.sourceId),
            publishable: false,
            rationale: "Alta kommune SNIPPET_ONLY — not CONFIRMED",
          };
        }
      }
      return {
        claimClass,
        status: "blocked",
        sourceIds: [],
        publishable: false,
        rationale: `No delivery_municipality evidence for ${delivery ?? "unknown"}`,
      };
    }
    case "programme_stage_availability": {
      if (isAltaDeliverySite(delivery)) {
        const confirmed = LOSA_FINNMARK_CONFIRMED_INDEX.filter(
          (entry) =>
            entry.claimClass === "programme_stage_availability" &&
            entry.scope === "delivery_site_alta"
        );
        if (confirmed.length > 0) {
          const providerReady =
            isNordkappProviderLabel(provider) && isNordkappProviderConfirmed();
          const deliveryReady = isAltaDeliveryConfirmed();

          if (providerReady && deliveryReady) {
            return {
              claimClass,
              status: "row_confirmed",
              sourceIds: confirmed.map((s) => s.sourceId),
              publishable: true,
              rationale:
                "Alta Nordkapp LOSA programme row closure — provider+delivery prerequisites met (P4-LOSA-ALTA-PROGRAMME-FULL)",
            };
          }

          return {
            claimClass,
            status: "row_confirmed_partial",
            sourceIds: confirmed.map((s) => s.sourceId),
            publishable: false,
            rationale:
              "Alta programme CONFIRMED — partial until provider+delivery row CONFIRMED",
          };
        }
      }
      return {
        claimClass,
        status: "blocked",
        sourceIds: [],
        publishable: false,
        rationale: `No programme_stage_availability CONFIRMED for ${delivery ?? "unknown"}`,
      };
    }
    case "publication_supporting_evidence": {
      const packet = altaSupportingEvidencePacketEntry();
      if (packet && isAltaDeliverySite(delivery)) {
        if (altaSupportingEvidencePrerequisitesMet(provider, delivery)) {
          return {
            claimClass,
            status: "row_confirmed",
            sourceIds: [packet.sourceId],
            componentSourceIds: packet.componentSourceIds ?? [],
            publishable: true,
            rationale:
              "Alta Tier 1+2 combined supporting-evidence packet (P4-LOSA-ALTA-SUPPORTING-EVIDENCE)",
          };
        }
        return {
          claimClass,
          status: "blocked",
          sourceIds: packet.sourceId ? [packet.sourceId] : [],
          publishable: false,
          rationale:
            "Supporting-evidence packet adopted but Alta row Tier 2 prerequisites incomplete",
        };
      }
      return {
        claimClass,
        status: "blocked",
        sourceIds: [],
        publishable: false,
        rationale:
          "Registry rule: publication_supporting_evidence never sufficient alone; no row packet",
      };
    }
    default:
      return {
        claimClass,
        status: "blocked",
        sourceIds: [],
        publishable: false,
        rationale: "Unknown claim class",
      };
  }

  return {
    claimClass,
    status: "blocked",
    sourceIds: [],
    publishable: false,
    rationale: "No evidence linkage",
  };
}

export function linkEvidenceToManifestRow(manifestRow) {
  const claimLinks = LOSA_FINNMARK_CLAIM_CLASSES.map((claimClass) =>
    assessClaimClassEvidenceLink(manifestRow, claimClass)
  );

  const blockedClaimClasses = claimLinks
    .filter((link) => !link.publishable)
    .map((link) => link.claimClass);

  const referenceOnlyClaimClasses = claimLinks
    .filter((link) => link.status === "county_reference_confirmed")
    .map((link) => link.claimClass);

  const partialClaimClasses = claimLinks
    .filter((link) => link.status === "row_confirmed_partial")
    .map((link) => link.claimClass);

  const snippetOnlyClaimClasses = claimLinks
    .filter((link) => link.status === "snippet_only")
    .map((link) => link.claimClass);

  const psaEligible = claimLinks.every((link) => link.publishable);

  return {
    ...manifestRow,
    evidenceLink: {
      section: "P4-LOSA-EVIDENCE-LINK-TRANCHE-2",
      confirmedIndexCount: LOSA_FINNMARK_CONFIRMED_INDEX.length,
      snippetOnlyIndexCount: LOSA_FINNMARK_SNIPPET_ONLY_INDEX.length,
      claimLinks,
      summary: {
        posture: psaEligible
          ? "ROW_SECTION_4_SATISFIED"
          : "STILL_BLOCKED_SECTION_4",
        psaEligible,
        routeEligible: false,
        phase2ConceptualState: psaEligible ? "needs_review" : "unsupported_losa",
        blockedClaimClasses,
        referenceOnlyClaimClasses,
        partialClaimClasses,
        snippetOnlyClaimClasses,
      },
    },
    publishability: {
      ...manifestRow.publishability,
      posture: psaEligible
        ? "ROW_SECTION_4_SATISFIED"
        : "STILL_BLOCKED_SECTION_4",
      psaEligible,
      blockedClaimClasses,
    },
  };
}

export function linkEvidenceToManifest(rows) {
  return rows.map((row) => linkEvidenceToManifestRow(row));
}

export function summarizeEvidenceLinkReport(linkedRows) {
  const altaRow = linkedRows.find((row) =>
    isAltaDeliverySite(row.entity?.deliverySiteLabel)
  );
  const rowsSection4Satisfied = linkedRows.filter(
    (row) => row.evidenceLink?.summary?.psaEligible
  ).length;
  const rowsStillBlocked = linkedRows.length - rowsSection4Satisfied;

  let publishabilityPosture = "STILL_BLOCKED_ALL_SECTION_4";
  if (rowsSection4Satisfied > 0 && rowsSection4Satisfied < linkedRows.length) {
    publishabilityPosture = "REFERENCE_ROW_SECTION_4_SATISFIED_PARTIAL";
  } else if (rowsSection4Satisfied === linkedRows.length) {
    publishabilityPosture = "ALL_ROWS_SECTION_4_SATISFIED";
  }

  return {
    section: "P4-LOSA-EVIDENCE-LINK-TRANCHE-2",
    rowCount: linkedRows.length,
    rowsStillBlocked,
    rowsSection4Satisfied,
    countyWideConfirmedCount: LOSA_FINNMARK_CONFIRMED_INDEX.length,
    altaRowDeliverySite: altaRow?.entity?.deliverySiteLabel ?? null,
    altaPartialClaims: altaRow?.evidenceLink?.summary?.partialClaimClasses ?? [],
    altaSnippetClaims: altaRow?.evidenceLink?.summary?.snippetOnlyClaimClasses ?? [],
    allRowsPsaEligible: rowsSection4Satisfied === linkedRows.length,
    publishabilityPosture,
  };
}
