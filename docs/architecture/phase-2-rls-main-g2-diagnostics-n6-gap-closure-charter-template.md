# Phase 2 RLS MAIN G2 Diagnostics N6 Gap-Closure — Session Charter (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — copy to **owner-held** before G2 session |
| **Gate** | `phase-2-rls-main-g2-diagnostics-n6-gap-closure-execution-gate-owner-decision-record.md` (G2E0–G2E21; Section **Z-G2**) |
| **Basis checkpoint** | `214d456` |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**Forbidden:** packet SQL execution; apply; U-post re-apply by default; policy/DDL changes; secrets in git.

---

## 1. Charter approval (owner-held)

| Field | Fill before session |
|-------|---------------------|
| Charter ID | e.g. `MAIN-G2-DIAG-N6-YYYY-MM-DD-01` |
| **OWNER** | yes / no |
| **SECURITY_APPROVER** | yes / no |
| Charter prepared (UTC) | YYYY-MM-DD |
| Z-G2 gate cited | yes / no |
| Z-E gate cited | yes / no |
| Z-G1-post cited | yes / no |

---

## 2. Scope

| Item | Acknowledged? |
|------|---------------|
| G2-only gap closure | yes / no |
| Approved diagnostics consumer/path only | yes / no |
| Compatibility/diagnostics evidence only | yes / no |
| No persistent writes | yes / no |
| G1 remains closed | yes / no |

---

## 3. Preconditions

| Check | Confirmed? |
|-------|------------|
| Target = MAIN-OWNER-USED | yes / no |
| V-post cited | yes / no |
| Z-G1-post cited | yes / no |
| Stop rule (N11) accepted | yes / no |

---

## 4. Gaps disposition

| Gap | Status |
|-----|--------|
| G2 diagnostics N6 NOT_TESTED | intended to evaluate |
| G1 app/browser | closed |
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

This owner-held charter authorizes one bounded G2 diagnostics N6 gap-closure session only. It is not packet execution approval, not apply approval, and not NOT_READY_FOR_APPLY clearance.
