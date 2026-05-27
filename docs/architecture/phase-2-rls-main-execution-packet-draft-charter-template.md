# Phase 2 RLS MAIN Execution Packet Draft — Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before draft preparation |
| **Gate** | `phase-2-rls-main-execution-packet-draft-gate-owner-decision-record.md` (EPD0–EPD25; Section **Z-D**) |
| **Basis checkpoint (Z-planning-outcome)** | `cf0f7b1` (or HEAD after Section **Z-D** commit) |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**Forbidden:** git commit of packet SQL/rollback; Supabase execution; U-post re-apply (default); treating draft prep as execution approval.

**U-post reminder:** Deny posture **already applied**. Default draft scope is **post-apply**.

---

## Charter boundary statement (binding)

| Boundary | Fill |
|----------|------|
| Owner-held draft charter | yes |
| Repo commit of packet body | **no** |
| Packet execution approved | **no** |
| Re-run U-post SQL (default) | **no** |
| Clears **NOT_READY_FOR_APPLY** | **no** |
| Git **EXECUTION_PACKET_DRAFT_FORBIDDEN** lifted | **no** |

---

## 1. Charter approval (owner-held)

| Field | Fill before draft work |
|-------|------------------------|
| Charter ID | e.g. `MAIN-EP-DRAFT-YYYY-MM-DD-01` |
| **OWNER** (identity owner-held) | yes / no |
| **SECURITY_APPROVER** (identity owner-held) | yes / no |
| **Draft preparation authorized (UTC)** | YYYY-MM-DD |
| Z-planning-outcome cited | yes / no |
| U-post cited (deny already applied) | yes / no |

---

## 2. Default packet scope acknowledgment

| Item | Acknowledged? |
|------|---------------|
| Post-apply scope (not repeat U-post deny apply by default) | yes / no |
| Gaps register required in draft | yes / no |
| STAGING packet = reference only | yes / no |
| Partial N12 (`N12_PASS_WITH_DOCUMENTED_GAPS`) | yes / no |

---

## 3. Owner-held draft sections (checklist)

| Field | Fill when draft prep complete |
|-------|------------------------------|
| **Draft preparation completed (UTC)** | YYYY-MM-DD |

| Section | Included in owner-held draft? |
|---------|------------------------------|
| Target verification (**MAIN-OWNER-USED**) | yes / no |
| Current posture summary (U-post ref) | yes / no |
| Gap / open-items register | yes / no |
| Rollback reference (bundle ID only) | yes / no |
| Verification / stop blocks for future execution | yes / no |
| Forbidden-without-separate-gate list | yes / no |
| Accountability placeholders | yes / no |
| DDL section (if any) flagged for SQL_REVIEWER | yes / no / n/a |

---

## 4. Documented gaps (must remain visible in draft)

| Gap | Carried into draft? |
|-----|---------------------|
| app/browser **NOT_TESTED** | yes / no |
| diagnostics N6 **NOT_TESTED** | yes / no |
| `N12_PASS_CLAIMED` not satisfied | yes / no |
| Route/PSA re-review on change | yes / no |

---

## 5. Posture (unchanged)

| Field | Value |
|-------|--------|
| **NOT_READY_FOR_APPLY** | unchanged |
| Git packet draft | forbidden |
| Packet execution | forbidden until separate gate |

---

## 6. Possible later execution-gate labels (not claimed now — do not edit)

| Code | Selected by this charter? | Meaning (separate execution gate only) |
|------|---------------------------|----------------------------------------|
| `EXECUTION_GATE_NOT_READY_STOP` | **no** (fixed) | Stop (N11) |
| `EXECUTION_GATE_READY_WITH_DOCUMENTED_GAPS` | **no** (fixed) | May discuss execution gate with gaps |
| `EXECUTION_GATE_READY_FULL` | **no** (fixed) | Preconditions met for execution gate discussion |

---

## 7. Sign-off (owner-held — draft preparation authorized)

| Role | Approved? | Date (UTC) |
|------|-----------|------------|
| **OWNER** | yes / no | |
| **SECURITY_APPROVER** | yes / no | |

---

## 8. Candidate draft status (not repo truth)

| Field | Fill |
|-------|------|
| Recommended candidate after draft prep | e.g. `DRAFT_COMPLETE_WITH_DOCUMENTED_GAPS` |
| Candidate = execution approved? | **no** (must stay **no**) |
| Separate execution-gate prompt required? | **yes** |

---

## Final charter statement (fill when complete)

This owner-held charter authorizes **bounded preparation** of a MAIN execution packet **draft** per Section **Z-D**. It is **not** packet execution and **not** apply clearance. U-post deny posture remains **already applied**. Packet body stays **owner-held** only.
