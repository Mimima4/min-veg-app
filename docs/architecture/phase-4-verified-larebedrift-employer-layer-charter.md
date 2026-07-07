# Phase 4 — Verified Lærebedrift (Apprenticeship Employer) Layer — Charter (DRAFT)

| Field | Value |
|-------|--------|
| **Status** | **LIVE (2026-07-04)** — P1 ingest + P3b for all four VGS catalogue professions; see **§ Live status** |
| **Scope** | Verified **godkjente lærebedrifter** for `apprenticeship_step` on primary routes (pilot professions) and veksling / curated-regional routes |
| **Design gate (P0)** | `phase-4-verified-larebedrift-employer-layer-design-gate.md` (§8 decisions RESOLVED) |
| **Parents** | `route-engine-master-spec.md`, `phase-4-route-mobile-api-contract-v1.md`, `phase-4-nordland-steigen-carpenter-veksling-pilot-charter.md` (partially superseded) |
| **Ops authority** | `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` (ingest is **not** auto on page load / deploy) |

---

## Live status (2026-07-04)

| Phase | Status |
|-------|--------|
| **P1** ingest + `larebedrift_truth` | **LIVE** — tømrer + rørlegger + 11 elektro + 10 kjøretøy fag; monthly batched cron; owner-verified nationwide |
| **P3b** primary-route apply | **LIVE** — `carpenter`, `electrician`, `mechanic`, `plumber` (`primary-route-larebedrift-pilot.ts`) |
| **P3** transport reachability for employers | **Deferred** — kommune ordering only |
| **P4** UI | **Partial** — Fagvalg/bedrift dropdown + outcome hint; expandable orgnr panel TBD |
| **P5** fourth VGS profession + V.BA VG2 gate | **CLOSED (2026-07-04)** — `plumber` live; V.BA cross-profession programme switch (carpenter ↔ plumber) live on prod |

**D-1 amendment:** ordinary Vilbli-derived apprenticeship tails surface **godkjent-only** verified employers for all four pilot professions. **Empty employer list = honest truth** when Finnlærebedrift has no godkjent rows for that lærefag (never pad with potensielle or placeholders). Steigen veksling remains curated-variant scoped.

### Empty bedrift list (owner binding 2026-07-04)

| Situation | Product behaviour | Classification |
|-----------|-------------------|----------------|
| Fag in Fagvalg; **zero** godkjent lærebedrifter in `larebedrift_truth` for that `larefag_code` | Show **empty** bedrift selection with copy **«Ingen godkjente lærebedrifter for dette faget ennå.»** (`route-steps-panel.tsx`) | **Truth** — we publish only godkjent |
| Fag not yet in ingest roster but godkjent employers exist nationally | Ops may add fag to roster + run ingest — **optional hygiene**, not P4-MCT-1 “hole closure” | Roster expansion gate |
| Potensielle / unverified employers in source | **Exclude** — never surface | Invariant (§3) |

---

Apprenticeship employer identity in routes is today either:

- a **generic placeholder** (`Lokal opplæringsbedrift (Steigen)`) for the Steigen veksling pilot, held back by the pilot charter §4.1 Tier 2 **stop rule**; or
- the Vilbli **bedrift tail** for ordinary availability-truth routes (structure/outcome only — **not** a curated, verified employer roster).

There is **no general, auditable layer of verified (godkjent) lærebedrifter** that can be (a) shown in the **selection filter** and (b) **defaulted / ordered** in the proposed route by our existing route-building rules (geography-first + travel realism + relocation + transport), server-side.

**Owner direction (2026-06-25):** if applied, this mechanism must apply across **all communes**, using **only accepted/verified (godkjent)** employers — the filter shows all verified; the proposed route honors our route rules. Production-grade and automated; **no temporary placeholder as the end state**.

---

## 2. Scope (binding) — from resolved design-gate §8

| Dimension | In scope (P1–P4) | Out of scope (this charter) |
|-----------|------------------|------------------------------|
| **Roster coverage (D-4)** | **Multi-fag nationwide** (tømrer + rørlegger + eleven elektro + ten kjøretøy kolonne-3) | Potensielle employers; **mandatory** bedrift rows when godkjent count is zero |
| **Route surfacing (D-1)** | **Primary-route pilot** — all four VGS catalogue professions + veksling / curated-regional | Fifth+ catalogue profession until explicit gate |
| **Source / access (D-2, amended 2026-06-29)** | **Finnlærebedrift open API** `api.utdanning.no/finnlarebedrift` (**primary, keyless**, Udir-recommended) · **Vilbli relay** / **NLR** / **manual seed** (secondary) · **Brønnøysund** for orgnr identity — all trace to **VIGO** | Vigo bedrift portal (closed); live external calls at runtime |
| **Geography (D-3, amended 2026-06-29)** | Registered kommune + fylke from the API; county from kommunenummer; coords nullable (enrich via detail/Brønnøysund later) | True worksite coordinates as a hard requirement |
| **UI (D-5)** | **Name in option title**; **orgnr + opplæringskontor** in expandable info/source | Inline orgnr clutter; name-only with no audit trail |
| **Governance (D-6)** | **This standalone charter** + own ops gates | Folding into Steigen pilot charter |

**Reconciliation (D-1 × D-4, amended 2026-07-04):** roster is multi-fag nationwide; primary-route surfacing is live for **four** VGS catalogue professions. **V.BA VG2 cross-profession programme switch** (carpenter ↔ plumber) closed 2026-07-04 — see `VGS_OPERATIONAL_RUNNERS.md`.

---

## 3. Truth source & identity (auditable)

| Source | Role |
|--------|------|
| **VIGO** | Upstream **system of record** for godkjente lærebedrifter + lærekontrakter (fylkeskommune-maintained). Not accessed directly; reaches us via Finnlærebedrift / NLR / Vilbli (all import from VIGO). |
| **Finnlærebedrift open API** (`api.utdanning.no/finnlarebedrift`) | **Primary ingest** — keyless (NLOD), Udir-recommended. `/bedrift` filters: `sporring_type=bedrifter_godkjente` (godkjent only, excludes potensielle), `fag` (lærefag codes, Tømrerfaget=`BATMF3`), `sted` (kommune/fylke), paginated. Returns orgnr, navn, fylke/kommune, godkjenninger. **Complete** godkjent set (incl. without a current lærekontrakt). |
| **Udir NLR API** (`data-nlr.udir.no/v4`) | Secondary. Subset (godkjent **with** a running contract); needs a basic-auth key (HTTP 401 without). Has coordinates + per-fag `Programområde`. Not needed given the open API. |
| **Vilbli oversikt lærebedrifter/opplæringskontor** | Secondary fallback via our existing relay (imports from Vigo bedrift). |
| **Brønnøysundregistrene (Enhetsregisteret)** | Canonical org identity by **orgnr** (name, kommune, deletion status) — open API `data.brreg.no/enhetsregisteret/api/enheter/<orgnr>` |

**Identity key:** `orgnr` (canonical). Display name from Brønnøysund/Vigo; verification = **godkjent** for the requested `lærefag` only (fagkode-aware, old + new per fagfornyelse).

**Hard exclusion:** "**potensielle** lærebedrifter" (relevant employees but **not** godkjent) MUST NOT enter route truth.

**Worked example (Steigen `1848`, Tømrerfaget):** `ÅLSTADØYA TRELAST AS` (orgnr `995810166`), godkjent for Tømrerfaget, member of `OFOTEN FLERFAGLIGE OPPLÆRINGSKONTOR (OFO)`.

---

## 4. Truth & evidence gates (before any write)

| Gate | Requirement | Status |
|------|-------------|--------|
| E-1 | Source = **owner Vigo CSV export** (dated, archived), not scraped | **OPEN** — needs first export |
| E-2 | Every row **orgnr-normalized** against Brønnøysund API; mismatch → reject | **OPEN** — P2 |
| E-3 | `verification_status = godkjent` for the **specific fag**; potensielle excluded | **OPEN** — ingest rule |
| E-4 | Row carries `source_reference_url`, `source_system`, `updated_at` (refreshable, timestamped) | **OPEN** — schema P1 |
| E-5 | No LOSA / no Vilbli school PSA rows created for employers | **OPEN** — invariant |
| E-6 | `NOT_READY_FOR_APPLY` unchanged; no Phase 2 RLS apply | **OPEN** — unchanged |

**Stop rule:** if a `(fag, county)` cell has no auditable godkjent rows from the owner export → that cell stays on the **existing behavior** (Steigen curated entry / Vilbli tail); **no** synthetic or "potensielle" employers.

---

## 5. Proposed data model (P1 target)

Dedicated truth table, **separate** from `programme_school_availability` (no school↔employer mixing):

```
larebedrift_truth (working name)
  org_number            text  (canonical id)
  legal_name            text
  display_name          text  (nullable; preferred display)
  county_code           text
  municipality_code     text
  latitude / longitude  numeric (nullable; geocoded for travel realism)
  larefag_code          text  (Tømrerfaget; old + new fagkode aware)
  opplaringskontor_name text  (nullable; contact channel)
  opplaringskontor_org  text  (nullable)
  verification_status   text  ("godkjent" only is publishable)
  source_reference_url  text
  source_system         text  ("vigo" | "brreg")
  is_active             boolean
  updated_at            timestamptz
```

Route read shape (unchanged contract): `apprenticeship_step.apprenticeship_options[]` with `entity_type: "employer"`, `employer_municipality`, `employer_website`, `employer_source_note` (already in `route-types.ts`).

---

## 6. Route-engine integration (P3 target)

1. **Filter / constructor list:** `apprenticeship_options[]` = **all** `godkjent` employers in resolved geography scope (per relocation willingness), server-provided.
2. **Default + order:** server applies geography-first + travel realism + **transport reachability (extended to employers)** at **recompute/create**; default = top-ranked. Identical JSON for web RSC and native API (mobile must **not** re-sort / call Entur).
3. **Outcome unchanged:** NAV fag / profession-branch scope unaffected — this layer changes **who**, not the **outcome**.
4. **Boundary (D-1, amended 2026-07-03):** surfacing on **primary routes** for pilot professions (`primary-route-larebedrift-pilot.ts`) plus **veksling / curated-regional** steps.

> **Known prerequisite (risk):** `buildInstitutionReachability` + kommune transport sort exist **only for school institutions** today. Defaulting employers by transport requires **extending the reachability model to employers** (employer kommune from D-3). This is real code under P3 and is subject to web/native parity + no-logic-regression gates.
>
> **P3 staging (2026-06-30):** the engine orders **by kommune**, so step 1 orders verified employers **geography-first** (kommune-centroid distance from home, deterministic orgnr tiebreak) — baked into the stored snapshot `selected_steps_payload`, so web RSC and native API read identical JSON (mobile never re-sorts; parity by construction). Extending **transport reachability** to employers (Entur kommune-hub corridors) is a separate, gated sub-step.

---

## 7. Ops gate (ingest)

Mirror the Contour B model in `VGS_OPERATIONAL_RUNNERS.md`, adapted to D-2:

- source = **Finnlærebedrift API** (primary) / NLR / Vilbli / manual seed — all from VIGO; **no scraping** of private SPA APIs;
- ingest (`scripts/ingest-larebedrift.mjs`) is **source-agnostic**: source → resolve fag → optional Brønnøysund verify → upsert → soft-retire;
- ingest is **scheduled or manual**, **never** on page load / recompute / deploy;
- **Automated refresh (amended 2026-07-03):** **Vercel Cron** — seven batched `GET /api/internal/larebedrift/run-ingest/{0..6}` on the 1st (`scheduled-larebedrift-ingest-fags.ts`); batch 0 tømrer, 1–3 eleven elektro, 4–6 ten kjøretøy. Manual all-fag: `GET /run-ingest`. Still **never** on page load / recompute.
- expansion-gate analog: a `(lærefag, county)` cell is only "live" after **dry-run → ingest → product E2E proof**;
- refresh cadence: **monthly** cron (above); `--dry-run` via `?dryRun=true` or the CLI;
- regression smoke (`verify:larebedrift`) after pipeline changes.

---

## 8. Implementation phases

| Phase | Deliverable | Gate |
|-------|-------------|------|
| **P0** | Design gate + owner decisions (§8 RESOLVED) + **this charter** | owner sign-off (§11) |
| **P1** | `larebedrift_truth` table + ingest from **owner Vigo CSV** (carpenter nationwide), orgnr-normalized vs Brønnøysund — spec: `phase-4-verified-larebedrift-employer-layer-p1-ingest-spec.md` | dry-run + DB snapshot; E-1…E-4 |
| **P2** | Identity normalization (orgnr ↔ Brønnøysund) + employer **kommune** geo. **Note (2026-06-30):** the route engine orders **by kommune** (geography = `municipality_geo_points` centroids; transport = kommune-hub corridors) — neither uses per-row coordinates, so kommune from P1 already satisfies ordering. Per-row lat/long + kommune-name display column **deferred** (map/UX nicety; not an ordering prerequisite). | audit script |
| **P3** | Route default/order on primary + veksling steps (kommune ordering live; transport-reachability-for-employers deferred) | parity web/native |
| **P4** | UI: Fagvalg/bedrift filter (live); name in title + orgnr/opplæringskontor expandable (partial) | E2E |
| **P5** | **`plumber`** isolated profession + ingest; V.BA VG2 gate (deferred) | ops runner + smoke |

Steigen stays on the curated single entry **until P1 ingest covers it**, then migrated (no double truth).

---

## 9. Success criteria (charter closure)

- [ ] Carpenter children (multi-commune) see **all godkjent** lærebedrifter in the apprenticeship filter for in-scope (veksling/curated-regional) routes
- [ ] Proposed/default employer follows **geography + travel realism + transport** (server truth), identical web vs native
- [ ] Every published employer is **godkjent for Tømrerfaget**, orgnr-verified, source-linked; **zero** potensielle rows
- [ ] No LOSA badge; no employer rows in `programme_school_availability`
- [ ] Steigen generic placeholder **replaced** by verified ingest rows (no double truth)
- [ ] `npm run build` green; route/idempotency smokes green

---

## 10. Explicit non-goals

- Ingesting **potensielle** (non-godkjent) employers into route truth
- Live external calls at runtime (master-spec invariant)
- Replacing the NAV/Vilbli **outcome** scope
- Mixing employer truth into `programme_school_availability`
- Auto-ingest on page load / deploy
- Surfacing verified employers for **non-pilot** catalogue professions (deferred)

---

## 11. Owner approval

| # | Decision | Status |
|---|----------|--------|
| A-1 | Design-gate §8 decisions (D-1…D-6) | **RESOLVED** — chat 2026-06-25 |
| A-2 | Standalone charter scope (§2) approved | **OK** — chat 2026-06-25 |
| A-3 | **P1** source-agnostic foundation + **P3b** primary-route consumption | **LIVE** — three pilot professions; see § Live status |
| A-4 | Source decision | **RESOLVED** 2026-06-29 — Udir replied recommending the **open Finnlærebedrift API** (keyless, complete); NLR key **not needed**. `utdanning` source built; Steigen `1848` real ingest = **2 godkjent** rows verified. |

**Sign-off:** _____________ Date: _____________

---

## 12. References

- `phase-4-verified-larebedrift-employer-layer-design-gate.md` — design gate + resolved decisions
- `route-engine-master-spec.md` — §3 geography/travel realism, §4.X truth contract, NAV/Vilbli boundary
- `phase-4-route-mobile-api-contract-v1.md` — transport server-only, options order, web/native parity
- `phase-4-nordland-steigen-carpenter-veksling-pilot-charter.md` — §4.1 Tier 2 stop rule (now satisfiable via this layer)
- `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` — ops gate model
- Brønnøysund Enhetsregisteret API — `https://data.brreg.no/enhetsregisteret/api/enheter/<orgnr>`
- Vigo bedrift (NFK) — `https://www.nfk.no/tjenester/skole-og-opplaring/opplaring-i-bedrift/larebedrift/vigo-bedrift/`
- Utdanning.no Finn Lærebedrift (cross-check) — `https://utdanning.no/finnlarebedrift/`
