# Phase 4 LOSA — Route Consumption Gate Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-ROUTE** |
| **Status** | Owner **Route consumption draft** adopted — **plan scaffold only** |
| **Closure label** | `PHASE_4_LOSA_ROUTE_CONSUMPTION_DRAFT_ADOPTED_NO_WIRING` |
| **Date (UTC)** | 2026-06-05 |
| **Prerequisite** | **P4-LOSA-PSA-WRITE** (`4409d2a`) |
| **Control reference** | `phase-2-closure-criteria-checklist.md` — Section **P4-LOSA-ROUTE** |

Adopts Route consumption **model** for LOSA PSA rows. **Does not** approve permission **#3**, app/API changes, or `get-availability-truth` patch.

---

## Owner decisions (P4LRC0–P4LRC11)

| # | Question | Answer |
|---|----------|--------|
| P4LRC0 | Adopt Route consumption draft? | **Yes** |
| P4LRC1 | LOSA options distinct from ordinary campus? | **Yes** |
| P4LRC2 | Nationwide rules — county/profession from route context? | **Yes** |
| P4LRC3 | Ordinary steps default to `programme_in_school` only when wired? | **Yes** |
| P4LRC4 | **No** `src/server` / app wiring in this gate? | **Yes** |
| P4LRC5 | **No** permission **#3**? | **Yes** |
| P4LRC6 | **0** route options today (no PSA rows)? | **Yes** |
| P4LRC7 | `NOT_READY_FOR_APPLY` unchanged? | **Yes** |
| P4LRC8 | CLI: `npm run losa:plan-route-consumption` exit 0 | **Yes** |
| P4LRC9 | Product #3 gate required before family-facing LOSA options? | **Yes** |
| P4LRC10 | Contour B / P06 non-return rule unchanged? | **Yes** |
| P4LRC11 | Phase 4 LOSA **planning tranche** complete at docs level? | **Yes** (pending PSA write session for data) |

---

## Artifacts

| Artifact | Role |
|----------|------|
| `phase-4-losa-route-consumption-draft.md` | Consumption model |
| `scripts/lib/losa-route-consumption.mjs` | Option plan builder (read-only) |
| `scripts/plan-losa-route-consumption.mjs` | CLI proof |

---

## Final statement

Route **plan** exists; **no** LOSA options in product until PSA write + **#3**. Phase 4 LOSA doc/scaffold chain complete; operational tail = migration apply + §4 row + write session.
