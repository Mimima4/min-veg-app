# Phase 2 RLS Apply Readiness Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner/security readiness decision record — **NOT_READY_FOR_APPLY** / **EXECUTION_FORBIDDEN** |
| **Closure label** | `RLS_APPLY_READINESS_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | RLS/security readiness policy and target clarification (Q0 + decisions Q1–Q15) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `f73c930 Add Phase 2 runtime write owner decision record` (from `git log -1 --oneline` at record creation) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Gate 34B / main RLS apply readiness (parallel security track) |

This file records **owner-agreed RLS/security readiness policy** at **documentation level only**. It does **not** mean RLS apply readiness is achieved, does **not** approve SQL or Supabase apply, and does **not** approve Gate 34B execution, staging apply, main / owner-used RLS policy apply, or production apply.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Negative tests, parity, diagnostics compatibility, rollback, executor/approver, and target clarity are **not** satisfied for any apply execution gate. |
| **EXECUTION_FORBIDDEN** | SQL, Supabase apply, Gate 34B execution, staging apply, main apply, and production apply remain **forbidden** until **separate** owner-approved execution gates. |
| **READY_FOR_OWNER_SECURITY_READINESS_POLICY_ONLY** | Owner may use this record as **policy on paper** for target split and prerequisites; it is **not** permission to run SQL or apply. |

This record does **not** close Phase 2 as a whole, does **not** close operational runtime/write, does **not** authorize Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution.

## Relationship to prior owner records

- **Complements:** `docs/architecture/phase-2-evidence-model-owner-decision-record.md`, `docs/architecture/phase-2-governance-review-owner-decision-record.md`, `docs/architecture/phase-2-production-truth-owner-decision-record.md`, `docs/architecture/phase-2-runtime-write-owner-decision-record.md`, and `docs/architecture/phase-2-rls-security-owner-decision-record.md`.
- **Complements (planning context, not superseded):** `docs/architecture/phase-2-rls-apply-readiness-security-decision.md` (Gate 30 — `READY_FOR_STAGING_RLS_APPLY_PLANNING_ONLY` only).
- **Does not** replace, weaken, or reinterpret evidence model M0 + 1–8, governance G0–G9, production truth P0–P12, runtime/write R0–R12, or RLS security owner decisions.
- **Conflict rule:** if this record conflicts with any prior owner record or a canonical source, the **stricter safety rule wins**; canonical sources win over all owner records if they conflict.

## This document is not

- SQL approval or execution
- Supabase apply approval
- Gate 34B execution approval
- staging RLS apply approval
- main / owner-used RLS policy apply approval
- production RLS apply approval
- proof that RLS apply readiness is achieved
- execution packet approval (preparation of a plan document is **not** execution)
- runtime/write integration approval
- Phase 2 observation / candidate / decision / publication row write approval
- operational production truth closure
- PSA publication or materialization approval
- Route Engine consumption approval
- operator / admin workflow activation approval
- helper / pipeline / readiness integration approval
- Phase 3 start or implementation approval
- Phase 4 LOSA execution approval

## Source basis

The following repository documents govern or contextualize this record:

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist
- `docs/architecture/phase-2-rls-security-owner-decision-record.md` — RLS security policy (complementary)
- `docs/architecture/phase-2-rls-apply-readiness-security-decision.md` — Gate 30 apply-readiness planning posture
- `docs/architecture/phase-2-rls-security-review-plan.md` — RLS review plan (reference)
- `docs/architecture/phase-2-rls-sql-human-security-review-packet.md` — human security review packet (reference)
- `docs/architecture/phase-2-staging-rls-execution-decision.md` — staging execution decision (reference)
- `docs/architecture/phase-2-staging-rls-execution-packet.md` — Gate 34A packet / Gate 34B prerequisites (reference; **not** execution)
- `docs/architecture/phase-2-staging-rls-sql-execution-prompt-draft.md` — execution prompt draft (reference; **not** execution)
- `docs/architecture/phase-2-isolated-test-rls-evidence-record.md` — isolated test evidence (**not** main approval)
- `docs/architecture/phase-2-main-supabase-rollout-checklist.md` — main schema-only rollout (tables exist; **no** RLS/policies from migration)
- `docs/architecture/phase-2-runtime-write-owner-decision-record.md` — runtime/write policy (R4–R6 RLS dependency)
- `docs/architecture/phase-2-production-truth-owner-decision-record.md` — production truth policy (complementary)
- `docs/architecture/phase-2-governance-review-owner-decision-record.md` — governance/review policy (complementary)
- `docs/architecture/phase-2-evidence-model-owner-decision-record.md` — evidence policy (complementary)
- `docs/architecture/phase-2-read-only-diagnostics-contract.md` — diagnostics boundary
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — helper boundary
- `docs/architecture/phase-2-problem-contour-activation-read-model-map.md` — contour activation (reference)
- `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Phase 2 spec
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md` — Phase 2 → Phase 3 prerequisites (gate not passed)
- `docs/architecture/phase-4-source-truth-contour-map.md` — Phase 4 crosswalk (docs-only)

**Conflict rule:** if this record conflicts with a canonical source, the **canonical source wins** and this record must be revised.

---

## Meta-rule Q0

All **Yes** decisions in this record (Q1–Q15) mean **RLS/security readiness policy on paper only**.

None of Q1–Q15 authorizes SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, runtime/write, row creation, PSA, Route, operator workflow, helper/pipeline hookup, Phase 3, or Phase 4.

The four Phase 2 **policy** closures (evidence model, governance/review, production truth, runtime/write) do **not** authorize RLS apply or execution.

**Child-information protection:** because Min Veg works with information about **children**, security, privacy, truthful presentation, and data minimization **override speed** for any future RLS work.

---

## Priority rule (Q15)

If any stricter rule from Phase 2 policy owner records, the RLS security owner record, RLS apply-readiness docs, or canonical specs conflicts with this readiness discussion, the **stricter safety rule wins**.

RLS readiness discussion **never** overrides child-information protection, privacy, truthfulness, data minimization, or prior no-execution rules.

---

## Target split table

| Track | What it means | Current posture per this record |
|-------|----------------|----------------------------------|
| **Isolated lab evidence** | Temporary test-project validation of Option B deny policies | **Does not** prove main / owner-used readiness; **does not** approve Gate 34B |
| **Staging Gate 34B** | Manual **RLS/policy DDL** on staging target (artifact track); **Gate 34A approves nothing** | Readiness **policy** logged; **NOT_READY_FOR_APPLY**; **EXECUTION_FORBIDDEN** until separate execution gate |
| **Main / owner-used RLS policy apply** | Installing deny policies on the project that already has **schema-only** Phase 2 tables | **Separate** from staging 34B; **NOT_READY_FOR_APPLY**; physical target must be named; schema ≠ locks |
| **Production RLS apply** | Future production-facing apply | **Separate future gate**; **not** in near-term execution scope |

**Naming guard:** checklist shorthand **“Gate 34B / main RLS apply”** must **not** be read as one merged approval. **Gate 34B** in artifacts is **staging manual DDL** unless a **later** gate explicitly defines main apply.

---

## Decision Q1 — Target split

**Owner decision:** **Yes**.

Separate:

- **A.** Staging Gate 34B — manual RLS/policy DDL readiness.
- **B.** Main / owner-used RLS policy apply readiness.
- **C.** Production RLS apply — future only.

Do **not** merge staging, main/owner-used, and production into one apply or one approval. **Gate 34A approves nothing.** **Gate 34B** is only manual staging DDL in the current artifact track. A and B may be discussed in one session for clarity; each track needs its **own** future execution gate.

---

## Decision Q2 — Physical environment clarity

**Owner decision:** **Yes**.

The physical database target must be named explicitly before any future apply. If unclear, **no apply**.

Schema-only Phase 2 migration on main means tables exist, but **RLS/policy locks are not installed**. Schema-only main is **not** RLS apply readiness.

If **staging** and **owner-used main** are the **same physical** Supabase project, this must be stated explicitly. If the environment serves families today, treat it as **higher risk** and require **slower** gates.

---

## Decision Q3 — Isolated / staging evidence is not main readiness

**Owner decision:** **Yes**.

Isolated test evidence, staging planning artifacts, and staging packet drafts do **not** prove main / owner-used readiness and do **not** approve Gate 34B execution. Lab success and planning documents are **not** permission to run SQL.

---

## Decision Q4 — Negative tests before apply execution

**Owner decision:** **Yes**.

No future RLS apply **execution gate** may be approved before access-denial tests **exist and pass** on the **real target**, including app/API/browser paths (not only manual SQL editor checks).

| Required outcome | Policy now | Implemented / passing |
|------------------|------------|------------------------|
| Anonymous users cannot read/write Phase 2 tables | **Required** before apply execution | **Missing** on real target |
| Ordinary logged-in users cannot read/write Phase 2 tables | **Required** | **Missing** |
| App / browser database client cannot use Phase 2 tables as shortcut | **Required** | **Missing** |
| Route cannot read raw Phase 2 tables | **Required** | **Missing** |
| PSA cannot read raw Phase 2 tables | **Required** | **Missing** |
| Writes denied unless separate future gate allows | **Required** | **Missing** |
| Diagnostics/helper output does not become publication or family-facing truth | **Required** | **Policy only**; post-RLS re-check required |

Tests may be **planned** now; **passing on the real target** is required before apply execution.

---

## Decision Q5 — FORCE RLS posture

**Owner decision:** **Yes**.

**FORCE ROW LEVEL SECURITY** (forced row rules so privileged database roles cannot ignore row rules) remains **deferred** for the **first** apply.

FORCE RLS requires a **separate** owner/security decision with role/table-owner reasoning before ever being enabled.

| Topic | Posture |
|-------|---------|
| **First apply** | FORCE **not** included |
| **Risk if ignored forever** | Owner/bypass paths may circumvent client deny policies |
| **Risk if enabled too early** | May break maintenance, diagnostics, or migrations without bypass plan |

---

## Decision Q6 — High-privilege paths are not product access

**Owner decision:** **Yes**.

Automation keys, SQL editor sessions, database owner roles, `postgres`, `service_role`, `BYPASSRLS`, table-owner paths, and diagnostics when enabled are **internal maintenance/security paths only** — **never** ordinary family-facing product access.

Availability of a powerful key or tool is **not** approval to use it as product access.

---

## Decision Q7 — Diagnostics compatibility posture

**Owner decision:** **Yes**.

Diagnostics/helper behavior must be **re-checked** after any RLS change before diagnostics output is trusted.

Diagnostics must still **never** drive writes, publication, PSA, Route, readiness gates, or family-facing truth.

| Topic | Posture |
|-------|---------|
| **After RLS change** | Compatibility check **required** |
| **Bypass for diagnostics** | **Not** approved without separate gate |
| **service_role / service key path** | High-privilege; **not** product access |

---

## Decision Q8 — Rollback before scheduling

**Owner decision:** **Yes**.

Rollback must be agreed **before** any future RLS apply is **scheduled**, including:

- who rolls back;
- when rollback happens;
- what **good restored state** means.

Concrete rollback SQL belongs in a **future execution artifact**, not in this readiness policy record.

---

## Decision Q9 — Executor and approver

**Owner decision:** **Yes**.

**Executor** (who would run manual steps) and **approver** (who authorizes that run) must be **named** before any future apply. Manual steps cannot be scheduled without named accountability.

---

## Decision Q10 — RLS readiness does not authorize product/runtime work

**Owner decision:** **Yes**.

RLS readiness rules **never** mean approval for:

- Phase 2 runtime/write;
- observation, candidate, decision, or publication rows;
- operational production truth;
- PSA publication or materialization;
- Route Engine consumption;
- operator/admin workflow;
- helper/pipeline integration;
- Phase 3 or Phase 4 execution.

RLS readiness is a **security prerequisite discussion only**.

---

## Decision Q11 — Production is a separate gate

**Owner decision:** **Yes**.

Production RLS apply is a **separate future gate** from main / owner-used apply, even if one codebase uses the database.

---

## Decision Q12 — Parity before reusing staging evidence

**Owner decision:** **Yes**.

Before treating staging evidence as relevant to main / owner-used, explicitly check parity: database version, table ownership, role behavior, app/API paths, and diagnostics behavior.

Staging evidence does **not** automatically transfer to main.

---

## Decision Q13 — No raw evidence leaks

**Owner decision:** **Yes**.

Future RLS readiness must require confidence that raw Phase 2 evidence cannot leak to Route, PSA, frontend/app paths, or family-facing surfaces.

---

## Decision Q14 — Execution plan document only after prerequisites

**Owner decision:** **Yes**.

A future **execution plan document** may be **prepared** only after target, executor, approver, rollback, negative tests plan, diagnostics check, FORCE RLS posture, and parity questions are answered.

Preparing a document is **not** running SQL. An execution plan document does **not** approve apply.

---

## What this record closes / does not close

| Closes (docs / owner policy only) | Does **not** close / remains blocked |
|-----------------------------------|--------------------------------------|
| Owner-adopted RLS apply **readiness policy** (Q0–Q15) logged | **NOT_READY_FOR_APPLY** for any RLS apply execution |
| Target split: isolated / staging 34B / main-owner-used / production | **EXECUTION_FORBIDDEN** (SQL, Supabase, 34B, staging, main, production) |
| Prerequisites on paper: negative tests, FORCE deferred, bypass, diagnostics, rollback, executor, parity | Gate 34B **execution** |
| Complements four Phase 2 policy records + RLS security record | Runtime/write, row writes, PSA, Route, operator UI |
| | Helper/pipeline integration |
| | Phase 3 / Phase 4 execution |
| | Proof that policies exist on main |

**Implementation OPEN (deferred):** negative test suite on real target; diagnostics post-RLS verification; named executor/approver; rollback SQL in execution artifact; FORCE decision; main vs staging physical target confirmation; any Gate 34B execution gate charter.

---

## Archive table (Q0 + Q1–Q15)

| ID | Policy summary | Default if uncertain |
|----|----------------|----------------------|
| Q0 | Readiness policy only; four policy closures ≠ apply; child safety | Block execution |
| Q1 | Separate staging 34B / main-owner-used / production; 34A approves nothing | No merged apply |
| Q2 | Name physical target; schema ≠ RLS locks | No apply if unclear |
| Q3 | Isolated/planning/draft ≠ main; no 34B from lab | Block |
| Q4 | Negative tests pass on real target before apply execution | Block apply |
| Q5 | FORCE deferred; separate decision before enable | Defer FORCE |
| Q6 | High-privilege paths ≠ product access | Deny shortcut |
| Q7 | Re-check diagnostics after RLS; no publication driver | Block bypass |
| Q8 | Rollback agreed before scheduling | No apply without rollback |
| Q9 | Named executor and approver | Block anonymous apply |
| Q10 | RLS readiness ≠ runtime/write/rows/PSA/Route/operator/helper/Phase 3/4 | Block leap |
| Q11 | Production apply separate | Block prod shortcut |
| Q12 | Parity before staging→main inference | Block transfer |
| Q13 | No raw evidence leaks to product surfaces | Block |
| Q14 | Execution plan doc only after prerequisites; doc ≠ SQL | Block premature run |
| Q15 | Stricter safety wins | Block |

---

## Recommended next gate (informational only)

This record logs **RLS apply readiness policy** at documentation level only. It does **not** select an execution gate.

**Gate 34B / main RLS apply** remains **NOT_READY_FOR_APPLY**. **EXECUTION_FORBIDDEN.**

Any next checklist-priority item requires **separate read-only selection** among remaining operational/execution gates. Possible future work (none selected here) includes narrow security planning, execution packet preparation **after** prerequisites, or hygiene on stale cross-references — each requires its own owner gate.

SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, runtime/write implementation, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 execution remain **forbidden** until **explicitly** approved by **separate** gates.

---

## Final boundary statement

Phase 2 RLS apply readiness policy is owner-adopted in this record at documentation level only. **NOT_READY_FOR_APPLY** and **EXECUTION_FORBIDDEN** remain in force. Gate 34B execution, staging apply, main / owner-used RLS policy apply, production apply, runtime/write integration, Phase 2 row writes, operational production truth, PSA publication, PSA materialization, Route Engine consumption, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 LOSA execution remain **blocked** until **separate** owner-approved gates.

**Owner policy (2026-05-18):** RLS apply **preconditions** policy (C0–C16) complements this record in `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` — **not** execution approval; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS **target-map** policy (T0–T11) in `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` — private labels only; **not** execution approval; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS accountability policy (A0–A12) per `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` — role labels only; **not** execution approval; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS snapshot requirements (S0–S14) per `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` — requirements only; no live snapshot, no execution packet, no apply; **NOT_READY_FOR_APPLY** unchanged.
