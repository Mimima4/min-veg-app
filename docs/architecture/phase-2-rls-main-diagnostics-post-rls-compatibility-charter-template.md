# Phase 2 RLS MAIN Diagnostics Post-RLS Compatibility — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** storage before session; **do not** commit secrets, raw diagnostic JSON, or connection details to git |
| **Gate** | `docs/architecture/phase-2-rls-main-diagnostics-post-rls-compatibility-execution-gate-owner-decision-record.md` (PC0–PC21; Section **V** when adopted) |
| **Planning policy** | `docs/architecture/phase-2-rls-diagnostics-compatibility-planning-owner-decision-record.md` (D0–D20) |
| **Basis checkpoint** | `e6eaa9f` (or current HEAD after Section **V** gate commit) |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**This template does not authorize the session by itself.** Session requires adopted **PC0–PC21**, **OWNER** / **SECURITY_APPROVER** charter approval (owner-held), completed **U-post** deny apply, completed **R-post** pre-RLS baseline, and **same approved consumer** as R-post unless owner documents an intentional parameter change owner-held.

**Forbidden under this charter:** Tranche B; write-denial tests; **INSERT** / **UPDATE** / **DELETE** / any **DML**; test rows; RLS/policy changes; **GRANT** / **REVOKE**; new helper consumers; readiness/pipeline/Route/PSA integration tests beyond observe-only contract outputs.

---

## 1. Charter approval (owner-held)

| Field | Fill before connect |
|-------|---------------------|
| Charter ID (optional) | e.g. `MAIN-POST-RLS-DIAG-YYYY-MM-DD-01` |
| Charter date (UTC) | |
| **OWNER** approval | yes / no — name/email **owner-held** |
| **SECURITY_APPROVER** approval | yes / no — name/email **owner-held** |
| PC gate record cited | `phase-2-rls-main-diagnostics-post-rls-compatibility-execution-gate-owner-decision-record.md` |
| U-post cited | `phase-2-rls-main-deny-posture-apply-review-summary.md` |
| R-post cited | `phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md` |

---

## 2. Roles (labels in charter; humans owner-held)

| Role label | Assigned? | Real name/email storage |
|------------|-----------|-------------------------|
| **TECH_EXECUTOR** | yes / no | **owner-held** |
| **OWNER** (RLS-path verdict) | yes / no | **owner-held** |
| **SECURITY_APPROVER** (RLS-path verdict) | yes / no | **owner-held** |
| **ROLLBACK_OWNER** (if FAIL/UNCLEAR) | yes / no | **owner-held** |

---

## 3. Preconditions confirmed

| Prerequisite | Confirmed? | Reference |
|--------------|------------|-----------|
| MAIN Option B deny apply + U-post review | yes / no | RLS on all 7; FORCE off; 14 policies; rows 0 |
| MAIN pre-RLS baseline + R-post review | yes / no | PASS_BASELINE_CAPTURED |
| **PC execution gate adopted** | yes / no | PC0–PC21 |
| Approved consumer only | yes / no | `scripts/diagnose-school-identity-phase2-readonly.mjs` |
| Command parameters | same as R-post / changed | **owner-held** values if used |
| Tranche B **not** in this session | yes / no | Required **yes** |
| Write-denial / DML **not** in scope | yes / no | Required **yes** |

---

## 4. Session execution (owner-held log)

| Field | Record owner-held |
|-------|-------------------|
| Session start (UTC) | |
| Session end (UTC) | |
| Consumer script path | (contract-approved only) |
| phase2SchemaAvailable | true / false |
| phase2DiagnosticsWarning | none / code: ______ |
| identityResolutionSummary counters | (full values owner-held) |
| identityResolutionBySchoolCode | empty / entries (owner-held detail) |
| Sensitive output observed | none / describe owner-held |
| Tool-layer notes | |

---

## 5. Before/after comparison (required)

| Check | Pre-RLS (R-post) | Post-RLS (this session) | Consistent? |
|-------|------------------|-------------------------|-------------|
| phase2SchemaAvailable | | | |
| phase2DiagnosticsWarning | none | | |
| observationsCount | 0 | | |
| All summary counters 0 | yes | | |
| identityResolutionBySchoolCode empty | yes | | |
| MAIN row counts (U-post) | all 0 | n/a (tool) | |

**Material divergence without documented cause** → default **UNCLEAR** or **FAIL** (not silent PASS).

---

## 6. RLS-path verdict (OWNER / SECURITY_APPROVER — after review)

| Verdict | Select one |
|---------|------------|
| **PASS** | Compatibility acceptable for **discussion** of future gates only |
| **FAIL** | **Stop**; rollback trigger candidate |
| **UNCLEAR** | **Stop**; unresolved |

| Field | Value |
|-------|--------|
| Verdict date (UTC) | |
| Rollback invoked | yes / no — if yes, cite owner-held rollback artifact |
| Tranche B approved by this verdict | **no** (always) |
| Q4 / N12 pass claimed | **no** (always) |
| NOT_READY_FOR_APPLY | **unchanged** (default); not cleared by this verdict unless separate owner decision |

---

## 7. Storage posture

| Class | Location |
|-------|----------|
| Full JSON, logs, CLI parameters | **owner-held** |
| Safe summary for git (**V-post**) | repo doc only after review — no secrets, no raw JSON |

**Prohibited in git:** project_ref, keys, connection strings, raw dumps, per-school maps, real names/emails.

---

## 8. Related records

- `phase-2-read-only-diagnostics-contract.md`
- `phase-2-read-only-diagnostics-helper-boundary-adr.md`
- `phase-2-rls-main-deny-posture-apply-review-summary.md` (U-post)
- `phase-2-rls-main-diagnostics-pre-rls-baseline-review-summary.md` (R-post)
- Future: `phase-2-rls-main-diagnostics-post-rls-compatibility-review-summary.md` (**V-post**)
