# Phase 4 LOSA — Hammerfest Publication Decision Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-HAMMERFEST-PUBLICATION-DECISION-post** |
| **Status code** | `LOSA_HAMMERFEST_PUBLICATION_DECISION_PASS` |
| **Date (UTC)** | 2026-05-29 |
| **Charter ID** | `MAIN-LOSA-PUBLICATION-DECISION-HAMMERFEST-2026-05-29-01` |

---

## Aggregates

| Field | Value |
|-------|--------|
| Publication decisions recorded | **2** (Alta + Hammerfest) |
| Emission-allowed plans | **2** / **18** |
| Write preview candidates | **2** |
| PSA rows in DB | **1** (Alta only — Hammerfest write pending) |
| `NOT_READY_FOR_APPLY` | unchanged |

---

## CLI proof

```bash
npm run losa:finnmark-publication-plan   # emission allowed: 2
npm run losa:preview-psa-write           # write candidates: 2
npm run losa:plan-route-consumption    # route eligible: 2
```

---

## Recommended next

**P4-LOSA-PSA-WRITE** bounded Hammerfest insert charter (`MAIN-LOSA-PSA-WRITE-HAMMERFEST-2026-05-29-01`).
