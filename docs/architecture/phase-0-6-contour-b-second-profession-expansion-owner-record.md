# Phase 0–6 Contour B — Second Profession Expansion Owner Record

| Field | Value |
|-------|--------|
| **Status** | **PILOT IN PROGRESS** — Vestland (`46`); materialization + dry-run |
| **Date (UTC)** | 2026-06-10 |
| **Prerequisite** | Electrician **15/15** fylke PSA + Block C E2E **CLOSED** (`phase-0-6-contour-b-block-c-e2e-batch-owner-record.md`) |

---

## 1. Goal

Add **one** new VGS-backed profession to Contour B pipeline + route `availability_truth`, using the same expansion gate as counties (`VGS_OPERATIONAL_RUNNERS.md` § Expansion gate).

**Not in scope without separate gates:** LOSA contour, Phase 2 apply, global `NOT_READY_FOR_APPLY` clearance.

---

## 2. Owner decision required

| # | Question | Status |
|---|----------|--------|
| P-1 | **Which profession slug?** | **OK — `mechanic`** (2026-06-10) |
| P-2 | **Pilot fylke** for first E2E | **OK — Vestland (`46`)** 2026-06-10 |
| P-3 | **Rollout:** pilot fylke first vs all **15** fylke batch relay | **OK — pilot first** 2026-06-10 |

**Signed Vilbli contour:** Teknologi- og industrifag → Kjøretøy → **kolonne-3 next steps for that chain** (per fylke; all sibling specializations in column; not Påbygging). Detail: `phase-0-6-contour-b-mechanic-vilbli-branch-owner-record.md`.

**Pipeline today:** `electrician` operational **15/15**. `mechanic` path + materialization planner signed; **Vestland pilot** via Contour A truth pipeline. TS `SUPPORTED_VGS_PROFESSION_SLUGS` includes `mechanic` for route read path.

---

## 3. Expansion gate checklist (per new profession)

| Step | Artifact |
|------|----------|
| 1 | `scripts/vgs-path-definitions.mjs` — path nodes + `buildVilbliUrl(countySlug)` |
| 2 | `COUNTY_CODE_TO_VILBLI` / `vilbli-county-meta.mjs` (if new county slugs needed) |
| 3–4 | `VGS_PIPELINE_COUNTY_CODES` scripts + TS sync |
| 5 | `CONTOUR_A_OPERATIONAL_BY_PROFESSION` (if Contour A counties apply) |
| 6 | `SUPPORTED_VGS_PROFESSION_SLUGS` in TS |
| 7 | `npm run build` + scheduler bundle |
| 8 | Relay dry-run per `(profession, county)` |
| 9 | Production relay |
| 10 | Owner browser E2E: child fylke → **{profession}** → VG1 options |

---

## 4. Suggested evaluation criteria (owner)

Pick profession with:

- Clear Vilbli **strukturkart** URL pattern (like `v.el` for electrician)
- VG1/VG2 school list extractable per fylke
- Existing or easy `education_programs` + `profession_program_links` materialization path
- Product demand (catalog already has active profession row)

---

## 5. Next session

Owner names **pilot fylke** (P-2) + rollout scope (P-3) → extend materialization planner for `mechanic` → dry-run one county → relay → E2E checklist (fylke **name**, not code).
