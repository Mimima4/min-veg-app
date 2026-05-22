# Phase 2 RLS Apply Preconditions Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner/security preconditions decision record — **NOT_READY_FOR_APPLY** / **EXECUTION_FORBIDDEN** |
| **Closure label** | `RLS_APPLY_PRECONDITIONS_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | RLS apply preconditions policy only (complements Q0–Q15 readiness record) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `cd5ff25 Add Phase 2 RLS apply readiness owner decision record` (from `git log -1 --oneline` at record creation) |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section G (RLS apply preconditions policy) |

This file records **owner-agreed RLS apply preconditions policy** at **documentation level only**. It **operationalizes and narrows** `phase-2-rls-apply-readiness-owner-decision-record.md` (Q0–Q15); it does **not** replace or satisfy that record.

**Adopting this record does NOT change NOT_READY_FOR_APPLY or EXECUTION_FORBIDDEN.** It does **not** mean executor, approver, or rollback owner are named; does **not** mean negative tests passed; does **not** mean physical target ambiguity is resolved.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged — operational preconditions (naming, snapshots, passing tests, parity evidence) are **not** satisfied |
| **EXECUTION_FORBIDDEN** | Unchanged — SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply remain **forbidden** |
| **RLS_APPLY_PRECONDITIONS_POLICY_ADOPTED_DOCS_ONLY** | Preconditions **rules on paper** for future RLS apply **discussion** only; does **not** mean preconditions are **met** |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Until a **separate** owner-approved gate after operational preconditions are satisfied |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution.

## Relationship to prior records

- **Complements:** `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` (Q0–Q15) — does **not** replace or satisfy Q decisions unless an explicit owner gate reopens them.
- **Complements (planning context, not superseded):** `docs/architecture/phase-2-rls-apply-readiness-security-decision.md` (Gate 30 — staging RLS apply **planning** only; **not** apply approval).
- **Complements:** `docs/architecture/phase-2-rls-security-owner-decision-record.md`, four Phase 2 policy owner records (evidence, governance, production truth, runtime/write).
- **Reference:** `docs/architecture/phase-2-staging-rls-execution-decision.md` (Gate 32 — owner-used as staging planning target; physical sameness with main schema home **unresolved** in repository).
- **Does not** reopen Q1–Q15 or weaken child-information protection, privacy, truthfulness, data minimization, or no-execution rules.
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

## Source basis

The following repository documents govern or contextualize this record:

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist
- `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` — RLS apply readiness policy (Q0–Q15; complementary)
- `docs/architecture/phase-2-rls-apply-readiness-security-decision.md` — Gate 30 apply-readiness planning posture
- `docs/architecture/phase-2-rls-security-owner-decision-record.md` — RLS security policy
- `docs/architecture/phase-2-rls-security-review-plan.md` — RLS review plan (reference)
- `docs/architecture/phase-2-rls-sql-human-security-review-packet.md` — human security review packet (reference)
- `docs/architecture/phase-2-staging-rls-execution-decision.md` — staging execution decision (reference)
- `docs/architecture/phase-2-staging-rls-execution-packet.md` — Gate 34A packet / Gate 34B prerequisites (reference; **not** execution)
- `docs/architecture/phase-2-staging-rls-sql-execution-prompt-draft.md` — execution prompt draft (reference; **not** execution)
- `docs/architecture/phase-2-isolated-test-rls-evidence-record.md` — isolated test evidence (**not** main approval)
- `docs/architecture/phase-2-main-supabase-rollout-checklist.md` — main schema-only rollout (tables exist; deny policies **not** installed by that closure)
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

## Meta-rule C0

All **Yes** decisions in this record (C1–C16) mean **RLS apply preconditions policy on paper only**.

None of C1–C16 authorizes SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, runtime/write, row creation, PSA, Route, operator workflow, helper/pipeline hookup, Phase 3, or Phase 4.

**Child-information protection:** because Min Veg works with information about **children**, security, privacy, truthful presentation, and data minimization **override speed** for any future RLS work.

## Meta-rule C0-bis — Relationship to readiness record

- This record **complements** `phase-2-rls-apply-readiness-owner-decision-record.md`; it does **not** replace or satisfy Q0–Q15.
- Gate 30 (`phase-2-rls-apply-readiness-security-decision.md`) allows **planning artifacts only**; it does **not** approve apply and is **not** superseded by this record.
- Gate 32 documents **owner-used** as the **staging planning target**; this record does **not** resolve whether that is the **same physical project** as main schema home — sameness remains **owner-held / unresolved** until explicitly stated.

---

## Priority rule (C16)

If a stricter rule exists in the evidence model, governance/review, production truth, or runtime/write owner records; the RLS apply readiness owner record; the RLS security owner record; canonical specs; or this checklist, the **stricter safety rule wins**.

No preconditions record may weaken child-information protection, privacy, truthfulness, data minimization, or no-execution rules.

---

## Owner/security preconditions decisions (C1–C16)

### Decision C1 — Physical target map

**Owner decision:** **Yes**.

Any future RLS apply discussion must name the **physical database target**. Required tracks: (1) isolated lab; (2) staging Gate 34B; (3) main / owner-used RLS policy apply; (4) production RLS apply. Tracks must **not** be merged into one approval.

If staging Gate 34B and main / owner-used are the **same physical** Supabase project, this must be stated explicitly in **owner-held** materials. If unclear, **no apply** — physical target ambiguity remains an apply blocker.

If the target serves families today, treat it as **higher risk** and require **slower** gates.

**This file does not invent** project identifiers; sensitive refs stay **out of repository** per staging/isolated evidence hygiene.

### Decision C2 — Schema-only main is not RLS apply readiness

**Owner decision:** **Yes**.

Phase 2 **schema-only** migration / main tables existing does **not** mean RLS **deny locks** are installed. Zero rows does **not** prove security readiness.

Before any future apply discussion, the target must be **re-snapshotted** (read-only evidence in a **future** gate or owner-held notes — **not** SQL in this record, **not** Supabase connection by the authoring agent) for: RLS enabled/disabled; policy count; table ownership; role/grant posture; family-facing vs production-like character.

### Decision C3 — Isolated / staging / main / production separation

**Owner decision:** **Yes**.

Isolated lab evidence does **not** prove staging readiness. Staging planning or packet drafts do **not** prove main / owner-used readiness. Main / owner-used readiness does **not** prove production readiness. **Gate 34A approves nothing.** **Gate 34B** artifact track is **manual staging DDL** only unless a later owner/security gate explicitly says otherwise. Production apply is always a **separate future gate**.

### Decision C4 — Executor / approver

**Owner decision:** **Yes**.

Future apply cannot be scheduled without a **named executor** and **named approver** (person/role — may be **owner-held outside repository**). They may differ. Manual steps must **not** be anonymous or automated by default. No execution packet may be treated as ready until both are named.

**Operational status:** not named in repository.

### Decision C5 — Rollback owner

**Owner decision:** **Yes**.

Future apply cannot be scheduled without a **named rollback owner** (may differ from executor). If unclear, **no apply**.

**Operational status:** not named in repository.

### Decision C6 — Rollback triggers

**Owner decision:** **Yes**.

Rollback triggers must be defined **before scheduling**. Minimum triggers: policy name collision; partial apply; unexpected permission result; negative test failure; diagnostics/helper failure; suspected raw evidence leak; wrong target discovered; privilege / BYPASSRLS surprise on target; owner/security stop decision.

### Decision C7 — Good restored state

**Owner decision:** **Yes**.

“Good restored state” must be defined **per physical target** after read-only snapshot for that target. Until defined, status is an **unresolved apply blocker**.

May include (per target, after snapshot): RLS off; RLS on with zero deny policies; previous policy count restored; previous role/grant posture restored; diagnostics restored to prior behavior.

**Isolated lab baseline must not** be assumed for staging / main / production.

### Decision C8 — Rollback artifact timing

**Owner decision:** **Yes**.

No rollback SQL or executable rollback artifact in this docs-only policy record. Rollback artifact belongs only in a **later execution packet** gate. This record defines **requirements** only.

### Decision C9 — Negative-test plan

**Owner decision:** **Yes**.

A negative-test **plan** is required before future execution packet approval. **Passing** tests on the **real target** are required before any apply **execution** gate. Isolated SQL-editor / role-switch tests are **not** sufficient for staging / main / production. Staging evidence is **not** reusable for main without parity (C14).

### Decision C10 — Required negative-test outcomes

**Owner decision:** **Yes**.

Future tests must prove at minimum:

| Outcome | Policy |
|---------|--------|
| Anonymous users cannot read/write Phase 2 tables | Required |
| Ordinary logged-in users cannot read/write Phase 2 tables | Required |
| App/browser database client cannot use Phase 2 tables as shortcut | Required |
| Product API/JWT/PostgREST/client-library paths covered where product uses them | Required (not SQL-editor only) |
| Route cannot read raw Phase 2 tables | Required |
| PSA cannot read raw Phase 2 tables | Required |
| Writes denied unless separately approved by future gate | Required |
| Diagnostics/helper output does not become publication or family-facing truth | Required |
| Raw Phase 2 evidence cannot leak to frontend/app/family-facing surfaces | Required |

### Decision C11 — Diagnostics/helper after RLS

**Owner decision:** **Yes**.

Diagnostics/helper must be **re-tested** after any RLS change. **Fail safe:** no publication or readiness gate change; **no bypass** without separate gate. Diagnostics/helper must **never** become write, publication, PSA, Route, readiness gate, or family-facing truth driver. Service key / `service_role` remains **internal maintenance/security only**. Helper/pipeline/readiness integration remains a **separate future gate**.

### Decision C12 — High-privilege / bypass posture

**Owner decision:** **Yes**.

`service_role`, `postgres`, SQL editor, table owner, BYPASSRLS, and similar paths are **internal maintenance/security only** — **not** product access, **not** proof that families are protected. Require explicit boundary and audit before any future apply. Owner/editor session behavior must **not** be used as product security proof.

### Decision C13 — FORCE RLS posture

**Owner decision:** **Yes**.

**FORCE ROW LEVEL SECURITY** remains **deferred** for first apply. Separate owner/security decision required before any apply bundle includes FORCE. Too early: breaks maintenance/diagnostics/migrations; never resolving: owner/bypass may circumvent client deny policies.

### Decision C14 — Parity before evidence reuse

**Owner decision:** **Yes**.

Before staging evidence informs main: check database version, table ownership, role behavior, app/API/browser paths, diagnostics behavior, RLS baseline, policy count, grants/privileges. Before main evidence informs production: **separate** production parity/gate. **Isolated lab evidence cannot** be reused as main approval.

### Decision C15 — No runtime/write or product approval

**Owner decision:** **Yes**.

Preconditions policy does **not** approve: operational production truth; operational runtime/write; observation/candidate/decision/publication rows; backfill; PSA; Route; operator/admin workflow; helper/pipeline integration; Phase 3; Phase 4.

### Decision C16 — Priority rule

**Owner decision:** **Yes** (see Priority rule section above).

---

## Target map table

| Track | Repo-known facts (no secrets) | Proves | Does not prove | Apply approved |
|-------|------------------------------|--------|----------------|----------------|
| **Isolated lab** | Temporary evidence in `phase-2-isolated-test-rls-evidence-record.md`; Option B deny tested; S3/S4 in SQL role context; project ref **not** in repo | Option B syntactic validity; anon/authenticated deny in **lab SQL context**; policy rollback in lab | Staging, main, production, JWT/PostgREST, Route, PSA, app paths | **No** |
| **Staging Gate 34B** | Artifact track = manual Option B DDL; Gate 34A approves nothing; Gate 32: owner-used = staging **planning** target (ID owner-held) | Planning posture for staging manual DDL | Main, production, tests passed, executor named | **No** |
| **Main / owner-used** | Main **schema-only** rollout closed per `phase-2-main-supabase-rollout-checklist.md` (seven tables, zero rows; runtime/write blocked); deny policies **not** closure of that gate | Tables exist on main contour | RLS deny locks installed; staging evidence transfer; production | **No** |
| **Production RLS apply** | Separate future gate per Q11/C3 | — | Staging or main readiness | **No** |

**Physical sameness (staging 34B vs main schema home):** **Unresolved in repository** — owner-held map required; until resolved, **apply blocker**.

---

## Preconditions matrix

| Precondition | Policy status | Operational status | Apply blocker if unresolved? |
|--------------|---------------|-------------------|------------------------------|
| Target environment / tracks | **Defined** (C1, C3) | Physical map **partial** — sameness unresolved | **Yes** if unclear |
| Physical DB identity | **Defined** | Names **owner-held**; not in this file | **Yes** if unclear |
| Executor | **Defined** (C4) | **Not named in repository** | **Yes** |
| Approver | **Defined** (C4) | **Not named in repository** | **Yes** |
| Rollback owner | **Defined** (C5) | **Not named in repository** | **Yes** |
| Rollback triggers | **Defined** (C6) | Agreed at policy level; execution gate must confirm | Scheduling without triggers |
| Good restored state | **Defined** (C7) | **Unresolved per target** until snapshot | **Yes** per target |
| Negative-test plan | **Defined** (C9) | Plan artifact for execution gate **not** closed here | **Yes** before execution packet |
| Negative tests passing | **Defined** (C9–C10) | **Missing** on real target | **Yes** |
| Diagnostics compatibility after RLS | **Defined** (C11) | Post-RLS re-test **not** done | **Yes** before trusting diagnostics |
| High-privilege / bypass | **Defined** (C12) | Audit on **actual** target **missing** | **Yes** before apply |
| FORCE RLS | **Deferred** (C13) | Separate decision **not** logged | Before FORCE in bundle |
| Parity staging → main | **Defined** (C14) | Evidence transfer **not** approved | **Yes** before reuse |
| Raw evidence leak prevention | **Defined** (C10, C13) | E2E proof **missing** | **Yes** |

---

## Negative-test requirements table

| Test area | What it proves | Current evidence | Required before apply execution |
|-----------|----------------|------------------|--------------------------------|
| Anon read/write denied | No anonymous access to internal tables | Isolated S3A (SQL roles only) | Pass on **real target** |
| Authenticated read/write denied | No ordinary logged-in DB access | Isolated S3A (SQL roles only) | Pass on **real target** |
| App/browser direct DB denied | No client shortcut to Phase 2 tables | None in repo | Architecture + client test |
| API/JWT/PostgREST/client paths | Product paths not exposed | None in repo | Test where product uses DB |
| Route raw denied | Route does not read raw Phase 2 tables | Policy only | Test when Route wired |
| PSA raw denied | PSA does not shortcut via raw tables | Policy only | Test when PSA wired |
| Writes denied | No truth mutation unless gated | Isolated INSERT 42501; writes globally blocked | Re-test on target |
| Diagnostics ≠ publication | Logs/packets not truth | Policy + contract | Post-RLS helper re-run |
| No raw evidence leaks | Child-related data not on family surfaces | Policy Q13/C10 | E2E review |

---

## Rollback / executor / approver posture

| Topic | Policy (this record) | Operational state |
|-------|----------------------|-------------------|
| Executor | Must be named before scheduling | **Not named in repository** |
| Approver | Must be named before scheduling | **Not named in repository** |
| Rollback owner | Must be named; may ≠ executor | **Not named in repository** |
| Rollback triggers | Minimum set in C6 | Confirm at execution gate |
| Good restored state | Per-target after snapshot (C7) | **Unresolved** |
| Rollback SQL | Future execution artifact only (C8) | **Not created** |

---

## Diagnostics/helper posture

- Standalone helper **closed**; single approved consumer; service key path on main per contract/ADR — **internal maintenance only**.
- After any RLS change: **mandatory** compatibility re-test; **fail safe** (no publication/readiness driver; no bypass without gate).
- Helper/pipeline/readiness integration: **separate gate** — not approved by this record.

---

## FORCE RLS posture

| Topic | Posture |
|-------|---------|
| First apply | **FORCE not included** |
| Decision | **Separate** owner/security gate with role/table-owner reasoning |
| Risk if too early | Broken maintenance, diagnostics, migrations |
| Risk if never resolved | Owner/bypass may circumvent client deny policies |

---

## Parity posture

| Transfer | Requirement |
|----------|-------------|
| Isolated → main | **Forbidden** as approval shortcut |
| Staging → main | Explicit parity (version, owners, roles, app paths, diagnostics, RLS baseline, policies, grants) |
| Main → production | **Separate** production gate |

---

## What this record closes / does not close

| Closes (docs / owner policy only) | Does **not** close / remains blocked |
|-----------------------------------|--------------------------------------|
| Owner-adopted RLS apply **preconditions policy** (C0–C16) logged | **NOT_READY_FOR_APPLY** |
| Accountability rules: executor, approver, rollback owner, triggers, good-state **requirements** | **EXECUTION_FORBIDDEN** |
| Negative-test and parity **acceptance criteria** on paper | Named executor/approver/rollback owner in repo |
| Complements Q0–Q15 readiness policy | Negative tests **passing** on real target |
| | Gate 34B **execution**, staging/main/production **apply** |
| | Execution packet draft/approval |
| | Runtime/write, rows, PSA, Route, operator, helper/pipeline, Phase 3/4 |

**Implementation OPEN (deferred):** owner-held physical target map; per-target snapshots; named roles; negative-test plan execution; diagnostics post-RLS verification; rollback SQL in execution artifact; FORCE decision; any Gate 34B execution gate charter.

---

## Archive table (C0 + C1–C16)

| ID | Policy summary | Maps to Q | Default if uncertain |
|----|----------------|-----------|----------------------|
| C0 | Preconditions policy only; does not change NOT_READY/EXECUTION_FORBIDDEN | Q0 | Block execution |
| C0-bis | Complements Q record; Gate 30 planning only; sameness unresolved | — | Block if unclear |
| C1 | Four tracks; name physical target; sameness explicit in owner-held notes | Q1, Q2 | No apply if unclear |
| C2 | Schema-only ≠ RLS locks; re-snapshot read-only | Q2 | Block |
| C3 | No evidence ladder; 34A nothing; 34B staging DDL default | Q1, Q3 | Block merge |
| C4 | Named executor + approver | Q9 | Block anonymous apply |
| C5 | Named rollback owner | Q8, Q9 | Block |
| C6 | Rollback triggers minimum set | Q8 | Block schedule |
| C7 | Good state per target after snapshot | Q8 | Block |
| C8 | No rollback SQL in this record | Q8 | Future artifact only |
| C9 | Plan before packet; pass before execution | Q4, Q14 | Block |
| C10 | Full negative outcome list incl. API paths | Q4, Q13 | Block |
| C11 | Diagnostics re-test; fail safe; no driver | Q7 | Block bypass |
| C12 | High-privilege ≠ product proof | Q6 | Block shortcut |
| C13 | FORCE deferred | Q5 | Defer FORCE |
| C14 | Parity before reuse | Q12 | Block transfer |
| C15 | No runtime/write/product approval | Q10 | Block leap |
| C16 | Stricter safety wins | Q15 | Block |

---

## Recommended next gate (informational only)

This record logs **RLS apply preconditions policy** at documentation level only. It does **not** select an execution gate, negative-test **implementation**, FORCE **decision**, or execution **packet**.

**NOT_READY_FOR_APPLY** and **EXECUTION_FORBIDDEN** remain unchanged.

Any next checklist-priority item requires **separate read-only selection** among remaining operational/execution gates. A future execution packet requires **operational** answers (named executor/approver/rollback owner, passing tests on real target, per-target snapshots, parity, diagnostics re-check) in a **separate** owner-approved execution gate — not in this policy record.

SQL, Supabase apply, Gate 34B execution, staging apply, main apply, production apply, runtime/write implementation, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 execution remain **forbidden** until **explicitly** approved by **separate** gates.

---

## Final boundary statement

Phase 2 RLS apply preconditions policy is owner-adopted in this record at documentation level only. **NOT_READY_FOR_APPLY** and **EXECUTION_FORBIDDEN** remain in force. **RLS_APPLY_PRECONDITIONS_POLICY_ADOPTED_DOCS_ONLY** does **not** mean preconditions are operationally satisfied. **EXECUTION_PACKET_DRAFT_FORBIDDEN** remains until a separate gate. Gate 34B execution, staging apply, main / owner-used RLS policy apply, production apply, runtime/write integration, Phase 2 row writes, operational production truth, PSA publication, PSA materialization, Route Engine consumption, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 LOSA execution remain **blocked** until **separate** owner-approved gates.

**Owner policy (2026-05-18):** RLS target-map policy (T0–T11) logged in `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` — private labels only; **not** execution approval; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS accountability policy (A0–A12) per `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` — operationalizes C4/C5 at role-label level; **not** execution approval; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS snapshot requirements (S0–S14) per `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` — requirements only; no live snapshot, no execution packet, no apply; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS negative-test plan (N0–N16) per `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` — plan only; no test execution, no pass evidence, no execution packet, no apply; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS owner-held snapshot evidence planning (E0–E18) per `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` — planning only; no live snapshot, no Supabase connect, no test execution, no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS diagnostics compatibility planning (D0–D20) per `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` — planning only; no diagnostics re-run, no compatibility pass, no Supabase connect, no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS FORCE RLS policy (F0–F18) per `docs/architecture/phase-2-rls-force-rls-owner-decision-record.md` — first apply: FORCE excluded; no FORCE enabled; no SQL/Supabase; no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.
