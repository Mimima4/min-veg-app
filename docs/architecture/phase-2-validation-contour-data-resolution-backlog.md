# Phase 2 Validation Contour — Nationwide Data-Resolution Backlog

## 1. Status / boundary

- Status: **PLANNING ARTIFACT / DOCS-ONLY**.
- Scope: nationwide Phase 2 validation/governance contour for school identity/location/publishability evidence.
- This document does **not** approve or start runtime integration, write integration, readiness/pipeline integration, operator workflow, or PSA publication activation.
- This document does **not** change Route Engine behavior; Route Engine boundaries remain governed by `docs/architecture/route-engine-master-spec.md` and Phase 2 spec.
- Any follow-on execution requires a separate explicit owner gate.

## 2. Nationwide applicability principle

- `18`/`55`/`56` are seed validation cases, not production special rules.
- The same classification model and evidence gates apply to any county with the same evidence pattern.
- No county-specific hacks, allowlists, or exception logic are permitted as a planning shortcut.

## 3. Typed classification model

| Category | Meaning | Allowed planning outputs now | Forbidden now | Required evidence to progress |
|---|---|---|---|---|
| `phase2_resolvable` | Identity/location likely resolvable within Phase 2 with auditable evidence | Evidence checklist, conceptual state mapping | Runtime/UI/readiness/pipeline activation | Identity, alias, location/provider, NSR linkage, auditable basis |
| `needs_review` | Evidence exists but is insufficient for automatic publication | Review backlog definition, evidence gap list | Publish activation, operator workflow enablement | Explicit review criteria, transition rules, audit refs |
| `unsupported_losa` | LOSA semantics unsupported for ordinary-school publish in current contour | Blocking rationale, Phase 4 dependency tagging | Treat as ordinary school publishability | LOSA model contract (Phase 4) |
| `external_delivery` | Non-ordinary delivery semantics not yet modelled for publication | Classification and dependency notes | Ordinary-school publication | Delivery/provider semantic model (Phase 4) |
| `phase4_blocked` | Case blocked until Phase 4 contract exists | Dependency tracking | Threshold tuning / publication bypass | Approved Phase 4 model and gates |
| `insufficient_evidence` | Not enough trustworthy evidence to classify safely | Gap capture and acquisition plan | Assumed mapping, manual truth | Snapshot-level source and linkage evidence |
| `already_baseline_validated` | Case accepted in current baseline; comparison only | Baseline contrast and guardrails | Unjustified downgrade/reclassification | Strong contradictory evidence if re-opened |

## 4. Standard case record schema (reusable)

Use this schema for any county/profession/stage case:

- `county_code`
- `county_name`
- `profession_slug`
- `stage`
- `source_snapshot_label`
- `source_labels`
- `issue_types`
- `current_status`
- `candidate_classification`
- `conceptual_decision_state_candidates`
- `required_evidence`
- `blocked_actions`
- `forbidden_inferences`
- `related_docs_refs`

## Entry criteria for adding a new county/profession/stage case

Minimum evidence bundle required before a new case enters this backlog:

- county code / county name
- profession slug
- stage
- source snapshot label or source extraction context
- source URL / source reference when available
- source labels
- NSR candidate linkage evidence
- alias / slash / language semantics
- location / campus / avdeling evidence
- ambiguity rationale
- current readiness / matching status
- diagnostic reason codes if available
- reason current behavior should be abort / `needs_review` / unsupported / blocked
- evidence owner or next review need

Rules:

- Missing fields must be recorded as `evidence not yet structured in current docs/scripts`.
- Do not invent evidence.
- Do not require internet/manual lookup as baseline.

## 5. Seed cases (evidence-based, not special rules)

### Case A — `18` Nordland

- `county_code`: `18`
- `county_name`: Nordland
- `profession_slug`: current electrician validation context where documented; reusable schema applies to any profession
- `stage`: VGS programme/stage availability context; exact stage-level packet not yet structured in this backlog
- `source_snapshot_label`: `evidence not yet structured in current docs/scripts`
- `source_labels`: `Nuortta-Sálto joarkkaskåvllå / Nord-Salten videregående skole`, `Steigen` context
- `issue_types`: slash alias; bilingual alias; multi-location/avdeling ambiguity
- `current_status`: non-green / unresolved under current contour (abort-first safety behavior)
- `candidate_classification`: `phase2_resolvable` + `needs_review`
- `conceptual_decision_state_candidates`: `identity_unresolved`, `location_unresolved`, `ambiguous_candidates`, `needs_review`
- `required_evidence`:
  - deterministic identity key evidence across alias variants
  - location/provider disambiguation evidence (no random campus)
  - auditable NSR linkage for candidate institutions
- `blocked_actions`: runtime/pipeline/readiness integration; publication activation; decision-row writes in this gate
- `forbidden_inferences`: "one label = one campus"; publish by sort-order tie-break
- `related_docs_refs`:
  - `docs/architecture/norway-school-identity-matching-spec.md` (Core model, CASE 2/3, test cases)
  - `docs/architecture/norway-school-identity-matching-execution-plan.md` (county status snapshots)
  - `scripts/school-identity-semantics.mjs` (alias + multi-location reason signals)

### Case B — `55` Troms

- `county_code`: `55`
- `county_name`: Troms
- `profession_slug`: current electrician validation context where documented; reusable schema applies to any profession
- `stage`: VGS programme/stage availability context; exact stage-level packet not yet structured in this backlog
- `source_snapshot_label`: `evidence not yet structured in current docs/scripts`
- `source_labels`: `Nord-Troms videregående skole`, `Stangnes Rå videregående skole`
- `issue_types`: multi-location/avdeling ambiguity; ordinary matching ambiguity
- `current_status`: non-green with ambiguity abort behavior
- `candidate_classification`: `phase2_resolvable` + `needs_review`
- `conceptual_decision_state_candidates`: `ambiguous_candidates`, `location_unresolved`, `needs_review`
- `required_evidence`:
  - location-level disambiguation evidence per school identity
  - candidate tie-resolution evidence grounded in source semantics
  - auditable decision basis and reason coding
- `blocked_actions`: publication activation; Route Engine/runtime changes; helper integration beyond approved boundary
- `forbidden_inferences`: picking first candidate; county-specific exception logic
- `related_docs_refs`:
  - `docs/architecture/norway-school-identity-matching-spec.md` (Nord-Troms/Stangnes cases)
  - `docs/architecture/norway-school-identity-matching-execution-plan.md` (ambiguity diagnostics snapshots)

### Case C — `56` Finnmark

- `county_code`: `56`
- `county_name`: Finnmark
- `profession_slug`: current electrician validation context where documented; reusable schema applies to any profession
- `stage`: VGS programme/stage availability context; exact stage-level packet not yet structured in this backlog
- `source_snapshot_label`: `evidence not yet structured in current docs/scripts`
- `source_labels`: `Alta videregående skole / Àlttà joatkkaskuvla`, `Nordkapp ... LOSA`
- `issue_types`: bilingual alias; LOSA/external-delivery dependency; unmatched-heavy evidence
- `current_status`: non-green; LOSA/external-delivery not publishable in current contour
- `candidate_classification`: `unsupported_losa` + `external_delivery` + `phase4_blocked`
- `conceptual_decision_state_candidates`: `unsupported_losa`, `external_delivery`, `needs_review` (governance trail only)
- `required_evidence`:
  - explicit LOSA/external-delivery model contract (Phase 4)
  - provider vs delivery-site semantics for publication gates
  - auditable policy for non-ordinary delivery truth handling
- `blocked_actions`: ordinary-school publication; Route Engine consumption; PSA writes; operator workflow activation
- `forbidden_inferences`: treating LOSA as standard school availability; threshold tuning as substitute for model design
- `related_docs_refs`:
  - `docs/architecture/norway-school-identity-matching-spec.md` (CASE 4)
  - `docs/architecture/school-identity-location-resolution-phase-2-spec.md` (`## 21. Relationship to Phase 4`)
  - `docs/architecture/norway-school-identity-matching-execution-plan.md` (56 LOSA/external-delivery evidence)

### Case D (optional contrast) — `15` Møre og Romsdal

- `county_code`: `15`
- `county_name`: Møre og Romsdal
- `profession_slug`: current electrician validation context where documented; reusable schema applies to any profession
- `stage`: VGS programme/stage availability context; exact stage-level packet not yet structured in this backlog
- `source_snapshot_label`: `evidence not yet structured in current docs/scripts`
- `source_labels`: `evidence not yet structured in current docs/scripts`
- `issue_types`: comparison baseline (do not treat as active problem case by default)
- `current_status`: baseline validated for current contour usage
- `candidate_classification`: `already_baseline_validated`
- `conceptual_decision_state_candidates`: comparison only, no reclassification in this planning gate
- `required_evidence`: strong contradictory evidence before any downgrade
- `blocked_actions`: degradation/reclassification without documented evidence
- `forbidden_inferences`: "all counties must match 15 behavior"
- `related_docs_refs`:
  - `docs/architecture/norway-school-identity-matching-execution-plan.md` (county matrix/notes)

## 6. Conceptual decision-state mapping (planning only)

This mapping is conceptual only:

- `publishable`
- `needs_review`
- `unsupported_losa`
- `external_delivery`
- `identity_unresolved`
- `location_unresolved`
- `ambiguous_candidates`
- `rejected_false_match`

Warnings:

- No decision rows are written by this backlog.
- No publication decision is activated by this backlog.
- No operator workflow is enabled by this backlog.
- No Route Engine/runtime/readiness/pipeline consumption is implied by this backlog.

## Exit criteria for candidate-for-publishability

Candidate-for-publishability is a planning state only. It does **not**:

- activate runtime behavior
- activate PSA publication
- connect Route Engine
- enable operator workflow

All conditions below must be satisfied before a case can be marked candidate-for-publishability:

- identity resolved
- location ambiguity resolved or proven irrelevant for publication scope
- source-backed programme/stage observation exists
- evidence references present
- decision basis version defined
- audit/review basis available
- state is not `unsupported_losa`
- state is not `external_delivery`
- no hard stale source conflict
- separate owner gate approved before any write/publication/integration

## Governance / owner gates

These gates are conditional governance checkpoints only.
No gate is pre-approved by this document.
Do not treat them as an approved implementation roadmap.

| Gate | Allows | Does not allow | Still blocked after gate |
|---|---|---|---|
| A | Approve this backlog artifact | Any runtime/write action | Integration/write/publication |
| B | Approve read-only evidence packet format | Evidence extraction execution | Runtime/readiness/pipeline/operator/PSA activation |
| C | Approve read-only evidence extraction/report | Decision writes/publication activation | Write path, publication, runtime use |
| D | Approve operator review state-machine design (design only) | Operator workflow enablement | Workflow activation and writes |
| E | Approve decision-row write path (if ever needed) | PSA publication integration by default | Publication/runtime/readiness/pipeline |
| F | Approve PSA publication integration (if ever needed) | Route Engine consumption by default | Runtime route consumption unless separately approved |
| G | Approve readiness/pipeline integration (if ever needed) | Route Engine/runtime integration | Runtime route use, operator activation unless separately gated |
| H | Approve Route Engine consumption of published truth (if ever needed) | Raw Phase 2 state consumption | Any unresolved/raw-state runtime coupling |
| I | Approve separate Phase 4 LOSA/external-delivery model | Implicit ordinary-school LOSA publish | Non-ordinary delivery publish without Phase 4 contract |

## 7. Evidence gate checklist (nationwide reusable)

### Identity evidence
- canonical identity linkage across source label variants
- stable identity-key rationale

### Alias/language evidence
- slash alias handling proof
- bilingual/Sami-Norwegian alias normalization traceability

### Location/campus evidence
- location/provider separation evidence
- avdeling/campus disambiguation proof

### LOSA/external-delivery evidence
- explicit LOSA classification evidence
- external-delivery semantic contract requirements (Phase 4)

### Source snapshot evidence
- source snapshot label/version
- observation recency and drift traces

### NSR linkage evidence
- institution linkage confidence and tie rationale
- rejection rationale for false matches

### Vilbli source semantics evidence
- source-label interpretation rationale
- evidence for stage/program context

### Audit/review evidence
- reason codes and decision basis requirements
- explicit audit linkage requirements before any publication gate

## Evidence gaps

High-level examples are documented across specs and execution notes. Current gap is packaging them into row-level, audit-ready case packets.

### Identity evidence
- not yet structured as row-level dossier for each active county/profession/stage case

### Alias/language evidence
- high-level bilingual/slash examples exist, but not yet packaged as audit-ready evidence packet per case

### Location/campus evidence
- requires separate evidence packet format for provider vs campus/avdeling disambiguation

### LOSA/external delivery evidence
- LOSA/external examples exist; operational decision packet remains Phase 4-dependent and not yet audit-packaged

### Source snapshot evidence
- snapshot context exists in docs/scripts, but not yet normalized as per-case audit-ready packet

### NSR linkage evidence
- linkage rationale exists at high level; not yet structured as case-level audited dossier

### Vilbli source semantics evidence
- semantics are documented conceptually; per-row evidence packaging is not yet structured in current docs/scripts

### Audit/review evidence
- operator workflow is not enabled; review evidence requirements exist but are not yet packaged as executable review packets

## 8. Forbidden shortcuts

- no random campus selection
- no first-candidate-by-sort selection
- no manual internet-derived mapping tables
- no county-specific hacks/exceptions
- no fuzzy-threshold weakening to force green states
- no LOSA publication as ordinary school truth
- no Route Engine workaround consuming unresolved evidence
- no UI compensation masking unresolved truth
- no decision-row writes in this gate
- no PSA writes/publication activation
- no operator workflow activation
- no readiness/pipeline/helper integration
- no runtime consumption of raw Phase 2 evidence

## 9. Safe next-step options (non-executing)

### Option 1 — Read-only evidence export/report design
- Benefits: standardizes evidence packets for any county case.
- Risks: overdesign without owner-prioritized execution path.
- Required owner gate: approve read-only evidence-report schema work.

### Option 2 — Operator state-machine design doc (without workflow enablement)
- Benefits: prepares auditable transitions for future governance.
- Risks: could be misread as workflow activation if wording is sloppy.
- Required owner gate: explicit "design only, no enablement" approval.

### Option 3 — Separate Phase 4 LOSA/external-delivery planning
- Benefits: addresses core blocker class for `56` and similar future cases.
- Risks: scope expansion if mixed with Phase 2 runtime expectations.
- Required owner gate: explicit Phase 4 planning gate.
- Related future Phase 4 planning artifact: `docs/architecture/phase-4-losa-official-source-evidence-refresh-design.md` — docs-only, non-canonical official-source evidence + automated refresh requirements; no script/job, DB/write, PSA, Route Engine, LOSA publication, or decision-row approval.

### Option 4 — Defer until additional evidence baseline is curated
- Benefits: avoids premature classification drift.
- Risks: delays resolution planning throughput.
- Required owner gate: acceptance of deferment and evidence intake priority.

## 10. Out-of-scope (this document)

- runtime integration
- readiness/pipeline integration
- operator workflow enablement
- PSA publication activation
- Route Engine route-construction changes
- DB write execution (including decision rows)

## 11. Normative references

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
