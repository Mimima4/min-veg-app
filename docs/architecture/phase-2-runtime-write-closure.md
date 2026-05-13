# Phase 2 Runtime / Write Boundary

## Snapshot / status

- **Status:** Documentation-only runtime/write boundary
- **Scope:** Phase 2 conditions before future write/runtime integration
- **Repository checkpoint:** `01ddc79 Add Phase 2 production truth boundary`
- **Created at (UTC):** 2026-05-13
- **Filename contains "closure"; meaning is boundary-only, not executed closure**
- **No execution authority**
- **Not** runtime/write approval
- **Not** DB write approval
- **Not** pipeline/readiness approval
- **Not** PSA materialization approval
- **Not** PSA publication approval
- **Not** Route Engine consumption approval
- **Not** Phase 3 approval
- **Runtime/write closure:** NOT EXECUTED
- **Operational production truth closure:** NOT CLOSED
- **Does not** change status namespaces
- **Does not** create decision rows
- **Does not** create publication decisions
- **Does not** create write paths
- **Does not** satisfy the runtime/write closure row in `docs/architecture/phase-2-closure-criteria-checklist.md` as **executed** or **approved**

## Purpose

- Defines the **runtime/write boundary** in documentation **before** any implementation; a future **runtime/write path may be designed later under separate owner-approved execution gate**.
- Separates **production truth documentation** from **DB writes**, **pipeline/readiness**, **PSA materialization**, and **Route consumption**; truth-layer separation remains in `docs/architecture/phase-2-production-truth-closure.md`—this doc **complements** it with a write/runtime/pipeline lens only.
- **Does not** create write paths and **does not** imply any active write path exists.
- Prevents **documentation closure** from being read as **hidden runtime/write approval**.

## Relationship to existing docs

- This document **does not** amend `docs/architecture/phase-2-evidence-model-closure-criteria.md`, `docs/architecture/phase-2-operational-evidence-sufficiency-standard.md`, `docs/architecture/phase-2-governance-review-closure.md`, or `docs/architecture/phase-2-production-truth-closure.md` (no edits to those files; pointers only).
- This document **only** adds the runtime/write / pipeline / readiness lens on top of the committed Phase 2 documentation set; truth-layer separation remains in `docs/architecture/phase-2-production-truth-closure.md`.

## Source hierarchy / canonical precedence

1. `docs/architecture/phase-2-read-only-evidence-packet-format.md` — canonical for `packet_status` and packet structure.
2. `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md` — canonical for backlog classifications.
3. `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — canonical for Phase 2 conceptual / decision states.
4. `docs/architecture/norway-school-identity-matching-spec.md` — canonical for school identity matching safety rules.
5. `docs/architecture/phase-2-status-namespace-decisions.md` — owner-approved namespace decisions; must not override canonical sources.
6. `docs/architecture/phase-2-evidence-model-closure-criteria.md` — documentation/governance closure boundaries and open owner decisions.
7. `docs/architecture/phase-2-operational-evidence-sufficiency-standard.md` — committed operational evidence sufficiency boundaries.
8. `docs/architecture/phase-2-governance-review-closure.md` — committed governance/review boundaries.
9. `docs/architecture/phase-2-production-truth-closure.md` — committed production truth boundary.
10. `docs/architecture/phase-2-read-only-diagnostics-contract.md` — read-only diagnostics boundaries.
11. `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — helper boundary and non-integration rules.
12. `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist for closure levels and hard gates.
13. `docs/architecture/norway-school-identity-matching-execution-plan.md` — timeline/control context.
14. `docs/architecture/route-engine-master-spec.md` — canonical Route Engine truth boundaries.

**Conflict rule:** If this document conflicts with canonical source docs, the canonical sources win; this document must be revised later; do not invent a resolution here.

## Scope: IN / OUT

| IN | OUT |
| --- | --- |
| Runtime/write boundary | DB writes |
| Write-path preconditions as documentation-only guardrails | SQL/schema |
| DB write separation | Migrations |
| Pipeline/readiness separation | Script/job implementation |
| PSA materialization separation | Ingestion/fetch execution |
| Route consumption separation | Pipeline/readiness integration |
| Blocked transitions | PSA materialization |
| Forbidden shortcuts | PSA publication |
| | Route Engine consumption |
| | Runtime implementation |
| | Phase 3 implementation |

## Runtime/write boundary table

| Layer | What it means | Is execution approved here? | Requires separate owner gate? | Source basis |
| --- | --- | --- | --- | --- |
| Production truth decision | Owner-gated conceptual truth about identity/location resolution | NO | YES | `docs/architecture/phase-2-production-truth-closure.md` — Production truth object boundary; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — §9 Decision states |
| Publication decision | Distinct gate from identity resolution; governs publishability | NO | YES | `docs/architecture/phase-2-production-truth-closure.md` — Decision vs publication decision; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — §11 Publishability contract |
| DB write path | Any persistence of truth rows, publication rows, or integration state | NO | YES | `docs/architecture/phase-2-closure-criteria-checklist.md` — Hard gates before Phase 3 implementation; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — §8 Decision ownership / audit |
| Pipeline/readiness integration | Operational consumers of diagnostics or truth beyond read-only contracts | NO | YES | `docs/architecture/phase-2-read-only-diagnostics-contract.md` — Scope, Non-goals; `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — Hard non-goals; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — §14 Pipeline integration direction (later only); `docs/architecture/norway-school-identity-matching-execution-plan.md` — Hard principles |
| PSA materialization | Turning publication decisions into PSA-facing artifacts | NO | YES | `docs/architecture/phase-2-production-truth-closure.md` — PSA / Route boundary; `docs/architecture/phase-2-closure-criteria-checklist.md` — Hard gates before Phase 3 implementation |
| PSA publication | External or PSA-visible publication act | NO | YES | `docs/architecture/phase-2-production-truth-closure.md` — PSA / Route boundary; `docs/architecture/phase-2-closure-criteria-checklist.md` — Hard gates before Phase 3 implementation |
| Route Engine consumption | Route runtime use of school/programme availability truth | NO | YES | `docs/architecture/route-engine-master-spec.md` — §6 / School/Programme Availability Truth Contract (VGS contour); `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — §12 Route Engine boundary |
| Phase 3 implementation | Later program of work; **row exists only to deny approval here**; does not define Phase 3 gate criteria | NO | YES | `docs/architecture/phase-2-closure-criteria-checklist.md` — Hard gates before Phase 3 implementation; `docs/architecture/norway-school-identity-matching-execution-plan.md` — control context |

## Preconditions before any future write path can be discussed

Documentation-only guardrails for a **future design discussion** under a **separate owner-approved execution gate**—**not** implementation approval.

- **Production truth boundary** respected — `docs/architecture/phase-2-production-truth-closure.md`
- **Identity/location decisions** owner-gated — `docs/architecture/school-identity-location-resolution-phase-2-spec.md` §8; `docs/architecture/norway-school-identity-matching-spec.md` — Mandatory matching behavior / Implementation boundary
- **Publication decisions** kept separate from identity resolution — `docs/architecture/phase-2-production-truth-closure.md`
- **Write path** must not consume raw evidence, review artifacts, or diagnostics as runtime truth — packet format + governance/diagnostics docs (`docs/architecture/phase-2-read-only-evidence-packet-format.md`; `docs/architecture/phase-2-governance-review-closure.md`; `docs/architecture/phase-2-read-only-diagnostics-contract.md`; `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`)
- **Unresolved / ambiguous / LOSA-blocked** cases remain blocked — `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md`; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Hard invariants
- **Namespace rules** intact — `docs/architecture/phase-2-status-namespace-decisions.md`
- **Audit trail** must exist before execution (per canonical model); details owner-gated — `docs/architecture/school-identity-location-resolution-phase-2-spec.md` §8; `docs/architecture/phase-2-governance-review-closure.md` — Auditability expectations
- **Rollback / supersession** remains **OPEN** and must be **owner-decided before execution**; **not** specified here — `docs/architecture/phase-2-closure-criteria-checklist.md` (gates); OPEN list below

## DB write boundary

- **No** DB writes are approved here.
- **No** table writes, SQL, or migrations are defined here.
- **Decision rows** and **publication rows** are **not** created by this document.
- Any DB write path requires a **separate owner-approved implementation gate**.

## Pipeline/readiness boundary

- Pipeline/readiness integration is **not** approved here.
- Helper diagnostics **do not** become gate decisions; diagnostics **must not** silently influence publication or readiness (`docs/architecture/phase-2-read-only-diagnostics-contract.md` — Decision, Scope, Non-goals; `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — Decision, Hard non-goals).
- Any pipeline/readiness consumption requires a **separate contract/ADR** beyond this boundary doc.

## PSA / Route boundary

**Invariant restatement** from `docs/architecture/route-engine-master-spec.md` and Phase 2 control docs; **not** a new runtime contract.

- PSA materialization and PSA publication are **not** approved here.
- Route Engine consumption is **not** approved here.
- Route Engine must consume only **future published internal truth** (per Route + Phase 2 specs); raw evidence, review artifacts, and diagnostics **must not** feed Route runtime (`docs/architecture/route-engine-master-spec.md` — availability truth contract; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — §12 Route Engine boundary; `docs/architecture/phase-2-production-truth-closure.md` — PSA / Route boundary).

## Blocked transitions

- documentation closure → DB write approval
- production truth boundary → DB write approval
- decision concept → decision row
- publication concept → publication row
- publication decision → PSA materialization automatically
- PSA materialization → Route Engine consumption automatically
- diagnostics → pipeline/readiness gate
- raw evidence → runtime truth
- runtime/write boundary document → implementation start
- runtime/write boundary document → Phase 3 start

## Forbidden shortcuts

Forbidden **examples** only; **not** allowed behavior:

- docs closed → write path approved
- production truth boundary exists → DB writes approved
- decision concept exists → decision row exists
- publication decision concept exists → PSA publication
- pipeline diagnostics → readiness truth
- helper output → publication decision
- PSA row exists → Route truth
- raw evidence → Route runtime
- runtime/write boundary document → implementation
- runtime/write boundary document → Phase 3

## Owner gates still required

This document **approves none** of the following:

- DB write-path design
- Migration / schema change decision (if ever needed)
- Pipeline/readiness integration contract
- PSA materialization design
- PSA publication gate
- Route Engine consumption gate
- Rollback/supersession design
- Runtime safety QA
- Phase 2 → Phase 3 gate criteria
- Phase 3 implementation

## Open owner decisions carried forward

- **OPEN:** Which write path, if any, may create Phase 2 truth rows later
- **OPEN:** Whether schema changes are needed before execution
- **OPEN:** How rollback/supersession is represented
- **OPEN:** How pipeline/readiness may consume Phase 2 truth without hidden truth
- **OPEN:** How PSA materialization consumes publication decisions
- **OPEN:** How Route Engine consumes only published internal truth
- **OPEN:** How write-path QA proves no raw evidence leaks into runtime

## Final boundary statement

Phase 2 runtime/write boundary is documentation-defined here, but DB writes, pipeline/readiness integration, PSA materialization, PSA publication, Route Engine consumption, and Phase 3 remain blocked until separate owner-approved gates.
