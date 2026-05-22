# Phase 2 RLS FORCE Row Level Security Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner/security FORCE RLS decision record — **NOT_READY_FOR_APPLY** / **EXECUTION_FORBIDDEN** / **EXECUTION_PACKET_DRAFT_FORBIDDEN** |
| **Closure label** | `RLS_FORCE_RLS_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | FORCE ROW LEVEL SECURITY posture policy only (F0–F18) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `00d634d Add Phase 2 RLS diagnostics compatibility planning owner decision record` |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section N (RLS FORCE RLS policy) |

This file records **owner-agreed policy** for **FORCE ROW LEVEL SECURITY** (forced row-level rules so table owners and similar roles cannot ignore row protection without an explicit bypass plan) on Phase 2 tables at **documentation level only**.

It defines **first-apply exclusion**, **future enablement thresholds**, **owner-held bypass/table-owner requirements**, and **target separation** — it does **not** execute SQL, does **not** enable FORCE in any database, and does **not** make RLS apply ready.

**Adopting this record does NOT change NOT_READY_FOR_APPLY, EXECUTION_FORBIDDEN, or EXECUTION_PACKET_DRAFT_FORBIDDEN.**

**Decision adopted ≠ FORCE enabled ≠ apply approved.** Logging this decision does **not** turn FORCE on in Supabase.

**Primary safety target:** **MAIN-OWNER-USED** / **PROD** (**PROD = MAIN-OWNER-USED for now**) is the **primary** safety target for FORCE posture and any future enablement review.

**STAGING-34B** remains an **optional rehearsal / safety track** only. **STAGING-34B** is **not mandatory** before MAIN FORCE policy. **STAGING-34B** FORCE posture **never** substitutes **MAIN-OWNER-USED** / **PROD** posture or approval.

This record does **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, full grant matrices, bypass dumps, raw child/school rows, or exact SQL dumps. It does **not** create or change `.env` configuration.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged — FORCE not enabled; live snapshots, test pass, parity evidence, compatibility pass, and other preconditions remain **not** satisfied |
| **EXECUTION_FORBIDDEN** | Unchanged — SQL, Supabase connect/apply, Gate 34B execution, staging apply, main apply, production apply remain **forbidden** |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged — no execution packet until **separate** gates after evidence, tests, and other prerequisites |
| **RLS_FORCE_RLS_POLICY_ADOPTED_DOCS_ONLY** | FORCE **policy** logged on paper only; **first apply excludes FORCE**; does **not** mean FORCE was enabled or apply is safe |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Operationalizes / complements:** `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` (C13 FORCE deferred → **first apply: FORCE excluded** logged here).
- **Operationalizes / complements:** `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` (Q5 FORCE deferred; separate decision before enable).
- **Complements:** `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` (N8 high-privilege; BYPASSRLS facts inform FORCE — not product proof).
- **Complements:** `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` (D11/D19 — FORCE too early breaks maintenance/diagnostics without bypass plan).
- **Complements:** `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md`, `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md`.
- **Complements:** `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` (T6 separate projects).
- **Reference:** `docs/architecture/phase-2-rls-policy-sql-draft.md` (FORCE comments = **review questions only** — **not** approval).
- **Reference:** `docs/architecture/phase-2-staging-rls-execution-decision.md`, `docs/architecture/phase-2-staging-rls-execution-packet.md` (template only — **not** permission).
- **Uses private target labels:** **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now**, **STAGING-34B** (optional rehearsal only), **ISOLATED-LAB** (historical only).
- **Conflict rule:** if this record conflicts with any prior owner record or a canonical source, the **stricter safety rule wins**; canonical sources win over all owner records.

## This document is not

- SQL approval or execution
- Supabase connect or apply approval
- `ALTER TABLE ... FORCE ROW LEVEL SECURITY` execution approval
- proof that FORCE is enabled on any target
- negative-test **execution** or **pass** approval
- live snapshot collection or evidence satisfaction
- post-RLS diagnostics compatibility **pass** approval
- Gate 34B execution approval
- staging RLS apply approval
- main / owner-used RLS policy apply approval
- production RLS apply approval
- proof that RLS apply readiness is achieved
- execution packet approval or drafting permission
- approval of `phase-2-rls-policy-sql-draft.md` SQL as executable
- runtime/write integration approval
- Phase 2 row write approval
- PSA publication or materialization approval
- Route Engine consumption approval
- operator / admin workflow activation approval
- helper / pipeline / readiness integration approval
- Phase 3 start or implementation approval
- Phase 4 LOSA execution approval
- `.env` configuration or runtime environment-variable work
- cleanup, migration, deletion, or new-project creation approval
- storage of secrets, grant dumps, or bypass evidence in git

## Source basis

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist
- `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` — C13, C12
- `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` — Q5, Q6
- `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` — N8
- `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` — D7, D19
- `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md`
- `docs/architecture/phase-2-rls-target-map-owner-decision-record.md`
- `docs/architecture/phase-2-rls-policy-sql-draft.md` — review questions only (reference)

**Conflict rule:** canonical sources win; this record must be revised if in conflict.

---

## Meta-rule F0

All **Yes** decisions in this record (F1–F18) mean **FORCE RLS policy on paper only**.

None of F1–F18 authorizes SQL, Supabase connect or apply, FORCE enablement in any database, live snapshot collection, negative-test execution, negative-test pass claims, diagnostics re-run, compatibility pass claims, Gate 34B execution, staging apply, main apply, production apply, runtime/write, row creation, PSA, Route, operator workflow, helper/pipeline hookup, Phase 3, Phase 4, cleanup, migration, execution packet drafting, or `.env` changes.

**Child-information protection:** security, privacy, truthful presentation, and data minimization **override speed** for any future RLS work involving FORCE.

---

## Priority rule (F18)

If a stricter rule exists in canonical specs, the checklist, or any prior Phase 2 / RLS owner record, the **stricter safety rule wins**.

---

## Owner/security FORCE RLS decisions (F0–F18)

### Decision F0 — Scope / non-execution

**Owner decision:** **Yes**.

**Policy meaning:** This session adopts **FORCE RLS policy only**. No SQL, no Supabase, no FORCE enablement, no snapshot, no tests, no packet, no apply.

**What remains blocked:** All execution paths including any `FORCE ROW LEVEL SECURITY` DDL.

---

### Decision F1 — Decision adopted does not mean FORCE enabled

**Owner decision:** **Yes**.

**Policy meaning:** Adopting F0–F18 does **not** mean FORCE is enabled on **STAGING-34B**, **MAIN-OWNER-USED**, or any other target.

**What remains blocked:** Claims that FORCE is already ON.

---

### Decision F2 — Separate posture per real target

**Owner decision:** **Yes**.

**Policy meaning:** Future FORCE enablement (if ever approved) is **per target label**. One target’s posture does not cover another.

**What remains blocked:** Merged STAGING+MAIN FORCE sign-off.

---

### Decision F3 — MAIN-OWNER-USED / PROD stricter than STAGING-34B

**Owner decision:** **Yes**.

**Policy meaning:** **MAIN-OWNER-USED** / **PROD** requires **stricter** owner-held bypass/table-owner analysis and slower enablement review than **STAGING-34B**.

**What remains blocked:** STAGING analysis treated as sufficient for MAIN.

---

### Decision F4 — MAIN/PROD primary; STAGING optional rehearsal only

**Owner decision:** **Yes**.

**Policy meaning:** **MAIN-OWNER-USED** / **PROD** is the **primary safety target** for FORCE policy. **STAGING-34B** is **optional rehearsal** only — **not mandatory** before MAIN FORCE policy. STAGING FORCE posture **never** substitutes MAIN/PROD posture or approval.

**What remains blocked:** STAGING-first mandatory path; STAGING deferral = MAIN approval.

---

### Decision F5 — First apply bundle: FORCE not included

**Owner decision:** **Yes**.

**Policy meaning:** The **first** RLS apply bundle on Phase 2 tables — including **Gate 34B** staging track and the **first** **MAIN-OWNER-USED** / owner-used RLS apply — **does not include** `FORCE ROW LEVEL SECURITY` on any of the seven Phase 2 tables.

**What remains blocked:** FORCE in first apply “for extra safety”; first apply with FORCE DDL.

---

### Decision F6 — Owner-held table-owner / bypass facts before enablement

**Owner decision:** **Yes**.

**Policy meaning:** Before any **future** FORCE enablement gate on a target, **owner-held** evidence must document table-owner and bypass facts (who can circumvent row protection via table ownership, maintenance roles, or similar paths). This analysis **informs** FORCE; it does **not** prove family-facing safety.

**What remains blocked:** FORCE enablement without bypass analysis; storing sensitive grant dumps in git (see F11).

---

### Decision F7 — FORCE too early breaks maintenance stack

**Owner decision:** **Yes**.

**Policy meaning:** Enabling FORCE **too early** without a bypass/maintenance plan risks breaking maintenance, diagnostics/helper post-RLS re-check, and migrations. This supports **first apply without FORCE** (F5).

**What remains blocked:** Rushing FORCE before diagnostics compatibility and bypass planning.

---

### Decision F8 — FORCE does not replace negative-test pass

**Owner decision:** **Yes**.

**Policy meaning:** FORCE policy and future FORCE enablement **do not** replace **negative-test pass** on the real target. Product-path denial proof remains negative tests, not postgres / service_role / SQL editor access.

**What remains blocked:** FORCE = families protected via app.

---

### Decision F9 — Separate enablement gate per target

**Owner decision:** **Yes**.

**Policy meaning:** Any **future** inclusion of FORCE in an apply or rollback bundle requires a **separate** owner/security **enablement gate** **after** this record, **per target**. This record adopts **defer for first apply**, not permanent ban and not automatic later enablement.

**What remains blocked:** Implicit FORCE in a future packet without enablement gate.

---

### Decision F10 — Risk if FORCE never resolved (acknowledged)

**Owner decision:** **Yes**.

**Policy meaning:** Deferring FORCE on first apply **does not** remove the risk that table-owner / bypass paths may circumvent client deny policies until FORCE is separately considered with evidence. This is **acknowledged**, not a mandate to enable FORCE without analysis.

**What remains blocked:** Panic-enable FORCE without bypass plan.

---

### Decision F11 — Git: policy summary only

**Owner decision:** **Yes**.

**Policy meaning:** Git may store **safe policy summaries** only (for example: target label; “first apply: FORCE excluded”; “enablement: separate gate required”; date). No grant matrices, bypass dumps, keys, or connection material.

**What remains blocked:** Sensitive bypass evidence in repo.

---

### Decision F12 — STAGING never substitutes MAIN for FORCE

**Owner decision:** **Yes**.

**Policy meaning:** **STAGING-34B** FORCE posture (if ever changed) **never** replaces **MAIN-OWNER-USED** / **PROD** FORCE posture without **parity evidence** (C14) and a **separate MAIN** decision.

**What remains blocked:** STAGING FORCE deferral → MAIN FORCE approval shortcut.

---

### Decision F13 — Does not unlock apply chain

**Owner decision:** **Yes**.

**Policy meaning:** This FORCE decision **does not** unblock: live snapshot evidence, negative-test execution/pass, diagnostics compatibility pass execution, execution packet, staging/main/production apply, runtime/write, PSA, Route, Phase 3/4.

**What remains blocked:** Any implication that C13/Q5 closure means apply-ready.

---

### Decision F14 — Diagnostics compatibility planning unchanged

**Owner decision:** **Yes**.

**Policy meaning:** Diagnostics compatibility planning (D0–D20) remains valid. Post-RLS diagnostics re-check is required **with or without** FORCE on a target. FORCE enablement does **not** waive D10/D11 fail-safe rules.

**What remains blocked:** Skipping diagnostics after FORCE enablement.

---

### Decision F15 — Cleanup / migration / new project unchanged

**Owner decision:** **Yes**.

**Policy meaning:** This record does **not** approve cleanup, migration, or new Supabase project (T9 separate audit).

**What remains blocked:** Infra decisions via FORCE gate.

---

### Decision F16 — Policy SQL draft is not approval

**Owner decision:** **Yes**.

**Policy meaning:** `phase-2-rls-policy-sql-draft.md` FORCE lines are **review questions only**. This owner decision does **not** approve executing draft SQL or uncommenting FORCE `ALTER TABLE` candidates.

**What remains blocked:** Draft → production DDL without gates.

---

### Decision F17 — Future enablement threshold (policy only)

**Owner decision:** **Yes**.

**Policy meaning:** **Policy threshold** for discussing a **future** FORCE enablement gate on a target (not satisfied by this record alone):

1. Per-target snapshot **evidence** exists and is reviewed.
2. Negative tests **pass** on that target (separate pass gate).
3. Post-RLS diagnostics compatibility **pass** on that target (separate pass gate).
4. Owner-held table-owner / bypass facts documented.
5. **Separate** FORCE enablement gate approves FORCE for that target only.

**What remains blocked:** FORCE enablement now; threshold treated as already met.

---

### Decision F18 — Stricter safety rule wins

**Owner decision:** **Yes**.

**Policy meaning:** Stricter checklist, canonical spec, or owner record wins on conflict.

**What remains blocked:** Weakening child-data or no-execution posture.

---

## FORCE posture table by target

| Target label | Target role | First apply bundle includes FORCE? | FORCE enabled now? | Future enablement allowed by this record? | Can substitute MAIN/PROD? | Apply approved? |
|--------------|-------------|--------------------------------------|--------------------|-------------------------------------------|---------------------------|-----------------|
| **MAIN-OWNER-USED** / **PROD** | **Primary safety target** | **No** | **No** | **No** — separate enablement gate per F9/F17 | N/A | **No** |
| **STAGING-34B** | Optional rehearsal | **No** | **No** | **No** — separate enablement gate | **No** | **No** |
| **ISOLATED-LAB** | Historical only | **No** | **No** | **No** for real targets | **No** | **No** |

---

## Risk acknowledgment table

| Risk | Policy response |
|------|-----------------|
| FORCE too early | Excluded from first apply (F5, F7) |
| FORCE never resolved | Acknowledged (F10); bypass analysis required before enablement (F6) |
| Table-owner bypass | Owner-held facts before enablement (F6); not product proof (F8) |
| STAGING → MAIN shortcut | Blocked (F4, F12) |
| Draft SQL mistaken for approval | Blocked (F16) |

---

## Relationship to bypass / high-privilege (C12, N8, Q6)

- `postgres`, `service_role`, SQL editor, table-owner, and BYPASSRLS-capable paths are **internal maintenance/security** paths — **not** ordinary family-facing product access.
- BYPASSRLS observations from negative tests **inform** FORCE planning; they do **not** prove apply readiness.
- FORCE enablement must be paired with an explicit **bypass/maintenance plan** (owner-held) — not defined in this record.

---

## What this closes / does not close

| Closes at docs level | Does not close |
|----------------------|----------------|
| F0–F18 FORCE RLS **policy** adopted | FORCE **enabled** on any target |
| C13/Q5: **first apply FORCE excluded** logged | FORCE **enablement** on any target |
| Future enablement **threshold** (F17) at policy level | Live snapshot evidence |
| Owner-held bypass analysis **required before** enablement (policy) | Negative-test execution/pass |
| MAIN/PROD primary; STAGING optional | Diagnostics compatibility **pass** (execution) |
| STAGING ≠ MAIN for FORCE | Parity **evidence** |
| Draft SQL FORCE = review only | Execution packet |
| | Gate 34B / apply tracks |
| | Operational good-restored-state **values** |
| | Runtime/write, rows, PSA, Route, Phase 3/4 |
| | Cleanup/migration/new project |

---

## Archive table (F0–F18)

| ID | Question summary | Owner decision | Status | Notes |
|----|------------------|----------------|--------|-------|
| F0 | Scope: policy only; no SQL/enable | Yes | Adopted | Non-execution |
| F1 | Decision ≠ FORCE enabled | Yes | Adopted | No false ON |
| F2 | Separate per target | Yes | Adopted | T6 |
| F3 | MAIN stricter | Yes | Adopted | Production-like |
| F4 | MAIN primary; STAGING optional | Yes | Adopted | E4/D4 aligned |
| F5 | First apply: FORCE excluded | Yes | Adopted | C13/Q5 |
| F6 | Bypass/table-owner owner-held first | Yes | Adopted | C12/N8 |
| F7 | Too early breaks maintenance | Yes | Adopted | D11 |
| F8 | FORCE ≠ negative-test pass | Yes | Adopted | Product proof |
| F9 | Separate enablement gate | Yes | Adopted | Per target |
| F10 | Never-resolved risk acknowledged | Yes | Adopted | No panic |
| F11 | Git policy summary only | Yes | Adopted | No dumps |
| F12 | STAGING ≠ MAIN | Yes | Adopted | C14 |
| F13 | Apply chain unchanged | Yes | Adopted | Blocked |
| F14 | Diagnostics planning valid | Yes | Adopted | D record |
| F15 | No cleanup/migration | Yes | Adopted | T9 |
| F16 | Draft SQL not approval | Yes | Adopted | Review only |
| F17 | Enablement threshold policy | Yes | Adopted | Future gate |
| F18 | Stricter wins | Yes | Adopted | Priority |

---

## Recommended next gate (informational only)

This record logs **RLS FORCE RLS policy** at documentation level only. It does **not** select an execution gate, FORCE **enablement**, live snapshot collection, negative-test **execution**, parity **evidence**, or execution **packet**.

**NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged.

Any next checklist-priority item requires **separate read-only selection**. **Non-selected** future candidates include: negative-test **execution** planning (separate gate); redacted evidence artifact planning; live snapshot collection gate; read-only migration/cleanup feasibility audit for MAIN clutter — each requires its **own** owner gate.

SQL, Supabase connect, Supabase apply, `ALTER TABLE ... FORCE ROW LEVEL SECURITY`, live snapshot collection, test execution, Gate 34B execution, staging apply, main apply, production apply, runtime/write implementation, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 execution remain **forbidden** until **explicitly** approved by **separate** gates.

---

## Final boundary statement

Phase 2 RLS **FORCE RLS policy** is owner-adopted in this record at documentation level only (F0–F18). **First apply excludes FORCE** on **STAGING-34B** (if used) and **MAIN-OWNER-USED** / **PROD**. **NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain in force. **RLS_FORCE_RLS_POLICY_ADOPTED_DOCS_ONLY** does **not** mean FORCE was enabled or apply is ready. **Decision adopted ≠ FORCE enabled ≠ tests run ≠ apply approved.** **MAIN-OWNER-USED** / **PROD** is the **primary safety target**; **STAGING-34B** is **optional rehearsal only**. Gate 34B execution, staging apply, main / owner-used RLS policy apply, production apply, cleanup, migration, runtime/write integration, Phase 2 row writes, operational production truth, PSA publication, PSA materialization, Route Engine consumption, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 LOSA execution remain **blocked** until **separate** owner-approved gates.
