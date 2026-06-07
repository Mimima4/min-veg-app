# Phase 4 LOSA — §4 Loppa Row Closure Gate Owner Decision Record (Row 15)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-LOPPA** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_LOPPA_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Loppa** delivery (`Nordkapp videregående skole – LOSA Loppa`) |
| **Vilbli code** | `229033` |
| **municipality_code** | `5634` |

**Why Loppa (row 15):** western Finnmark coast; same Nordkapp provider; canonical `www.loppa.kommune.no` (HTTP 200, fp `9a2e197a6b7d`); no Vadsø VGS / Nordkapp-kommune name collision.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Loppa `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-LOPPA-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-LOPPA-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-LOPPA-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-LOPPA-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-LOPPA-PILOT-post` |

---

## Final statement

Loppa reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5634`). **15** LOSA PSA rows in main DB.
