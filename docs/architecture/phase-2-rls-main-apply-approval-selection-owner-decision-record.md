# Phase 2 RLS MAIN Apply Approval Selection Owner/Security Decision Record

## Snapshot / status

| Field | Value |
|-------|--------|
| **Status** | Owner/security apply-approval branch selected at docs level |
| **Closure label** | `RLS_MAIN_APPLY_APPROVAL_SELECTION_RECORDED` |
| **Scope** | One bounded docs-only selection step for apply approval branch on **MAIN-OWNER-USED** |
| **Date (UTC)** | 2026-05-28 |
| **Control reference** | `docs/architecture/phase-2-closure-criteria-checklist.md` — Section **Z-APPSEL** |

This record selects the apply approval branch after `Z-APC-post` as the next controlled governance direction.

This record does **not** approve apply execution, SQL execution, Supabase connect, runtime/write, or `NOT_READY_FOR_APPLY` clearance issuance.

---

## Owner/security selection decisions (APS0–APS7)

### Decision APS0 — Scope is docs-only branch selection
**Owner/security decision:** **Yes.** Selection only.

### Decision APS1 — Preconditions accepted
**Owner/security decision:** **Yes.** Inputs include `Z-AP`, `Z-APC`, and `Z-APC-post`.

### Decision APS2 — Apply approval branch selected
**Owner/security decision:** **Yes.** Apply approval is selected as the next branch.

### Decision APS3 — No execution permissions by selection
**Owner/security decision:** **Yes.** No SQL/connect/apply execution permission granted here.

### Decision APS4 — NOT_READY_FOR_APPLY unchanged
**Owner/security decision:** **Yes.** Clearance remains not issued.

### Decision APS5 — Runtime/write remains deferred
**Owner/security decision:** **Yes.** Deferred until separate approval.

### Decision APS6 — Stop/priority rules preserved
**Owner/security decision:** **Yes.** `FAIL/UNCLEAR => STOP (N11)` and stricter-rule-wins remain binding.

### Decision APS7 — Boundaries preserved
**Owner/security decision:** **Yes.** No apply execution approval, no runtime/write approval, no PSA/Route activation, no Phase 3/4 start.

---

## Final boundary statement

Section **Z-APPSEL** records apply approval branch selection only. It preserves all execution boundaries and does not change `NOT_READY_FOR_APPLY`.
