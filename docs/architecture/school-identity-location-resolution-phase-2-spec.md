# School Identity / Location Resolution — Phase 2 Spec

## 1. Purpose

Phase 2 defines a nationwide identity/location resolution layer that:

- separates school identity from location/campus;
- supports aliases, slash aliases, and Sami/Norwegian naming;
- supports nationwide school identity complexity across all Norway;
- prevents random campus selection;
- holds uncertainty without publishing false truth;
- defines publishability boundary before PSA writes.

## 2. Normative precedence

- `docs/architecture/norway-school-identity-matching-spec.md` is the normative source for mandatory school matching/domain safety rules.
- `docs/architecture/route-engine-master-spec.md` is the normative source for Route Engine runtime truth contract.
- This Phase 2 spec defines architecture/design boundaries for the next implementation phase.
- This spec does not reinterpret or override locked rules in the normative specs above.
- If a terminology or behavior conflict exists with locked specs, mark it as an unresolved architecture conflict and stop implementation until an explicit decision is recorded.

## Acceptance status

- Status: **ACCEPTED WITH NOTES**
- No blocking conflicts found with:
  - `docs/architecture/norway-school-identity-matching-spec.md`
  - `docs/architecture/route-engine-master-spec.md`
  - `docs/product-principles.md`
  - Phase 1A closure in `docs/architecture/norway-school-identity-matching-execution-plan.md`
- Implementation remains blocked until a separate DB model proposal is reviewed and approved.
- DB model proposal artifact status: **ACCEPTED WITH NOTES**:
  - `docs/architecture/school-identity-location-resolution-db-model-proposal.md`
- Next blocked step: **schema design draft**.
- No SQL/migration/schema/code/write integration starts until schema design draft is reviewed and approved.

Notes for next revision (non-blocking):

1. Add an explicit state-to-runtime implication table.
2. Define a minimal acceptance evidence / ADR artifact.
3. Make responsible provider vs delivery site explicit in DB proposal artifacts.
4. Specify `needs_review` governance before operator workflow rollout.
5. Publish decisions must require both `audit_ref` and `decision_basis_version`.

## Related non-normative planning artifacts

- These artifacts are supporting planning documents only.
- They do not change this spec's normative precedence.
- They do not approve SQL, writes, extraction, report execution, runtime integration, readiness/pipeline integration, helper integration, operator workflow, PSA publication, or Route Engine changes.
- They are used for planning Phase 2 validation-contour evidence handling.
- Supporting planning artifacts:
  - `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md`
  - `docs/architecture/phase-2-read-only-evidence-packet-format.md`
  - `docs/architecture/phase-2-read-only-evidence-report-design.md`

## 3. Nationwide scope

The model is nationwide and must account for:

- all fylker (not only validation counties);
- aliases and slash aliases;
- Sami/Norwegian naming;
- multiple NSR rows under one conceptual school identity;
- avdeling/campus/location separation;
- private and public VGS providers;
- alternative delivery forms;
- external delivery / LOSA as a future Phase 4 dependency;
- source drift over time;
- profession/stage-specific availability.

Explicit constraints:

- no county-specific production rules;
- no hardcoded regional exception;
- validation counties are examples only, not production rule definitions.

## 4. Scope / non-scope

Phase 2 solves:

- identity vs location separation;
- alias handling;
- multiple NSR rows under one identity;
- location/campus resolution states;
- deterministic publishability decisions;
- review states without publishing false truth.

Phase 2 does not solve:

- final LOSA/external-delivery model (Phase 4);
- Route Engine UI/runtime changes;
- family-facing display changes;
- fuzzy-threshold tuning;
- manual lookup tables;
- county-specific exceptions;
- PSA write expansion before model approval.

## 5. Problem classes (validation examples only)

- `15`: ambiguity/canonical review; app-visible result aligns with Vilbli but canonical NSR confidence is incomplete.
- `18`: slash alias and Sami/Norwegian naming context.
- `55`: multi-location/campus resolution issue.
- `56`: LOSA/external-delivery dependency; Phase 4 required.

These are validation examples only, not special-case production rules.

## 6. Hard invariants

- source observations are immutable;
- observation is not decision;
- candidate is not decision;
- review is not publication;
- unresolved evidence never becomes publishable truth;
- no random campus selection;
- no hidden manual truth;
- no UI compensation for unresolved source truth.

## 7. Proposed conceptual domain model

These are conceptual entities only:

- this section is not a DB schema commitment;
- no table/migration is approved by this spec alone;
- physical schema requires a separate DB model proposal and approval.

### 7.1 source_school_observations

- Purpose: immutable source facts from Vilbli and related extraction context.
- Key fields: `observation_id`, `source`, `county_code`, `profession_slug`, `stage`, `source_school_code`, `source_school_label`, `source_reference_url`, `source_snapshot_label`, `observed_at`.
- Evidence source: source extraction outputs only.
- Must not decide: canonical identity, location resolution, publishability.
- Nationwide considerations: supports all counties, changing source labels, and repeated snapshots over time.

### 7.2 school_identity_candidates

- Purpose: candidate identity/link set for each observation.
- Key fields: `observation_id`, `candidate_identity_key`, `candidate_nsr_institution_ids`, `match_signals`, `signal_version`, `generated_at`.
- Evidence source: deterministic matching signals and identity semantics outputs.
- Must not decide: final identity selection or publication.
- Nationwide considerations: supports alias-rich and multi-campus providers across counties.

### 7.3 identity_aliases

- Purpose: alias graph for one conceptual school identity.
- Key fields: `identity_key`, `alias_label`, `alias_type`, `language_variant`, `evidence_ref`, `active_from`, `active_to`.
- Evidence source: source labels, slash aliases, language variants, official naming references when available.
- Must not decide: availability publication or location assignment.
- Nationwide considerations: supports Sami/Norwegian dual naming and county-agnostic aliases.

### 7.4 school_locations / campuses

- Purpose: explicit location entities under identity.
- Key fields: `location_key`, `identity_key`, `nsr_institution_id`, `municipality_code`, `county_code`, `campus_label`, `location_evidence_ref`.
- Evidence source: NSR and source-backed location/campus indicators.
- Must not decide: publication by itself.
- Nationwide considerations: supports one identity mapped to multiple NSR rows.

### 7.5 school_identity_resolution_decisions

- Purpose: auditable decision records resolving observation -> identity/location state.
- Key fields: `decision_id`, `observation_id`, `decision_state`, `resolved_identity_key`, `resolved_location_key`, `decision_actor_type`, `decision_basis_version`, `decision_reason_codes`, `confidence_status`, `audit_ref`, `decided_at`, `superseded_by`.
- Evidence source: referenced observations, candidates, alias/location evidence, review notes.
- Must not decide: final publication without publication decision contract.
- Nationwide considerations: same state machine and audit rules for all counties/professions.

### 7.6 programme_availability_publication_decisions

- Purpose: final publishability gate for programme-stage availability.
- Key fields: `publication_decision_id`, `observation_id`, `programme_key`, `stage`, `publishability_state`, `verification_alignment_state`, `reason_codes`, `evidence_refs`, `decision_actor_type`, `decided_at`, `superseded_by`.
- Evidence source: resolution decisions plus source-backed programme/stage evidence.
- Must not decide: raw identity matching logic (consumes it).
- Nationwide considerations: publishability criteria remain deterministic and county-agnostic.

## 8. Decision ownership / audit

Decision-bearing entities must include:

- `decision_actor_type: system | operator`
- `decision_basis_version`
- `decision_reason_codes`
- confidence/review status
- `audit_ref`
- `decided_at`
- `superseded_by` (or equivalent explicit version chain)

Rules:

- operator review is allowed only when auditable and explicit;
- silent/manual mapping without recorded decision object is forbidden.
- decisions are append-only with supersession;
- prior decisions must not be destructively overwritten;
- incorrect decisions must be superseded by a new audited decision.

## 9. Decision states

Required state vocabulary:

- `publishable`
- `needs_review`
- `unsupported_losa`
- `external_delivery`
- `identity_unresolved`
- `location_unresolved`
- `ambiguous_candidates`
- `rejected_false_match`

Failure behavior:

- if evidence is missing or conflicting, state must be unresolved/review/unsupported and must never publish.

## 10. Terminology alignment

- Phase 2 decision states map to, but do not redefine, existing verification/readiness/publishability terms.
- Existing runtime terms from `route-engine-master-spec.md` remain unchanged.
- Current `verification_status` semantics remain unchanged.
- Readiness status semantics remain unchanged until separate approved integration.
- If alignment cannot be expressed without conflicting with locked specs, mark as unresolved architecture conflict requiring explicit decision.

## 11. Publishability contract

An observation can become `programme_school_availability` only if all are true:

- canonical NSR-linked identity is resolved;
- location ambiguity is resolved or proven irrelevant for publication scope;
- source-backed programme/stage observation exists;
- state is not `unsupported_losa` or `external_delivery`;
- auditable decision exists with reason codes and evidence references;
- review/verification state is accepted by policy.

No publishability expansion is allowed without auditable evidence.

## 12. Route Engine boundary

- Route Engine consumes only published DB truth.
- Route Engine must not select random campus.
- Route Engine must not show unsupported LOSA as ordinary school option.
- unresolved/review states remain operator-layer until explicitly modelled and approved.
- no family-facing display changes are defined by this Phase 2 spec.

## 13. Readiness compatibility

- readiness consumers must not break;
- no readiness JSON contract expansion until a separately approved integration phase;
- decision states enter diagnostics/read-only simulation first.

## 14. Pipeline integration direction (later only)

- `scripts/run-vgs-truth-pipeline.mjs` later consumes resolution/publication decisions.
- `scripts/classify-vgs-truth-readiness.mjs` later reports decision states after explicit contract approval.
- `scripts/school-identity-semantics.mjs` remains a signal extractor.
- `scripts/vgs-programme-materialization-planner.mjs` remains a programme planner.
- normal mode behavior remains unchanged until approved implementation phase.

## 15. County impact matrix (validation examples)

| County | Problem | Phase 2 can solve? | Phase 4 required? | Forbidden shortcuts |
|---|---|---:|---:|---|
| `15` | ambiguity/canonical confidence | yes, via explicit identity/location decisions | no | no random tie-break, no threshold tuning |
| `18` | slash alias / language-variant identity context | yes, via alias-aware identity resolution | no | no split-alias false separation, no regional hack |
| `55` | multi-location/campus ambiguity | yes, via location resolution states | no | no first-candidate campus selection |
| `56` | LOSA/external-delivery dependency | partially (state exposure only) | yes | no LOSA publish bypass, no county exception |

All other counties/professions follow the same model; no special-case exceptions.

## 16. Source drift handling

- prior decisions may become stale when source data changes;
- stale decisions cannot auto-publish without revalidation;
- source drift must produce review/revalidation state, not silent publication.

## 17. Implementation phases

1. spec freeze;
2. DB model proposal (separate artifact/approval);
3. read-only simulation;
4. operator review workflow;
5. controlled publication;
6. PSA write integration only after explicit approval.

## 18. Phase 2 acceptance gate

Implementation is blocked until all are true:

- spec reviewed and accepted;
- acceptance decision logged;
- DB model proposal exists and is approved separately;
- read-only simulation plan approved;
- no conflict with canonical locked specs;
- no write integration before explicit approval.

## 19. Success criteria

Phase 2 is successful when:

- no random campus selection path remains;
- ambiguous cases become explicit decision states;
- source observations remain immutable;
- unresolved remains unresolved (never silently promoted);
- no regression on green counties;
- no publishability expansion without auditable evidence;
- all decision outcomes include reason codes and evidence references;
- no hidden manual truth.

## 20. Risks / guardrails

- over-modelling;
- hidden manual truth;
- wrong campus selection;
- source drift;
- UI leakage;
- operational burden;
- nationwide edge cases;
- no matching threshold tuning as mitigation.

## 21. Relationship to Phase 4

- LOSA/external-delivery final model belongs to Phase 4.
- Phase 2 may expose unresolved/external_delivery states but must not publish them.
- `56`/Finnmark cannot become publishable truth until a Phase 4 LOSA contract exists and is approved.
