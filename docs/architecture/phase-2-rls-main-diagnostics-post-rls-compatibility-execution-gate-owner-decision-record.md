# Phase 2 RLS MAIN Diagnostics Post-RLS Compatibility Execution Gate Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **post-RLS diagnostics compatibility pass execution** gate — **NOT_READY_FOR_APPLY** / bounded **MAIN** read-only diagnostics connect approved / apply and packet remain forbidden |
| **Closure label** | `RLS_MAIN_DIAGNOSTICS_POST_RLS_COMPATIBILITY_EXECUTION_GATE_ADOPTED_BOUNDED_READ_ONLY` |
| **Scope** | Post-RLS diagnostics/helper compatibility **pass execution** gate on **MAIN-OWNER-USED** only (PC0–PC21) |
| **Date (UTC)** | 2026-05-26 |
| **Repository checkpoint** | `e6eaa9f` (Phase 2 RLS MAIN deny-posture apply review safe summary — U-post) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section **V** (RLS MAIN diagnostics post-RLS compatibility execution) |

This file records **owner-agreed approval** for **one bounded read-only** session to execute the **post-RLS** diagnostics/helper compatibility **pass** on **MAIN-OWNER-USED** and to record an **RLS-path** verdict (**PASS** / **FAIL** / **UNCLEAR**) per the diagnostics compatibility planning record (D0–D20).

It **follows** completed MAIN Option B deny-posture apply and **U-post** review (`phase-2-rls-main-deny-posture-apply-review-summary.md`, PASS_POST_APPLY_VERIFICATION). It **depends on** completed MAIN pre-RLS diagnostics baseline and **R-post** review (`phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md`, PASS_BASELINE_CAPTURED) for **before/after** comparison only.

**Adopting this record does NOT change NOT_READY_FOR_APPLY** until compatibility **pass** evidence is **captured owner-held** and **reviewed** per D8/E6 (safe summary in git only).

**Execution gate adopted ≠ session run ≠ RLS-path PASS reviewed ≠ apply approved.**

**Primary target:** **MAIN-OWNER-USED** / **PROD** (**PROD = MAIN-OWNER-USED for now**) — **only** target approved by this gate.

**STAGING-34B** is **not** approved by this gate. **ISOLATED-LAB** is **not** a target.

This record does **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, raw diagnostic JSON dumps, grant matrices, bypass dumps, raw child/school rows, per-school resolution maps with row-level detail, or exact SQL output in git. It does **not** create or change `.env` configuration.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged until post-RLS compatibility **pass** **captured** owner-held **and** **reviewed** on MAIN; negative-test Tranche B, packet, apply remain blocked |
| **EXECUTION_FORBIDDEN** | Unchanged for SQL apply, DDL/DML, RLS policy apply, Gate 34B execution, staging/main/production apply, writes, write-denial tests, test rows, Tranche B execution, STAGING connect, execution packet draft, and all non-diagnostics Supabase work |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged |
| **RLS_MAIN_DIAGNOSTICS_POST_RLS_COMPATIBILITY_EXECUTION_GATE_ADOPTED_BOUNDED_READ_ONLY** | **One** bounded **read-only** diagnostics session on **MAIN-OWNER-USED** is **approved**; does **not** mean session completed or RLS-path PASS |
| **BOUNDED_MAIN_DIAGNOSTICS_POST_RLS_READ_ONLY_CONNECT_APPROVED** | Narrow exception to global “no Supabase connect” for this gate only — **not** general connect approval |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Depends on:** `docs/architecture/phase-2-rls-main-deny-posture-apply-review-summary.md` — **U-post**; Option B apply **completed**; RLS **on** all **7**; FORCE **off**; **14** policies; rows **0**.
- **Depends on:** `docs/architecture/phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md` — **R-post**; pre-RLS baseline **PASS_BASELINE_CAPTURED** (before reference only).
- **Depends on:** `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` (D0–D20 — PASS/FAIL/UNCLEAR; fail-open vs fail-safe; before/after rule).
- **Depends on:** `docs/architecture/phase-2-rls-main-deny-posture-apply-execution-gate-owner-decision-record.md` (DA — sequencing; Tranche B **after** post-RLS pass).
- **Complements:** `docs/architecture/phase-2-rls-main-diagnostics-pre-rls-baseline-execution-gate-owner-decision-record.md` (BL — pre-RLS only; **not** satisfied by R-post alone for post-RLS pass).
- **Complements:** `docs/architecture/phase-2-rls-main-negative-test-execution-gate-owner-decision-record.md` (NT — Tranche B remains **separate** even if compatibility PASS).
- **Complements:** `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` (S8); `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` (E11).
- **Complements:** `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` (rollback triggers; C6).
- **Canonical (must not be weakened):** `docs/architecture/phase-2-read-only-diagnostics-contract.md`, `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`.
- **Uses private target labels:** **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now** only for this gate.
- **Conflict rule:** stricter safety rule wins; canonical sources win over owner records; **no Tranche B until post-RLS pass reviewed** wins over speed.

## This document is not

- proof that a post-RLS compatibility session already occurred
- proof that RLS-path **PASS** was reviewed
- negative-test **execution** or **pass** approval (including Tranche B)
- write-denial test approval
- Q4-blocking pass or N12 packet pass
- execution packet approval or drafting permission
- proof that RLS is production-safe or deny posture verified for Q4
- helper/pipeline/readiness **integration** or new helper consumer approval
- approval to store executor/reviewer **real names or emails** in git (role labels only)
- Supabase connect approval for **STAGING-34B**, apply, packet draft, or any other purpose
- FORCE RLS **enablement** or further RLS policy apply
- Gate 34B / staging / main RLS **apply** approval (deny apply already completed under U-post)
- runtime/write, PSA, Route, operator, Phase 3/4 approval
- **NOT_READY_FOR_APPLY** clearance

## Source basis

- `docs/architecture/phase-2-closure-criteria-checklist.md`
- `docs/architecture/phase-2-rls-main-deny-posture-apply-review-summary.md`
- `docs/architecture/phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md`
- `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md`
- `docs/architecture/phase-2-read-only-diagnostics-contract.md`
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`

**Conflict rule:** canonical diagnostics contract and helper ADR win; revise this record if in conflict.

---

## Meta-rule PC0

All **Yes** decisions (PC1–PC21) adopt **MAIN post-RLS diagnostics compatibility execution gate** on paper and approve **one bounded read-only connect** for that purpose only.

PC1–PC21 do **not** authorize SQL apply, DDL/DML, RLS policy changes, GRANT/REVOKE, Gate 34B, staging apply, further deny-posture apply, negative-test Tranche B execution, write-denial tests, DML, test rows, packet draft, runtime/write, row writes, PSA, Route, Phase 3/4, cleanup, migration, STAGING connect, new helper consumers, or storing secrets/raw diagnostic dumps in git.

**Child-information protection** overrides speed for capture and storage.

**Fail-open diagnostics behavior is not family-security proof** and does **not** weaken RLS apply blocks.

---

## Priority rule (PC21)

Stricter checklist, canonical spec, or prior owner record wins on conflict.

---

## Owner/security post-RLS compatibility execution decisions (PC0–PC21)

### Decision PC0 — Scope of this record

**Owner decision:** **Yes**.

**Policy meaning:** This record is the **execution gate** for **post-RLS diagnostics/helper compatibility pass** on MAIN — not pre-RLS baseline (BL/R-post), not deny-posture apply (DA/U-post), not Tranche B.

**What remains blocked:** Implicit diagnostics connect without citing this gate; treating D planning alone as pass executed.

---

### Decision PC1 — Prerequisite: U-post deny apply complete

**Owner decision:** **Yes**.

**Policy meaning:** Gate adopted only after MAIN Option B deny-posture apply session **completed** and **OWNER** / **SECURITY_APPROVER** post-apply verification per **U-post** (RLS **on** all **7**; FORCE **off**; **14** policies; rows **0**).

**What remains blocked:** Post-RLS pass before deny apply reviewed.

---

### Decision PC2 — Prerequisite: R-post pre-RLS baseline complete

**Owner decision:** **Yes**.

**Policy meaning:** Gate adopted only after MAIN pre-RLS diagnostics baseline **performed** and reviewed **PASS_BASELINE_CAPTURED** per **R-post**. R-post is the **before** reference for mandatory before/after comparison in the approved session — **not** a substitute for post-RLS pass.

**What remains blocked:** Skipping post-RLS re-check; R-post alone = post-RLS pass.

---

### Decision PC3 — Gate adopted ≠ session run ≠ pass reviewed

**Owner decision:** **Yes**.

**Policy meaning:** Adopting PC0–PC21 **approves** a future bounded session; it does **not** mean the session ran, RLS-path verdict exists, or pass is reviewed.

**What remains blocked:** Claiming post-RLS pass closed from this file alone.

---

### Decision PC4 — MAIN-OWNER-USED only

**Owner decision:** **Yes**.

**Policy meaning:** **Only** **MAIN-OWNER-USED** / **PROD** (= MAIN) may be used for the approved session.

**What remains blocked:** STAGING or LAB substituting MAIN compatibility pass.

---

### Decision PC5 — STAGING not approved by this gate

**Owner decision:** **Yes**.

**Policy meaning:** **STAGING-34B** post-RLS compatibility requires a **separate** future gate if ever needed (optional rehearsal only).

**What remains blocked:** STAGING pass satisfying MAIN.

---

### Decision PC6 — ISOLATED-LAB excluded

**Owner decision:** **Yes**.

**Policy meaning:** Historical lab diagnostics **must not** be copied as MAIN post-RLS pass.

**What remains blocked:** Lab reuse for MAIN evidence.

---

### Decision PC7 — Bounded read-only diagnostics connect approved

**Owner decision:** **Yes**.

**Policy meaning:** Owner may perform **one bounded read-only** session on **MAIN-OWNER-USED** to run the **approved diagnostics consumer** per canonical contract (read-only Phase 2 table queries; observe-only outputs) **after** Option B deny posture is applied. Session records **RLS-path** verdict **PASS** / **FAIL** / **UNCLEAR** per D record — assigned by **OWNER** / **SECURITY_APPROVER** after review, not by tool fail-open alone.

**Forbidden in session:** DDL, DML, RLS apply, policy changes, writes, readiness/pipeline integration, PSA, Route consumption, new scripts/consumers, Tranche B probes, write-denial tests, test rows.

**What remains blocked:** Write sessions; further RLS apply during “compatibility pass.”

---

### Decision PC8 — One target / one adoption cycle

**Owner decision:** **Yes**.

**Policy meaning:** **One** approved post-RLS compatibility cycle on MAIN per this gate adoption. Repeat requires **new** execution gate.

**What remains blocked:** Standing approval for unlimited diagnostics connects.

---

### Decision PC9 — Approved consumer only

**Owner decision:** **Yes**.

**Policy meaning:** Session uses **only** the single approved consumer identified in `phase-2-read-only-diagnostics-contract.md` (`scripts/diagnose-school-identity-phase2-readonly.mjs` per contract §1). **No** new helper consumers.

**What remains blocked:** classify-vgs-truth-readiness, run-vgs-truth-pipeline, runtime/UI consumers without separate gate + ADR update.

---

### Decision PC10 — Fail-open tool vs fail-safe RLS path

**Owner decision:** **Yes**.

**Policy meaning:** Tool may **fail-open** per contract (warnings, empty diagnostics) — that is **not** automatic RLS-path **PASS**. After RLS change on MAIN, **FAIL** or **UNCLEAR** on the RLS path = **stop** and rollback trigger **candidate** (D18, N11). Tool-layer success pre-RLS (R-post) ≠ post-RLS pass.

**What remains blocked:** Empty warnings-only output after RLS treated as PASS without explicit owner RLS-path PASS.

---

### Decision PC11 — Mandatory before/after comparison with R-post

**Owner decision:** **Yes**.

**Policy meaning:** Review must compare post-RLS session results to **R-post** safe summary and owner-held pre-RLS detail. Material unexplained divergence (e.g. non-zero counters vs **0** rows with no documented cause) → **UNCLEAR** or **FAIL**, not silent PASS.

**What remains blocked:** Pass without before/after review.

---

### Decision PC12 — Owner-held capture; git safe summary only

**Owner decision:** **Yes**.

**Policy meaning:** Detailed output stays **owner-held** (D8/E7). Git may record **safe summary** only: target label; date; RLS-path **PASS** / **FAIL** / **UNCLEAR**; warning **codes** only; `phase2SchemaAvailable` boolean; aggregate counter names/values from summary fields; blocked / not apply statement — **no** prohibited items.

**What remains blocked:** Raw diagnostic JSON, keys, `project_ref`, per-school maps, full SQL transcripts in git.

---

### Decision PC13 — Stop on leak risk

**Owner decision:** **Yes**.

**Policy meaning:** If capture would put prohibited data in git, chat, or tickets — **stop**; keep evidence owner-held only.

**What remains blocked:** Leak for completeness.

---

### Decision PC14 — Post-RLS pass ≠ Tranche B / Q4 / N12

**Owner decision:** **Yes**.

**Policy meaning:** Even RLS-path **PASS** does **not** approve Tranche B, write-denial tests, Q4-blocking pass, N12 packet pass, execution packet, or runtime/write. Tranche B requires **separate** owner/security gate **after** post-RLS pass reviewed (DA14–DA18 chain).

**What remains blocked:** Compatibility PASS → Tranche B shortcut.

---

### Decision PC15 — Review after capture; FAIL/UNCLEAR = stop

**Owner decision:** **Yes**.

**Policy meaning:** After session capture, **OWNER** / **SECURITY_APPROVER** review is required. **FAIL** or **UNCLEAR** on RLS path = **scheduling stop** and **rollback trigger candidate** (owner-held deny rollback per U-post; D18). **PASS** may inform **discussion** of future gates only — not apply or packet.

**What remains blocked:** Executor-only review; continue to Tranche B on FAIL/UNCLEAR.

---

### Decision PC16 — No unlock of packet, apply, runtime/write

**Owner decision:** **Yes**.

**Policy meaning:** This gate does **not** approve execution packet draft, Gate 34B, staging/main/production apply, or runtime/write even if RLS-path PASS.

**What remains blocked:** Compatibility pass → apply chain.

---

### Decision PC17 — Role labels in git; human identities owner-held

**Owner decision:** **Yes**.

**Policy meaning:** Git stores **role labels** only (**TECH_EXECUTOR**, **OWNER**, **SECURITY_APPROVER**). Real names/emails **owner-held**. Product database user emails remain under separate product policy.

**What remains blocked:** Personal emails in architecture git.

---

### Decision PC18 — No .env / secrets in repo

**Owner decision:** **Yes**.

**Policy meaning:** Session uses credentials **outside git**. No committing `.env`, service keys, or connection strings.

**What remains blocked:** Secrets in repository.

---

### Decision PC19 — Session timebox

**Owner decision:** **Yes**.

**Policy meaning:** **One** bounded session (or same-day continuation by same **TECH_EXECUTOR** with owner note owner-held). Not standing approval for all future connects.

**What remains blocked:** Indefinite “approved to connect anytime.”

---

### Decision PC20 — Route/PSA wiring caveat (UNCLEAR rule)

**Owner decision:** **Yes**.

**Policy meaning:** If compatibility outcomes for Route/PSA/product paths cannot be determined from observe-only diagnostics alone, verdict must be **UNCLEAR**, not PASS by omission (N11, D table).

**What remains blocked:** PASS while product-path outcomes unresolved.

---

### Decision PC21 — Stricter rule wins

**Owner decision:** **Yes**.

**Policy meaning:** On conflict, stricter child-data / no-apply rule wins.

**What remains blocked:** Weakening read-only or storage rules.

---

## RLS-path result interpretation table (binding — from D record)

| Result | On RLS path after RLS change | Scheduling / Tranche B / packet / apply |
|--------|------------------------------|----------------------------------------|
| **PASS** | Compatibility acceptable for **discussion** of **future** gates on MAIN | Does **not** approve Tranche B, packet, or apply |
| **FAIL** | **Stop**; rollback trigger candidate | Blocked |
| **UNCLEAR** | **Stop**; treat as unresolved | Blocked |

---

## Approved session boundary table

| Parameter | Approved value |
|-----------|----------------|
| Target | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |
| Connect type | Read-only diagnostics/helper per contract |
| Tables in scope | Seven Phase 2 tables per diagnostics contract |
| Approved consumer | `scripts/diagnose-school-identity-phase2-readonly.mjs` only |
| Writes | **None** |
| DDL / further RLS apply | **None** |
| Expected MAIN state | RLS **on**; FORCE **off**; deny policies per U-post |
| Storage of capture | **Owner-held** default |
| Git after session | Safe summary only (PC12) — **V-post** |
| STAGING | **Not** approved |
| Repeat session | New execution gate required |
| Before reference | **R-post** + owner-held pre-RLS detail |
| Tranche B in session | **Forbidden** |

---

## What this closes / does not close

| Closes / approves | Does not close |
|-------------------|----------------|
| Bounded read-only MAIN connect for **one** post-RLS compatibility session | Session **performed** (operational) |
| PC0–PC21 execution gate on paper | RLS-path verdict **reviewed** |
| Sequencing authorization after U-post | Tranche B / write-denial / Q4 / N12 |
| Role-label git posture (PC17) | Execution packet / apply |
| | NOT_READY_FOR_APPLY (until pass captured + reviewed) |

---

## Archive table (PC0–PC21)

| ID | Summary | Owner | Status | Notes |
|----|---------|-------|--------|-------|
| PC0 | Execution gate scope | Yes | Adopted | Post-RLS pass |
| PC1 | Prerequisite U-post | Yes | Adopted | Deny applied |
| PC2 | Prerequisite R-post | Yes | Adopted | Before ref |
| PC3 | Gate ≠ run ≠ reviewed | Yes | Adopted | Critical |
| PC4 | MAIN only | Yes | Adopted | Primary |
| PC5 | STAGING separate | Yes | Adopted | Optional |
| PC6 | LAB excluded | Yes | Adopted | Historical |
| PC7 | Read-only diagnostics OK | Yes | Adopted | Bounded |
| PC8 | One cycle | Yes | Adopted | No standing |
| PC9 | Approved consumer only | Yes | Adopted | Contract |
| PC10 | Fail-open ≠ RLS PASS | Yes | Adopted | D fail-safe |
| PC11 | Before/after vs R-post | Yes | Adopted | D11 |
| PC12 | Owner-held storage | Yes | Adopted | D8 |
| PC13 | Stop on leak | Yes | Adopted | E9 |
| PC14 | Pass ≠ Tranche B | Yes | Adopted | DA chain |
| PC15 | Review; FAIL/UNCLEAR stop | Yes | Adopted | D18 |
| PC16 | No packet/apply | Yes | Adopted | Unchanged |
| PC17 | Labels in git | Yes | Adopted | BL17 aligned |
| PC18 | No secrets in git | Yes | Adopted | .env |
| PC19 | Timebox | Yes | Adopted | One cycle |
| PC20 | Route/PSA UNCLEAR rule | Yes | Adopted | N11 |
| PC21 | Stricter wins | Yes | Adopted | Priority |

---

## Recommended next gate (informational only)

**Operational next step (outside this file):** copy charter template to **owner-held**; obtain **OWNER** / **SECURITY_APPROVER** charter approval; run **one bounded read-only** post-RLS diagnostics session on **MAIN-OWNER-USED**; store results **owner-held**; perform before/after review vs **R-post**; assign RLS-path **PASS** / **FAIL** / **UNCLEAR**; then record **V-post** safe summary in git.

**NOT_READY_FOR_APPLY** and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain until pass captured + reviewed (+ later gates).

Candidate **future** gates (separate selection): Tranche B execution gate (only after **V-post** PASS); write-denial test gate; Tier 2 completion/defer.

SQL apply, Gate 34B, staging/main/production apply, negative-test Tranche B **execution**, packet draft, runtime/write, PSA, Route, Phase 3/4 remain **forbidden** until separate gates.

---

## Final boundary statement

**Owner policy (2026-05-26):** MAIN Option B deny-posture apply reviewed per **U-post** — RLS **on** all **7**; FORCE **off**; **14** policies; rows **0**; **NOT_READY_FOR_APPLY** unchanged.

Phase 2 RLS **MAIN diagnostics post-RLS compatibility execution gate** is owner-adopted in this record (PC0–PC21). **RLS_MAIN_DIAGNOSTICS_POST_RLS_COMPATIBILITY_EXECUTION_GATE_ADOPTED_BOUNDED_READ_ONLY** approves **one bounded read-only** diagnostics session on **MAIN** only using the **approved contract consumer** only, **after** U-post and **with** R-post as before reference. **NOT_READY_FOR_APPLY** remains until post-RLS compatibility is captured owner-held **and** reviewed. **EXECUTION_FORBIDDEN** remains for apply, DDL/DML, Gate 34B, STAGING connect, Tranche B, write-denial tests, packet draft, and all non-compatibility-pass work. **Execution gate adopted ≠ session run ≠ RLS-path PASS reviewed ≠ apply approved.** Tranche B requires **V-post** PASS **and** a **separate** Tranche B gate. Gate 34B, staging apply, production apply, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 remain **blocked** until **separate** owner-approved gates.

**Related:** Section **V** (checklist); **U-post**; **R-post**; D record; charter template `phase-2-rls-main-diagnostics-post-rls-compatibility-charter-template.md`; future **V-post** safe summary.
