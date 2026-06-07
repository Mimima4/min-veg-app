# Phase 4 LOSA — Nesseby Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-NESSEBY-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_NESSEBY_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) in single bounded session |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Nesseby** |
| Vilbli school code | `6108478` |
| `municipality_code` | `5622` |
| Repo CONFIRMED index delta | **+4** (delivery, programme, supporting packet; publication decision in separate index) |
| §4 satisfied rows | **8/18** |
| Emission-allowed plans | **8** |
| PSA rows in DB (ref county) | **8** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-NESSEBY-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-NESSEBY-2026-05-29-01` |
| Inserted row id | `40cb3c04-a021-49f7-968c-3020e4933da7` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 8
npm run losa:finnmark-publication-plan    # emission allowed: 8
npm run losa:preview-psa-write            # write candidates: 8
npm run losa:plan-route-consumption       # route eligible: 8
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-NESSEBY-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- **Not** bulk remaining **10** rows.
- Nationwide pattern proof — one charter per row session preserved.
