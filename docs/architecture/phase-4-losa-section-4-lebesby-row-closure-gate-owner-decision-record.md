# Phase 4 LOSA — §4 Lebesby Row Closure Gate Owner Decision Record (Row 10)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-LEBESBY** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_LEBESBY_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Lebesby** delivery (`Nordkapp videregående skole – LOSA Lebesby`) |
| **Vilbli code** | `8874` |
| **municipality_code** | `5614` |

**Why Lebesby (row 10):** northern Finnmark coast hub; same Nordkapp provider; canonical `www.lebesby.kommune.no` (HTTP 200, fp `58c977dd1e23`); no Vadsø VGS / Nordkapp-kommune name collision.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Lebesby `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-LEBESBY-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-LEBESBY-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-LEBESBY-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-LEBESBY-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-LEBESBY-PILOT-post` |

---

## Final statement

Lebesby reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5614`). **10** LOSA PSA rows in main DB.
