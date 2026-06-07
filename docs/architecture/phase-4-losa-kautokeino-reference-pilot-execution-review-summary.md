# Phase 4 LOSA — Kautokeino Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-KAUTOKEINO-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_KAUTOKEINO_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) in single bounded session |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Kautokeino** (Guovdageaidnu) |
| Vilbli school code | `6108477` |
| `municipality_code` | `5607` |
| Kommune landing | `https://www.guovdageainnu.suohkan.no/` |
| §4 satisfied rows | **6/18** |
| Emission-allowed plans | **6** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-KAUTOKEINO-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-KAUTOKEINO-2026-05-29-01` |
| Inserted row id | `a7a5eda1-bd23-4233-a227-bc8a268bdfc8` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 6
npm run losa:finnmark-publication-plan    # emission allowed: 6
npm run losa:preview-psa-write            # write candidates: 6
npm run losa:plan-route-consumption       # route eligible: 6
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-KAUTOKEINO-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- **Not** bulk remaining **12** rows.
