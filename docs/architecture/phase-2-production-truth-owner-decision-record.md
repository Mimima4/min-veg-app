# Phase 2 Production Truth Owner Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner decision record — production truth boundary policy adopted |
| **Closure label** | `PRODUCTION_TRUTH_BOUNDARY_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | Phase 2 production truth boundary policy (P0 + decisions P1–P12) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `a3ee625 Add Phase 2 governance review owner decision record` (from `git log -1 --oneline` at record creation) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Closure levels — Phase 2 production truth closure |

This file records **owner-agreed production truth boundary policy** at **documentation level only**. It closes **Phase 2 production truth closure** only at **documentation / owner policy** level per the controlling checklist. **Operational** production truth (populated durable rows, production resolution loop on main) remains **NOT CLOSED**. This record does **not** close Phase 2 as a whole, runtime/write, PSA, Route, Phase 3, or Phase 4 execution.

## Relationship to prior owner records

- **Complements:** `docs/architecture/phase-2-evidence-model-owner-decision-record.md` and `docs/architecture/phase-2-governance-review-owner-decision-record.md` (both 2026-05-18).
- **Does not** replace, weaken, or reinterpret evidence model decisions M0 + 1–8 or governance/review decisions G0–G9.
- **Conflict rule:** if this record conflicts with either prior owner record or a canonical source, the **stricter safety rule wins**; canonical sources (packet format, backlog, Phase 2 spec, matching spec, namespace decisions) win over all owner records if they conflict with any of them.

## This document is not

- implementation approval
- SQL approval or execution
- Supabase apply approval
- populated production rows approval
- Phase 2 decision row write approval
- production resolution loop on main approval
- operational production truth closure
- PSA publication approval
- PSA materialization approval
- Route Engine consumption approval
- runtime/write integration approval
- operator/admin workflow activation approval
- helper / pipeline / readiness integration approval
- Phase 3 start approval
- Phase 4 LOSA execution approval
- Gate 34B approval
- main / owner-used Supabase RLS apply approval

## Source basis

The following repository documents govern or contextualize this record:

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist; closure level definition
- `docs/architecture/phase-2-production-truth-closure.md` — production truth boundary documentation
- `docs/architecture/phase-2-evidence-model-owner-decision-record.md` — evidence sufficiency policy (complementary)
- `docs/architecture/phase-2-governance-review-owner-decision-record.md` — governance/review policy (complementary)
- `docs/architecture/phase-2-evidence-model-closure-criteria.md` — evidence model closure boundaries
- `docs/architecture/phase-2-operational-evidence-sufficiency-standard.md` — operational evidence sufficiency boundaries
- `docs/architecture/phase-2-governance-review-closure.md` — governance/review boundaries
- `docs/architecture/phase-2-status-namespace-decisions.md` — owner-approved namespace rules
- `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Phase 2 conceptual / decision states; publishability; audit
- `docs/architecture/norway-school-identity-matching-spec.md` — school identity matching safety rules
- `docs/architecture/norway-school-identity-matching-execution-plan.md` — timeline / control context; zero-row rollout
- `docs/architecture/phase-2-runtime-write-closure.md` — runtime/write boundary
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md` — Phase 2 → Phase 3 prerequisites (gate not passed)
- `docs/architecture/phase-2-read-only-evidence-packet-format.md` — canonical `packet_status`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md` — diagnostics boundary
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — helper boundary
- `docs/architecture/phase-2-problem-contour-activation-read-model-map.md` — clean vs problem path
- `docs/architecture/phase-4-source-truth-contour-map.md` — Phase 4 LOSA / external-delivery relationship crosswalk (docs-only)
- `docs/architecture/phase-2-main-supabase-rollout-checklist.md` — main rollout context (reference)
- `docs/architecture/phase-2-isolated-test-rls-evidence-record.md` — isolated test RLS evidence (not main approval)
- `docs/architecture/phase-2-staging-rls-execution-packet.md` — staging RLS packet (reference)
- `docs/architecture/phase-2-staging-rls-execution-decision.md` — staging RLS decision (reference)

**Conflict rule:** if this record conflicts with a canonical source, the **canonical source wins** and this record must be revised.

---

## Meta-rule P0

All **Yes** decisions in this record (P1–P12) mean **production truth boundary policy only**.

None of P1–P12 authorizes implementation or execution. They do **not** authorize:

- code
- SQL
- Supabase apply
- Phase 2 decision row writes
- populated production rows
- operational production truth closure
- production resolution loop on main
- runtime/write integration
- PSA publication
- PSA materialization
- Route Engine consumption
- operator/admin workflow implementation
- helper / pipeline / readiness integration
- Phase 3 implementation or start
- Phase 4 LOSA execution
- Gate 34B or main / owner-used Supabase RLS apply

Adopting this policy at documentation level does **not** mean production truth is live in main.

---

## Priority rule

If any rule from the **evidence model owner record**, **governance/review owner record**, **P8 LOSA guard**, **P9 block/default rule**, **P11 traceability/supersession rule**, or any **stricter canonical source** applies, it **overrides** treating a case as production truth.

**Production truth policy never overrides safety by itself.**

Triggers include (non-exhaustive):

- evidence model decisions 2–7, M0, and forbidden shortcuts (decision 6)
- governance G1–G3, G6–G9
- LOSA / external-delivery exclusion (P8; evidence model decision 3)
- better blocked than false route (P9; evidence model decision 5)
- no first-match / weak-fuzzy / random-campus rules

---

## Decision P1 — Production truth must be explicit and audited

**Owner decision:** **Yes**.

Phase 2 **production truth** means only **explicit, audited identity/location resolution decisions** and **publication decisions**.

Production truth must **never** be inferred from:

- dossiers or evidence packets
- candidates (NSR, identity, location, alias)
- diagnostics, helper output, or readiness/pipeline read-only output
- review notes, human review completion, or owner exception wording
- Route/VGS verification display or Utdanning / other verified display naming
- UI wording
- schema/DDL presence, empty tables, or populated tables

Truth is intentionally created only through a **future approved execution gate**.

- **Human review happened** does not create production truth.
- **Owner exception wording** does not create production truth.
- **`packet_status=ready_for_review`** or “packet ready” does not create production truth.
- **Verification/display language** is not publication proof or family-facing finalized truth.

---

## Decision P2 — Planning and read-only outputs never create truth

**Owner decision:** **Yes**.

Evidence packets, backlog classifications, diagnostics, helper output, and readiness/pipeline read-only reports may **inform** future review or decisions.

They **never** create production truth by themselves. They do **not**:

- write truth
- approve publication
- trigger PSA
- feed Route as Phase 2 production truth

---

## Decision P3 — Observations and candidates are not production truth

**Owner decision:** **Yes**.

**Source observations**, NSR candidates, identity/location candidates, alias-match candidates, and backlog items remain **evidence or planning artifacts** until a separate future audited decision gate creates durable truth.

- **Observation** is not a decision.
- **Candidate** is not a decision.
- **Backlog item** is not publication readiness.
- No **first-match**, **sort-order**, **weak fuzzy**, or **convenience winner** becomes truth.

---

## Decision P4 — Identity/location decision and publication decision are separate

**Owner decision:** **Yes**.

Identity/location resolution and publication decision remain **separate gates** with **no automatic promotion** between them.

- Resolved identity/location does **not** automatically publish.
- Publication decision must be **separate**, **explicit**, and **auditable**.
- Publication decision must **not** be inferred from review, candidates, `packet_status`, `publishable` wording, or governance review completion.

---

## Decision P5 — `publishable` decision state is not PSA publication or Route truth

**Owner decision:** **Yes**.

**`publishable`** in Phase 2 decision language (`NAMESPACE=phase2_decision_state`) means only **eligible for a later publication flow**.

It does **not** mean:

- PSA publication
- PSA materialization
- Route consumption
- family-facing finalized truth
- runtime truth change

---

## Decision P6 — Publication decision is not PSA materialization

**Owner decision:** **Yes**.

**PSA materialization** remains a **separate future gate** even after a publication decision exists.

- Publication decision is a **prerequisite**, not the PSA write.
- PSA materialization requires its own approved **implementation/materialization** gate.

---

## Decision P7 — Operational truth, rows, and runtime/write remain blocked

**Owner decision:** **Yes**.

**Operational** production truth remains **NOT CLOSED** until separate owner-approved execution gates.

Populated durable rows, decision rows, publication rows, DB writes, production resolution loop on main, and runtime/write paths remain **blocked** until **runtime/write** and other execution gates are **separately** owner-approved.

This record closes **documentation / owner policy** only. It does **not** authorize:

- table population
- production resolution loop on main
- runtime integration

Zero rows in Phase 2 tables does **not** block **policy** closure and does **not** prove **operational** closure.

Empty tables, DDL, schema presence, or docs/policy closure do **not** mean operational production truth is closed.

---

## Decision P8 — LOSA / external-delivery excluded from ordinary production truth

**Owner decision:** **Yes**.

LOSA and external-delivery remain **excluded from ordinary-school production truth** until a **separate Phase 4 LOSA model and execution gate** exist.

LOSA/external-delivery may be tracked or blocked as a special contour. They cannot become ordinary school truth through Phase 2 review or production truth policy alone.

**Approved namespaces only:**

- `packet_status`: `blocked_losa` / `blocked_external_delivery`
- decision/backlog: `unsupported_losa` / `external_delivery`

`docs/architecture/phase-4-source-truth-contour-map.md` is **docs-only relationship guidance** — **not** publication or connector approval.

---

## Decision P9 — Ambiguity, conflict, and review states remain blocked by default

**Owner decision:** **Yes**.

For source conflicts, **`needs_review`** cases (namespace-qualified), ambiguous multi-location/multi-campus without campus signal, weak fuzzy winner, first-match temptation, unclear NSR hierarchy, competing plausible candidates, or pressure to unblock, the production truth path stays **blocked by default**.

- **Better blocked than false route** applies to production truth.
- **`needs_review`** blocks family-facing finalized truth until a publication path approves publication (governance G1).
- A **logged owner exception** may allow the case to be **considered in a later gate only**.
- Logged owner exception does **not** create **immediate** production truth.
- Owner exception does **not** silently override safety or publication gates.

---

## Decision P10 — VGS availability is not Phase 2 production truth

**Owner decision:** **Yes**.

Working VGS **`programme_school_availability`** does **not** close Phase 2 production truth and does **not** authorize Phase 2 decision-row writes.

- VGS/Route operational contour stays **separate** from the Phase 2 evidence → decision → publication contour.
- Route/VGS working baseline is **not** wired as a Phase 2 production truth loop on main (per execution plan rollout).

---

## Decision P11 — Supersession and traceability; no silent overwrite

**Owner decision:** **Yes**.

Before any future production truth write path, Phase 2 must require **auditable supersession/revocation** semantics:

- a new decision may supersede an older one
- must **not** silently overwrite or erase prior truth
- no hidden erasure

**Traceability** must include **who**, **when**, and **basis/evidence** (carries forward governance **G9**).

**Exact storage channel** for sign-off / supersession may be deferred to a later gate (packet vs separate log vs DB model vs UI/workflow).

---

## Decision P12 — No automatic publication → PSA → Route chain

**Owner decision:** **Yes**.

**PSA materialization** and **Route consumption** remain **separate future gates** after a publication decision.

There is **no automatic chain:**

- publication decision → PSA write → Route consumption

Each step requires its own approved **future** gate.

---

## Namespace guardrails

- Do **not** introduce `publishable_candidate`, `not_publishable`, or `review_only` as canonical statuses (per `phase-2-status-namespace-decisions.md`).
- **`publishable`** in `NAMESPACE=phase2_decision_state` is **not** PSA publication.
- **`ready_for_review`** in `NAMESPACE=packet_status` is **not** truth and **not** publication.
- **`needs_review`** must always be **namespace-qualified**; never use bare `needs_review` when ambiguous.
- **`needs_review`** is **not** family-facing finalized truth.
- Do **not** merge `blocked_losa` / `blocked_external_delivery` with `unsupported_losa` / `external_delivery`.
- Route/VGS verification language is **not** Phase 2 publication approval.

## Forbidden canonical tokens

The following remain **forbidden** as canonical status tokens unless a **later owner gate** explicitly defines and approves them:

- `publishable_candidate`
- `not_publishable`
- `review_only`

---

## What this record closes / does not close

| Closes (docs / owner policy only) | Does **not** close / remains blocked |
|-----------------------------------|--------------------------------------|
| Phase 2 **production truth closure** at checklist closure-level (boundary policy logged) | **Operational** production truth (populated rows, loop on main) |
| Owner-adopted truth path: explicit audited decisions only (P0–P12) | Phase 2 **runtime/write** closure |
| Observation/candidate/packet/diagnostics ≠ truth (policy) | Phase 2 **decision row writes** |
| Identity/location vs publication decision separation (policy) | **PSA** publication / materialization |
| `publishable` ≠ PSA/Route/family truth (policy) | **Route Engine** consumption approval |
| LOSA/external ordinary-school exclusion (policy) | **Active** operator/admin workflow implementation |
| Supersession/traceability requirement (storage deferred) | **Phase 3** implementation |
| Complements evidence + governance records without weakening them | **Phase 4 LOSA** execution |
| | **Gate 34B** / main RLS apply |
| | **Helper/pipeline/readiness** integration |
| | Populated Phase 2 decision/publication rows on main |

**Implementation OPEN (deferred):** where production truth rows are stored; decision basis version representation; publication decision representation; PSA materialization consumption of publication decisions; Route consumption of published internal truth only; operator audit trail exposure — **separate gates only**.

---

## Archive table (P0 + P1–P12)

| ID | Policy summary | Default if uncertain |
|----|----------------|----------------------|
| P0 | Production truth policy only; no execution | Block implementation leaps |
| P1 | Truth = explicit audited decisions only; never inferred | Block inferred truth |
| P2 | Packets/diagnostics/helper/readiness ≠ truth | No auto-truth from reports |
| P3 | Observations/candidates/backlog ≠ durable truth | Block |
| P4 | Identity/location ≠ publication decision | No auto-publish |
| P5 | Decision `publishable` ≠ PSA/Route/family truth | Separate publication gates |
| P6 | Publication decision ≠ PSA materialization | Separate materialization gate |
| P7 | Operational truth/rows/runtime blocked; policy only here | Not closed operationally |
| P8 | LOSA/external not ordinary-school truth until Phase 4 | Block ordinary LOSA truth |
| P9 | Conflict/ambiguity/default blocked; exception → later gate only | Block |
| P10 | VGS availability ≠ Phase 2 production truth | Contours separate |
| P11 | Supersession + traceability (who/when/basis); storage deferred | No silent overwrite |
| P12 | No auto chain publication → PSA → Route | Separate gates per step |

---

## Recommended next gate (informational only)

This record supports closing **Phase 2 production truth closure** at **documentation / owner policy** level only in `phase-2-closure-criteria-checklist.md`.

**Operational** production truth remains **NOT CLOSED**.

It does **not** select or approve implementation, populated rows, production loop on main, runtime/write, PSA, Route, operator UI, Phase 3, Phase 4, Gate 34B, main RLS, or helper/pipeline integration.

Any next checklist-priority item must still follow the controlling checklist. Remaining **Blocked** closure levels include, among others: **Phase 2 runtime/write closure — Blocked / not approved**.

---

## Final boundary statement

Phase 2 production truth boundary policy is owner-adopted in this record at documentation level only. Operational production truth, populated rows, production resolution loop on main, runtime/write integration, PSA publication, PSA materialization, Route Engine consumption, Phase 2 decision row writes, operator workflow, Phase 3, Phase 4 LOSA execution, Gate 34B, main RLS apply, and helper/pipeline integration remain **blocked** until **separate** owner-approved gates.
