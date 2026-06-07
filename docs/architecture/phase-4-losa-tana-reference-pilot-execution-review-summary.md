# Phase 4 LOSA — Tana Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-TANA-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_TANA_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) in single bounded session |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Tana** |
| Vilbli school code | `259133` |
| `municipality_code` | `5605` |
| Repo CONFIRMED index delta | **+4** (delivery, programme, supporting packet; publication decision in separate index) |
| §4 satisfied rows | **9/18** |
| Emission-allowed plans | **9** |
| PSA rows in DB (ref county) | **9** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-TANA-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-TANA-2026-05-29-01` |
| Inserted row id | `90ae458c-c1da-466c-b08f-e0356a4d9936` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 9
npm run losa:finnmark-publication-plan    # emission allowed: 9
npm run losa:preview-psa-write            # write candidates: 9
npm run losa:plan-route-consumption       # route eligible: 9
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-TANA-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- **Not** bulk remaining **9** rows.
- Nationwide pattern proof — one charter per row session preserved.
