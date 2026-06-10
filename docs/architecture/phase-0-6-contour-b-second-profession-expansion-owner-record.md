# Phase 0–6 Contour B — Second Profession Expansion Owner Record

| Field | Value |
|-------|--------|
| **Status** | **PLANNING** — owner profession selection pending |
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
| P-1 | **Which profession slug?** (must exist in `professions` catalog + Vilbli strukturkart) | ☐ |
| P-2 | **Pilot fylke** for first E2E (suggest one green or one B fylke with clean dry-run) | ☐ |
| P-3 | **Rollout:** pilot fylke first vs all **15** fylke batch relay | ☐ |

**Current pipeline:** only `electrician` in `scripts/vgs-path-definitions.mjs` and `SUPPORTED_VGS_PROFESSION_SLUGS`.

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

Owner names **profession slug** + **pilot fylke** → charter path definition draft → dry-run one county → relay → E2E checklist (fylke **name**, not code).
