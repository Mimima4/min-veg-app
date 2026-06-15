# Phase 4 — Nordland Steigen Regional Delivery Research Owner Record

| Field | Value |
|-------|--------|
| **Status** | **ACTIVE** — Vilbli scout **2026-06-15**; no product code |
| **Track** | **A** — Steigenmodellen / veksling (`18` Nordland) |
| **Prerequisite** | Carpenter **15/15** closed; regional fit analysis **OWNER SIGNED** |
| **Carpenter role** | Product precedent for **ordinary VGS chain** comparison — not Steigen delivery model |

---

## 1. Goal

Close the **read-only** gap from `phase-4-losa-regional-delivery-models-fit-analysis.md` §1:

> Vilbli rows for Steigen area; Udir/operator docs on Steigenmodellen vs LOSA legal status.

Determine whether Steigenmodellen appears on **Vilbli strukturkart** for standard VGS programme chains, and what **product contour** (not Finnmark LOSA) would be needed to represent it.

---

## 2. Steigenmodellen (public reference — not product truth)

| Dimension | Steigenmodellen |
|-----------|-----------------|
| Site | **Knut Hamsun VGS avd Steigen** (Allhuset, Leinesfjord) — kommune page now brands as **Nord-Salten vgs avd Steigen** |
| Pedagogy | **0+4 / veksling**: lærling i bedrift from day 1; **2 days/week** school (fellesfag) years 1–2; programfag in bedrift |
| Professions cited locally | Incl. **Tømrerfaget**, byggdrift, fisk, helse, … (~17 tracks historically) |
| Legal / policy | **Not** fjernundervisning LOSA; **lære / yrkesopplæring i bedrift** with school fellesfag hub |
| Fylke context | NFK 2025–2029 tilbudsstruktur: **0+4** fellesfag on nearest VGS preserved ([NFK aktuelt](https://www.nfk.no/aktuelt/knut-hamsun-vgs-fellesundervisning-pa-narmeste-skole.99955.aspx)) |

---

## 3. Vilbli scout — Nordland `18` (2026-06-15)

**Script:** `npm run scout:nordland-regional` (`scripts/scout-nordland-regional-delivery-vilbli.mjs`)

### Programme chain rows (strukturkart)

| Profession | VG1 | VG2 | LOSA-labelled rows | Regional signals on page |
|------------|-----|-----|--------------------|---------------------------|
| electrician | 13 | 8 | **0** | **1** slash: `Nuortta-Sálto … / Nord-Salten videregående skole` |
| mechanic | 12 | 4 | **0** | none |
| carpenter | 7 | 5 | **0** | none |

**No** `LOSA`, `veksling`, `Steigen`, or `Knut Hamsun` strings on these three Vilbli strukturkart pages.

### Identity vs DB

| Entity | In Vilbli chains (elec/mech/carp) | In `education_institutions` | PSA `18` for 3 professions |
|--------|-----------------------------------|----------------------------|----------------------------|
| Nord-Salten (slash, county) | electrician VG1 only | yes (parent) | yes (electrician) |
| Nord-Salten **avd Steigen** | **not listed** | yes (`1848` Steigen) | **0** |
| Knut Hamsun (by name) | **not listed** | **not in DB** | — |

→ **Steigenmodellen delivery is invisible** on standard Vilbli VGS→VG2 strukturkart for electrician/mechanic/carpenter. Ordinary route steps cannot surface it without a **separate product contour**.

### Carpenter precedent (research)

Carpenter on `18` proves **campus programme_selection** for Bygg→Tømrer (7/5 schools). **Tømrerfaget** is a Steigenmodellen-offered trade locally, but **not** represented as a Steigen/veksling row in Vilbli strukturkart — different problem class.

---

## 4. Fit vs contours (reconfirmed)

| Contour | Fit Steigenmodellen? |
|---------|----------------------|
| Finnmark LOSA (`losa_fjern_delivery_municipality`) | **No** — zero LOSA labels on `18` Vilbli for pilot chains |
| Contour B ordinary `programme_selection` | **Partial** — only schools on strukturkart; **excludes** avd Steigen / 0+4 |
| **`apprenticeship_step` / veksling slice** | **Yes (candidate)** — employer-first, school hub for fellesfag |
| Nettskolen / studieverksted | **Separate** — digital school entity (also present in Steigen per kommune info) |

---

## 5. Owner decisions (open)

| # | Question | Status |
|---|----------|--------|
| R-1 | Reuse Finnmark LOSA pipeline for Steigen? | **No** — scout confirms 0 LOSA rows on `18` pilot chains |
| R-2 | Charter **veksling / 0+4** product slice? | **OPEN** — needs scope: which trades, which kommuner (Steigen/Hamarøy/Tysfjord history) |
| R-3 | Vilbli source for veksling truth? | **OPEN** — not on strukturkart; likely **operator / Udir / fylke** docs, not strukturkart ingest |
| R-4 | Show Steigenmodellen in app for child home **Steigen `1848`**? | **OPEN** — UX + route step types; blocked on R-2/R-3 |

---

## 6. Next analysis (no code)

| Step | Action |
|------|--------|
| 1 | **Tier 1 legal frame** — Steigenmodellen vs LOSA vs standard lære (Udir / Opplæringsforskriften); owner-held note |
| 2 | **Fylke operator inventory** — which trades active on Steigenmodellen 2025–2029 vs carpenter/electrician VGS chains |
| 3 | **Product charter draft** — `apprenticeship_step` + employer entity + fellesfag school hub (Knut Hamsun / Nord-Salten avd Steigen) |
| 4 | **Optional** — expand scout to other Nordland kommuner with `fellesundervisning på nærmeste skole` pattern |

**No implementation authorized.**

---

## 7. References

- `phase-4-losa-regional-delivery-models-fit-analysis.md` §1
- `phase-0-6-contour-b-third-profession-expansion-owner-record.md` — carpenter research anchor
- `phase-2-validation-contour-data-resolution-backlog.md` — Case A (`18`)
- [levisteigen.no — Steigenmodellen](https://www.levisteigen.no/utdanning-i-steigen.html)
- [NFK — fellesundervisning Knut Hamsun](https://www.nfk.no/aktuelt/knut-hamsun-vgs-fellesundervisning-pa-narmeste-skole.99955.aspx)
