# Phase 4 LOSA — §4 Måsøy Row Closure Gate Owner Decision Record (Row 16)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-MASOY** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_MASOY_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Måsøy** delivery (`Nordkapp videregående skole – LOSA Måsøy`) |
| **Vilbli code** | `8883` |
| **municipality_code** | `5626` |

**Why Måsøy (row 16):** western Finnmark coast (Havøysund hub); same Nordkapp provider; canonical `www.masoy.kommune.no` (HTTP 200, fp `c056ac765ba2`); no Vadsø VGS / Nordkapp-kommune name collision.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Måsøy `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-MASOY-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-MASOY-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-MASOY-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-MASOY-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-MASOY-PILOT-post` |

---

## Final statement

Måsøy reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5626`). **16** LOSA PSA rows in main DB.
