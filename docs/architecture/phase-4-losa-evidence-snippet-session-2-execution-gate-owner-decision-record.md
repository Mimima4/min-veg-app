# Phase 4 LOSA Evidence Snippet Session 2 — Execution Gate Owner Decision Record

| Field | Value |
|--------|--------|
| **Status** | Bounded **Tier 2 programme** snippet refresh from existing owner-held HTML |
| **Closure label** | `PHASE_4_LOSA_EVIDENCE_SNIPPET_SESSION_2_GATE_ADOPTED` |
| **Section** | **P4-LOSA-SNIPPET-SESSION-2** |
| **Date (UTC)** | 2026-06-03 |
| **Prerequisite** | **P4-LOSA-REFRESH-PILOT-3B-post**; **P4-LOSA-SNIPPET-SESSION-post** |

Refines **3** programme-related rows using **Pilot 3b** Alta programme snapshot where applicable. Labels: `SNIPPET_CAPTURED` only — **not** `CONFIRMED`.

**NOT_READY_FOR_APPLY** unchanged. No network fetch, PSA, Phase 2 DML, UI.

---

## Snippet queue (binding)

| # | source_id | claim_class | Notes |
|---|-----------|-------------|-------|
| 1 | `T2_SCHOOL_ALTA_VGS_PROGRAM_DEEP` | `programme_stage_availability` | Pilot 3b `utdanningstilbud/` body |
| 2 | `T2_SCHOOL_ALTA_VGS` | `programme_stage_availability` | Replace weak landing menu excerpt with programme-page text when captured |
| 3 | `T2_SCHOOL_NORD_SALTEN_VGS` | `programme_stage_availability` | Re-scan existing landing snapshot only |

**Out of scope:** new URLs; Nord-Salten program deep (deferred); CONFIRMED promotion; schools/kommune rows already adequate in session 1.

---

## Pass criterion

`LOSA_SNIPPET_SESSION_2_PASS` when **≥2/3** rows are `SNIPPET_CAPTURED`.

---

## Final boundary

Session 2 strengthens §4 **programme** evidence input — not publication or matcher write.
