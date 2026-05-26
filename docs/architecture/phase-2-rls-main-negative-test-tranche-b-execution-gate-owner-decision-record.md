# Phase 2 RLS MAIN Negative-Test Tranche B (Q4-Blocking Deny Pass) Execution Gate Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **Tranche B Q4-blocking deny pass** execution gate — **NOT_READY_FOR_APPLY** / bounded **MAIN** negative-test connect approved / apply and packet remain forbidden |
| **Closure label** | `RLS_MAIN_NEGATIVE_TEST_TRANCHE_B_Q4_BLOCKING_DENY_PASS_EXECUTION_GATE_ADOPTED_BOUNDED` |
| **Scope** | **Tranche B only** — `Q4_BLOCKING_DENY_PASS` negative tests on **MAIN-OWNER-USED** (TB0–TB21); **Tranche A not re-opened** |
| **Date (UTC)** | 2026-05-26 |
| **Repository checkpoint** | `90f0794` (Phase 2 RLS MAIN post-RLS diagnostics compatibility review summary — V-post) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section **W** (RLS MAIN Tranche B Q4-blocking deny pass execution) |

This file records **owner-agreed approval** for **one bounded Tranche B** negative-test session on **MAIN-OWNER-USED** to evaluate **product-facing denial outcomes** per the negative-test **plan** (N6) after Option B deny posture is applied and post-RLS diagnostics compatibility **PASS** is reviewed.

It **follows** **U-post** (deny apply complete), **V-post** (RLS-path **PASS**), **S-post** (Tranche A historical), **R-post**, and **Q-post**. It **depends on** N0–N16 (plan context) and current MAIN state: RLS **on** all **7**; FORCE **off**; **14** deny policies; rows **0** per **U-post**.

**Adopting this record does NOT change NOT_READY_FOR_APPLY** until Tranche B evidence is **captured owner-held** and **reviewed** with an explicit Q4-blocking pass verdict per N6/N11.

**Execution gate adopted ≠ Tranche B session run ≠ Q4 pass reviewed ≠ N12 packet pass ≠ apply approved.**

**Primary target:** **MAIN-OWNER-USED** / **PROD** (= MAIN) only.

**STAGING-34B** is **not** approved by this gate. **ISOLATED-LAB** is **not** a target.

This record does **not** store `project_ref`, keys, connection strings, JWT dumps, raw child/school rows, grant matrices, full session transcripts, or exact SQL output in git.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged until Tranche B **captured** owner-held **and** **reviewed**; packet/apply remain blocked |
| **EXECUTION_FORBIDDEN** | Unchanged for SQL apply, DDL/DML, RLS policy apply, Gate 34B, staging/main/production apply, further deny-posture apply, post-RLS diagnostics re-run, packet draft, runtime/write — **except** one bounded **Tranche B** negative-test session per this gate |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged — N12 requires plan + evidence + **pass**; Tranche B pass alone does **not** draft packet |
| **RLS_MAIN_NEGATIVE_TEST_TRANCHE_B_Q4_BLOCKING_DENY_PASS_EXECUTION_GATE_ADOPTED_BOUNDED** | **One** bounded Tranche B session on **MAIN** **approved**; does **not** mean session completed or Q4 pass reviewed |
| **BOUNDED_MAIN_TRANCHE_B_NEGATIVE_TEST_CONNECT_APPROVED** | Narrow exception for chartered Tranche B only — **not** general connect approval |
| **TRANCHE_A_NOT_REOPENED** | Tranche A gate (NT) remains historical; this gate does **not** re-authorize Tranche A |

## Relationship to prior records

- **Depends on:** `phase-2-rls-main-deny-posture-apply-review-summary.md` (**U-post**).
- **Depends on:** `phase-2-rls-main-diagnostics-post-rls-compatibility-review-summary.md` (**V-post** — RLS-path **PASS**).
- **Depends on:** `phase-2-rls-negative-test-plan-owner-decision-record.md` (N6 outcomes; N8 high-privilege; N11 fail/unclear = stop).
- **Depends on:** `phase-2-rls-main-negative-test-execution-gate-owner-decision-record.md` (NT — Tranche A; Tranche B was **forbidden** until now).
- **Depends on:** `phase-2-rls-main-tranche-a-exposure-inventory-review-summary.md` (**S-post**).
- **Complements:** `phase-2-rls-apply-readiness-owner-decision-record.md` (Q4 — pass before apply **execution** approval at policy level).
- **Complements:** `phase-2-rls-apply-preconditions-owner-decision-record.md` (C9–C10).
- **Complements:** `phase-2-rls-accountability-owner-decision-record.md` (rollback on test failure).
- **Uses private target labels:** **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now** only.

**Conflict rule:** stricter checklist, N plan, or canonical source wins; **N6 product-facing outcomes win** over service_role success; **Route/PSA not wired → UNCLEAR** (N11), not pass by omission.

## This document is not

- proof that Tranche B already ran or was reviewed
- **Q4-blocking pass** claimed at gate adoption
- **N12 packet pass** approval or satisfaction
- execution packet approval or drafting permission
- apply, staging apply, main/production RLS apply, Gate 34B execution
- proof RLS is production-safe
- deny posture apply (already done under U-post)
- post-RLS diagnostics re-run approval
- **successful** DML or persistent **test rows**
- service_role / SQL editor / BYPASSRLS success as **product** proof (N8)
- runtime/write, PSA materialization, Route consumption, Phase 3/4 approval
- **NOT_READY_FOR_APPLY** clearance

## Meta-rule TB0

All **Yes** decisions (TB1–TB21) adopt **MAIN Tranche B Q4-blocking deny pass execution gate** and approve **one bounded** negative-test connect for **Tranche B** only.

TB1–TB21 do **not** authorize apply, packet draft, further RLS apply, GRANT/REVOKE, runtime/write, PSA publication, Route integration, Tranche A re-run, STAGING tests, or storing secrets/raw dumps in git.

---

## Owner/security Tranche B execution decisions (TB0–TB21)

### Decision TB0 — Scope

**Owner decision:** **Yes**. Tranche B execution gate only — label `Q4_BLOCKING_DENY_PASS`.

### Decision TB1 — Prerequisite: U-post

**Owner decision:** **Yes**. Option B deny posture **applied** and reviewed per **U-post**.

### Decision TB2 — Prerequisite: V-post PASS

**Owner decision:** **Yes**. Post-RLS diagnostics RLS-path **PASS** per **V-post** — mandatory before Tranche B (DA16–DA18 / PC14 chain).

### Decision TB3 — Gate adopted ≠ session ≠ Q4 reviewed

**Owner decision:** **Yes**.

### Decision TB4 — MAIN only

**Owner decision:** **Yes**.

### Decision TB5 — STAGING not approved

**Owner decision:** **Yes**. STAGING Tranche B requires **separate** gate; never substitutes MAIN (N16).

### Decision TB6 — ISOLATED-LAB excluded

**Owner decision:** **Yes**.

### Decision TB7 — Bounded Tranche B negative-test connect approved

**Owner decision:** **Yes**. **One bounded** session on **MAIN** to execute **product-facing** denial checks per N6 (anon, authenticated, app/browser paths as applicable). Session uses **client-facing** or product-representative roles — **not** service_role as pass proof.

**Forbidden:** successful mutations; persistent test rows; schema/RLS changes; packet/apply.

### Decision TB8 — One cycle

**Owner decision:** **Yes**. Repeat requires **new** gate.

### Decision TB9 — N6 full outcome set required for Q4 pass claim

**Owner decision:** **Yes**. Review must address **all** N6 rows for **MAIN-OWNER-USED**. Partial pass **forbidden**.

### Decision TB10 — Write attempts as negative tests only

**Owner decision:** **Yes**. **INSERT** / **UPDATE** / **DELETE** **attempts** allowed **only** as tests **expecting denial** — **no** persistent test rows; **no** successful DML. This gate is the **separate** owner approval for bounded write-denial **attempts** on the Tranche B path (NT11 successor).

### Decision TB11 — High-privilege paths ≠ product proof (N8)

**Owner decision:** **Yes**. service_role / owner session / SQL editor / BYPASSRLS may be documented **owner-held** — **not** Q4 pass evidence.

### Decision TB12 — Route / PSA: not wired → UNCLEAR (N11)

**Owner decision:** **Yes**. If Route or PSA **not wired** to MAIN, corresponding N6 rows are **UNCLEAR** → **stop** — not pass by omission.

### Decision TB13 — Owner-held capture; git safe summary only

**Owner decision:** **Yes**. Git: target label, date, Tranche B label, per-outcome pass/fail/unclear labels, Q4 pass claimed **no** until review — **no** row content, secrets, or tokens.

### Decision TB14 — Stop on leak (N7)

**Owner decision:** **Yes**.

### Decision TB15 — Tranche B pass ≠ N12 packet / ≠ apply

**Owner decision:** **Yes**. Q4-blocking pass **contributes** to future N12 discussion — does **not** alone approve packet draft or apply.

### Decision TB16 — Review after; FAIL/UNCLEAR = stop

**Owner decision:** **Yes**. FAIL or UNCLEAR on any required N6 outcome → scheduling stop; rollback **candidate** (deny rollback owner-held per U-post).

### Decision TB17 — No unlock apply/packet/runtime

**Owner decision:** **Yes**.

### Decision TB18 — Role labels in git

**Owner decision:** **Yes**.

### Decision TB19 — No secrets in git

**Owner decision:** **Yes**.

### Decision TB20 — Timebox

**Owner decision:** **Yes**.

### Decision TB21 — Stricter rule wins

**Owner decision:** **Yes**.

---

## Approved session boundary table

| Parameter | Approved value |
|-----------|----------------|
| Target | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |
| Tranche | **B** — `Q4_BLOCKING_DENY_PASS` |
| Session type | Negative tests per N6 (product-facing denial) |
| MAIN state (expected) | RLS **on** all 7; FORCE **off**; **14** policies; rows **0** |
| Write attempts | **Attempts expecting denial only** — no persistent test rows |
| High-privilege proof | **Not** product proof |
| Storage | **Owner-held** default |
| Git after session | Safe summary only (**W-post**) |
| Q4 pass at gate adoption | **No** |

---

## What this closes / does not close

| Closes / approves | Does not close |
|-------------------|----------------|
| TB0–TB21 Tranche B execution gate on paper | Tranche B session **performed** |
| One bounded MAIN Tranche B connect | Tranche B **reviewed** |
| Prerequisites chain (U-post + V-post) recorded | **Q4 pass** claimed |
| | **N12 packet pass** |
| | Execution packet / apply |
| | Runtime/write, PSA, Route, Phase 3/4 |

---

## Final boundary statement

**Owner policy (2026-05-26):** **U-post** and **V-post** complete per safe summaries; **NOT_READY_FOR_APPLY** unchanged.

Phase 2 RLS **MAIN Tranche B Q4-blocking deny pass execution gate** is owner-adopted (TB0–TB21). **`RLS_MAIN_NEGATIVE_TEST_TRANCHE_B_Q4_BLOCKING_DENY_PASS_EXECUTION_GATE_ADOPTED_BOUNDED`** approves **one bounded** Tranche B negative-test session on **MAIN** only. **Q4 pass is not claimed** at gate adoption. **N12 packet pass is not claimed.** **Apply, packet, and runtime/write remain forbidden.** **Execution gate adopted ≠ session run ≠ Q4 pass reviewed ≠ apply approved.**

**Related:** Section **W** (checklist); charter template `phase-2-rls-main-negative-test-tranche-b-charter-template.md`; review safe summary template `phase-2-rls-main-negative-test-tranche-b-review-summary-template.md` (**W-post** after session); NT (Tranche A); **V-post**; **U-post**.
