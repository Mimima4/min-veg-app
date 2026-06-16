# Phase 4 — Nordland Steigen Regional Delivery Research Owner Record

| Field | Value |
|-------|--------|
| **Status** | **RESEARCH CLOSED** — Tier 1 + inventory **2026-06-15**; pilot charter **DRAFT** |
| **Track** | **A** — Steigenmodellen / veksling (`18` Nordland) |
| **Prerequisite** | Carpenter **15/15** closed; regional fit analysis **OWNER SIGNED** |
| **Carpenter role** | Product precedent for **ordinary VGS chain** comparison — not Steigen delivery model |
| **Pilot charter** | `phase-4-nordland-steigen-carpenter-veksling-pilot-charter.md` |

---

## 1. Goal

Close the **read-only** gap from `phase-4-losa-regional-delivery-models-fit-analysis.md` §1:

> Vilbli rows for Steigen area; Udir/operator docs on Steigenmodellen vs LOSA legal status.

Determine whether Steigenmodellen appears on **Vilbli strukturkart** for standard VGS programme chains, and what **product contour** (not Finnmark LOSA) would be needed to represent it.

**Outcome:** Research **closed**; narrow **Steigen × carpenter** veksling pilot chartered (draft).

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

## 5. Owner decisions

| # | Question | Status |
|---|----------|--------|
| R-1 | Reuse Finnmark LOSA pipeline for Steigen? | **No** |
| R-2 | Charter **veksling / 0+4** product slice? | **Yes** — pilot **Steigen × carpenter** (draft charter) |
| R-3 | Vilbli source for veksling truth? | **No strukturkart** — operator/fylke/kommune curated evidence |
| R-4 | Show Steigenmodellen for child home **Steigen `1848`**? | **Yes (goal)** — via parallel route variant; implementation **P0→P1** gated |
| R-5 | Pilot profession | **carpenter** (Tømrerfaget on Steigenmodellen list) |
| R-6 | Green-county / PSA ingest for avd Steigen? | **No** |

---

## 6. Fylke operator inventory — Steigenmodellen trades (2026-06-15)

**Source:** [levisteigen.no](https://www.levisteigen.no/utdanning-i-steigen.html) (public) + NFK policy confirmation of the **0+4 / Steigenmodellen** alternative for pupils from **Steigen + Hamarøy** in **2025–2029**.

| Trade (Norwegian) | Maps to Min Veg profession | On Vilbli strukturkart `18` (campus) | Steigenmodellen (public list) |
|-------------------|---------------------------|--------------------------------------|-------------------------------|
| **Tømrerfaget** | **`carpenter`** | yes (other campuses) | **yes** — **pilot** |
| Byggdrifterfaget | — (no catalog slug) | partial (bygg area) | yes |
| Industrimekanikerfaget | `mechanic` (distant) | yes (kjøretøy chain) | yes |
| Fiskeredskapfaget | — | — | yes |
| Helsearbeiderfaget | — | — | yes |
| Barne- og ungdomsarbeiderfaget | — | — | yes |
| Salgsfaget | — | — | yes |
| Akvakulturfaget | — | — | yes |
| Kontor- og administrasjonsfaget | — | — | yes |
| Renholderoperatørfaget | — | — | yes |
| Elektro / EL | `electrician` | yes (incl. Nord-Salten slash) | **not listed** on Steigenmodellen page |

**Pilot choice rationale:** **Tømrerfaget** aligns with **`carpenter`** catalog + Nordland research anchor; avoids electrician (not on Steigenmodellen list) and multi-trade scope creep.

**Action before P1:** T-2 evidence **closed** in charter §4.1 (2026-06-16). P1 design gate in charter §10. **P1 code** awaits **C-4**.

---

## 7. Tier 1 legal frame (owner-held summary)

| Frame | Steigenmodellen | Finnmark LOSA | Ordinary 2+2 VGS |
|-------|-----------------|---------------|------------------|
| **Policy origin** | NFK 2014 — alternative after **LOSA offer ended** in region ([Psykologi i kommunen 2019](https://psykisk-kommune.no/samspillet-mellom-teori-og-praksis-i-vekslingsmodeller/19.118)) | Fjernundervisning til hjemkommune | Campus VG1→VG2→lære |
| **Legal basis** | **Vekslingsmodell** / opplæring i bedrift under [opplæringslova](https://www.udir.no/regelverkstolkninger/opplaring/Innhold-i-opplaringen/veiledning-fleksibilitet-i-fag--og-timefordeling) (fleksibilitet i fag- og timefordeling) | LOSA / fjernundervisning frame | Standard VGS + læretid |
| **Employer** | **Første dag** i bedrift (0+4) | N/A (skole/digital) | Etter ~2 år skole |
| **School role** | **Fellesfag** hub (2 d/uke år 1, 1 d/uke år 2 per local description) | Provider + digital | Programfag + fellesfag campus |
| **Phase 2 classification** | **`external_delivery`** / veksling — **not** `unsupported_losa` for publish | `unsupported_losa` | `phase2_resolvable` campus |
| **Vilbli strukturkart** | **Not represented** (scout) | Separate LOSA labels (Finnmark) | Primary truth for Contour B |

**Binding conclusion:** Steigenmodellen is **legally and pedagogically veksling/0+4**, **not** LOSA. Product must **not** use `losa_fjern_delivery_municipality` or LOSA UI.

---

## 8. Next steps (implementation — separate gate)

| Priority | Step | Status |
|----------|------|--------|
| 1 | Owner sign charter **C-2** (P0 vs P1 start) | **CLOSED** — **P0** approved 2026-06-16 |
| 2 | Gate **T-2** (NFK 0+4 + Tømrerfaget evidence) | **CLOSED** — charter §4.1 2026-06-16 |
| 3 | **P0:** static info when `1848` + carpenter | **SHIPPED** — `d9be993` |
| 4 | **P1 design gate** (curated variant B spec) | **CLOSED** — charter §10 2026-06-16 |
| 5 | **P1 code** (path variant in route engine) | **OPEN** — awaits charter **C-4** owner sign-off |

**Code authorization:** P0 only via charter C-2/C-3. P1 requires **C-4** after design gate §10.

---

## 9. References

- `phase-4-nordland-steigen-carpenter-veksling-pilot-charter.md`
- `phase-4-losa-regional-delivery-models-fit-analysis.md` §1
- `phase-0-6-contour-b-third-profession-expansion-owner-record.md`
- `phase-2-validation-contour-data-resolution-backlog.md` — Case A (`18`)
- [levisteigen.no — Steigenmodellen](https://www.levisteigen.no/utdanning-i-steigen.html)
- [NFK — fellesundervisning Knut Hamsun](https://www.nfk.no/aktuelt/knut-hamsun-vgs-fellesundervisning-pa-narmeste-skole.99955.aspx)
- [Udir — evaluering vekslingsmodeller](https://www.udir.no/tall-og-forskning/finn-forskning/rapporter/evaluering-av-vekslingsmodeller-i-fag--og-yrkesopplaringen/)
