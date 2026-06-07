# Phase 4 LOSA — Loppa Reference Pilot Full Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-LOPPA-REFERENCE-PILOT-post** |
| **Status code** | `LOSA_LOPPA_ROW_SECTION_4_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Mode** | Full row closure (sub-gates **1–5**) in single bounded session |

---

## Aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Loppa** |
| Vilbli school code | `229033` |
| `municipality_code` | `5634` |
| Repo CONFIRMED index delta | **+4** (delivery, programme, supporting packet; publication decision in separate index) |
| §4 satisfied rows | **15/18** |
| Emission-allowed plans | **15** |
| PSA rows in DB (ref county) | **15** |
| Publication decision charter | `MAIN-LOSA-PUBLICATION-DECISION-LOPPA-2026-05-29-01` |
| PSA write charter | `MAIN-LOSA-PSA-WRITE-LOPPA-2026-05-29-01` |
| Inserted row id | `62063a11-9efc-4f01-9fb6-20911be47b84` |

---

## CLI proof

```bash
npm run losa:finnmark-evidence-link      # §4 satisfied: 15
npm run losa:finnmark-publication-plan    # emission allowed: 15
npm run losa:preview-psa-write            # write candidates: 15
npm run losa:plan-route-consumption       # route eligible: 15
npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-LOPPA-2026-05-29-01
```

---

## Boundary

- `NOT_READY_FOR_APPLY` unchanged.
- Route UI badge note deferred — see `phase-4-losa-route-ui-badge-owner-note.md`.
- **Not** bulk remaining **3** rows.
