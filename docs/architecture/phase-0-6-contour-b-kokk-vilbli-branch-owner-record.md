# Phase 0–6 Contour B — Kokk Vilbli branch owner record

| Field | Value |
|-------|--------|
| **Status** | **OPEN** — scaffold + **catalog seed applied** prod DB 2026-07-24 (`kokk` active). Relay dry-run via Vercel API returned `unsupported_profession` until deployed code includes `kokk`. Next: deploy → dry-run → production profession-local relay → E2E. |
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

## Closure checklist (not done)

| Step | Status |
|------|--------|
| Code scaffold (path def, materialization, roster, NAV map) | **Done** |
| Catalog seed SQL | **Pending apply** — `scripts/sql/seed-profession-kokk-catalog.sql` |
| `npm run build` + scheduler bundle | **Pending** |
| Relay dry-run `--profession kokk` | **Pending** |
| Relay production (full matrix policy) | **Pending** |
| Block C E2E / prod sign-off | **Pending** |

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
