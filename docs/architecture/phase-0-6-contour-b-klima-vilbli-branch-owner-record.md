# Phase 0–6 Contour B — Klima Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **SCAFFOLDED** 2026-07-21 — awaiting catalog seed + Contour B relay + prod UI |
| **Date (UTC)** | 2026-07-21 |
| **Profession slug** | `klima` (catalog: Ventilasjons- og blikkenslager) |
| **Parent gate** | `phase-0-6-contour-b-vgs-profession-addition-template.md`; `phase-0-6-contour-b-seventh-profession-expansion-owner-record.md` |

---

## Signed Vilbli contour (`V.BA` — Klima, energi og miljøteknikk)

| Step | Vilbli label | Course tokens |
|------|----------------|---------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Klima, energi og miljøteknikk | `V.BAKEM2----` |

**Kolonne-3 / bedrift (Vestland extract 2026-07-21):**

| VIGO | Label |
|------|--------|
| `BAVBL3` | Ventilasjons- og blikkenslagerfaget (**primary**) |
| `BAISL3` | Isolatørfaget |
| `BATAK3` | Tak- og membrantekkerfaget |

| Show | Do not show |
|------|-------------|
| KEM chain only (`BAKEM2`) | Other VG2 columns as this profession |
| Kolonne-3 from **this** chain | National master list of all `V.BA` |
| | **Påbygging** |

**V.BA shared VG1:** `klima` shares VG1 Bygg with carpenter / plumber / painter / anleggsteknikk. Separate `profession_slug`; VG2 programme switch wired.

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart | https://www.vilbli.no/nb/no/strukturkart/V.BA/klima-energi-og-miljoteknikk-fag-og-timefordeling?kurs=V.BABAT1----_V.BAKEM2----&side=p2 |
| **Pipeline ingest** (per fylke) | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAKEM2----&side=p5` |

---

## Materialization slugs

| Node | Slug pattern | Title |
|------|----------------|-------|
| VG1 | `klima-vg1-bygg-{countySlug}` | VG1 Bygg- og anleggsteknikk |
| VG2 | `klima-vg2-klima-{countySlug}` | VG2 Klima, energi og miljøteknikk |

Trøndelag (`50`): `klima-vg1-bygg-trondelag`, `klima-vg2-klima-trondelag`.

---

## Lærebedrift

| Field | Value |
|-------|--------|
| Primary `larefag_code` | `VENTILASJONS_OG_BLIKKENSLAGERFAGET` |
| VIGO | `BAVBL3` |
| Roster | `data/larebedrift/kolonne3-rosters/klima.json` (ingestBatch **7**, primary fag batch **0**) |

---

## Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-1 | Vilbli contour | **OK — Bygg → KEM** (`BAKEM2`) |
| P-2 | VG3/bedrift list | **OK — kolonne-3 for Bygg→KEM** (3 fag) |
| P-3 | NAV matcher | **OK — catalog level** `håndverkere.platearbeider-og-sveiser` (closest STYRK; no dedicated blikkenslager leaf) |
| P-4 | V.BA VG2 switch | **OK — extend sibling set** |
| P-5 | Empty bedrift | **OK — godkjent-only** |
| P-6 | Northern VG2=0 | Per county-local primary policy — ABORT if Vilbli VG2=0 |
| P-7 / P-8 | Cross-fylke / sparse | **Not chartered** for klima at start |

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffolding | ☑ |
| Catalog seed applied prod | ☑ 2026-07-21 |
| Relay dry-run + full production | ☐ |
| Lærebedrift ingest (3 fag) | ☐ |
| E2E + prod UI | ☐ |
