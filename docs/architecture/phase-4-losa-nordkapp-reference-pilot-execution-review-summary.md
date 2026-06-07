# Phase 4 LOSA — Nordkapp Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-NORDKAPP-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_NORDKAPP_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) + route UI LOSA badge |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Nordkapp** (kommune) |
| Vilbli school code | `6108474` |
| `municipality_code` | `5628` |
| Evidence scope | `delivery_site_nordkapp` (≠ `provider_nordkapp`) |
| §4 satisfied rows | **17/18** |
| Emission-allowed plans | **17** |
| PSA rows in DB (ref county) | **17** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-NORDKAPP-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-NORDKAPP-2026-05-29-01` |
| Inserted row id | `dc1eb80d-8380-4975-a220-0caf0f18b270` |
| Route UI | LOSA badge + provider-only `display_title` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 17
npm run losa:finnmark-publication-plan    # emission allowed: 17
npm run losa:preview-psa-write            # write candidates: 17
npm run losa:plan-route-consumption       # route eligible: 17
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-NORDKAPP-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- **1** manifest row remains (Vadsø).
- UI badge pattern — validate on Vadsø row **18**.
