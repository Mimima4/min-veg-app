# Phase 2 RLS Owner-Held Snapshot Evidence Planning Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner/security snapshot evidence planning decision record — **NOT_READY_FOR_APPLY** / **EXECUTION_FORBIDDEN** / **EXECUTION_PACKET_DRAFT_FORBIDDEN** |
| **Closure label** | `RLS_SNAPSHOT_EVIDENCE_PLANNING_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | Owner-held per-target snapshot evidence **planning** policy only (E0–E18) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `a40e58c Add Phase 2 RLS negative-test plan owner decision record` |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section L (RLS owner-held snapshot evidence planning policy) |

This file records **owner-agreed planning policy** for how **future** owner-held per-target RLS snapshot evidence may be **captured** (only after a later gate), **stored**, **reviewed**, and **used**. It defines **who** (role labels), **where** (owner-held default), and **what boundaries** apply — at **documentation level only**.

It does **not** collect snapshot evidence. It does **not** connect to Supabase. It does **not** prove snapshots exist. It does **not** prove tests passed. It does **not** make RLS apply ready. It does **not** allow execution packet drafting.

**Adopting this record does NOT change NOT_READY_FOR_APPLY, EXECUTION_FORBIDDEN, or EXECUTION_PACKET_DRAFT_FORBIDDEN.**

**Planning adopted ≠ evidence collected ≠ tests run ≠ apply approved.** No step in this chain may be skipped by implication.

**Primary safety target:** **MAIN-OWNER-USED** / **PROD** (**PROD = MAIN-OWNER-USED for now**) is the **primary** safety target for evidence planning, review, and future decisions.

**STAGING-34B** remains in documentation as an **optional rehearsal / safety track** only. **STAGING-34B** is **not mandatory** before MAIN evidence planning. **STAGING-34B** evidence or checks **never** substitute **MAIN-OWNER-USED** / **PROD** evidence or approval.

This record does **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, raw child/school table rows, screenshots with secrets, token or session dumps, full grant matrices if security-sensitive, full policy/grant dumps if security-sensitive, or exact SQL dumps. It does **not** create or change `.env` configuration.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged — live per-target evidence, test pass, parity evidence, FORCE decision, and other operational preconditions remain **not** satisfied |
| **EXECUTION_FORBIDDEN** | Unchanged — SQL, Supabase connect/apply, Gate 34B execution, staging apply, main apply, production apply remain **forbidden** |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged — no execution packet until **separate** gates after planning, per-target evidence, review, and test pass |
| **RLS_SNAPSHOT_EVIDENCE_PLANNING_POLICY_ADOPTED_DOCS_ONLY** | Evidence **planning** policy logged on paper only; does **not** mean evidence was captured, reviewed, or apply is safe |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Complements:** `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` (S6, S7, S11 — storage posture; requirements before evidence).
- **Complements:** `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` (N4, N10, N12, N16 — execution after evidence; packet dependencies; parity).
- **Complements:** `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` (A2–A4, A10, A11 — role labels; good restored state; naming ≠ execution).
- **Complements:** `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` (C2 re-snapshot, C7 good restored state, C14 parity).
- **Complements:** `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` (T6 different physical projects; T8 ISOLATED-LAB historical; T9/T10 MAIN clutter audit separate).
- **Complements:** `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md`, `docs/architecture/phase-2-rls-security-owner-decision-record.md`.
- **Reference:** `docs/architecture/phase-2-staging-rls-execution-decision.md`, `docs/architecture/phase-2-staging-rls-execution-packet.md` (template only — **not** permission), `docs/architecture/phase-2-isolated-test-rls-evidence-record.md` (historical lab — **not** reusable baseline), `docs/architecture/phase-2-read-only-diagnostics-contract.md`, `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md`.
- **Uses private target labels:** **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now**, **STAGING-34B** (optional rehearsal only), **ISOLATED-LAB** (historical only — **must not** be reused).
- **MAIN-OWNER-USED** / **PROD** is the **primary safety target**; stricter evidence, review, and separate decisions than **STAGING-34B**.
- **STAGING-34B** is **optional rehearsal**; not mandatory before MAIN planning; never substitutes MAIN/PROD evidence or approval.
- **Does not** reopen prior owner records unless an explicit owner gate says so.
- **Conflict rule:** if this record conflicts with any prior owner record or a canonical source, the **stricter safety rule wins**; canonical sources win over all owner records.

## This document is not

- SQL approval or execution
- Supabase connect or apply approval
- live snapshot collection or evidence satisfaction
- negative-test **execution** approval
- negative-test **pass** evidence or proof
- Gate 34B execution approval
- staging RLS apply approval
- main / owner-used RLS policy apply approval
- production RLS apply approval
- proof that RLS apply readiness is achieved
- proof that operational preconditions are satisfied
- execution packet approval or drafting permission
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
- storage of secrets, connection strings, raw child/school evidence rows, token or session dumps, or security-sensitive dumps in git

## Source basis

The following repository documents govern or contextualize this record:

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist
- `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md` — snapshot requirements (complementary)
- `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` — negative-test plan (complementary)
- `docs/architecture/phase-2-rls-accountability-owner-decision-record.md` — accountability (complementary)
- `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` — target-map (complementary)
- `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` — preconditions (complementary)
- `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` — readiness (complementary)
- `docs/architecture/phase-2-rls-security-owner-decision-record.md` — RLS security policy
- `docs/architecture/phase-2-staging-rls-execution-decision.md` — Gate 32 staging decision (reference)
- `docs/architecture/phase-2-staging-rls-execution-packet.md` — packet template (reference; **not** permission)
- `docs/architecture/phase-2-isolated-test-rls-evidence-record.md` — isolated lab (historical; not reusable)
- `docs/architecture/phase-2-main-supabase-rollout-checklist.md` — main schema-only context
- `docs/architecture/phase-2-to-phase-3-gate-criteria.md` — Phase 2 → Phase 3 prerequisites (gate not passed)
- `docs/architecture/phase-2-read-only-diagnostics-contract.md` — diagnostics boundary
- `docs/architecture/phase-2-read-only-diagnostics-helper-boundary-adr.md` — helper boundary

**Conflict rule:** if this record conflicts with a canonical source, the **canonical source wins** and this record must be revised.

---

## Meta-rule E0

All **Yes** decisions in this record (E1–E18) mean **owner-held snapshot evidence planning policy on paper only**.

None of E1–E18 authorizes SQL, Supabase connect or apply, live snapshot collection, snapshot evidence claims, negative-test execution, negative-test pass claims, Gate 34B execution, staging apply, main apply, production apply, runtime/write, row creation, PSA, Route, operator workflow, helper/pipeline hookup, Phase 3, Phase 4, cleanup, migration, execution packet drafting, or `.env` changes.

**Child-information protection:** because Min Veg works with information about **children**, security, privacy, truthful presentation, and data minimization **override speed** for any future RLS work.

---

## Priority rule (E18)

If a stricter rule exists in the evidence model, governance/review, production truth, or runtime/write owner records; the RLS apply readiness, preconditions, target-map, accountability, snapshot-requirements, negative-test-plan, or security owner records; canonical specs; or the controlling checklist, the **stricter safety rule wins**.

No evidence planning record may weaken child-information protection, privacy, truthfulness, data minimization, or no-execution rules.

---

## Owner/security snapshot evidence planning decisions (E0–E18)

### Decision E0 — Scope / non-execution

**Owner decision:** **Yes**.

**Policy meaning:** This session adopts **planning policy only** for future owner-held per-target snapshot evidence. It does **not** collect evidence, connect to Supabase, run SQL, execute negative tests, approve apply, or permit execution packet drafting.

**What remains blocked:** Live snapshot collection; Supabase connect; test execution; Gate 34B; staging/main/production apply; execution packet draft; runtime/write.

---

### Decision E1 — Planning adopted does not mean evidence collected

**Owner decision:** **Yes**.

**Policy meaning:** Adopting E0–E18 does **not** mean snapshot evidence exists, was captured, or is complete for **STAGING-34B** or **MAIN-OWNER-USED**.

**What remains blocked:** Claims that snapshots are done; negative-test execution; execution packet; apply.

---

### Decision E2 — Separate evidence packages per target

**Owner decision:** **Yes**.

**Policy meaning:** Future evidence must be planned and captured as **separate packages** for **STAGING-34B** and **MAIN-OWNER-USED** (different physical projects per target-map T6). One combined file does not satisfy both.

**What remains blocked:** Merged STAGING+MAIN evidence; substituting one target for the other.

---

### Decision E3 — MAIN-OWNER-USED / PROD stricter than STAGING-34B

**Owner decision:** **Yes**.

**Policy meaning:** **MAIN-OWNER-USED** / **PROD** requires **stricter** owner-held detail, **OWNER** authorization before capture, optional **EXTERNAL_SECURITY_REVIEWER**, and slower review than **STAGING-34B**.

**What remains blocked:** Treating STAGING posture as sufficient for MAIN; MAIN apply or production approval from planning alone.

---

### Decision E4 — MAIN/PROD primary; STAGING optional rehearsal only

**Owner decision:** **Yes**.

**Policy meaning:** **MAIN-OWNER-USED** / **PROD** is the **primary safety target** for evidence planning and future security decisions. **STAGING-34B** is an **optional rehearsal / safety track** in documentation only. **STAGING-34B** is **not mandatory** before MAIN evidence planning. If STAGING is used later, it is **support only** — it does **not** gate MAIN planning adoption and does **not** reduce MAIN requirements.

**What remains blocked:** Requiring STAGING before MAIN planning; treating STAGING rehearsal as MAIN approval; skipping MAIN-specific evidence because STAGING was planned.

---

### Decision E5 — Future capture role labels

**Owner decision:** **Yes**.

**Policy meaning (role labels only — no real names in git):**

| Role label | Future capture (if later gate approves) | Notes |
|------------|----------------------------------------|-------|
| **TECH_EXECUTOR** | May perform read-only capture on either target | Requires later execution gate; not authorized by this record |
| **OWNER** | Authorizes capture on **MAIN-OWNER-USED** | Stricter than STAGING |
| **EXTERNAL_SECURITY_REVIEWER** | Optional second pair of eyes on **MAIN** | Optional; not required by default |
| **ROLLBACK_OWNER** | Does **not** capture baseline | Rollback is after change |
| **not assigned yet** | No capture until roles assigned at a later gate | Real human names **owner-held** |

**What remains blocked:** Capture now; agent/unsupervised Supabase connect; real names/emails in git.

---

### Decision E6 — Evidence review role labels

**Owner decision:** **Yes**.

**Policy meaning (role labels only):**

| Role label | Future review | Notes |
|------------|---------------|-------|
| **OWNER** | Reviews and approves evidence for **both** targets before it may inform negative-test execution planning or packet **discussion** | Maps to accountability approver label |
| **SECURITY_APPROVER** | Same function as **OWNER** unless owner later splits roles | Label alias for planning |
| **EXTERNAL_SECURITY_REVIEWER** | Optional for **MAIN** stricter path | Optional |
| **TECH_EXECUTOR** | Must **not** be sole reviewer on **MAIN** | Separation of duties |
| **not assigned yet** | No review sign-off until assigned | Real names **owner-held** |

**What remains blocked:** Self-review on MAIN by executor alone; review sign-off without captured evidence.

---

### Decision E7 — Owner-held by default

**Owner decision:** **Yes**.

**Policy meaning:** Detailed snapshot evidence (protection state, policy names, grant/bypass notes, diagnostics output detail) stays **owner-held by default**, outside git.

**What remains blocked:** Storing detailed evidence in the repository by default.

---

### Decision E8 — Git safe summaries only

**Owner decision:** **Yes**.

**Policy meaning:** Git may store **safe summaries** only — no row content. See [Storage posture table](#storage-posture-table).

**What remains blocked:** Row-level or secret-bearing git commits for evidence.

---

### Decision E9 — Prohibited data never stored in git

**Owner decision:** **Yes**.

**Policy meaning:** Prohibited items in git are listed in [Storage posture table](#storage-posture-table) (prohibited row). Aligns with snapshot S7 and negative-test N10.

**What remains blocked:** Any git storage of secrets, refs, URLs, raw child/school rows, sensitive dumps.

---

### Decision E10 — Future redacted evidence artifact

**Owner decision:** **Yes**.

**Policy meaning:** A **future redacted evidence artifact** in git is allowed **only** if a **separate future gate** explicitly approves it, with **none** of the E9 prohibited items. Owner-held remains default; redacted artifact is optional.

**What remains blocked:** Redacted artifact now; automatic git publication of evidence.

---

### Decision E11 — Diagnostics/helper baseline

**Owner decision:** **Yes**.

**Policy meaning:** Future capture plan must record **read-only diagnostics/helper** behavior **before** any RLS change on that target, and **re-check after** any RLS change. Diagnostics/helper **observe only** — never drive publication, write, readiness, PSA, Route, or family-facing truth.

**What remains blocked:** Using diagnostics as apply/readiness proof; skipping baseline in future capture.

---

### Decision E12 — Good restored state dependency

**Owner decision:** **Yes**.

**Policy meaning:** Operational **good restored state** values cannot close until per-target evidence **exists** and is **reviewed** per this plan. **MAIN** good state must be **MAIN-specific**. **STAGING** good state, if used, is **rehearsal-only**. **ISOLATED-LAB** good state **cannot** be copied.

**What remains blocked:** Closing C7 operational values without evidence; lab baseline reuse.

---

### Decision E13 — Negative-test execution dependency

**Owner decision:** **Yes**.

**Policy meaning:** Negative-test **execution** on a real target remains **forbidden** until: (1) negative-test **plan** adopted; (2) that target’s snapshot **evidence** exists and is reviewed; (3) a **separate execution gate** approves test execution. **MAIN** requires its **own** evidence — STAGING evidence does not satisfy MAIN.

**What remains blocked:** Test execution now; test pass claims; MAIN tests without MAIN evidence.

---

### Decision E14 — Execution packet dependency

**Owner decision:** **Yes**.

**Policy meaning:** Execution packet **draft** remains **forbidden** until: (1) planning and requirements adopted; (2) per-target evidence exists and is reviewed; (3) negative tests **pass** on that target; (4) a **separate gate** allows packet drafting. **STAGING** packet templates remain **templates only**.

**What remains blocked:** Packet draft now; packet from planning or requirements alone.

---

### Decision E15 — STAGING never replaces MAIN/PROD

**Owner decision:** **Yes**.

**Policy meaning:** **STAGING-34B** evidence or checks are **optional support only** and **never** replace **MAIN-OWNER-USED** / **PROD** evidence or approval. Reuse of STAGING for MAIN still requires **parity evidence** (C14) and a **separate MAIN decision** if ever proposed — STAGING is **not** downstream of MAIN by default; MAIN can be planned **directly** with stricter evidence/review.

**What remains blocked:** STAGING-only path to MAIN approval; parity skip; “STAGING passed → MAIN ready.”

---

### Decision E16 — FORCE / bypass separate

**Owner decision:** **Yes**.

**Policy meaning:** **FORCE RLS** remains a **separate** future security decision (C13 deferred). Bypass / table-owner / maintenance-role facts are **owner-held security evidence** only. This planning record **informs** those decisions; it does **not** adopt FORCE or bypass posture.

**What remains blocked:** FORCE adoption via planning; bypass treated as resolved.

---

### Decision E17 — No cleanup/migration/new project

**Owner decision:** **Yes**.

**Policy meaning:** This record does **not** approve cleanup, migration, new Supabase project, or MAIN clutter remediation. MAIN clutter remains a **separate read-only feasibility audit** (target-map T9).

**What remains blocked:** Cleanup/migration/new project from evidence planning gate.

---

### Decision E18 — Stricter safety rule wins

**Owner decision:** **Yes**.

**Policy meaning:** If this record conflicts with checklist, canonical spec, or any stricter prior owner record, the **stricter safety rule wins**.

**What remains blocked:** Weakening child-data protection or no-execution posture via this record.

---

## Target evidence planning table

| Target label | Target role | Capture required now? | Future capture allowed by this record? | Evidence package required later? | Reviewer requirement | Storage default | Can substitute MAIN/PROD? | Execution/apply approved? |
|--------------|-------------|------------------------|----------------------------------------|----------------------------------|----------------------|-----------------|---------------------------|---------------------------|
| **MAIN-OWNER-USED** / **PROD** | **Primary safety target** | **No** | **No** (separate future gate only) | **Yes** — stricter package | **OWNER** review; **EXTERNAL_SECURITY_REVIEWER** optional; **TECH_EXECUTOR** not sole reviewer | Owner-held detailed; git summaries only | N/A (this is MAIN) | **No** |
| **STAGING-34B** | Optional rehearsal / safety track | **No** | **No** (separate future gate only) | **Yes** if owner chooses rehearsal — does **not** gate MAIN | **OWNER** review; stricter than casual docs, lighter than MAIN | Owner-held detailed; git summaries only | **No** — never substitutes MAIN/PROD | **No** |
| **ISOLATED-LAB** | Historical only | **No** | **No** | **No** for real targets | N/A for apply path | Historical record only | **No** — cannot substitute any real target | **No** |

---

## Future capture role table

| Role label | Future capture allowed by this record? | Future review allowed by this record? | MAIN-specific meaning | Forbidden interpretation | Real names in git? |
|------------|--------------------------------------|---------------------------------------|----------------------|--------------------------|-------------------|
| **TECH_EXECUTOR** | **No** — later gate only | **No** as sole MAIN reviewer | May capture read-only if later approved; not sole MAIN reviewer | “Executor captured → approved” | **No** |
| **OWNER** | **No** — later gate only | **Yes** — reviews both targets | Authorizes MAIN capture; approves evidence | “Owner label in git = human named” | **No** |
| **EXTERNAL_SECURITY_REVIEWER** | **No** — later gate only | Optional on MAIN | Optional second review on MAIN | Mandatory for all work | **No** |
| **ROLLBACK_OWNER** | **No** — does not capture baseline | **No** for baseline sign-off | Rollback after change only | Baseline capture role | **No** |
| **SECURITY_APPROVER** | **No** | **Yes** (same as OWNER unless split) | Alias for OWNER approver function | Separate approval chain without owner gate | **No** |
| **not assigned yet** | **No** | **No** | Assign at later gate | Default permission | **No** |

---

## Storage posture table

| Storage class | Allowed content | Git? | Notes |
|---------------|-----------------|------|-------|
| **Safe summaries in git** | Target label; capture/review date if safe; table count; aggregate row counts; protection on/off per table; policy counts; future PASS/FAIL summary **only if separate gate allows**; explicit blocked / not apply statement | **Yes** (summaries only) | No row content |
| **Owner-held detailed evidence** | Full capture detail per snapshot requirements S1–S5; bypass notes; diagnostics detail | **No** (default) | Primary store |
| **Future redacted evidence artifact** | Shareable summary with E9 items removed | **Only after separate gate** | Optional |
| **Prohibited in git** | `project_ref`; dashboard URLs; API keys; service keys; connection strings; raw child/school rows; screenshots with secrets/raw evidence; full grant matrices if sensitive; token/session dumps; full policy/grant dumps if security-sensitive; exact SQL dumps | **Never** | See Decision E9 |
| **.env / runtime config** | Secrets and connection material | **Never** via this record | No `.env` work |

---

## Evidence-use boundary

| Statement | Binding |
|-----------|---------|
| Evidence **planning** adopted | Does **not** mean evidence **collected** |
| Evidence **collected** later | Does **not** mean tests **run** |
| Evidence **collected** later | Does **not** mean **apply readiness** |
| Evidence **collected** later | Does **not** mean **execution packet** approval |
| **STAGING** evidence | Never equals **MAIN/PROD** evidence |
| **MAIN/PROD** evidence | Still requires **separate review** and **separate** future decisions (apply, packet, tests) |

---

## Diagnostics/helper baseline (planning requirement)

Future owner-held capture (when a later gate approves) must include:

1. **Before** any RLS change on that target — diagnostics/helper baseline recorded owner-held.
2. **After** any RLS change on that target — diagnostics/helper re-check recorded owner-held.

Diagnostics/helper:

- **Observe only** — read-only contract and helper ADR boundaries unchanged.
- **Never** drive publication, write, readiness, PSA, Route, or family-facing truth.
- **Never** substitute for negative-test pass or snapshot field completeness.

---

## Good restored state (planning dependency)

- Operational **good restored state** values (preconditions C7, accountability A10) remain **open** until per-target evidence **exists** and is **reviewed**.
- **MAIN-OWNER-USED** / **PROD** good restored state must be **target-specific** and **stricter**.
- **STAGING-34B** good restored state, if ever recorded, is **rehearsal-only** and does **not** define MAIN rollback picture.
- **ISOLATED-LAB** good restored state **cannot** be copied to **STAGING-34B** or **MAIN-OWNER-USED**.

---

## Negative-test dependency

Negative-test **execution** remains **forbidden** by this record.

Before negative-test **execution** on a target (future separate gate):

1. Negative-test **plan** adopted (`phase-2-rls-negative-test-plan-owner-decision-record.md`).
2. Relevant target **snapshot evidence** exists and is **reviewed** per this record.
3. **Separate execution gate** approves test execution.

**MAIN-OWNER-USED** / **PROD** requires **its own** evidence. **STAGING-34B** evidence does **not** satisfy MAIN execution planning.

---

## Execution packet dependency

Execution packet **drafting** remains **forbidden**.

Before packet drafting (future separate gate), all of the following must be satisfied on that target:

1. Snapshot **requirements** and evidence **planning** adopted (docs only — this record does not satisfy evidence).
2. Per-target **evidence** exists and is **reviewed**.
3. Negative tests **pass** on that target (separate pass gate).
4. **Separate gate** allows packet drafting.

**STAGING** execution packet files remain **templates only** — not permission.

---

## Parity (planning level)

- **STAGING-34B** evidence **cannot** be reused for **MAIN-OWNER-USED** without **parity evidence** (C14) and a **separate MAIN** owner/security decision.
- **MAIN** is **not** downstream of **STAGING** by default — MAIN/PROD can be planned and captured **directly** with **stricter** evidence and review.
- **STAGING** optional rehearsal does **not** remove MAIN-specific evidence or MAIN-specific review.

---

## FORCE RLS / bypass (planning informs only)

- **FORCE RLS** decision remains **open / deferred** (preconditions C13).
- Bypass / table-owner / elevated-role facts belong in **owner-held** security evidence when captured later.
- Evidence planning **informs** FORCE and bypass decisions; it does **not** adopt them.

---

## Cleanup / migration (not approved)

This record does **not** approve:

- MAIN clutter cleanup
- Schema migration for clutter removal
- New Supabase project creation
- Deletion of legacy objects

Those remain **separate** read-only feasibility audit and future owner gates.

---

## What this closes / does not close

| Closes at docs level | Does not close |
|----------------------|----------------|
| E0–E18 owner-held evidence **planning** policy | Live snapshot **collection** |
| MAIN/PROD **primary safety target** framing | Owner-held evidence **values** |
| STAGING **optional rehearsal** framing (not mandatory before MAIN planning) | **Redacted** evidence artifact |
| Owner-held default; safe summary / prohibited storage posture | Negative-test **execution** |
| Future role-label capture/review planning | Negative-test **pass** evidence |
| Diagnostics baseline **requirement** in future capture plan | Diagnostics compatibility **pass** |
| Good-state **dependency** on evidence + review | **FORCE** RLS decision |
| STAGING does **not** substitute MAIN/PROD rule | Parity **evidence** |
| | Operational good-restored-state **values** |
| | Execution **packet** |
| | Gate **34B** |
| | Staging / main / production **apply** |
| | Runtime/write |
| | Phase 2 **row writes** |
| | PSA / Route |
| | Operator workflow |
| | Helper/pipeline integration |
| | Phase 3 / Phase 4 |
| | Cleanup / migration / new project **decision** |

---

## Archive table (E0–E18)

| ID | Question summary | Owner decision | Status | Notes |
|----|------------------|----------------|--------|-------|
| E0 | Scope: planning only; no collection/Supabase/tests/apply/packet | Yes | Adopted | Non-execution |
| E1 | Planning ≠ evidence collected | Yes | Adopted | No false completion |
| E2 | STAGING + MAIN separate packages | Yes | Adopted | T6 |
| E3 | MAIN/PROD stricter than STAGING | Yes | Adopted | Primary target |
| E4 | MAIN primary; STAGING optional rehearsal; not mandatory before MAIN planning | Yes | Adopted | Updated framing |
| E5 | Capture roles: TECH_EXECUTOR; OWNER auth MAIN; optional EXTERNAL | Yes | Adopted | Labels only |
| E6 | Review: OWNER both; optional EXTERNAL on MAIN; executor not sole MAIN reviewer | Yes | Adopted | SECURITY_APPROVER = OWNER |
| E7 | Owner-held by default | Yes | Adopted | S6 aligned |
| E8 | Git safe summaries only | Yes | Adopted | No row content |
| E9 | Prohibited data never in git | Yes | Adopted | S7 aligned |
| E10 | Redacted artifact = separate future gate | Yes | Adopted | Optional |
| E11 | Diagnostics baseline before/after; observe only | Yes | Adopted | S8/C11 |
| E12 | Good state open until evidence reviewed | Yes | Adopted | C7 |
| E13 | No test execution until evidence + separate gate | Yes | Adopted | N4 |
| E14 | Packet forbidden until full chain | Yes | Adopted | N12 |
| E15 | STAGING never replaces MAIN/PROD | Yes | Adopted | N16/C14 |
| E16 | FORCE/bypass separate | Yes | Adopted | C13 deferred |
| E17 | No cleanup/migration/new project | Yes | Adopted | T9 separate |
| E18 | Stricter safety rule wins | Yes | Adopted | Priority |

---

## Recommended next gate (informational only)

This record logs **RLS owner-held snapshot evidence planning policy** at documentation level only. It does **not** select an execution gate, live snapshot collection, negative-test **execution**, negative-test **pass** claims, FORCE **decision**, parity **evidence**, redacted evidence **artifact**, or execution **packet**.

**NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged.

Any next checklist-priority item requires **separate read-only selection**. **Non-selected** future candidates include: negative-test **execution** planning (separate gate); redacted evidence artifact planning; read-only migration/cleanup feasibility audit for MAIN clutter — each requires its **own** owner gate.

SQL, Supabase connect, Supabase apply, live snapshot collection, test execution, Gate 34B execution, staging apply, main apply, production apply, runtime/write implementation, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 execution remain **forbidden** until **explicitly** approved by **separate** gates.

---

## Final boundary statement

**Owner policy (2026-05-18):** RLS diagnostics compatibility planning (D0–D20) per `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` — planning only; no diagnostics re-run, no compatibility pass, no Supabase connect, no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS FORCE RLS policy (F0–F18) per `docs/architecture/phase-2-rls-force-rls-owner-decision-record.md` — first apply: FORCE excluded; no FORCE enabled; no SQL/Supabase; no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS parity evidence planning (P0–P18) per `docs/architecture/phase-2-rls-parity-evidence-planning-owner-decision-record.md` — planning only; no parity evidence collected; no STAGING→MAIN transfer approved; no SQL/Supabase; no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS live snapshot collection gate (SG0–SG18) per `docs/architecture/phase-2-rls-live-snapshot-collection-gate-owner-decision-record.md` — gate defined only; no Supabase connect; no snapshot collected; no collection execution approved; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

Phase 2 RLS owner-held snapshot evidence **planning** policy is owner-adopted in this record at documentation level only (E0–E18). **NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain in force. **RLS_SNAPSHOT_EVIDENCE_PLANNING_POLICY_ADOPTED_DOCS_ONLY** does **not** mean evidence was captured, reviewed, or apply is ready. **Planning adopted ≠ evidence collected ≠ tests run ≠ apply approved.** **MAIN-OWNER-USED** / **PROD** is the **primary safety target**; **STAGING-34B** is **optional rehearsal only** and **never** substitutes MAIN/PROD evidence or approval. Gate 34B execution, staging apply, main / owner-used RLS policy apply, production apply, cleanup, migration, runtime/write integration, Phase 2 row writes, operational production truth, PSA publication, PSA materialization, Route Engine consumption, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 LOSA execution remain **blocked** until **separate** owner-approved gates.
