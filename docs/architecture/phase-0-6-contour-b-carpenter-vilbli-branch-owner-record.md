# Phase 0–6 Contour B — Carpenter Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **PILOT IN PROGRESS** — Nordland (`18`) Contour B |
| **Date (UTC)** | 2026-06-10 |
| **Profession slug** | `carpenter` (catalog: Tømrer) |
| **Parent gate** | `phase-0-6-contour-b-third-profession-expansion-owner-record.md` |

---

## Signed Vilbli contour (`V.BA` — Tømrerfaget chain)

**Core school path (materialized per fylke):**

| Step | Vilbli label | Course tokens (reference) |
|------|----------------|---------------------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Tømrerfaget | `V.BATMF2----` |

**VG3 / Opplæring i bedrift (UI — kolonne 3 from *this* chain in *this* fylke):**

Same policy as mechanic: show **all** kolonne-3 / bedrift continuations Vilbli lists on the county `bygg-og-anleggsteknikk-skoler-og-laerebedrifter` page for kurs `V.BABAT1----_V.BATMF2----_V.BATMF3----` (sibling bygg specializations + bedrift links).

**Product policy (owner 2026-06-10):**

| Show | Do not show |
|------|-------------|
| Tømrerfaget chain only (`BATMF2`) | Other VG2 columns (Rørlegger, Anleggsteknikk, Treteknikk, …) as separate product professions |
| Kolonne-3 / bedrift from **this** chain | National master list of all `V.BA` branches |
| | **Påbygging til generell studiekompetanse** |

Catalog profession: **Tømrer**. Route truth is **programme-path-scoped** (carpenter contour), not “every bygg job in Norway”.

Reference for **4th profession sequencing (owner 2026-07-03):** Rørlegger is a **separate** catalogue profession (`plumber`) — add **before** V.BA VG2 cross-profession gate. See `VGS_OPERATIONAL_RUNNERS.md`.

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart (tømrer) | https://www.vilbli.no/nb/no/strukturkart/V.BA/tomrer-fag-og-timefordeling?kurs=V.BABAT1----_V.BATMF2----&side=p2 |
| **Pipeline ingest** (per fylke) | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BATMF2----_V.BATMF3----&side=p5` |
| Program overview | https://www.vilbli.no/nb/no/om/v.ba/bygg-og-anleggsteknikk |

---

## Materialization slugs (VG1/VG2 per fylke)

| Node | Slug pattern | Title |
|------|----------------|-------|
| VG1 | `carpenter-vg1-bygg-{countySlug}` | VG1 Bygg- og anleggsteknikk |
| VG2 | `carpenter-vg2-tomrer-{countySlug}` | VG2 Tømrerfaget |

Trøndelag (`50`): `carpenter-vg1-bygg-trondelag`, `carpenter-vg2-tomrer-trondelag` (same pattern as electrician/mechanic).

VG3/bedrift: expanded from Vilbli bedrift links (`carpenter-vg3-{title}-{countySlug}` pattern).

---

## Nordland pilot schools (scout 2026-06-10)

**VG1 (7):** Bodø, Fauske, Hadsel, Mosjøen, Narvik, Polarsirkelen, Vest-Lofoten.

**VG2 tømrer (5):** Bodø, Hadsel, Mosjøen, Narvik, Polarsirkelen.

**Not on carpenter chain:** Nord-Salten slash row (present on electrician `18` only).

---

## Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-2 | Pilot fylke | **OK — Nordland (`18`)** |
| P-3 | Rollout | **OK — pilot first** |
| P-4 | VG2 branch | **OK — Tømrerfaget only** (`BATMF2`), not full `V.BA` VG2 menu |
| P-5 | VG3/bedrift list | **OK — all kolonne-3 continuations for Bygg→Tømrer chain** |

---

## Exit criteria

- [x] P-2 … P-5 signed
- [x] `buildRequiredProgrammeSpecs` supports `carpenter`
- [x] `professions` catalog row (`scripts/sql/seed-profession-carpenter-catalog.sql`)
- [ ] Nordland production ingest
- [ ] Browser E2E — VG1/VG2 + kolonne-3 list + Opplæring i bedrift
