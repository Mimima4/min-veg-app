# Phase 2 Runtime/Write Owner Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner decision record — runtime/write boundary policy adopted |
| **Closure label** | `RUNTIME_WRITE_BOUNDARY_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | Phase 2 runtime/write boundary policy (R0 + decisions R1–R12) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `c4bd52c Add Phase 2 production truth owner decision record` (from `git log -1 --oneline` at record creation) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Closure levels — Phase 2 runtime/write closure |

This file records **owner-agreed runtime/write boundary policy** at **documentation level only**. It closes **Phase 2 runtime/write closure** only at **documentation / owner policy** level per the controlling checklist. **Operational** runtime/write integration (writes, pipeline/readiness hookup, populated rows, production resolution loop on main) remains **BLOCKED / NOT APPROVED**. This record does **not** close Phase 2 as a whole, operational production truth, PSA, Route, Phase 3, Phase 4 execution, Gate 34B, or main RLS apply.

## Relationship to prior owner records

- **Complements:** `docs/architecture/phase-2-evidence-model-owner-decision-record.md`, `docs/architecture/phase-2-governance-review-owner-decision-record.md`, `docs/architecture/phase-2-production-truth-owner-decision-record.md`, and `docs/architecture/phase-2-rls-security-owner-decision-record.md` (RLS record as **security policy context only**).
- **Does not** replace, weaken, or reinterpret evidence model decisions M0 + 1–8, governance/review decisions G0–G9, production truth decisions P0–P12, or RLS security policy decisions.
- **Conflict rule:** if this record conflicts with any prior owner record or a canonical source, the **stricter safety rule wins**; canonical sources (packet format, backlog, Phase 2 spec, matching spec, namespace decisions, RLS apply-readiness docs) win over all owner records if they conflict with any of them.
- **This record does NOT approve:** Gate 34B, main RLS apply, SQL, Supabase apply, or writes.

## This document is not

- implementation approval
- SQL approval or execution
- Supabase apply approval
- main / owner-used Supabase RLS apply approval
- Gate 34B approval
- Phase 2 table write approval
- observation row write approval
- candidate row write approval
- decision row write approval
- publication row write approval
- populated production truth approval
- production resolution loop on main approval
- operational production truth closure
- operational runtime/write integration approval
- diagnostics / helper / readiness integration approval
- helper / pipeline / readiness hookup approval
- PSA publication approval
- PSA materialization approval
- Route Engine consumption approval
- operator / admin workflow activation approval
- Phase 3 start approval
- Phase 4 LOSA execution approval

## Source basis

The following repository documents govern or contextualize this record:

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist; closure level definition
- `docs/architecture/phase-2-runtime-write-closure.md` — runtime/write boundary documentation
- `docs/architecture/phase-2-evidence-model-owner-decision-record.md` — evidence sufficiency policy (complementary)
- `docs/architecture/phase-2-governance-review-owner-decision-record.md` — governance/review policy (complementary)
- `docs/architecture/phase-2-production-truth-owner-decision-record.md` — production truth boundary policy (complementary)
- `docs/architecture/phase-2-rls-security-owner-decision-record.md` — RLS security policy (complementary; not main apply)
- `docs/architecture/phase-2-rls-apply-readiness-security-decision.md` — apply-readiness and negative-test intent
- `docs/architecture/phase-2-rls-security-review-plan.md` — RLS review plan (reference)
- `docs/architecture/phase-2-rls-sql-human-security-review-packet.md` — human security review packet (reference)
- `docs/architecture/phase-2-isolated-test-rls-evidence-record.md` — isolated test RLS evidence (not main approval)
- `docs/architecture/phase-2-staging-rls-execution-packet.md` — staging RLS packet (reference)
- `docs/architecture/phase-2-staging-rls-execution-decision.md` — staging RLS decision (reference)
- `docs/architecture/phase-2-production-truth-closure.md` — production truth boundary
- `docs/architecture/phase-2-evidence-model-closure-criteria.md` — evidence model closure boundaries
- `docs/architecture/phase-2-operational-evidence-sufficiency-standard.md` — operational evidence sufficiency boundaries
- `docs/architecture/phase-2-governance-review-closure.md` — governance/review boundaries
- `docs/architecture/phase-2-status-namespace-decisions.md` — owner-approved namespace rules
- `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Phase 2 conceptual / decision states; publishability; audit
- `docs/architecture/norway-school-identity-matching-spec.md` — school identity matching safety rules
- `docs/architecture/norway-school-identity-matching-execution-plan.md` — timeline / control context; zero-row rollout; no backfill
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md` — Phase 2 → Phase 3 prerequisites (gate not passed)
- `docs/architecture/phase-2-read-only-evidence-packet-format.md` — canonical `packet_status`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md` — diagnostics boundary
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — helper boundary; standalone vs pipeline
- `docs/architecture/phase-2-problem-contour-activation-read-model-map.md` — clean vs problem path
- `docs/architecture/phase-2-main-supabase-rollout-checklist.md` — main rollout context (reference)
- `docs/architecture/phase-4-source-truth-contour-map.md` — Phase 4 LOSA / external-delivery relationship crosswalk (docs-only)
- `docs/architecture/route-engine-master-spec.md` — Route Engine truth boundaries (VGS contour)

**Conflict rule:** if this record conflicts with a canonical source, the **canonical source wins** and this record must be revised.

---

## Meta-rule R0

All **Yes** decisions in this record (R1–R12) mean **runtime/write boundary policy only**.

None of R1–R12 authorizes implementation or execution. They do **not** authorize:

- code
- SQL
- Supabase apply
- main RLS apply
- Phase 2 table writes
- observation rows
- candidate rows
- decision rows
- publication rows
- populated production truth
- operational production truth closure
- production resolution loop on main
- operational runtime/write integration
- diagnostics / helper / readiness pipeline integration
- PSA publication
- PSA materialization
- Route Engine consumption
- operator / admin workflow
- helper / pipeline / readiness integration
- Phase 3 implementation or start
- Phase 4 LOSA execution
- Gate 34B or main / owner-used Supabase RLS apply

Closing runtime/write **policy** at documentation level does **not** close **operational** runtime/write integration.

Closing runtime/write **policy** at documentation level does **not** change the checklist to **approved for writes**.

Adopting this policy at documentation level does **not** mean production truth is live on main.

---

## Priority rule

If any rule from the evidence model owner record, governance/review owner record, production truth owner record, RLS/security owner record, RLS apply-readiness docs, production truth **P9** conflict/ambiguity block/default, governance **G6** better-blocked-than-false-route safety block, **R9** LOSA guard, **R10** audit/rollback rule, or any **stricter canonical source** applies, it **overrides** runtime/write activation.

**Runtime/write policy never overrides safety.**

---

## Decision R1 — Runtime/write forbidden until separate execution gate

**Owner decision:** **Yes**.

Adopting runtime/write boundary policy means **only rules on paper**. All actual writes, integrations, row creation, and **backfill** stay **forbidden** until a **separate owner-approved execution gate**.

- Policy closure does **not** insert rows.
- Policy closure does **not** enable write paths.
- Policy closure does **not** connect pipeline/readiness.
- Policy closure does **not** connect PSA or Route.
- Policy closure does **not** authorize backfill.
- Schema rollout complete does **not** authorize writes.
- **Operational** production truth remains **NOT CLOSED**.

---

## Decision R2 — Diagnostics/helper/readiness never drive writes

**Owner decision:** **Yes**.

Evidence packets, diagnostics, helper output, readiness/pipeline read-only output, candidates, review notes, human review completion, owner exception wording, and **`publishable`** wording must **never** directly trigger Phase 2 writes or publication decisions.

They may inform humans. They may support future review. They do **not** write, decide, publish, materialize PSA, or feed Route.

- Human review completed does **not** create writes.
- Owner exception wording does **not** create writes.
- Owner exception may only allow a case to be **considered** in a **later** gate — **not** immediate writes.

---

## Decision R3 — Decision and publication rows stay blocked on main

**Owner decision:** **Yes**.

Decision rows and publication rows on **main** stay **forbidden** until **both** a runtime/write **execution gate** and applicable **RLS/security gates** are separately approved.

**Forbidden now** (and until an explicit execution gate approves otherwise):

- no observation rows on main
- no candidate rows on main
- no decision rows on main
- no publication rows on main
- no table population on main
- no production resolution loop on main

---

## Decision R4 — RLS/security required before implementation writes

**Owner decision:** **Yes**.

Runtime/write **policy** may be logged **before** main RLS apply.

**Implementation** writes may **not** happen before applicable:

- RLS policy design approval
- main apply readiness
- negative tests

Isolated or staging RLS evidence does **not** open main. Isolated or staging RLS evidence does **not** open Gate 34B.

RLS/main apply is **required** before implementation writes, but **not** required before docs-only policy closure.

---

## Decision R5 — High-privilege paths are not product access

**Owner decision:** **Yes**.

`service_role`, `postgres`, `BYPASSRLS`, database-owner access, or high-privilege diagnostics paths are **never** ordinary product/user access without separate audited approval.

Maintenance / diagnostics / security paths are **not** family-facing product access. They cannot be used as a shortcut for runtime/write approval or product access approval. They require **separate** approval if they touch Phase 2 truth.

---

## Decision R6 — Negative tests before write activation

**Owner decision:** **Yes**.

Negative tests must **pass** before any Phase 2 write path is **activated**.

Before activation, tests must prove (intent; exact implementation later):

- anon denied
- ordinary authenticated denied
- frontend direct DB denied
- Route raw table access denied
- PSA raw table access denied
- writes denied unless explicitly approved
- diagnostics/helper output does not publish truth

**Policy logging** is **not** activation. Owner sign-off of R0–R12 is **not** test passage. Owner sign-off of R0–R12 is **not** write activation.

---

## Decision R7 — PSA and Route remain separate gates

**Owner decision:** **Yes**.

PSA materialization and Route consumption remain **separate future gates** after any future publication decision or write path.

There is **no automatic chain:**

- Phase 2 write → publication decision → PSA write → Route consumption

Publication decision does **not** write PSA by itself. PSA write does **not** authorize Route consumption by itself. Each step requires its own approved **future** gate.

---

## Decision R8 — Operator/admin workflow future-only

**Owner decision:** **Yes**.

Operator/admin workflow remains **future-only**. No direct database writes by reviewers are approved under this policy gate.

Reviewers do **not** write truth directly. Admin/operator UI is **not** approved. Workflow/storage/UI requires a **separate future gate**. Operator workflow is **not** a backdoor write path.

---

## Decision R9 — LOSA/external-delivery off ordinary write paths

**Owner decision:** **Yes**.

LOSA and external-delivery stay off ordinary-school write paths until Phase 4’s **separate model and execution gate**.

No ordinary-school write path for LOSA. No LOSA PSA materialization through Phase 2 runtime/write. No external-delivery shortcut into ordinary publication. LOSA / external-delivery remain **Phase 4 contour** until approved separately.

---

## Decision R10 — Future writes require audit, supersession, and rollback

**Owner decision:** **Yes**.

Any future write path must require **audit trail**, **supersession/revocation support**, and **rollback plan** before activation.

Future writes must record: **who**, **when**, **basis/evidence**, **what changed**, whether prior truth was **superseded** or **revoked**.

Rollback must exist **before** activation. Exact storage/design is **later**.

---

## Decision R11 — VGS availability does not authorize Phase 2 writes

**Owner decision:** **Yes**.

Working VGS `programme_school_availability` does **not** authorize Phase 2 table writes or runtime integration.

VGS/Route operational contour remains **separate**. `programme_school_availability` working does **not** approve Phase 2 runtime/write. Working routes do **not** approve Phase 2 table writes.

---

## Decision R12 — Helper/pipeline integration is a separate branch

**Owner decision:** **Yes**.

Readiness/pipeline diagnostics integration remains a **separate optional gate**. It is **not** part of Phase 2 runtime/write policy closure on the main checklist path.

Frozen standalone helper closure does **not** expand to readiness/pipeline/runtime integration without:

- separate contract
- ADR update
- owner gate

Runtime/write policy closure does **not** approve helper/pipeline hookup.

---

## RLS/security dependency boundary

| Topic | Policy in this record |
|-------|------------------------|
| Docs-only runtime/write policy closure | May be logged **before** main RLS apply |
| Implementation writes | **Blocked** until RLS policy design approval, main apply readiness, and negative tests |
| Isolated/staging RLS evidence | Does **not** open main; does **not** open Gate 34B |
| `service_role` / `postgres` / `BYPASSRLS` | Not ordinary product access; not runtime/write approval shortcut |
| Complementary RLS owner record | Security **policy** context only; does **not** approve apply or writes |

---

## Namespace and shortcut guardrails

- Do **not** introduce `publishable_candidate`, `not_publishable`, or `review_only` as canonical statuses (per `phase-2-status-namespace-decisions.md`).
- **`ready_for_review`** does **not** write; in `NAMESPACE=packet_status` it is **not** write approval.
- **`needs_review`** does **not** write; must always be **namespace-qualified**; is **not** family-facing finalized truth.
- **`publishable`** does **not** write; is **not** PSA and does **not** create rows.
- **Publication decision** does **not** materialize PSA by itself.
- **Evidence packet** does **not** write.
- **Diagnostics/helper/readiness output** does **not** write.
- **Candidate** does **not** write.
- **Owner exception** does **not** write by itself.
- **Schema/DDL/table existence** does **not** write; **empty tables** do **not** authorize writes.
- **Documentation closure → write approval** is **forbidden**.
- **Isolated/staging RLS evidence** does **not** open main.
- **`service_role` / `postgres` / `BYPASSRLS`** is **not** product access.

## Forbidden canonical tokens

The following remain **forbidden** as canonical status tokens unless a **later owner gate** explicitly defines and approves them:

- `publishable_candidate`
- `not_publishable`
- `review_only`

---

## What this record closes / does not close

| Closes (docs / owner policy only) | Does **not** close / remains blocked |
|-----------------------------------|--------------------------------------|
| Phase 2 **runtime/write closure** at checklist closure-level (boundary policy logged) | **Operational** runtime/write integration (writes, pipeline hookup) |
| Owner-adopted write/runtime boundary (R0–R12) | Phase 2 **observation/candidate/decision/publication row writes** on main |
| Diagnostics/helper/readiness ≠ write driver (policy) | **Operational** production truth (populated rows, loop on main) |
| RLS before implementation writes; policy may precede apply (policy) | **PSA** publication / materialization |
| PSA/Route separate gates; no auto chain (policy) | **Route Engine** consumption approval |
| LOSA/external off ordinary write paths (policy) | **Active** operator/admin workflow implementation |
| Audit/supersession/rollback requirement for future writes (policy) | **Phase 3** implementation |
| Helper/pipeline separate from runtime/write policy closure (policy) | **Phase 4 LOSA** execution |
| Complements evidence + governance + production truth + RLS policy without weakening them | **Gate 34B** / main RLS apply |
| VGS availability ≠ Phase 2 write approval (policy) | **Helper/pipeline/readiness** integration |

**Implementation OPEN (deferred):** runtime/write execution gate design; write-path actors; exact negative-test suite; main RLS apply; populated rows and production loop on main — **separate gates only**.

---

## Archive table (R0 + R1–R12)

| ID | Policy summary | Default if uncertain |
|----|----------------|----------------------|
| R0 | Runtime/write policy only; no execution | Block implementation leaps |
| R1 | Writes/integration/backfill forbidden until execution gate; schema ≠ writes | Block |
| R2 | Packets/diagnostics/helper/readiness/candidates/review ≠ writes | No auto-write from artifacts |
| R3 | No observation/candidate/decision/publication rows on main until gates | Block |
| R4 | RLS design + main readiness + negative tests before implementation writes | Staging ≠ main |
| R5 | High-privilege paths ≠ product access; no bypass shortcut | Deny |
| R6 | Negative tests before activation; sign-off ≠ tests passed | Block activation |
| R7 | No auto chain write → publication → PSA → Route | Separate gates per step |
| R8 | Operator/admin/reviewer direct writes future-only | Block backdoor writes |
| R9 | LOSA/external off ordinary Phase 2 write paths until Phase 4 | Block ordinary LOSA writes |
| R10 | Future writes need audit, supersession, rollback before activation | No silent overwrite |
| R11 | VGS `programme_school_availability` ≠ Phase 2 write approval | Contours separate |
| R12 | Helper/pipeline integration separate optional branch | No auto hookup |

---

## Recommended next gate (informational only)

This record supports closing **Phase 2 runtime/write closure** at **documentation / owner policy** level only in `phase-2-closure-criteria-checklist.md`.

**Operational** runtime/write integration remains **BLOCKED / NOT APPROVED**.

**Operational** production truth remains **NOT CLOSED**.

**Gate 34B** / main RLS apply remains a **separate** gate and is **not** approved by this record.

It does **not** select or approve implementation, SQL, Supabase, rows, runtime integration, PSA, Route, operator UI, Phase 3, Phase 4, Gate 34B, main RLS apply, or helper/pipeline integration.

Any next checklist-priority item must still follow the controlling checklist. Remaining **Blocked** operational/execution work includes, among others: **operational production truth**, **Gate 34B / main RLS apply**, **PSA materialization**, **Route consumption**, and **helper/pipeline integration**.

---

## Final boundary statement

Phase 2 runtime/write boundary policy is owner-adopted in this record at documentation level only. Operational runtime/write integration, observation/candidate/decision/publication row writes on main, populated production truth, production resolution loop on main, PSA publication, PSA materialization, Route Engine consumption, operator workflow, Phase 3, Phase 4 LOSA execution, Gate 34B, main RLS apply, and helper/pipeline integration remain **blocked** until **separate** owner-approved gates.
