# Phase 4 LOSA — Sør-Varanger Publication Decision Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-SOR-VARANGER-PUBLICATION-DECISION-post** |
| **Status code** | `LOSA_SOR_VARANGER_PUBLICATION_DECISION_PASS` |
| **Date (UTC)** | 2026-05-29 |
| **Charter ID** | `MAIN-LOSA-PUBLICATION-DECISION-SOR-VARANGER-2026-05-29-01` |

---

## Aggregates

| Field | Value |
|-------|--------|
| Publication decisions recorded | **3** (Alta + Hammerfest + Sør-Varanger) |
| Emission-allowed plans | **3** / **18** |
| Write preview candidates | **3** |
| PSA rows in DB | **2** (Alta + Hammerfest — Sør-Varanger write pending) |
| `NOT_READY_FOR_APPLY` | unchanged |

---

## CLI proof

```bash
npm run losa:finnmark-publication-plan   # emission allowed: 3
npm run losa:preview-psa-write           # write candidates: 3
npm run losa:plan-route-consumption    # route eligible: 3
```

---

## Recommended next

**P4-LOSA-PSA-WRITE** bounded Sør-Varanger insert charter (`MAIN-LOSA-PSA-WRITE-SOR-VARANGER-2026-05-29-01`).
