# Phase 0–6 Contour B — Anleggsgartner Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **CLOSED** — PSA relay + bedrift ingest + catalog 2026-07-22 |
| **Date (UTC)** | 2026-07-22 |
| **Profession slug** | `anleggsgartner` (catalog: Anleggsgartner) |
| **Parent gate** | `phase-0-6-contour-b-vgs-profession-addition-template.md`; `phase-0-6-contour-b-ninth-profession-expansion-owner-record.md` |
| **Commits** | `a6bc7ae` (scaffold); closure ops 2026-07-22 |

---

## Signed Vilbli contour (`V.BA` — Anleggsgartner)

| Step | Vilbli label | Course tokens |
|------|----------------|---------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Anleggsgartner | `V.BAANG2----` |

**Kolonne-3 / bedrift:**

| VIGO | Label | Ingest (2026-07-22) |
|------|--------|---------------------|
| `BAANG3` | Anleggsgartnerfaget (**sole fag** on chain) | upserted **271** |

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart | https://www.vilbli.no/nb/no/strukturkart/V.BA/anleggsgartner-fag-og-timefordeling?kurs=V.BABAT1----_V.BAANG2----&side=p2 |
| **Pipeline ingest** | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAANG2----&side=p5` |

---

## Materialization / PSA (relay 2026-07-22)

| Node | Slug pattern |
|------|----------------|
| VG1 | `anleggsgartner-vg1-bygg-{countySlug}` |
| VG2 | `anleggsgartner-vg2-anleggsgartner-{countySlug}` |

Profession-local relay: **12 ingested**, **3 ABORT** (Vilbli VG2=0: Nordland `18`, Troms `55`, Finnmark `56`). Active programmes **24** (12 VG1 + 12 VG2). ABORT → P-6 empty primary; P-7 north nabofylke auto for home `{18,55,56}` when a neighbor has VG2 (e.g. Nordland → Trøndelag `50`). **Note:** Troms (`55`) neighbors are only `18`/`56` (also VG2=0), so P-7 may stay empty for Troms homes until offering appears.

---

## Owner decisions

| # | Status |
|---|--------|
| P-1 Vilbli contour | **OK — Bygg → Anleggsgartner** (`BAANG2`) |
| P-2 kolonne-3 | **OK — sole fag** (`BAANG3`) |
| P-3 NAV | **OK closest —** `natur-og-miljø.skogbruk,-gartnerarbeid-og-hagebruk` |
| P-4 V.BA VG2 switch | **OK** |
| P-5 empty bedrift | **OK — godkjent-only** |
| P-6 / P-7 / P-8 | P-6 auto; P-7 north auto; **no P-8** |

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffolding | ☑ `a6bc7ae` |
| Catalog seed prod | ☑ 2026-07-22 |
| Profession-local Contour B relay | ☑ 2026-07-22 (12/15; ABORT `18`,`55`,`56`) |
| Lærebedrift ingest (`BAANG3`) | ☑ 271 upserted |
| Monthly cron | ☑ primary in batch 0 |
| Owner UI spot-check | ☐ optional |
