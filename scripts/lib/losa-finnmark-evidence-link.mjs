import {
  LOSA_FINNMARK_CLAIM_CLASSES,
} from "./losa-finnmark-entity.mjs";
import {
  LOSA_FINNMARK_CONFIRMED_INDEX,
  LOSA_FINNMARK_SNIPPET_ONLY_INDEX,
  deliverySiteScopeForLabel,
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

function isDeliverySiteClaimConfirmed(claimClass, deliveryScope) {
  return LOSA_FINNMARK_CONFIRMED_INDEX.some(
    (entry) => entry.claimClass === claimClass && entry.scope === deliveryScope
  );
}

function supportingEvidencePacketForScope(deliveryScope) {
  return LOSA_FINNMARK_CONFIRMED_INDEX.find(
    (entry) =>
      entry.claimClass === "publication_supporting_evidence" &&
      entry.scope === deliveryScope
  );
}

/** Tier 1+2 row prerequisites before supporting-evidence packet may publish (never alone). */
function deliverySiteSupportingEvidencePrerequisitesMet(
  provider,
  delivery,
  deliveryScope
) {
  return (
    deliverySiteScopeForLabel(delivery) === deliveryScope &&
    isNordkappProviderLabel(provider) &&
    isNordkappProviderConfirmed() &&
    isDeliverySiteClaimConfirmed("delivery_municipality", deliveryScope) &&
    isDeliverySiteClaimConfirmed("programme_stage_availability", deliveryScope) &&
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
      const deliveryScope = deliverySiteScopeForLabel(delivery);
      if (deliveryScope) {
        const confirmed = LOSA_FINNMARK_CONFIRMED_INDEX.filter(
          (entry) =>
            entry.claimClass === "delivery_municipality" &&
            entry.scope === deliveryScope
        );
        if (confirmed.length > 0) {
          const siteLabel = delivery ?? "delivery site";
          return {
            claimClass,
            status: "row_confirmed",
            sourceIds: confirmed.map((s) => s.sourceId),
            publishable: true,
            rationale: `${siteLabel} delivery municipality CONFIRMED (${confirmed[0]?.ownerPost ?? "owner post"})`,
          };
        }
        const snippets = snippetsForClaim(
          "delivery_municipality",
          (entry) => entry.scope === deliveryScope
        );
        if (snippets.length > 0) {
          return {
            claimClass,
            status: "snippet_only",
            sourceIds: snippets.map((s) => s.sourceId),
            publishable: false,
            rationale: `${delivery ?? "delivery"} kommune SNIPPET_ONLY — not CONFIRMED`,
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
      const deliveryScope = deliverySiteScopeForLabel(delivery);
      if (deliveryScope) {
        const confirmed = LOSA_FINNMARK_CONFIRMED_INDEX.filter(
          (entry) =>
            entry.claimClass === "programme_stage_availability" &&
            entry.scope === deliveryScope
        );
        if (confirmed.length > 0) {
          const providerReady =
            isNordkappProviderLabel(provider) && isNordkappProviderConfirmed();
          const deliveryReady = isDeliverySiteClaimConfirmed(
            "delivery_municipality",
            deliveryScope
          );
          const siteLabel = delivery ?? "delivery site";

          if (providerReady && deliveryReady) {
            const fullClosurePost =
              deliveryScope === "delivery_site_alta"
                ? "P4-LOSA-ALTA-PROGRAMME-FULL"
                : deliveryScope === "delivery_site_hammerfest"
                  ? "P4-LOSA-HAMMERFEST-PROGRAMME-FULL"
                  : deliveryScope === "delivery_site_sor_varanger"
                    ? "P4-LOSA-SOR-VARANGER-PROGRAMME-FULL"
                    : deliveryScope === "delivery_site_porsanger"
                      ? "P4-LOSA-PORSANGER-PROGRAMME-FULL"
                      : deliveryScope === "delivery_site_karasjok"
                        ? "P4-LOSA-KARASJOK-PROGRAMME-FULL"
                        : deliveryScope === "delivery_site_kautokeino"
                          ? "P4-LOSA-KAUTOKEINO-PROGRAMME-FULL"
                          : deliveryScope === "delivery_site_vardo"
                            ? "P4-LOSA-VARDO-PROGRAMME-FULL"
                            : deliveryScope === "delivery_site_nesseby"
                              ? "P4-LOSA-NESSEBY-PROGRAMME-FULL"
                              : confirmed[0]?.ownerPost ?? "programme-full-closure";
            return {
              claimClass,
              status: "row_confirmed",
              sourceIds: confirmed.map((s) => s.sourceId),
              publishable: true,
              rationale: `${siteLabel} Nordkapp LOSA programme row closure — provider+delivery prerequisites met (${fullClosurePost})`,
            };
          }

          return {
            claimClass,
            status: "row_confirmed_partial",
            sourceIds: confirmed.map((s) => s.sourceId),
            publishable: false,
            rationale: `${siteLabel} programme CONFIRMED — partial until provider+delivery row CONFIRMED`,
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
      const deliveryScope = deliverySiteScopeForLabel(delivery);
      if (!deliveryScope) {
        return {
          claimClass,
          status: "blocked",
          sourceIds: [],
          publishable: false,
          rationale:
            "Registry rule: publication_supporting_evidence never sufficient alone; no row packet",
        };
      }

      const packet = supportingEvidencePacketForScope(deliveryScope);
      if (!packet) {
        return {
          claimClass,
          status: "blocked",
          sourceIds: [],
          publishable: false,
          rationale:
            "Registry rule: publication_supporting_evidence never sufficient alone; no row packet",
        };
      }

      if (deliverySiteSupportingEvidencePrerequisitesMet(provider, delivery, deliveryScope)) {
        const siteLabel = delivery ?? "delivery site";
        return {
          claimClass,
          status: "row_confirmed",
          sourceIds: [packet.sourceId],
          componentSourceIds: packet.componentSourceIds ?? [],
          publishable: true,
          rationale: `${siteLabel} Tier 1+2 combined supporting-evidence packet (${packet.ownerPost ?? "supporting-evidence"})`,
        };
      }

      return {
        claimClass,
        status: "blocked",
        sourceIds: packet.sourceId ? [packet.sourceId] : [],
        publishable: false,
        rationale: `Supporting-evidence packet adopted but ${delivery ?? "row"} Tier 2 prerequisites incomplete`,
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
