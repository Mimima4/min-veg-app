# Phase 4 LOSA — Cross-Profession Route Consumption Closure

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — read path live; Finnmark reference PSA unchanged |
| **Date (UTC)** | 2026-07-10 |
| **Prerequisite** | Finnmark 18/18 LOSA PSA (`phase-4-losa-operational-tail-closure-execution-review-summary.md`) |

---

## Policy

LOSA (`losa_fjern_delivery_municipality`) is a **geography + delivery-model** overlay — not profession-scoped. When active LOSA PSA rows exist in a fylke, `get-availability-truth` surfaces them on **every** Contour B profession route in that county (display mapped to the route programme for the active VG stage).

Electrician Finnmark ingest remains the **reference PSA write**; other professions do not duplicate LOSA rows.

---

## Automated proof (2026-07-10)

| Check | Result |
|-------|--------|
| `npm run losa:finnmark-evidence-link` | **18/18** §4, **0** blocked |
| `npm run losa:plan-route-consumption` | **18** route eligible |
| `npm run smoke:losa-cross-profession` | PASS — painter + electrician truth each **≥18** LOSA rows in `56` |

---

## Out of scope (separate charter)

| Item | Status |
|------|--------|
| Troms `55` LOSA expansion | Verify-first — `phase-4-losa-regional-delivery-models-fit-analysis.md` |
| New kommune LOSA publication | Per-row Phase 4 gates — not bulk Contour B relay |

---

## References

- `phase-4-source-truth-contour-map.md` §7
- `src/server/children/routes/get-availability-truth.ts` — county LOSA merge (cross-profession)
