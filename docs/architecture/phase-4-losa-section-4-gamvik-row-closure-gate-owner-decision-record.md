# Phase 4 LOSA — §4 Gamvik Row Closure Gate Owner Decision Record (Row 11)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-GAMVIK** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_GAMVIK_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Gamvik** delivery (`Nordkapp videregående skole – LOSA Gamvik`) |
| **Vilbli code** | `203171` |
| **municipality_code** | `5616` |

**Why Gamvik (row 11):** northern Finnmark coast; same Nordkapp provider; canonical `gamvik.kommune.no` (HTTP 200, fp `bb93c9a3072d`); no Vadsø VGS / Nordkapp-kommune name collision.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Gamvik `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-GAMVIK-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-GAMVIK-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-GAMVIK-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-GAMVIK-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-GAMVIK-PILOT-post` |

---

## Final statement

Gamvik reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5616`). **11** LOSA PSA rows in main DB.
