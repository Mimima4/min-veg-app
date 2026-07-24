# Phase 0–6 Contour B — Anleggsteknikk Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **LIVE (rename closed)** — catalog `maskin-og-kranforer` / **Maskin- og kranfører**; school VG2 Anleggsteknikk unchanged; profession-local relay + Vilbli↔Min Veg map 1:1 **PASS** (2026-07-23); owner UI + P-8 OK in prod (2026-07-23) |
| **Date (UTC)** | 2026-07-10 (branch live); catalog rename + relay 2026-07-23 |
| **Profession slug** | `maskin-og-kranforer` (catalog: **Maskin- og kranfører**) |
| **Prior slug** | `anleggsteknikk` (deactivated; school VG2 name Anleggsteknikk / BAANL2 unchanged) |
| **Parent gate** | `phase-0-6-contour-b-sixth-profession-expansion-owner-record.md` |

---

## Signed Vilbli contour (`V.BA` — Anleggsteknikfaget chain)

**Core school path (materialized per fylke):**

| Step | Vilbli label | Course tokens (reference) |
|------|----------------|---------------------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Anleggsteknikfaget | `V.BAANL2----` |

**VG3 / Opplæring i bedrift (UI — kolonne 3 from *this* chain in *this* fylke):**

Show kolonne-3 / bedrift continuations Vilbli lists on the county `bygg-og-anleggsteknikk-skoler-og-laerebedrifter` page for kurs `V.BABAT1----_V.BAANL2----_V.BAANL3----` (e.g. Veg- og anleggsfaget, Anleggsmaskinførerfaget, sibling specializations where listed).

**Product policy (proposed — mirror plumber/painter):**

| Show | Do not show |
|------|-------------|
| Anleggsteknikfaget chain only (`BAANL2`) | Other VG2 columns (Tømrer, Rørlegger, Overflateteknikk, …) as separate product professions |
| Kolonne-3 / bedrift from **this** chain | National master list of all `V.BA` branches |
| | **Påbygging til generell studiekompetanse** |

Catalog profession: **Maskin- og kranfører** (`maskin-og-kranforer`). School VG2 remains **Anleggsteknikk**. Route truth is **programme-path-scoped**.

**V.BA shared VG1:** extends existing switch with `carpenter` / `plumber` / `painter` — separate `profession_slug`, separate path truth.

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart (anleggsteknikk) | https://www.vilbli.no/nb/no/strukturkart/V.BA/anleggsteknikk-fag-og-timefordeling?kurs=V.BABAT1----_V.BAANL2----&side=p2 |
| **Pipeline ingest** (per fylke) | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAANL2----&side=p5` (kolonne-3 from chain page — **do not** put `BAANL3` in `kurs`; breaks Vilbli map extract) |
| Program overview | https://www.vilbli.no/nb/no/om/v.ba/bygg-og-anleggsteknikk |
| Læreplan VG2 | https://www.vilbli.no/nb/no/lareplan/v.anl02-03/laereplan-i-vg2-anleggsteknikk?utdanningsprogram=v.ba |

---

## Materialization slugs

| Node | Slug pattern | Title |
|------|----------------|-------|
| VG1 | `maskin-og-kranforer-vg1-bygg-{countySlug}` | VG1 Bygg- og anleggsteknikk |
| VG2 | `maskin-og-kranforer-vg2-anleggsteknikk-{countySlug}` | VG2 Anleggsteknikfaget |

Trøndelag (`50`): `maskin-og-kranforer-vg1-bygg-trondelag`, `maskin-og-kranforer-vg2-anleggsteknikk-trondelag`.

VG3/bedrift: `maskin-og-kranforer-vg3-{title}-{countySlug}` pattern.

Path family slug: `maskin-og-kranforer-vba-anleggsteknikk`.

---

## Lærebedrift ingest (owner P-5 — signed 2026-07-10)

| Field | Value |
|-------|--------|
| Primary `larefag_code` | **`ANLEGGSMASKINFORERFAGET`** (profession default for `maskin-og-kranforer`) |
| Kolonne-3 roster | **`data/larebedrift/kolonne3-rosters/maskin-og-kranforer.json`** — 9 fag, URL-first VIGO match |
| VIGO codes (reference) | `BAAMF3`, `BAARL3`, `BAASF3`, `BABAN3`, `BABRO3`, `BAFJE3`, `BAFUN3`, `BAVOA3`, `BAVOV3` |
| Cron batch | **0** (`BAAMF3` primary) + **7** (8 siblings) |
| Pilot gate | `primary-route-larebedrift-pilot.ts` — nationwide when child has home kommune |

---

## Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-1 | Vilbli contour | **Signed — Bygg → Anleggsteknikfaget** (`BAANL2`) |
| P-2 | Pilot fylke | **N/A** — nationwide batch (not pilot-first) |
| P-3 | NAV matcher | **OK — catalog level** `bygg-og-anlegg.maskin--og-kranfører` (Maskin- og kranfører); STYRK corrected 2026-07-21 (was non-existent `håndverkere.anleggsmaskinør`) |
| P-4 | V.BA VG2 switch | **Signed — extend** existing V.BA gate |
| P-5 | Bedrift kolonne-3 | **Closed** — roster 9 fag, ingest 2140 rows, prod UI OK 2026-07-12 |
| P-6 | Northern VG2=0 | **Scout: no signal** for anleggsteknikk north (unlike painter); Oslo `03` VG2=0 ABORT |
| P-7 | (n/a) | Anleggsteknikk has local VG2 in `55`/`56`; no north cross-fylke overlay |
| P-8 | Sparse national VG2 + relocation | **CLOSED 2026-07-20** — `phase-0-6-contour-b-anleggsteknikk-p8-sparse-vg2-relocation-owner-record.md`; `relocation_willingness` for VGS schools **anleggsteknikk only**; north zone primary `{55,56}+18`; national VG2 → alternative; maybe-reach Entur PT + north-coast air |
| P-8b | Alternatives-only UX | When primary empty but curated alternatives exist (painter P-7), **show alternatives** — do not hide viable paths behind empty primary only |

---

## Scout matrix (HTML probe 2026-07-10)

See parent `phase-0-6-contour-b-sixth-profession-expansion-owner-record.md` §3.

**Pilot extract (Vestland `46`, signed URL):**

| Metric | Value |
|--------|--------|
| HTML size | ~103k |
| `vb_map_data` | yes |
| VG1 schools | 18 |
| VG2 schools | 4 |
| LOSA / needs-review | 0 |
| Classify (pre-materialization) | `missing_profession_links` (expected) |
| Local relay dry-run | `dry_run_ok`, `wouldWrite=44` |

**URL pitfall:** `kurs=…_V.BAANL3----` → ~80k stub, empty extract — do **not** use in `buildVilbliUrl`.

---

## Closure checklist

| Step | Status |
|------|--------|
| Owner sign P-1…P-6 | ☑ P-1/P-2/P-3/P-4/P-5; P-6 signed |
| Code scaffolding | ☑ |
| Classify green counties | ☐ N/A for Contour B partial — Contour A green counties skip anlegg relay |
| Relay dry-run + production | ☑ **15-county batch** 2026-07-10; **full-matrix production relay 2026-07-21**; **profession-local after rename** `--profession maskin-og-kranforer` 2026-07-23 (Vestland Førde correctly inactive — not on Vilbli map / national offering) |
| E2E + prod UI | ☑ `phase-0-6-contour-b-anleggsteknikk-prod-e2e-closure.md` — owner 2026-07-12; **rename UI + P-8 OK in prod** 2026-07-23 |
| P-8 sparse + relocation | ☑ **CLOSED** 2026-07-20 — owner UI + smokes; **re-confirmed after rename** 2026-07-23 |
| Vilbli ↔ Min Veg (map pins) | ☑ **1:1 PASS** all pipeline fylke after rename relay 2026-07-23 (local map↔PSA + P-7 continuations ∩ dest PSA) |
| Catalog rename program | ☑ **CLOSED** with Snekker + Platearbeider og sveiser — Contour B NAV-title renames done 2026-07-23 |

**Next full Contour B matrix:** launchd `no.minveg.vgs-scheduled-ops` — **1 August 2026** @ 03:00 (home IP).
