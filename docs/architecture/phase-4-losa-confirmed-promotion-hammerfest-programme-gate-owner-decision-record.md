# Phase 4 LOSA — Bounded CONFIRMED Promotion (Hammerfest Programme Tier 2) Gate

| Field | Value |
|--------|--------|
| **Status** | Owner **CONFIRMED** promotion adopted — **1** `programme_stage_availability` row |
| **Section** | **P4-LOSA-CONFIRMED-HAMMERFEST-PROGRAMME** |
| **Closure label** | `PHASE_4_LOSA_CONFIRMED_HAMMERFEST_PROGRAMME_PROMOTION_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | **P4-LOSA-REFRESH-PILOT-3F**; **P4-LOSA-CONFIRMED-HAMMERFEST-DELIVERY-post** |

**Does NOT:** clear §4 (`publication_supporting_evidence` still blocked), PSA write, or `NOT_READY_FOR_APPLY`.

---

## Row eligible for CONFIRMED (binding)

| source_id | claim_class | scope | Citation basis |
|-----------|-------------|-------|----------------|
| `T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP` | `programme_stage_availability` | `delivery_site_hammerfest` | Pilot 3f `nordkapp.vgs.no/utdanningstilbud/` (HTTP 200) |

**Not eligible:** Alta programme scope reuse without Hammerfest scope row; utdanning.no alone; duplicate second Hammerfest programme CONFIRMED.

---

## Owner decisions (P4LCHP0–P4LCHP6)

| # | Decision | Answer |
|---|----------|--------|
| P4LCHP0 | Adopt Nordkapp programme listing for Hammerfest delivery row? | **Yes** |
| P4LCHP1 | Max **1** new CONFIRMED index row | **Yes** |
| P4LCHP2 | Full row closure when provider+delivery prerequisites met | **Yes** |
| P4LCHP3 | **No** PSA / Route write | **Yes** |
| P4LCHP4 | §4 still blocked on supporting-evidence packet | **Yes** |
| P4LCHP5 | CLI: Hammerfest `programme_stage_availability` → `row_confirmed` | **Yes** |
| P4LCHP6 | Next: supporting-evidence packet sub-gate | **Yes** |

---

## Final boundary

Bounded **Tier 2 programme** CONFIRMED for Hammerfest Nordkapp LOSA delivery — sub-gate **2** complete at programme claim; supporting evidence remains open.
