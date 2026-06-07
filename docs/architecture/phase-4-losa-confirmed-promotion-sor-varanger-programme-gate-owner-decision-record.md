# Phase 4 LOSA — Bounded CONFIRMED Promotion (Sør-Varanger Programme Tier 2) Gate

| Field | Value |
|--------|--------|
| **Status** | Owner **CONFIRMED** promotion adopted — **1** `programme_stage_availability` row |
| **Section** | **P4-LOSA-CONFIRMED-SOR-VARANGER-PROGRAMME** |
| **Closure label** | `PHASE_4_LOSA_CONFIRMED_SOR_VARANGER_PROGRAMME_PROMOTION_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | **P4-LOSA-REFRESH-PILOT-3G**; **P4-LOSA-CONFIRMED-SOR-VARANGER-DELIVERY-post** |

**Does NOT:** clear §4 (`publication_supporting_evidence` still blocked), PSA write, or `NOT_READY_FOR_APPLY`.

---

## Row eligible for CONFIRMED (binding)

| source_id | claim_class | scope | Citation basis |
|-----------|-------------|-------|----------------|
| `T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP` | `programme_stage_availability` | `delivery_site_sor_varanger` | Pilot 3g `nordkapp.vgs.no/utdanningstilbud/` (HTTP 200) |

**Not eligible:** Hammerfest/Alta programme scope reuse without Sør-Varanger scope row; utdanning.no alone; duplicate second Sør-Varanger programme CONFIRMED.

---

## Owner decisions (P4LCSVP0–P4LCSVP6)

| # | Decision | Answer |
|---|----------|--------|
| P4LCSVP0 | Adopt Nordkapp programme listing for Sør-Varanger delivery row? | **Yes** |
| P4LCSVP1 | Max **1** new CONFIRMED index row | **Yes** |
| P4LCSVP2 | Full row closure when provider+delivery prerequisites met | **Yes** |
| P4LCSVP3 | **No** PSA / Route write | **Yes** |
| P4LCSVP4 | §4 still blocked on supporting-evidence packet | **Yes** |
| P4LCSVP5 | CLI: Sør-Varanger `programme_stage_availability` → `row_confirmed` | **Yes** |
| P4LCSVP6 | Next: supporting-evidence packet sub-gate | **Yes** |

---

## Final boundary

Bounded **Tier 2 programme** CONFIRMED for Sør-Varanger Nordkapp LOSA delivery — sub-gate **2** complete at programme claim; supporting evidence remains open.
