# Phase 4 LOSA — Planning Closed Safe Summary

| Field | Value |
|--------|--------|
| **Document type** | Repo-safe summary — **P4-LOSA-PLANNING-CLOSED** |
| **Section** | **P4-LOSA-PLANNING-CLOSED-post** |
| **Status code** | `P4_LOSA_PLANNING_CLOSED_SCHEMA_APPLIED_TAIL_OPEN` |
| **Date (UTC)** | 2026-06-05 (planning); schema main apply **2026-05-29** |
| **Reference county** | `56` (Finnmark) — **not** a production exception rule |
| **Head commit (reference)** | `1f2f443` (pre-apply); apply record in `phase-4-losa-psa-schema-main-apply-checklist.md` |

**Forbidden in this summary:** secrets, owner-held JSON, snippet text, per-school PII.

---

## This document is

- Formal **planning / scaffold closure** for Phase 4 LOSA (manifest → Route plan).
- **Operational tail** partially complete: **DB migration apply done**; §4 row closure, PSA write session, **#3** wiring remain open.

## This document is not

- LOSA rows published in PSA or shown in Route/UI.
- `NOT_READY_FOR_APPLY` clearance.
- Permission to treat Finnmark as special-case production rules.

---

## 1. Gate closure matrix (planning)

| Gate | Status | CLI proof |
|------|--------|-----------|
| **P4-LOSA-IMPL** | **CLOSED** | `npm run losa:finnmark-manifest` |
| **P4-LOSA-EVIDENCE-LINK** | **CLOSED** | `npm run losa:finnmark-evidence-link` |
| **P4-LOSA-PUBLICATION-MODEL** | **CLOSED** | `npm run losa:finnmark-publication-plan` |
| **P4-LOSA-PSA** (schema) | **CLOSED** (repo + **main applied**) | `npm run losa:validate-psa-schema` |
| **P4-LOSA-PSA-WRITE** (framework) | **CLOSED** | `npm run losa:preview-psa-write` → **0** candidates |
| **P4-LOSA-ROUTE** (plan) | **CLOSED** | `npm run losa:plan-route-consumption` → **0** eligible |
| **Kommune resolve** (ref) | **CLOSED** | `npm run losa:resolve-municipality-codes` → **18/18** |

---

## 2. Current product posture

| Metric | Value |
|--------|--------|
| LOSA manifest rows (Finnmark ref) | **18** |
| Row §4 satisfied | **1** (Alta pilot) |
| PSA LOSA writes | **1** (Alta / `5601` / VG1) |
| Route LOSA options | **1** eligible (Alta pilot; #3 wired) |
| Contour B ordinary Finnmark schools | **6** (unchanged) |
| P06 operational | **CLOSED (partial D)** |

---

## 3. Nationwide applicability

- `losa_fjern_delivery_municipality` scope and pipeline rules apply to **any** county/profession with LOSA-shaped Vilbli rows.
- Finnmark `56` / `electrician` is **reference proof** for CLI only.
- Kommune reference table is **fylke 56** data — other counties require their own reference module at ops time.

---

## 4. Operational tail (ordered)

| # | Step | Gate / action |
|---|------|----------------|
| 1 | Apply `20260605120000_programme_school_availability_losa_scope.sql` (+ co-applied `name_i18n`) | **DONE** — `phase-4-losa-psa-schema-main-apply-checklist.md` |
| 2 | Close §4 on ≥1 row (evidence + publication decision) | **DONE** — Alta `ROW_SECTION_4_SATISFIED` + publication decision (`P4-LOSA-ALTA-PUBLICATION-DECISION-post`) |
| 3 | Owner-held **P4-LOSA-PSA-WRITE** charter → bounded insert | **DONE** — `phase-4-losa-psa-write-pilot-execution-review-summary.md` |
| 4 | Permission **#3** → wire `get-availability-truth` + scope filter | **P4-LOSA-ROUTE-WIRING** (**DONE** — Alta pilot) |

---

## 5. Non-return rules

- Do **not** publish LOSA as ordinary `programme_in_school` rows.
- Do **not** use Contour B `pickInstitutionsForPsaEmission` for `isLosa` Vilbli rows.
- Do **not** add Finnmark-only Route/PSA hacks — extend reference tables and gates instead.

---

## Final statement

Phase 4 LOSA **planning chain is closed** in repo. **1** Alta pilot PSA row with bounded Route **#3** wiring; remaining **17** LOSA municipalities and `NOT_READY_FOR_APPLY` remain **blocked**.
