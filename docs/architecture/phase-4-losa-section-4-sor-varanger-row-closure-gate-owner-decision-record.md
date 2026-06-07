# Phase 4 LOSA — §4 Sør-Varanger Row Closure Gate Owner Decision Record (Row 3)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-SOR-VARANGER** |
| **Status** | **REFERENCE PILOT COMPLETE** — PSA row inserted |
| **Closure label** | `PHASE_4_LOSA_SOR_VARANGER_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Reference row** | Vilbli LOSA **Sør-Varanger** delivery (`Nordkapp videregående skole – LOSA Sør-Varanger`) |
| **Vilbli code** | `6108481` |
| **municipality_code** | `5636` |

**Why Sør-Varanger (row 3):** county hub (Kirkenes) after Alta + Hammerfest pilots; same Nordkapp provider; canonical `sor-varanger.kommune.no` without Vadsø VGS host overlap.

---

## Ordered sub-gates

| # | Sub-gate | Status |
|---|----------|--------|
| 1 | Sør-Varanger `delivery_municipality` CONFIRMED | **DONE** — `P4-LOSA-CONFIRMED-SOR-VARANGER-DELIVERY-post` |
| 2 | Programme CONFIRMED + full row closure | **DONE** — `P4-LOSA-CONFIRMED-SOR-VARANGER-PROGRAMME-post` |
| 3 | `publication_supporting_evidence` combined packet | **DONE** — `P4-LOSA-SOR-VARANGER-SUPPORTING-EVIDENCE-post` |
| 4 | Auditable publication decision | **DONE** — `P4-LOSA-SOR-VARANGER-PUBLICATION-DECISION-post` |
| 5 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `P4-LOSA-PSA-WRITE-SOR-VARANGER-PILOT-post` |

County Tier 1 + Nordkapp provider already satisfied (shared with Alta/Hammerfest pattern).

---

## CLI proof (sub-gate 1)

```bash
npm run losa:finnmark-evidence-link
# Sør-Varanger: delivery_municipality row_confirmed; §4 still blocked
# Alta + Hammerfest: unchanged ROW_SECTION_4_SATISFIED
```

---

## Final statement

Sør-Varanger reference pilot **complete**: PSA row inserted (`losa_fjern_delivery_municipality`, `5636`). **3** LOSA PSA rows in main DB (Alta + Hammerfest + Sør-Varanger).
