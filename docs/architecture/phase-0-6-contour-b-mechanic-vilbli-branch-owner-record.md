# Phase 0–6 Contour B — Mechanic Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **PILOT IN PROGRESS** — Vestland Contour A ingest |
| **Date (UTC)** | 2026-06-10 |
| **Profession slug** | `mechanic` (catalog: Mekaniker) |
| **Parent gate** | `phase-0-6-contour-b-second-profession-expansion-owner-record.md` |

---

## Signed Vilbli contour (`v.tp`)

**Core school path (materialized per fylke):**

| Step | Vilbli label | Course tokens (reference) |
|------|----------------|---------------------------|
| VG1 | Teknologi- og industrifag | `v.tptip1----` |
| VG2 | Kjøretøy | `v.tpkjt2----` |

**VG3 / Opplæring i bedrift (UI — next steps from *this* programme chain, this fylke):**

Not a national mechanic catalog. Options come from the **same Vilbli strukturkart column** as the child’s path:

`Teknologi- og industrifag (VG1)` → `Kjøretøy (VG2)` → **kolonne 3** (*Vg3 – Videregående trinn 3 eller opplæring i bedrift*) on the county `kjøretøy-skoler-og-laerebedrifter` page (`kurs=v.tptip1----_v.tpkjt2----_…`).

We show **every** continuation in that column for the fylke (sibling specializations), e.g. Vestland:

- Bilfaget, demontering av kjøretøy
- Bilfaget, lette kjøretøy
- Bilfaget, tunge kjøretøy
- Hjulutrustningsfaget
- Landbruksmaskinmekanikerfaget
- Motormekanikerfaget
- Motorsykkelfaget
- Reservedelsfaget
- Sykkelmekanikerfaget
- Truck- og liftmekanikerfaget

**Product policy (owner 2026-06-10):**

| Show | Do not show |
|------|-------------|
| All **next** options Vilbli lists for **this** VG1→VG2 chain in **this** fylke | Single-fag filter (e.g. only Bilfaget, lette) |
| Sibling specializations in kolonne 3 (rådgivere explain differences) | Unrelated VG2 columns (Anleggsteknikk, Industriteknologi, …) |
| | National / cross-fylke master list |
| | **Påbygging til generell studiekompetanse** (excluded contour) |

Catalog profession: **Mekaniker**. Route truth is **programme-path-scoped**, not “every mechanic job in Norway”.

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| Full strukturkart (national) | https://www.vilbli.no/nb/no/strukturkart/v.tp/bilfaget-lette-kjoretoy?kurs=v.tptip1----_v.tpkjt2----_v.tpbmk3----&side=p2 |
| **Pipeline ingest** (per fylke) | `.../kjoretoy-skoler-og-laerebedrifter?kurs=v.tptip1----_v.tpkjt2----_v.tpbmk3----&side=p5` |
| Program overview | https://www.vilbli.no/nb/no/om/v.tp/teknologi-og-industrifag |

---

## Materialization slugs (VG1/VG2 per fylke)

| Node | Slug pattern | Title |
|------|----------------|-------|
| VG1 | `mechanic-vg1-teknologi-{countySlug}` | VG1 Teknologi- og industrifag |
| VG2 | `mechanic-vg2-kjoretoy-{countySlug}` | VG2 Kjøretøy |

VG3/bedrift specialization programmes: expanded from Vilbli bedrift links (`mechanic-vg3-{title}-{countySlug}` pattern).

---

## Owner decisions

| # | Question | Status |
|---|----------|--------|
| P-2 | Pilot fylke | **OK — Vestland (`46`)** |
| P-3 | Rollout | **OK — pilot first** |
| P-4 | VG3/bedrift list | **OK — all kolonne-3 continuations for Teknologi→Kjøretøy chain** (not single-fag filter; not global catalog) |

---

## Exit criteria

- [x] P-2 + P-3 signed
- [x] `buildRequiredProgrammeSpecs` supports `mechanic`
- [x] Vestland production ingest
- [ ] Browser E2E: VG1/VG2 + full VG3/bedrift specialization list + Opplæring i bedrift
