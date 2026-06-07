# Phase 4 LOSA — Lebesby Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-LEBESBY-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_LEBESBY_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) in single bounded session |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Lebesby** |
| Vilbli school code | `8874` |
| `municipality_code` | `5614` |
| Repo CONFIRMED index delta | **+4** (delivery, programme, supporting packet; publication decision in separate index) |
| §4 satisfied rows | **10/18** |
| Emission-allowed plans | **10** |
| PSA rows in DB (ref county) | **10** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-LEBESBY-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-LEBESBY-2026-05-29-01` |
| Inserted row id | `a8d4497e-113a-4e2e-901c-9fcfd930e8f9` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 10
npm run losa:finnmark-publication-plan    # emission allowed: 10
npm run losa:preview-psa-write            # write candidates: 10
npm run losa:plan-route-consumption       # route eligible: 10
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-LEBESBY-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- **Not** bulk remaining **8** rows.
- Nationwide pattern proof — one charter per row session preserved.
