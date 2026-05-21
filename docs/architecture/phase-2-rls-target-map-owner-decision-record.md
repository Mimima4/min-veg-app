# Phase 2 RLS Target Map Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner/security target-map decision record — **NOT_READY_FOR_APPLY** / **EXECUTION_FORBIDDEN** / **EXECUTION_PACKET_DRAFT_FORBIDDEN** |
| **Closure label** | `RLS_TARGET_MAP_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | RLS physical target map documentation only (private labels; no secrets in git) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `4f6fdb6 Add Phase 2 RLS apply preconditions owner decision record` (from `git log -1 --oneline` at record creation) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section H (RLS target map policy) |

This file records **owner-agreed RLS physical target-map policy** at **documentation level only** using **safe private labels** (`ISOLATED-LAB`, `STAGING-34B`, `MAIN-OWNER-USED`, `PROD`). It does **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, or secrets. It does **not** create or change `.env` configuration. These labels are **owner/security documentation labels only** — **not** runtime truth and **not** application configuration.

**Adopting this record does NOT change NOT_READY_FOR_APPLY, EXECUTION_FORBIDDEN, or EXECUTION_PACKET_DRAFT_FORBIDDEN.** It resolves **documentation-level** target-map ambiguity from preconditions C1 at **private-label** level only; it does **not** satisfy operational preconditions (executor/approver/rollback naming, passing negative tests, per-target snapshots, parity evidence, cleanup/migration decisions).

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged — operational preconditions beyond target labels remain **not** satisfied |
| **EXECUTION_FORBIDDEN** | Unchanged — SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply remain **forbidden** |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged — no execution packet until **separate** gate after operational preconditions |
| **RLS_TARGET_MAP_POLICY_ADOPTED_DOCS_ONLY** | Target-map rules and private labels logged on paper only; does **not** mean apply is safe or ready |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Complements:** `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` (C0–C16) — operationalizes C1 target-map requirements at owner-confirmed label level; does **not** replace C decisions.
- **Complements:** `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` (Q0–Q15), `docs/architecture/phase-2-rls-security-owner-decision-record.md`, four Phase 2 policy owner records (evidence, governance, production truth, runtime/write).
- **Reference:** `docs/architecture/phase-2-staging-rls-execution-decision.md` (Gate 32 — historical staging/owner-used planning context; **superseded for physical map** by owner decisions T3–T6 in this record where they differ).
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
- approval to run migration/cleanup feasibility work (that requires a **separate** read-only audit gate)

## Source basis

The following repository documents govern or contextualize this record:

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist
- `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` — preconditions policy (complementary)
- `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` — readiness policy (complementary)
- `docs/architecture/phase-2-rls-apply-readiness-security-decision.md` — Gate 30 planning posture (reference)
- `docs/architecture/phase-2-rls-security-owner-decision-record.md` — RLS security policy
- `docs/architecture/phase-2-staging-rls-execution-decision.md` — Gate 32 staging decision (reference)
- `docs/architecture/phase-2-staging-rls-execution-packet.md` — Gate 34A/34B artifacts (reference; **not** execution)
- `docs/architecture/phase-2-isolated-test-rls-evidence-record.md` — isolated lab evidence (**not** main approval)
- `docs/architecture/phase-2-main-supabase-rollout-checklist.md` — main schema-only rollout (reference)
- `docs/architecture/phase-2-runtime-write-owner-decision-record.md` — runtime/write policy (complementary)
- `docs/architecture/phase-2-production-truth-owner-decision-record.md` — production truth policy (complementary)
- `docs/architecture/phase-2-governance-review-owner-decision-record.md` — governance/review policy (complementary)
- `docs/architecture/phase-2-evidence-model-owner-decision-record.md` — evidence policy (complementary)
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md` — Phase 2 → Phase 3 prerequisites (gate not passed)
- `docs/architecture/school-identity-location-resolution-phase-2-spec.md` — Phase 2 spec
- `docs/architecture/norway-school-identity-matching-execution-plan.md` — execution plan
- `docs/architecture/phase-4-source-truth-contour-map.md` — Phase 4 crosswalk (docs-only)

**Conflict rule:** if this record conflicts with a canonical source, the **canonical source wins** and this record must be revised.

---

## Meta-rule T0

All **Yes** decisions in this record (T1–T11) mean **RLS target-map policy on paper only**.

None of T1–T11 authorizes SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, runtime/write, row creation, PSA, Route, operator workflow, helper/pipeline hookup, Phase 3, Phase 4, cleanup, migration, deletion, new-project creation, or `.env` changes.

**Child-information protection:** because Min Veg works with information about **children**, security, privacy, truthful presentation, and data minimization **override speed** for any future RLS work.

---

## Priority rule (T11)

If a stricter rule exists in the evidence model, governance/review, production truth, or runtime/write owner records; the RLS apply readiness owner record; the RLS apply preconditions owner record; the RLS security owner record; canonical specs; or this checklist, the **stricter safety rule wins**.

No target-map record may weaken child-information protection, privacy, truthfulness, data minimization, or no-execution rules.

---

## Owner/security target-map decisions (T1–T11)

### Decision T1 — Private labels are documentation labels only

**Owner decision:** **Yes**.

Use safe private labels in documentation:

| Label | Role |
|-------|------|
| **ISOLATED-LAB** | Historical isolated/lab RLS test environment |
| **STAGING-34B** | Intended staging / manual Gate 34B RLS-policy DDL track |
| **MAIN-OWNER-USED** | Current main / owner-used working Supabase project |
| **PROD** | **Not separately split yet** — treat as **MAIN-OWNER-USED for now** for planning |

Do **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, or secrets in git. Do **not** create `.env` entries for these labels now. These labels are **not** runtime truth and **not** application configuration.

### Decision T2 — Isolated lab (ISOLATED-LAB)

**Owner decision:** **Yes**.

- **Private label:** **ISOLATED-LAB**
- **Meaning:** historical isolated/lab RLS test environment per `phase-2-isolated-test-rls-evidence-record.md`
- **Not** main; **not** production; does **not** prove staging/main/production readiness; does **not** authorize any apply

### Decision T3 — Staging Gate 34B (STAGING-34B)

**Owner decision:** **Yes**.

- **Private label:** **STAGING-34B**
- **Meaning:** intended staging / manual **Gate 34B** RLS-policy DDL track
- **Gate 34A approves nothing.** **Gate 34B** is manual staging DDL only in the artifact track
- **STAGING-34B** must **not** be treated as main apply by default
- If **STAGING-34B** is **not** physically separate from **MAIN-OWNER-USED**, stricter/slower gates apply — owner decision T6 treats them as **different** physical projects (see sameness table)
- Physical relation to **MAIN-OWNER-USED** is **owner-confirmed** in this record (T6); execution packet and apply remain **forbidden**

### Decision T4 — Main / owner-used (MAIN-OWNER-USED)

**Owner decision:** **Yes**.

- **Private label:** **MAIN-OWNER-USED**
- **Meaning:** current main / owner-used Supabase project where working app logic and/or Phase 2 **schema-only** tables may live (per main rollout checklist and owner statement)
- Treat as **production-like / higher-risk** because it is the **current working** Supabase project
- Phase 2 is **not released** on main — **do not** use that fact to relax safety
- Schema-only tables existing does **not** mean RLS deny locks are installed
- Zero rows or unused Phase 2 state does **not** mean apply is safe
- No runtime/write or Phase 2 rows are approved

### Decision T5 — Production (PROD)

**Owner decision:** **Yes**.

- **Current policy:** **PROD is not separately split yet** — **PROD = MAIN-OWNER-USED for now** for planning purposes
- Production is **not** a separately proven physical target in repo beyond this equivalence
- **MAIN-OWNER-USED** must be treated as **production-like / higher-risk** unless a later gate creates and validates a **separate** production project
- Production RLS apply remains a **separate future gate** even when PROD equals MAIN-OWNER-USED for planning
- No production apply is approved

### Decision T6 — Staging / main physical sameness

**Owner decision:** **Yes** (provisional reading per owner statement).

Owner stated (paraphrased for documentation): **one Supabase organization/account context, but different Supabase projects** — unless a later owner-held map revises this.

**Provisional current reading logged in this record:**

| Pair | Physical relation |
|------|-------------------|
| **STAGING-34B** vs **MAIN-OWNER-USED** | **Different physical Supabase projects** |
| **ISOLATED-LAB** vs **MAIN-OWNER-USED** | **Different** (isolated evidence: main not touched) |
| **ISOLATED-LAB** vs **STAGING-34B** | **Different** (lab vs staging track) |
| **MAIN-OWNER-USED** vs **PROD** (planning) | **Same for now** — PROD not separately split |

If later evidence shows **STAGING-34B** and **MAIN-OWNER-USED** are the **same physical project**, stricter/slower gates apply and this record must be revised. If uncertain, **no apply** and **no execution packet**.

### Decision T7 — Family-facing / production-like risk

**Owner decision:** **Yes**.

| Label | Family-facing / production-like risk |
|-------|--------------------------------------|
| **ISOLATED-LAB** | **Not** family-facing — lab only |
| **STAGING-34B** | Intended **non-production** staging; must remain **confirmed** before any 34B discussion; treat as lower direct family risk than MAIN unless owner revises |
| **MAIN-OWNER-USED** | **Production-like / higher-risk** — current working project |
| **PROD** (planning) | **Same as MAIN-OWNER-USED for now** — therefore **production-like / higher-risk** |

Unknown or production-like status always requires **slower** gates.

### Decision T8 — Future RLS target

**Owner decision:** **Yes**.

Future Phase 2 RLS **deny locks** are **expected** on the project where Phase 2 **schema-only** tables exist: **MAIN-OWNER-USED**. This remains **planning only**.

Any future apply still requires **separate** target snapshot, named executor/approver/rollback owner, negative-test plan and pass on real target, diagnostics compatibility, FORCE RLS posture (if ever included), and parity decisions.

If a later migration/split decision creates a **new clean project**, this target map must be **updated** before any apply.

### Decision T9 — Main clutter / cleanup vs new project

**Owner decision:** **Yes**.

Owner described **MAIN-OWNER-USED** as **cluttered with SQL** (working objects beyond Phase 2 scope).

| Topic | Posture |
|-------|---------|
| Cleanup | **Not** approved here |
| Migration | **Not** approved here |
| Deletion | **Not** approved here |
| New clean Supabase project | **Not** approved here |
| Split staging/main/production physically | **Not** decided here |

Before deciding whether to clean current **MAIN-OWNER-USED**, create a clean project, migrate working SQL, or split environments, a **separate read-only migration/cleanup feasibility audit** is required. That audit must classify current SQL objects by purpose and risk before any cleanup/migration/delete.

### Decision T10 — No execution packet until target map and follow-up preconditions

**Owner decision:** **Yes**.

This target-map record does **not** allow execution packet drafting. **EXECUTION_PACKET_DRAFT_FORBIDDEN** remains.

No SQL / apply / Gate 34B / staging / main / production apply until, among others:

- target map confirmed (this record — **labels only**);
- executor / approver / rollback owner **named** (may remain owner-held outside repository);
- rollback triggers and good restored state **defined** per target;
- negative-test plan **accepted** and tests **passing** on real target;
- diagnostics compatibility path **defined**;
- FORCE RLS posture **separately decided** if needed;
- parity **checked** for the real target;
- any future cleanup/migration path **decided** only after separate feasibility audit if relevant.

### Decision T11 — Priority rule

**Owner decision:** **Yes** (see Priority rule section above).

---

## Target map table

| Label | Track | Current meaning | Family-facing / production-like risk | Physical relation (provisional) | What it proves | What it does not prove | Apply approved? |
|-------|-------|-----------------|--------------------------------------|--------------------------------|----------------|-------------------------|-----------------|
| **ISOLATED-LAB** | Isolated lab evidence | Temporary lab RLS validation only | Not family-facing | Different from MAIN and STAGING-34B | Lab Option B syntax/rollback narrative | Staging/main/prod; product paths | **No** |
| **STAGING-34B** | Gate 34B staging DDL | Manual deny-policy DDL track; 34A approves nothing | Intended non-prod staging (confirm before 34B talk) | **Different physical project** from MAIN-OWNER-USED (T6) | Planning label for staging artifact track | Main apply; tests passed; execution now | **No** |
| **MAIN-OWNER-USED** | Main / owner-used RLS apply | Working project; Phase 2 schema-only tables may exist | **Production-like / higher-risk** | Different from STAGING-34B; same as PROD for now | Schema rollout contour (tables may exist) | RLS deny locks; safe apply; 34B on main by default | **No** |
| **PROD** | Production RLS (future) | **Not separately split** — **= MAIN-OWNER-USED for now** | **Production-like** (via MAIN) | Same physical as MAIN-OWNER-USED until split | Separate **future** gate concept only | Staging/main evidence → prod apply | **No** |

---

## Environment sameness table

| Comparison | Owner-logged relation | If relation changes |
|------------|----------------------|---------------------|
| **ISOLATED-LAB** vs **STAGING-34B** | Different physical projects | No apply from lab to staging |
| **STAGING-34B** vs **MAIN-OWNER-USED** | **Different physical projects** (owner: one Supabase org, different projects) | If later **same** → stricter gates; revise record |
| **MAIN-OWNER-USED** vs **PROD** | **Same for now** (PROD not split) | If later **separate PROD** → update map + parity before prod apply |
| **MAIN schema target** vs **future RLS target** | **Same** — **MAIN-OWNER-USED** (T8) | If tables moved to new project → update map before apply |

---

## Main clutter / cleanup-vs-new-project note

**Owner observation (documentation only):** **MAIN-OWNER-USED** is described as cluttered with SQL objects beyond Phase 2.

**Not approved in this record:** cleanup, migration, deletion, new project creation, or environment split execution.

**Required before any cleanup/migration/delete decision:** separate **read-only migration/cleanup feasibility audit** — classify objects by purpose and risk; do **not** conflate with RLS apply approval.

**RLS apply remains blocked** regardless of clutter until operational preconditions in T10 are satisfied.

---

## What this record closes / does not close

| Closes (docs / owner policy only) | Does **not** close / remains blocked |
|-----------------------------------|--------------------------------------|
| Owner-adopted RLS **target-map policy** (T0–T11) with private labels | **NOT_READY_FOR_APPLY** |
| Documentation-level resolution of physical target **label map** (T6) | **EXECUTION_FORBIDDEN** |
| PROD = MAIN-OWNER-USED for now; MAIN production-like risk | **EXECUTION_PACKET_DRAFT_FORBIDDEN** |
| Clutter noted; feasibility audit required before cleanup/migration | Executor/approver/rollback owner naming (may be owner-held only) |
| Complements preconditions C1 at label level | Negative tests passing on real target |
| | Gate 34B execution, all apply tracks |
| | Cleanup, migration, deletion, new project |
| | Runtime/write, rows, PSA, Route, operator, helper/pipeline, Phase 3/4 |

**Implementation OPEN (deferred):** per-target RLS snapshots; named executor/approver/rollback owner; negative-test plan and pass; diagnostics post-RLS check; FORCE RLS decision; parity STAGING-34B → MAIN if ever needed; migration/cleanup feasibility audit; possible future PROD physical split.

---

## Archive table (T0 + T1–T11)

| ID | Policy summary | Default if uncertain |
|----|----------------|----------------------|
| T0 | Target-map policy only; not apply/cleanup/.env | Block execution |
| T1 | Private labels docs-only; no secrets in git | Block secret paste |
| T2 | ISOLATED-LAB ≠ main/prod | Block lab → apply |
| T3 | STAGING-34B = 34B track only | Block 34B → main |
| T4 | MAIN-OWNER-USED production-like; schema ≠ locks | Block schema → apply |
| T5 | PROD = MAIN for now; prod gate separate | Block prod shortcut |
| T6 | STAGING-34B ≠ MAIN physical projects (provisional) | Block if revised to same without slower gates |
| T7 | MAIN production-like risk | Slower gates |
| T8 | Future RLS on MAIN-OWNER-USED (planning) | Update if project moves |
| T9 | Clutter; feasibility audit before cleanup/migration | Block cleanup here |
| T10 | No execution packet; ops preconditions remain | Block packet |
| T11 | Stricter safety wins | Block |

---

## Recommended next gate (informational only)

This record logs **RLS target-map policy** at documentation level only. It does **not** select an execution gate, cleanup/migration work, negative-test implementation, FORCE decision, or execution **packet**.

**NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged.

Any next checklist-priority item requires **separate read-only selection**. Likely **future** candidates (none selected here) include: executor/approver/rollback naming; negative-test planning; diagnostics compatibility planning; FORCE RLS separate decision; **read-only migration/cleanup feasibility audit** for MAIN clutter; operational production truth or other blocked contours — each requires its **own** owner gate.

SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, runtime/write implementation, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 execution remain **forbidden** until **explicitly** approved by **separate** gates.

---

## Final boundary statement

Phase 2 RLS target-map policy is owner-adopted in this record at documentation level only using private labels **ISOLATED-LAB**, **STAGING-34B**, **MAIN-OWNER-USED**, and **PROD = MAIN-OWNER-USED for now**. **NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain in force. **RLS_TARGET_MAP_POLICY_ADOPTED_DOCS_ONLY** does **not** mean apply is ready or safe. Gate 34B execution, staging apply, main / owner-used RLS policy apply, production apply, cleanup, migration, runtime/write integration, Phase 2 row writes, operational production truth, PSA publication, PSA materialization, Route Engine consumption, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 LOSA execution remain **blocked** until **separate** owner-approved gates.

**Owner policy (2026-05-18):** RLS accountability policy (A0–A12) per `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` — role labels only; partially satisfies T10 naming at label level; **not** execution approval; **NOT_READY_FOR_APPLY** unchanged.
