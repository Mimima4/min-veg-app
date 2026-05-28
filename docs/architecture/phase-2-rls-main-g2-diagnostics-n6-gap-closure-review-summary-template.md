# Phase 2 RLS MAIN G2 Diagnostics N6 Gap-Closure — Review Safe Summary (Template)

| Field | Value |
|-------|--------|
| **Document type** | **Template** — repo-safe summary after G2 bounded session |
| **Gate** | `phase-2-rls-main-g2-diagnostics-n6-gap-closure-execution-gate-owner-decision-record.md` (Section **Z-G2**) |
| **Prerequisite** | Filled owner-held charter + completed bounded session |
| **Target** | **MAIN-OWNER-USED** / **PROD** (= MAIN) only |

**Forbidden in git summary:** secrets, raw logs, raw query output, packet SQL text, PII.

---

## 1. Session identification

| Field | Fill |
|-------|------|
| Summary ID | e.g. `MAIN-G2-DIAG-N6-POST-YYYY-MM-DD-01` |
| Charter ID (owner-held) | |
| Session date (UTC) | |
| OWNER / SECURITY_APPROVER review | role labels only |

---

## 2. G2 outcome checks

| Check | Pass / fail / unclear |
|-------|------------------------|
| Diagnostics N6 execution path completed | |
| Diagnostics compatibility outcome on approved path | |
| No persistent rows / side-effect writes | |
| N11 stop condition absent | |

---

## 3. Gap status after session

| Gap | Status |
|-----|--------|
| G2 diagnostics N6 | closed / not closed |
| G1 app/browser | closed |
| N12_PASS_CLAIMED | not claimed |
| NOT_READY_FOR_APPLY | unchanged |

---

## 4. Outcome code

| Code | Selected? |
|------|-----------|
| `G2_GAP_CLOSURE_PASS` | |
| `G2_GAP_CLOSURE_PASS_WITH_LIMITATIONS` | |
| `G2_GAP_CLOSURE_NOT_READY_STOP` | |

---

## Final summary statement

This safe summary documents G2 diagnostics N6 session outcome only. It is not packet execution approval, not apply approval, and not NOT_READY_FOR_APPLY clearance.
