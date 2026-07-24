# Phase 0–6 Contour B — Snekker Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **LIVE (rename closed)** — catalog **Snekker**; school VG2 Treteknikk; profession-local relay + Vilbli↔Min Veg MATCH; owner UI + Arbeidsplassen OK in prod (2026-07-23). Contour B NAV-title rename program **CLOSED** with Maskin- og kranfører + Platearbeider og sveiser. |
| **Date (UTC)** | 2026-07-23 |
| **Profession slug** | `snekker` (catalog: **Snekker**) |
| **Parent gate** | `phase-0-6-contour-b-vgs-profession-addition-template.md` |
| **Prior slug** | `treteknikk` (school VG2 name only — not a catalog profession) |

---

## Product layers (do not collapse)

| Layer | Value | Notes |
|-------|--------|--------|
| **Catalog profession** | **Snekker** (`snekker`) | Distinct from **Tømrer** (`carpenter`) — two professions |
| **Vilbli school VG2** | Treteknikk (`V.BATRT2----`) | Programme name at school — not the job title |
| **Primary fagbrev** | Snekkerfaget (`BASNE3` / `SNEKKERFAGET`) | + Industrisnekker, Trelast on kolonne-3 |
| **NAV vacancy leaf** | `håndverkere.tømrer-og-snekker` | NAV merges Tømrer+Snekker; Min Veg keeps two catalogue professions with different `navTitle` |

---

## Signed Vilbli contour (`V.BA` — Treteknikk school chain → Snekker catalog)

| Step | Vilbli label | Course tokens |
|------|----------------|---------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Treteknikk | `V.BATRT2----` |

**Kolonne-3 / bedrift** (Påbygging excluded):

| VIGO | Label | Lærefag code | Ingest |
|------|--------|--------------|--------|
| `BASNE3` | Snekkerfaget (**primary**) | `SNEKKERFAGET` | Batch 0 |
| `TPISN3` | Industrisnekkerfaget | `INDUSTRISNEKKERFAGET` | Batch 7 |
| `BATLT3` | Trelast- og limtreproduksjonsfaget | `TRELAST_OG_LIMTREPRODUKSJONSFAGET` | Batch 7 |

**Product policy:**

| Show | Do not show |
|------|-------------|
| Treteknikk school chain only (`BATRT2`) | Other VG2 columns as this profession |
| Kolonne-3 / bedrift from **this** chain | National master list of all `V.BA` branches |
| Catalog title **Snekker** | Catalog title Treteknikk; parentheses like «Snekker (Treteknikk)» |
| | Mixing with **Tømrer** (`carpenter` / `BATMF2`) |

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart | https://www.vilbli.no/nb/no/strukturkart/V.BA/treteknikk-fag-og-timefordeling?kurs=V.BABAT1----_V.BATRT2----&side=p2 |
| **Pipeline ingest** (per fylke) | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BATRT2----&side=p5` |

---

## Materialization slugs (VG1/VG2 per fylke)

| Node | Slug pattern | Title |
|------|----------------|-------|
| VG1 | `snekker-vg1-bygg-{countySlug}` | VG1 Bygg- og anleggsteknikk |
| VG2 | `snekker-vg2-treteknikk-{countySlug}` | VG2 Treteknikk |

Trøndelag (`50`): `snekker-vg1-bygg-trondelag`, `snekker-vg2-treteknikk-trondelag`.

Path family slug: `snekker-vba-treteknikk`.

---

## Lærebedrift ingest

| Field | Value |
|-------|--------|
| Primary `larefag_code` | `SNEKKERFAGET` |
| VIGO api query | `BASNE3` |
| Roster | `data/larebedrift/kolonne3-rosters/snekker.json` |
| Cron batch | Primary batch 0; siblings batch 7 |

---

## Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-1 | Vilbli contour | **OK — Bygg → Treteknikk** (`BATRT2`) |
| P-2 | VG3/bedrift list | **OK — kolonne-3 for Bygg→Treteknikk chain** |
| P-3 | NAV matcher | **OK —** `håndverkere.tømrer-og-snekker`, navTitle **Snekker** (carpenter uses same leaf, navTitle **Tømrer**) |
| P-4 | V.BA VG2 switch | **OK — sibling with carpenter/plumber/…** |
| P-5 | Empty bedrift | **OK — godkjent-only truth** |
| Catalog name | **Snekker** (not Treteknikk) | Owner 2026-07-23 |

---

## Rename cutover notes

1. Code + seed: slug `snekker`, titles Snekker.
2. SQL: `scripts/sql/rename-profession-treteknikk-to-snekker.sql` (prod).
3. Rebuild scheduler bundle (`npm run build`).
4. Profession-local dry-run / relay if programme slugs changed and PSA must reattach.
5. Deactivate leftover `treteknikk` catalog row.

Prior Treteknikk-named docs/seeds are superseded by this record.

---

## Profession-local relay closure (2026-07-23)

| Step | Result |
|------|--------|
| Dry-run `--profession snekker` | **5** `dry_run_ok`: `11,31,33,39,42`; **10** `failed` Missing VG2 (no local Treteknikk schools — expected) |
| Production `--profession snekker` | Same 5 **`ingested`** `contour_b_partial` |
| Vilbli ↔ Min Veg (local VG2) | All 5 **MATCH** (Rogaland 2, Østfold 2, Buskerud 1, Vestfold 1, Agder 1) |
| Empty counties + continuations | Sample `{03,15,18,32,34,40,46,50,55,56}`: local PSA empty + continuation counts **MATCH** Vilbli out-of-county pins |

**National Treteknikk VG2 school set (Vilbli):** Agder, Buskerud, Rogaland (2), Vestfold, Østfold (2) — 7 schools total. Other pipeline fylke correctly have no home PSA and rely on home-page continuations.

**Next full Contour B matrix:** launchd `no.minveg.vgs-scheduled-ops` — **1 August 2026** @ 03:00 (home IP).
