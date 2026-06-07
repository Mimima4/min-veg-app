# Phase 4 LOSA — Porsanger Publication Decision Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-PORSANGER-PUBLICATION-DECISION-post** |
| **Status code** | `LOSA_PORSANGER_PUBLICATION_DECISION_PASS` |
| **Date (UTC)** | 2026-05-29 |
| **Charter ID** | `MAIN-LOSA-PUBLICATION-DECISION-PORSANGER-2026-05-29-01` |

---

## Aggregates

| Field | Value |
|-------|--------|
| Publication decisions recorded | **4** (Alta + Hammerfest + Sør-Varanger + Porsanger) |
| Emission-allowed plans | **4** / **18** |
| Write preview candidates | **4** |
| PSA rows in DB | **3** (Porsanger write pending) |
| `NOT_READY_FOR_APPLY` | unchanged |

---

## CLI proof

```bash
npm run losa:finnmark-publication-plan   # emission allowed: 4
npm run losa:preview-psa-write           # write candidates: 4
npm run losa:plan-route-consumption    # route eligible: 4
```

---

## Recommended next

**P4-LOSA-PSA-WRITE** bounded Porsanger insert charter (`MAIN-LOSA-PSA-WRITE-PORSANGER-2026-05-29-01`).
