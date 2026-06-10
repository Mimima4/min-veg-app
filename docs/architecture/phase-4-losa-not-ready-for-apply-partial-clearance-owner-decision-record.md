# Phase 4 LOSA — `NOT_READY_FOR_APPLY` Partial Clearance Owner Decision Record

| Field | Value |
|--------|--------|
| **Section** | **P4-LOSA-NOT-READY-FOR-APPLY-PARTIAL-CLEARANCE** |
| **Status** | **EFFECTIVE** — governance 2026-05-29; operational production route truth 2026-06-10 (R-1…R-4 ☑) |
| **Date (UTC)** | 2026-05-29 |
| **Clearance type** | **PARTIAL** — Finnmark LOSA route truth only |
| **Global `NOT_READY_FOR_APPLY`** | **unchanged** for all other contours |

**Prerequisite commits:** `9b920a7` (18/18 §4 + PSA) · `e84d689` (LOSA route badge)

---

## 1. Owner intake (2026-05-29)

| Parameter | Owner answer |
|-----------|--------------|
| Scope | **County `56` (Finnmark) only** |
| Audience | **Production** (family-facing route truth) |
| Clearance depth | **Partial** — not global apply |
| Regression pack | **`smoke:contour-b` + step 3 browser E2E** (owner sign-off) |

---

## 2. What this partial clearance **allows** (production)

When **effective** (§6 preconditions met + owner sign-off):

| # | Permission |
|---|------------|
| P-1 | Family-facing **route `programme_selection`** may surface **18** Finnmark LOSA options (`losa_fjern_delivery_municipality`) for **electrician** when child/county context is **`56`**. |
| P-2 | Family-facing display per **LOSA UI badge** pattern: provider-only title, delivery kommune line, **LOSA** badge, dropdown `provider · kommune`. |
| P-3 | Family-facing surfacing of **~6** ordinary Contour B Finnmark VGS options (unchanged ordinary path) alongside LOSA options. |
| P-4 | Saved study routes may persist selected Finnmark LOSA option (same save path as ordinary options). |

---

## 3. What remains **forbidden** (global / other contours)

| # | Still blocked |
|---|---------------|
| F-1 | **Global `NOT_READY_FOR_APPLY` clearance** — Phase 2 RLS apply, nationwide product apply, green-county #2 bulk, unchartered PSA bulk. |
| F-2 | LOSA publication for **any county ≠ `56`** or **profession ≠ electrician** without new per-slice gates. |
| F-3 | Treating LOSA rows as **ordinary** `programme_in_school` / Contour B ordinary ingest emit. |
| F-4 | Regional models (Steigen / Troms studiesentre / Innlandet veksling) without separate fit analysis + owner charter — see `phase-4-losa-regional-delivery-models-fit-analysis.md`. |
| F-5 | Phase 2 table writes, RLS policy apply, staging→MAIN promotion beyond existing gates. |
| F-6 | Vilbli-mirror UI panels (P06 §12 non-return). |

---

## 4. Regression preconditions (must pass before **EFFECTIVE**)

| # | Check | Owner sign-off |
|---|-------|----------------|
| R-1 | `npm run smoke:contour-b` — PASS on **production** target env | ☑ 2026-05-29 |
| R-2 | Full LOSA CLI chain (`evidence-link` 18/18, `publication-plan` 18, `preview-psa-write` 18, `plan-route-consumption` 18) | ☑ 2026-05-29 |
| R-3 | Browser E2E per `phase-4-losa-finnmark-route-e2e-owner-verify-checklist.md` | ☑ 2026-06-10 |
| R-4 | Main DB count: **18** LOSA PSA rows `county_code = 56` | ☑ 2026-05-29 |

**Governance effective:** 2026-05-29 (PC-0…PC-5 signed).  
**Operational production truth effective:** **2026-06-10** (R-1…R-4 complete).

---

## 5. Owner decisions (sign-off table)

| ID | Decision | Answer | Owner |
|----|----------|--------|-------|
| PC-0 | Adopt **partial** clearance (not global)? | **Yes** | ☑ |
| PC-1 | Scope locked to **`56` / electrician**? | **Yes** | ☑ |
| PC-2 | Audience **production** family-facing? | **Yes** | ☑ |
| PC-3 | Preconditions R-1…R-4 required before operational effective? | **Yes** | ☑ |
| PC-4 | Global `NOT_READY_FOR_APPLY` stays for non-56 contours? | **Yes** | ☑ |
| PC-5 | No code/deploy change implied by this doc alone? | **Yes** — governance record; runtime already wired | ☑ |

**Owner sign-off:** 2026-05-29 (chat — recommendations adopted)

---

## 6. Posture (signed)

| Metric | Value |
|--------|--------|
| Finnmark LOSA §4 | **18/18** |
| Partial clearance label | `P4_LOSA_FINNMARK_PRODUCTION_ROUTE_TRUTH_PARTIAL` |
| Governance | **EFFECTIVE** (2026-05-29) |
| Production route truth | **EFFECTIVE** (2026-06-10) — R-3 browser E2E signed |
| Global apply | **Still NOT_READY** |
| Phase 2 RLS apply | **Still NOT_READY** (does not block partial charter) |

---

## 7. Related documents

- `phase-4-losa-not-ready-for-apply-next-gate-owner-note.md` — rationale
- `phase-4-losa-finnmark-route-e2e-owner-verify-checklist.md` — R-3
- `phase-4-losa-post-pilot-next-steps-owner-record.md` — step 2 closure
