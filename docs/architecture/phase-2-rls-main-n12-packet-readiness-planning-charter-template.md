# Phase 2 RLS MAIN N12 Packet/Readiness Planning — Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before planning review |
| **Gate** | `phase-2-rls-main-n12-packet-readiness-planning-gate-owner-decision-record.md` (N12P0–N12P21; Section **Y**) |
| **Basis checkpoint** | `9ffa12d` (or HEAD after Section **Y** commit) |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**Forbidden:** treating planning review as N12 pass; SQL; Supabase; new tests; execution packet draft; packet execution; apply by implication.

---

## 1. Charter approval (owner-held)

| Field | Fill before planning review |
|-------|----------------------------|
| Charter ID | e.g. `MAIN-N12-PLAN-YYYY-MM-DD-01` |
| **OWNER** / **SECURITY_APPROVER** | yes — names **owner-held** |
| W-Q4F-post / X-post / W-post cited | yes |

---

## 2. N12 triple-gate checklist (MAIN)

| Prerequisite | Satisfied for N12 pass claim? | Notes owner-held |
|--------------|------------------------------|------------------|
| (1) Negative-test plan adopted | yes / no / partial | N0–N16 record |
| (2) Per-target snapshot evidence exists | yes / no / partial | Q-post Tier 1; Tier 2 owner-held |
| (3) Negative tests pass on MAIN | yes / no / partial | Q4_PASS_WITH_DOCUMENTED_GAPS; gaps listed |

---

## 3. Documented gaps (must list)

| Gap | Carry forward in packet planning? |
|-----|--------------------------------|
| app/browser shortcut NOT_TESTED | yes / no |
| diagnostics N6 NOT_TESTED | yes / no |
| Route/PSA future wiring re-review | yes / no |

---

## 4. Planning output sections reviewed (checklist)

| Section topic | Reviewed? |
|-----------------|-----------|
| Target verification posture | yes / no |
| Snapshot posture references | yes / no |
| Deny-policy summary (U-post) | yes / no |
| Negative-test evidence summary | yes / no |
| Documented gaps / open items | yes / no |
| Rollback posture reference | yes / no |
| Diagnostics compatibility (V-post) | yes / no |
| Integration boundaries | yes / no |
| Forbidden actions for future packet execution | yes / no |

---

## 5. Future N12 outcome (pick one — after planning only)

| Code | Selected? |
|------|-----------|
| `N12_PASS_NOT_READY_STOP` | yes / no |
| `N12_PASS_WITH_DOCUMENTED_GAPS` | yes / no |
| `N12_PASS_CLAIMED` | yes / no |

---

## 6. Posture after planning (defaults)

| Field | Value |
|-------|--------|
| EXECUTION_PACKET_DRAFT_FORBIDDEN | unchanged (default) |
| NOT_READY_FOR_APPLY | unchanged (default) |
| Next step if gaps remain | separate test gate / stop |

---

## 7. Sign-off (owner-held)

| Role | Approved? | Date |
|------|-----------|------|
| OWNER | | |
| SECURITY_APPROVER | | |
