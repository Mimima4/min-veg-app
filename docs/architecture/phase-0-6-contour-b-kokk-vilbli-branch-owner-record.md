# Phase 0–6 Contour B — Kokk Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **RELAY + VILBLI↔MIN VEG — FAIL (1 DIFF)** — catalog seed + profession-local production relay **15/15** `ingested`/`contour_b_partial` 2026-07-24; Vilbli map↔PSA **14/15 MATCH**, **Innlandet `34` DIFF** (campus mispick). Block C auto-proof Vestland OK; owner UI still pending. |
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
| Cron batch | Primary batch 0; siblings batch 7 |

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

**Method:** county `side=p5` `vb_map_data` VG2 local pins only (not `html_stage_block`-only) for `V.RMRMF1----_V.RMKOS2----` vs active PSA on `kokk-vg2-kokk-servitor-*` (`programme_in_school`, `verified`/`needs_review`). Identity via NSR orgnr / Contour B name matcher.

**Totals:** Vilbli local VG2 pins **70** · Min Veg active VG2 PSA institutions **70** · continuation rows for `kokk` **0**.

**Overall: FAIL** — **14 MATCH**, **1 DIFF**, **0 ABORT-expected**.

| County | Label | Vilbli local VG2 | Min Veg active VG2 PSA | Verdict | Notes |
|--------|-------|------------------|------------------------|---------|-------|
| 03 | Oslo | 2 | 2 | MATCH | count+identity 1:1 |
| 11 | Rogaland | 4 | 4 | MATCH | count+identity 1:1 |
| 15 | Møre og Romsdal | 6 | 6 | MATCH | count+identity 1:1 |
| 18 | Nordland | 6 | 6 | MATCH | count+identity 1:1; north OOC pins=0, continuations table=0 |
| 31 | Østfold | 5 | 5 | MATCH | count+identity 1:1 |
| 32 | Akershus | 5 | 5 | MATCH | count+identity 1:1 |
| 33 | Buskerud | 5 | 5 | MATCH | count+identity 1:1 |
| 34 | Innlandet | 5 | 5 | **DIFF** | Counts equal, but campus wrong: Vilbli map pin **Lillehammer … Avdeling Sør**; active PSA is **avd Nord** (`974597241`). NSR also has **avd Sør** (`874597252`) with **zero** kokk PSA rows. Pipeline `core_name_match` mispicked Nord. |
| 39 | Vestfold | 3 | 3 | MATCH | count+identity 1:1 |
| 40 | Telemark | 1 | 1 | MATCH | count+identity 1:1 |
| 42 | Agder | 4 | 4 | MATCH | count+identity 1:1 |
| 46 | Vestland | 7 | 7 | MATCH | count+identity 1:1 |
| 50 | Trøndelag | 9 | 9 | MATCH | count+identity 1:1 |
| 55 | Troms | 3 | 3 | MATCH | count+identity 1:1; north OOC=0, continuations=0 (Senja/Stangnes resolved to NSR avd campuses) |
| 56 | Finnmark | 5 | 5 | MATCH | count+identity 1:1; north OOC=0, continuations=0 |

### North `{18,55,56}` continuations

`vgs_vilbli_home_vg2_continuations` for `kokk`: **0 rows**. Vilbli home-page out-of-county VG2 map pins also **0** for all three (local VG2 present everywhere → P-7 allowlist empty is expected / honest).

### DIFF follow-up (not a manual PSA plug)

Fix via pipeline NSR campus resolution for Lillehammer Sør (prefer `874597252` / avd location), then profession-local dry-run + production relay for county `34` — **do not** hand-toggle `is_active`.

---

## Block C / product proof (2026-07-24)

| Check | Result |
|-------|--------|
| No browser E2E for `kokk` in repo | Confirmed — only painter / maskin-og-kranforer / mechanic / steigen e2e scripts |
| Closest automated: `npm run smoke:contour-b` | **PASS** |
| Closest automated: `npm run smoke:route-truth` | **PASS** |
| Vestland `46` availability (service-role) | VG1 active PSA institutions **8**, VG2 **7**; `profession_program_links` has VG1+VG2 → `programme_selection` **can resolve** from availability_truth |
| Owner UI | **Still required** — recompute kokk route for a Vestland child; confirm VG1/VG2 school pickers |

---

## Closure checklist

| Step | Status |
|------|--------|
| Code scaffold (path def, materialization, roster, NAV map) | **Done** |
| Catalog seed SQL | **Done** (prod applied with relay prep) |
| `npm run build` + scheduler bundle | **Done** (pre-relay) |
| Relay dry-run `--profession kokk` | **Done** |
| Relay production (profession-local) | **Done** — 15/15 ingested 2026-07-24 |
| Vilbli ↔ Min Veg county table | **FAIL** — Innlandet campus DIFF (see table) |
| Block C E2E / prod sign-off | **Partial** — smokes + Vestland truth OK; **owner UI pending** |

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
