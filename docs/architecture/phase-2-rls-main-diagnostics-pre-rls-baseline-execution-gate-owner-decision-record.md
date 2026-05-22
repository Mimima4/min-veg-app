# Phase 2 RLS MAIN Diagnostics Pre-RLS Baseline Execution Gate Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **diagnostics pre-RLS baseline execution** gate — **NOT_READY_FOR_APPLY** / bounded **MAIN** read-only diagnostics connect approved / apply and packet remain forbidden |
| **Closure label** | `RLS_MAIN_DIAGNOSTICS_PRE_RLS_BASELINE_EXECUTION_GATE_ADOPTED_BOUNDED_READ_ONLY` |
| **Scope** | Pre-RLS diagnostics/helper baseline **execution** gate on **MAIN-OWNER-USED** only (BL0–BL20) |
| **Date (UTC)** | 2026-05-19 |
| **Repository checkpoint** | `87430e2 Add Phase 2 RLS MAIN snapshot capture review summary` |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section R (RLS MAIN diagnostics pre-RLS baseline execution) |

This file records **owner-agreed approval** for **one bounded read-only** session to capture **pre-RLS** diagnostics/helper baseline evidence on **MAIN-OWNER-USED** at **owner-held** storage.

It **follows** completed MAIN Tier 1 snapshot capture and **OWNER** / **SECURITY_APPROVER** review (`phase-2-rls-main-snapshot-capture-review-summary.md`, PASS_WITH_SECURITY_FINDINGS). SE12 in the snapshot execution gate expected pre-RLS diagnostics in the snapshot session; that baseline was **not attempted** — this gate authorizes a **separate bounded** diagnostics-only session.

**Adopting this record does NOT change NOT_READY_FOR_APPLY** until baseline evidence is **captured owner-held** and **reviewed** per E6/E11/S8.

**Execution gate adopted ≠ baseline captured ≠ review done ≠ apply approved.**

**Primary target:** **MAIN-OWNER-USED** / **PROD** (**PROD = MAIN-OWNER-USED for now**) — **only** target approved by this gate.

**STAGING-34B** is **not** approved by this gate. **ISOLATED-LAB** is **not** a target.

This record does **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, raw diagnostic JSON dumps, grant matrices, bypass dumps, raw child/school rows, per-school resolution maps with row-level detail, or exact SQL output in git. It does **not** create or change `.env` configuration.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged until pre-RLS baseline **captured** owner-held **and** **reviewed** on MAIN; negative-test execution, packet, apply remain blocked |
| **EXECUTION_FORBIDDEN** | Unchanged for SQL apply, DDL/DML, RLS policy apply, Gate 34B execution, staging/main/production apply, writes, STAGING connect, negative-test **execution**, post-RLS diagnostics compatibility **pass** execution, execution packet draft, and all non-diagnostics Supabase work |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged |
| **RLS_MAIN_DIAGNOSTICS_PRE_RLS_BASELINE_EXECUTION_GATE_ADOPTED_BOUNDED_READ_ONLY** | **One** bounded **read-only** diagnostics session on **MAIN-OWNER-USED** is **approved**; does **not** mean baseline completed or reviewed |
| **BOUNDED_MAIN_DIAGNOSTICS_PRE_RLS_READ_ONLY_CONNECT_APPROVED** | Narrow exception to global “no Supabase connect” for this gate only — **not** general connect approval |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Depends on:** `docs/architecture/phase-2-rls-main-snapshot-capture-review-summary.md` — Tier 1 capture + review complete; diagnostics baseline **open**.
- **Depends on:** `docs/architecture/phase-2-rls-live-snapshot-collection-execution-gate-owner-decision-record.md` (SE12 — pre-RLS baseline planned in snapshot session; operational defer to this gate).
- **Depends on:** `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` (S8 diagnostics baseline; Tier 2 diagnostics field).
- **Depends on:** `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` (E11 observe-only baseline).
- **Complements:** `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` (D0–D20 — **post-RLS** planning only; **not** satisfied by this pre-RLS gate).
- **Complements:** `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` (N9 observe only).
- **Complements:** `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` (role labels; BL17).
- **Complements:** `docs/architecture/phase-2-rls-parity-evidence-planning-owner-decision-record.md` (STAGING ≠ MAIN).
- **Complements:** `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` (T9 clutter — BL16).
- **Canonical (must not be weakened):** `docs/architecture/phase-2-read-only-diagnostics-contract.md`, `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`.
- **Uses private target labels:** **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now** only for this gate.
- **Conflict rule:** stricter safety rule wins; canonical sources win over owner records.

## This document is not

- proof that a diagnostics baseline session already occurred
- proof that baseline evidence was reviewed
- post-RLS diagnostics compatibility **pass** approval or execution
- a second full Tier 1/Tier 2 **snapshot** collection gate (snapshot already performed)
- Supabase connect approval for **STAGING-34B**, apply, negative-test execution, packet draft, or any other purpose
- negative-test **execution** or **pass** approval
- FORCE RLS **enablement** or apply approval
- Gate 34B / staging / main RLS **apply** approval
- execution packet approval or drafting permission
- helper/pipeline/readiness **integration** or new helper consumer approval
- approval to store executor/reviewer **real names or emails** in git (role labels only)
- a restriction on **product database** storage of user emails (separate product contour — see BL17)
- runtime/write, PSA, Route, operator, Phase 3/4 approval
- cleanup, migration, new-project approval
- deny posture / RLS policy apply
- proof that RLS is secure or production-safe

## Source basis

- `docs/architecture/phase-2-closure-criteria-checklist.md`
- `docs/architecture/phase-2-rls-main-snapshot-capture-review-summary.md`
- `docs/architecture/phase-2-rls-live-snapshot-collection-execution-gate-owner-decision-record.md`
- `docs/architecture/phase-2-rls-live-snapshot-collection-gate-owner-decision-record.md`
- `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md`
- `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md`
- `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`

**Conflict rule:** canonical diagnostics contract and helper ADR win; revise this record if in conflict.

---

## Meta-rule BL0

All **Yes** decisions (BL1–BL20) adopt **MAIN diagnostics pre-RLS baseline execution gate** on paper and approve **one bounded read-only connect** for that purpose only.

BL1–BL20 do **not** authorize SQL apply, DDL/DML, RLS policy changes, Gate 34B, staging apply, main apply, production apply, negative-test execution, packet draft, runtime/write, row writes, PSA, Route, Phase 3/4, cleanup, migration, STAGING connect, new helper consumers, or storing secrets/raw diagnostic dumps in git.

**Child-information protection** overrides speed for capture and storage.

**Fail-open diagnostics behavior is not family-security proof** and does **not** weaken RLS apply blocks.

---

## Priority rule (BL20)

Stricter checklist, canonical spec, or prior owner record wins on conflict.

---

## Owner/security baseline execution decisions (BL0–BL20)

### Decision BL0 — Scope of this record

**Owner decision:** **Yes**.

**Policy meaning:** This record is the **execution gate** for **pre-RLS diagnostics/helper baseline** on MAIN — not snapshot collection (already done), not post-RLS compatibility pass (D record), not gate definition-only.

**What remains blocked:** Implicit diagnostics connect without citing this gate; treating planning (D) as baseline captured.

---

### Decision BL1 — Prerequisite: MAIN Tier 1 snapshot + review complete

**Owner decision:** **Yes**.

**Policy meaning:** This gate is adopted only after MAIN Tier 1 bounded read-only snapshot capture and **OWNER** / **SECURITY_APPROVER** review per `phase-2-rls-main-snapshot-capture-review-summary.md` (PASS_WITH_SECURITY_FINDINGS).

**What remains blocked:** Using this gate to skip snapshot/review chain.

---

### Decision BL2 — Gate adopted ≠ baseline captured

**Owner decision:** **Yes**.

**Policy meaning:** Adopting BL0–BL20 **approves** a future bounded session; it does **not** mean the session ran or baseline is complete.

**What remains blocked:** Claiming baseline closed from this file alone.

---

### Decision BL3 — MAIN-OWNER-USED only

**Owner decision:** **Yes**.

**Policy meaning:** **Only** **MAIN-OWNER-USED** / **PROD** (= MAIN) may be used for the approved session.

**What remains blocked:** STAGING or LAB baseline substituting MAIN.

---

### Decision BL4 — STAGING not approved by this gate

**Owner decision:** **Yes**.

**Policy meaning:** **STAGING-34B** diagnostics baseline requires a **separate** future gate if ever needed (optional rehearsal only).

**What remains blocked:** STAGING baseline satisfying MAIN.

---

### Decision BL5 — ISOLATED-LAB excluded

**Owner decision:** **Yes**.

**Policy meaning:** Historical lab diagnostics **must not** be copied as MAIN pre-RLS baseline.

**What remains blocked:** Lab reuse for MAIN evidence.

---

### Decision BL6 — Bounded read-only diagnostics connect approved

**Owner decision:** **Yes**.

**Policy meaning:** Owner may perform **one bounded read-only** session on **MAIN-OWNER-USED** to run the **approved diagnostics consumer** per canonical contract (read-only Phase 2 table queries; observe-only outputs). Session may also record **safe aggregate** session metadata (date, PASS/FAIL/UNCLEAR at tool layer, warnings present Y/N) — **not** raw JSON dumps in git.

**Forbidden in session:** DDL, DML, RLS apply, policy changes, writes, readiness/pipeline integration, PSA, Route consumption, new scripts/consumers.

**What remains blocked:** Write sessions; apply during “baseline.”

---

### Decision BL7 — One target / one adoption cycle

**Owner decision:** **Yes**.

**Policy meaning:** **One** approved baseline capture cycle on MAIN per this gate adoption. Repeat requires **new** execution gate.

**What remains blocked:** Standing approval for unlimited diagnostics connects.

---

### Decision BL8 — Approved consumer only

**Owner decision:** **Yes**.

**Policy meaning:** Session uses **only** the single approved consumer identified in `phase-2-read-only-diagnostics-contract.md` (diagnose-school-identity-phase2-readonly script path per contract §1). **No** new helper consumers, pipeline hooks, readiness hooks, Route, UI, or admin integration.

**What remains blocked:** classify-vgs-truth-readiness, run-vgs-truth-pipeline, runtime/UI consumers without separate gate + ADR update.

---

### Decision BL9 — Observe-only; fail-open ≠ security proof

**Owner decision:** **Yes**.

**Policy meaning:** Tool may **fail-open** per contract (warnings, empty diagnostics) — that is **not** proof of RLS safety, deny posture, or apply readiness. Pre-RLS baseline informs **before/after** comparison only (S8, E11, D before/after rule at planning level).

**What remains blocked:** Diagnostics success → families protected; diagnostics → publication/readiness/write.

---

### Decision BL10 — Owner-held capture; git safe summary only

**Owner decision:** **Yes**.

**Policy meaning:** Baseline **values** stay **owner-held** (E7). Git may record **safe summary** only: target label, date (UTC), session completed Y/N, tool-layer outcome label (PASS/FAIL/UNCLEAR if used), warnings noted Y/N, reviewer pending — **no** prohibited items (E9/S7).

**What remains blocked:** Raw diagnostic JSON, keys, `project_ref`, per-school row maps, full SQL transcripts in git.

---

### Decision BL11 — Stop on leak risk

**Owner decision:** **Yes**.

**Policy meaning:** If capture would put prohibited data in git, chat, or tickets — **stop**; keep evidence owner-held only.

**What remains blocked:** Leak for completeness.

---

### Decision BL12 — Pre-RLS only; not post-RLS compatibility pass

**Owner decision:** **Yes**.

**Policy meaning:** This gate is **pre-RLS** baseline only. Post-RLS compatibility **pass** (D record) requires **separate** gate **after** any RLS change on MAIN.

**What remains blocked:** Claiming D0–D20 satisfied by this session; compatibility pass before RLS apply.

---

### Decision BL13 — Review after capture (separate step)

**Owner decision:** **Yes**.

**Policy meaning:** After baseline capture, **OWNER** / **SECURITY_APPROVER** review (E6) is required before negative-test **execution** gate planning, Tier 2 defer closure, or packet **discussion**.

**What remains blocked:** Executor-only review; downstream use before review.

---

### Decision BL14 — No unlock of tests, packet, apply

**Owner decision:** **Yes**.

**Policy meaning:** This gate does **not** approve negative-test **execution**, packet draft, Gate 34B, staging/main apply, production apply, or runtime/write.

**What remains blocked:** Baseline gate → apply chain.

---

### Decision BL15 — STAGING baseline never satisfies MAIN

**Owner decision:** **Yes**.

**Policy meaning:** Future STAGING diagnostics baseline does **not** replace MAIN baseline (parity rules).

**What remains blocked:** STAGING → MAIN shortcut.

---

### Decision BL16 — MAIN clutter (T9) does not block this session

**Owner decision:** **Yes**.

**Policy meaning:** MAIN SQL clutter does **not** cancel this **read-only diagnostics** session on approved Phase 2 tables. Cleanup/migration audit remains **separate**.

**What remains blocked:** Cleanup approved here.

---

### Decision BL17 — Role labels in git; human identities owner-held; product DB unchanged

**Owner decision:** **Yes**.

**Policy meaning:**

- **In git (RLS gate docs only):** **role labels** only — e.g. **TECH_EXECUTOR** runs session; **OWNER** / **SECURITY_APPROVER** reviews afterward.
- **Owner-held outside git:** real human **names and emails** of executor and reviewers when needed.
- **Product database contour:** This gate does **not** restrict **user emails** in the **product database** under separate product policy.

**What remains blocked:** Personal emails in architecture git.

---

### Decision BL18 — No .env / secrets in repo

**Owner decision:** **Yes**.

**Policy meaning:** Session uses credentials **outside git**. This gate does **not** approve committing `.env`, service keys, or connection strings.

**What remains blocked:** Secrets in repository.

---

### Decision BL19 — Session timebox

**Owner decision:** **Yes**.

**Policy meaning:** **One** bounded session (or same-day continuation by same **TECH_EXECUTOR** with owner note owner-held). Not standing approval for all future connects.

**What remains blocked:** Indefinite “approved to connect anytime.”

---

### Decision BL20 — Stricter rule wins

**Owner decision:** **Yes**.

**Policy meaning:** On conflict, stricter child-data / no-apply rule wins.

**What remains blocked:** Weakening read-only or storage rules.

---

## Approved session boundary table

| Parameter | Approved value |
|-----------|----------------|
| Target | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |
| Connect type | Read-only diagnostics/helper per contract |
| Tables in scope | Seven Phase 2 tables per diagnostics contract |
| Approved consumer | Single script per `phase-2-read-only-diagnostics-contract.md` §1 only |
| Writes | **None** |
| DDL / RLS apply | **None** |
| Storage of capture | **Owner-held** default |
| Git after session | Safe summary only (BL10) |
| STAGING | **Not** approved by this gate |
| Repeat session | New execution gate required |
| Relationship to snapshot | **Separate** session from Tier 1 snapshot (SE12 defer) |

---

## What this closes / does not close

| Closes / approves | Does not close |
|-------------------|----------------|
| Bounded read-only MAIN connect for **one** pre-RLS diagnostics baseline session | Baseline **values** captured (operational) |
| BL0–BL20 execution gate on paper | Baseline **reviewed** |
| Catch-up authorization for SE12/S8/E11 pre-RLS requirement | Post-RLS compatibility **pass** |
| Role-label git posture + BL17 product DB clarification | Negative-test execution/pass |
| | Tier 2 completion if still incomplete |
| | Execution packet / apply |
| | NOT_READY_FOR_APPLY (until baseline captured + reviewed) |

---

## Archive table (BL0–BL20)

| ID | Summary | Owner | Status | Notes |
|----|---------|-------|--------|-------|
| BL0 | Execution gate scope | Yes | Adopted | Pre-RLS baseline |
| BL1 | Prerequisite snapshot+review | Yes | Adopted | 87430e2 |
| BL2 | Gate ≠ captured | Yes | Adopted | Critical |
| BL3 | MAIN only | Yes | Adopted | Primary |
| BL4 | STAGING separate | Yes | Adopted | Optional |
| BL5 | LAB excluded | Yes | Adopted | Historical |
| BL6 | Read-only diagnostics OK | Yes | Adopted | Bounded |
| BL7 | One cycle | Yes | Adopted | No standing |
| BL8 | Approved consumer only | Yes | Adopted | Contract |
| BL9 | Fail-open ≠ proof | Yes | Adopted | Observe only |
| BL10 | Owner-held storage | Yes | Adopted | E7 |
| BL11 | Stop on leak | Yes | Adopted | E9 |
| BL12 | Pre-RLS not post-pass | Yes | Adopted | D separate |
| BL13 | Review after | Yes | Adopted | E6 |
| BL14 | No test/packet/apply | Yes | Adopted | Unchanged |
| BL15 | STAGING ≠ MAIN | Yes | Adopted | Parity |
| BL16 | T9 clutter OK | Yes | Adopted | Read-only |
| BL17 | Labels in git; humans owner-held | Yes | Adopted | SE17 aligned |
| BL18 | No secrets in git | Yes | Adopted | .env |
| BL19 | Timebox | Yes | Adopted | One cycle |
| BL20 | Stricter wins | Yes | Adopted | Priority |

---

## Recommended next gate (informational only)

**Operational next step (outside this file):** run the **approved bounded read-only** pre-RLS diagnostics baseline session on **MAIN-OWNER-USED**; store results **owner-held**; then schedule **OWNER** / **SECURITY_APPROVER** review.

**NOT_READY_FOR_APPLY** and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain until baseline captured + reviewed (+ later gates).

Candidate **future documentation** gates (separate selection): Tier 2 completion/defer decision; negative-test **execution** gate; redacted evidence artifact planning; read-only cleanup feasibility audit.

SQL apply, Gate 34B, staging/main/production apply, negative-test **execution**, packet draft, runtime/write, PSA, Route, Phase 3/4 remain **forbidden** until separate gates.

---

## Final boundary statement

**Owner policy (2026-05-19):** MAIN Tier 1 snapshot capture + review safe summary per `phase-2-rls-main-snapshot-capture-review-summary.md` — capture reviewed PASS_WITH_SECURITY_FINDINGS; diagnostics baseline was **not attempted** in snapshot session; **NOT_READY_FOR_APPLY** unchanged.

Phase 2 RLS **MAIN diagnostics pre-RLS baseline execution gate** is owner-adopted in this record (BL0–BL20). **RLS_MAIN_DIAGNOSTICS_PRE_RLS_BASELINE_EXECUTION_GATE_ADOPTED_BOUNDED_READ_ONLY** approves **one bounded read-only** diagnostics session on **MAIN** only using the **approved contract consumer** only. **NOT_READY_FOR_APPLY** remains until baseline is captured owner-held **and** reviewed. **EXECUTION_FORBIDDEN** remains for apply, DDL/DML, Gate 34B, STAGING connect, negative-test execution, post-RLS compatibility pass execution, packet draft, and all non-baseline work. **Execution gate adopted ≠ baseline captured ≠ review done ≠ apply approved.** Gate 34B, staging apply, main RLS apply, production apply, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 remain **blocked** until **separate** owner-approved gates.

**Safe summary (2026-05-19):** MAIN-OWNER-USED diagnostics pre-RLS baseline was completed and owner-reviewed as PASS_BASELINE_CAPTURED per `phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md` — approved consumer used; warning none; identityResolutionSummary counters all 0; identityResolutionBySchoolCode empty; detailed output and command parameter values owner-held; **NOT_READY_FOR_APPLY** unchanged; **not** post-RLS compatibility pass.
