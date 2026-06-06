# Phase 4 LOSA — PSA Write Pilot Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-PSA-WRITE-PILOT-post** |
| **Status code** | `LOSA_PSA_WRITE_PILOT_PASS_BOUNDED` |
| **Date (UTC)** | 2026-05-29 |
| **Charter ID** | `MAIN-LOSA-PSA-WRITE-2026-05-29-01` |
| **Gate** | `phase-4-losa-psa-write-execution-gate-owner-decision-record.md` |
| **Prerequisite** | `P4-LOSA-ALTA-PUBLICATION-DECISION-post` |

**Forbidden in git:** institution UUID as binding constant; secrets.

---

## Pre-session

| Check | Result |
|-------|--------|
| Schema on main | applied |
| Alta evidence §4 | `ROW_SECTION_4_SATISFIED` |
| Publication decision | recorded |
| Dry-run preview | **1** candidate |
| `npm run losa:execute-psa-write-pilot` dry-run | pass |

---

## Execution aggregates

| Field | Value |
|-------|--------|
| County / profession (ref) | `56` / `electrician` |
| Delivery site | **Alta** |
| Vilbli school code | `872137` |
| Provider (NSR session resolve) | Nordkapp videregående skole |
| Programme slug | `electrician-vg1-elektro-finnmark` |
| `availability_scope` | `losa_fjern_delivery_municipality` |
| `municipality_code` | `5601` |
| `stage` | `VG1` |
| `verification_status` | `needs_review` |
| Rows inserted | **1** |
| Re-execute | **skipped** (idempotent) |
| LOSA PSA rows in DB (ref county) | **1** |

**CLI:** `npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-2026-05-29-01`

---

## Boundary

- **Not** bulk 18-row write.
- **Not** Contour B ordinary ingest.
- **Not** Route/UI **#3** (`route eligible: 0`).
- `NOT_READY_FOR_APPLY` unchanged for product apply contour.

---

## Recommended next

Permission **#3** → wire `get-availability-truth` + `availability_scope` filter (**P4-LOSA-ROUTE** wiring gate).

---

## Final statement

First nationwide-pattern LOSA PSA pilot row is in main DB; Route consumption remains blocked until **#3**.
