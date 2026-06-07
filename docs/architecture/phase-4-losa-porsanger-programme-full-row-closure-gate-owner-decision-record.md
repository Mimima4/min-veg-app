# Phase 4 LOSA — Porsanger Programme Full Row Closure Gate (Sub-gate 2)

| Field | Value |
|--------|--------|
| **Status** | Owner **programme full row closure** adopted for Porsanger row **4** |
| **Section** | **P4-LOSA-PORSANGER-PROGRAMME-FULL** |
| **Closure label** | `PHASE_4_LOSA_PORSANGER_PROGRAMME_FULL_ROW_CLOSURE_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | **P4-LOSA-CONFIRMED-PORSANGER-PROGRAMME-post** |

---

## Closure rule (binding)

`programme_stage_availability` for **Porsanger** upgrades to **`row_confirmed`** with `publishable: true` when **all** hold:

1. CONFIRMED `T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP` at `delivery_site_porsanger`.
2. `provider_school` **row_confirmed** (Nordkapp) on the manifest row.
3. `delivery_municipality` **row_confirmed** (Porsanger) on the manifest row.

**No** new CONFIRMED index row — policy upgrade in evidence-link only.

---

## Final statement

Programme claim is **row-satisfied** for Porsanger Nordkapp LOSA delivery; `publication_supporting_evidence` and publication decision remain open.
