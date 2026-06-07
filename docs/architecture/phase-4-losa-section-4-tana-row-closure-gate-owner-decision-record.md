# Phase 4 LOSA — §4 Tana Row Closure Gate Owner Decision Record (Row 9)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-TANA** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_TANA_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Tana** delivery (`Nordkapp videregående skole – LOSA Tana`) |
| **Vilbli code** | `259133` |
| **municipality_code** | `5605` |

**Why Tana (row 9):** Tana/Deanu inland hub; same Nordkapp provider; canonical `www.tana.kommune.no` (HTTP 200, fp `5147701ca190`); no Vadsø VGS / Nordkapp-kommune name collision.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Tana `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-TANA-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-TANA-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-TANA-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-TANA-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-TANA-PILOT-post` |

---

## Final statement

Tana reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5605`). **9** LOSA PSA rows in main DB.
