# Phase 4 LOSA — §4 Alta Pilot Row Closure Gate Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-SECTION-4-ALTA-PILOT** |
| **Status** | **PILOT INSERT COMPLETE** — **1** LOSA PSA row; Route **#3** open |
| **Closure label** | `PHASE_4_LOSA_ALTA_PSA_WRITE_PILOT_COMPLETE` |
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
| CLI proof today | Alta **6/6** publishable → `ROW_SECTION_4_SATISFIED`; **1/18** rows satisfied; posture `REFERENCE_ROW_SECTION_4_SATISFIED_PARTIAL` |

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
| `publication_supporting_evidence` | **`row_confirmed`** (`T1T2_ALTA_LOSA_PUBLICATION_SUPPORT_PACKET`) | **Done** (sub-gate 4) |

**Rule:** `scripts/lib/losa-finnmark-evidence-link.mjs` sets `psaEligible` only when **every** claim has `publishable: true`.

---

## 3. Ordered sub-gates (owner-held)

| # | Sub-gate | Artifact | Max delta |
|---|----------|----------|-----------|
| 1 | Bounded **CONFIRMED** promotion — Nordkapp `provider_school` | **DONE** — `phase-4-losa-confirmed-promotion-nordkapp-provider-gate-owner-decision-record.md` | **1** CONFIRMED row |
| 2 | Bounded **CONFIRMED** promotion — Alta `delivery_municipality` | **DONE** — `phase-4-losa-confirmed-promotion-alta-delivery-gate-owner-decision-record.md` | **1** CONFIRMED row |
| 3 | Alta programme **partial → full** row closure | **DONE** — `phase-4-losa-alta-programme-full-row-closure-gate-owner-decision-record.md` | **0** new CONFIRMED rows |
| 4 | `publication_supporting_evidence` combined packet | **DONE** — `phase-4-losa-alta-supporting-evidence-gate-owner-decision-record.md` | **1** packet row |
| 5 | County Tier 1 → row-publishable rule | **DONE** — `phase-4-losa-county-tier1-row-publishable-rule-gate-owner-decision-record.md` | Policy only |
| 6 | Auditable **publication decision** object | **DONE** — `phase-4-losa-alta-publication-decision-gate-owner-decision-record.md` | **1** Alta row |
| 7 | **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `phase-4-losa-psa-write-pilot-execution-review-summary.md` | **1** row inserted |

**Paused by owner tranche (2026-06-03):** sub-gates **1–2** were explicitly **SNIPPET_ONLY** — reopening requires **new** owner gate, not automatic promotion.

---

## 4. Owner decisions (proposed — P4LS4A0–P4LS4A8)

| # | Question | Answer (pending owner) |
|---|----------|------------------------|
| P4LS4A0 | Adopt Alta as **first** §4 pilot row (reference `56`)? | **Yes** |
| P4LS4A1 | County Tier 1 CONFIRMED satisfies `legal_status` + `fjernundervisning_rules` at row level? | **Yes** |
| P4LS4A2 | Re-open SNIPPET_ONLY provider/delivery for bounded CONFIRMED promotion? | **Yes** |
| P4LS4A3 | Max **1** row §4 closure in this gate (Alta only)? | **Yes** |
| P4LS4A4 | Publication decision recorded **before** PSA write charter? | **Yes** |
| P4LS4A5 | **No** PSA write **execution** in publication-decision gate? | **Yes** |
| P4LS4A6 | **No** Route **#3** in this gate? | **Yes** |
| P4LS4A7 | CLI re-proof: `losa:finnmark-evidence-link` shows Alta `ROW_SECTION_4_SATISFIED` | **Yes** |
| P4LS4A8 | Next after closure: **P4-LOSA-PSA-WRITE** charter (max **1** row) | **Yes** (open) |

---

## 5. CLI proof chain (post-closure target)

```bash
npm run losa:finnmark-evidence-link    # Alta → ROW_SECTION_4_SATISFIED
npm run losa:finnmark-publication-plan # Alta emissionAllowed true (schema applied)
npm run losa:preview-psa-write         # 1 candidate; execution still unauthorized
```

---

## Final statement

Schema on main is **ready**. Alta **pilot PSA row inserted** (`losa_fjern_delivery_municipality`, Alta `5601`). Route/UI consumption remains blocked until **#3** wiring gate.
