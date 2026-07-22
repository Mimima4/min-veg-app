# Phase 0–6 Contour B — Murer Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — PSA relay + bedrift ingest + catalog 2026-07-22 |
| **Date (UTC)** | 2026-07-22 |
| **Profession slug** | `murer` (catalog: Murer og betong / Betong og mur) |
| **Parent gate** | `phase-0-6-contour-b-vgs-profession-addition-template.md`; `phase-0-6-contour-b-eighth-profession-expansion-owner-record.md` |
| **Commits** | `54643c3` (scaffold); closure ops 2026-07-22 |

---

## Signed Vilbli contour (`V.BA` — Betong og mur)

| Step | Vilbli label | Course tokens |
|------|----------------|---------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Betong og mur | `V.BABMO2----` |

**Kolonne-3 / bedrift:**

| VIGO | Label | Ingest (2026-07-21) |
|------|--------|---------------------|
| `BAMFF3` | Murer- og flisleggerfaget (**primary**) | upserted **257** |
| `BABET3` | Betongfaget | upserted **414** |

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart | https://www.vilbli.no/nb/no/strukturkart/V.BA/betong-og-mur-fag-og-timefordeling?kurs=V.BABAT1----_V.BABMO2----&side=p2 |
| **Pipeline ingest** | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BABMO2----&side=p5` |

---

## Materialization / PSA (relay 2026-07-22)

| Node | Slug pattern |
|------|----------------|
| VG1 | `murer-vg1-bygg-{countySlug}` |
| VG2 | `murer-vg2-betong-mur-{countySlug}` |

Full-matrix relay (retry after Vilbli 504 window): murer **13 ingested**, **2 ABORT** (Vilbli VG2=0: Nordland `18`, Finnmark `56`). Active programmes **26** (13 VG1 + 13 VG2). ABORT → P-6 empty primary; P-7 north nabofylke auto for home `{18,55,56}` when a neighbor has VG2 (e.g. Nordland/Finnmark → Troms).

---

## Owner decisions

| # | Status |
|---|--------|
| P-1 Vilbli contour | **OK — Bygg → Betong og mur** (`BABMO2`) |
| P-2 kolonne-3 | **OK — 2 fag** (`BAMFF3`, `BABET3`) |
| P-3 NAV | **OK —** `håndverkere.murer` |
| P-4 V.BA VG2 switch | **OK** |
| P-5 empty bedrift | **OK — godkjent-only** |
| P-6 / P-7 / P-8 | P-6 auto; P-7 north auto; **no P-8** |

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffolding | ☑ `54643c3` |
| Catalog seed prod | ☑ 2026-07-21 |
| Full Contour B relay | ☑ 2026-07-22 (13/15; ABORT `18`,`56`) |
| Lærebedrift ingest (2 fag) | ☑ 257+414 upserted |
| Monthly cron | ☑ primary in batch 0; sibling batch 7 |
| Owner UI spot-check | ☐ Vestland / Finnmark P-7 optional |
