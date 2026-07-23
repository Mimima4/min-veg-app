# Phase 0–6 Contour B — Treteknikk Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **IN PROGRESS** — scaffolding 2026-07-23 |
| **Date (UTC)** | 2026-07-23 |
| **Profession slug** | `treteknikk` (catalog: Treteknikk) |
| **Parent gate** | `phase-0-6-contour-b-vgs-profession-addition-template.md` |

---

## Signed Vilbli contour (`V.BA` — Treteknikk)

| Step | Vilbli label | Course tokens |
|------|----------------|---------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Treteknikk | `V.BATRT2----` |

**Kolonne-3 / bedrift** (Påbygging excluded):

| VIGO | Label | Lærefag code |
|------|--------|--------------|
| `BASNE3` | Snekkerfaget (**primary**) | `SNEKKERFAGET` |
| `TPISN3` | Industrisnekkerfaget | `INDUSTRISNEKKERFAGET` |
| `BATLT3` | Trelast- og limtreproduksjonsfaget | `TRELAST_OG_LIMTREPRODUKSJONSFAGET` |

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart | https://www.vilbli.no/nb/no/strukturkart/V.BA/treteknikk-fag-og-timefordeling?kurs=V.BABAT1----_V.BATRT2----&side=p2 |
| **Pipeline ingest** | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BATRT2----&side=p5` |

---

## Materialization / PSA

| Node | Slug pattern |
|------|----------------|
| VG1 | `treteknikk-vg1-bygg-{countySlug}` |
| VG2 | `treteknikk-vg2-treteknikk-{countySlug}` |

---

## Owner decisions

| # | Status |
|---|--------|
| P-1 Vilbli contour | **OK — Bygg → Treteknikk** (`BATRT2`) |
| P-2 kolonne-3 | **OK — 3 fag** (Snekker primary; Industrisnekker + Trelast siblings) |
| P-3 NAV | **OK closest —** `håndverkere.tømrer` (wood-trade vacancy leaf; no dedicated Treteknikk STYRK) |
| P-4 V.BA VG2 switch | **OK** |
| P-5 empty bedrift | **OK — godkjent-only** |
| P-6 / P-7 / P-8 | P-6 auto; P-7 north auto; **no P-8** |

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffolding | ☐ |
| Catalog seed prod | ☐ |
| Profession-local Contour B relay | ☐ |
| Lærebedrift ingest (primary `SNEKKERFAGET`) | ☐ |
| Vilbli ↔ Min Veg table | ☐ |
| E2E / owner UI | ☐ |
