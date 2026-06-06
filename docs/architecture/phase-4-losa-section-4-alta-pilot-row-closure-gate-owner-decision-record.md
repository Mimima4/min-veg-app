# Phase 4 LOSA — §4 Alta Pilot Row Closure Gate Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-ALTA-PILOT** |
| **Status** | **IN PROGRESS** — sub-gates **1–3** and **5** complete; sub-gates **4, 6–7** open |
| **Closure label** | `PHASE_4_LOSA_SECTION_4_ALTA_PILOT_SUBGATE_3_5_COMPLETE` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | **P4-LOSA-PSA** main apply (`phase-4-losa-psa-schema-main-apply-checklist.md`) |
| **Reference row** | Vilbli LOSA **Alta** delivery (`Nordkapp videregående skole – LOSA Alta`) |

**Does NOT:** authorize PSA insert, Route/UI **#3**, Contour B `emitLosa`, matcher retry on `56`, or clear `NOT_READY_FOR_APPLY` alone.

---

## 1. Why Alta (reference only)

| Signal | Value |
|--------|-------|
| Manifest rows | **18** (all Nordkapp provider × delivery municipality) |
| Rows with any non-blocked claim linkage | **1** (Alta) |
| Alta `programme_stage_availability` | **`row_confirmed`** (`P4-LOSA-ALTA-PROGRAMME-FULL`) |
| Alta `provider_school` | **`row_confirmed`** (`P4-LOSA-CONFIRMED-NORDKAPP-PROVIDER-post`) |
| Alta `delivery_municipality` | **`row_confirmed`** (`P4-LOSA-CONFIRMED-ALTA-DELIVERY-post`) |
| County Tier 1 (P4LS4A1) | `legal_status`, `fjernundervisning_rules` — **publishable** via county reference |
| CLI proof today | Alta **5/6** publishable; **1** blocked (`publication_supporting_evidence`); **18/18** rows `STILL_BLOCKED_SECTION_4` |

Finnmark `56` / electrician is **reference proof** only; gate pattern is **nationwide-applicable**.

---

## 2. §4 claim checklist (Alta row — all required)

Per `phase-4-losa-finnmark-publishability-contract-draft.md` §4:

| claim_class | Current linkage | Required to close §4 |
|-------------|-----------------|----------------------|
| `legal_status` | **`county_reference_confirmed`** (publishable) | **Done** (P4LS4A1 / sub-gate 5) |
| `fjernundervisning_rules` | **`county_reference_confirmed`** (publishable) | **Done** (P4LS4A1 / sub-gate 5) |
| `provider_school` | **`row_confirmed`** (`T2_SCHOOL_NORDKAPP_VGS`) | **Done** (sub-gate 1) |
| `delivery_municipality` | **`row_confirmed`** (`T2_KOMMUNE_ALTA_REF`) | **Done** (sub-gate 2) |
| `programme_stage_availability` | **`row_confirmed`** | **Done** (sub-gate 3) |
| `publication_supporting_evidence` | `blocked` | Tier 1 + Tier 2 combined packet per registry (never alone) |

**Rule:** `scripts/lib/losa-finnmark-evidence-link.mjs` sets `psaEligible` only when **every** claim has `publishable: true`.

---

## 3. Ordered sub-gates (owner-held)

| # | Sub-gate | Artifact | Max delta |
|---|----------|----------|-----------|
| 1 | Bounded **CONFIRMED** promotion — Nordkapp `provider_school` | **DONE** — `phase-4-losa-confirmed-promotion-nordkapp-provider-gate-owner-decision-record.md` | **1** CONFIRMED row |
| 2 | Bounded **CONFIRMED** promotion — Alta `delivery_municipality` | **DONE** — `phase-4-losa-confirmed-promotion-alta-delivery-gate-owner-decision-record.md` | **1** CONFIRMED row |
| 3 | Alta programme **partial → full** row closure | **DONE** — `phase-4-losa-alta-programme-full-row-closure-gate-owner-decision-record.md` | **0** new CONFIRMED rows |
| 4 | `publication_supporting_evidence` combined packet | Owner-held evidence bundle | Per refresh-design |
| 5 | County Tier 1 → row-publishable rule | **DONE** — `phase-4-losa-county-tier1-row-publishable-rule-gate-owner-decision-record.md` | Policy only |
| 6 | Auditable **publication decision** object | Owner-held charter / Phase 2 decision record | **1** Alta row |
| 7 | Repo index sync | Update `LOSA_FINNMARK_CONFIRMED_INDEX` after owner posts | Docs + `losa-finnmark-evidence-index.mjs` |

**Paused by owner tranche (2026-06-03):** sub-gates **1–2** were explicitly **SNIPPET_ONLY** — reopening requires **new** owner gate, not automatic promotion.

---

## 4. Owner decisions (proposed — P4LS4A0–P4LS4A8)

| # | Question | Answer (pending owner) |
|---|----------|------------------------|
| P4LS4A0 | Adopt Alta as **first** §4 pilot row (reference `56`)? | **Yes** |
| P4LS4A1 | County Tier 1 CONFIRMED satisfies `legal_status` + `fjernundervisning_rules` at row level? | **Yes** |
| P4LS4A2 | Re-open SNIPPET_ONLY provider/delivery for bounded CONFIRMED promotion? | **Yes** |
| P4LS4A3 | Max **1** row §4 closure in this gate (Alta only)? | _pending_ |
| P4LS4A4 | Publication decision recorded **before** PSA write charter? | _pending_ |
| P4LS4A5 | **No** PSA write in this gate? | _pending_ |
| P4LS4A6 | **No** Route **#3** in this gate? | _pending_ |
| P4LS4A7 | CLI re-proof: `losa:finnmark-evidence-link` shows Alta `ROW_SECTION_4_SATISFIED` | _pending_ |
| P4LS4A8 | Next after closure: **P4-LOSA-PSA-WRITE** charter (max **1** row) | _pending_ |

---

## 5. CLI proof chain (post-closure target)

```bash
npm run losa:finnmark-evidence-link    # Alta → ROW_SECTION_4_SATISFIED
npm run losa:finnmark-publication-plan # Alta emissionAllowed true (schema applied)
npm run losa:preview-psa-write         # 1 candidate; execution still unauthorized
```

---

## Final statement

Schema on main is **ready**. **§4** on the first pilot row remains **owner-held** until CONFIRMED promotions, combined supporting evidence, and publication decision close all claim classes for Alta.
