# Phase 0–6 Contour A — Mechanic Vestland Pilot E2E Owner Verify Checklist

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — owner browser verify via V-7 **2026-06-10** |
| **Date (UTC)** | 2026-06-10 |
| **Pair** | `mechanic` / **Vestland** (`46`) |
| **Contour** | **A** (green fylke — `run-vgs-truth-pipeline`, not Contour B relay) |
| **Prerequisite** | Dry-run `verification_ready_after_write` or documented blockers |

---

## Owner decisions (signed)

| # | Decision | Status |
|---|----------|--------|
| P-2 | Pilot fylke = **Vestland** (`46`) | **OK** 2026-06-10 |
| P-3 | Rollout = **pilot first**, then batch **15** fylke | **OK** 2026-06-10 |

---

## Automated proof (fill on run)

| Check | Result |
|-------|--------|
| `classify-vgs-truth-readiness.mjs --profession mechanic --county 46` (pre-write) | `missing_profession_links`; Vilbli **28 VG1 / 11 VG2**; **0** unmatched |
| `run-vgs-truth-pipeline.mjs --dry-run` (greenfield) | **Expected abort** — `missing_profession_links` until first write |
| Production write `run-vgs-truth-pipeline.mjs --profession mechanic --county 46` | **OK** — `verification_ready_after_write`; **67** PSA rows |
| Post-write classify | `verification_ready_after_write` |
| PSA by stage (main DB) | **VG1 28** / **VG2 11** (duplicate `mechanic-vg1-teknologi-og-industrifag-vestland` removed 2026-06-10) |
| VG3/bedrift programme links (kolonne 3) | **10** (`mechanic-vg3-*-vestland`) |
| `npm run smoke:contour-b` | **PASS** 2026-06-10 |
| **Deploy** (`SUPPORTED_VGS_PROFESSION_SLUGS` + path-variants) | ☑ main `d10c8ec`+ |

**Note:** Contour B relay returns `use_contour_a` for Vestland — use truth pipeline for ingest.

---

## Owner browser checklist (Vestland / mechanic)

Setup: child with **home fylke Vestland** → mechanic route → **VG1 programme_selection** step.

- [x] Route loads without error
- [x] VG1 school count matches Vilbli strukturkart for Vestland (`v.tp` / Teknologi- og industrifag)
- [x] **No** LOSA badge (Vestland mechanic pilot — standard VGS only)
- [x] Sample schools visible (e.g. Bergen-area or rural Vestland VGS)
- [x] Card shows school name + municipality line
- [x] Select school → save route → reload → selection persists
- [x] VG2 step shows Vestland schools (Kjøretøy branch)
- [x] Route shows **Opplæring i bedrift** step after VG2 (or VG3 branch variant)
- [x] **VG3** lists **kolonne-3 continuations** from Kjøretøy chain in Vestland (≈10 bedrift fag; **not** Påbygging; **not** other VG2 columns)
- [x] Opplæring i bedrift / yrker scoped to selected specialization (or chain-default yrker)

**Sign-off:** owner confirmed via `phase-4-nav-matcher-v7-mechanic-vestland-owner-verify-checklist.md` **2026-06-10**; expansion record **CLOSED** **2026-06-13**.
