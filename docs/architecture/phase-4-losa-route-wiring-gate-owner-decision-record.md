# Phase 4 LOSA — Route Wiring Gate Owner Decision Record (Permission #3)

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-ROUTE-WIRING** |
| **Status** | Owner **bounded Route #3 wiring** adopted |
| **Closure label** | `PHASE_4_LOSA_ROUTE_WIRING_BOUNDED_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | **P4-LOSA-PSA-WRITE-PILOT-post** (`6001975`) — **1** Alta LOSA PSA row |
| **Control reference** | `phase-4-losa-route-consumption-draft.md`; `phase-2-closure-criteria-checklist.md` |

Adopts **bounded** permission **#3** wiring: `get-availability-truth` scope filter + LOSA option metadata on `programme_selection` steps. **Does not** clear `NOT_READY_FOR_APPLY`, bulk-write remaining **17** rows, or Contour B `emitLosa`.

---

## Owner decisions (P4LRW0–P4LRW10)

| # | Question | Answer |
|---|----------|--------|
| P4LRW0 | Wire Route read path after **1** pilot PSA row? | **Yes** |
| P4LRW1 | Ordinary steps default to `programme_in_school` only? | **Yes** |
| P4LRW2 | LOSA rows via explicit `losa_fjern_delivery_municipality` scope? | **Yes** |
| P4LRW3 | Nationwide rules — no `56`-only Route branch? | **Yes** |
| P4LRW4 | Distinct option kind metadata on programme_selection? | **Yes** |
| P4LRW5 | **No** live official-source fetch on route page? | **Yes** |
| P4LRW6 | **No** bulk PSA write for remaining kommuner? | **Yes** |
| P4LRW7 | `NOT_READY_FOR_APPLY` unchanged? | **Yes** |
| P4LRW8 | CLI: `losa:plan-route-consumption` → **1** route eligible | **Yes** |
| P4LRW9 | Contour B / P06 non-return rule unchanged? | **Yes** |
| P4LRW10 | Owner-held charter `MAIN-LOSA-ROUTE-WIRING-2026-05-29-01` | **Yes** |

---

## Code touchpoints

| Artifact | Role |
|----------|------|
| `src/lib/losa/availability-scope.ts` | Scope constants + #3 flag |
| `src/server/children/routes/get-availability-truth.ts` | `availability_scope` filter + LOSA notes lineage |
| `src/server/children/routes/should-use-availability-truth.ts` | Merged ordinary + LOSA scopes when #3 on |
| `src/server/children/routes/build-steps-from-availability-truth.ts` | LOSA option kind on programme_selection |
| `src/server/children/routes/enrich-study-route-steps.ts` | Preserve LOSA display titles |
| `scripts/lib/losa-route-consumption.mjs` | Plan CLI `routeEligible: 1` |

---

## Final statement

Bounded **#3** wiring is adopted for the Alta pilot row. Families in matching delivery municipality context may see **1** LOSA option where Route availability-truth applies. **NOT_READY_FOR_APPLY** and bulk LOSA tail remain unchanged.
