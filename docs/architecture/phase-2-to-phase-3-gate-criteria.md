# Phase 2 to Phase 3 Gate Criteria

## Snapshot / status

- **Status:** Documentation-only transition gate criteria
- **Scope:** Preconditions before Phase 3 / controlled 1:N PSA can be considered
- **Repository checkpoint:** `c0d077a Add Phase 2 runtime write boundary`
- **Created at (UTC):** 2026-05-13
- **Gate criteria only; gate not passed**
- **No execution authority**
- **Not** Phase 3 approval
- **Not** controlled 1:N PSA approval
- **Not** runtime/write approval
- **Not** DB write approval
- **Not** PSA publication approval
- **Not** PSA materialization approval
- **Not** Route Engine consumption approval
- **Does not** create implementation tasks
- **Does not** change status namespaces
- **Does not** create decision rows
- **Does not** create publication decisions

## Purpose

- Defines the **transition gate** in documentation **after** the Phase 2 operational boundary documents; **Phase 3 may be considered later under a separate owner-approved implementation gate**.
- States that **Phase 3 cannot start automatically** from documentation or schema artifacts alone.
- Prevents Phase 3 from inheriting **hidden truth** from docs-only, diagnostics-only, schema-only, review-only, or boundary-only artifacts.
- **Aggregates** gate criteria from `docs/architecture/phase-2-closure-criteria-checklist.md` and `docs/architecture/norway-school-identity-matching-execution-plan.md` but **does not replace** them as the control sources.
- **Does not** implement Phase 3.

## Relationship to existing docs

- This document **does not amend** committed Phase 2 operational docs, `docs/architecture/norway-school-identity-matching-execution-plan.md`, or other canonical sources (pointers only).
- This document **does not approve** Phase 3, controlled 1:N PSA emission, runtime/write, DB writes, PSA materialization, PSA publication, or Route Engine consumption.
- This document **does not satisfy** Phase 3 implementation and **does not** mean the Phase 2 → Phase 3 **gate has passed**.
- **Filename and title mean gate criteria only**, not a passed gate or permission to start Phase 3.

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
10. `docs/architecture/phase-2-runtime-write-closure.md` — committed runtime/write boundary.
11. `docs/architecture/phase-2-read-only-diagnostics-contract.md` — read-only diagnostics boundaries.
12. `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — helper boundary and non-integration rules.
13. `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist for closure levels and hard gates.
14. `docs/architecture/norway-school-identity-matching-execution-plan.md` — timeline/control context; Phase 3 goal and rules.
15. `docs/architecture/route-engine-master-spec.md` — canonical Route Engine truth boundaries.
16. `docs/architecture/phase-4-losa-official-source-evidence-refresh-design.md` and `docs/architecture/phase-4-losa-official-source-registry.md` — Phase 4 / LOSA source-governance references only; **do not** approve Phase 4 execution.

**Conflict rule:** If this document conflicts with canonical source docs, the canonical sources win; this document must be revised later; do not invent a resolution here.

## Scope: IN / OUT

| IN | OUT |
| --- | --- |
| Transition gate criteria | Phase 3 implementation |
| Required Phase 2 prerequisites before Phase 3 consideration | Controlled 1:N PSA implementation |
| Controlled 1:N PSA prerequisites at gate level | PSA materialization |
| Hard invariants that must survive transition | PSA publication |
| What remains blocked | DB writes |
| | SQL/schema/migrations |
| | Script/job implementation |
| | Route Engine consumption |
| | Runtime/readiness/pipeline integration |
| | UI/family-facing implementation |
| | County/case packet execution |

## Completed Phase 2 documentation prerequisites

Documentation and governance artifacts **committed** before this gate-criteria document (prerequisites **to having** a coherent gate story; **not** execution approval):

- `docs/architecture/phase-2-evidence-model-closure-criteria.md` — evidence model closure criteria
- `docs/architecture/phase-2-operational-evidence-sufficiency-standard.md` — operational evidence sufficiency standard
- `docs/architecture/phase-2-governance-review-closure.md` — governance/review closure
- `docs/architecture/phase-2-production-truth-closure.md` — production truth boundary
- `docs/architecture/phase-2-runtime-write-closure.md` — runtime/write boundary

These are **documentation/governance prerequisites only**. They **do not** create production truth, runtime/write approval, PSA publication, Route consumption, or Phase 3 approval.

## Required prerequisites before Phase 3 can be considered

Gate assessments below are **plain prose for this document only**. They are **not** `packet_status`, backlog codes, checklist classification tags, or runtime enums, and **must not** be copied into code or databases. Default stance: **owner gate required before Phase 3 implementation or controlled 1:N PSA emission may be considered**, except where the checklist clearly allows a narrower docs-only statement.

| Prerequisite | Required condition | Gate assessment (plain prose only) | Blocks Phase 3 until owner-resolved? | Source basis |
| --- | --- | --- | --- | --- |
| Operational evidence sufficiency standard | Committed sufficiency semantics for evidence types | Documentation is committed; checklist still treats operational evidence model closure as not owner-closed as a logged standard where applicable | Yes — for treating Phase 3 inputs as non-ambiguous | `docs/architecture/phase-2-operational-evidence-sufficiency-standard.md` — Snapshot / status; `docs/architecture/phase-2-closure-criteria-checklist.md` — Closure levels — Phase 2 evidence model closure |
| Governance/review boundary | Review vs decision separation; auditability expectations | Governance documentation is committed; checklist still treats governance/review as not operationally closed where operator paths matter | Yes — before operator-dependent publication paths | `docs/architecture/phase-2-governance-review-closure.md` — Snapshot / status; `docs/architecture/phase-2-closure-criteria-checklist.md` — Closure levels — Phase 2 governance/review closure |
| Production truth execution path | Durable path from observations through decisions aligned with publishability | Boundary documentation is committed; checklist treats production truth closure as not closed until populated truth and processes after owner gates | Yes — for claiming a closed truth layer or feeding Phase 3 from Phase 2 tables | `docs/architecture/phase-2-production-truth-closure.md` — Snapshot / status; `docs/architecture/phase-2-closure-criteria-checklist.md` — Closure levels — Phase 2 production truth closure |
| Runtime/write execution path | Explicit approval for writes and integration with pipeline, readiness, or PSA | Boundary documentation is committed; checklist treats runtime/write as blocked and not approved | Yes — for any implementation that writes or changes the publish path | `docs/architecture/phase-2-runtime-write-closure.md` — Snapshot / status; `docs/architecture/phase-2-closure-criteria-checklist.md` — Phase 2 checklist — Runtime/write boundary |
| Identity decision workflow | Owner-gated identity resolution with auditable decisions | Conceptual model and rules live in Phase 2 and matching specs; execution workflow and populated decisions remain owner-gated | Yes — for identity-dependent Phase 3 work | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision ownership / audit; `docs/architecture/phase-2-closure-criteria-checklist.md` — Hard gates before Phase 3 implementation |
| Location decision workflow | Multi-location honesty; campus signals; no silent collapse | Conceptual model and CASE 2 rules are documented; populated location resolution and publishability remain owner-gated alongside identity | Yes — for location-dependent Phase 3 work | `docs/architecture/norway-school-identity-matching-spec.md` — Mandatory matching behavior — CASE 2; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Proposed conceptual domain model — school_locations / campuses |
| Publication decision workflow | Publication decisions separate from identity resolution | Publishability contract documented; operational publication decisions and PSA changes remain owner-gated per checklist | Yes — for PSA-facing Phase 3 emission | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Publishability contract; `docs/architecture/phase-2-closure-criteria-checklist.md` — Phase 2 checklist — Publishability contract |
| Controlled 1:N PSA emission rules | Phase 3 goal and rules treated as design input only | Execution plan states Phase 3 rules; emission remains blocked until separate implementation approval | Yes — for controlled 1:N PSA emission | `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase linkage / Phase 3 sections as applicable; `docs/architecture/phase-2-closure-criteria-checklist.md` — Hard gates before Phase 3 implementation |
| PSA materialization gate | Materialization separate from publication decision | Checklist and production-truth boundary treat materialization as owner-gated and not approved here | Yes — for PSA materialization work | `docs/architecture/phase-2-production-truth-closure.md` — PSA / Route boundary; `docs/architecture/phase-2-closure-criteria-checklist.md` — Hard gates before Phase 3 implementation |
| Route Engine consumption gate | Route consumes published internal truth only | Route and Phase 2 specs state boundary; consumption remains blocked until separate gate | Yes — for Route consumption of new truth | `docs/architecture/route-engine-master-spec.md` — School/Programme availability truth contract; `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Route Engine boundary |
| Audit trail policy | Append-only discipline; actor and basis on decision-bearing records | Rules documented in Phase 2 spec; enforcement remains implementation-gated | Yes — for audited Phase 3 paths | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision ownership / audit; `docs/architecture/phase-2-closure-criteria-checklist.md` — Hard gates before Phase 3 implementation |
| Rollback / supersession policy | Supersession and rollback semantics before truth mutation | Remains an open design area at documentation level until owner-closed | Yes — before execution that mutates truth | `docs/architecture/phase-2-closure-criteria-checklist.md` — Hard gates before Phase 3 implementation; `docs/architecture/phase-2-runtime-write-closure.md` — Open owner decisions carried forward |
| Unresolved / ambiguous cases remain blocked | Unresolved and ambiguous paths must not publish | Decision states and failure behavior documented; diagnostics must not resolve ties | Yes — if ambiguity were treated as publishable | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Decision states; `docs/architecture/phase-2-read-only-diagnostics-contract.md` — Decision / Scope |
| LOSA / external-delivery outside ordinary-school availability | Unsupported LOSA must not become ordinary-school publishable truth unless Phase 4 model is separately owner-approved | Phase 2 spec relates final LOSA model to Phase 4; Phase 4 LOSA docs are reference-only here | Yes — for ordinary-school PSA semantics until separate Phase 4 owner gate if ever needed | `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Relationship to Phase 4; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Phase 1A.2i LOSA boundary; `docs/architecture/phase-4-losa-official-source-registry.md` — Status / boundary; `docs/architecture/phase-4-losa-official-source-evidence-refresh-design.md` — Status / boundary |
| Namespace safety preserved | Namespace decisions remain authoritative | Namespace decision record is committed; changes remain owner-gated | Yes — if namespace drift would affect Phase 3 | `docs/architecture/phase-2-status-namespace-decisions.md` — Snapshot / status; `docs/architecture/phase-2-closure-criteria-checklist.md` — Allowed next strategic decisions |
| No random campus preserved | Never pick a random campus for availability truth | Locked forbidden rule in matching spec and execution plan hard principles | Yes — if violated | `docs/architecture/norway-school-identity-matching-spec.md` — Forbidden; `docs/architecture/norway-school-identity-matching-execution-plan.md` — Hard principles |
| No first-candidate behavior preserved | Sort order or first row must not decide identity | NSR candidate rules and backlog require auditable rationale | Yes — if violated | `docs/architecture/phase-2-validation-contour-data-resolution-backlog.md` — Typed classification / Required evidence; `docs/architecture/phase-2-closure-criteria-checklist.md` — Phase 2 checklist — NSR candidate evidence |
| No weak fuzzy tie-break preserved | Weak fuzzy or tie-break must not silently pick a school | Matching mandatory behavior and forbidden shortcuts | Yes — if violated | `docs/architecture/norway-school-identity-matching-spec.md` — Mandatory matching behavior; `docs/architecture/phase-2-closure-criteria-checklist.md` — Forbidden shortcuts |

## Phase 3 may be considered later only if

This checklist is **not** itself approval. LOSA / Phase 4 language below points to `docs/architecture/school-identity-location-resolution-phase-2-spec.md` and the Phase 4 LOSA source-governance docs listed in the hierarchy — **not** a new cross-phase approval rule invented here.

- Production truth **execution path** is separately owner-approved (beyond boundary documentation).
- Runtime/write **execution path** is separately owner-approved.
- Identity and location decisions are **auditable** per Phase 2 spec and checklist hard gates.
- Publication decisions are **auditable** and **separate** from identity resolution.
- Controlled 1:N PSA **emission rules** are explicitly owner-approved for implementation.
- Unresolved and ambiguous cases **remain blocked** from publication.
- LOSA and external-delivery cases **remain outside** ordinary-school availability **unless** a **separate Phase 4 model owner gate** approves otherwise, as scoped in `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Relationship to Phase 4 and the Phase 4 LOSA reference docs above.
- No weak fuzzy, random campus, or first-candidate behavior is **introduced** in implementation.
- PSA **materialization** is separately approved.
- Route Engine **consumption** is separately approved.
- Phase 3 **implementation** is explicitly owner-approved.

## Must remain blocked

- Phase 3 implementation
- Controlled 1:N PSA implementation
- PSA materialization
- PSA publication
- Route Engine consumption
- Runtime/write integration
- DB writes
- Pipeline/readiness integration
- Active operator workflow
- LOSA as ordinary school availability
- Using raw diagnostics as publication truth
- Using schema, docs, or boundary documents as production truth

## Forbidden shortcuts

Forbidden **examples** only; **not** allowed behavior:

- Phase 2 docs exist → Phase 3 approved
- Phase 2 operational docs exist → Phase 3 approved
- Production truth boundary exists → production truth executed
- Runtime/write boundary exists → write path approved
- Gate criteria exists → Phase 3 start
- Gate criteria exists → controlled 1:N PSA emission
- Publishable → PSA publication
- Multi-location → publishable
- First candidate wins
- Weak fuzzy tie-break → accepted school
- LOSA → ordinary school availability
- Diagnostics → publication truth
- Schema exists → write rows

## Owner gates still required

This document **approves none** of the following:

- Production truth execution design
- Runtime/write execution design
- Controlled 1:N PSA design
- PSA materialization design
- PSA publication gate
- Route Engine consumption gate
- Phase 3 implementation plan
- Phase 3 implementation approval
- Runtime safety QA
- Rollback/supersession design

## Open owner decisions carried forward

- **OPEN:** When Phase 2 production truth execution may start
- **OPEN:** How controlled 1:N PSA emission is scoped
- **OPEN:** How multi-location identity and location sets become eligible
- **OPEN:** How PSA materialization consumes publication decisions
- **OPEN:** How Route Engine consumes only published internal truth
- **OPEN:** How rollback/supersession is proven before Phase 3
- **OPEN:** How Phase 3 work is split from Phase 2 write-path work
- **OPEN:** How Phase 4 LOSA and external-delivery boundaries interact with Phase 3

## Final boundary statement

Phase 2 to Phase 3 gate criteria are documentation-defined here, but Phase 3 implementation, controlled 1:N PSA emission, runtime/write integration, PSA materialization, PSA publication, Route Engine consumption, and DB writes remain blocked until separate owner-approved gates.
