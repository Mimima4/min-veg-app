# Phase 4 LOSA — Hasvik Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-HASVIK-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_HASVIK_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) in single bounded session |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Hasvik** |
| Vilbli school code | `8873` |
| `municipality_code` | `5624` |
| Repo CONFIRMED index delta | **+4** (delivery, programme, supporting packet; publication decision in separate index) |
| §4 satisfied rows | **13/18** |
| Emission-allowed plans | **13** |
| PSA rows in DB (ref county) | **13** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-HASVIK-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-HASVIK-2026-05-29-01` |
| Inserted row id | `f017c298-733f-495f-88d4-dcb5adc68cf3` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 13
npm run losa:finnmark-publication-plan    # emission allowed: 13
npm run losa:preview-psa-write            # write candidates: 13
npm run losa:plan-route-consumption       # route eligible: 13
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-HASVIK-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- **Not** bulk remaining **5** rows.
- Nationwide pattern proof — one charter per row session preserved.
