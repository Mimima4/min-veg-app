# Phase 3 PSA Execution — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before any PSA execution prompt discussion |
| **Gate** | `phase-3-psa-execution-approval-owner-decision-record.md` (P3PSAA0–P3PSAA12; Section **P3-PSA-APPROVAL**) |
| **Basis checkpoint** | _(record at adoption commit)_ |
| **Prior chain** | **P3-RW-POST** (`f412bea`); scaffold `7ed7014` |
| **Operational framework** | `phase-3-psa-materialization-publication-gate-owner-decision-record.md` (Section **P3-PSA**) |

**Forbidden at template level:** treating this template as PSA session approval; git commit of filled charter body if sensitive; PSA materialization/publication **execution**; DB writes; SQL/Supabase; Route Engine consumption; production/staging deploy; **X-post** Route/PSA product runtime changes; wiring `phase3-operationalization` into PSA product paths; clearing **NOT_READY_FOR_APPLY**.

**Reminder:** **P3-PSA-APPROVAL** adopted (**P3PSAA0–P3PSAA12** **Yes**) permits **charter preparation** only. A bounded session still requires: this filled charter + pre-session QA **PASS** + **separate** owner PSA execution prompt.

**Default conservative scope:** PSA **planning** extensions under `src/lib/phase3-operationalization/**` only — **no** PSA materialization/publication execution unless OWNER + SECURITY_APPROVER explicitly amend charter.

---

## Charter boundary statement (binding)

| Boundary | Fill |
|----------|------|
| Owner-held PSA charter | yes |
| Repo commit of filled charter (if sensitive) | **no** |
| PSA execution session approved (this template alone) | **no** |
| PSA materialization/publication execution (this template alone) | **no** |
| DB writes / Supabase connect (this template alone) | **no** |
| Route activation (this template alone) | **no** |
| **X-post** Route/PSA product runtime (this template alone) | **no** |
| Clears **NOT_READY_FOR_APPLY** | **no** |
| **P3-RW-POST** implies PSA permission (this template alone) | **no** |

---

## 1. Charter approval (owner-held)

| Field | Fill before session discussion |
|-------|--------------------------------|
| Charter ID | e.g. `P3-PSA-EXEC-YYYY-MM-DD-01` |
| Session ID (when assigned) | e.g. `P3-PSA-SESSION-YYYY-MM-DD-01` |
| **OWNER** (identity owner-held) | yes / no |
| **SECURITY_APPROVER** (identity owner-held) | yes / no |
| Charter preparation completed (UTC) | YYYY-MM-DD |
| P3-PSA-APPROVAL gate cited | yes / no |
| P3-RW-POST cited (scaffold isolated) | yes / no |
| Rollback owner role label (git-safe) | e.g. `ROLLBACK_OWNER` |

---

## 2. Bounded PSA scope (owner-held detail)

### 2.1 Targets (default conservative — override only with OWNER + SECURITY_APPROVER)

| # | Target | Repo-safe reference |
|---|--------|---------------------|
| 1 | `src/lib/phase3-operationalization/**` PSA **planning** extensions only | No imports into `src/app/**`, `src/server/**`, API, UI, PSA product paths |
| 2 | — | No other paths without charter amendment |

### 2.2 Non-goals (strict defaults)

| # | Non-goal |
|---|----------|
| 1 | PSA materialization or publication execution |
| 2 | DB writes / migrations / SQL execution |
| 3 | Supabase connect or execute |
| 4 | Route Engine consumption / production Route wiring |
| 5 | Runtime/write path activation in product code |
| 6 | Production truth population |
| 7 | Phase 4 / LOSA |
| 8 | Production or staging deploy |
| 9 | **X-post** Route/PSA product runtime changes |
| 10 | Wiring scaffold into PSA product paths |

### 2.3 Forbidden paths (explicit)

| Area | Status |
|------|--------|
| `supabase/**` | **forbidden** |
| `src/app/**`, `src/app/api/**` | **forbidden** (default) |
| `src/server/**` | **forbidden** (default) |
| PSA / Route **product** paths | **forbidden** (default) |
| Owner-held leakage into git | **forbidden** |

### 2.4 Allowed session actions (only after separate PSA execution prompt)

| Allowed | Boundary |
|---------|----------|
| Planning extensions under `src/lib/phase3-operationalization/**` | Per §2.1 only |
| Repo-safe notes | No secrets |
| Tests | Only if explicitly listed in execution prompt |

---

## 3. Documented gaps disposition (required)

| Gap / carry-forward | Status |
|---------------------|--------|
| **X-post** Route/PSA product runtime | **NO_TOUCH** |
| **2B.25** / **2B.26** | **NOT_RUN** — not closed |
| **P3-ROUTE** | **not approved** |
| Production truth | **not closed** |
| **NOT_READY_FOR_APPLY** | **unchanged** |
| Scaffold (incl. **P3-RW-POST** at `f412bea`) | **non-wired** |

---

## 4. Preconditions (owner-held checklist)

| Check | Confirmed? |
|-------|------------|
| P3-PSA-APPROVAL adopted (P3PSAA0–P3PSAA12 **Yes**) | yes / no |
| P3-RW-POST recorded | yes / no |
| Scope matches default conservatism | yes / no |
| **X-post** **NO_TOUCH** acknowledged | yes / no |
| **FAIL/UNCLEAR => STOP (N11)** accepted | yes / no |

---

## 5. Rollback / safe-state (owner-held detail)

| Field | Fill |
|-------|------|
| Baseline ref | e.g. `main` at `f412bea` or tip at prompt time |
| Rollback steps | Git revert of `src/lib/phase3-operationalization/**` only |
| DB posture on rollback | **unchanged** |

---

## 6. Pre-session QA (required before PSA execution prompt)

| QA item | Result |
|---------|--------|
| Charter complete | PASS / FAIL / UNCLEAR |
| Scope vs forbidden | PASS / FAIL / UNCLEAR |
| Gap register (**X-post**) | PASS / FAIL / UNCLEAR |
| Rollback complete | PASS / FAIL / UNCLEAR |
| **Overall** | PASS / FAIL / UNCLEAR |

**FAIL/UNCLEAR => STOP** — no PSA execution prompt.

---

## 7. Posture statement

| Field | Value |
|-------|--------|
| PSA session approved by this charter | **no** |
| Separate PSA execution prompt required | **yes** |
| DB writes / SQL / Supabase approved | **no** |
| Route approved | **no** |
| Clears **NOT_READY_FOR_APPLY** | **no** |

---

## Final charter statement

This owner-held charter documents preparation for **one** bounded Phase 3 PSA **planning** session under **P3-PSA-APPROVAL**. It is **not** PSA execution approval, **not** an execution prompt, and **not** PSA materialization/publication. Filled charter + pre-session QA **PASS** + **separate** PSA execution prompt are required before any bounded work.
