# Phase 3 Implementation Execution — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before any implementation-execution prompt discussion |
| **Gate** | `phase-3-implementation-execution-approval-owner-decision-record.md` (P3IA0–P3IA12; Section **P3-IMPL-APPROVAL**) |
| **Basis checkpoint** | `5941f66` (P3-IMPL-APPROVAL adopted) |
| **Operational framework** | `phase-3-implementation-gate-owner-decision-record.md` (Section **P3-IMPL**) |

**Forbidden at template level:** treating this template as implementation session approval; git commit of filled charter body if sensitive; runtime/write; DB writes; SQL/Supabase (unless charter explicitly cites a **separate** already-approved read-only diagnostics path); PSA materialization/publication; Route Engine consumption; production/staging deploy; clearing **NOT_READY_FOR_APPLY**.

**Reminder:** **P3-IMPL-APPROVAL** adopted (**P3IA0–P3IA12** **Yes**) permits **charter preparation** only. A bounded code session still requires: this filled charter + pre-session QA **PASS** + **separate** owner implementation-execution prompt.

---

## Charter boundary statement (binding)

| Boundary | Fill |
|----------|------|
| Owner-held implementation charter | yes |
| Repo commit of filled charter (if sensitive) | **no** |
| Implementation execution session approved (this template alone) | **no** |
| Supabase connect approved (this template alone) | **no** |
| Runtime/write approved (this template alone) | **no** |
| PSA / Route activation approved (this template alone) | **no** |
| Clears **NOT_READY_FOR_APPLY** | **no** |
| Phase 2 → Phase 3 gate passed (this template alone) | **no** |

---

## 1. Charter approval (owner-held)

| Field | Fill before session discussion |
|-------|--------------------------------|
| Charter ID | e.g. `P3-IMPL-EXEC-YYYY-MM-DD-01` |
| Session ID (when assigned) | e.g. `P3-IMPL-SESSION-YYYY-MM-DD-01` |
| **OWNER** (identity owner-held) | yes / no |
| **SECURITY_APPROVER** (identity owner-held) | yes / no |
| Charter preparation completed (UTC) | YYYY-MM-DD |
| P3-IMPL-APPROVAL gate cited | yes / no |
| P3-IMPL operational framework cited | yes / no |
| Rollback owner role label (git-safe) | e.g. `ROLLBACK_OWNER` |

---

## 2. Bounded implementation scope (owner-held detail; repo-safe summary optional)

### 2.1 Targets (in scope for one session)

| # | Target surface / module (paths or labels) | Repo-safe reference only |
|---|-------------------------------------------|--------------------------|
| 1 | | |
| 2 | | |
| 3 | | |

### 2.2 Non-goals (explicit out of scope)

| # | Non-goal |
|---|----------|
| 1 | Runtime/write path activation |
| 2 | DB schema/RLS/migrations/SQL execution |
| 3 | PSA materialization or publication |
| 4 | Route Engine consumption / production Route wiring |
| 5 | Production truth population / operational production-resolution |
| 6 | Phase 4 / LOSA work |
| 7 | Production or staging deploy |

### 2.3 Allowed session actions (if connect-approval prompt later issued)

| Allowed | Boundary |
|---------|----------|
| Bounded application/source edits | Only rows in §2.1 |
| Repo-safe architecture notes | Required by scope only; no secrets |
| Local dev verification | No production deploy |

---

## 3. Documented gaps disposition (required)

| Gap / carry-forward | Status in charter |
|---------------------|-------------------|
| **X-post** Route/PSA product runtime | **NO_TOUCH** |
| **W-Q4F-post** / **Z-OCLOSE-post** Q4/N12 limitations | recorded — full pass not claimed |
| **2B.25** operational step | **NOT_RUN** — not treated as closed |
| **2B.26** operational step | **NOT_RUN** — not treated as closed |
| Operational production truth | **not closed** |
| Runtime/write (**P3-RW**) | **not approved** |
| PSA (**P3-PSA**) | **not approved** |
| Route (**P3-ROUTE**) | **not approved** |
| **NOT_READY_FOR_APPLY** | **unchanged** |
| Phase 2 → Phase 3 gate | **not passed** |

**Rule:** Any gap marked **blocking** => no implementation-execution prompt until resolved or explicitly re-approved by OWNER + SECURITY_APPROVER.

---

## 4. Preconditions (owner-held checklist)

| Check | Confirmed? |
|-------|------------|
| P3-IMPL-APPROVAL adopted (P3IA0–P3IA12 **Yes**) | yes / no |
| Scope matches **P3IA-ALLOWED** in approval gate record | yes / no |
| No scope creep into **P3IA-FORBID** areas | yes / no |
| Child-data / safety boundaries unchanged | yes / no |
| No raw PII/secrets/credentials in git artifacts | yes / no |
| Stricter-rule-wins / **FAIL/UNCLEAR => STOP (N11)** accepted | yes / no |

---

## 5. Rollback / safe-state (owner-held detail)

| Field | Fill |
|-------|------|
| Baseline ref (branch/commit label) | |
| Rollback steps (revert / flag — detail owner-held) | |
| Good restored state definition | last repo-safe baseline before session |
| DB posture on app rollback | unchanged unless separate DB gate |
| Session halt on FAIL/UNCLEAR | yes / no |

---

## 6. Pre-session QA (required before implementation-execution prompt)

| QA item | Result |
|---------|--------|
| Charter complete (§1–§5) | PASS / FAIL / UNCLEAR |
| Scope vs forbidden actions | PASS / FAIL / UNCLEAR |
| Gap register present | PASS / FAIL / UNCLEAR |
| Rollback section complete | PASS / FAIL / UNCLEAR |
| **Overall pre-session QA** | PASS / FAIL / UNCLEAR |

**Rule:** **FAIL** or **UNCLEAR** => **STOP** — no implementation-execution prompt.

Repo-safe QA summary ID (optional): e.g. `P3-IMPL-PRE-QA-YYYY-MM-DD-01`

---

## 7. Posture statement

| Field | Value |
|-------|--------|
| Implementation execution session approved by this charter alone | **no** |
| Separate implementation-execution prompt still required | **yes** |
| Runtime/write approved | **no** |
| DB writes / SQL / Supabase approved | **no** |
| PSA / Route approved | **no** |
| Clears **NOT_READY_FOR_APPLY** | **no** |

---

## Final charter statement

This owner-held charter documents preparation for **one** bounded Phase 3 implementation execution session under **P3-IMPL-APPROVAL**. It is **not** implementation execution approval, **not** runtime/write approval, **not** DB/SQL approval, **not** PSA/Route approval, and **not** NOT_READY_FOR_APPLY clearance. Filled charter + pre-session QA **PASS** + **separate** owner implementation-execution prompt are all required before any code session.
