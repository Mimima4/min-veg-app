# Phase 4 LOSA — Bounded CONFIRMED Promotion (Porsanger Programme Tier 2) Gate

| Field | Value |
|--------|--------|
| **Status** | Owner **CONFIRMED** promotion adopted — **1** `programme_stage_availability` row |
| **Section** | **P4-LOSA-CONFIRMED-PORSANGER-PROGRAMME** |
| **Closure label** | `PHASE_4_LOSA_CONFIRMED_PORSANGER_PROGRAMME_PROMOTION_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | **P4-LOSA-REFRESH-PILOT-3H**; **P4-LOSA-CONFIRMED-PORSANGER-DELIVERY-post** |

**Does NOT:** clear §4 (`publication_supporting_evidence` still blocked), PSA write, or `NOT_READY_FOR_APPLY`.

---

## Row eligible for CONFIRMED (binding)

| source_id | claim_class | scope | Citation basis |
|-----------|-------------|-------|----------------|
| `T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP` | `programme_stage_availability` | `delivery_site_porsanger` | Pilot 3h `nordkapp.vgs.no/utdanningstilbud/` (HTTP 200) |

**Not eligible:** prior-row programme scope reuse without Porsanger scope row; utdanning.no alone; duplicate second Porsanger programme CONFIRMED.

---

## Owner decisions (P4LCPP0–P4LCPP6)

| # | Decision | Answer |
|---|----------|--------|
| P4LCPP0 | Adopt Nordkapp programme listing for Porsanger delivery row? | **Yes** |
| P4LCPP1 | Max **1** new CONFIRMED index row | **Yes** |
| P4LCPP2 | Full row closure when provider+delivery prerequisites met | **Yes** |
| P4LCPP3 | **No** PSA / Route write | **Yes** |
| P4LCPP4 | §4 still blocked on supporting-evidence packet | **Yes** |
| P4LCPP5 | CLI: Porsanger `programme_stage_availability` → `row_confirmed` | **Yes** |
| P4LCPP6 | Next: supporting-evidence packet sub-gate | **Yes** |

---

## Final boundary

Bounded **Tier 2 programme** CONFIRMED for Porsanger Nordkapp LOSA delivery — sub-gate **2** complete at programme claim; supporting evidence remains open.
