# Phase 4 LOSA — Alta Programme Full Row Closure Gate (Sub-gate 3)

| Field | Value |
|--------|--------|
| **Status** | Owner **programme full row closure** adopted for Alta LOSA pilot |
| **Section** | **P4-LOSA-ALTA-PROGRAMME-FULL** |
| **Closure label** | `PHASE_4_LOSA_ALTA_PROGRAMME_FULL_ROW_CLOSURE_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | **P4-LOSA-CONFIRMED-NORDKAPP-PROVIDER-post**; **P4-LOSA-CONFIRMED-ALTA-DELIVERY-post**; **P4-LOSA-CONFIRMED-ALTA-PROGRAMME-post** |

**Does NOT:** authorize PSA insert, clear `publication_supporting_evidence`, Route **#3**, or `NOT_READY_FOR_APPLY`.

---

## Closure rule (binding)

`programme_stage_availability` for the **Alta** delivery row upgrades from `row_confirmed_partial` → **`row_confirmed`** with `publishable: true` when **all** hold:

1. Existing CONFIRMED `T2_SCHOOL_ALTA_VGS_PROGRAM_DEEP` at `delivery_site_alta` scope.
2. `provider_school` **row_confirmed** (Nordkapp) on the same manifest row.
3. `delivery_municipality` **row_confirmed** (Alta) on the same manifest row.

**Citation basis (unchanged):** Pilot 3b programme page — Elektro og datateknologi listed (`P4-LOSA-CONFIRMED-ALTA-PROGRAMME-post`).

**Not eligible:** other delivery municipalities; programme CONFIRMED without provider+delivery prerequisites.

---

## Owner decisions (P4LAPF0–P4LAPF6)

| # | Decision | Answer |
|---|----------|--------|
| P4LAPF0 | Adopt full row closure after sub-gates 1–2? | **Yes** |
| P4LAPF1 | **No** new CONFIRMED index row (policy upgrade only) | **Yes** |
| P4LAPF2 | Evidence-link prerequisite check in code | **Yes** |
| P4LAPF3 | Alta-only scope (`delivery_site_alta`) | **Yes** |
| P4LAPF4 | §4 still blocked on `publication_supporting_evidence` | **Yes** |
| P4LAPF5 | **No** PSA / Phase 2 DML | **Yes** |
| P4LAPF6 | CLI: Alta `programme_stage_availability` not partial | **Yes** |

---

## Final boundary

Programme claim is **row-satisfied** for Alta Nordkapp LOSA delivery; supporting-evidence packet and publication decision remain open before §4 full closure.
