# Phase 2 RLS MAIN Execution Packet Draft Planning — Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before planning review |
| **Gate** | `phase-2-rls-main-execution-packet-draft-planning-gate-owner-decision-record.md` (EPDP0–EPDP25; Section **Z**) |
| **Basis checkpoint (Y-N12-outcome)** | `4b2e184` |
| **Section Z gate checkpoint** | `fa5b602` (or HEAD after Section **Z** commit) |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**Forbidden:** treating planning as packet draft approval; re-running U-post deny apply; SQL; Supabase; packet execution; apply by implication.

**U-post reminder (binding):** Deny posture is **already applied** on MAIN. Planning defines a **future draft outline** only.

---

## Charter boundary statement (binding)

| Boundary | Fill |
|----------|------|
| Owner-held planning charter | yes |
| Repo commit | **no** |
| Execution packet draft approved | **no** |
| Execution packet executed | **no** |
| Re-run U-post SQL bundle | **no** |
| Clears **NOT_READY_FOR_APPLY** | **no** |
| Clears **EXECUTION_PACKET_DRAFT_FORBIDDEN** | **no** |

---

## 1. Charter approval (owner-held)

| Field | Fill before planning review |
|-------|----------------------------|
| Charter ID | e.g. `MAIN-EP-DRAFT-PLAN-YYYY-MM-DD-01` |
| **OWNER** approval (identity owner-held only) | yes / no |
| **SECURITY_APPROVER** approval (identity owner-held only) | yes / no |
| **Planning review authorization date (UTC)** | YYYY-MM-DD |
| Y-N12-outcome cited | yes / no (`N12_PASS_WITH_DOCUMENTED_GAPS`) |
| U-post cited (deny already applied) | yes / no |

---

## 2. Current MAIN posture (planning input — not re-apply)

| Fact | Acknowledged? |
|------|---------------|
| U-post: RLS on **7** tables; **14** policies; FORCE off; rows **0** | yes / no |
| Future packet planning is **post-apply** scope | yes / no |
| Re-run Option B bundle without separate gate | **forbidden** |

---

## 3. Documented gaps (must carry forward)

| Gap | In planning output? |
|-----|---------------------|
| app/browser shortcut **NOT_TESTED** | yes / no |
| diagnostics N6 **NOT_TESTED** | yes / no |
| `N12_PASS_CLAIMED` not satisfied | yes / no |
| Route/PSA re-review on wiring change | yes / no |
| STAGING packet ≠ MAIN proof | yes / no |

---

## 4. Future draft-gate preconditions checklist (planning)

| Prerequisite topic | Addressed in planning? |
|--------------------|------------------------|
| N12 partial vs full pass | yes / no |
| Tier 2 snapshot owner-held | yes / no |
| Accountability roles | yes / no |
| Gap acceptance or gap-closure path | yes / no |
| Forbidden actions list for future draft | yes / no |

---

## 5. Planning output sections reviewed (checklist)

| Field | Fill when checklist complete |
|-------|------------------------------|
| **Planning review completed (UTC)** | YYYY-MM-DD |

**Status line:** bounded planning review **completed** (UTC **____-__-__**). All rows **reviewed/accepted** for docs-only synthesis.

**Boundaries:** planning complete **≠** packet draft; **≠** packet execution; **≠** apply approval.

| Section topic | Reviewed? |
|-----------------|-----------|
| Target verification (**MAIN-OWNER-USED**) | yes / no |
| Current deny posture summary (U-post ref) | yes / no |
| Evidence chain (W/V/X/Q4F/N12) | yes / no |
| Gaps / open items register | yes / no |
| Rollback ref (owner-held bundle ID only) | yes / no |
| Future packet section map | yes / no |
| STAGING packet structural reference only | yes / no |
| Draft-gate precondition list | yes / no |

---

## 6. Possible later draft-gate readiness labels (not claimed now — do not edit)

**Binding — do not mark any row Selected? yes:**

| Code | Selected by this charter? | Meaning (later separate gate only) |
|------|---------------------------|-------------------------------------|
| `DRAFT_GATE_NOT_READY_STOP` | **no** (fixed) | Blockers — stop (N11) |
| `DRAFT_GATE_READY_WITH_DOCUMENTED_GAPS` | **no** (fixed) | May discuss draft gate with gaps explicit |
| `DRAFT_GATE_READY_FULL` | **no** (fixed) | Preconditions met for draft gate discussion |

---

## 7. Posture after planning (unchanged)

| Field | Value |
|-------|--------|
| **NOT_READY_FOR_APPLY** | unchanged |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | unchanged |
| Next step | separate **draft gate** and/or gap-closure tests |

---

## 8. Sign-off (owner-held)

| Role | Approved? | Date (UTC) |
|------|-----------|------------|
| **OWNER** | yes / no | |
| **SECURITY_APPROVER** | yes / no | |

---

## 9. Candidate later planning synthesis (not repo truth)

| Field | Fill |
|-------|------|
| Recommended **candidate** (future separate prompt) | e.g. `DRAFT_PLANNING_READY_WITH_DOCUMENTED_GAPS` |
| Candidate = packet draft approved now? | **no** (must stay **no**) |
| Separate draft-gate prompt required? | **yes** |

---

## Final charter statement (fill when complete)

This owner-held charter authorizes **bounded docs-only** execution packet **draft planning** on **MAIN-OWNER-USED** per Section **Z**. It is **not** a packet draft, **not** packet execution, and **not** apply clearance. U-post deny posture is **already applied**; this charter does **not** re-approve U-post SQL. **NOT_READY_FOR_APPLY** and **EXECUTION_PACKET_DRAFT_FORBIDDEN** remain unchanged.
