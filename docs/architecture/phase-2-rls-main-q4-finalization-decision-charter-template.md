# Phase 2 RLS MAIN Q4 Finalization — Decision Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before outcome is logged |
| **Gate** | `phase-2-rls-main-q4-finalization-gate-owner-decision-record.md` (Q4F0–Q4F21; Section **W-Q4F**) |
| **Basis checkpoint** | `003a4f5` (or HEAD after Section **W-Q4F** commit) |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**Forbidden:** claiming outcome without reviewing W-post + X-post; SQL; Supabase; new tests; N12/packet/apply by implication.

---

## 1. Charter approval (owner-held)

| Field | Fill before outcome |
|-------|---------------------|
| Charter ID | e.g. `MAIN-Q4-FINAL-YYYY-MM-DD-01` |
| **OWNER** / **SECURITY_APPROVER** | yes — names **owner-held** |
| W-post / W-Q4 / X-post cited | yes |

---

## 2. Evidence acknowledged (safe facts only)

| Source | Acknowledged? |
|--------|---------------|
| W-post — client-role denial PASS | yes / no |
| W-post — no persistent rows | yes / no |
| W-Q4 — reviewed-with-limitation | yes / no |
| X-post — Route **NO_TOUCH** | yes / no |
| X-post — PSA **NO_TOUCH** | yes / no |
| X-post — diagnostics non-product | yes / no |

---

## 3. N6 finalization matrix (owner judgment)

| N6 row | Status for Q4 outcome |
|--------|------------------------|
| anon denied | closed / gap / fail |
| authenticated denied | closed / gap / fail |
| app/browser shortcut denied | closed / gap / fail |
| Route raw Phase 2 denied | closed (no wiring) / gap / fail |
| PSA raw Phase 2 denied | closed (no wiring) / gap / fail |
| writes denied | closed / gap / fail |
| diagnostics ≠ published truth | closed / gap / fail |
| diagnostics ≠ go-live | closed / gap / fail |

---

## 4. Outcome selection (pick exactly one)

| Code | Selected? |
|------|-----------|
| `Q4_FULL_PASS_CLAIMED` | yes / no |
| `Q4_PASS_WITH_DOCUMENTED_GAPS` | yes / no |
| `Q4_FINALIZATION_NOT_READY_STOP` | yes / no |

**If `Q4_PASS_WITH_DOCUMENTED_GAPS`:** list accepted gaps (owner-held detail; safe labels in git only):

- _e.g. app/browser NOT_TESTED accepted for current scope_
- _e.g. diagnostics N6 rows classified non-product only_

---

## 5. Posture after outcome (fill per selected code)

| Field | Value |
|-------|--------|
| NOT_READY_FOR_APPLY | unchanged / note if owner separately changes |
| EXECUTION_PACKET_DRAFT_FORBIDDEN | unchanged (default) |
| N12 claimed | **no** (default unless separate gate) |
| Next gate | _e.g. N12 planning / apply-preconditions review / STOP_ |

---

## 6. Sign-off (owner-held)

| Role | Approved? | Date |
|------|-----------|------|
| OWNER | | |
| SECURITY_APPROVER | | |
