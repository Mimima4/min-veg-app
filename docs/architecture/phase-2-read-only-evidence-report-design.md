# Phase 2 Read-Only Evidence Report Design

## 1. Status / boundary

- Status: **PLANNING ARTIFACT / DOCS-ONLY**.
- Purpose: define the future read-only evidence report shape for Phase 2 validation/governance contour.
- This is design only.
- No extraction execution is approved by this document.
- No scripts are approved by this document.
- No Supabase operations are approved by this document.
- No DB writes are approved by this document.
- No decision rows are approved by this document.
- No operator workflow is approved by this document.
- No PSA publication is approved by this document.
- No runtime/readiness/pipeline integration is approved by this document.
- No Route Engine changes are approved by this document.
- Separate owner gate is required before any execution/report generation.

(We are only deciding what a future report should contain. We are not generating it now.)

## 2. Relationship to existing Phase 2 docs

Related artifacts:

- `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md`
- `docs/architecture/phase-2-read-only-evidence-packet-format.md`

Relationship rules:

- The backlog defines case classification and governance gates.
- The evidence packet format defines dossier shape for one case.
- This report design defines how many packets/cases could be summarized in one future read-only report.
- This document does not change classification semantics.
- This document does not approve extraction.
- This document does not activate workflow, publication, or integration.

(Backlog defines problem type, packet defines single-case evidence shape, report defines future multi-case overview shape.)

## 3. Authority / precedence

- This document defines report-shape design only.
- Classification semantics remain governed by `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md`.
- Case evidence semantics remain governed by `docs/architecture/phase-2-read-only-evidence-packet-format.md`.
- Route/runtime boundaries remain governed by:
  - `docs/architecture/route-engine-master-spec.md`
  - `docs/architecture/school-identity-location-resolution-phase-2-spec.md`
- Helper/readiness/pipeline boundaries remain governed by:
  - `docs/architecture/phase-2-read-only-diagnostics-contract.md`
  - `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`
- If any wording conflicts with the sources above, this document does not expand scope and must be corrected.
- This document is not an API contract, BI contract, runtime contract, or implementation handoff.

(If conflict exists, source docs win. This file cannot redefine product behavior.)

## 4. Report purpose

The future report is:

- a read-only overview of evidence packets and unresolved cases;
- a planning and review-support artifact;
- a way to compare counties/professions/stages using one reusable structure;
- a way to surface evidence gaps before any future decision-row or publication path.

The future report is not:

- not runtime truth;
- not Route Engine input;
- not readiness/pipeline input;
- not a decision row;
- not a publication decision;
- not operator workflow;
- not a PSA write;
- not proof that a case is publishable.

(The report helps humans see evidence quality and gaps. It does not make product decisions.)

## 5. Report scope

Nationwide-ready scope:

- works for any county;
- works for any profession;
- works for any stage;
- uses `18`/`55`/`56` as examples only;
- allows optional `15` comparison only.

Forbidden scope behavior:

- no county-specific hacks;
- no one-off rules for `18`/`55`/`56`;
- no manual internet-derived truth tables;
- no runtime workarounds.

(The format must scale nationally, not only for current problematic cases.)

## 6. Identifier semantics

- `packet_id` is the primary reference key for report case rows.
- Optional derived case key can be added for presentation only, but does not replace `packet_id`.
- Mixed ambiguous identity labeling (for example, `case_id / packet_id`) is not allowed without explicit one-way mapping to `packet_id`.

(Every report row must map back to one packet consistently.)

## 7. Report input concept

Conceptual future inputs:

- evidence packets;
- county/profession/stage filters;
- packet statuses;
- issue types;
- conceptual decision-state recommendations;
- evidence gap categories;
- source references;
- NSR candidate evidence;
- Vilbli/source semantics evidence;
- LOSA/external-delivery signals.

Input boundary rules:

- inputs are conceptual only;
- no extraction is approved;
- no source access implementation is approved;
- no helper integration is approved;
- no DB query/report execution is approved.

(We define what the report would need, not how to fetch it.)

## 8. Report output sections

### 8.1 Summary overview

Required fields:

- total cases
- cases by county
- cases by profession
- cases by stage
- cases by `packet_status`
- cases by classification
- `blocked_losa` count
- `external_delivery` count
- `needs_review` count
- `insufficient_evidence` count

### 8.2 Case table

Required fields:

- `packet_id`
- `county_code`
- `county_name`
- `profession_slug`
- `stage`
- `source_snapshot_label`
- `source_labels`
- `issue_types`
- `candidate_classification`
- `conceptual_state_recommendation`
- `packet_status`
- `evidence_completeness`
- `blocking_reason`
- `next_owner_gate` (reference label only; not task creation)
- `related_docs_refs` (reference only)

### 8.3 Evidence gap table

Required fields:

- `packet_id`
- evidence gap category
- missing or incomplete field
- why it matters
- required evidence to progress
- blocked action until resolved

### 8.4 Ambiguity / conflict table

Required fields:

- `ambiguity_type`
- conflicting candidates
- conflict reason codes
- false-match risks
- recommended blocking state
- forbidden shortcut

### 8.5 LOSA / external-delivery table

Required fields:

- county
- source label
- `losa_signal_present`
- `external_delivery_signal_present`
- responsible provider candidate
- delivery site label
- Phase 4 dependency reason
- blocked action

### 8.6 Readiness for review summary

Required fields:

- `ready_for_review` candidates
- `evidence_incomplete` cases
- `blocked_losa` cases
- `blocked_external_delivery` cases
- `archived` or no-action cases

Boundary rules for this section:

- `ready_for_review` is not publishable;
- review summary does not enable operator workflow;
- report output does not approve writes or publication.

(These sections make evidence problems visible but do not activate product behavior.)

## 9. Filters and grouping

Future report filters:

- county
- profession
- stage
- `packet_status`
- classification
- conceptual state recommendation
- issue type
- evidence gap category
- LOSA/external-delivery signal
- source snapshot

Future grouping dimensions:

- by county
- by profession
- by stage
- by issue type
- by blocking state
- by next owner gate

Rules:

- grouping/sorting is presentation-only;
- no implied prioritization policy;
- no auto-escalation logic;
- no action triggering from filter/group output.

(Filters support planning and analysis only, not execution.)

## 10. Report status semantics

Allowed future report statuses:

- `draft_report`
- `ready_for_owner_review`
- `evidence_incomplete`
- `blocked_by_phase4`
- `archived`

Rules:

- report status is planning/report status only;
- report status is not runtime state;
- report status is not operator workflow state;
- report status is not publishability state;
- report status is not readiness/pipeline state;
- report status cannot trigger actions automatically;
- report status is independent from packet status (no required 1:1 mapping).

(Status labels describe document maturity, not product transitions.)

## 11. Owner semantics

- `ready_for_owner_review` means documentation governance readiness only.
- `ready_for_owner_review` does not authorize extraction, execution, writes, publication, workflow, or integration.
- Owner role in this document is a governance role label, not a runtime/operator role.
- This document cannot assign implementation ownership or generate implementation tasks.

(Owner review here is a docs governance checkpoint, not operational enablement.)

## 12. Quality checks before report can be considered ready_for_owner_review

Checklist:

- all rows use standard case schema;
- no unknown source facts are invented;
- missing evidence is explicitly marked;
- issue types are assigned;
- blocking states are assigned;
- forbidden shortcuts are listed where relevant;
- LOSA/external-delivery cases are separated;
- candidate-for-publishability wording is not used as active publication;
- Route Engine/runtime is not referenced as report consumer;
- next owner gate is stated for every case;
- assumptions and known unknowns are explicitly listed.

Unknown evidence placeholder rule:

- Use exact phrase: `evidence not yet structured in current docs/scripts`.

(Before owner review, each row must clearly separate known facts, unknowns, and blocked actions.)

## 13. Seed example mapping

Concise format-only mapping may reference:

- `18` Nordland
- `55` Troms
- `56` Finnmark
- optional `15` Møre og Romsdal comparison

Rules:

- do not create fake full report rows;
- do not invent `source_snapshot_label`;
- use `evidence not yet structured in current docs/scripts` where unknown;
- examples demonstrate format only and do not assert final truth.

(Examples show template usage only; they are not evidence closure.)

## 14. Future owner gates

Each gate requires separate owner approval and is not approved by this document:

- approve this report design as planning artifact
- approve read-only evidence report execution design
- approve read-only evidence report execution, if ever needed
- approve operator review state-machine design, if ever needed
- approve decision-row write path, if ever needed
- approve PSA publication integration, if ever needed
- approve readiness/pipeline integration, if ever needed
- approve Route Engine consumption of published truth, if ever needed
- approve Phase 4 LOSA/external-delivery model

Rules for all gates:

- not approved by this document;
- requires separate owner gate.

(Every next action is separately gated; this design approves none of them.)

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
- no report status triggering product behavior
- no report output creating implementation tasks
- no implicit ranking policy presented as governance decision

## 16. Out of scope

- report execution
- evidence extraction
- scripts
- code implementation
- Supabase operations
- migrations
- DB writes
- runtime integration
- readiness/pipeline integration
- operator workflow
- PSA publication
- Route Engine changes
- API/BI contract definition

## 17. Normative references

- `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md`
- `docs/architecture/phase-2-read-only-evidence-packet-format.md`
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
