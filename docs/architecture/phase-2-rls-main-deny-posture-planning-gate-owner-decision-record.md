# Phase 2 RLS MAIN Deny-Posture Planning Gate Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **MAIN deny-posture planning** gate — **NOT_READY_FOR_APPLY** / **no** SQL / **no** Supabase apply / Tranche B **not** approved |
| **Closure label** | `RLS_MAIN_DENY_POSTURE_PLANNING_GATE_ADOPTED_BOUNDED` |
| **Scope** | **Planning only** — bounded deny-posture planning on **MAIN-OWNER-USED** (DP0–DP21); **deny posture apply execution not approved** |
| **Date (UTC)** | 2026-05-19 |
| **Repository checkpoint** | `0f943a8 Add Phase 2 RLS MAIN Tranche A exposure review summary` |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section **T** (RLS MAIN deny-posture planning gate) |

This record adopts **bounded deny-posture planning** for **MAIN-OWNER-USED** only. It defines **what must be decided on paper** before any **future** deny-posture **apply execution** gate may be chartered.

It **does not** approve **SQL execution**, **Supabase apply**, **RLS enablement**, **policy creation**, **GRANT/REVOKE** changes, **deny posture apply** on any target, **Tranche B** (`Q4_BLOCKING_DENY_PASS`), **write-denial tests**, **DML**, **test rows**, **Q4-blocking pass**, **N12 packet pass**, **execution packet** draft, **post-RLS diagnostics compatibility pass** execution, **Gate 34B**, staging/main/production apply, or **runtime/write**.

It **follows** completed MAIN Tier 1 snapshot + review (`phase-2-rls-main-snapshot-capture-review-summary.md`, PASS_WITH_SECURITY_FINDINGS), MAIN pre-RLS diagnostics baseline + review (`phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md`, PASS_BASELINE_CAPTURED), and MAIN Tranche A exposure inventory + review (`phase-2-rls-main-tranche-a-exposure-inventory-review-summary.md`, PASS_WITH_EXPOSURE_FINDINGS).

**Current MAIN state (Q-post / R-post / S-post):** RLS **off**; FORCE **off**; **0** policies; **anon/authenticated grants present** on all **7** Phase 2 tables; aggregate rows **0**; exposure findings on all **7**; Route/PSA wiring **not checked** in Tranche A.

**Adopting this record does NOT change NOT_READY_FOR_APPLY.** Deny posture is **not applied** until a **separate future** deny-posture **apply execution** gate approves bounded DDL on MAIN.

**Planning gate adopted ≠ deny posture planned in owner-held detail ≠ deny posture applied ≠ Q4 pass ≠ Tranche B approved ≠ apply approved.**

**Primary target:** **MAIN-OWNER-USED** / **PROD** (**PROD = MAIN-OWNER-USED for now**) — **only** target for planning scope of this gate.

**STAGING-34B** is **not** approved for deny-posture apply by this gate. **ISOLATED-LAB** is **not** a substitute target.

This record does **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, JWT dumps, raw child/school rows, per-school resolution maps, full grant matrices, executable SQL bundles, policy implementation dumps, or exact session transcripts in git. It does **not** create or change `.env` configuration.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged — planning does **not** satisfy Q4, N12, compatibility pass, or apply preconditions operationally |
| **EXECUTION_FORBIDDEN** | Unchanged for SQL apply, DDL/DML, RLS/policy apply, GRANT/REVOKE, Gate 34B execution, staging/main/production apply, **writes**, **write-denial tests**, **test rows**, Tranche B execution, STAGING connect, post-RLS diagnostics compatibility **pass** execution, execution packet draft, and all Supabase work — this planning gate opens **no** new connect or apply exception |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged — N12 requires plan + snapshot evidence + **pass**; deny-posture planning does **not** count as pass |
| **DENY_POSTURE_PLANNING_APPROVED_BOUNDED** | Owner may proceed with **owner-held** deny-posture planning work (option review, SQL human review prep, rollback sketch, apply-execution gate charter prep) — **not** live apply |
| **DENY_POSTURE_APPLY_EXECUTION_FORBIDDEN** | **Forbidden** until **separate** owner/security **apply execution** gate after this planning gate + owner-held planning review |
| **TRANCHE_B_Q4_BLOCKING_DENY_PASS_FORBIDDEN** | **Forbidden** until verifiable deny posture **exists on MAIN** **and** a **separate** Tranche B execution gate — unchanged from NT/S-post chain |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Depends on:** `docs/architecture/phase-2-rls-main-snapshot-capture-review-summary.md` (Q-post — Tier 1; good-restored-state values owner-held).
- **Depends on:** `docs/architecture/phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md` (R-post — pre-RLS baseline only).
- **Depends on:** `docs/architecture/phase-2-rls-main-tranche-a-exposure-inventory-review-summary.md` (S-post — Tranche A performed; exposure on all 7).
- **Depends on:** `docs/architecture/phase-2-rls-main-negative-test-execution-gate-owner-decision-record.md` (NT — Tranche A gate; Tranche B future-only).
- **Complements:** `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` (N0–N16 — Tranche B / write-denial context).
- **Complements:** `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` (Q4 — pass required before apply **execution**; not satisfied here).
- **Complements:** `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` (C7 good restored state; C9–C10 tests; C11 diagnostics; C12 high-privilege; C13 FORCE deferred).
- **Complements:** `docs/architecture/phase-2-rls-force-rls-owner-decision-record.md` (F0–F18 — **first apply: FORCE excluded**).
- **Complements:** `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` (D0–D20 — post-RLS pass remains separate execution).
- **Complements:** `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` (executor/approver/rollback role labels).
- **Complements:** `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` (S5 Tier 2; S12 packet relationship).
- **Complements:** `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` (T6/T9 — physical map; MAIN clutter).
- **Complements:** `docs/architecture/phase-2-rls-security-owner-decision-record.md` (deny-by-default posture).
- **Reference (review only — not executable):** `docs/architecture/phase-2-rls-policy-sql-draft.md` (Option A / Option B candidates).
- **Reference (review only):** `docs/architecture/phase-2-rls-sql-human-security-review-packet.md`, `docs/architecture/phase-2-rls-policy-design-plan.md`.
- **Uses private target labels:** **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now** only for this gate.
- **Conflict rule:** stricter checklist, N plan, NT/S-post chain, or canonical source wins; canonical sources win over owner records; **this gate’s planning-only / no-apply-now boundary wins** over any draft SQL wording that could imply permission to run SQL.

## This document is not

- proof that deny-posture planning already completed or was reviewed
- SQL approval or execution
- Supabase connect or **apply** approval
- proof that deny posture **exists** or is **applied** on MAIN
- approval to run `phase-2-rls-policy-sql-draft.md` or paste SQL into Supabase
- **deny posture apply execution** approval (requires **separate future** gate)
- **Tranche B** execution or chartering approval
- **write-denial test** approval (anonymous/auth/app write attempts, etc.)
- **DML** or **test row** approval
- **Q4-blocking pass** approval or claim
- **N12 packet pass** approval or satisfaction
- proof that **RLS is safe** or production-ready
- **apply readiness** or **NOT_READY_FOR_APPLY** clearance
- post-RLS diagnostics compatibility **pass** approval or execution
- execution packet approval or drafting permission
- Gate 34B / staging / main / production **apply** approval
- STAGING-34B deny-posture apply approval
- ISOLATED-LAB proof transferred to MAIN
- diagnostics/helper pass treated as family security proof (N9)
- service_role / SQL editor / BYPASSRLS success treated as product proof (N8)
- approval to store executor/reviewer **real names or emails** in git (role labels only — DP19)
- runtime/write, PSA, Route, operator, Phase 3/4 approval
- cleanup, migration, new-project approval
- Tier 2 snapshot **collection** execution (planning may require complete/defer label only)

## Source basis

- `docs/architecture/phase-2-closure-criteria-checklist.md`
- `docs/architecture/phase-2-rls-main-tranche-a-exposure-inventory-review-summary.md`
- `docs/architecture/phase-2-rls-main-negative-test-execution-gate-owner-decision-record.md`
- `docs/architecture/phase-2-rls-main-snapshot-capture-review-summary.md`
- `docs/architecture/phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md`
- `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md`
- `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md`
- `docs/architecture/phase-2-rls-force-rls-owner-decision-record.md`
- `docs/architecture/phase-2-rls-policy-sql-draft.md` (reference only)

**Conflict rule:** checklist and S-post/NT chain win on product safety; **planning-only / no SQL now** wins over policy-draft illustrative SQL.

---

## Meta-rule DP0

All **Yes** decisions (DP1–DP21) adopt **MAIN deny-posture planning gate** on paper and approve **bounded owner-held planning work** only.

DP1–DP21 do **not** authorize SQL apply, DDL/DML, RLS enablement, policy creation, GRANT/REVOKE, deny posture apply on MAIN or any target, Tranche B, write-denial tests, DML, test rows, Gate 34B, staging apply, main apply, production apply, execution packet draft, new Supabase connect for apply/tests, post-RLS diagnostics pass execution, runtime/write, PSA, Route, Phase 3/4, cleanup, migration, or storing secrets/raw dumps in git.

**Child-information protection** overrides speed for option review, rollback design, and any future apply charter.

---

## Priority rule (DP21)

Stricter checklist, NT/S-post chain, N plan, Q/C records, F record, canonical diagnostics contract/helper ADR, or prior owner record wins on conflict; **planning-only / no-apply-now / no-Tranche-B-until-deny-applied** wins over speed.

---

## Owner/security deny-posture planning gate decisions (DP0–DP21)

### Decision DP0 — Scope of this record

**Owner decision:** **Yes**.

**Policy meaning:** This record is the **planning gate** for **bounded deny-posture planning on MAIN** — not the negative-test **plan** (N record) alone, not Tranche A execution (NT/S-post), not deny-posture **apply execution**, not Tranche B.

**What remains blocked:** Treating planning adoption as permission to run SQL; Tranche B chartering; implicit apply approval.

---

### Decision DP1 — Prerequisite: MAIN Tier 1 snapshot + review complete

**Owner decision:** **Yes**.

**Policy meaning:** Gate adopted only after MAIN Tier 1 bounded snapshot capture and **OWNER** / **SECURITY_APPROVER** review per `phase-2-rls-main-snapshot-capture-review-summary.md` (PASS_WITH_SECURITY_FINDINGS). Good-restored-state **values** remain **owner-held** per Q-post.

**What remains blocked:** Deny-posture planning without per-target snapshot evidence chain on MAIN.

---

### Decision DP2 — Prerequisite: MAIN pre-RLS diagnostics baseline + review complete

**Owner decision:** **Yes**.

**Policy meaning:** Gate adopted only after MAIN pre-RLS diagnostics baseline capture and review per `phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md` (PASS_BASELINE_CAPTURED). Pre-RLS baseline is the **before** reference for future post-RLS compatibility pass — **not** a substitute for deny posture or Q4 pass.

**What remains blocked:** Baseline → apply-ready shortcut; post-RLS pass claimed here.

---

### Decision DP3 — Prerequisite: MAIN Tranche A exposure inventory + review complete

**Owner decision:** **Yes**.

**Policy meaning:** Gate adopted only after Tranche A read-only exposure inventory and review per `phase-2-rls-main-tranche-a-exposure-inventory-review-summary.md` (PASS_WITH_EXPOSURE_FINDINGS). Exposure on all **7** tables with rows **0** informs planning; it **does not** remove need for deny posture or future Tranche B.

**What remains blocked:** Planning without S-post; claiming exposure review = Q4 pass or deny posture applied.

---

### Decision DP4 — Planning gate adopted ≠ deny posture applied

**Owner decision:** **Yes**.

**Policy meaning:** Adopting DP0–DP21 **approves planning work** only; it does **not** mean deny posture exists on MAIN, was applied, or was operationally verified.

**What remains blocked:** “Planning adopted” → SQL run; Q4 pass; Tranche B now.

---

### Decision DP5 — MAIN-OWNER-USED only for this planning scope

**Owner decision:** **Yes**.

**Policy meaning:** Deny-posture planning under this gate addresses **MAIN-OWNER-USED** / **PROD** (= MAIN) **only**. Staging rehearsal remains a **separate** track if ever used.

**What remains blocked:** STAGING substituting MAIN planning approval; LAB → MAIN shortcut.

---

### Decision DP6 — STAGING not approved by this planning gate

**Owner decision:** **Yes**.

**Policy meaning:** **STAGING-34B** deny-posture apply or test execution requires **separate** future gates. Optional staging rehearsal does **not** satisfy MAIN planning or MAIN apply prerequisites (N16 / P record).

**What remains blocked:** STAGING evidence as MAIN approval.

---

### Decision DP7 — ISOLATED-LAB excluded as MAIN proof

**Owner decision:** **Yes**.

**Policy meaning:** Historical isolated-lab Option B evidence **may inform review discussion owner-held** but **must not** be copied as MAIN deny-posture proof or Q4 pass (N5, Q3).

**What remains blocked:** Lab → MAIN apply or Tranche B shortcut.

---

### Decision DP8 — Seven Phase 2 tables in scope

**Owner decision:** **Yes**.

**Policy meaning:** Planning scope covers exactly the **seven** Phase 2 tables on MAIN per rollout/migration checklist:

1. `source_school_observations`
2. `school_identity_candidates`
3. `identity_aliases`
4. `school_locations`
5. `school_identity_resolution_decisions`
6. `programme_availability_publication_decisions`
7. `school_identity_review_events`

**No** expansion to non–Phase 2 tables without **separate** owner gate.

**What remains blocked:** Ad-hoc table scope creep in future apply bundle without new gate.

---

### Decision DP9 — Option A vs Option B must be resolved before apply execution gate

**Owner decision:** **Yes**.

**Policy meaning:** Before any **future** deny-posture **apply execution** gate on MAIN, **OWNER** / **SECURITY_APPROVER** must record (owner-held; safe summary in git later if needed) a **single selected posture** among review candidates in `phase-2-rls-policy-sql-draft.md`:

| Option | Summary | Planning notes |
|--------|---------|----------------|
| **A** | `ENABLE ROW LEVEL SECURITY` + **zero permissive** policies for `anon` / `authenticated` | Must be validated for **all command types** and Supabase/Postgres version semantics |
| **B** | RLS enabled + **explicit** `USING (false)` / `WITH CHECK (false)` deny policies for `anon` and `authenticated` on each table | Deny intent visible in catalog; reviewer must confirm policy-combination semantics |

**Neither A nor B is approved for execution by this planning gate.** This planning gate may adopt with **option selection deferred** only if owner-held notes record **explicit blockers** and **review owner** — but **apply execution gate is blocked** until selection is closed.

**Default planning bias (non-binding):** Option **B** aligns with isolated-lab precedent and draft SQL structure — **does not** auto-approve Option B for execution.

**What remains blocked:** Running draft SQL; treating draft file as migration; executing without human SQL security review.

---

### Decision DP10 — First apply: FORCE excluded

**Owner decision:** **Yes**.

**Policy meaning:** Per F0–F18 and Q5/C13, any **future first** deny-posture apply bundle on MAIN **excludes** `FORCE ROW LEVEL SECURITY`. FORCE enablement requires **separate** future gate per target with owner-held bypass/table-owner analysis.

**What remains blocked:** FORCE in first apply bundle; uncommenting FORCE lines from draft SQL without F-gate.

---

### Decision DP11 — Grants posture is a required planning topic

**Owner decision:** **Yes**.

**Policy meaning:** S-post documents **anon/authenticated grants present** on all 7 tables with RLS off. Planning must address whether future posture is:

- **deny policies only** (RLS on + explicit denies), and/or
- **GRANT/REVOKE** changes,

with explicit **OWNER** / **SECURITY_APPROVER** review of bypass/high-privilege paths (C12, N8). **GRANT/REVOKE execution** remains **forbidden** until **separate apply execution** gate — not approved here.

**What remains blocked:** Assuming grants disappear when RLS enabled without verification plan; GRANT/REVOKE under this planning gate.

---

### Decision DP12 — Rollback and good-restored-state linkage

**Owner decision:** **Yes**.

**Policy meaning:** Before any **future** apply execution gate is chartered, owner-held planning must define rollback triggers and **good restored state** for MAIN, **linked** to Q-post owner-held baseline values (RLS off, FORCE off, 0 policies, grants-present state documented safely). Concrete rollback SQL belongs in a **future execution artifact**, not in this planning gate.

**Rollback triggers (planning minimum):** failed Tranche B; failed write-denial tests; post-RLS diagnostics FAIL/UNCLEAR; unexpected exposure/leak signal; **OWNER** or **SECURITY_APPROVER** stop.

**What remains blocked:** Apply scheduling without rollback owner/triggers; storing rollback SQL with secrets in git.

---

### Decision DP13 — Required planning outputs (owner-held default)

**Owner decision:** **Yes**.

**Policy meaning:** Approved planning work may produce **owner-held** artifacts only:

1. Selected Option **A or B** (or documented defer with blockers)
2. Human SQL security review notes (may reference `phase-2-rls-sql-human-security-review-packet.md` process)
3. High-privilege / bypass checklist outcome labels (no dumps in git)
4. Rollback sketch + good-restored-state linkage to Q-post
5. Draft charter outline for **future** deny-posture **apply execution** gate (separate adoption — not SQL execution under this gate)
6. Tier 2 label per DP14

Git may later record **safe summary only** under a separate **T-post** safe summary — **not** required for planning gate adoption.

**What remains blocked:** Raw SQL bundles, grant matrices, keys, row samples in git.

---

### Decision DP14 — Tier 2 snapshot: plan, complete, or defer explicitly

**Owner decision:** **Yes**.

**Policy meaning:** Q-post marks Tier 2 **not closed**. This planning gate requires an explicit owner label:

| Label | Meaning |
|-------|---------|
| **TIER2_COMPLETE_BEFORE_APPLY** | Tier 2 owner-held capture done before apply execution gate |
| **TIER2_DEFERRED_WITH_BOUNDED_RATIONALE** | Tier 2 deferred with written rationale; apply execution gate must cite defer and risks |
| **TIER2_REQUIRED_BEFORE_PACKET** | Defer only until packet discussion — per S5 stricter path |

Planning adoption **does not** execute Tier 2 capture.

**What remains blocked:** Silent Tier 2 skip without label.

---

### Decision DP15 — Post-RLS diagnostics compatibility pass remains separate

**Owner decision:** **Yes**.

**Policy meaning:** After any future deny-posture apply on MAIN, post-RLS diagnostics compatibility **pass** requires **separate execution gate** per D record (R-post does **not** substitute).

**What remains blocked:** Planning → diagnostics pass claim; helper as go-live proof.

---

### Decision DP16 — Tranche B still future-only; requires deny posture on MAIN first

**Owner decision:** **Yes**.

**Policy meaning:** Tranche B (`Q4_BLOCKING_DENY_PASS`) remains **forbidden** until:

1. Deny posture is **verifiable on MAIN** (after **separate apply execution** gate + owner-held verification), **and**
2. **Separate** Tranche B execution gate is adopted.

This planning gate **enables discussion** of future Tranche B charter **only**; it does **not** approve Tranche B session.

**What remains blocked:** Tranche B now; Q4 pass before Tranche B execution + review.

---

### Decision DP17 — Write-denial tests and Route/PSA labels remain future-only

**Owner decision:** **Yes**.

**Policy meaning:** N6 write-denial matrix is **not** approved under this planning gate. Write attempts, DML, and test rows remain **forbidden** until **separate** write-denial / Tranche B execution gates.

S-post: Route/PSA wiring **not checked**. Planning must record owner-held labels:

- **NOT_WIRED**
- **WIRED_READ_PATH_UNCHECKED**
- **IN_SCOPE_FOR_FUTURE_TRANCHE_B**

**No** pass claim from planning. Tranche A did not certify Route/PSA deny behavior.

**What remains blocked:** Write tests under this gate; Route/PSA pass by omission.

---

### Decision DP18 — No unlock of packet, apply, Tranche B, or writes

**Owner decision:** **Yes**.

**Policy meaning:** This gate does **not** approve execution packet draft (N12), Gate 34B, staging/main/production apply, deny posture **apply**, runtime/write, Tranche B, write-denial tests, DML, or test rows. Deny-posture planning **does not** satisfy N12 or Q4.

**What remains blocked:** Planning adoption → apply/packet/Tranche B/write-test chain.

---

### Decision DP19 — Role labels in git; no secrets in repo

**Owner decision:** **Yes**.

**Policy meaning:**

- **In git (RLS gate docs only):** **role labels** only — e.g. **TECH_PLANNER**, **OWNER**, **SECURITY_APPROVER**, **SQL_REVIEWER**.
- **Owner-held outside git:** real human **names and emails** when needed.
- **Product database contour:** This gate does **not** restrict **user emails** in the **product database** under separate product policy (NT17/SE17/BL17 pattern).

Planning uses credentials and detailed targets **outside git**.

**What remains blocked:** Personal emails in architecture git; `.env`, service keys, connection strings in repository.

---

### Decision DP20 — MAIN clutter (T9) does not block planning

**Owner decision:** **Yes**.

**Policy meaning:** MAIN SQL clutter does **not** cancel deny-posture **planning** on Phase 2 tables. Cleanup/migration feasibility remains **separate** read-only audit if needed before apply.

**What remains blocked:** Cleanup/migration approved here.

---

### Decision DP21 — Stricter rule wins; one bounded planning cycle

**Owner decision:** **Yes**.

**Policy meaning:** On conflict, stricter child-data / no-apply-now / no-Tranche-B-until-deny-on-MAIN rule wins. **One** bounded planning cycle per gate adoption (or same-day continuation by same **TECH_PLANNER** with owner note owner-held). Repeat planning scope requires **new** planning gate adoption or explicit owner amendment gate.

**What remains blocked:** Weakening planning or storage rules; indefinite standing planning approval without review.

---

## Approved planning boundary table

| Parameter | Approved value |
|-----------|----------------|
| Target | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |
| Work type | **Deny-posture planning** only (owner-held default) |
| Tables in scope | **Seven** Phase 2 tables (DP8) |
| SQL execution | **None** |
| Supabase apply | **None** |
| Option A / B selection | Required before **apply execution** gate; may defer at planning adoption with blockers documented owner-held |
| FORCE on first apply | **Excluded** |
| Tranche B | **Future-only** — after deny posture on MAIN + separate gate |
| Write-denial tests | **Future-only** |
| DML / test rows | **Not approved** |
| Post-RLS diagnostics pass | **Separate future execution gate** |
| Storage of planning | **Owner-held** default |
| Git under this gate | This record only; future T-post safe summary optional |
| STAGING apply | **Not** approved |
| Repeat planning scope | New gate adoption required |
| Q4-blocking pass | **No** |
| N12 packet pass | **No** |
| NOT_READY_FOR_APPLY | **Unchanged** |

---

## What this closes / does not close

| Closes / approves | Does not close |
|-------------------|----------------|
| Owner adoption of bounded **MAIN deny-posture planning** gate (DP0–DP21) | Deny posture **applied** on MAIN |
| Prerequisites Q-post + R-post + S-post satisfied for **planning** start | **Deny posture apply execution** |
| Option A/B review path defined (DP9) | Option **executed** on MAIN |
| FORCE excluded from **first** apply bundle (planning) | FORCE enabled |
| Rollback/good-state **planning** requirements (DP12) | Rollback SQL artifact executed |
| Tranche B / write-denial remain **future-only** (DP16–DP17) | **Tranche B** gate or session |
| Tier 2 defer/complete label required (DP14) | Tier 2 automatically complete |
| Role-label git posture (DP19) | **Q4 pass** |
| | **N12 packet pass** |
| | Post-RLS diagnostics **pass** (execution) |
| | Execution packet / apply |
| | Runtime/write, PSA, Route, Phase 3/4 |
| | **NOT_READY_FOR_APPLY** clearance |

---

## Archive table (DP0–DP21)

| ID | Summary | Owner | Status | Notes |
|----|---------|-------|--------|-------|
| DP0 | Planning gate scope | Yes | Adopted | Not apply execution |
| DP1 | Prerequisite Q-post | Yes | Adopted | Tier 1 |
| DP2 | Prerequisite R-post | Yes | Adopted | Pre-RLS only |
| DP3 | Prerequisite S-post | Yes | Adopted | Tranche A done |
| DP4 | Planning ≠ applied | Yes | Adopted | Critical |
| DP5 | MAIN only | Yes | Adopted | Primary |
| DP6 | STAGING separate | Yes | Adopted | Optional track |
| DP7 | LAB excluded | Yes | Adopted | N5 |
| DP8 | Seven tables | Yes | Adopted | Fixed scope |
| DP9 | Option A/B path | Yes | Adopted | Draft reference |
| DP10 | FORCE excluded first apply | Yes | Adopted | F record |
| DP11 | Grants topic | Yes | Adopted | S-post grants |
| DP12 | Rollback linkage | Yes | Adopted | Q-post GRS |
| DP13 | Owner-held outputs | Yes | Adopted | No raw SQL in git |
| DP14 | Tier 2 label | Yes | Adopted | Complete/defer |
| DP15 | Post-RLS pass separate | Yes | Adopted | D record |
| DP16 | Tranche B future | Yes | Adopted | After deny on MAIN |
| DP17 | Writes + Route/PSA | Yes | Adopted | N6 deferred |
| DP18 | No packet/apply/B | Yes | Adopted | N12/Q4 |
| DP19 | Labels; no secrets | Yes | Adopted | NT17 pattern |
| DP20 | T9 clutter OK | Yes | Adopted | Planning only |
| DP21 | Priority + timebox | Yes | Adopted | One cycle |

---

## Recommended next gate (informational only)

**Operational next step (outside this file):** **deny-posture apply execution** gate adopted at docs level per `phase-2-rls-main-deny-posture-apply-execution-gate-owner-decision-record.md` (Section **U**, DA0–DA21, 2026-05-19) — **filled owner-held charter** required before connect; apply session **not** executed by that adoption alone.

**Must not** run draft SQL, charter Tranche B, or claim Q4/N12/apply ready under this planning gate.

**NOT_READY_FOR_APPLY** and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged after planning gate adoption.

Candidate **future** gates (separate selection): deny-posture **apply execution** gate; planning review **T-post** safe summary; **Tranche B** execution gate (after deny posture on MAIN); write-denial test execution gate; post-RLS diagnostics pass execution gate; Tier 2 capture if not deferred.

SQL apply, Gate 34B, staging/main/production apply, packet draft, Tranche B, write-denial tests, post-RLS diagnostics pass execution, runtime/write, PSA, Route, Phase 3/4 remain **forbidden** until separate gates.

---

## Final boundary statement

**Owner policy (2026-05-19):** MAIN diagnostics pre-RLS baseline capture + review per `phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md` — PASS_BASELINE_CAPTURED; **not** post-RLS compatibility pass; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-19):** MAIN Tier 1 snapshot capture + review per `phase-2-rls-main-snapshot-capture-review-summary.md` — PASS_WITH_SECURITY_FINDINGS; RLS off; FORCE off; 0 policies; anon/authenticated grants present; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-19):** MAIN Tranche A read-only exposure inventory completed and owner-reviewed as **PASS_WITH_EXPOSURE_FINDINGS** per `phase-2-rls-main-tranche-a-exposure-inventory-review-summary.md` — exposure findings on all 7 Phase 2 tables; rows all 0; Q4/N12 pass not claimed; Tranche B/write attempts not approved; **NOT_READY_FOR_APPLY** unchanged.

Phase 2 RLS **MAIN deny-posture planning gate** is owner-adopted in this record (DP0–DP21). **`RLS_MAIN_DENY_POSTURE_PLANNING_GATE_ADOPTED_BOUNDED`** approves **bounded owner-held planning only** on **MAIN**. **Deny posture is not applied.** **Tranche B is not approved.** **Write attempts, DML, test rows, and write-denial tests are not approved.** **Q4 pass is not claimed.** **N12 packet pass is not claimed.** **Apply, packet, RLS changes, and runtime/write remain forbidden.** **Planning gate adopted ≠ deny posture applied ≠ Q4 pass ≠ apply approved.** Gate 34B, staging apply, main RLS apply, production apply, runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 remain **blocked** until **separate** owner-approved gates.
