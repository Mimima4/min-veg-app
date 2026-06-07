# Phase 4 LOSA — Sør-Varanger PSA Write Pilot Execution Review Safe Summary

| Field | Value |
|-------|--------|
| **Section** | **P4-LOSA-PSA-WRITE-SOR-VARANGER-PILOT-post** |
| **Status code** | `LOSA_PSA_WRITE_SOR_VARANGER_PILOT_PASS_BOUNDED` |
| **Date (UTC)** | 2026-05-29 |
| **Charter ID** | `MAIN-LOSA-PSA-WRITE-SOR-VARANGER-2026-05-29-01` |
| **Prerequisite** | `P4-LOSA-SOR-VARANGER-PUBLICATION-DECISION-post` |

---

## Execution aggregates

| Field | Value |
|-------|--------|
| Delivery site | **Sør-Varanger** |
| Vilbli school code | `6108481` |
| `municipality_code` | `5636` |
| Provider (NSR session) | Nordkapp videregående skole |
| Programme slug | `electrician-vg1-elektro-finnmark` |
| `availability_scope` | `losa_fjern_delivery_municipality` |
| Rows inserted (session) | **1** |
| Inserted row id | `4637386d-7616-4c98-ba73-cbd48d49d048` |
| Re-execute | **skipped** (idempotent) |
| LOSA PSA rows in DB (ref county) | **3** (Alta + Hammerfest + Sør-Varanger) |

**CLI:** `npm run losa:execute-psa-write-pilot -- --execute --charter-id MAIN-LOSA-PSA-WRITE-SOR-VARANGER-2026-05-29-01`

---

## Boundary

- **Not** bulk remaining **15** rows.
- `NOT_READY_FOR_APPLY` unchanged.
- Route **#3** wired — **3** route-eligible plans; DB now matches **3** LOSA rows.

---

## Final statement

Third nationwide-pattern LOSA PSA row (Sør-Varanger) is in main DB; row **3** reference pilot **complete** end-to-end.
