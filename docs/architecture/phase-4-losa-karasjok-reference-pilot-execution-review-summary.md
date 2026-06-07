# Phase 4 LOSA — Karasjok Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-KARASJOK-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_KARASJOK_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) in single bounded session |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Karasjok** |
| Vilbli school code | `6108476` |
| `municipality_code` | `5612` |
| Repo CONFIRMED index delta | **+4** (delivery, programme, supporting packet; publication decision in separate index) |
| §4 satisfied rows | **5/18** |
| Emission-allowed plans | **5** |
| PSA rows in DB (ref county) | **5** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-KARASJOK-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-KARASJOK-2026-05-29-01` |
| Inserted row id | `cebcdec7-4e25-4421-a29c-8f72fafd9e2c` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 5
npm run losa:finnmark-publication-plan    # emission allowed: 5
npm run losa:preview-psa-write            # write candidates: 5
npm run losa:plan-route-consumption       # route eligible: 5
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-KARASJOK-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- **Not** bulk remaining **13** rows.
- Nationwide pattern proof — one charter per row session preserved.
