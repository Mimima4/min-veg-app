# Phase 0–6 Contour B — Anleggsteknikk Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **SCAFFOLDING** — code landed 2026-07-10; relay/E2E pending |
| **Date (UTC)** | 2026-07-10 |
| **Profession slug** | `anleggsteknikk` (catalog: Anleggsmaskinfører — **owner sign P-1**) |
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

Catalog profession: **Anleggsmaskinfører** (NAV level — confirm in P-3). Route truth is **programme-path-scoped**.

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

## Materialization slugs (proposed)

| Node | Slug pattern | Title |
|------|----------------|-------|
| VG1 | `anleggsteknikk-vg1-bygg-{countySlug}` | VG1 Bygg- og anleggsteknikk |
| VG2 | `anleggsteknikk-vg2-anleggsteknikk-{countySlug}` | VG2 Anleggsteknikfaget |

Trøndelag (`50`): `anleggsteknikk-vg1-bygg-trondelag`, `anleggsteknikk-vg2-anleggsteknikk-trondelag`.

VG3/bedrift: `anleggsteknikk-vg3-{title}-{countySlug}` pattern.

---

## Lærebedrift ingest (owner P-5 — signed 2026-07-10)

| Field | Value |
|-------|--------|
| Primary `larefag_code` | **`ANLEGGSMASKINFORERFAGET`** (profession default for `anleggsteknikk`) |
| VIGO api query | **`BAAMF3`** (from chain `…_V.BAANL2----_V.BAAMF3----`; **not** `BAANL3` in `kurs` URL) |
| Sibling kolonne-3 | `VEG_OG_ANLEGGSFAGET` / `BAANL3` mapped for Fagvalg branches; not in cron batch 0 yet |
| Cron batch | **0** with tømrer + rørlegger + maler kolonne-3 (`scheduled-larebedrift-ingest-fags.ts`) |
| Pilot gate | `primary-route-larebedrift-pilot.ts` — nationwide when child has home kommune |

---

## Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-1 | Vilbli contour | **Signed — Bygg → Anleggsteknikfaget** (`BAANL2`) |
| P-2 | Pilot fylke | **N/A** — nationwide batch (not pilot-first) |
| P-3 | NAV matcher | **Scaffolded** — `håndverkere.anleggsmaskinør` (confirm on classify) |
| P-4 | V.BA VG2 switch | **Signed — extend** existing V.BA gate |
| P-5 | Bedrift kolonne-3 | **Signed — `BAAMF3` → `ANLEGGSMASKINFORERFAGET`**; nationwide ingest + prod UI pending |
| P-6 | Northern VG2=0 | **Scout: no signal** for anleggsteknikk north (unlike painter); Oslo `03` VG2=0 ABORT |
| P-7 | (n/a) | Anleggsteknikk has local VG2 in `55`/`56`; no north cross-fylke overlay |
| P-8 | Alternatives-only UX | When primary empty but curated alternatives exist (painter P-7), **show alternatives** — do not hide viable paths behind empty primary only |

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
| Owner sign P-1…P-6 | ☑ P-1/P-2/P-4/P-5; P-3 scaffolded; P-6 signed |
| Code scaffolding | ☑ |
| Classify green counties | ☐ |
| Relay dry-run + production | ☑ **15-county batch** 2026-07-10 (`run-contour-b-operational-ingest`); Oslo `03` ABORT VG2=0 |
| E2E + prod UI | ☐ |
