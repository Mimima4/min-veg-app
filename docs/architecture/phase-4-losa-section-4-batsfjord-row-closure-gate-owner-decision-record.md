# Phase 4 LOSA — §4 Båtsfjord Row Closure Gate Owner Decision Record (Row 14)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-BATSFJORD** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_BATSFJORD_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Båtsfjord** delivery (`Nordkapp videregående skole – LOSA Båtsfjord`) |
| **Vilbli code** | `908779` |
| **municipality_code** | `5620` |

**Why Båtsfjord (row 14):** northern Finnmark coast hub; same Nordkapp provider; canonical `www.batsfjord.kommune.no` (HTTP 200, fp `96a46345e6ca`); no Vadsø VGS / Nordkapp-kommune name collision.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Båtsfjord `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-BATSFJORD-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-BATSFJORD-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-BATSFJORD-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-BATSFJORD-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-BATSFJORD-PILOT-post` |

---

## Final statement

Båtsfjord reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5620`). **14** LOSA PSA rows in main DB.
