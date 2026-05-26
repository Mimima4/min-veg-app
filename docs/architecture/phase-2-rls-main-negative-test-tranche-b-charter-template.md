# Phase 2 RLS MAIN Tranche B (Q4-Blocking Deny Pass) — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before session |
| **Tranche** | `Q4_BLOCKING_DENY_PASS` (**Tranche B only**) |
| **Gate** | `phase-2-rls-main-negative-test-tranche-b-execution-gate-owner-decision-record.md` (TB0–TB21; Section **W**) |
| **Basis checkpoint** | `90f0794` (or HEAD after Section **W** commit) |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**Forbidden:** successful DML; persistent test rows; RLS/policy changes; GRANT/REVOKE; further deny apply; using service_role success as product pass; claiming Q4/N12 pass before review.

**Allowed (bounded):** product-facing denial tests per N6; write **attempts** expecting **denial** only.

---

## 1. Charter approval (owner-held)

| Field | Fill before connect |
|-------|---------------------|
| Charter ID | e.g. `MAIN-TB-Q4-YYYY-MM-DD-01` |
| **OWNER** / **SECURITY_APPROVER** | yes — names **owner-held** |
| U-post / V-post cited | yes |

---

## 2. Preconditions

| Prerequisite | Confirmed? |
|--------------|------------|
| U-post — RLS on all 7; 14 policies; rows 0 | yes / no |
| V-post — RLS-path PASS | yes / no |
| TB gate adopted | yes / no |
| Tranche A **not** re-run | yes / no |

---

## 3. N6 outcome checklist (owner-held detail; safe labels in W-post)

| N6 outcome (plan) | Pass / Fail / Unclear | Notes owner-held |
|-------------------|----------------------|------------------|
| Visitors / anonymous denied | | |
| Ordinary logged-in denied | | |
| App/browser direct DB shortcut denied | | |
| Route raw Phase 2 access denied | | If not wired → **UNCLEAR** |
| PSA/publication raw access denied | | If not wired → **UNCLEAR** |
| Writes denied (attempts only) | | |
| Diagnostics ≠ published truth | | |
| Diagnostics ≠ go-live gate | | |

---

## 4. Verdict (after review)

| Field | Value |
|-------|--------|
| Q4-blocking pass claimed | **no** until OWNER review — then yes/no in **W-post** only |
| N12 packet pass | **no** (always at charter) |
| NOT_READY_FOR_APPLY | **unchanged** (default) |
| Rollback invoked | yes / no |

---

## Related

- `phase-2-rls-negative-test-plan-owner-decision-record.md` (N6)
- `phase-2-rls-main-negative-test-tranche-b-review-summary-template.md` — copy after session → commit as **W-post** safe summary when reviewed
