# Phase 0–6 Contour B — Murer Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **SCAFFOLDED** 2026-07-21 — awaiting catalog seed + Contour B relay + prod UI |
| **Date (UTC)** | 2026-07-21 |
| **Profession slug** | `murer` (catalog: Murer og betong / Betong og mur) |
| **Parent gate** | `phase-0-6-contour-b-vgs-profession-addition-template.md`; `phase-0-6-contour-b-eighth-profession-expansion-owner-record.md` |

---

## Signed Vilbli contour (`V.BA` — Betong og mur)

| Step | Vilbli label | Course tokens |
|------|----------------|---------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Betong og mur | `V.BABMO2----` |

**Kolonne-3 / bedrift (Vestland strukturkart extract 2026-07-21):**

| VIGO | Label |
|------|--------|
| `BAMFF3` | Murer- og flisleggerfaget (**primary**) |
| `BABET3` | Betongfaget |

Verified against national strukturkart `#kursKolonne3` for the `V.BABAT1----_V.BABMO2----` chain: exactly two lærefag columns (`BAMFF3`, `BABET3`) plus `PBPBY3` **Påbygging** (excluded).

| Show | Do not show |
|------|-------------|
| Betong og mur chain only (`BABMO2`) | Other VG2 columns as this profession |
| Kolonne-3 from **this** chain | National master list of all `V.BA` |
| | **Påbygging** (`PBPBY3`) |

**V.BA shared VG1:** `murer` shares VG1 Bygg with carpenter / plumber / painter / anleggsteknikk / klima. Separate `profession_slug`; VG2 programme switch wired.

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart | https://www.vilbli.no/nb/no/strukturkart/V.BA/betong-og-mur-fag-og-timefordeling?kurs=V.BABAT1----_V.BABMO2----&side=p2 |
| **Pipeline ingest** (per fylke) | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BABMO2----&side=p5` |

---

## Materialization slugs

| Node | Slug pattern | Title |
|------|----------------|-------|
| VG1 | `murer-vg1-bygg-{countySlug}` | VG1 Bygg- og anleggsteknikk |
| VG2 | `murer-vg2-betong-mur-{countySlug}` | VG2 Betong og mur |

Trøndelag (`50`): `murer-vg1-bygg-trondelag`, `murer-vg2-betong-mur-trondelag`.

---

## Lærebedrift

| Field | Value |
|-------|--------|
| Primary `larefag_code` | `MURER_OG_FLISLEGGERFAGET` |
| VIGO | `BAMFF3` |
| Sibling fag | `BABET3` Betongfaget (`BETONGFAGET`) |
| Roster | `data/larebedrift/kolonne3-rosters/murer.json` (ingestBatch **7**, primary fag batch **0**) |

---

## Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-1 | Vilbli contour | **OK — Bygg → Betong og mur** (`BABMO2`) |
| P-2 | VG3/bedrift list | **OK — kolonne-3 for Bygg→Betong og mur** (2 fag: `BAMFF3`, `BABET3`) |
| P-3 | NAV matcher | **OK — catalog level** `håndverkere.murer` (dedicated NAV arbeidsplassen leaf for the primary Murer- og flisleggerfaget) |
| P-4 | V.BA VG2 switch | **OK — extend sibling set** |
| P-5 | Empty bedrift | **OK — godkjent-only** |
| P-6 | Northern VG2=0 | Per county-local primary policy — auto empty primary if Vilbli VG2=0 |
| P-7 | Cross-fylke north | **Auto** for Contour B (home `55`/`56`) — profession-agnostic overlay already generalized |
| P-8 | Sparse national | **Not chartered** for murer |

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffolding | ☑ 2026-07-21 |
| Catalog seed applied prod | ☐ `scripts/sql/seed-profession-murer-catalog.sql` |
| Relay dry-run + full production | ☐ |
| Lærebedrift ingest (2 fag) | ☐ |
| E2E + prod UI | ☐ |
