# Phase 0–6 Contour B — Klima Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **LIVE (rename closed)** — catalog `platearbeider-og-sveiser` / **Platearbeider og sveiser**; school VG2 KEM unchanged; profession-local relay + Vilbli↔Min Veg map 1:1 **PASS** (2026-07-23); owner UI OK in prod (2026-07-23) |
| **Date (UTC)** | 2026-07-21 (branch live); catalog rename + relay 2026-07-23 |
| **Profession slug** | `platearbeider-og-sveiser` (catalog: **Platearbeider og sveiser**) |
| **Prior slug** | `klima` (deactivated; school VG2 Klima/energi/miljø / BAKEM2 unchanged) |
| **Parent gate** | `phase-0-6-contour-b-vgs-profession-addition-template.md`; `phase-0-6-contour-b-seventh-profession-expansion-owner-record.md` |
| **Commits** | `66cb987` (scaffold); closure ops same day |

---

## Signed Vilbli contour (`V.BA` — Klima, energi og miljøteknikk)

| Step | Vilbli label | Course tokens |
|------|----------------|---------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Klima, energi og miljøteknikk | `V.BAKEM2----` |

**Kolonne-3 / bedrift:**

| VIGO | Label | Ingest (2026-07-21) |
|------|--------|---------------------|
| `BAVBL3` | Ventilasjons- og blikkenslagerfaget (**primary**) | upserted **258** |
| `BAISL3` | Isolatørfaget | upserted **11** |
| `BATAK3` | Tak- og membrantekkerfaget | upserted **72** |

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart | https://www.vilbli.no/nb/no/strukturkart/V.BA/klima-energi-og-miljoteknikk-fag-og-timefordeling?kurs=V.BABAT1----_V.BAKEM2----&side=p2 |
| **Pipeline ingest** | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAKEM2----&side=p5` |

---

## Materialization / PSA (relay 2026-07-21)

| Node | Slug pattern |
|------|----------------|
| VG1 | `platearbeider-og-sveiser-vg1-bygg-{countySlug}` |
| VG2 | `platearbeider-og-sveiser-vg2-klima-{countySlug}` |

Path family slug: `platearbeider-og-sveiser-vba-klima-energi`.

Full-matrix relay: **105** pairs — klima **10 ingested**, **5 ABORT** (Vilbli VG2=0: `15,18,32,40,56`). Active PSA **120** rows across 10 fylke with VG1+VG2. `profession_program_links` **20**.

ABORT counties → no primary route (county-local policy); not a defect.

---

## Owner decisions

| # | Status |
|---|--------|
| P-1 Vilbli contour | **OK — Bygg → KEM** (`BAKEM2`) |
| P-2 kolonne-3 | **OK — 3 fag** |
| P-3 NAV | **OK —** `håndverkere.platearbeider-og-sveiser` |
| P-4 V.BA VG2 switch | **OK** |
| P-5 empty bedrift | **OK — godkjent-only** |
| P-6 / P-7 / P-8 | P-6 auto empty primary (VG2=0); **P-7 north nabofylke auto** for Contour B (home `{18,55,56}`, e.g. Finnmark/Nordland VG1 + Troms/Trøndelag VG2); **P-8 not chartered** for klima |

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffolding | ☑ `66cb987` |
| Catalog seed prod | ☑ |
| Full Contour B relay | ☑ 2026-07-21; **profession-local after rename** `--profession platearbeider-og-sveiser` 2026-07-23 |
| Lærebedrift ingest (3 fag) | ☑ Finnlærebedrift API |
| Monthly cron | ☑ primary in batch 0; siblings batch 7 via roster |
| Prod UI / Block C E2E | ☑ owner verified P-7 nabofylke on Finnmark (dev) 2026-07-21; **rename UI OK in prod** 2026-07-23 |
| Vilbli ↔ Min Veg (map pins) | ☑ **1:1 PASS** all pipeline fylke after rename relay 2026-07-23 |
| Catalog rename program | ☑ **CLOSED** with Snekker + Maskin- og kranfører — Contour B NAV-title renames done 2026-07-23 |

**Next full Contour B matrix:** launchd `no.minveg.vgs-scheduled-ops` — **1 August 2026** @ 03:00 (home IP).
