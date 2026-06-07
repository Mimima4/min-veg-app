# Phase 4 LOSA — §4 Berlevåg Row Closure Gate Owner Decision Record (Row 12)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-BERLEVAG** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_BERLEVAG_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Berlevåg** delivery (`Nordkapp videregående skole – LOSA Berlevåg`) |
| **Vilbli code** | `229030` |
| **municipality_code** | `5618` |

**Why Berlevåg (row 12):** northern Finnmark coast hub; same Nordkapp provider; canonical `www.berlevag.kommune.no` (HTTP 200, fp `c2025abe4ea3`); no Vadsø VGS / Nordkapp-kommune name collision.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Berlevåg `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-BERLEVAG-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-BERLEVAG-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-BERLEVAG-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-BERLEVAG-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-BERLEVAG-PILOT-post` |

---

## Final statement

Berlevåg reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5618`). **12** LOSA PSA rows in main DB.
