# Phase 4 LOSA — Sør-Varanger Programme Full Row Closure Gate (Sub-gate 2)

| Field | Value |
|--------|--------|
| **Status** | Owner **programme full row closure** adopted for Sør-Varanger row **3** |
| **Section** | **P4-LOSA-SOR-VARANGER-PROGRAMME-FULL** |
| **Closure label** | `PHASE_4_LOSA_SOR_VARANGER_PROGRAMME_FULL_ROW_CLOSURE_ADOPTED` |
| **Date (UTC)** | 2026-05-29 |
| **Prerequisite** | **P4-LOSA-CONFIRMED-SOR-VARANGER-PROGRAMME-post** |

---

## Closure rule (binding)

`programme_stage_availability` for **Sør-Varanger** upgrades to **`row_confirmed`** with `publishable: true` when **all** hold:

1. CONFIRMED `T2_SCHOOL_NORDKAPP_VGS_PROGRAM_DEEP` at `delivery_site_sor_varanger`.
2. `provider_school` **row_confirmed** (Nordkapp) on the manifest row.
3. `delivery_municipality` **row_confirmed** (Sør-Varanger) on the manifest row.

**No** new CONFIRMED index row — policy upgrade in evidence-link only.

---

## Final statement

Programme claim is **row-satisfied** for Sør-Varanger Nordkapp LOSA delivery; `publication_supporting_evidence` and publication decision remain open.
