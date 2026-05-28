# Phase 2 RLS MAIN G1 App/Browser Gap-Closure — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before G1 session |
| **Gate** | `phase-2-rls-main-g1-app-browser-gap-closure-execution-gate-owner-decision-record.md` (G1E0–G1E21; Section **Z-G1**) |
| **Basis checkpoint** | `e38b5eb` |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**Forbidden:** packet SQL execution; apply; U-post re-apply by default; policy/DDL changes; secrets in git.

---

## 1. Charter approval (owner-held)

| Field | Fill before session |
|-------|---------------------|
| Charter ID | e.g. `MAIN-G1-APP-BROWSER-YYYY-MM-DD-01` |
| **OWNER** | yes / no |
| **SECURITY_APPROVER** | yes / no |
| Charter prepared (UTC) | YYYY-MM-DD |
| Z-G1 gate cited | yes / no |
| Z-E gate cited | yes / no |

---

## 2. Scope

| Item | Acknowledged? |
|------|---------------|
| G1-only gap closure | yes / no |
| Product-representative app/browser path | yes / no |
| Denial outcomes only | yes / no |
| No persistent writes | yes / no |
| G2 remains open | yes / no |

---

## 3. Preconditions

| Check | Confirmed? |
|-------|------------|
| Target = MAIN-OWNER-USED | yes / no |
| U-post posture re-verified | yes / no |
| V-post cited | yes / no |
| W-post cited | yes / no |
| Stop rule (N11) accepted | yes / no |

---

## 4. Gaps disposition

| Gap | Status |
|-----|--------|
| G1 app/browser NOT_TESTED | intended to evaluate |
| G2 diagnostics N6 NOT_TESTED | unchanged |
| N12_PASS_CLAIMED | not claimed |
| NOT_READY_FOR_APPLY | unchanged |

---

## 5. Posture statement

| Field | Value |
|-------|--------|
| Packet execution approved by this charter | **no** |
| Apply approved by this charter | **no** |
| Clears NOT_READY_FOR_APPLY | **no** |

---

## Final charter statement

This owner-held charter authorizes one bounded G1 app/browser gap-closure session only. It is not packet execution approval, not apply approval, and not NOT_READY_FOR_APPLY clearance.
