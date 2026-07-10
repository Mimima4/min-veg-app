# Phase 0–6 Contour B — Sixth Profession Expansion Owner Record

| Field | Value |
|-------|--------|
| **Status** | **SCAFFOLDING** — owner agreed 2026-07-10; code landed; relay pending |
| **Date (UTC)** | 2026-07-10 |
| **Prerequisite** | Five professions closed in pipeline (`electrician`, `mechanic`, `carpenter`, `plumber`, `painter`); template `phase-0-6-contour-b-vgs-profession-addition-template.md` |
| **Profession slug (proposed)** | `anleggsteknikk` (catalog: **Anleggsmaskinfører** / Anleggsteknikk — owner sign P-1) |

---

## 1. Goal

Add **`anleggsteknikk`** as the sixth VGS catalogue profession on the **V.BA** Bygg chain — same expansion pattern as `painter`, reusing VG1 shared infrastructure and VG2 cross-profession switch.

**Parallel (not blocking code):** `canonical_matching_review` batch hygiene across all professions — `phase-4-canonical-matching-review-batch-owner-record.md`.

---

## 2. Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-1 | Profession slug + catalog label | **Proposed — `anleggsteknikk`** · NAV catalog level TBD (scout P-3) |
| P-2 | Pilot fylke | **Proposed — Vestland (`46`)** (green truth path, kommune transport proven) |
| P-3 | Rollout | **Proposed — pilot first, then 15-county batch** (template §7) |
| P-4 | Vilbli contour | **Proposed — Bygg → Anleggsteknikfaget only** (`BAANL2`), not full `V.BA` VG2 menu |
| P-5 | V.BA VG2 switch | **Extend** existing gate (`carpenter` / `plumber` / `painter` + `anleggsteknikk`) |
| P-6 | Overlays (LOSA / Steigen / P-7) | **None expected** unless scout finds gap |

---

## 3. Vilbli scout (read-only HTML probe, 2026-07-10)

County pipeline URL pattern (signed 2026-07-10):

`.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAANL2----&side=p5`

**Note:** `BAANL3` in `kurs` breaks Vilbli map extract (~80k stub HTML, no `vb_map_data`). Kolonne-3 is discovered from the VG1→VG2 chain page, not via `kurs` token.

| Fylke | HTML ~size | `BAANL2` markers | Notes |
|-------|------------|------------------|-------|
| `03` Oslo | ~79k | present | |
| `46` Vestland | ~80k | present | **pilot candidate** |
| `50` Trøndelag | ~80k | present | |
| `18` Nordland | ~79k | present | |
| `15` Møre og Romsdal | ~101k | present | |
| `55` Troms | ~79k | present | |
| `56` Finnmark | ~79k | present | |

**Preliminary conclusion:** unlike `painter` Overflateteknikk, **no early signal of VG2=0** in northern counties on this probe. Full `classify-vgs-truth-readiness` after path definition + materialization slugs.

**Signed tokens (Vilbli strukturkart reference):**

| Step | Token |
|------|--------|
| VG1 | `V.BABAT1----` |
| VG2 | `V.BAANL2----` |
| Kolonne-3 (proposed) | `V.BAANL3----` (verify on pilot extract) |

National strukturkart: https://www.vilbli.no/nb/no/strukturkart/V.BA/anleggsteknikk-fag-og-timefordeling?kurs=V.BABAT1----_V.BAANL2----&side=p2

---

## 4. Expansion gate checklist

| Step | Status | Proof |
|------|--------|-------|
| 1 | ☑ | Branch owner record — `phase-0-6-contour-b-anleggsteknikk-vilbli-branch-owner-record.md` |
| 2 | ☑ | `vgs-path-definitions.mjs` + materialization planner |
| 3 | ☑ | `SUPPORTED_VGS_PROFESSION_SLUGS` (TS + scripts) |
| 4 | ☑ | `scripts/sql/seed-profession-anleggsteknikk-catalog.sql` — applied prod DB 2026-07-10 (`id=12498f7f-0777-4e17-9ff4-db088559c9f5`) |
| 5 | ☑ | NAV map row + `path-family-slug` |
| 6 | ☑ (partial) | V.BA VG2 switch ☑; `primary-route-larebedrift-pilot` + bedrift roster **deferred** (P-5) |
| 7 | ☐ | Build + deploy |
| 8 | ☑ (local) | Relay dry-run Vestland `46` — local `dry_run_ok`, VG1=18 VG2=4, `wouldWrite=44`; prod API pending deploy |
| 9 | ☐ | Pilot production ingest (home IP) |
| 10 | ☐ | E2E Block C + prod sign-off |

---

## 5. References

- `phase-0-6-contour-b-vgs-profession-addition-template.md`
- `phase-0-6-contour-b-painter-vilbli-branch-owner-record.md` (reference instance)
- `phase-4-canonical-matching-review-batch-owner-record.md` (parallel)
