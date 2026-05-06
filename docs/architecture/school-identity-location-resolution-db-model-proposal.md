# School Identity / Location Resolution — DB Model Proposal

## 1. Purpose

- Propose a DB-level model for Phase 2 identity/location resolution.
- This document is architecture-level only: no SQL and no migration approval.
- This document does not approve write integration.
- The proposal defines a nationwide verification/resolution layer.

## 2. Nationwide principle

- No county-specific production rules.
- No hardcoded regional exceptions.
- No fylke-specific override tables.
- Validation counties are examples only (`15` / `18` / `55` / `56`), not production rule definitions.
- Regional specifics must be represented through general model fields/states, never by ad hoc county logic.

## 3. Proposed models

### 3.1 source_school_observations

- **Purpose:** immutable source facts per snapshot/profession/stage/school row.
- **Key fields:** `id`, `source`, `county_code`, `profession_slug`, `stage`, `source_school_code`, `source_school_label`, `source_reference_url`, `source_snapshot_label`, `observed_at`.
- **Required fields:** source identifiers, school label/code, stage/profession, snapshot label, observed timestamp.
- **Conceptual unique constraints:** one observation per `(source, source_snapshot_label, county_code, profession_slug, stage, source_school_code, source_school_label)`.
- **Conceptual foreign keys:** referenced by candidates and decisions.
- **Mutability:** append-only (new snapshots add rows; no destructive update).
- **Must never be stored here:** resolved identity/location/publication decisions.
- **Nationwide considerations:** supports all fylker/professions/stages and source drift over time.

### 3.2 school_identity_candidates

- **Purpose:** candidate identity/location mapping outcomes derived from observation + signals.
- **Key fields:** `id`, `observation_id`, `candidate_identity_key`, `candidate_nsr_institution_id`, `candidate_location_key`, `match_signals`, `signal_version`, `generated_at`.
- **Required fields:** observation reference, candidate identity key, signal metadata/version, generated timestamp.
- **Conceptual unique constraints:** avoid duplicates per `(observation_id, candidate_identity_key, candidate_nsr_institution_id, signal_version)`.
- **Conceptual foreign keys:** `observation_id -> source_school_observations.id`.
- **Mutability:** append-only by generation/version.
- **Must never be stored here:** final publishability decisions.
- **Nationwide considerations:** supports alias-rich and multi-campus candidates across all counties.

### 3.3 identity_aliases

- **Purpose:** alias graph for conceptual school identity.
- **Key fields:** `id`, `identity_key`, `alias_label`, `alias_type`, `language_variant`, `evidence_ref`, `valid_from`, `valid_to`.
- **Required fields:** identity key, alias label, alias type, evidence reference.
- **Conceptual unique constraints:** `(identity_key, normalized_alias_label, alias_type, language_variant)`.
- **Conceptual foreign keys:** optional reference to identity registry key.
- **Mutability:** append with supersession/time-bounds (history retained).
- **Must never be stored here:** publication state or runtime route-facing flags.
- **Nationwide considerations:** supports Sami/Norwegian naming and slash aliases without county hacks.

### 3.4 school_locations

- **Purpose:** location/campus entities under identity.
- **Key fields:** `id`, `location_key`, `identity_key`, `nsr_institution_id`, `county_code`, `municipality_code`, `location_label`, `location_evidence_ref`.
- **Required fields:** location key, identity key, evidence reference.
- **Conceptual unique constraints:** `(identity_key, location_key)`; optionally uniqueness for `(identity_key, nsr_institution_id)`.
- **Conceptual foreign keys:** identity key (conceptual), NSR institution where applicable.
- **Mutability:** append/versioned preferred; no destructive overwrite for resolved history.
- **Must never be stored here:** implicit publication approval.
- **Nationwide considerations:** supports one identity to many NSR rows across counties.

### 3.5 school_identity_resolution_decisions

- **Purpose:** auditable resolution decisions from observation to identity/location/provider semantics.
- **Key fields:** `id`, `observation_id`, `decision_state`, `resolved_identity_key`, `resolved_location_key`, `responsible_provider_institution_id`, `delivery_site_institution_id`, `decision_actor_type`, `decision_basis_version`, `decision_reason_codes`, `confidence_status`, `audit_ref`, `decided_at`, `superseded_by`.
- **Required fields:** observation reference, decision state, actor type, basis version, reason codes, audit ref, decided timestamp.
- **Conceptual unique constraints:** one active decision per observation (history via supersession).
- **Conceptual foreign keys:** `observation_id -> source_school_observations.id`, optional refs to identity/location/provider entities.
- **Mutability:** append-only with supersession.
- **Must never be stored here:** destructive overwrite of prior decision truth.
- **Nationwide considerations:** identical state machine/rules for all regions and professions.

### 3.6 programme_availability_publication_decisions

- **Purpose:** final publication gate for programme-stage availability.
- **Key fields:** `id`, `observation_id`, `programme_key`, `stage`, `publishability_state`, `verification_alignment_state`, `decision_actor_type`, `decision_basis_version`, `decision_reason_codes`, `audit_ref`, `decided_at`, `superseded_by`.
- **Required fields:** observation/programme/stage refs, publishability state, actor/basis/reason/audit/timestamp.
- **Conceptual unique constraints:** one active publication decision per `(observation_id, programme_key, stage)`.
- **Conceptual foreign keys:** observation reference; conceptual link to identity resolution decision.
- **Mutability:** append-only with supersession.
- **Must never be stored here:** undocumented manual publish bypass.
- **Nationwide considerations:** deterministic gate independent of county.

### 3.7 optional school_identity_review_events

- **Purpose:** review workflow event log (assign/escalate/comment/close).
- **Key fields:** `id`, `target_decision_id`, `event_type`, `event_reason`, `event_payload`, `actor`, `created_at`.
- **Required fields:** decision target, event type, actor, timestamp.
- **Conceptual unique constraints:** event id only (log stream).
- **Conceptual foreign keys:** target decision reference.
- **Mutability:** append-only log.
- **Must never be stored here:** final authoritative decision state replacement.
- **Nationwide considerations:** supports consistent review audit across all counties.

## 4. Responsible provider vs delivery site

Model explicitly distinguishes:

- `responsible_provider_institution_id`
- `delivery_site_institution_id`
- `resolved_identity_key`
- `resolved_location_key`

Nullability rules:

- `resolved_identity_key`: nullable only when decision is unresolved (`identity_unresolved`, `ambiguous_candidates`).
- `resolved_location_key`: nullable when location is unresolved or irrelevant for current publication scope.
- `responsible_provider_institution_id`: required for publishable decisions; nullable for unresolved/unsupported.
- `delivery_site_institution_id`: nullable when delivery site is unknown/not modelled (especially external delivery cases).

Why separation is mandatory:

- Responsible provider (administrative/legal owner) is not always identical to delivery site.
- Conflating them causes false campus truth and can force invalid publication.

## 5. State-to-runtime implication table

| Decision state | Can write PSA? | Can Route Engine consume? | Operator action | Runtime implication |
|---|---|---|---|---|
| `publishable` | Yes (after gate checks) | Yes | monitor | eligible truth row |
| `needs_review` | No | No (truth layer) | review required | hold from publication |
| `unsupported_losa` | No | No | model/escalate to Phase 4 path | unsupported |
| `external_delivery` | No (Phase 2) | No | classify/escalate | blocked pending model |
| `identity_unresolved` | No | No | resolve identity evidence | blocked |
| `location_unresolved` | No | No | resolve location/provider semantics | blocked |
| `ambiguous_candidates` | No | No | disambiguate candidate set | blocked |
| `rejected_false_match` | No | No | regenerate/repair candidate set | blocked |

## 6. Audit / governance rules

Required decision fields:

- `decision_actor_type: system | operator`
- `decision_basis_version`
- `decision_reason_codes`
- `audit_ref`
- `decided_at`
- `superseded_by`

Rules:

- append-only with supersession;
- no destructive overwrite;
- no hidden manual truth;
- every publish-oriented decision must carry auditable reason + basis references.

## 7. needs_review governance

Must exist before operator workflow rollout:

- explicit ownership model (team/role);
- allowed state transitions matrix;
- stale review handling policy;
- escalation/ageing rules;
- explicit authority defining who can mark `publishable`;
- mandatory audit payload for each transition decision.

## 8. Publication gate

A row can become PSA only when all are true:

- source observation is valid and in scope;
- identity is resolved;
- provider/location semantics are resolved or proven irrelevant;
- state is not `unsupported_losa` / `external_delivery`;
- decision is accepted by governance policy;
- `audit_ref` present;
- `decision_basis_version` present;
- decision is not stale against latest source snapshot.

## 9. Source drift / versioning

Track and enforce:

- `source_snapshot_label`
- `observed_at`
- `signal_version`
- `decision_basis_version`
- supersession chain (`superseded_by`)
- revalidation requirement when source changes

Rule:

- stale decisions cannot auto-publish.

## 10. Phase 4 relationship

- LOSA/external-delivery final model remains Phase 4 scope.
- Phase 2 may store `unsupported_losa` / `external_delivery` states.
- Phase 2 must not publish LOSA as ordinary school availability truth.

## 11. Risks / guardrails

- over-modelling;
- hidden manual truth;
- wrong campus/provider conflation;
- DB complexity;
- review burden;
- stale decisions;
- accidental PSA expansion;
- regional hacks.

Guardrail:

- no matching-threshold tuning as substitute for identity/location/delivery modelling.

## 12. Approval status

- Status: **PROPOSAL / NOT YET APPROVED**
- No SQL/migration is approved by this proposal.
- No schema/code/write integration is approved by this proposal.
- Next step requires explicit review/acceptance decision.
