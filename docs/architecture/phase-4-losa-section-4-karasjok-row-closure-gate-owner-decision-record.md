# Phase 4 LOSA — §4 Karasjok Row Closure Gate Owner Decision Record (Row 5)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-KARASJOK** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_KARASJOK_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Karasjok** delivery (`Nordkapp videregående skole – LOSA Karasjok`) |
| **Vilbli code** | `6108476` |
| **municipality_code** | `5612` |

**Why Karasjok (row 5):** inland Finnmark hub; same Nordkapp provider; canonical `karasjok.kommune.no` (HTTP 200, fp `e81d291acbac`); no Vadsø VGS / Nordkapp-kommune name collision.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Karasjok `delivery_municipality` CONFIRMED | **DONE** — Pilot 2f / `P4-LOSA-CONFIRMED-KARASJOK-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — Pilot 3i / `P4-LOSA-CONFIRMED-KARASJOK-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-KARASJOK-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-KARASJOK-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-KARASJOK-PILOT-post` |

---

## Final statement

Karasjok reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5612`). **5** LOSA PSA rows in main DB.
