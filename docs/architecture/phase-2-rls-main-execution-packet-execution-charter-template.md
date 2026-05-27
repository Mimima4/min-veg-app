# Phase 2 RLS MAIN Execution Packet — Execution Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before any connect-approval discussion |
| **Gate** | `phase-2-rls-main-execution-packet-execution-gate-owner-decision-record.md` (EPE0–EPE25; Section **Z-E**) |
| **Basis checkpoint (Z-D-draft-outcome)** | `faa9115` |
| **Draft charter (owner-held)** | `MAIN-EP-DRAFT-2026-05-27-01` — **not** in git |
| **Draft outline (owner-held)** | `MAIN-EP-DRAFT-OUTLINE-2026-05-27-01` — **not** in git |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**Forbidden at template level:** git commit of packet SQL/rollback; Supabase connect **by this template alone**; U-post re-apply (default); treating framework adoption as execution approval.

**U-post reminder:** Deny posture **already applied**. Default session scope is **post-apply** per owner-held draft outline.

---

## Charter boundary statement (binding)

| Boundary | Fill |
|----------|------|
| Owner-held execution charter | yes |
| Repo commit of packet body | **no** |
| Packet execution approved (this template alone) | **no** |
| Supabase connect approved (this template alone) | **no** |
| Re-run U-post SQL (default) | **no** |
| Clears **NOT_READY_FOR_APPLY** | **no** |
| Git **EXECUTION_PACKET_DRAFT_FORBIDDEN** lifted | **no** |

---

## 1. Charter approval (owner-held)

| Field | Fill before connect discussion |
|-------|-------------------------------|
| Charter ID | e.g. `MAIN-EP-EXEC-YYYY-MM-DD-01` |
| **OWNER** (identity owner-held) | yes / no |
| **SECURITY_APPROVER** (identity owner-held) | yes / no |
| **Charter preparation completed (UTC)** | YYYY-MM-DD |
| Z-D-draft-outcome cited | yes / no |
| Z-E framework gate cited | yes / no |
| U-post cited (deny already applied) | yes / no |

---

## 2. Session scope acknowledgment

| Item | Acknowledged? |
|------|---------------|
| Post-apply scope (not repeat U-post deny apply by default) | yes / no |
| Owner-held draft outline referenced (not in git) | yes / no |
| STAGING packet = reference only | yes / no |
| Partial N12 (`N12_PASS_WITH_DOCUMENTED_GAPS`) | yes / no |
| Any DDL sections flagged for **SQL_REVIEWER** | yes / no / n/a |

---

## 3. Documented gaps disposition (required)

| Gap | Status in charter |
|-----|-------------------|
| G1 app/browser **NOT_TESTED** | blocking / accepted-gap / closed |
| G2 diagnostics N6 **NOT_TESTED** | blocking / accepted-gap / closed |
| G3 `N12_PASS_CLAIMED` not satisfied | recorded — unchanged |
| G4 Route/PSA re-review on wiring change | recorded |
| G5 Tier 2 snapshot detail owner-held | recorded |
| G6 **NOT_READY_FOR_APPLY** | unchanged |

**Rule:** If G1 or G2 = **blocking**, connect-approval prompt must **not** proceed until gap-closure or owner explicitly changes disposition.

---

## 4. Pre-session checklist (owner-held)

| Check | Confirmed? |
|-------|------------|
| Target = **MAIN-OWNER-USED** only | yes / no |
| U-post posture re-verified (RLS 7/14/FORCE off/rows 0) | yes / no |
| Rollback refs (bundle ID only; SQL owner-held) | yes / no |
| Stop rules (N11) understood | yes / no |
| Session scope matches draft outline (no scope creep) | yes / no |
| No git paths in session materials | yes / no |

---

## 5. Posture (unchanged)

| Field | Value |
|-------|--------|
| **NOT_READY_FOR_APPLY** | unchanged |
| Git packet body | forbidden |
| Connect approved by this charter alone | **no** |

---

## 6. Connect / execution labels (not claimed by template — fixed until separate prompt)

| Code | Selected by this charter? | Meaning |
|------|---------------------------|---------|
| `CONNECT_NOT_APPROVED` | **yes** (default fixed) | No connect |
| `CONNECT_APPROVED_BOUNDED` | **no** (fixed until separate prompt) | One bounded session — **separate** owner record |
| `EXECUTION_SESSION_COMPLETE` | **no** (fixed) | After session only — **Z-E-post** |

---

## 7. Sign-off (owner-held — charter prep only)

| Role | Charter prep approved? | Date (UTC) |
|------|------------------------|------------|
| **OWNER** | yes / no | |
| **SECURITY_APPROVER** | yes / no | |

---

## 8. Connect-approval prompt (separate — not part of template)

| Field | Fill only when owner issues separate connect prompt |
|-------|-----------------------------------------------------|
| Connect prompt ID | |
| Bounded session authorized? | yes / no |
| G1/G2 disposition at connect time | |
| **SQL_REVIEWER** (if DDL) | pass / n/a |

---

## Final charter statement (fill when prep complete)

This owner-held charter documents **preparation** for a possible future **bounded** MAIN execution packet session per Section **Z-E**. It is **not** connect approval, **not** packet execution, and **not** apply clearance. U-post deny posture remains **already applied**. Packet body stays **owner-held** only.
