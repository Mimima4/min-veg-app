# Phase 4 LOSA — Vadsø Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-VADSO-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_VADSO_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Final manifest row closure (sub-gates **1–5**) |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Vadsø** |
| Vilbli school code | `6108480` |
| `municipality_code` | `5610` |
| Evidence scope | `delivery_site_vadso` (label norm `vadsø`) |
| §4 satisfied rows | **18/18** (Finnmark ref **COMPLETE**) |
| Emission-allowed plans | **18** |
| PSA rows in DB (ref county) | **18** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-VADSO-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-VADSO-2026-05-29-01` |
| Inserted row id | `3f2fec9c-d86b-4472-9ca4-b1ceeaa1d59d` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 18/18
npm run losa:finnmark-publication-plan    # emission allowed: 18
npm run losa:preview-psa-write            # write candidates: 18
npm run losa:plan-route-consumption       # route eligible: 18
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-VADSO-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- Bulk PSA write still **OPEN** (charter-per-row pattern).
- LOSA route UI badge — **validated** on final row (`phase-4-losa-route-ui-badge-owner-note.md`).
