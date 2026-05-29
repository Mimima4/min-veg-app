# Phase 3 Runtime/Write Execution — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before any runtime/write execution prompt discussion |
| **Gate** | `phase-3-runtime-write-execution-approval-owner-decision-record.md` (P3RWA0–P3RWA12; Section **P3-RW-APPROVAL**) |
| **Basis checkpoint** | `f4d0622` (P3-RW-APPROVAL adopted) |
| **Prior chain** | **P3-IMPL-POST** (`b82c678`); scaffold `7ed7014` |
| **Operational framework** | `phase-3-runtime-write-execution-gate-owner-decision-record.md` (Section **P3-RW**) |

**Forbidden at template level:** treating this template as runtime/write session approval; git commit of filled charter body if sensitive; runtime/write path **activation** in app/server/API/UI; DB writes; SQL/Supabase; PSA materialization/publication; Route Engine consumption; production/staging deploy; wiring `phase3-operationalization` into product runtime; clearing **NOT_READY_FOR_APPLY**.

**Reminder:** **P3-RW-APPROVAL** adopted (**P3RWA0–P3RWA12** **Yes**) permits **charter preparation** only. A bounded session still requires: this filled charter + pre-session QA **PASS** + **separate** owner runtime/write execution prompt.

**Default conservative scope:** planning extensions under `src/lib/phase3-operationalization/**` only — **no** write-path activation unless OWNER + SECURITY_APPROVER explicitly amend charter.

---

## Charter boundary statement (binding)

| Boundary | Fill |
|----------|------|
| Owner-held runtime/write charter | yes |
| Repo commit of filled charter (if sensitive) | **no** |
| Runtime/write execution session approved (this template alone) | **no** |
| Write-path activation in app/server/API/UI (this template alone) | **no** |
| DB writes / Supabase connect (this template alone) | **no** |
| PSA / Route activation (this template alone) | **no** |
| Clears **NOT_READY_FOR_APPLY** | **no** |
| **P3-IMPL-POST** scaffold wired to runtime (this template alone) | **no** |

---

## 1. Charter approval (owner-held)

| Field | Fill before session discussion |
|-------|--------------------------------|
| Charter ID | e.g. `P3-RW-EXEC-YYYY-MM-DD-01` |
| Session ID (when assigned) | e.g. `P3-RW-SESSION-YYYY-MM-DD-01` |
| **OWNER** (identity owner-held) | yes / no |
| **SECURITY_APPROVER** (identity owner-held) | yes / no |
| Charter preparation completed (UTC) | YYYY-MM-DD |
| P3-RW-APPROVAL gate cited | yes / no |
| P3-IMPL-POST cited (scaffold isolated) | yes / no |
| Rollback owner role label (git-safe) | e.g. `ROLLBACK_OWNER` |

---

## 2. Bounded runtime/write scope (owner-held detail)

### 2.1 Targets (default conservative — override only with OWNER + SECURITY_APPROVER)

| # | Target | Repo-safe reference |
|---|--------|---------------------|
| 1 | `src/lib/phase3-operationalization/**` planning/boundary extensions only | No imports into `src/app/**`, `src/server/**`, API, UI |
| 2 | — | No other paths without charter amendment |

### 2.2 Non-goals (strict defaults)

| # | Non-goal |
|---|----------|
| 1 | Runtime/write path activation in product code |
| 2 | DB writes / migrations / SQL execution |
| 3 | Supabase connect or execute |
| 4 | PSA materialization or publication |
| 5 | Route Engine consumption / production Route wiring |
| 6 | Production truth population |
| 7 | Phase 4 / LOSA |
| 8 | Production or staging deploy |
| 9 | Wiring scaffold into app/server/API |

### 2.3 Forbidden paths (explicit)

| Area | Status |
|------|--------|
| `supabase/**` | **forbidden** |
| `src/app/**`, `src/app/api/**` | **forbidden** (default) |
| `src/server/**` | **forbidden** (default) |
| PSA / Route product paths | **forbidden** |
| Owner-held leakage into git | **forbidden** |

### 2.4 Allowed session actions (only after separate runtime/write execution prompt)

| Allowed | Boundary |
|---------|----------|
| Planning extensions under `src/lib/phase3-operationalization/**` | Per §2.1 only |
| Repo-safe notes | No secrets |
| Tests | Only if explicitly listed in execution prompt |

---

## 3. Documented gaps disposition (required)

| Gap / carry-forward | Status |
|---------------------|--------|
| **X-post** Route/PSA | **NO_TOUCH** |
| **2B.25** / **2B.26** | **NOT_RUN** — not closed |
| **P3-PSA** / **P3-ROUTE** | **not approved** |
| Production truth | **not closed** |
| **NOT_READY_FOR_APPLY** | **unchanged** |
| Scaffold at `7ed7014` | **non-wired** |

---

## 4. Preconditions (owner-held checklist)

| Check | Confirmed? |
|-------|------------|
| P3-RW-APPROVAL adopted (P3RWA0–P3RWA12 **Yes**) | yes / no |
| P3-IMPL-POST recorded | yes / no |
| Scope matches default conservatism | yes / no |
| **FAIL/UNCLEAR => STOP (N11)** accepted | yes / no |

---

## 5. Rollback / safe-state (owner-held detail)

| Field | Fill |
|-------|------|
| Baseline ref | e.g. `main` at `7ed7014` or tip at prompt time |
| Rollback steps | Git revert of `src/lib/phase3-operationalization/**` only |
| DB posture on rollback | **unchanged** |

---

## 6. Pre-session QA (required before runtime/write execution prompt)

| QA item | Result |
|---------|--------|
| Charter complete | PASS / FAIL / UNCLEAR |
| Scope vs forbidden | PASS / FAIL / UNCLEAR |
| Gap register | PASS / FAIL / UNCLEAR |
| Rollback complete | PASS / FAIL / UNCLEAR |
| **Overall** | PASS / FAIL / UNCLEAR |

**FAIL/UNCLEAR => STOP** — no runtime/write execution prompt.

---

## 7. Posture statement

| Field | Value |
|-------|--------|
| Runtime/write session approved by this charter | **no** |
| Separate runtime/write execution prompt required | **yes** |
| DB writes / SQL / Supabase approved | **no** |
| PSA / Route approved | **no** |
| Clears **NOT_READY_FOR_APPLY** | **no** |

---

## Final charter statement

This owner-held charter documents preparation for **one** bounded Phase 3 runtime/write planning session under **P3-RW-APPROVAL**. It is **not** runtime/write execution approval, **not** an execution prompt, and **not** write-path activation. Filled charter + pre-session QA **PASS** + **separate** runtime/write execution prompt are required before any bounded work.
