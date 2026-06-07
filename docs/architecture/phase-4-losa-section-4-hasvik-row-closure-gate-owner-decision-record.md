# Phase 4 LOSA — §4 Hasvik Row Closure Gate Owner Decision Record (Row 13)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-HASVIK** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_HASVIK_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Hasvik** delivery (`Nordkapp videregående skole – LOSA Hasvik`) |
| **Vilbli code** | `8873` |
| **municipality_code** | `5624` |

**Why Hasvik (row 13):** western Finnmark coast; same Nordkapp provider; canonical `www.hasvik.kommune.no` (HTTP 200, fp `0b447f0e1c5a`); no Vadsø VGS / Nordkapp-kommune name collision.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Hasvik `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-HASVIK-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-HASVIK-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-HASVIK-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-HASVIK-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-HASVIK-PILOT-post` |

---

## Final statement

Hasvik reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5624`). **13** LOSA PSA rows in main DB.
