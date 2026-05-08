# School Identity / Location Resolution — Schema Design Draft

## 1. Status / boundary

- Status: **DRAFT / NOT APPROVED**
- Note: this status describes the draft artifact / non-executable boundary, not a denial of later review lineage.
- Acceptance context is recorded in the acceptance section below and related accepted-with-notes artifacts; no SQL/write/runtime/operator/PSA approval or broader Phase 2 completion is implied here.
- Nationwide model intent only.
- No SQL is defined in this draft.
- No migrations are approved by this draft.
- No DB schema changes are approved by this draft.
- No schema/code/write integration is approved by this draft.
- No runtime behavior changes are approved by this draft.

### Non-runtime disclaimer

This draft defines **data-shape intent only**. It:

- does not approve SQL;
- does not approve migrations;
- does not approve schema changes;
- does not approve runtime behavior changes;
- does not change Route Engine behavior;
- does not change readiness JSON;
- does not create new DB dependencies for runtime;
- does not approve write integration.

## 2. Normative sources and precedence

Authoritative references:

- `docs/architecture/school-identity-location-resolution-phase-2-spec.md`
- `docs/architecture/school-identity-location-resolution-db-model-proposal.md`
- `docs/architecture/school-identity-location-resolution-sql-migration-proposal.md`
- `docs/architecture/norway-school-identity-matching-spec.md`
- `docs/architecture/route-engine-master-spec.md`
- `docs/product-principles.md`

Conflict rule:

- If this draft conflicts with any locked source above, mark:
  - **UNRESOLVED ARCHITECTURE CONFLICT**
- Do not silently resolve conflicts inside this draft.
- No schema design approval may proceed until a separate architecture decision record resolves the conflict.

## 3. Terminology alignment

| Phase 2 decision state | Verification/runtime implication now | Readiness JSON changes now | Route Engine consumes now |
|---|---|---|---|
| `publishable` | Can be considered for PSA eligibility only after publication gate passes | no | no, unless publishable PSA exists |
| `needs_review` | Review-only state; not publishable | no | no |
| `unsupported_losa` | Unsupported in Phase 2; blocked for ordinary school truth | no | no |
| `external_delivery` | Non-ordinary delivery; blocked pending Phase 4 model | no | no |
| `identity_unresolved` | Identity unresolved; blocked | no | no |
| `location_unresolved` | Location/provider semantics unresolved; blocked | no | no |
| `ambiguous_candidates` | Candidate ambiguity unresolved; blocked | no | no |
| `rejected_false_match` | Explicit rejection of false match; blocked | no | no |

Explicit constraints:

- `verification_status` semantics are governed by Route Engine/master truth contract.
- This schema draft does not redefine `verification_status`.
- Any future mapping from Phase 2 decision states to verification/runtime terms requires separate approved integration.

## 4. Naming / key governance

Key strategy (conceptual):

- `identity_key` is a durable identifier, stable across label/name changes.
- `location_key` is a durable identifier for location/campus semantics.
- `source_snapshot_key` uses immutable source snapshot references (e.g., `source_snapshot_label` + source context).

Governance rules:

- Labels are mutable evidence; keys are durable identifiers.
- Merge/split for identities/locations must use audited supersession/mapping; no destructive key reuse.
- No county-specific key generation logic.
- No key derived solely from mutable display label.
- Collision handling must be deterministic and auditable (recorded in decision/audit chain).

## 5. Proposed table drafts (conceptual only)

All table/column/constraint definitions below are conceptual draft only:

- not a DB schema commitment;
- no table/migration is approved by this draft alone;
- physical SQL design requires separate review/approval.

### 5.1 `source_school_observations`

- **Purpose:** immutable source observations per snapshot/profession/stage/school.
- **Conceptual columns (type category):**
  - `id` (`uuid`)
  - `source` (`text`)
  - `county_code` (`text`)
  - `profession_slug` (`text`)
  - `stage` (`text`)
  - `source_school_code` (`text`)
  - `source_school_label` (`text`)
  - `source_reference_url` (`text`)
  - `source_snapshot_label` (`text`)
  - `observed_at` (`timestamptz`)
  - `observation_payload` (`jsonb`)
- **Required/nullable:** all above required except optional payload extensions.
- **Conceptual PK:** `id`.
- **Conceptual unique constraints:** `(source, source_snapshot_label, county_code, profession_slug, stage, source_school_code, source_school_label)`.
- **Conceptual FKs:** referenced by candidate/decision tables.
- **Mutability:** append-only.
- **Key validation rules:** source + snapshot + stage/profession context required.
- **Forbidden contents:** resolved identity/location/publication decisions.

### 5.2 `school_identity_candidates`

- **Purpose:** candidate identity/location results from matching signals.
- **Conceptual columns:**
  - `id` (`uuid`)
  - `observation_id` (`uuid`)
  - `candidate_identity_key` (`text`)
  - `candidate_nsr_institution_id` (`uuid`/`text`)
  - `candidate_location_key` (`text`)
  - `match_signals` (`jsonb`)
  - `signal_version` (`text`)
  - `generated_at` (`timestamptz`)
- **Required/nullable:** `observation_id`, `candidate_identity_key`, `match_signals`, `signal_version`, `generated_at` required.
- **Conceptual PK:** `id`.
- **Conceptual unique constraints:** `(observation_id, candidate_identity_key, candidate_nsr_institution_id, signal_version)`.
- **Conceptual FKs:** `observation_id -> source_school_observations.id`.
- **Mutability:** append-only by generation version.
- **Key validation rules:** signal version mandatory; candidate key must conform to key governance.
- **Forbidden contents:** final publication decisions.

### 5.3 `identity_aliases`

- **Purpose:** alias mapping for conceptual school identities.
- **Conceptual columns:**
  - `id` (`uuid`)
  - `identity_key` (`text`)
  - `alias_label` (`text`)
  - `alias_type` (`enum-like text`)
  - `language_variant` (`text`)
  - `evidence_ref` (`text`/`jsonb`)
  - `valid_from` (`timestamptz`)
  - `valid_to` (`timestamptz`)
- **Required/nullable:** `identity_key`, `alias_label`, `alias_type`, `evidence_ref` required.
- **Conceptual PK:** `id`.
- **Conceptual unique constraints:** `(identity_key, normalized_alias_label, alias_type, language_variant)`.
- **Conceptual FKs:** optional conceptual reference to identity entity.
- **Mutability:** append + time-bounded supersession.
- **Key validation rules:** alias must carry evidence reference.
- **Forbidden contents:** publishability/runtime flags.

### 5.4 `school_locations`

- **Purpose:** location/campus entities under identity.
- **Conceptual columns:**
  - `id` (`uuid`)
  - `location_key` (`text`)
  - `identity_key` (`text`)
  - `nsr_institution_id` (`uuid`/`text`)
  - `county_code` (`text`)
  - `municipality_code` (`text`)
  - `location_label` (`text`)
  - `location_evidence_ref` (`text`/`jsonb`)
- **Required/nullable:** `location_key`, `identity_key`, `location_evidence_ref` required.
- **Conceptual PK:** `id`.
- **Conceptual unique constraints:** `(identity_key, location_key)` and optionally `(identity_key, nsr_institution_id)`.
- **Conceptual FKs:** conceptual refs to identity and NSR provider record.
- **Mutability:** versioned/superseded, no destructive overwrite.
- **Key validation rules:** location key stable across label changes.
- **Forbidden contents:** implicit publish approvals.

### 5.5 `school_identity_resolution_decisions`

- **Purpose:** auditable resolution decisions for identity/location/provider semantics.
- **Conceptual columns:**
  - `id` (`uuid`)
  - `observation_id` (`uuid`)
  - `decision_state` (`enum-like text`)
  - `resolved_identity_key` (`text`)
  - `resolved_location_key` (`text`)
  - `responsible_provider_institution_id` (`uuid`/`text`)
  - `delivery_site_institution_id` (`uuid`/`text`)
  - `decision_actor_type` (`enum-like text`)
  - `decision_basis_version` (`text`)
  - `decision_reason_codes` (`jsonb`)
  - `confidence_status` (`enum-like text`)
  - `audit_ref` (`text`)
  - `decided_at` (`timestamptz`)
  - `superseded_by` (`uuid`)
- **Required/nullable:** `observation_id`, `decision_state`, `decision_actor_type`, `decision_basis_version`, `decision_reason_codes`, `audit_ref`, `decided_at` required.
- **Conceptual PK:** `id`.
- **Conceptual unique constraints:** one active decision per `observation_id`.
- **Conceptual FKs:** `observation_id -> source_school_observations.id`, optional refs to location/publication decisions.
- **Mutability:** append-only with supersession.
- **Key validation rules:** no publish-oriented decision without `audit_ref` + `decision_basis_version`.
- **Forbidden contents:** destructive overwrite of prior decisions.

### 5.6 `programme_availability_publication_decisions`

- **Purpose:** publication gate decisions for programme/stage availability.
- **Conceptual columns:**
  - `id` (`uuid`)
  - `observation_id` (`uuid`)
  - `programme_key` (`text`)
  - `stage` (`text`)
  - `publishability_state` (`enum-like text`)
  - `verification_alignment_state` (`text`)
  - `decision_actor_type` (`enum-like text`)
  - `decision_basis_version` (`text`)
  - `decision_reason_codes` (`jsonb`)
  - `audit_ref` (`text`)
  - `decided_at` (`timestamptz`)
  - `superseded_by` (`uuid`)
- **Required/nullable:** all listed fields required except optional alignment metadata.
- **Conceptual PK:** `id`.
- **Conceptual unique constraints:** one active decision per `(observation_id, programme_key, stage)`.
- **Conceptual FKs:** `observation_id -> source_school_observations.id`, conceptual link to active resolution decision.
- **Mutability:** append-only with supersession.
- **Key validation rules:** publishability only via gate checks in section 9.
- **Forbidden contents:** undocumented manual publish bypass.

### 5.7 `school_identity_review_events`

- **Purpose:** workflow/audit events for review operations.
- **Conceptual columns:**
  - `id` (`uuid`)
  - `target_decision_id` (`uuid`)
  - `review_event_type` (`enum-like text`)
  - `actor_id` (`text`)
  - `actor_type` (`text`)
  - `event_reason_codes` (`jsonb`)
  - `event_payload` (`jsonb`)
  - `created_at` (`timestamptz`)
- **Required/nullable:** target decision, actor, event type, timestamp required.
- **Conceptual PK:** `id`.
- **Conceptual unique constraints:** log-stream (event id only).
- **Conceptual FKs:** target decision -> decision/publication tables as scoped by workflow.
- **Mutability:** append-only.
- **Key validation rules:** every review transition must emit event payload with audit linkage.
- **Forbidden contents:** replacing authoritative decision state.

## 6. State enums / allowed values (enum-like text)

- `decision_state`:
  - `publishable`
  - `needs_review`
  - `unsupported_losa`
  - `external_delivery`
  - `identity_unresolved`
  - `location_unresolved`
  - `ambiguous_candidates`
  - `rejected_false_match`
- `publishability_state`:
  - `publishable`
  - `blocked_review`
  - `blocked_unsupported`
  - `blocked_unresolved`
  - `blocked_rejected`
- `decision_actor_type`:
  - `system`
  - `operator`
- `confidence_status`:
  - `high`
  - `medium`
  - `low`
  - `unresolved`
- `review_event_type`:
  - `assigned`
  - `commented`
  - `escalated`
  - `state_changed`
  - `closed`
  - `reopened`
- `alias_type`:
  - `slash_alias`
  - `language_variant`
  - `official_name_variant`
  - `historical_alias`

Enum evolution policy:

- enum/state value versioning is not finalized in this draft;
- deprecation strategy must be approved before SQL;
- new state values must not silently change runtime behavior.

## 7. State transition matrix

| From state | Allowed transitions | Forbidden transitions | Actor authority | Audit required |
|---|---|---|---|---|
| `needs_review` | `publishable`, `identity_unresolved`, `location_unresolved`, `unsupported_losa`, `external_delivery`, `rejected_false_match` | silent publish without evidence | operator (or system under approved rules) | yes |
| `publishable` | `needs_review` (on drift), `rejected_false_match` | direct to unsupported without decision event | system/operator per approved rules | yes |
| `unsupported_losa` | `needs_review` (if new model/evidence), remains unsupported | direct publish in Phase 2 | operator/system (contracted rules only) | yes |
| `external_delivery` | `needs_review`, `unsupported_losa` | direct publish in Phase 2 | operator/system | yes |
| `identity_unresolved` | `needs_review`, `publishable` (after full evidence) | publish without identity resolution | operator/system | yes |
| `location_unresolved` | `needs_review`, `publishable` (after location/provider resolution) | publish while unresolved | operator/system | yes |
| `ambiguous_candidates` | `needs_review`, `identity_unresolved`, `location_unresolved`, `publishable` (after disambiguation) | publish while ambiguous | operator/system | yes |
| `rejected_false_match` | `needs_review` | direct publish without new decision cycle | operator/system | yes |

## 8. Responsible provider vs delivery site nullability matrix

Provider and delivery site must not be conflated.

Publication gate is source of truth for PSA eligibility.
Nullability matrix must remain consistent with publication gate.
If conflict exists, publish is blocked until architecture decision.

| Decision state | `resolved_identity_key` required? | `resolved_location_key` required? | `responsible_provider_institution_id` required? | `delivery_site_institution_id` required? | Can be null? | Notes |
|---|---|---|---|---|---|---|
| `publishable` | yes | yes, or explicitly irrelevant-by-policy | yes | yes if modeled/known; otherwise nullable only with explicit policy reason | limited | must satisfy publication gate |
| `needs_review` | optional | optional | optional | optional | yes | review state only |
| `unsupported_losa` | optional | optional | optional | optional | yes | Phase 4 dependency |
| `external_delivery` | optional | optional | optional | optional | yes | non-ordinary delivery model |
| `identity_unresolved` | no | optional | no | optional | yes | identity unresolved blocks publish |
| `location_unresolved` | yes | no | yes/optional by policy | optional | yes | location/provider semantics unresolved |
| `ambiguous_candidates` | no | no | no | no | yes | ambiguity unresolved |
| `rejected_false_match` | optional | optional | optional | optional | yes | explicit rejection, repipeline needed |

## 9. Publication gate checks

All checks must pass before PSA eligibility:

1. observation valid and current;
2. identity resolved;
3. provider/location semantics resolved;
4. `publishability_state = publishable`;
5. `audit_ref` present;
6. `decision_basis_version` present;
7. no stale source drift;
8. not `unsupported_losa` / `external_delivery`;
9. active decision not superseded.

## 10. Stale comparison / revalidation criteria

### Hard-stale (blocks publish, requires revalidation)

- school code change;
- programme/stage availability change;
- source snapshot/source URL canonical change impacting observation lineage;
- NSR institution activity/location/private status change impacting resolved semantics;
- alias/location evidence drift that invalidates active decision basis.

### Soft-stale (advisory/review signal)

- school label/display variant changes with stable identity evidence;
- non-material metadata drift not affecting publishability gate.

If severity is unclear, default to **hard-stale** for publish decisions.

Result behavior:

- mark stale / `needs_review` as appropriate;
- no auto-publish from stale decisions.

## 11. Audit payload minimal schema

For operator/system decision events:

- `actor_id`
- `actor_type`
- `reason_codes`
- `evidence_refs`
- `before_state`
- `after_state`
- `source_snapshot_label`
- `decision_basis_version`
- `timestamp`
- `notes`
- redaction/sensitivity flags/rules

## 12. Actor authority matrix

| Actor | Allowed actions | Forbidden actions |
|---|---|---|
| system | generate candidates/diagnostics; propose publishability only under approved rules | silent publish without audit/basis; hidden manual overrides |
| operator | review/approve transitions with mandatory audit payload | publish without audit_ref + decision_basis_version; destructive overwrite |
| any actor | none beyond approved authority | hidden manual truth creation |

Hard rule:

- nobody can publish without `audit_ref` + `decision_basis_version`.

## 13. Retention / archival

- append-only tables retain supersession chain;
- no destructive delete while referenced by decision/audit rows;
- minimum retention period is TBD by compliance owner;
- archival must preserve decision/audit chain;
- source observations retained at least as long as decisions reference them.

## 14. Indexing / performance concept (no SQL)

Conceptual indexing goals:

- lookup by source snapshot;
- lookup by county/profession/stage;
- lookup active decision per observation;
- lookup publication-ready decisions;
- lookup review backlog.

## 15. Consumer compatibility

Explicit no-change list:

- no readiness JSON expansion;
- no Route Engine decision-state consumption;
- no new runtime DB dependency;
- no PSA write-path integration;
- no UI/family-facing display change.

## 16. Backfill guardrail

- no implicit backfill logic is approved by this draft;
- any backfill requires separate migration/backfill plan and approval.

## 17. Nationwide guardrails

- no regional special cases;
- validation counties are examples only;
- all fylke/professions/stages use same model;
- LOSA remains Phase 4 dependency.

## 18. Open questions before SQL

- exact physical enum strategy;
- RLS/security model if any;
- audit table storage details;
- retention period definition;
- migration rollout sequencing;
- backfill strategy;
- operator workflow ownership;
- enum versioning/change policy;
- state deprecation strategy.

## 19. Acceptance criteria for this draft

- reviewed and accepted before SQL/migration work;
- no conflicts with locked specs;
- covers notes from DB proposal acceptance;
- preserves no-write boundary;
- no regression on green counties;
- unresolved remains unresolved;
- no random campus decisions;
- no publishability expansion without auditable evidence;
- all decisions carry reason codes and evidence references.

## 20. Acceptance status

- Status: **ACCEPTED WITH NOTES**
- No blocking conflicts found with:
  - `docs/architecture/school-identity-location-resolution-phase-2-spec.md`
  - `docs/architecture/school-identity-location-resolution-db-model-proposal.md`
  - `docs/architecture/norway-school-identity-matching-spec.md`
  - `docs/architecture/route-engine-master-spec.md`
  - `docs/product-principles.md`
  - Phase 2 gates in `docs/architecture/norway-school-identity-matching-execution-plan.md`
- This draft is the accepted baseline for the next **SQL/migration proposal** step.
- SQL/migration proposal artifact status: **ACCEPTED WITH NOTES**:
  - `docs/architecture/school-identity-location-resolution-sql-migration-proposal.md`
- Next blocked step: **migration file draft**.
- No SQL/migration is approved by this draft.
- No DB schema, code, or write integration is approved by this draft.
- No migration execution/schema/code/write integration starts until migration file draft is reviewed and approved.

Notes to carry into SQL/migration proposal:

1. Finalize enum physical strategy and evolution policy.
2. Define active-row uniqueness enforcement pattern.
3. Specify JSON validation contracts.
4. Define RLS/security and operator authority boundaries.
5. Lock stale severity criteria and revalidation triggers.
6. Define key collision and merge/split governance mechanics.
7. Specify retention/archival implementation plan and backfill sequencing.

Carry-forward safeguards to enforce at SQL review:

- RLS/security section remains policy-level; final rules require separate security review.
- Enum strategy (constrained text + checks vs native enum) remains proposal-level until SQL acceptance.
- Backfill algorithm remains non-approved until separate backfill ADR/plan.
- Active-row uniqueness stays anchored on `superseded_at IS NULL` as canonical proposed mechanism.
