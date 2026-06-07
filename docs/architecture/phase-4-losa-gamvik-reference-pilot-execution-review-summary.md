# Phase 4 LOSA — Gamvik Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-GAMVIK-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_GAMVIK_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) in single bounded session |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Gamvik** |
| Vilbli school code | `203171` |
| `municipality_code` | `5616` |
| Repo CONFIRMED index delta | **+4** (delivery, programme, supporting packet; publication decision in separate index) |
| §4 satisfied rows | **11/18** |
| Emission-allowed plans | **11** |
| PSA rows in DB (ref county) | **11** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-GAMVIK-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-GAMVIK-2026-05-29-01` |
| Inserted row id | `8a8941bb-5aac-4a8a-aa21-cfac01db4d36` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 11
npm run losa:finnmark-publication-plan    # emission allowed: 11
npm run losa:preview-psa-write            # write candidates: 11
npm run losa:plan-route-consumption       # route eligible: 11
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-GAMVIK-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- **Not** bulk remaining **7** rows.
- Nationwide pattern proof — one charter per row session preserved.
