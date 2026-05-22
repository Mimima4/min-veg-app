# Phase 2 RLS Live Snapshot Collection Execution Gate Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **live snapshot collection execution** gate — **NOT_READY_FOR_APPLY** / bounded **MAIN** read-only connect approved / apply and packet remain forbidden |
| **Closure label** | `RLS_LIVE_SNAPSHOT_MAIN_COLLECTION_EXECUTION_GATE_ADOPTED_BOUNDED_READ_ONLY` |
| **Scope** | Live snapshot collection **execution** gate on **MAIN-OWNER-USED** only (SE0–SE20) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `e03b0c8 Add Phase 2 RLS live snapshot collection gate owner decision record` |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section Q (RLS live snapshot collection execution) |

This file records **owner-agreed approval** for **one bounded read-only** Supabase (or equivalent) session to collect **Tier 1** (and optionally **Tier 2**) per-target RLS snapshot **evidence** on **MAIN-OWNER-USED** at **owner-held** storage.

It **implements** the third layer after gate definition (`phase-2-rls-live-snapshot-collection-gate-owner-decision-record.md`, SG0–SG18). It **does not** mean the snapshot session already ran, Tier 1 is complete, evidence was reviewed, or apply is ready.

**Adopting this record does NOT change NOT_READY_FOR_APPLY** until Tier 1 evidence is **captured owner-held** and **reviewed** per E6.

**Execution gate adopted ≠ snapshot collected ≠ review done ≠ apply approved.**

**Primary target:** **MAIN-OWNER-USED** / **PROD** (**PROD = MAIN-OWNER-USED for now**) — **only** target approved by this gate.

**STAGING-34B** is **not** approved by this gate. **ISOLATED-LAB** is **not** a target.

This record does **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, snapshot dumps, grant matrices, bypass dumps, raw child/school rows, or exact SQL output in git. It does **not** create or change `.env` configuration.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged until Tier 1 **captured** owner-held **and** **reviewed** on MAIN; test pass, packet, apply remain blocked |
| **EXECUTION_FORBIDDEN** | Unchanged for SQL apply, DDL/DML, RLS policy apply, Gate 34B execution, staging/main/production apply, writes, STAGING snapshot connect, negative-test execution, diagnostics post-RLS pass execution, and all non-snapshot Supabase work |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged |
| **RLS_LIVE_SNAPSHOT_MAIN_COLLECTION_EXECUTION_GATE_ADOPTED_BOUNDED_READ_ONLY** | **One** bounded **read-only** connect session on **MAIN-OWNER-USED** for snapshot capture is **approved**; does **not** mean capture completed or reviewed |
| **BOUNDED_MAIN_SNAPSHOT_READ_ONLY_CONNECT_APPROVED** | Narrow exception to prior global “no Supabase connect” for this gate only — **not** a general connect approval |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Depends on / implements:** `docs/architecture/phase-2-rls-live-snapshot-collection-gate-owner-decision-record.md` (SG0–SG18 gate definition).
- **Depends on:** `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` (S0–S14 Tier 1/Tier 2).
- **Depends on:** `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` (E0–E18 capture, review, storage).
- **Complements:** `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` (A4–A5 role labels; SE17).
- **Complements:** `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` (C2, C7).
- **Complements:** `docs/architecture/phase-2-rls-parity-evidence-planning-owner-decision-record.md` (STAGING ≠ MAIN).
- **Complements:** `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` (T9 clutter — SG16/SE16).
- **Uses private target labels:** **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now** only for this gate.
- **Conflict rule:** stricter safety rule wins; canonical sources win over owner records.

## This document is not

- proof that a snapshot session already occurred
- proof that Tier 1 or Tier 2 evidence is complete
- evidence **review** approval or satisfaction
- operational good-restored-state **values** closure
- Supabase connect approval for **STAGING-34B**, apply, tests, diagnostics pass execution, or any other purpose
- negative-test **execution** or **pass** approval
- post-RLS diagnostics compatibility **pass** approval
- FORCE RLS **enablement** or apply approval
- Gate 34B / staging / main RLS **apply** approval
- execution packet approval or drafting permission
- approval to store executor/reviewer **real names or emails** in git (role labels only)
- a restriction on **product database** storage of user emails (separate product contour — see SE17)
- runtime/write, PSA, Route, operator, helper/pipeline, Phase 3/4 approval
- cleanup, migration, new-project approval

## Source basis

- `docs/architecture/phase-2-closure-criteria-checklist.md`
- `docs/architecture/phase-2-rls-live-snapshot-collection-gate-owner-decision-record.md`
- `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md`
- `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md`
- `docs/architecture/phase-2-rls-accountability-owner-decision-record.md`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`

**Conflict rule:** canonical sources win; revise this record if in conflict.

---

## Meta-rule SE0

All **Yes** decisions (SE1–SE20) adopt **MAIN live snapshot collection execution gate** on paper and approve **one bounded read-only connect** for that purpose only.

SE1–SE20 do **not** authorize SQL apply, DDL/DML, RLS policy changes, Gate 34B, staging apply, main apply, production apply, negative-test execution, packet draft, runtime/write, row writes, PSA, Route, Phase 3/4, cleanup, migration, STAGING connect, or storing secrets/raw evidence in git.

**Child-information protection** overrides speed for capture and storage.

---

## Priority rule (SE20)

Stricter checklist, canonical spec, or prior owner record wins on conflict.

---

## Owner/security collection execution decisions (SE0–SE20)

### Decision SE0 — Scope of this record

**Owner decision:** **Yes**.

**Policy meaning:** This record is the **execution gate** layer (not gate definition SG, not planning E/S alone). It approves **bounded read-only MAIN connect for snapshot capture** when owner runs the session — it does **not** by itself perform the session.

**What remains blocked:** Implicit connect without citing this gate; all non-snapshot work.

---

### Decision SE1 — Execution gate complements SG (not replacement)

**Owner decision:** **Yes**.

**Policy meaning:** SG defined **what** capture means; this gate **approves one MAIN session** under SG7/SG8 rules.

**What remains blocked:** Skipping SG; redefining capture scope here.

---

### Decision SE2 — Gate adopted ≠ snapshot already collected

**Owner decision:** **Yes**.

**Policy meaning:** Committing this record does **not** mean Tier 1 was captured. Owner must still run the **approved bounded session** and store results owner-held.

**What remains blocked:** “Gate committed → evidence exists.”

---

### Decision SE3 — MAIN-OWNER-USED only for this gate

**Owner decision:** **Yes**.

**Policy meaning:** The **only** target label approved for connect under this gate is **MAIN-OWNER-USED** / **PROD** (= MAIN for now).

**What remains blocked:** STAGING or other targets under this gate.

---

### Decision SE4 — STAGING not required before MAIN capture

**Owner decision:** **Yes**.

**Policy meaning:** MAIN capture may proceed **without** prior STAGING snapshot.

**What remains blocked:** STAGING-first mandatory path.

---

### Decision SE5 — ISOLATED-LAB out of scope

**Owner decision:** **Yes**.

**Policy meaning:** Lab historical evidence is **not** refreshed or used as this session’s baseline.

**What remains blocked:** Lab → MAIN shortcut.

---

### Decision SE6 — Bounded read-only connect approved (MAIN only)

**Owner decision:** **Yes**.

**Policy meaning:** Owner may perform **one bounded read-only** database session on **MAIN-OWNER-USED** to capture snapshot fields: catalog/metadata and read-only queries for **seven Phase 2 tables**, RLS state, policy counts/names, grants/roles summaries, PostgreSQL version, and pre-RLS diagnostics baseline per E11/S.

**Forbidden in session:** DDL, DML, `ENABLE ROW LEVEL SECURITY`, policy create/alter/drop, apply scripts, migrations, writes to Phase 2 or other tables for “testing.”

**What remains blocked:** Write sessions; apply during “snapshot.”

---

### Decision SE7 — One target per gate adoption

**Owner decision:** **Yes**.

**Policy meaning:** This adoption covers **one** **MAIN-OWNER-USED** collection cycle. Another target or a repeat MAIN full capture requires a **new** execution gate.

**What remains blocked:** Permanent open-ended connect approval.

---

### Decision SE8 — Tier 1 required for “session successful”

**Owner decision:** **Yes**.

**Policy meaning:** The session is **successful** only when all **Tier 1** mandatory fields (S4 table) are captured **owner-held** for MAIN.

**What remains blocked:** Partial Tier 1 counted complete; Tier 1 full dumps in git.

---

### Decision SE9 — Tier 2 optional in same session; required later for packet talk

**Owner decision:** **Yes**.

**Policy meaning:** Tier 2 (S5) **may** be captured in the same read-only session; **not** required to close this gate adoption, but **required** before execution packet **discussion**.

**What remains blocked:** Packet talk with Tier 1 only.

---

### Decision SE10 — Owner-held capture; git safe summary only

**Owner decision:** **Yes**.

**Policy meaning:** Capture **values** stay **owner-held** (E7). Git may record **safe summary** only: target label, date (UTC), Tier 1 complete Y/N, Tier 2 complete Y/N, session completed Y/N, reviewer assignment pending — **no** prohibited items (E9/S7).

**What remains blocked:** Keys, `project_ref`, grant matrices, raw rows, full SQL transcripts in git.

---

### Decision SE11 — Stop on leak risk

**Owner decision:** **Yes**.

**Policy meaning:** If capture would put prohibited data in git, chat, or tickets — **stop**; keep evidence owner-held only.

**What remains blocked:** Leak for completeness.

---

### Decision SE12 — Pre-RLS diagnostics baseline in session

**Owner decision:** **Yes**.

**Policy meaning:** Session includes **pre-RLS** read-only diagnostics/helper baseline on MAIN (observe-only). This is **not** post-RLS compatibility **pass**.

**What remains blocked:** Diagnostics pass claims from snapshot session alone.

---

### Decision SE13 — Review after capture (separate step)

**Owner decision:** **Yes**.

**Policy meaning:** After capture, **OWNER** / **SECURITY_APPROVER** review (E6) is required before negative-test execution planning, good-state **values**, or packet **discussion**.

**What remains blocked:** Executor-only MAIN review; downstream use before review.

---

### Decision SE14 — No unlock of tests, packet, apply

**Owner decision:** **Yes**.

**Policy meaning:** This gate does **not** approve negative-test **execution**, packet draft, Gate 34B, staging/main apply, or production apply.

**What remains blocked:** Snapshot gate → apply chain.

---

### Decision SE15 — STAGING capture never satisfies MAIN

**Owner decision:** **Yes**.

**Policy meaning:** Future STAGING capture does **not** replace MAIN evidence (P5, SG15).

**What remains blocked:** STAGING → MAIN readiness shortcut.

---

### Decision SE16 — MAIN clutter (T9) does not block this session

**Owner decision:** **Yes**.

**Policy meaning:** MAIN SQL clutter does **not** cancel this **read-only Phase 2 table** snapshot session. Cleanup/migration audit remains **separate**.

**What remains blocked:** Cleanup approved here; clutter used to skip MAIN capture.

---

### Decision SE17 — Role labels in git; human identities owner-held; product DB unchanged

**Owner decision:** **Yes** (owner correction 2026-05-18).

**Policy meaning:**

- **In git (RLS gate docs only):** **role labels** only — e.g. **TECH_EXECUTOR** performs session; **OWNER** / **SECURITY_APPROVER** reviews afterward (per accountability record).
- **Owner-held outside git:** real human **names and emails** of executor and reviewers for this RLS snapshot work, when needed for operational traceability.
- **Product database contour:** This RLS git/owner-held posture does **not** restrict storing **user emails** (or other account fields) in the **product database** where the application already does so under separate product/privacy policy. RLS snapshot governance and product user data are **separate** boundaries.

**What remains blocked:** Committing executor/reviewer personal emails into architecture git; claiming this gate limits product DB email storage.

---

### Decision SE18 — No .env / secrets in repo

**Owner decision:** **Yes**.

**Policy meaning:** Session uses credentials **outside git** (local env, secret manager). This gate does **not** approve committing `.env`, service keys, or connection strings.

**What remains blocked:** Secrets in repository.

---

### Decision SE19 — Session timebox

**Owner decision:** **Yes**.

**Policy meaning:** **One** bounded session (or same-day continuation by same **TECH_EXECUTOR** with owner note owner-held). Not standing approval for all future connects.

**What remains blocked:** Indefinite “approved to connect anytime.”

---

### Decision SE20 — Stricter rule wins

**Owner decision:** **Yes**.

**Policy meaning:** On conflict, stricter child-data / no-apply rule wins.

**What remains blocked:** Weakening read-only or storage rules.

---

## Approved session boundary table

| Parameter | Approved value |
|-----------|----------------|
| Target | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |
| Connect type | Read-only inspection |
| Tables in scope | Seven Phase 2 tables + RLS/grants/roles/diagnostics context per S/E |
| Writes | **None** |
| DDL / RLS apply | **None** |
| Storage of capture | **Owner-held** default |
| Git after session | Safe summary only (SE10) |
| STAGING | **Not** approved by this gate |
| Repeat session | New execution gate required |

---

## What this closes / does not close

| Closes / approves | Does not close |
|-------------------|----------------|
| Bounded read-only MAIN connect for **one** snapshot capture session | Tier 1 **values** captured (operational) |
| SE0–SE20 execution gate on paper | Evidence **reviewed** |
| Third layer after SG gate definition | Good-restored-state **values** |
| Role-label git posture + SE17 product DB clarification | Negative-test execution/pass |
| | Diagnostics post-RLS pass |
| | Execution packet / apply |
| | NOT_READY_FOR_APPLY (until capture + review) |

---

## Archive table (SE0–SE20)

| ID | Summary | Owner | Status | Notes |
|----|---------|-------|--------|-------|
| SE0 | Execution gate scope | Yes | Adopted | Not SG |
| SE1 | Complements SG | Yes | Adopted | Layer 3 |
| SE2 | Gate ≠ captured | Yes | Adopted | Critical |
| SE3 | MAIN only | Yes | Adopted | Primary |
| SE4 | STAGING optional | Yes | Adopted | No prereq |
| SE5 | LAB excluded | Yes | Adopted | Historical |
| SE6 | Read-only connect OK | Yes | Adopted | Bounded |
| SE7 | One target/adoption | Yes | Adopted | No standing |
| SE8 | Tier 1 success criterion | Yes | Adopted | S4 |
| SE9 | Tier 2 optional now | Yes | Adopted | S5 later |
| SE10 | Owner-held storage | Yes | Adopted | E7 |
| SE11 | Stop on leak | Yes | Adopted | E9 |
| SE12 | Diagnostics baseline | Yes | Adopted | Pre-RLS |
| SE13 | Review after | Yes | Adopted | E6 |
| SE14 | No test/packet/apply | Yes | Adopted | Unchanged |
| SE15 | STAGING ≠ MAIN | Yes | Adopted | P5 |
| SE16 | T9 clutter OK | Yes | Adopted | Phase 2 scope |
| SE17 | Labels in git; humans owner-held; product DB OK | Yes | Adopted | Owner correction |
| SE18 | No secrets in git | Yes | Adopted | .env |
| SE19 | Timebox | Yes | Adopted | One cycle |
| SE20 | Stricter wins | Yes | Adopted | Priority |

---

## Recommended next gate (informational only)

**Operational next step (outside this file):** run the **approved bounded read-only** capture session on **MAIN-OWNER-USED**; store Tier 1 (and optional Tier 2) **owner-held**; then schedule **OWNER** review.

**NOT_READY_FOR_APPLY** and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain until capture + review (+ later gates).

Any **future documentation gate** requires separate read-only selection (e.g. redacted artifact planning, cleanup feasibility audit, negative-test **execution** gate after review).

SQL apply, Gate 34B, staging/main/production apply, negative-test **execution**, packet draft, runtime/write, PSA, Route, Phase 3/4 remain **forbidden** until separate gates.

---

## Final boundary statement

**Owner policy (2026-05-18):** RLS live snapshot collection **gate definition** (SG0–SG18) per `docs/architecture/phase-2-rls-live-snapshot-collection-gate-owner-decision-record.md` — gate defined only; connect not approved by definition record alone.

Phase 2 RLS **live snapshot collection execution gate** for **MAIN-OWNER-USED** is owner-adopted in this record (SE0–SE20). **RLS_LIVE_SNAPSHOT_MAIN_COLLECTION_EXECUTION_GATE_ADOPTED_BOUNDED_READ_ONLY** approves **one bounded read-only** connect session for snapshot capture on **MAIN** only. **NOT_READY_FOR_APPLY** remains until Tier 1 is captured owner-held **and** reviewed. **EXECUTION_FORBIDDEN** remains for apply, DDL/DML, Gate 34B, STAGING connect, tests, packet, and all non-snapshot work. **Execution gate adopted ≠ snapshot collected ≠ review done ≠ apply approved.** Gate 34B, staging apply, main RLS apply, production apply, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline, Phase 3, and Phase 4 remain **blocked** until **separate** owner-approved gates.

**Safe summary (2026-05-19):** MAIN-OWNER-USED Tier 1 snapshot capture was completed and owner-reviewed as PASS_WITH_SECURITY_FINDINGS per `phase-2-rls-main-snapshot-capture-review-summary.md` — detailed evidence owner-held; RLS off / FORCE off / 0 policies / anon-authenticated grants finding; **NOT_READY_FOR_APPLY** unchanged.
