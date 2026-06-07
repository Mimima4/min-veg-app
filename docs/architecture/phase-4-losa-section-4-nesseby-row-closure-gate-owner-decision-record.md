# Phase 4 LOSA — §4 Nesseby Row Closure Gate Owner Decision Record (Row 8)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-NESSEBY** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_NESSEBY_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Nesseby** delivery (`Nordkapp videregående skole – LOSA Nesseby`) |
| **Vilbli code** | `6108478` |
| **municipality_code** | `5622` |

**Why Nesseby (row 8):** eastern Finnmark (Varanger); same Nordkapp provider; canonical `www.nesseby.kommune.no` (HTTP 200, fp `c45b14135fb7`); no Vadsø VGS / Nordkapp-kommune name collision.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Nesseby `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-NESSEBY-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-NESSEBY-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-NESSEBY-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-NESSEBY-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-NESSEBY-PILOT-post` |

---

## Final statement

Nesseby reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5622`). **8** LOSA PSA rows in main DB.
