# Phase 2 RLS MAIN Route/PSA Wiring Review Safe Summary

| Field | Value |
|-------|--------|
| **Status** | Safe summary of completed Route/PSA wiring review — Route **NO_TOUCH** / PSA **NO_TOUCH** / full **Q4** pass requires separate owner decision / **NOT_READY_FOR_APPLY** unchanged |
| **Suggested status code** | `RLS_MAIN_ROUTE_PSA_WIRING_REVIEWED_NO_TOUCH_SAFE_SUMMARY` |
| **Date (UTC)** | 2026-05-27 |
| **Basis checkpoint** | `18bcf47` (Phase 2 RLS MAIN Route/PSA wiring review gate — Section **X**) |
| **Scope** | Safe summary only; no SQL, no Supabase connect, no tests, no runtime activation |
| **Gate** | XR0–XR21 per `phase-2-rls-main-route-psa-wiring-review-gate-owner-decision-record.md` (Section **X**) |
| **Charter** | `MAIN-ROUTE-PSA-WIRING-2026-05-27-01` — **owner-held** (ID only in git) |

This record safely summarizes the completed bounded **repo/docs/spec** Route/PSA wiring review on **MAIN-OWNER-USED** / **PROD**. It records whether current Route or PSA **product runtime** paths touch the **seven** Phase 2 RLS tables. It does **not** include raw logs, secrets, project identifiers, service keys, connection strings, raw rows, screenshots, search transcripts, or real person identities. It does **not** approve **N12** packet pass, execution packet, runtime/write, PSA activation, Route activation, Phase 3, or Phase 4.

**Role labels in this record:** **OWNER**, **SECURITY_APPROVER**, **TECH_PLANNER** (real names/emails **owner-held**).

**Taxonomy note:** Short labels **ROUTE_NO_TOUCH** / **PSA_NO_TOUCH** in this summary align with gate labels `ROUTE_NO_TOUCH_PHASE2_TABLES_CONFIRMED` / `PSA_NO_TOUCH_PHASE2_TABLES_CONFIRMED` (XR8/XR9).

---

## This document is not

- not SQL execution or SQL approval
- not Supabase connect or Supabase apply
- not runtime execution or runtime/write approval
- not Route/PSA negative-test execution
- not raw log or search transcript storage
- not full **Q4** pass by itself
- not **N12** packet pass
- not execution packet approval
- not Phase 2 row writes approval
- not PSA publication or materialization approval
- not Route Engine consumption approval
- not production truth approval
- not operator/admin workflow approval
- not helper/pipeline integration approval beyond bounded diagnostics classification
- not Phase 3 approval
- not Phase 4 approval
- not **NOT_READY_FOR_APPLY** clearance
- not RLS **production-safe** claim
- not proof that **programme_school_availability** (published operational table) is the same object as `programme_availability_publication_decisions` (Phase 2 decision table)

---

## MAIN-OWNER-USED / PROD Route/PSA wiring review summary

| Field | Value |
|-------|--------|
| Session result | **COMPLETED** |
| Review type | Bounded **repo/docs/spec** read-only review |
| Checkpoint | `18bcf47` |
| Files changed by review | **no** |
| SQL run | **no** |
| Supabase connected | **no** |
| Tests run | **no** |
| Runtime activated | **no** |
| Route classification | **ROUTE_NO_TOUCH** (`ROUTE_NO_TOUCH_PHASE2_TABLES_CONFIRMED`) |
| PSA classification | **PSA_NO_TOUCH** (`PSA_NO_TOUCH_PHASE2_TABLES_CONFIRMED`) |
| Runtime `src/` direct refs to seven Phase 2 tables | **none found** |
| Route current runtime source | `programme_school_availability` and related **operational** tables (e.g. `education_programs`, `education_institutions`) |
| PSA current path source | `programme_school_availability` (VGS availability / publication operational contour) |
| Diagnostics helper Phase 2 refs | **present** — **non-product** diagnostics/admin-only |
| Docs/spec future references | **present** — **future-only**, owner-gated |
| Route/PSA negative-test gate required **now** | **no** (based on current **NO_TOUCH** product-runtime classification) |
| **Q4** full pass claimed | **no** |
| **N12** packet pass claimed | **no** |
| Packet approved | **no** |
| Runtime/write approved | **no** |
| PSA/Route activation approved | **no** |
| **NOT_READY_FOR_APPLY** | **unchanged** |
| **EXECUTION_PACKET_DRAFT_FORBIDDEN** | **unchanged** |

---

## Classification table

| Layer | Classification |
|-------|----------------|
| Route (product runtime) | **ROUTE_NO_TOUCH** |
| PSA / availability (product runtime) | **PSA_NO_TOUCH** |
| Internal diagnostics helper | **NON_PRODUCT_DIAGNOSTICS_ADMIN_ONLY** |
| Docs/spec future wiring | **FUTURE_ONLY_OWNER_GATED** |
| Published operational table (`programme_school_availability`) | **SEPARATE_FROM** raw Phase 2 `programme_availability_publication_decisions` |

---

## Per-table product-runtime touch (safe labels)

Review scope: Route Engine / route generation read paths and PSA / `programme_school_availability` product paths in `src/` and bounded scripts review — **not** migrations-only or docs-only mentions.

| Phase 2 table | Route product runtime | PSA product runtime |
|---------------|----------------------|---------------------|
| source_school_observations | **no touch** | **no touch** |
| school_identity_candidates | **no touch** | **no touch** |
| identity_aliases | **no touch** | **no touch** |
| school_locations | **no touch** | **no touch** |
| school_identity_resolution_decisions | **no touch** | **no touch** |
| programme_availability_publication_decisions | **no touch** | **no touch** |
| school_identity_review_events | **no touch** | **no touch** |

---

## Diagnostics helper (non-product)

`scripts/lib/phase2-readonly-diagnostics-helper.mjs` references **some** Phase 2 tables (`source_school_observations`, `school_identity_resolution_decisions`, `programme_availability_publication_decisions`) under contract-bounded read-only diagnostics — **not** Route/PSA product runtime. It does **not** widen Route/PSA wiring conclusions. Diagnostics output is **not** publication truth (N9).

---

## N6 plan alignment (wiring vs Tranche B)

| N6 outcome (plan) | W-post (Tranche B) | X-post (wiring) | Notes |
|-------------------|-------------------|-----------------|-------|
| Route raw Phase 2 access denied | **UNCLEAR** / not tested | **NO_PRODUCT_WIRING** — negative test **not required now** | Not a live deny test; no product path touches raw Phase 2 tables |
| PSA/publication raw Phase 2 access denied | **UNCLEAR** / not tested | **NO_PRODUCT_WIRING** — negative test **not required now** | PSA uses `programme_school_availability`, not raw Phase 2 tables |
| App/browser direct DB shortcut denied | **NOT_TESTED** | **unchanged** | Out of X-post scope |
| Diagnostics ≠ published truth | **NOT_TESTED** | **classified** non-product | Not a Tranche B re-run |

**Aggregate wiring verdict:** `ROUTE_PSA_PRODUCT_RUNTIME_NO_TOUCH_DIAGNOSTICS_NON_PRODUCT`

---

## Cross-check with W-post / W-Q4

| Prior fact | X-post observation | Consistent? |
|------------|-------------------|-------------|
| W-post: Route/PSA **UNCLEAR** at Tranche B | Product paths **not tested** in Tranche B; wiring now **NO_TOUCH** in repo review | **yes** — narrows limitation |
| W-Q4: limitation recorded; next gate = Route/PSA review | Section **X** review **completed** | **yes** |
| W-post: client-role denial **PASS** | Unchanged; X-post does not weaken client-role evidence | **yes** |
| U-post / V-post: RLS on; rows 0 | X-post does not contradict | **yes** |

---

## Interpretation

- Current Route **product runtime** does **not** directly touch the **seven** Phase 2 RLS tables in reviewed `src/` paths.
- Current PSA / availability **product runtime** does **not** directly touch the **seven** Phase 2 tables; it uses **`programme_school_availability`** (operational published availability), which is **not** the same table as Phase 2 `programme_availability_publication_decisions`.
- Route/PSA rely on operational/published surfaces rather than raw Phase 2 evidence tables in current wiring.
- The diagnostics helper reference is **not** product runtime proof and remains bounded diagnostics/admin-only.
- Future docs/spec references do **not** authorize runtime integration without separate owner gates.
- Because Route and PSA are **NO_TOUCH** for current product runtime, a Route/PSA negative-test **execution** gate is **not required now** for the **current** wiring state.
- This **resolves the Route/PSA limitation identified in W-Q4 at wiring-review level** (product paths do not touch raw Phase 2 tables).
- It does **not** by itself approve **full Q4** pass, **N12**, packet, runtime/write, PSA/Route activation, production truth, publication/materialization, Phase 3, or Phase 4.
- **OWNER** / **SECURITY_APPROVER** may still require a **separate Q4-finalization decision** weighing **W-post** client-role evidence + **X-post** wiring + any remaining N6 gaps (e.g. app/browser shortcut **NOT_TESTED**).

---

## Closes / does not close

### Closes (safe summary / wiring-review level)

| Item | Status |
|------|--------|
| Section **X** operational wiring review **completed** | **yes** |
| Route product runtime classified **ROUTE_NO_TOUCH** | **yes** |
| PSA product runtime classified **PSA_NO_TOUCH** | **yes** |
| Diagnostics helper classified non-product | **yes** |
| Docs/spec future refs classified future-only owner-gated | **yes** |
| **X-post** safe summary recorded | **yes** |
| W-Q4 Route/PSA limitation narrowed at wiring level | **yes** |

### Does not close

| Item | Status |
|------|--------|
| Automatic **full Q4** pass | **not** closed |
| **Q4** finalization owner decision (if still required) | **not** closed |
| **N12** packet pass | **not** closed |
| Execution packet | **not** closed |
| Runtime/write | **not** closed |
| Phase 2 row writes | **not** closed |
| PSA activation / publication | **not** closed |
| Route activation / consumption approval | **not** closed |
| Production truth | **not** closed |
| Publication/materialization execution | **not** closed |
| Operator/admin workflow | **not** closed |
| Helper/pipeline integration beyond bounded diagnostics | **not** closed |
| Phase 3 / Phase 4 | **not** closed |
| **NOT_READY_FOR_APPLY** clearance | **not** closed |

---

## Next gate (informational only)

- Next step may be **OWNER** / **SECURITY_APPROVER** **Q4-finalization** decision considering **W-post** + **X-post** together (including any remaining N6 gaps).
- **N12** / packet / runtime/write cannot proceed **automatically** from **X-post**.
- If future code changes make Route or PSA touch the **seven** Phase 2 tables, a **new** Route/PSA wiring review and likely Route/PSA negative-test execution gate are required.
- Execution packet remains **forbidden**.
- Runtime/write remains **blocked**.

---

## Final boundary statement

- **X-post** **NO_TOUCH** does **not** equal **N12** pass.
- **X-post** **NO_TOUCH** does **not** approve packet, runtime/write, PSA activation, or Route activation.
- **X-post** **NO_TOUCH** does **not** equal live Route/PSA **N6 denial** test pass (no product wiring found; deny tests not required **for current wiring**).
- Future Route/PSA wiring changes require **new** review.
- **NOT_READY_FOR_APPLY** unchanged.
- **EXECUTION_PACKET_DRAFT_FORBIDDEN** unchanged.
