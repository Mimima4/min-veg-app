# Phase 0–6 Contour B — Sixth Profession Expansion Owner Record

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — sixth profession live 2026-07-12 |
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
| P-2 | Pilot fylke | **N/A** — nationwide batch ingest (template §7), same as carpenter |
| P-3 | Rollout | **15-county batch** via `run-contour-b-operational-ingest` (2026-07-10) |
| P-4 | Vilbli contour | **Proposed — Bygg → Anleggsteknikfaget only** (`BAANL2`), not full `V.BA` VG2 menu |
| P-5 | V.BA VG2 switch | **Extend** existing gate (`carpenter` / `plumber` / `painter` + `anleggsteknikk`) |
| P-6 | Overlays (LOSA / Steigen / P-7) | **LOSA:** cross-profession by kommune (not anleggsteknikk-specific). **Steigen / P-7:** none expected unless scout finds gap |

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

**Post-ingest classify matrix (2026-07-10):**

| Fylke | Status | PSA | VG1 | VG2 | Notes |
|-------|--------|-----|-----|-----|-------|
| `03` Oslo | `missing_programme_rows` | 0 | 3 | **0** | **ABORT** — no local VG2; primary empty per P-6 policy |
| `11` Rogaland | green | 18 | 13 | 5 | |
| `15` Møre og Romsdal | green | 8 | 6 | 2 | |
| `18` Nordland | green | 8 | 7 | 1 | P-6: VG2 present (unlike painter north) |
| `31` Østfold | green | 11 | 9 | 2 | |
| `32` Akershus | green | 9 | 8 | 1 | |
| `33` Buskerud | green | 9 | 6 | 3 | |
| `34` Innlandet | `canonical_matching_review` | 12 | 12 | 1 | matching-review batch |
| `39` Vestfold | green | 5 | 4 | 1 | |
| `40` Telemark | green | 5 | 4 | 1 | |
| `42` Agder | `canonical_matching_review` | 16 | 15 | 2 | matching-review batch |
| `46` Vestland | green | 22 | 18 | 4 | |
| `50` Trøndelag | green | 25 | 22 | 3 | |
| `55` Troms | green | 5 | 4 | 1 | P-6: VG2 present |
| `56` Finnmark | `canonical_matching_review` | 6 | 23 | 1 | matching-review batch; partial PSA (5 matched) |

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
| 6 | ☑ | V.BA VG2 switch ☑; bedrift kolonne-3 roster + nationwide ingest ☑; prod UI 2026-07-12 |
| 7 | ☑ | Build + deploy (`3b286b1`+) |
| 8 | ☑ | Relay dry-run Vestland `46` prod API 2026-07-10 |
| 9 | ☑ | **15-county batch** `run-contour-b-operational-ingest` 2026-07-10 — **11 green**, **3** `canonical_matching_review`, **Oslo `03` ABORT** (VG2=0) |
| 10 | ☑ | E2E Block C + prod sign-off — `phase-0-6-contour-b-anleggsteknikk-prod-e2e-closure.md` |

---

## 5. References

- `phase-0-6-contour-b-vgs-profession-addition-template.md`
- `phase-0-6-contour-b-painter-vilbli-branch-owner-record.md` (reference instance)
- `phase-4-canonical-matching-review-batch-owner-record.md` (parallel)
