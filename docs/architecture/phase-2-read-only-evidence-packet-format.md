# Phase 2 Read-Only Evidence Packet Format

## 1. Status / boundary

- Status: **PLANNING ARTIFACT / DOCS-ONLY**.
- Purpose: define a reusable read-only evidence packet format for Phase 2 validation/governance contour.
- Nationwide-first: format applies to any county/profession/stage case.
- No evidence extraction execution is approved by this document.
- No DB writes are approved by this document.
- No decision rows are approved by this document.
- No operator workflow is approved by this document.
- No PSA publication activation is approved by this document.
- No runtime/readiness/pipeline integration is approved by this document.
- No Route Engine changes are approved by this document.
- Separate owner gate is required before any execution or integration step.

## 2. Relationship to backlog

- Related backlog artifact:
  - `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md`
- The backlog defines case classification, boundary constraints, and governance gate ladder.
- This document defines the reusable evidence packet shape used to evaluate cases consistently.
- This document does not change backlog classifications.
- This document does not activate workflow, publication, or integration.
- If classification wording here conflicts with the backlog, the backlog controls classification semantics.
- This document does not change classification categories, case states, or governance gates from the backlog.
- Related future Phase 4 planning artifact: `docs/architecture/phase-4-losa-official-source-evidence-refresh-design.md` — docs-only, non-canonical official-source evidence + automated refresh requirements for LOSA/external-delivery; it does not change packet shape, classification semantics, workflow, publication, or integration approval.

## 3. Authority / precedence

- This document defines evidence packet shape only.
- Classification semantics remain governed by:
  - `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md`
- Route/runtime boundaries remain governed by:
  - `docs/architecture/route-engine-master-spec.md`
  - `docs/architecture/school-identity-location-resolution-phase-2-spec.md`
- Helper/readiness/pipeline boundaries remain governed by:
  - `docs/architecture/phase-2-read-only-diagnostics-contract.md`
  - `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`
- If this document conflicts with those sources, this document does not expand scope and must be corrected.
- This document is not a source of truth for runtime, publication, or workflow approvals.

## 4. Packet purpose

An evidence packet is:

- a read-only structured dossier for one county/profession/stage/source-snapshot case;
- a planning/evaluation artifact to support future review and decision readiness;
- a format for auditable evidence assembly before any future decision-row or publication path is considered.

An evidence packet is **not**:

- not a decision row;
- not a publication decision;
- not runtime truth;
- not Route Engine input;
- not a PSA write;
- not operator workflow activation;
- not proof that a case is publishable.

## 5. Packet identity / metadata

Required fields:

- `packet_id` (planning identifier only, not DB id)
- `county_code`
- `county_name`
- `profession_slug`
- `stage`
- `source_snapshot_label`
- `source_reference_url`
- `source_observed_at` (if available)
- `packet_created_at`
- `packet_created_by_type`
- `packet_status`

Allowed `packet_status` values:

- `draft`
- `ready_for_review`
- `evidence_incomplete`
- `blocked_losa`
- `blocked_external_delivery`
- `archived`

Rules:

- `packet_status` is planning/report state only.
- `packet_status` is not `publishability_state`.
- `packet_status` does not drive runtime behavior.

| `packet_status` rule | Meaning |
|---|---|
| Planning/report status only | It is not product runtime state. |
| No workflow authority | Changing status is not an enabled operator action. |
| No publishability authority | It is not `publishability_state` and cannot activate publication. |
| No implementation handoff | It does not create code/script/Supabase tasks without a separate owner gate. |

## 6. Source evidence block

Fields:

- `source_system`
- `source_page_type`
- `source_url`
- `source_snapshot_label`
- `source_extraction_context`
- `raw_source_school_label`
- `raw_source_school_code` (if available)
- `raw_programme_label`
- `raw_stage_label`
- `source_county_context`
- `source_profession_context`
- `source_limitations`

Rules:

- Missing fields must be recorded as `evidence not yet structured in current docs/scripts`.
- No manual internet lookup is baseline input.
- No runtime scraping or extraction execution is implied by this format.

## 7. NSR linkage evidence block

Fields:

- `nsr_candidate_institution_ids`
- `nsr_candidate_names`
- `nsr_candidate_org_numbers` (if available)
- `nsr_candidate_municipality`
- `nsr_candidate_county`
- `match_type`
- `match_score_or_confidence` (if available)
- `match_reason_codes`
- `rejected_candidate_rationale`
- `unresolved_candidate_rationale`

Rules:

- No first-candidate-by-sort shortcut.
- No random campus selection.
- No false tie-break shortcut.
- No fuzzy-threshold weakening to force green status.

## 8. Alias / language evidence block

Fields:

- `slash_alias_present`
- `source_alias_labels`
- `normalized_alias_labels`
- `language_variants`
- `sami_norwegian_variant_present`
- `alias_resolution_rationale`
- `alias_evidence_gaps`

Rules:

- Slash-separated labels may represent aliases of one identity, not multiple schools.
- Bilingual labels must not be split into false identities.
- Alias evidence alone does not create publishability.

## 9. Location / campus / avdeling evidence block

Fields:

- `location_signal_present`
- `possible_locations`
- `possible_avdelinger`
- `provider_identity_candidate`
- `delivery_location_candidate`
- `location_disambiguation_rationale`
- `location_unresolved_reason`
- `location_evidence_gaps`

Rules:

- One school identity can map to multiple locations.
- No random campus selection.
- No first NSR candidate shortcut.
- Unresolved location must remain unresolved / `needs_review`.

## 10. LOSA / external delivery evidence block

Fields:

- `losa_signal_present`
- `external_delivery_signal_present`
- `losa_label`
- `delivery_site_label`
- `responsible_provider_candidate`
- `delivery_model_uncertainty`
- `phase4_dependency_reason`

Rules:

- LOSA/external delivery is not ordinary school availability.
- LOSA/external delivery remains blocked until separately modelled in Phase 4.
- No LOSA ordinary-school publication in Phase 2 baseline.

## 11. Ambiguity and conflict block

Fields:

- `ambiguity_type`
- `conflicting_candidates`
- `conflict_reason_codes`
- `unresolved_fields`
- `false_match_risks`
- `recommended_blocking_state`

Allowed `ambiguity_type` values:

- `identity_ambiguity`
- `location_ambiguity`
- `alias_ambiguity`
- `losa_external_delivery`
- `insufficient_source_evidence`
- `stale_source_conflict`
- `candidate_tie`

Rules:

- Ambiguity must not be hidden.
- Ambiguity must not be replaced by UI compensation.
- Unresolved is safer than false truth.

## 12. Conceptual state recommendation block

Conceptual mapping targets:

- `publishable`
- `needs_review`
- `unsupported_losa`
- `external_delivery`
- `identity_unresolved`
- `location_unresolved`
- `ambiguous_candidates`
- `rejected_false_match`

Rules:

- Conceptual only.
- No DB writes.
- No active decision rows.
- No runtime consumption.
- No operator workflow activation.
- No PSA publication activation.
- `publishable` recommendation is not active publishability.

## 13. Evidence completeness checklist

For a packet to be marked `ready_for_review`, minimum categories should be present:

- source evidence present
- NSR candidate evidence present
- alias/language evidence evaluated
- location/campus evidence evaluated
- LOSA/external-delivery signals evaluated
- ambiguity rationale present
- rejected candidate rationale present where relevant
- source limitations recorded
- evidence gaps recorded

Rules:

- `ready_for_review` does not mean `publishable`.
- `ready_for_review` does not approve writes or publication.

### Minimum sufficiency signals

- source limitations recorded
- alias/language checked
- location ambiguity recorded or marked irrelevant with evidence
- rejected candidate rationale present where relevant
- unresolved reason explicit where evidence is incomplete
- LOSA/external-delivery checked
- evidence gaps explicitly listed

Warning:

- These are review/planning sufficiency signals only; they do not create automation, publishability, or workflow.

## 14. Packet examples: seed-case mapping only

Seed example scope (format demonstration only):

- `18` Nordland
- `55` Troms
- `56` Finnmark
- optional `15` Møre og Romsdal comparison

Rules for examples:

- Do not create full fake packets.
- Do not invent `source_snapshot_label`.
- Use `evidence not yet structured in current docs/scripts` where unknown.
- Examples show how the format applies; they do not assert final truth.

## 15. Forbidden shortcuts

- no random campus
- no first candidate by sort order
- no manual internet-derived lookup tables
- no county-specific hacks
- no weakening fuzzy thresholds
- no LOSA ordinary-school publish
- no Route Engine workaround
- no UI compensation
- no decision rows
- no PSA writes/publication
- no operator workflow
- no readiness/pipeline/helper integration
- no runtime consumption of raw Phase 2 evidence

## 16. Future gates

Each gate below requires separate owner approval and is not approved by this document:

Packet readiness is not a handoff to code, script, Supabase, operator workflow, PSA publication, or Route Engine work without a separate owner gate.

| Gate | Purpose | Not approved by this document |
|---|---|---|
| Gate A | Approve this evidence packet format as planning artifact | Any extraction/write/integration |
| Gate B | Approve read-only evidence extraction/report design | Extraction execution and writes |
| Gate C | Approve read-only evidence report execution | Decision-row writes and publication activation |
| Gate D | Approve operator review state-machine design | Operator workflow activation |
| Gate E | Approve decision-row write path (if ever needed) | Publication/runtime integration by default |
| Gate F | Approve PSA publication integration (if ever needed) | Readiness/pipeline/runtime integration by default |
| Gate G | Approve readiness/pipeline integration (if ever needed) | Route Engine/runtime coupling by default |
| Gate H | Approve Route Engine consumption of published truth (if ever needed) | Raw-state consumption and unresolved-state runtime use |
| Gate I | Approve separate Phase 4 LOSA/external-delivery model | Ordinary-school LOSA publication without Phase 4 contract |

## 17. Out of scope

- code implementation
- scripts
- Supabase operations
- migrations
- DB writes
- runtime integration
- readiness/pipeline integration
- operator workflow
- PSA publication
- Route Engine changes
- extraction execution

## 18. Normative references

- `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md`
- `docs/architecture/school-identity-location-resolution-phase-2-spec.md`
- `docs/architecture/school-identity-location-resolution-db-model-proposal.md`
- `docs/architecture/school-identity-location-resolution-schema-design-draft.md`
- `docs/architecture/school-identity-location-resolution-sql-migration-proposal.md`
- `docs/architecture/norway-school-identity-matching-spec.md`
- `docs/architecture/norway-school-identity-matching-execution-plan.md`
- `docs/architecture/phase-2-main-supabase-rollout-checklist.md`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`
- `docs/architecture/route-engine-master-spec.md`
- `docs/product-principles.md`
