# Phase 2 RLS Parity Evidence Planning Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Docs-only owner/security parity evidence **planning** decision record — **NOT_READY_FOR_APPLY** / **EXECUTION_FORBIDDEN** / **EXECUTION_PACKET_DRAFT_FORBIDDEN** |
| **Closure label** | `RLS_PARITY_EVIDENCE_PLANNING_POLICY_ADOPTED_DOCS_ONLY` |
| **Scope** | Parity evidence **planning** policy only (P0–P18) |
| **Date (UTC)** | 2026-05-18 |
| **Repository checkpoint** | `d65e230 Add Phase 2 RLS FORCE RLS owner decision record` |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section O (RLS parity evidence planning) |

This file records **owner-agreed policy** for **parity evidence planning** — when and how evidence or pass claims from one RLS target may **inform** another — at **documentation level only**.

It defines **parity dimensions**, **transfer rules**, **owner-held evidence posture**, and **MAIN/PROD-primary framing** — it does **not** collect parity evidence, does **not** connect to Supabase, and does **not** approve evidence reuse or apply.

**Adopting this record does NOT change NOT_READY_FOR_APPLY, EXECUTION_FORBIDDEN, or EXECUTION_PACKET_DRAFT_FORBIDDEN.**

**Planning adopted ≠ parity evidence collected ≠ evidence transfer approved ≠ apply approved.** Logging this decision does **not** prove staging and main are the same database or that staging results count for main.

**Primary safety target:** **MAIN-OWNER-USED** / **PROD** (**PROD = MAIN-OWNER-USED for now**) is the **primary** safety target for parity conclusions affecting production-like risk.

**STAGING-34B** remains an **optional rehearsal / safety track** only. **STAGING-34B** is **not mandatory** before MAIN parity planning or MAIN-direct work. **STAGING-34B** pass, snapshots, diagnostics compatibility, or FORCE posture **never** substitutes **MAIN-OWNER-USED** / **PROD** evidence or approval without **parity evidence** and a **separate MAIN** owner/security decision.

This record does **not** store `project_ref`, dashboard URLs, API keys, service keys, connection strings, full grant matrices, bypass dumps, raw child/school rows, parity comparison dumps, or exact SQL dumps. It does **not** create or change `.env` configuration.

**Readiness classification (binding for this record):**

| Classification | Meaning |
|----------------|---------|
| **NOT_READY_FOR_APPLY** | Unchanged — parity **evidence values** not collected; live snapshots, test pass, compatibility pass, FORCE enablement, and other preconditions remain **not** satisfied |
| **EXECUTION_FORBIDDEN** | Unchanged — SQL, Supabase connect/apply, Gate 34B execution, staging apply, main apply, production apply remain **forbidden** |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | Unchanged — no execution packet until **separate** gates after evidence, tests, and other prerequisites |
| **RLS_PARITY_EVIDENCE_PLANNING_POLICY_ADOPTED_DOCS_ONLY** | Parity **planning** logged on paper only; does **not** mean parity was checked, evidence exists, or reuse is approved |

This record does **not** close Phase 2 as a whole, does **not** authorize runtime/write, row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4 execution. It does **not** approve cleanup, migration, deletion, or creation of a new Supabase project.

## Relationship to prior records

- **Operationalizes / complements:** `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` (C14 parity before evidence reuse — **planning** side logged here).
- **Operationalizes / complements:** `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` (Q12 parity before staging→main inference).
- **Complements:** `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` (N16 — STAGING pass ≠ MAIN pass).
- **Complements:** `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` (E15 — STAGING never replaces MAIN/PROD).
- **Complements:** `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` (D16 — STAGING compatibility never substitutes MAIN; diagnostics in parity dimensions).
- **Complements:** `docs/architecture/phase-2-rls-force-rls-owner-decision-record.md` (F12 — STAGING FORCE posture never substitutes MAIN without parity).
- **Complements:** `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` (T6 — separate physical projects; sameness **unresolved** until owner-held map).
- **Complements:** `docs/architecture/phase-2-rls-snapshot-requirements-owner-decision-record.md`, `docs/architecture/phase-2-rls-accountability-owner-decision-record.md`.
- **Uses private target labels:** **MAIN-OWNER-USED**, **PROD = MAIN-OWNER-USED for now**, **STAGING-34B** (optional rehearsal only), **ISOLATED-LAB** (historical only).
- **Conflict rule:** if this record conflicts with any prior owner record or a canonical source, the **stricter safety rule wins**; canonical sources win over all owner records.

## This document is not

- SQL approval or execution
- Supabase connect or apply approval
- live parity evidence collection or satisfaction
- proof that staging and main are the same physical database
- approval to **reuse** staging snapshots, negative-test pass, diagnostics pass, or FORCE posture for MAIN
- negative-test **execution** or **pass** approval on any target
- post-RLS diagnostics compatibility **pass** approval
- FORCE RLS **enablement** approval
- Gate 34B execution approval
- staging RLS apply approval
- main / owner-used RLS policy apply approval
- production RLS apply approval
- proof that RLS apply readiness is achieved
- execution packet approval or drafting permission
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
- storage of secrets, grant dumps, parity comparison dumps, or bypass evidence in git

## Source basis

- `docs/architecture/phase-2-closure-criteria-checklist.md` — control checklist
- `docs/architecture/phase-2-rls-apply-preconditions-owner-decision-record.md` — C14
- `docs/architecture/phase-2-rls-apply-readiness-owner-decision-record.md` — Q12
- `docs/architecture/phase-2-rls-negative-test-plan-owner-decision-record.md` — N16
- `docs/architecture/phase-2-rls-snapshot-evidence-planning-owner-decision-record.md` — E15
- `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` — D16
- `docs/architecture/phase-2-rls-force-rls-owner-decision-record.md` — F12
- `docs/architecture/phase-2-rls-target-map-owner-decision-record.md` — T6

**Conflict rule:** canonical sources win; this record must be revised if in conflict.

---

## Meta-rule P0

All **Yes** decisions in this record (P1–P18) mean **parity evidence planning on paper only**.

None of P1–P18 authorizes SQL, Supabase connect or apply, live snapshot collection, parity evidence collection, negative-test execution, negative-test pass claims, diagnostics re-run, compatibility pass claims, FORCE enablement, Gate 34B execution, staging apply, main apply, production apply, evidence **transfer** approval, runtime/write, row creation, PSA, Route, operator workflow, helper/pipeline hookup, Phase 3, Phase 4, cleanup, migration, execution packet drafting, or `.env` changes.

**Child-information protection:** security, privacy, truthful presentation, and data minimization **override speed** for any future evidence reuse between targets.

---

## Priority rule (P18)

If a stricter rule exists in canonical specs, the checklist, or any prior Phase 2 / RLS owner record, the **stricter safety rule wins**.

---

## Owner/security parity planning decisions (P0–P18)

### Decision P0 — Scope / non-execution

**Owner decision:** **Yes**.

**Policy meaning:** This session adopts **parity evidence planning policy only**. No SQL, no Supabase, no parity evidence collection, no snapshot, no tests, no packet, no apply, no evidence reuse approval.

**What remains blocked:** All execution paths including parity evidence collection on live targets.

---

### Decision P1 — Planning adopted ≠ parity evidence collected

**Owner decision:** **Yes**.

**Policy meaning:** Adopting this record does **not** mean parity was checked between targets, does **not** mean physical sameness is proven, and does **not** mean staging evidence may be reused for MAIN.

**What remains blocked:** “Parity planning done → reuse approved.”

---

### Decision P2 — Operationalizes C14 / Q12 / N16 / E15 / D16 / F12 at planning level

**Owner decision:** **Yes**.

**Policy meaning:** Preconditions C14 and readiness Q12 defined **parity before reuse**; N16, E15, D16, and F12 stated **STAGING ≠ MAIN** without parity. This record logs the **planning** catalog and transfer rules at **policy** level — not operational parity **evidence values**.

**What remains blocked:** C14 satisfied operationally; Q12 checked on live targets.

---

### Decision P3 — MAIN-OWNER-USED / PROD is primary safety target

**Owner decision:** **Yes**.

**Policy meaning:** Parity conclusions that affect **production-like** risk must be anchored on **MAIN-OWNER-USED** / **PROD** requirements, not on STAGING convenience.

**What remains blocked:** STAGING-primary approval path for MAIN.

---

### Decision P4 — STAGING-34B optional; not mandatory before MAIN

**Owner decision:** **Yes**.

**Policy meaning:** Owner may plan and execute MAIN-direct paths with **stricter** evidence; STAGING rehearsal is **optional** and **not** a prerequisite gate before MAIN parity planning.

**What remains blocked:** “Must complete STAGING before MAIN parity talk.”

---

### Decision P5 — STAGING never substitutes MAIN/PROD

**Owner decision:** **Yes**.

**Policy meaning:** **STAGING-34B** snapshots, negative-test pass, diagnostics compatibility pass, or FORCE posture **never** replace **MAIN-OWNER-USED** / **PROD** evidence or approval. Any proposed reuse requires **parity evidence** (separate collection gate) **and** a **separate MAIN** owner/security decision per domain (tests, snapshots, diagnostics, FORCE).

**What remains blocked:** STAGING-only path to MAIN approval; “STAGING passed → MAIN ready.”

---

### Decision P6 — ISOLATED-LAB cannot substitute STAGING or MAIN

**Owner decision:** **Yes**.

**Policy meaning:** **ISOLATED-LAB** is **historical only**. Lab SQL-editor / role-switch results do **not** count as STAGING or MAIN parity baseline and **cannot** be reused as parity evidence for real targets.

**What remains blocked:** Lab → STAGING or lab → MAIN evidence transfer.

---

### Decision P7 — Parity dimension catalog (planning)

**Owner decision:** **Yes**.

**Policy meaning:** Before **STAGING-34B** evidence informs **MAIN-OWNER-USED**, owner must be able to compare (owner-held evidence; safe summaries in git only):

| Dimension | Planning question (not evidence in this gate) |
|-----------|-----------------------------------------------|
| PostgreSQL major version | Compatible for draft `FOR ALL` and RLS features? |
| Physical database / project identity | Same project or provably equivalent separate projects per target-map? |
| Table ownership | Same owners / bypass posture on seven Phase 2 tables? |
| Role behavior | `anon` / `authenticated` / service paths match intended product contour? |
| App / API / browser paths | Same client surfaces that will hit RLS in production-like use? |
| Diagnostics behavior | Fail-open tool vs fail-safe RLS path; before/after RLS re-test comparability |
| RLS baseline | RLS enabled state, policy count, policy names (summary only) |
| Grants / privileges | High-privilege boundary consistent; no surprise bypass |

**What remains blocked:** Treating this table as filled; skipping dimensions.

---

### Decision P8 — Physical sameness unresolved = reuse blocker

**Owner decision:** **Yes**.

**Policy meaning:** Target-map logs **STAGING-34B** and **MAIN-OWNER-USED** as **different physical Supabase projects** (provisional). Until owner-held map resolves sameness or documents intentional separation, **evidence reuse STAGING → MAIN is blocked** at operational level regardless of planning adoption.

**What remains blocked:** Reuse while physical identity unclear.

---

### Decision P9 — MAIN → PROD requires separate parity when split

**Owner decision:** **Yes**.

**Policy meaning:** **PROD = MAIN-OWNER-USED for now**. If **PROD** is later split to a separate physical project, **MAIN → PROD** reuse requires a **separate** parity evidence gate and **separate** production owner/security decision — not implied by this planning record.

**What remains blocked:** MAIN evidence auto-counts for future split PROD.

---

### Decision P10 — Parity evidence owner-held; git safe summaries only

**Owner decision:** **Yes**.

**Policy meaning:** Parity comparison **values** (version strings, owner names, grant summaries, path notes, diagnostics PASS/FAIL) are **owner-held security evidence** by default. Git may store **safe policy summaries** only (for example: “STAGING→MAIN reuse: **not approved**”; “parity dimensions: **pending**”; date). No parity dumps, grant matrices, or keys in git.

**What remains blocked:** Full parity dumps in repository.

---

### Decision P11 — Planning ≠ evidence transfer approval

**Owner decision:** **Yes**.

**Policy meaning:** This record defines **when** parity evidence would be required **if** reuse is ever proposed. It does **not** approve any transfer of staging snapshots, test results, diagnostics results, or FORCE posture to MAIN.

**What remains blocked:** Planning → reuse approved.

---

### Decision P12 — Reuse bundles require parity evidence + separate MAIN decision

**Owner decision:** **Yes**.

**Policy meaning:** If owner ever proposes reusing **STAGING-34B** work for **MAIN-OWNER-USED**, each bundle needs:

1. Collected parity **evidence** (separate gate — not this record).
2. **Separate MAIN** owner/security sign-off for that bundle (negative tests, snapshots, diagnostics, FORCE, or apply inference).

Bundles are **independent** — parity for snapshots does **not** automatically parity-cover tests or diagnostics.

**What remains blocked:** One parity check covers all domains; single blanket reuse approval.

---

### Decision P13 — Parity does not replace MAIN negative tests or diagnostics pass

**Owner decision:** **Yes**.

**Policy meaning:** Even **perfect** parity evidence between STAGING and MAIN does **not** replace **negative-test pass on MAIN** or **diagnostics compatibility pass on MAIN**. Parity addresses **sameness of environment**; tests address **denial behavior on the actual target**.

**What remains blocked:** Parity-only MAIN approval; parity substitutes test pass.

---

### Decision P14 — No Supabase connect in this gate

**Owner decision:** **Yes**.

**Policy meaning:** This planning record does **not** authorize Supabase connect, live queries, or side-by-side database comparison runs.

**What remains blocked:** Connect for “planning completeness.”

---

### Decision P15 — No packet, Gate 34B, apply, or SQL

**Owner decision:** **Yes**.

**Policy meaning:** Parity planning does **not** unlock execution packet draft, Gate 34B, staging apply, main apply, production apply, or SQL execution.

**What remains blocked:** Packet/apply chain via planning alone.

---

### Decision P16 — No runtime / product contours

**Owner decision:** **Yes**.

**Policy meaning:** Parity planning does **not** approve runtime/write, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, or Phase 4.

**What remains blocked:** Product integration via parity gate.

---

### Decision P17 — Stricter safety rule wins

**Owner decision:** **Yes**.

**Policy meaning:** On conflict with checklist, canonical spec, or prior owner record, **stricter child-data / no-execution rule wins**.

**What remains blocked:** Weakening reuse or no-execution posture.

---

### Decision P18 — No apply-chain unlock

**Owner decision:** **Yes**.

**Policy meaning:** **NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged. Parity planning is **one planning layer** only.

**What remains blocked:** Any implied readiness for apply.

---

## Parity transfer paths table

| From → To | Allowed by this record? | Requires (future gates) | Notes |
|-----------|-------------------------|-------------------------|-------|
| **ISOLATED-LAB** → **STAGING-34B** | **No** | N/A — lab historical only | P6 |
| **ISOLATED-LAB** → **MAIN-OWNER-USED** | **No** | N/A | P6 |
| **STAGING-34B** → **MAIN-OWNER-USED** | **No** (planning only) | Parity **evidence** + separate MAIN decision per bundle | P5, P12; optional STAGING |
| **MAIN-OWNER-USED** → **PROD** (future split) | **No** (planning only) | Separate parity gate + production decision | P9 |
| **STAGING-34B** → **PROD** | **No** | Same as STAGING→MAIN via MAIN rules | P5 |

---

## Future parity evidence collection threshold (policy only)

| Prerequisite | Satisfied by this record? |
|--------------|---------------------------|
| Parity dimension catalog adopted (P7) | **Yes** (planning) |
| Transfer rules adopted (P5, P12) | **Yes** (planning) |
| Physical target-map clarity | **No** — owner-held; P8 |
| Per-target snapshot evidence on both sides (if comparing) | **No** — separate gate |
| Owner-held parity comparison values captured | **No** — separate collection gate |
| Separate parity **evidence** gate approval | **No** |
| Separate MAIN reuse decision per bundle | **No** |
| Negative-test pass on MAIN (if inferring test reuse) | **No** |
| Diagnostics compatibility pass on MAIN (if inferring diagnostics reuse) | **No** |
| SQL / apply approval from parity work | **No** |

---

## Risk acknowledgment table

| Risk | Policy acknowledgment | Does not rush |
|------|-------------------------|---------------|
| Different physical DBs with “similar” names | T6 provisional separation | Reuse without P8 resolution |
| STAGING pass feels “good enough” for MAIN | N16 / P5 | MAIN-direct stricter path skipped |
| Parity check skipped for speed | C14 / P7 | Apply or packet |
| Diagnostics differ between targets | D16 | STAGING compatibility → MAIN |
| FORCE posture differs | F12 | STAGING FORCE → MAIN FORCE |

---

## What this closes / does not close

| Closes at docs level | Does not close |
|----------------------|----------------|
| P0–P18 parity evidence **planning** policy | Parity **evidence values** collected |
| C14 / Q12 planning side operationalized | Evidence **transfer** approved |
| Parity dimension catalog | Physical sameness **proven** |
| STAGING → MAIN transfer rules (plan) | Negative-test **execution/pass** on MAIN |
| ISOLATED-LAB exclusion for parity | Live per-target snapshot **evidence** |
| MAIN → future PROD parity rule (plan) | Diagnostics compatibility **pass** (execution) |
| Owner-held storage posture for parity evidence | FORCE **enablement** |
| | Execution packet |
| | Gate 34B / apply tracks |
| | Runtime/write / PSA / Route / operator / helper |
| | Phase 3 / Phase 4 / cleanup / migration / new project |

---

## Archive table (P0–P18)

| ID | Question summary | Owner decision | Status | Notes |
|----|------------------|----------------|--------|-------|
| P0 | Scope: planning only | Yes | Adopted | Non-execution |
| P1 | Planning ≠ evidence collected | Yes | Adopted | No reuse |
| P2 | Operationalizes C14/Q12/N16/E15/D16/F12 | Yes | Adopted | Planning side |
| P3 | MAIN/PROD primary | Yes | Adopted | Safety target |
| P4 | STAGING optional | Yes | Adopted | Not mandatory |
| P5 | STAGING ≠ MAIN | Yes | Adopted | N16/E15/D16/F12 |
| P6 | LAB ≠ STAGING/MAIN | Yes | Adopted | Historical |
| P7 | Parity dimension catalog | Yes | Adopted | C14 list |
| P8 | Physical sameness blocker | Yes | Adopted | T6 |
| P9 | MAIN→PROD separate when split | Yes | Adopted | Future |
| P10 | Owner-held parity evidence | Yes | Adopted | No dumps in git |
| P11 | Planning ≠ transfer approval | Yes | Adopted | Critical |
| P12 | Reuse = evidence + MAIN decision | Yes | Adopted | Per bundle |
| P13 | Parity ≠ MAIN test/diagnostics pass | Yes | Adopted | Separate proof |
| P14 | No Supabase connect | Yes | Adopted | This gate |
| P15 | No packet/apply/SQL | Yes | Adopted | Unchanged |
| P16 | No runtime/product | Yes | Adopted | Separate gates |
| P17 | Stricter wins | Yes | Adopted | Priority |
| P18 | No apply-chain unlock | Yes | Adopted | Posture unchanged |

---

## Recommended next gate (informational only)

This record logs **RLS parity evidence planning policy** at documentation level only. It does **not** select an execution gate, live snapshot collection, parity **evidence** collection, negative-test **execution**, redacted evidence **artifact** planning, or execution **packet**.

**NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged.

Any next checklist-priority item requires **separate read-only selection**. **Non-selected** future candidates include: redacted evidence artifact planning; negative-test **execution** gate; live snapshot **collection execution** gate; parity **evidence collection** gate; read-only migration/cleanup feasibility audit for MAIN clutter — each requires its **own** owner gate.

SQL, Supabase connect, Supabase apply, parity evidence collection, test execution, Gate 34B execution, staging apply, main apply, production apply, runtime/write implementation, Phase 2 row writes, PSA, Route, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 execution remain **forbidden** until **explicitly** approved by **separate** gates.

---

## Final boundary statement

**Owner policy (2026-05-18):** RLS FORCE RLS policy (F0–F18) per `docs/architecture/phase-2-rls-force-rls-owner-decision-record.md` — first apply: FORCE excluded; no FORCE enabled; no SQL/Supabase; no execution packet, no apply; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS live snapshot collection gate (SG0–SG18) per `docs/architecture/phase-2-rls-live-snapshot-collection-gate-owner-decision-record.md` — gate defined only; no Supabase connect; no snapshot collected; no collection execution approved; MAIN/PROD primary; STAGING optional rehearsal only; **NOT_READY_FOR_APPLY** unchanged.

**Owner policy (2026-05-18):** RLS live snapshot MAIN collection execution gate (SE0–SE20) per `docs/architecture/phase-2-rls-live-snapshot-collection-execution-gate-owner-decision-record.md` — bounded read-only MAIN connect approved for one capture session; not snapshot collected/reviewed; role labels in git only (SE17); **NOT_READY_FOR_APPLY** unchanged; apply/packet/SQL still forbidden.

Phase 2 RLS **parity evidence planning** policy is owner-adopted in this record at documentation level only (P0–P18). **NOT_READY_FOR_APPLY**, **EXECUTION_FORBIDDEN**, and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain in force. **RLS_PARITY_EVIDENCE_PLANNING_POLICY_ADOPTED_DOCS_ONLY** does **not** mean parity was checked, evidence exists, or staging results count for main. **Planning adopted ≠ parity evidence collected ≠ transfer approved ≠ apply approved.** **MAIN-OWNER-USED** / **PROD** is the **primary safety target**; **STAGING-34B** is **optional rehearsal only**. Gate 34B execution, staging apply, main / owner-used RLS policy apply, production apply, cleanup, migration, runtime/write integration, Phase 2 row writes, operational production truth, PSA publication, PSA materialization, Route Engine consumption, operator workflow, helper/pipeline integration, Phase 3, and Phase 4 LOSA execution remain **blocked** until **separate** owner-approved gates.
