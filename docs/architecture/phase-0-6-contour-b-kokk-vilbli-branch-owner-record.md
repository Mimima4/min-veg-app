# Phase 0–6 Contour B — Kokk Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **BLOCK C + BEDRIFT CLOSED (Vestland)** — relay 15/15; lærebedrift ingest + owner UI schools/employers **OK** 2026-07-24. Vilbli↔Min Veg **FAIL** only Innlandet `34` campus (deferred day-plan 2026-07-25 §C after A+B). Not LIVE until campus DIFF fixed. |
| **Date (UTC)** | 2026-07-24 |
| **Profession slug** | `kokk` (catalog: **Kokk**) |
| **Parent gate** | `phase-0-6-contour-b-vgs-profession-addition-template.md` |
| **Prior slug** | — (greenfield; no rename SQL) |

---

## Product layers (do not collapse)

| Layer | Value | Notes |
|-------|--------|--------|
| **Catalog profession** | **Kokk** (`kokk`) | Chef/cook — **not** waiter as catalog title |
| **Vilbli school VG2** | Kokk- og servitørfag (`V.RMKOS2----`) | Programme name at school — includes servitør sibling column |
| **Primary fagbrev** | Kokkfaget (`RMKOK3` / `KOKKFAGET`) | + Servitør, Ernæringskokk, Ferskvarehandler on kolonne-3 |
| **NAV vacancy leaf** | `reiseliv-og-mat.kokk` | navTitle **Kokk**; occupationLabel **Kokk**; level1 **Reiseliv og mat** |
| **Arbeidsplassen** | `reiseliv-og-mat.kokk` | Same labels as NAV snapshot (2026-07-24) |

---

## Signed Vilbli contour (`V.RM` — Restaurant → Kokk- og servitørfag school chain)

| Step | Vilbli label | Course tokens |
|------|----------------|---------------|
| VG1 | Restaurant- og matfag | `V.RMRMF1----` |
| VG2 | Kokk- og servitørfag | `V.RMKOS2----` |

**Kolonne-3 / bedrift** (Påbygging excluded):

| VIGO | Label | Lærefag code | Ingest |
|------|--------|--------------|--------|
| `RMKOK3` | Kokkfaget (**primary**) | `KOKKFAGET` | Batch 0 |
| `RMSER3` | Servitørfaget | `SERVITORFAGET` | Batch 7 |
| `RMEKF3` | Ernæringskokkfaget | `ERNAERINGSKOKKFAGET` | Batch 7 |
| `RMFVF3` | Ferskvarehandlerfaget | `FERSKVAREHANDLERFAGET` | Batch 7 |

**Product policy:**

| Show | Do not show |
|------|-------------|
| Kokk- og servitørfag school chain only (`RMKOS2`) | Other VG2 columns as this profession |
| Kolonne-3 / bedrift from **this** chain | National master list of all `V.RM` branches |
| Catalog title **Kokk** | Catalog title Servitør; parentheses like «Kokk (Servitør)» |
| | V.BA VG2 cross-profession programme switch |

---

## Reference URLs

| Purpose | URL |
|---------|-----|
| National strukturkart (p2) | https://www.vilbli.no/nb/no/strukturkart/V.RM/kokk-og-servitorfag-fag-og-timefordeling?kurs=V.RMRMF1----_V.RMKOS2----&side=p2 |
| **Pipeline ingest** (per fylke) | `.../restaurant-og-matfag-skoler-og-laerebedrifter?kurs=V.RMRMF1----_V.RMKOS2----&side=p5` |

---

## Materialization slugs (VG1/VG2 per fylke)

| Node | Slug pattern | Title |
|------|----------------|-------|
| VG1 | `kokk-vg1-restaurant-{countySlug}` | VG1 Restaurant- og matfag |
| VG2 | `kokk-vg2-kokk-servitor-{countySlug}` | VG2 Kokk- og servitørfag |

Trøndelag (`50`): `kokk-vg1-restaurant-trondelag`, `kokk-vg2-kokk-servitor-trondelag`.

Path family slug: `kokk-vrm-kokk-servitor`.

---

## Lærebedrift ingest

| Field | Value |
|-------|--------|
| Primary `larefag_code` | `KOKKFAGET` |
| VIGO api query | `RMKOK3` |
| Roster | `data/larebedrift/kolonne3-rosters/kokk.json` |
| Roster verify | **PASS** 2026-07-24 — 4 fag (`RMKOK3`, `RMSER3`, `RMEKF3`, `RMFVF3`) via path-def V.RM URL |
| Mapping smoke | **PASS** — kokk VG3 slug + URL → `KOKKFAGET` / `SERVITORFAGET` |
| Cron batch | Primary `KOKKFAGET` in batch **0**; siblings batch **7** (roster) |
| Prod ingest (2026-07-24) | `KOKKFAGET` **755** · `SERVITORFAGET` **187** · `ERNAERINGSKOKKFAGET` **272** · `FERSKVAREHANDLERFAGET` **44** upserted (godkjent ∩ Brreg) |

---

## Owner decisions (locked by algorithm + owner display)

| # | Question | Status |
|---|----------|--------|
| P-1 | Vilbli contour | **OK — Restaurant → Kokk- og servitørfag** (`RMKOS2`) |
| P-2 | VG3/bedrift list | **OK — kolonne-3 for Restaurant→Kokk chain** |
| P-3 | NAV matcher | **OK —** `reiseliv-og-mat.kokk`, navTitle **Kokk** |
| P-4 | V.BA VG2 switch | **N/A — not in V.BA shared VG1 switcher** |
| P-5 | Empty bedrift | **OK — godkjent-only truth** |
| P-6 | Contour A | **None** — Contour B only for all counties |
| Catalog name | **Kokk** (en: Cook) | Owner 2026-07-24 |

---

## NAV / Arbeidsplassen proof (live snapshot 2026-07-24)

| Field | Value |
|-------|--------|
| `navStyrkCode` | `reiseliv-og-mat.kokk` |
| `level1Label` | Reiseliv og mat |
| `occupationLabel` | Kokk |
| `navTitle` (outcome map primary) | Kokk |

Secondary outcome rows (same path family, `catalogProfessionSlug` stays `kokk`):

| Vilbli sibling | navStyrkCode | navTitle |
|----------------|--------------|----------|
| Servitørfaget | `reiseliv-og-mat.restaurant` | Restaurant |
| Ernæringskokkfaget | `reiseliv-og-mat.kokk` | Kokk |
| Ferskvarehandlerfaget | `industri-og-produksjon.matproduksjon-og-næringsmiddelarbeid` | Matproduksjon og næringsmiddelarbeid |

---

## Profession-local relay (2026-07-24)

| Step | Result |
|------|--------|
| Production `--profession kokk` | **15/15** `ingested` / `contour_b_partial` (no ABORT counties — every pipeline fylke has local VG2) |
| Readiness on write | `missing_programme_rows` (Contour B partial path) |

---

## Vilbli ↔ Min Veg (map pins) — 2026-07-24

**Method:** county `side=p5` `vb_map_data` VG2 local pins only (not `html_stage_block`-only) for `V.RMRMF1----_V.RMKOS2----` vs active PSA on `kokk-vg2-kokk-servitor-*`. Identity: pipeline `classifyInstitutionMatchForVilbliSchool` + **campus polarity** (`Sør`≠`Nord`). Notes list **every** school pair (no empty «count+identity»).

**Totals:** Vilbli local VG2 pins **70** · Min Veg active VG2 PSA institutions **70** · continuation rows for `kokk` **0**.

**Overall: FAIL** — **14 MATCH**, **1 DIFF**, **0 ABORT-expected**.

Legend in Notes: plain name = exact; `A≈B` = same school, NSR/Vilbli spelling variant; `CAMPUS A≠B` = wrong campus (DIFF).

| County | Label | Vilbli local VG2 | Min Veg active VG2 PSA | Verdict | Notes |
|--------|-------|------------------|------------------------|---------|-------|
| 03 | Oslo | 2 | 2 | MATCH | Akademiet Norsk Restaurantskole≈Akademiet Norsk restaurantskole Sti (`913711793`); Etterstad videregående skole (`974591022`) |
| 11 | Rogaland | 4 | 4 | MATCH | Bryne vidaregåande skule (`913385632`); Hauge videregående skole as→Hauge videregående skole (`916612095`); Jåttå (`990183449`); Karmsund (`974624591`) |
| 15 | Møre og Romsdal | 6 | 6 | MATCH | Borgund (`974576554`); Herøy (`974576481`); Hustadvika (`974576708`); Kristiansund (`974576589`); Rauma (`974576562`); Ørsta (`974576597`) |
| 18 | Nordland | 6 | 6 | MATCH | Bodø (`974621223`); Brønnøysund (`974621401`); Hadsel (`974621037`); Mosjøen (`974621355`); Polarsirkelen (`974621304`); Vest-Lofoten (`974621169`); north OOC=0, continuations=0 |
| 31 | Østfold | 5 | 5 | MATCH | Glemmen (`974544482`); Halden (`974544563`); Kirkeparken (`974544539`); Mysen (`974544512`); Stiftelsen Østerbo (`974826704`) |
| 32 | Akershus | 5 | 5 | MATCH | Lørenskog (`974587610`); Nannestad (`988084948`); Rosenvilde (`974587866`); Sørumsand (`874587842`); Vestby (`974587815`) |
| 33 | Buskerud | 5 | 5 | MATCH | Buskerud (`974606216`); Gol (`974606194`); Hønefoss (`974605929`); Kongsberg (`974605996`); Åssiden (`974605937`) |
| 34 | Innlandet | 5 | 5 | **DIFF** | Hadeland (`998513448`); **CAMPUS** Lillehammer Avdeling Sør≠avd Nord (`974597241` — NSR Sør `874597252` has 0 kokk PSA); Raufoss (`974597330`); Sentrum (`974571943`); Storhamar (`974571935`) |
| 39 | Vestfold | 3 | 3 | MATCH | Greveskogen (`974574993`); Sandefjord (`974575019`); Thor Heyerdahl (`974575027`) |
| 40 | Telemark | 1 | 1 | MATCH | Hjalmar Johansen videregående skole (`974568071`) |
| 42 | Agder | 4 | 4 | MATCH | Flekkefjord Studiested Kvinesdal (`974595095`); Mandal (`974595125`); Sam Eyde (`974573814`); Tangen (`874595152`) |
| 46 | Vestland | 7 | 7 | MATCH | Fitjar (`974557630`); Fusa (`874557552`); Måløy (`974571188`); Sandsli (`974557142`); Sogndal (`974571056`); Sotra (`974557568`); Voss (`916031858`). **Vilbli structure-only (ложь):** `Førde vidaregåande skule` [`1000113`] in `html_stage_block` only — **not** on VG2 map tilbud; Min Veg correctly has no Førde PSA |
| 50 | Trøndelag | 9 | 9 | MATCH | Byåsen (`984477112`); Fosen (`974557975`); Guri Kunna (`974558009`); Levanger (`974560704`); Melhus (`874558362`); Ole Vig (`974560720`); Steinkjer (`974560690`); Strinda (`996772810`); Ytre Namdal (`974560739`) |
| 55 | Troms | 3 | 3 | MATCH | Ishavsbyen (`915553354`); Senja≈Senja avd Finnfjordbotn (`974546698`); Stangnes Rå≈Stangnes Rå avd Rå (`974056925`); north OOC=0, continuations=0 |
| 56 | Finnmark | 5 | 5 | MATCH | Alta / Àlttà≈Alta (`974622750`); Hammerfest / Hámmerfeasta≈Hammerfest (`874622702`); Kirkenes / Girkonjárgga≈Kirkenes (`974622726`); Sami…/Samisk Kautokeino≈Samisk videregående skole og reindriftsskole (`974759896`); Vardø / Várggáidt≈Vardø (`974622777`); north OOC=0, continuations=0 |

### North `{18,55,56}` continuations

`vgs_vilbli_home_vg2_continuations` for `kokk`: **0 rows**. Vilbli home-page out-of-county VG2 map pins also **0** for all three (local VG2 present everywhere → P-7 allowlist empty is expected / honest).

### DIFF follow-up (not a manual PSA plug)

**Root cause (reproduced):** Vilbli pin `Lillehammer … Avdeling Sør` → NSR has both `avd Nord` and `avd Sør`. Matcher scores both `core_name_match` 0.9. Campus tie-break via `avd_location` **fails for `Sør`**: `avdLocationMatchesInstitution` drops tokens shorter than 4 chars (`sør`/`sor` = 3; `nord` = 4 works). Falls through to `multi_avd_identity`, then `pickInstitutionsForPsaEmission` alphabetically keeps **Nord** first → wrong PSA. Same class of bug for any short campus token (Sør/Øst/…).

**Systemic fix (A+C — согласовано Composer + Grok 4.5; short-token отвергнут):** **не сейчас.** В плане на **2026-07-25** пункт **C** — выполнять **только после** day-plan A (Vilbli path snapshot) и B (Entur 2×/week). См. `docs/ops/day-plan-2026-07-25-recompute-offline-truth.md` §C.

### Vilbli tilbud integrity (Kokk) — I-1…I-3 structure-only check

**YES — Vilbli structure-only («ложь») on site:** Vestland `46` — `Førde vidaregåande skule` [`1000113`], source `html_stage_block`, **absent** from county VG2 `vb_map_data` tilbud. Same class as anleggsteknikk structure-superset / Agder html-only cases. Min Veg active PSA for Vestland = **7** map schools only (Førde not written — offering gate correct). Other 14 fylke: structureOnly=0 for VG2. North OOC pins=0. Separate Min Veg DIFF remains Innlandet campus Sør≠Nord.

---

## Block C / product proof (2026-07-24)

| Check | Result |
|-------|--------|
| No browser E2E for `kokk` in repo | Confirmed — only painter / maskin-og-kranforer / mechanic / steigen e2e scripts |
| Closest automated: `npm run smoke:contour-b` | **PASS** |
| Closest automated: `npm run smoke:route-truth` | **PASS** |
| Vestland `46` availability (service-role) | VG1 active PSA institutions **8**, VG2 **7**; `profession_program_links` has VG1+VG2 → `programme_selection` **can resolve** from availability_truth |
| Owner UI | **CLOSED** — Vestland schools + bedrift (Kokkfaget employers) owner verified 2026-07-24 |

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffold (path def, materialization, roster, NAV map) | **Done** |
| Lærebedrift verify + prod ingest (4 fag) | **Done** 2026-07-24 — ingest + owner UI bedrift **OK** |
| Catalog seed SQL | **Done** (prod applied with relay prep) |
| `npm run build` + scheduler bundle | **Done** (pre-relay) |
| Relay dry-run `--profession kokk` | **Done** |
| Relay production (profession-local) | **Done** — 15/15 ingested 2026-07-24 |
| Vilbli ↔ Min Veg county table | **FAIL** — Innlandet campus DIFF (see table) |
| Block C E2E / prod sign-off | **Done (Vestland)** — schools + bedrift 2026-07-24; county table still **FAIL** Innlandet until day-plan §C |

---

## Code touchpoints (scaffold)

| Artifact | Location |
|----------|----------|
| Path definition | `scripts/vgs-path-definitions.mjs` — `KOKK_PATH_DEFINITION` |
| Materialization | `scripts/vgs-programme-materialization-planner.mjs` |
| Operational eligibility | `src/lib/vgs/contour-b-operational-eligibility.ts` |
| Vilbli branch config | `src/lib/vgs/vilbli-branch-config.ts` |
| Kolonne-3 roster | `data/larebedrift/kolonne3-rosters/kokk.json` |
| Primary route lærebedrift | `src/lib/larebedrift/primary-route-larebedrift-pilot.ts` (Phase 12) |
| Path family + NAV map | `src/lib/nav/path-family-slug.ts`, `path-family-outcome-nav-map.ts` |
| Arbeidsplassen STYRK | `src/lib/nav/catalog-profession-arbeidsplassen-styrk.ts` |
