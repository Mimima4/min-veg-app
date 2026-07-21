# Phase 0–6 Contour B — Klima Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — PSA relay + bedrift ingest + catalog 2026-07-21 |
| **Date (UTC)** | 2026-07-21 |
| **Profession slug** | `klima` (catalog: Ventilasjons- og blikkenslager) |
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
| VG1 | `klima-vg1-bygg-{countySlug}` |
| VG2 | `klima-vg2-klima-{countySlug}` |

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
| P-6 / P-7 / P-8 | Primary empty where VG2=0; no north sparse overlay for klima |

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffolding | ☑ `66cb987` |
| Catalog seed prod | ☑ |
| Full Contour B relay | ☑ 2026-07-21 |
| Lærebedrift ingest (3 fag) | ☑ Finnlærebedrift API |
| Monthly cron | ☑ primary in batch 0; siblings batch 7 via roster |
| Prod UI / Block C E2E | ☐ owner browser spot-check (Vestland `46` recommended) |
