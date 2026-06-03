# Phase 4 LOSA Claim Extraction Pilot — Execution Gate Owner Decision Record

## Snapshot / status

| Field | Value |
|--------|--------|
| **Status** | Owner/security **bounded claim extraction pilot** — docs-level adoption only |
| **Closure label** | `PHASE_4_LOSA_CLAIM_EXTRACTION_PILOT_GATE_ADOPTED` |
| **Scope** | Read-only scan of **existing** owner-held LOSA pilot snapshots — **candidate signals only** |
| **Date (UTC)** | 2026-06-03 |
| **Control reference** | `phase-2-closure-criteria-checklist.md` — **P4-LOSA-CLAIM-EXTRACT** |
| **Design** | `phase-4-losa-official-source-evidence-refresh-design.md` §7, §13 |

**NOT_READY_FOR_APPLY** unchanged. No `CONFIRMED` legal claims in this pilot. No fetch, PSA, Phase 2 DML, UI, Route mutation.

---

## Prerequisites

| Record | Required |
|--------|----------|
| **P4-LOSA-REFRESH-IMPL-post**, **P4-LOSA-REFRESH-PILOT-2-post**, **P4-LOSA-REFRESH-PILOT-2B-post** | yes |
| **P06-CONTOUR-B-UPDATE-post** | yes |

---

## Owner/security decisions (LCE0–LCE12)

| ID | Decision | Answer |
|----|----------|--------|
| LCE0 | Adopt bounded extraction pilot | **Yes** |
| LCE1 | Input: owner-held `losa-refresh-impl/snapshots/**` only | **Yes** |
| LCE2 | Output: owner-held `claim-candidates.json` + safe git summary | **Yes** |
| LCE3 | Labels allowed in pilot: `EXTRACTION_CANDIDATE`, `UNKNOWN` only — **no** `CONFIRMED` | **Yes** |
| LCE4 | No new network fetch | **Yes** |
| LCE5 | No PSA / Phase 2 / pipeline write | **Yes** |
| LCE6 | No legal advice or publication inference | **Yes** |
| LCE7 | Charter + pre-session QA **PASS** + prompt required | **Yes** |
| LCE8 | Main matcher / Finnmark closure not implied | **Yes** |
| LCE9 | NOT_READY unchanged | **Yes** |
| LCE10 | Outcome: `LOSA_CLAIM_EXTRACTION_PILOT_PASS` or `NOT_READY_STOP` | **Yes** |
| LCE11 | Claim classes in scope: `legal_status`, `fjernundervisning_rules`, `provider_school`, `delivery_municipality`, `programme_stage_availability` | **Yes** |
| LCE12 | Final boundary: automation candidates only (refresh-design §13) | **Yes** |

---

## Final boundary

This pilot produces **review-oriented candidate signals** from HTML fingerprints already captured — not runtime truth and not publication approval.
