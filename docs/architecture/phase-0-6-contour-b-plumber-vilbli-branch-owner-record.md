# Phase 0–6 Contour B — Plumber Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **PILOT IN PROGRESS** — Nordland (`18`) Contour B |
| **Date (UTC)** | 2026-07-03 |
| **Profession slug** | `plumber` (catalog: Rørlegger) |
| **Parent gate** | `phase-0-6-contour-b-fourth-profession-expansion-owner-record.md` (VGS_OPERATIONAL_RUNNERS.md) |

---

## Signed Vilbli contour (`V.BA` — Rørleggerfaget chain)

**Core school path (materialized per fylke):**

| Step | Vilbli label | Course tokens (reference) |
|------|----------------|---------------------------|
| VG1 | Bygg- og anleggsteknikk | `V.BABAT1----` |
| VG2 | Rørleggerfaget | `V.BARLF2----` |

**VG3 / Opplæring i bedrift (UI — kolonne 3 from *this* chain in *this* fylke):**

Show kolonne-3 / bedrift continuations Vilbli lists on the county `bygg-og-anleggsteknikk-skoler-og-laerebedrifter` page for kurs `V.BABAT1----_V.BARLF2----_V.BARLF3----`. Typically a single fag (`Rørleggerfaget`).

**Product policy (owner 2026-07-03):**

| Show | Do not show |
|------|-------------|
| Rørleggerfaget chain only (`BARLF2`) | Other VG2 columns (Tømrer, Anleggsteknikk, Treteknikk, …) as separate product professions |
| Kolonne-3 / bedrift from **this** chain | National master list of all `V.BA` branches |
| | **Påbygging til generell studiekompetanse** |

Catalog profession: **Rørlegger**. Route truth is **programme-path-scoped** (plumber contour), not “every bygg job in Norway”.

**Sequencing:** Plumber ships **before** the V.BA VG2 cross-profession gate (`VGS_OPERATIONAL_RUNNERS.md`).

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart (rørlegger) | https://www.vilbli.no/nb/no/strukturkart/V.BA/rorlegger-fag-og-timefordeling?kurs=V.BABAT1----_V.BARLF2----&side=p2 |
| **Pipeline ingest** (per fylke) | `.../bygg-og-anleggsteknikk-skoler-og-laerebedrifter?kurs=V.BABAT1----_V.BARLF2----_V.BARLF3----&side=p5` |
| Program overview | https://www.vilbli.no/nb/no/om/v.ba/bygg-og-anleggsteknikk |

---

## Materialization slugs (VG1/VG2 per fylke)

| Node | Slug pattern | Title |
|------|----------------|-------|
| VG1 | `plumber-vg1-bygg-{countySlug}` | VG1 Bygg- og anleggsteknikk |
| VG2 | `plumber-vg2-rorlegger-{countySlug}` | VG2 Rørleggerfaget |

Trøndelag (`50`): `plumber-vg1-bygg-trondelag`, `plumber-vg2-rorlegger-trondelag`.

VG3/bedrift: expanded from Vilbli bedrift links (`plumber-vg3-{title}-{countySlug}` pattern).

---

## Lærebedrift ingest

| Field | Value |
|-------|--------|
| `larefag_code` | `RORLEGGERFAGET` |
| VIGO api query | `BARLF3` |
| Cron batch | `0` (with `TOMRERFAGET`) |

---

## Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-2 | Pilot fylke | **OK — Nordland (`18`)** |
| P-3 | Rollout | **OK — pilot first, then nationwide relay** |
| P-4 | VG2 branch | **OK — Rørleggerfaget only** (`BARLF2`), not full `V.BA` VG2 menu |
| P-5 | VG3/bedrift list | **OK — kolonne-3 for Bygg→Rørlegger chain** |
| P-6 | Primary-route lærebedrift | **OK — nationwide when child has home kommune** (Phase 5) |
