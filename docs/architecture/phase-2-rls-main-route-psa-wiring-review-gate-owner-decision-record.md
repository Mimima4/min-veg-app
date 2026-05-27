# Phase 2 RLS MAIN Route/PSA Wiring Review Gate Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **Route/PSA wiring review** gate — **NOT_READY_FOR_APPLY** / **no** Supabase connect / **no** Route–PSA negative-test execution approved |
| **Closure label** | `RLS_MAIN_ROUTE_PSA_WIRING_REVIEW_GATE_ADOPTED_BOUNDED` |
| **Scope** | **Wiring review only** — bounded read-only assessment whether Route and/or PSA touch the **seven** Phase 2 tables on **MAIN-OWNER-USED** (XR0–XR21); **no** live negative tests at gate adoption |
| **Date (UTC)** | 2026-05-27 |
| **Repository checkpoint** | `75108ca` (MAIN Q4 owner/security review with Route/PSA limitation — W-Q4) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section **X** (RLS MAIN Route/PSA wiring review gate) |

This record adopts **bounded Route/PSA wiring review** on **MAIN-OWNER-USED** only. It defines **what must be determined on paper and in repo/docs** before any **future** Route/PSA **negative-test execution** gate (if required) or any claim that the W-post / W-Q4 Route/PSA limitation is **resolved**.

It **follows** **W-post** (Tranche B client-role denial **PASS**; Route/PSA **UNCLEAR**), **W-Q4** (`Q4_REVIEWED_WITH_ROUTE_PSA_LIMITATION`; next gate = Route/PSA review), **U-post**, **V-post**, and N6/N11 (Route/PSA not wired → **unclear**, not pass by omission).

It **does not** approve **SQL execution**, **Supabase connect**, **negative-test connect** for Route/PSA paths, **RLS/policy changes**, **GRANT/REVOKE**, **DML**, **test rows**, **full Q4 pass**, **N12 packet pass**, **execution packet** draft, **Gate 34B**, staging/main/production apply, **runtime/write**, **PSA publication/materialization**, or **Route Engine consumption**.

**Current MAIN state (U-post / W-post / W-Q4):** RLS **on** all **7**; FORCE **off**; **14** deny policies; aggregate rows **0**; client-role anon/auth read/write denial **PASS** (W-post); Route/PSA outcomes **not tested** / **UNCLEAR** at Tranche B; Q4 **reviewed-with-limitation** only.

**Adopting this record does NOT change NOT_READY_FOR_APPLY.** Route/PSA limitation is **not resolved** until wiring review is **performed**, **captured owner-held**, and **reviewed** in an **X-post** safe summary (or explicit owner exception recorded in a separate gate).

**Wiring review gate adopted ≠ wiring review performed ≠ Route/PSA N6 pass ≠ full Q4 pass ≠ N12 pass ≠ apply approved.**

**Primary target:** **MAIN-OWNER-USED** / **PROD** (= MAIN) only.

**STAGING-34B** is **not** approved for Route/PSA wiring proof transfer without separate parity decision. **ISOLATED-LAB** is **not** a substitute target.

This record does **not** store `project_ref`, keys, connection strings, JWT dumps, raw child/school rows, SQL output, full grant matrices, or exact session transcripts in git. It does **not** create or change `.env` configuration.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged — wiring review does **not** satisfy Q4, N12, apply, or Route/PSA activation |
| **EXECUTION_FORBIDDEN** | Unchanged for SQL apply, DDL/DML, RLS/policy apply, Gate 34B, staging/main/production apply, **writes**, **test rows**, Tranche A/B re-run, post-RLS diagnostics re-run, packet draft, **Supabase connect**, Route/PSA **negative-test** connect, and runtime/write — this gate opens **no** new connect exception |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged — N12 requires plan + evidence + **pass**; wiring review does **not** count as pass |
| **ROUTE_PSA_WIRING_REVIEW_APPROVED_BOUNDED** | Owner may proceed with **one bounded** read-only wiring review (repo/docs/specs; optional owner-held architecture notes) — **not** Supabase tests |
| **ROUTE_PSA_NEGATIVE_TEST_EXECUTION_FORBIDDEN** | **Forbidden** until this review completes **and** a **separate** execution gate approves bounded tests **only if** review finds touching paths that require N6 denial proof |
| **Q4_FULL_PASS_FORBIDDEN** | Unchanged at gate adoption — even **no-touch** wiring findings require **X-post** owner review before any partial or full Q4 advancement claim |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA publication, Route consumption, operator workflow, helper/pipeline integration beyond prior gates, Phase 3, or Phase 4 execution.

## Relationship to prior records

- **Depends on:** `phase-2-rls-main-negative-test-tranche-b-review-summary.md` (**W-post**).
- **Depends on:** `phase-2-rls-main-q4-review-owner-decision-record.md` (**W-Q4** — Q4R16 next gate).
- **Depends on:** `phase-2-rls-main-deny-posture-apply-review-summary.md` (**U-post**).
- **Depends on:** `phase-2-rls-main-diagnostics-post-rls-compatibility-review-summary.md` (**V-post**).
- **Depends on:** `phase-2-rls-negative-test-plan-owner-decision-record.md` (N6 Route/PSA rows; N11 fail/unclear = stop).
- **Depends on:** `phase-2-rls-apply-readiness-owner-decision-record.md` (Q4 — pass before apply **execution**).
- **Depends on:** `phase-2-rls-apply-preconditions-owner-decision-record.md` (C10 — product-facing paths).
- **Complements:** `phase-2-rls-policy-design-plan.md` (Route/PSA raw access deny intent).
- **Complements:** `phase-2-production-truth-owner-decision-record.md` (P10/P12 — no auto chain to Route/PSA).
- **Complements:** `phase-2-runtime-write-owner-decision-record.md` (runtime/write blocked).
- **Complements:** `docs/architecture/route-engine-master-spec.md`, `school-identity-location-resolution-phase-2-spec.md` (published-truth vs raw Phase 2 boundary).
- **Uses private target labels:** **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now** only.

**Conflict rule:** stricter checklist, N plan, W-post/W-Q4 chain, or canonical source wins; **N6 unclear rule** wins over inferring pass from client-role denial alone; **no Supabase at wiring-review gate** wins over any draft that could imply live tests now.

## This document is not

- proof that Route/PSA wiring review already ran or was reviewed
- Supabase connect or negative-test execution approval
- proof that Route or PSA **cannot** touch Phase 2 tables (until review + **X-post**)
- proof that Route or PSA **deny** raw Phase 2 access (requires separate negative-test gate when wired)
- **full Q4 pass** approval or claim
- **N12 packet pass** approval or satisfaction
- execution packet approval or drafting permission
- apply, Gate 34B, staging/main/production RLS apply
- **NOT_READY_FOR_APPLY** clearance
- PSA publication/materialization or Route consumption approval
- runtime/write, operator workflow, Phase 3/4 approval
- diagnostics/helper output treated as Route/PSA wiring proof (N9)
- service_role / SQL editor success as Route/PSA product proof (N8)
- storing secrets, raw dumps, or per-school maps in git

## Source basis

- `docs/architecture/phase-2-closure-criteria-checklist.md`
- `docs/architecture/phase-2-rls-main-q4-review-owner-decision-record.md`
- `docs/architecture/phase-2-rls-main-negative-test-tranche-b-review-summary.md`
- `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md`
- `docs/architecture/phase-2-rls-policy-design-plan.md`
- `docs/architecture/route-engine-master-spec.md`
- `docs/architecture/school-identity-location-resolution-phase-2-spec.md`
- `docs/architecture/norway-school-identity-matching-execution-plan.md`

**Conflict rule:** checklist and W-Q4 chain win on product safety; **wiring review ≠ N6 denial pass** wins over speed.

---

## Meta-rule XR0

All **Yes** decisions (XR1–XR21) adopt **MAIN Route/PSA wiring review gate** on paper and approve **one bounded read-only wiring review** only (repo/docs/specs; owner-held notes allowed).

XR1–XR21 do **not** authorize Supabase connect, SQL apply, DDL/DML, negative-test execution, packet draft, apply, runtime/write, PSA publication, Route consumption, Phase 3/4, or storing secrets/raw dumps in git.

**Child-information protection** overrides speed: do not paste raw queries, row samples, or keys into git.

---

## Priority rule (XR21)

Stricter checklist, N plan, W-post/W-Q4 chain, Q/C records, canonical Route/Phase 2 specs, or prior owner record wins on conflict; **no-touch confirmed ≠ automatic full Q4 pass**; **touching paths found → negative-test execution gate required before N6 Route/PSA pass claim**.

---

## Owner/security Route/PSA wiring review decisions (XR0–XR21)

### Decision XR0 — Scope

**Owner decision:** **Yes**. Route/PSA **wiring review** gate only — not negative-test execution, not Q4 full pass, not N12.

### Decision XR1 — Prerequisite W-post

**Owner decision:** **Yes**. Tranche B session **completed**; client-role read/write denial **PASS**; Route/PSA **UNCLEAR** at Tranche B — prerequisite satisfied for wiring review **start**.

### Decision XR2 — Prerequisite W-Q4

**Owner decision:** **Yes**. Q4 **reviewed-with-limitation**; Route/PSA limitation **recorded**; next gate identified as Route/PSA review (Q4R16).

### Decision XR3 — Prerequisite U-post / V-post

**Owner decision:** **Yes**. Deny posture applied (**U-post**); post-RLS diagnostics RLS-path **PASS** (**V-post**) — MAIN state stable for read-only wiring assessment.

### Decision XR4 — Review ≠ N6 pass

**Owner decision:** **Yes**. This gate approves **wiring determination** only. N6 rows “Route raw internal Phase 2 access denied” and “PSA/publication raw internal access denied” remain **not satisfied** until **separate** negative-test execution (when wired) or owner/security accepts a **documented bounded exception** in **X-post** (exception is **not** automatic at gate adoption).

### Decision XR5 — MAIN only

**Owner decision:** **Yes**. Review scope is **MAIN-OWNER-USED** consumption/wiring as deployed or configured for that target — not STAGING proof alone.

### Decision XR6 — Seven tables fixed

**Owner decision:** **Yes**. Wiring review covers whether Route and/or PSA touch **any** of:

`source_school_observations`, `school_identity_candidates`, `identity_aliases`, `school_locations`, `school_identity_resolution_decisions`, `programme_availability_publication_decisions`, `school_identity_review_events`.

### Decision XR7 — Review methods (read-only)

**Owner decision:** **Yes**. Approved methods: application/repo search for table names and Supabase client usage; migrations and schema references; architecture specs (Route published-truth boundary; Phase 2 non-scope for PSA/Route raw reads); deployment/config notes **owner-held**; **no** live Supabase queries required for this gate’s **minimum** charter — if owner chooses optional live metadata checks, they remain **read-only** and **owner-held**, not git.

### Decision XR8 — Route outcome taxonomy

**Owner decision:** **Yes**. Route wiring review must conclude with **one** label per **X-post**:

| Label | Meaning |
|-------|---------|
| `ROUTE_NO_TOUCH_PHASE2_TABLES_CONFIRMED` | No Route code/config path reads/writes the seven Phase 2 tables on MAIN |
| `ROUTE_TOUCHES_PHASE2_REQUIRES_NEGATIVE_TEST` | Route path touches Phase 2 tables → **stop** until separate negative-test execution gate |
| `ROUTE_WIRING_UNCLEAR_STOP` | Evidence insufficient → **stop** (N11) |

**`ROUTE_NO_TOUCH`** narrows the W-post limitation but **does not** alone claim full Q4 pass or N12.

### Decision XR9 — PSA outcome taxonomy

**Owner decision:** **Yes**. PSA/publication wiring review must conclude with **one** label per **X-post**:

| Label | Meaning |
|-------|---------|
| `PSA_NO_TOUCH_PHASE2_TABLES_CONFIRMED` | No PSA/publication path reads/writes the seven Phase 2 tables on MAIN |
| `PSA_TOUCHES_PHASE2_REQUIRES_NEGATIVE_TEST` | PSA path touches Phase 2 tables → **stop** until separate negative-test execution gate |
| `PSA_WIRING_UNCLEAR_STOP` | Evidence insufficient → **stop** (N11) |

### Decision XR10 — Published-truth vs raw tables

**Owner decision:** **Yes**. Review must distinguish **raw Phase 2 table** access from **published internal truth** surfaces (e.g. `programme_school_availability` or other publication tables). Touching **published** tables only, with **no** raw Phase 2 access, is recorded explicitly in **X-post** — it does **not** substitute for N6 denial on raw Phase 2 paths unless owner/security documents that scope split in review.

### Decision XR11 — Roles and paths documented

**Owner decision:** **Yes**. When touching is found, charter and **X-post** must record **path class** (e.g. server API, edge function, direct Supabase client, batch job) and **role** (e.g. anon, authenticated, service_role) at **safe-summary** level — no secrets in git.

### Decision XR12 — N6 unclear rule preserved

**Owner decision:** **Yes**. “Not tested in Tranche B” remains **UNCLEAR** until this review assigns a taxonomy label. **Absence of evidence** in repo search → `*_WIRING_UNCLEAR_STOP`, not silent pass.

### Decision XR13 — Diagnostics/helper boundary

**Owner decision:** **Yes**. Approved diagnostics consumer scope (**V-post**) does **not** prove Route/PSA wiring. Helper may be cited only to show **contract-bounded** reads — not Route/PSA integration proof.

### Decision XR14 — Owner-held charter required before review

**Owner decision:** **Yes**. Filled charter from `phase-2-rls-main-route-psa-wiring-review-charter-template.md` is **owner-held** (not required in git) before review starts; charter ID cited in **X-post**.

### Decision XR15 — One bounded review cycle

**Owner decision:** **Yes**. **One** wiring review cycle per gate adoption (or same-day continuation with owner note owner-held). Repeat scope requires new gate adoption or explicit amendment gate.

### Decision XR16 — Future negative-test gate separate

**Owner decision:** **Yes**. If `*_TOUCHES_PHASE2_REQUIRES_NEGATIVE_TEST`, only a **separate future** Route/PSA negative-test **execution** gate may approve bounded Supabase/API tests — **not** this gate.

### Decision XR17 — No packet / apply / runtime

**Owner decision:** **Yes**. Wiring review gate does **not** approve execution packet, Gate 34B, staging/main apply, runtime/write, PSA publication, or Route activation.

### Decision XR18 — Git storage posture

**Owner decision:** **Yes**. Git: this gate record; optional **X-post** safe summary after review. Detailed search notes, config excerpts with secrets, and live query output remain **owner-held**.

### Decision XR19 — Role labels only

**Owner decision:** **Yes**. **OWNER** / **SECURITY_APPROVER** / **TECH_PLANNER** role labels in git; human names/emails owner-held.

### Decision XR20 — STAGING / LAB

**Owner decision:** **Yes**. STAGING-34B and ISOLATED-LAB do **not** satisfy MAIN wiring review without explicit parity/transfer gate.

### Decision XR21 — Priority and timebox

**Owner decision:** **Yes**. Stricter child-data and N11 stop rules win; one bounded review cycle; conflict resolution per meta-rule XR0.

---

## Approved review boundary table

| Parameter | Approved value |
|-----------|----------------|
| Target | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |
| Work type | **Route/PSA wiring review** (read-only) |
| Tables in scope | **Seven** Phase 2 tables (XR6) |
| Supabase connect | **None** at gate adoption |
| Negative-test execution | **None** — future gate only if required |
| Tranche B re-run | **Not** approved |
| DML / test rows | **Not** approved |
| Charter | **Owner-held** before review |
| Git after review | **X-post** safe summary optional |
| Q4 full pass | **No** at gate adoption |
| N12 packet pass | **No** |
| NOT_READY_FOR_APPLY | **Unchanged** |

---

## What this closes / does not close

| Closes / approves | Does not close |
|-------------------|----------------|
| Owner adoption of bounded **MAIN Route/PSA wiring review** gate (XR0–XR21) | Wiring review **performed** or **reviewed** |
| W-post + W-Q4 prerequisites for review **start** | Route/PSA N6 denial **pass** |
| Outcome taxonomy and N6/N11 linkage defined | **Full Q4 pass** |
| Separate negative-test path identified when touching found | **N12 packet pass** |
| | Execution packet / apply |
| | Runtime/write, PSA publication, Route consumption |
| | **NOT_READY_FOR_APPLY** clearance |

---

## Archive table (XR0–XR21)

| ID | Summary | Owner | Status | Notes |
|----|---------|-------|--------|-------|
| XR0 | Wiring review scope | Yes | Adopted | Not negative-test execution |
| XR1 | Prerequisite W-post | Yes | Adopted | Client-role PASS |
| XR2 | Prerequisite W-Q4 | Yes | Adopted | Limitation recorded |
| XR3 | Prerequisite U/V-post | Yes | Adopted | MAIN stable |
| XR4 | Review ≠ N6 pass | Yes | Adopted | Critical |
| XR5 | MAIN only | Yes | Adopted | Primary |
| XR6 | Seven tables | Yes | Adopted | Fixed scope |
| XR7 | Read-only methods | Yes | Adopted | Repo/docs |
| XR8 | Route taxonomy | Yes | Adopted | Three labels |
| XR9 | PSA taxonomy | Yes | Adopted | Three labels |
| XR10 | Published vs raw | Yes | Adopted | Scope split |
| XR11 | Path/role notes | Yes | Adopted | Safe summary |
| XR12 | N6 unclear preserved | Yes | Adopted | N11 |
| XR13 | Diagnostics boundary | Yes | Adopted | V-post |
| XR14 | Owner-held charter | Yes | Adopted | Template in repo |
| XR15 | One cycle | Yes | Adopted | Timebox |
| XR16 | Future test gate | Yes | Adopted | If touching |
| XR17 | No packet/apply | Yes | Adopted | N12/Q4 |
| XR18 | Storage posture | Yes | Adopted | No secrets |
| XR19 | Role labels | Yes | Adopted | No PII in git |
| XR20 | STAGING/LAB | Yes | Adopted | Not MAIN proof |
| XR21 | Priority | Yes | Adopted | Child-data first |

---

## Recommended next gate (informational only)

**Operational next step (outside this file):** perform **one bounded** owner-held wiring review per charter; publish **X-post** safe summary; then:

- If `*_NO_TOUCH_PHASE2_TABLES_CONFIRMED` for both Route and PSA → owner/security **X-post** review whether limitation is **narrowed** enough for partial Q4 advancement (still **not** automatic full Q4 pass).
- If `*_TOUCHES_PHASE2_REQUIRES_NEGATIVE_TEST` → adopt **separate** Route/PSA negative-test **execution** gate before N6 Route/PSA pass claims.
- If `*_WIRING_UNCLEAR_STOP` → **stop** (N11); no N12 / packet / runtime/write discussion.

N12 / execution packet / runtime-write remain **blocked** until Route/PSA limitation is **resolved or owner/security records a safe bounded exception** per W-Q4.

---

## Final boundary statement

Phase 2 RLS **MAIN Route/PSA wiring review gate** is owner-adopted in this record (XR0–XR21). **`RLS_MAIN_ROUTE_PSA_WIRING_REVIEW_GATE_ADOPTED_BOUNDED`** approves **bounded read-only wiring review only** on **MAIN**. **Wiring review is not performed at gate adoption.** **Route/PSA N6 denial is not claimed.** **Full Q4 pass is not claimed.** **N12 packet pass is not claimed.** **Apply, packet, Supabase connect for tests, and runtime/write remain forbidden.** **NOT_READY_FOR_APPLY** and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged.
