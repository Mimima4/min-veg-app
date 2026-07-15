# Phase 4 — `canonical_matching_review` batch owner record

| Field | Value |
|-------|--------|
| **Status** | **OPEN** — owner agreed parallel to sixth profession 2026-07-10 |
| **Date (UTC)** | 2026-07-10 |
| **Scope** | Ops hygiene: all `(profession_slug, county_code)` pairs with classify `canonical_matching_review` |
| **Parent** | `phase-0-6-contour-b-vgs-profession-addition-template.md` §5; `norway-school-identity-matching-spec.md` |

---

## 1. Goal

One **matrix pass** across **all five** pipeline professions — not painter-only — to triage NSR identity tails without blocking prod UI where PSA is already ingested.

**Not a defect:** `canonical_matching_review` after `ingested` / `contour_b_partial` means matching confidence limits, not missing Vilbli stages.

---

## 2. Binding rules

| Rule | Meaning |
|------|---------|
| **No pipeline relax** | Do not ABORT→partial write to “fix” review status |
| **UI may work** | `34` / `42` ingested + runtime gate OK is valid |
| **Batch, not one-off** | Export full matrix; close rows with evidence, re-classify |
| **Owner-held evidence** | Slash / multi-avd / CASE 2 fixes documented per row |

---

## 3. Procedure

| Step | Action |
|------|--------|
| 1 | Run `node scripts/classify-vgs-truth-readiness.mjs` (or relay output) for full `SUPPORTED_VGS_PROFESSION_SLUGS × VGS_PIPELINE_COUNTY_CODES` |
| 2 | Filter `status === canonical_matching_review` |
| 3 | Group by county — shared identity issues often hit **all** professions in same fylke |
| 4 | Triage per `norway-school-identity-matching-spec.md` (CASE 2 multi-avd, slash schools, etc.) |
| 5 | Apply matcher fixes if code change needed; otherwise owner sign-off per row |
| 6 | Re-run classify; update this doc §4 matrix |

---

## 4. Known partial counties (baseline 2026-07-10)

Documented across carpenter / painter closure records — **verify on next classify run**:

| County | Typical status | Professions affected | Notes |
|--------|----------------|----------------------|-------|
| `34` Innlandet | **green** (2026-07-15) | All 6 | Brand-cohort matcher; Lillehammer avd Nord; re-ingest `34` — see checkpoint artifact |
| `42` Agder | **green** (2026-07-15) | All 6 | Setesdal Hornnes `multi_avd_identity`; re-ingest `42`; UI sign-off |
| `56` Finnmark | `canonical_matching_review` | Contour B partial | **Deferred:** 18 LOSA unmatched by design (CASE 4); 6 ordinary schools OK; painter `missing_programme_rows` separate |

**Action:** extend table with any additional `(profession, county)` from fresh classify export.

---

## 5. Exit criteria (batch closed)

| # | Criterion |
|---|-----------|
| B-1 | Fresh classify export attached (date + command) | ☑ 2026-07-15 — `fylke34`/`42`/`56` artifacts under `docs/architecture/artifacts/` |
| B-2 | Every `canonical_matching_review` row has owner disposition: **fixed** / **accepted partial** / **deferred with reason** | ☑ `34`/`42` **fixed**; `56` **deferred** (LOSA CASE 4) |
| B-3 | No new profession-specific exceptions without doc row |
| B-4 | `phase-4-multi-contour-truth-registry-owner-decision-record.md` unchanged — this batch does **not** close P4-MCT-1 |

---

## 6. References

- `docs/architecture/norway-school-identity-matching-execution-plan.md`
- `docs/architecture/phase-0-6-contour-b-operational-closure-checklist.md`
- `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` § Interpreting relay results
