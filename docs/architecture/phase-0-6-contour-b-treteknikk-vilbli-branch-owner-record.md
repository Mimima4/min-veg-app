# Phase 0–6 Contour B — Treteknikk Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — PSA relay + bedrift ingest + Vilbli↔Min Veg 2026-07-23 |
| **Date (UTC)** | 2026-07-23 |
| **Profession slug** | `treteknikk` (catalog: Treteknikk) |
| **Parent gate** | `phase-0-6-contour-b-vgs-profession-addition-template.md` |
| **Commits** | `641ace2` (scaffold) |

---

## Signed Vilbli contour (`V.BA` — Treteknikk)

| Step | Vilbli label | Course tokens |
|------|----------------|---------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Treteknikk | `V.BATRT2----` |

**Kolonne-3 / bedrift** (Påbygging excluded):

| VIGO | Label | Lærefag code | Ingest |
|------|--------|--------------|--------|
| `BASNE3` | Snekkerfaget (**primary**) | `SNEKKERFAGET` | upserted **134** |
| `TPISN3` | Industrisnekkerfaget | `INDUSTRISNEKKERFAGET` | upserted **12** |
| `BATLT3` | Trelast- og limtreproduksjonsfaget | `TRELAST_OG_LIMTREPRODUKSJONSFAGET` | upserted **29** |

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart | https://www.vilbli.no/nb/no/strukturkart/V.BA/treteknikk-fag-og-timefordeling?kurs=V.BABAT1----_V.BATRT2----&side=p2 |
| **Pipeline ingest** | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BATRT2----&side=p5` |

---

## Materialization / PSA (relay 2026-07-23)

| Node | Slug pattern |
|------|----------------|
| VG1 | `treteknikk-vg1-bygg-{countySlug}` |
| VG2 | `treteknikk-vg2-treteknikk-{countySlug}` |

Profession-local relay: **5 ingested**, **10 ABORT** (Vilbli VG2=0).

| Action | Counties |
|--------|----------|
| `ingested` | `11`, `31`, `33`, `39`, `42` |
| `ABORT` VG2=0 | `03`, `15`, `18`, `32`, `34`, `40`, `46`, `50`, `55`, `56` |

Active programmes **10** (5 VG1 + 5 VG2). Active VG2 PSA **7** schools.

### Vilbli ↔ Min Veg (local VG2 map pins)

| Fylke | Vilbli pins | Min Veg active | Status |
|-------|-------------|----------------|--------|
| `11` Rogaland | Godalen, Tryggheim | same 2 | **MATCH** |
| `31` Østfold | Greåker, Mysen | same 2 | **MATCH** |
| `33` Buskerud | Åssiden | same 1 | **MATCH** |
| `39` Vestfold | Thor Heyerdahl | same 1 | **MATCH** |
| `42` Agder | Tangen | same 1 | **MATCH** |

North `{18,55,56}`: local VG2=0 (ABORT); continuations table **70** rows (out-of-county pins → destinations in `{11,31,33,39,42}` spanning **5** fylke). P-7 landslinje guard (`MAX_P7_CONTINUATION_DESTINATION_COUNTIES=2`) → **nabofylke off** (national dump, not sparse nabofylke). P-6 empty primary copy applies. **No P-8.**

---

## Owner decisions

| # | Status |
|---|--------|
| P-1 Vilbli contour | **OK — Bygg → Treteknikk** (`BATRT2`) |
| P-2 kolonne-3 | **OK — 3 fag** (Snekker primary; Industrisnekker + Trelast siblings) |
| P-3 NAV | **OK closest —** `håndverkere.tømrer` |
| P-4 V.BA VG2 switch | **OK** |
| P-5 empty bedrift | **OK — godkjent-only** |
| P-6 / P-7 / P-8 | P-6 auto; P-7 north **auto but landslinje-guarded off** for this offering; **no P-8** |

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffolding | ☑ `641ace2` |
| Catalog seed prod | ☑ 2026-07-23 |
| Profession-local Contour B relay | ☑ 5/15 ingested; 10 ABORT VG2=0 |
| Lærebedrift ingest | ☑ 134+12+29 |
| Vilbli ↔ Min Veg table | ☑ MATCH on 5 ingested counties |
| Owner UI spot-check | ☐ optional |
