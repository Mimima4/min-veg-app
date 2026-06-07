# Phase 4 LOSA — Måsøy Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-MASOY-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_MASOY_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) in single bounded session |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Måsøy** |
| Vilbli school code | `8883` |
| `municipality_code` | `5626` |
| Evidence scope key | `delivery_site_masoy` (label norm `masøy`) |
| §4 satisfied rows | **16/18** |
| Emission-allowed plans | **16** |
| PSA rows in DB (ref county) | **16** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-MASOY-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-MASOY-2026-05-29-01` |
| Inserted row id | `096ce902-e9f4-4b81-96dc-eec5a9c77e9e` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 16
npm run losa:finnmark-publication-plan    # emission allowed: 16
npm run losa:preview-psa-write            # write candidates: 16
npm run losa:plan-route-consumption       # route eligible: 16
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-MASOY-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- Route UI badge — deferred to Nordkapp + Vadsø (`phase-4-losa-route-ui-badge-owner-note.md`).
- **Not** bulk remaining **2** rows.
