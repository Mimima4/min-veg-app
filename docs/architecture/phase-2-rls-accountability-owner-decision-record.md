# Phase 2 RLS Accountability Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner/security accountability decision record — **NOT_READY_FOR_APPLY** / **EXECUTION_FORBIDDEN** / **EXECUTION_PACKET_DRAFT_FORBIDDEN** |
| **Closure label** | `RLS_ACCOUNTABILITY_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | Executor / approver / rollback owner **role-label** policy only |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `1207c11 Add Phase 2 RLS target map owner decision record` (from `git log -1 --oneline` at record creation) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section I (RLS accountability policy) |

This file records **owner-agreed RLS accountability policy** at **documentation level only** using **safe role labels** only. It does **not** store real names, emails, `project_ref`, dashboard URLs, API keys, service keys, connection strings, or secrets. It does **not** create or change `.env` configuration.

**Adopting this record does NOT change NOT_READY_FOR_APPLY, EXECUTION_FORBIDDEN, or EXECUTION_PACKET_DRAFT_FORBIDDEN.** Role-label naming **partially** operationalizes preconditions C4/C5 and target-map T10 “named” at **documentation level only**; it does **not** mean operational preconditions are satisfied (per-target snapshots, negative-test plan/pass, parity evidence, owner-held human identities, rollback SQL artifact).

**Role labels in git do not prove different humans.** Mapping role labels to actual people remains **owner-held outside the repository** unless a later gate explicitly approves storing identities in git.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged — snapshots, passing negative tests, parity, FORCE decision, and other operational preconditions remain **not** satisfied |
| **EXECUTION_FORBIDDEN** | Unchanged — SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply remain **forbidden** |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged — no execution packet until **separate** gate after remaining operational preconditions |
| **RLS_ACCOUNTABILITY_POLICY_ADOPTED_DOCS_ONLY** | Executor/approver/rollback **role labels** and rollback/good-state **policy requirements** logged on paper only; does **not** mean apply is safe or ready |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Complements:** `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` (T0–T11) — operationalizes T10 naming requirement at **role-label** level only; does **not** satisfy remaining T10 bullets.
- **Complements:** `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` (C4–C7) — does **not** replace C0–C16.
- **Complements:** `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` (Q8–Q9), `docs/architecture/phase-2-rls-security-owner-decision-record.md`, four Phase 2 policy owner records (evidence, governance, production truth, runtime/write).
- **Reference:** `docs/architecture/phase-2-staging-rls-execution-decision.md` — executor identity required in a **future** execution gate; this record supplies **label-level** accountability only.
- **Uses private target labels:** **STAGING-34B**, **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now**, **ISOLATED-LAB** (historical only). Gate 32 shorthand is **not** used for accountability rows.
- **Does not** reopen prior owner records unless an explicit owner gate says so.
- **Conflict rule:** if this record conflicts with any prior owner record or a canonical source, the **stricter safety rule wins**; canonical sources win over all owner records.

## This document is not

- SQL approval or execution
- Supabase apply approval
- Gate 34B execution approval
- staging RLS apply approval
- main / owner-used RLS policy apply approval
- production RLS apply approval
- proof that RLS apply readiness is achieved
- proof that operational preconditions are satisfied
- execution packet approval
- runtime/write integration approval
- Phase 2 observation / candidate / decision / publication row write approval
- operational production truth closure
- PSA publication or materialization approval
- Route Engine consumption approval
- operator / admin workflow activation approval
- helper / pipeline / readiness integration approval
- Phase 3 start or implementation approval
- Phase 4 LOSA execution approval
- `.env` configuration or runtime environment-variable work
- cleanup, migration, deletion, or new-project creation approval
- storage of real names or emails in git (unless a later explicit gate approves it)

## Source basis

The following repository documents govern or contextualize this record:

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist
- `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` — target-map policy (complementary)
- `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` — preconditions policy (complementary)
- `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` — readiness policy (complementary)
- `docs/architecture/phase-2-rls-security-owner-decision-record.md` — RLS security policy
- `docs/architecture/phase-2-staging-rls-execution-decision.md` — Gate 32 staging decision (reference)
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md` — Phase 2 → Phase 3 prerequisites (gate not passed)
- `docs/architecture/phase-2-runtime-write-owner-decision-record.md` — runtime/write policy (complementary)
- `docs/architecture/phase-2-production-truth-owner-decision-record.md` — production truth policy (complementary)
- `docs/architecture/phase-2-governance-review-owner-decision-record.md` — governance/review policy (complementary)
- `docs/architecture/phase-2-evidence-model-owner-decision-record.md` — evidence policy (complementary)

**Conflict rule:** if this record conflicts with a canonical source, the **canonical source wins** and this record must be revised.

---

## Meta-rule A0

All **Yes** decisions in this record (A1–A12) mean **RLS accountability policy on paper only**.

None of A1–A12 authorizes SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, runtime/write, row creation, PSA, Route, operator workflow, helper/pipeline hookup, Phase 3, Phase 4, cleanup, migration, execution packet drafting, or `.env` changes.

**Child-information protection:** because Min Veg works with information about **children**, security, privacy, truthful presentation, and data minimization **override speed** for any future RLS work.

---

## Priority rule (A12)

If a stricter rule exists in the evidence model, governance/review, production truth, or runtime/write owner records; the RLS apply readiness owner record; the RLS apply preconditions owner record; the RLS target-map owner record; the RLS security owner record; canonical specs; or this checklist, the **stricter safety rule wins**.

No accountability record may weaken child-information protection, privacy, truthfulness, data minimization, or no-execution rules.

---

## Owner/security accountability decisions (A1–A12)

### Decision A0 — Scope / non-execution

**Owner decision:** **Yes**.

This session adopts **accountability policy only** — who may execute, who must approve, who owns rollback, where labels are stored. It does **not** schedule, approve, or execute any database change or product integration.

### Decision A1 — Role labels only in git; identities owner-held

**Owner decision:** **Yes**.

Git records **role labels** only. Real names and emails remain **owner-held outside the repository** unless a later gate explicitly approves git storage.

### Decision A2 — Executor role labels

**Owner decision:** **Yes**.

| Target label | Executor role label |
|--------------|---------------------|
| **STAGING-34B** | **TECH_EXECUTOR** |
| **MAIN-OWNER-USED** | **TECH_EXECUTOR** |

### Decision A3 — Approver role labels

**Owner decision:** **Yes**.

| Target label | Approver role label |
|--------------|---------------------|
| **STAGING-34B** | **OWNER** |
| **MAIN-OWNER-USED** | **OWNER** |

### Decision A4 — Rollback owner role labels

**Owner decision:** **Yes**.

| Target label | Rollback owner role label |
|--------------|---------------------------|
| **STAGING-34B** | **ROLLBACK_OWNER** |
| **MAIN-OWNER-USED** | **ROLLBACK_OWNER** |

### Decision A5 — Separation of duties on MAIN-OWNER-USED

**Owner decision:** **Yes**.

On **MAIN-OWNER-USED**, executor role label (**TECH_EXECUTOR**) must differ from approver role label (**OWNER**). This is a **label-level** separation requirement, not proof that different humans hold the roles.

### Decision A6 — Separate accountability per target label

**Owner decision:** **Yes**.

Accountability is recorded **per target label** (separate matrix rows). The **same** role labels may appear on **STAGING-34B** and **MAIN-OWNER-USED**; per-target rows are **policy separation**, not staffing separation.

### Decision A7 — MAIN-OWNER-USED stricter than STAGING-34B (pinned minimum)

**Owner decision:** **Yes**.

**Docs policy minimum for MAIN-OWNER-USED (production-like / higher-risk):**

1. Approver role label **≠** executor role label (**OWNER** ≠ **TECH_EXECUTOR**).
2. Rollback owner role label **≠** executor role label (**ROLLBACK_OWNER** ≠ **TECH_EXECUTOR**).
3. No future manual step on **MAIN-OWNER-USED** may be **scheduled** without explicit **approver-role authorization** recorded **owner-held outside the repository**.

**STAGING-34B:** executor and approver labels differ (**TECH_EXECUTOR** vs **OWNER**). Stricter staffing separation is **recommended** but not mandatory beyond label separation. This decision does **not** define scheduling tools, calendars, or rollback SQL.

### Decision A8 — No anonymous execution

**Owner decision:** **Yes**.

No future manual RLS/security step may be scheduled or run without a **named executor role label**, **named approver role label**, and **named rollback owner role label** (and owner-held human mapping where required).

### Decision A9 — Rollback trigger list adopted

**Owner decision:** **Yes**.

Minimum rollback triggers (owner-level; adopted from preconditions C6):

| Trigger | Force stop / rollback discussion |
|---------|----------------------------------|
| Wrong environment targeted | **Yes** |
| Partial apply | **Yes** |
| Unexpected permission result | **Yes** |
| Failed security checks after change | **Yes** |
| Diagnostics / helper failure after change | **Yes** |
| Raw evidence leak suspicion | **Yes** |
| Owner / security stop decision | **Yes** |
| Policy name collision | **Yes** |
| Bypass / privileged path surprise | **Yes** |

### Decision A10 — Good restored state per target

**Owner decision:** **Yes**.

“Good restored state” must be defined **per target label** (**STAGING-34B**, **MAIN-OWNER-USED**) **after** a read-only snapshot for that target — **before** any future execution packet. **Isolated lab baseline must not** be copied to staging or main.

**Policy examples (per target, after snapshot):**

- Previous row-level protection state restored as documented
- Previous protection rule count and names restored
- Previous role/grant posture restored
- Read-only diagnostics behavior restored to prior documented behavior
- No raw Phase 2 evidence leak to app or family-facing surfaces

**Operational status:** good-state **policy** adopted; per-target concrete values remain **unresolved** until snapshot gate.

### Decision A11 — Naming does not open execution

**Owner decision:** **Yes**.

Logging executor/approver/rollback **role labels** does **not** allow: execution packet draft, SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution.

### Decision A12 — Priority rule

**Owner decision:** **Yes** (see Priority rule section above).

---

## Accountability matrix

| Target label | Executor | Approver | Rollback owner | Separation required? | Stricter than staging? | Same labels as other target? | Execution approved? |
|--------------|----------|----------|----------------|----------------------|------------------------|------------------------------|---------------------|
| **STAGING-34B** | TECH_EXECUTOR | OWNER | ROLLBACK_OWNER | Recommended (executor ≠ approver labels) | No | Yes (same labels as MAIN row; not staffing separation) | **No** |
| **MAIN-OWNER-USED** | TECH_EXECUTOR | OWNER | ROLLBACK_OWNER | **Yes** (required: executor ≠ approver labels) | **Yes** | Yes (same labels as STAGING row) | **No** |
| **PROD** (planning) | Same as **MAIN-OWNER-USED** | Same as **MAIN-OWNER-USED** | Same as **MAIN-OWNER-USED** | Same as MAIN | Same as MAIN | PROD = MAIN for now | **No** — separate production apply gate remains future |
| **ISOLATED-LAB** | N/A | N/A | N/A | N/A | N/A | N/A | **No** — historical only; no future apply accountability |

---

## What this record closes / does not close

| Closes (docs / owner policy only) | Does **not** close / remains blocked |
|-----------------------------------|--------------------------------------|
| Owner-adopted RLS **accountability policy** (A0–A12) with role labels | **NOT_READY_FOR_APPLY** |
| Executor / approver / rollback **role labels** in repository | **EXECUTION_FORBIDDEN** |
| Rollback trigger list and good-state **policy requirements** | **EXECUTION_PACKET_DRAFT_FORBIDDEN** |
| Partial C4/C5/T10 “named” at **label** level | Exact human identities (owner-held) |
| | Per-target RLS snapshots |
| | Negative-test plan/pass on real target |
| | Per-target good-state **operational** values |
| | Rollback SQL artifact |
| | Gate 34B execution, all apply tracks |
| | Runtime/write, rows, PSA, Route, operator, helper/pipeline, Phase 3/4 |

**Implementation OPEN (deferred):** per-target snapshot planning; negative-test planning; diagnostics post-RLS compatibility; FORCE RLS decision; parity evidence; cleanup/migration feasibility audit; execution packet gate; any apply execution gate.

---

## Archive table (A0 + A1–A12)

| ID | Policy summary | Default if uncertain |
|----|----------------|----------------------|
| A0 | Accountability policy only; not execution | Block execution |
| A1 | Role labels in git; identities owner-held | Block PII in git |
| A2 | Executor labels per target | Block anonymous run |
| A3 | Approver labels per target | Block self-approval on MAIN |
| A4 | Rollback owner labels per target | Block |
| A5 | MAIN: executor label ≠ approver label | Block same label on MAIN |
| A6 | Per-target rows; same labels allowed | Do not merge targets |
| A7 | MAIN stricter than STAGING (pinned minimum) | Slower gates on MAIN |
| A8 | No anonymous execution | Block |
| A9 | Full rollback trigger list | Stop on trigger |
| A10 | Good state per target; not from lab | Block lab → main copy |
| A11 | Naming ≠ execution approval | Block packet/apply leap |
| A12 | Stricter safety wins | Block |

---

## Recommended next gate (informational only)

This record logs **RLS accountability policy** at documentation level only. It does **not** select an execution gate, negative-test **implementation**, FORCE **decision**, snapshot **execution**, or execution **packet**.

**NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged.

Any next checklist-priority item requires **separate read-only selection**. **Non-selected** future candidates include: per-target RLS snapshot planning; negative-test planning; diagnostics compatibility planning; FORCE RLS separate decision; parity planning; read-only migration/cleanup feasibility audit for MAIN clutter — each requires its **own** owner gate.

SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, runtime/write implementation, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 execution remain **forbidden** until **explicitly** approved by **separate** gates.

---

## Final boundary statement

**Owner policy (2026-05-18):** RLS snapshot requirements (S0–S14) per `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` — requirements only; no live snapshot, no execution packet, no apply; **NOT_READY_FOR_APPLY** unchanged.

Phase 2 RLS accountability policy is owner-adopted in this record at documentation level only using role labels **TECH_EXECUTOR**, **OWNER**, and **ROLLBACK_OWNER** on **STAGING-34B** and **MAIN-OWNER-USED** (with **PROD = MAIN-OWNER-USED for now**). **NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain in force. **RLS_ACCOUNTABILITY_POLICY_ADOPTED_DOCS_ONLY** does **not** mean apply is ready or safe. Gate 34B execution, staging apply, main / owner-used RLS policy apply, production apply, cleanup, migration, runtime/write integration, Phase 2 row writes, operational production truth, PSA publication, PSA materialization, Route Engine consumption, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 LOSA execution remain **blocked** until **separate** owner-approved gates.
