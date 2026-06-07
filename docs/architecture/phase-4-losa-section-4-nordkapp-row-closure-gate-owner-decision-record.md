# Phase 4 LOSA — §4 Nordkapp Row Closure Gate Owner Decision Record (Row 17)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-NORDKAPP** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_NORDKAPP_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Nordkapp** delivery (`Nordkapp videregående skole – LOSA Nordkapp`) |
| **Vilbli code** | `6108474` |
| **municipality_code** | `5628` |

**Why Nordkapp (row 17):** provider/delivery name collision row — `delivery_site_nordkapp` scoped separately from `provider_nordkapp`; canonical `www.nordkapp.kommune.no` (HTTP 200, fp `1cdffb0d0f6c`); route UI **LOSA badge** shipped (provider-only title + kommune line).

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Nordkapp `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-NORDKAPP-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-NORDKAPP-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-NORDKAPP-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-NORDKAPP-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-NORDKAPP-PILOT-post` |

---

## Final statement

Nordkapp reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5628`). **17** LOSA PSA rows in main DB.
