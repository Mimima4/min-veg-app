# Phase 4 LOSA — Båtsfjord Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-BATSFJORD-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_BATSFJORD_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) in single bounded session |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Båtsfjord** |
| Vilbli school code | `908779` |
| `municipality_code` | `5620` |
| Repo CONFIRMED index delta | **+4** (delivery, programme, supporting packet; publication decision in separate index) |
| §4 satisfied rows | **14/18** |
| Emission-allowed plans | **14** |
| PSA rows in DB (ref county) | **14** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-BATSFJORD-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-BATSFJORD-2026-05-29-01` |
| Inserted row id | `70fe8a8f-0b87-40e7-83ba-59d2b0cf9a5a` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 14
npm run losa:finnmark-publication-plan    # emission allowed: 14
npm run losa:preview-psa-write            # write candidates: 14
npm run losa:plan-route-consumption       # route eligible: 14
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-BATSFJORD-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- **Not** bulk remaining **4** rows.
- Nationwide pattern proof — one charter per row session preserved.
