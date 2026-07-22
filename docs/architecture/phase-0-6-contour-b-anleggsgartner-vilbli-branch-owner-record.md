# Phase 0–6 Contour B — Anleggsgartner Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **OPEN** — code scaffold; catalog seed + relay + bedrift pending |
| **Date (UTC)** | 2026-07-22 |
| **Profession slug** | `anleggsgartner` (catalog: Anleggsgartner) |
| **Parent gate** | `phase-0-6-contour-b-vgs-profession-addition-template.md`; `phase-0-6-contour-b-ninth-profession-expansion-owner-record.md` |
| **Commits** | scaffold TBD |

---

## Signed Vilbli contour (`V.BA` — Anleggsgartner)

| Step | Vilbli label | Course tokens |
|------|----------------|---------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Anleggsgartner | `V.BAANG2----` |

**Kolonne-3 / bedrift (scaffold):**

| VIGO | Label | Ingest |
|------|--------|--------|
| `BAANG3` | Anleggsgartnerfaget (**primary**) | pending |

Sibling kolonne-3 fag (if any beyond primary) — re-extract with `scripts/extract-vilbli-kolonne3-roster.mjs` before claiming full roster closed.

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart | https://www.vilbli.no/nb/no/strukturkart/V.BA/anleggsgartner-fag-og-timefordeling?kurs=V.BABAT1----_V.BAANG2----&side=p2 |
| **Pipeline ingest** | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BAANG2----&side=p5` |

---

## Materialization / PSA

| Node | Slug pattern |
|------|----------------|
| VG1 | `anleggsgartner-vg1-bygg-{countySlug}` |
| VG2 | `anleggsgartner-vg2-anleggsgartner-{countySlug}` |

Relay scope after deploy: **profession-local** `--profession anleggsgartner` (all pipeline counties). Full matrix only if contour code / 6-month cadence requires it.

---

## Owner decisions

| # | Status |
|---|--------|
| P-1 Vilbli contour | **OK — Bygg → Anleggsgartner** (`BAANG2`) |
| P-2 kolonne-3 | **OK primary — `BAANG3`**; siblings TBD extract |
| P-3 NAV | **OK closest —** `natur-og-miljø.skogbruk,-gartnerarbeid-og-hagebruk` («Skogbruk, gartnerarbeid og hagebruk») |
| P-4 V.BA VG2 switch | **OK** |
| P-5 empty bedrift | **OK — godkjent-only** |
| P-6 / P-7 / P-8 | P-6 auto; P-7 north auto; **no P-8** |

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffolding | ☐ commit pending |
| Catalog seed prod | ☐ `scripts/sql/seed-profession-anleggsgartner-catalog.sql` |
| Profession-local Contour B relay | ☐ after deploy |
| Lærebedrift ingest (`BAANG3`) | ☐ |
| Monthly cron | ☑ primary in batch 0 via roster `ingestBatch: 0` + `scheduled-larebedrift-ingest-fags.ts` |
| Owner UI spot-check | ☐ |
