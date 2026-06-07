# Phase 4 LOSA — §4 Porsanger Row Closure Gate Owner Decision Record (Row 4)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-PORSANGER** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_PORSANGER_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Porsanger** delivery (`Nordkapp videregående skole – LOSA Porsanger`) |
| **Vilbli code** | `6108475` |
| **municipality_code** | `5630` |

**Why Porsanger (row 4):** Lakselv hub after three prior pilots; same Nordkapp provider; canonical `porsanger.kommune.no` without Vadsø VGS host overlap or Nordkapp-kommune/provider name collision.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Porsanger `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-PORSANGER-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-PORSANGER-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-PORSANGER-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-PORSANGER-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-PORSANGER-PILOT-post` |

County Tier 1 + Nordkapp provider already satisfied (shared with prior row pattern).

---

## CLI proof (sub-gate 1)

```bash
npm run losa:finnmark-evidence-link
# Porsanger: delivery_municipality row_confirmed; §4 still blocked
# Alta + Hammerfest + Sør-Varanger: unchanged ROW_SECTION_4_SATISFIED
```

---

## Final statement

Porsanger reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5630`). **4** LOSA PSA rows in main DB (Alta + Hammerfest + Sør-Varanger + Porsanger).
