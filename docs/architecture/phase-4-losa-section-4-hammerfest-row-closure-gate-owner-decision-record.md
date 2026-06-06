# Phase 4 LOSA — §4 Hammerfest Row Closure Gate Owner Decision Record (Row 2)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-HAMMERFEST** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_HAMMERFEST_ROW_SECTION_4_IN_PROGRESS` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Hammerfest** delivery (`Nordkapp videregående skole – LOSA Hammerfest`) |
| **Vilbli code** | `6108473` |
| **municipality_code** | `5603` |

**Why Hammerfest (row 2):** county hub after Alta pilot; same Nordkapp provider; canonical `hammerfest.kommune.no` without Vadsø VGS host overlap.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Hammerfest `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-HAMMERFEST-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-HAMMERFEST-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-HAMMERFEST-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-HAMMERFEST-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-HAMMERFEST-PILOT-post` |

County Tier 1 + Nordkapp provider already satisfied (shared with Alta pattern).

---

## CLI proof (sub-gate 1)

```bash
npm run losa:finnmark-evidence-link
# Hammerfest: delivery_municipality row_confirmed; §4 still blocked
# Alta: unchanged ROW_SECTION_4_SATISFIED
```

---

## Final statement

Hammerfest reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5603`). **2** LOSA PSA rows in main DB (Alta + Hammerfest).
