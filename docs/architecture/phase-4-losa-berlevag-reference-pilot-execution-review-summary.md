# Phase 4 LOSA — Berlevåg Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-BERLEVAG-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_BERLEVAG_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) in single bounded session |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Berlevåg** |
| Vilbli school code | `229030` |
| `municipality_code` | `5618` |
| Repo CONFIRMED index delta | **+4** (delivery, programme, supporting packet; publication decision in separate index) |
| §4 satisfied rows | **12/18** |
| Emission-allowed plans | **12** |
| PSA rows in DB (ref county) | **12** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-BERLEVAG-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-BERLEVAG-2026-05-29-01` |
| Inserted row id | `0172ab85-e1f9-4a5b-a81f-813a1772c801` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 12
npm run losa:finnmark-publication-plan    # emission allowed: 12
npm run losa:preview-psa-write            # write candidates: 12
npm run losa:plan-route-consumption       # route eligible: 12
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-BERLEVAG-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- **Not** bulk remaining **6** rows.
- Nationwide pattern proof — one charter per row session preserved.
