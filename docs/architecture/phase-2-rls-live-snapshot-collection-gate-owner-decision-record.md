# Phase 2 RLS Live Snapshot Collection Gate Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner/security **live snapshot collection gate definition** — **NOT_READY_FOR_APPLY** / **EXECUTION_FORBIDDEN** / **EXECUTION_PACKET_DRAFT_FORBIDDEN** |
| **Closure label** | `RLS_LIVE_SNAPSHOT_COLLECTION_GATE_DEFINED_DOCS_ONLY` |
| **Scope** | Live per-target snapshot collection **gate** definition only (SG0–SG18) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `85d70a2 Add Phase 2 RLS parity evidence planning owner decision record` |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section P (RLS live snapshot collection gate) |

This file records **owner-agreed gate definition** for **future live per-target RLS snapshot collection** at **documentation level only**.

It defines **what a separate execution gate must approve**, **which targets**, **read-only boundaries**, and **storage posture** — it does **not** connect to Supabase, does **not** collect snapshot evidence, and does **not** satisfy operational good-restored-state values.

**Adopting this record does NOT change NOT_READY_FOR_APPLY, EXECUTION_FORBIDDEN, or EXECUTION_PACKET_DRAFT_FORBIDDEN.**

**Gate defined ≠ Supabase connect approved ≠ snapshot collected ≠ good-restored-state values closed.** Logging this gate does **not** authorize any database session.

**Primary safety target:** **MAIN-OWNER-USED** / **PROD** (**PROD = MAIN-OWNER-USED for now**) is the **primary** target for first live snapshot collection **when** a future execution gate approves collection.

**STAGING-34B** remains an **optional rehearsal / safety track** only. **STAGING-34B** is **not mandatory** before MAIN snapshot collection planning or execution. **STAGING-34B** snapshot evidence **never** satisfies **MAIN-OWNER-USED** requirements without **parity evidence** and a **separate MAIN** decision (C14, N16, P5).

This record does **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, raw child/school rows, snapshot dumps, grant matrices, bypass dumps, or exact SQL output. It does **not** create or change `.env` configuration.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged — live snapshot **values** not collected; test pass, compatibility pass, FORCE enablement, packet, and apply remain **not** satisfied |
| **EXECUTION_FORBIDDEN** | Unchanged — SQL apply, Gate 34B execution, staging/main/production apply remain **forbidden** |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged — no execution packet until **separate** gates after evidence, tests, and review |
| **RLS_LIVE_SNAPSHOT_COLLECTION_GATE_DEFINED_DOCS_ONLY** | Collection **gate** defined on paper only; does **not** mean connect occurred or evidence exists |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Complements / depends on:** `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` (S0–S14 Tier 1/Tier 2 field requirements).
- **Complements / depends on:** `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` (E0–E18 capture, review, storage, dependencies).
- **Complements:** `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` (C2 re-snapshot, C7 good restored state).
- **Complements:** `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` (A10 good-state policy; role labels).
- **Complements:** `docs/architecture/phase-2-rls-parity-evidence-planning-owner-decision-record.md` (P5, P8 — STAGING ≠ MAIN; physical sameness).
- **Complements:** `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` (T6, T8, T9 — labels; clutter note; cleanup audit separate).
- **Complements:** `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` (N4, E13 alignment — tests after evidence).
- **Complements:** `docs/architecture/phase-2-read-only-diagnostics-contract.md`, `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` (diagnostics baseline in capture).
- **Uses private target labels:** **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now**, **STAGING-34B** (optional rehearsal only), **ISOLATED-LAB** (historical only).
- **Conflict rule:** if this record conflicts with any prior owner record or a canonical source, the **stricter safety rule wins**; canonical sources win over all owner records.

## This document is not

- approval of **live snapshot collection execution** (separate gate required)
- Supabase connect or apply approval
- proof that snapshot evidence was collected or reviewed
- operational good-restored-state **values** closure
- negative-test **execution** or **pass** approval
- post-RLS diagnostics compatibility **pass** approval
- FORCE RLS **enablement** approval
- parity **evidence** collection or STAGING→MAIN transfer approval
- Gate 34B execution approval
- staging / main / production RLS apply approval
- execution packet approval or drafting permission
- runtime/write integration approval
- Phase 2 row write approval
- PSA / Route / operator / helper / Phase 3 / Phase 4 approval
- cleanup, migration, deletion, or new-project creation approval
- storage of secrets, snapshot dumps, or raw evidence in git

## Source basis

- `docs/architecture/phase-2-closure-criteria-checklist.md`
- `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md`
- `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md`
- `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md`
- `docs/architecture/phase-2-rls-accountability-owner-decision-record.md`
- `docs/architecture/phase-2-rls-parity-evidence-planning-owner-decision-record.md`
- `docs/architecture/phase-2-rls-target-map-owner-decision-record.md`
- `docs/architecture/phase-2-main-supabase-rollout-checklist.md` — schema-only context on main

**Conflict rule:** canonical sources win; this record must be revised if in conflict.

---

## Meta-rule SG0

All **Yes** decisions in this record (SG1–SG18) mean **live snapshot collection gate definition on paper only**.

None of SG1–SG18 authorizes SQL (including DDL/DML), Supabase connect, Supabase apply, live snapshot **collection**, snapshot value publication in git, negative-test execution, diagnostics re-run, FORCE enablement, Gate 34B execution, staging apply, main apply, production apply, evidence transfer, runtime/write, row creation, PSA, Route, operator workflow, helper/pipeline hookup, Phase 3, Phase 4, cleanup, migration, execution packet drafting, or `.env` changes.

**Child-information protection:** security, privacy, truthful presentation, and data minimization **override speed** for any future snapshot work.

---

## Priority rule (SG18)

If a stricter rule exists in canonical specs, the checklist, or any prior Phase 2 / RLS owner record, the **stricter safety rule wins**.

---

## Owner/security live snapshot collection gate decisions (SG0–SG18)

### Decision SG0 — Scope / non-execution

**Owner decision:** **Yes**.

**Policy meaning:** This session adopts **gate definition only**. No Supabase, no snapshot collection, no tests, no packet, no apply.

**What remains blocked:** All collection execution paths.

---

### Decision SG1 — Gate defined ≠ collection executed

**Owner decision:** **Yes**.

**Policy meaning:** Adopting this record defines **criteria** for a **future** “live snapshot collection **execution**” gate. It does **not** mean connect happened or Tier 1/Tier 2 fields were captured.

**What remains blocked:** “Gate defined → go connect.”

---

### Decision SG2 — Two-gate model

**Owner decision:** **Yes**.

**Policy meaning:**

| Gate layer | This record | Future separate gate |
|------------|-------------|----------------------|
| **Gate definition** | SG0–SG18 (this file) | — |
| **Collection execution** | **Not** approved here | Owner-approved **live snapshot collection execution** gate per target |

**What remains blocked:** Skipping execution gate; combining definition + connect in one implicit step.

---

### Decision SG3 — MAIN-OWNER-USED / PROD primary

**Owner decision:** **Yes**.

**Policy meaning:** When collection execution is ever approved, **MAIN-OWNER-USED** / **PROD** is the **primary** first collection target for production-like safety. **PROD = MAIN-OWNER-USED for now**.

**What remains blocked:** STAGING-only path to MAIN readiness.

---

### Decision SG4 — STAGING-34B optional only

**Owner decision:** **Yes**.

**Policy meaning:** **STAGING-34B** collection is **optional rehearsal** only. It is **not mandatory** before MAIN collection execution is discussed or approved.

**What remains blocked:** Mandatory STAGING-first snapshot path.

---

### Decision SG5 — ISOLATED-LAB not a collection target

**Owner decision:** **Yes**.

**Policy meaning:** **ISOLATED-LAB** historical evidence **cannot** be refreshed or copied as a substitute for **STAGING-34B** or **MAIN-OWNER-USED** live snapshot.

**What remains blocked:** Lab → STAGING/MAIN snapshot reuse.

---

### Decision SG6 — Future execution gate must explicitly approve connect

**Owner decision:** **Yes**.

**Policy meaning:** Supabase (or equivalent) **read-only** connect for snapshot collection requires a **separate owner/security execution gate** that cites this gate definition and names the **target label** (**MAIN-OWNER-USED** and/or **STAGING-34B**).

**What remains blocked:** Connect without execution gate; connect approved by this definition record alone.

---

### Decision SG7 — Read-only collection posture (execution gate rule)

**Owner decision:** **Yes**.

**Policy meaning:** When a future execution gate approves collection, allowed work is **read-only inspection** only: queries/metadata needed for Tier 1/Tier 2 fields on the **seven Phase 2 tables** and related RLS/grants/roles/diagnostics baseline — **no** DDL, **no** DML, **no** policy apply, **no** `ENABLE ROW LEVEL SECURITY`, **no** policy create/alter/drop.

**What remains blocked:** “Snapshot session” that applies RLS; writes during capture.

---

### Decision SG8 — Tier 1 required for execution gate satisfaction

**Owner decision:** **Yes**.

**Policy meaning:** A future collection **execution** gate is satisfied only when **Tier 1** fields per `phase-2-rls-snapshot-requirements-owner-decision-record.md` are captured **owner-held** for the named target and **reviewed** per E6/E7.

**What remains blocked:** Partial Tier 1 treated as done; Tier 1 in git by default.

---

### Decision SG9 — Tier 2 before packet discussion (unchanged)

**Owner decision:** **Yes**.

**Policy meaning:** **Tier 2** fields remain **required before** execution packet **discussion** per S5 — collection execution may capture Tier 2 in the same session or a follow-up session, but packet talk remains blocked until Tier 2 exists and is reviewed.

**What remains blocked:** Packet discussion with Tier 1 only.

---

### Decision SG10 — Owner-held values; git safe summaries only

**Owner decision:** **Yes**.

**Policy meaning:** Captured snapshot **values** are **owner-held by default** (E7). Git may receive **safe summaries** only after capture (target label, date, Tier 1/Tier 2 completion status, reviewer role labels, **no** prohibited items per E9/S7).

**What remains blocked:** Full dumps, grant matrices, raw rows, keys, `project_ref` in git.

---

### Decision SG11 — Prohibited data stop rule

**Owner decision:** **Yes**.

**Policy meaning:** If collection would require storing prohibited items in git or sharing them in-repo, **stop** and keep evidence owner-held only. Aligns with E9, S7, N10.

**What remains blocked:** Leak “for completeness”; continuing after leak risk identified.

---

### Decision SG12 — Diagnostics baseline in capture plan

**Owner decision:** **Yes**.

**Policy meaning:** Future collection on a target must include **pre-RLS** read-only diagnostics/helper baseline per E11/S requirements (observe-only; **not** product proof). Post-RLS re-test remains a **separate** future gate after any RLS change.

**What remains blocked:** Skipping diagnostics baseline in capture; diagnostics pass claims from snapshot gate alone.

---

### Decision SG13 — Good-restored-state values remain separate

**Owner decision:** **Yes**.

**Policy meaning:** Collection + review produces **evidence** toward C7/A10; operational good-restored-state **values** close only in a **separate** step after evidence exists and is reviewed — not automatically when this gate definition is adopted.

**What remains blocked:** C7 closed by gate definition; lab good-state copy.

---

### Decision SG14 — Does not unlock negative tests, packet, or apply

**Owner decision:** **Yes**.

**Policy meaning:** Even after **future** collection execution + review, **negative-test execution**, **execution packet draft**, and **apply** remain **separate** gates per E13, E14, N12, and readiness/preconditions records.

**What remains blocked:** Snapshot → tests → apply chain without intermediate gates.

---

### Decision SG15 — STAGING snapshot never satisfies MAIN

**Owner decision:** **Yes**.

**Policy meaning:** **STAGING-34B** captured evidence does **not** satisfy **MAIN-OWNER-USED** snapshot requirements without **parity evidence** and **separate MAIN** approval (P5, N16).

**What remains blocked:** STAGING capture → MAIN tests/packet/apply shortcut.

---

### Decision SG16 — MAIN clutter does not block Phase 2 table snapshot (T9)

**Owner decision:** **Yes**.

**Policy meaning:** **MAIN-OWNER-USED** clutter (T9) does **not** by itself forbid **read-only** snapshot of the **seven Phase 2 tables** and their RLS/grants context when a future execution gate approves. **Cleanup/migration/new project** remains a **separate** feasibility audit — not a prerequisite to this gate definition.

**What remains blocked:** Conflating cleanup audit with snapshot gate definition; cleanup approved here.

---

### Decision SG17 — Review before downstream use

**Owner decision:** **Yes**.

**Policy meaning:** Captured evidence may inform negative-test **execution planning**, good-state value work, or packet **discussion** only **after** **OWNER** / **SECURITY_APPROVER** review per E6 (role labels; human identities owner-held).

**What remains blocked:** Executor-only review on MAIN; use before review.

---

### Decision SG18 — No apply-chain unlock

**Owner decision:** **Yes**.

**Policy meaning:** **NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged. This record is **gate definition** only.

**What remains blocked:** Any implied readiness for apply or packet.

---

## Target collection posture table (gate + future execution)

| Target label | First recommended collection order | Collection approved by this record? | Future execution gate required? | Can satisfy MAIN? |
|--------------|-----------------------------------|-------------------------------------|--------------------------------|-------------------|
| **MAIN-OWNER-USED** / **PROD** | **1 — primary** | **No** — definition only | **Yes** | N/A (self) |
| **STAGING-34B** | **2 — optional rehearsal** | **No** | **Yes** (if used) | **No** without parity + MAIN decision |
| **ISOLATED-LAB** | **N/A — historical** | **No** | **No** for real targets | **No** |

---

## Future collection execution gate checklist (policy only)

| Item | Required before execution gate can approve connect? |
|------|------------------------------------------------------|
| This gate definition adopted (SG0–SG18) | **Yes** |
| S0–S14 requirements adopted | **Yes** |
| E0–E18 planning adopted | **Yes** |
| Target label named in execution gate | **Yes** |
| Read-only posture (SG7) restated in execution gate | **Yes** |
| Tier 1 capture plan per target | **Yes** |
| Reviewer role labels assigned (E6) | **Yes** |
| Prohibited storage rules (E9/S7) restated | **Yes** |
| Parity evidence (if STAGING → MAIN inference ever proposed) | **Separate** gates |
| SQL / apply / packet | **No** — remain forbidden until later gates |

---

## What this closes / does not close

| Closes at docs level | Does not close |
|----------------------|----------------|
| SG0–SG18 live snapshot collection **gate** definition | Live snapshot **collection execution** |
| Two-gate model (definition vs execution) | Supabase connect |
| Read-only capture posture for future execution | Tier 1/Tier 2 **values** captured |
| MAIN primary / STAGING optional framing | Evidence **reviewed** |
| Owner-held + prohibited storage rules for capture | Good-restored-state **values** |
| Diagnostics baseline in capture plan | Negative-test execution/pass |
| | Execution packet |
| | Apply / Gate 34B |

---

## Archive table (SG0–SG18)

| ID | Question summary | Owner decision | Status | Notes |
|----|------------------|----------------|--------|-------|
| SG0 | Scope: gate definition only | Yes | Adopted | Non-execution |
| SG1 | Gate ≠ collection | Yes | Adopted | Two-layer |
| SG2 | Two-gate model | Yes | Adopted | Definition + execution |
| SG3 | MAIN/PROD primary | Yes | Adopted | First target |
| SG4 | STAGING optional | Yes | Adopted | Not mandatory |
| SG5 | LAB not target | Yes | Adopted | Historical |
| SG6 | Connect needs execution gate | Yes | Adopted | Critical |
| SG7 | Read-only only | Yes | Adopted | No DDL/DML |
| SG8 | Tier 1 for execution satisfaction | Yes | Adopted | S4 |
| SG9 | Tier 2 before packet talk | Yes | Adopted | S5 |
| SG10 | Owner-held; git summaries | Yes | Adopted | E7/E8 |
| SG11 | Prohibited stop | Yes | Adopted | E9/S7 |
| SG12 | Diagnostics baseline | Yes | Adopted | E11 |
| SG13 | Good-state values separate | Yes | Adopted | C7/A10 |
| SG14 | No test/packet/apply unlock | Yes | Adopted | E13/E14 |
| SG15 | STAGING ≠ MAIN | Yes | Adopted | P5/N16 |
| SG16 | Clutter ≠ block gate def | Yes | Adopted | T9 |
| SG17 | Review before use | Yes | Adopted | E6 |
| SG18 | No apply-chain unlock | Yes | Adopted | Posture unchanged |

---

## Recommended next gate (informational only)

This record logs **RLS live snapshot collection gate definition** at documentation level only. It does **not** select or approve **live snapshot collection execution**, Supabase connect, negative-test **execution**, parity **evidence collection**, redacted evidence **artifact** planning, or execution **packet**.

**NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged.

Any next checklist-priority item requires **separate read-only selection**. **Non-selected** future candidates include: redacted evidence artifact planning; read-only migration/cleanup feasibility audit for MAIN clutter — each requires its **own** owner gate.

SQL, Supabase connect, Supabase apply, snapshot **collection**, test execution, Gate 34B execution, staging apply, main apply, production apply, runtime/write implementation, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 execution remain **forbidden** until **explicitly** approved by **separate** gates.

---

## Final boundary statement

**Owner policy (2026-05-18):** RLS parity evidence planning (P0–P18) per `docs/architecture/phase-2-rls-parity-evidence-planning-owner-decision-record.md` — planning only; no parity evidence collected; no STAGING→MAIN transfer approved; no SQL/Supabase; no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS live snapshot MAIN collection execution gate (SE0–SE20) per `docs/architecture/phase-2-rls-live-snapshot-collection-execution-gate-owner-decision-record.md` — bounded read-only MAIN connect approved for one capture session; not snapshot collected/reviewed; role labels in git only (SE17); **NOT_READY_FOR_APPLY** unchanged; apply/packet/SQL still forbidden.

Phase 2 RLS **live snapshot collection gate** is owner-defined in this record at documentation level only (SG0–SG18). **NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain in force. **RLS_LIVE_SNAPSHOT_COLLECTION_GATE_DEFINED_DOCS_ONLY** does **not** mean Supabase connect occurred, snapshot evidence exists, or apply is ready. **Gate defined ≠ connect approved ≠ evidence collected ≠ review done ≠ apply approved.** **MAIN-OWNER-USED** / **PROD** is the **primary** collection target when execution is ever approved; **STAGING-34B** is **optional rehearsal only**. Gate 34B execution, staging apply, main / owner-used RLS policy apply, production apply, cleanup, migration, runtime/write integration, Phase 2 row writes, operational production truth, PSA publication, PSA materialization, Route Engine consumption, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 LOSA execution remain **blocked** until **separate** owner-approved gates.
