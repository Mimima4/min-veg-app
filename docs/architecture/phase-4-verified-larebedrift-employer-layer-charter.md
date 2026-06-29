# Phase 4 — Verified Lærebedrift (Apprenticeship Employer) Layer — Charter (DRAFT)

| Field | Value |
|-------|--------|
| **Status** | **DRAFT** — owner decisions resolved 2026-06-25; P1 authorized to scope, no code yet |
| **Scope** | A **verified-source, multi-commune** layer of **godkjente lærebedrifter** for `apprenticeship_step`, surfaced first in **veksling / curated-regional** routes |
| **Design gate (P0)** | `phase-4-verified-larebedrift-employer-layer-design-gate.md` (§8 decisions RESOLVED) |
| **Parents** | `route-engine-master-spec.md`, `phase-4-route-mobile-api-contract-v1.md`, `phase-4-nordland-steigen-carpenter-veksling-pilot-charter.md` (partially superseded) |
| **Ops authority** | `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` (ingest is **not** auto on page load / deploy) |

---

## 1. Problem statement

Apprenticeship employer identity in routes is today either:

- a **generic placeholder** (`Lokal opplæringsbedrift (Steigen)`) for the Steigen veksling pilot, held back by the pilot charter §4.1 Tier 2 **stop rule**; or
- the Vilbli **bedrift tail** for ordinary availability-truth routes (structure/outcome only — **not** a curated, verified employer roster).

There is **no general, auditable layer of verified (godkjent) lærebedrifter** that can be (a) shown in the **selection filter** and (b) **defaulted / ordered** in the proposed route by our existing route-building rules (geography-first + travel realism + relocation + transport), server-side.

**Owner direction (2026-06-25):** if applied, this mechanism must apply across **all communes**, using **only accepted/verified (godkjent)** employers — the filter shows all verified; the proposed route honors our route rules. Production-grade and automated; **no temporary placeholder as the end state**.

---

## 2. Scope (binding) — from resolved design-gate §8

| Dimension | In scope (P1–P4) | Out of scope (this charter) |
|-----------|------------------|------------------------------|
| **Roster coverage (D-4)** | **Carpenter (Tømrerfaget) nationwide** godkjente lærebedrifter | Other fag (P5), multi-fag pilot |
| **Route surfacing (D-1)** | **Veksling / curated-regional** `apprenticeship_step`s only | Ordinary Vilbli-derived apprenticeship tails (later phase) |
| **Source / access (D-2, amended 2026-06-29)** | **Finnlærebedrift open API** `api.utdanning.no/finnlarebedrift` (**primary, keyless**, Udir-recommended) · **Vilbli relay** / **NLR** / **manual seed** (secondary) · **Brønnøysund** for orgnr identity — all trace to **VIGO** | Vigo bedrift portal (closed); live external calls at runtime |
| **Geography (D-3, amended 2026-06-29)** | Registered kommune + fylke from the API; county from kommunenummer; coords nullable (enrich via detail/Brønnøysund later) | True worksite coordinates as a hard requirement |
| **UI (D-5)** | **Name in option title**; **orgnr + opplæringskontor** in expandable info/source | Inline orgnr clutter; name-only with no audit trail |
| **Governance (D-6)** | **This standalone charter** + own ops gates | Folding into Steigen pilot charter |

**Reconciliation (D-1 × D-4):** the **roster** (ingest + `larebedrift_truth`) is built **carpenter nationwide**; **route-engine surfacing** is initially limited to **veksling / curated-regional** steps. Ordinary apprenticeship tails stay Vilbli-derived until a later phase explicitly opens that boundary.

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
4. **Boundary (D-1):** surfacing limited to **veksling / curated-regional** apprenticeship steps for now.

> **Known prerequisite (risk):** `buildInstitutionReachability` + kommune transport sort exist **only for school institutions** today. Defaulting employers by transport requires **extending the reachability model to employers** (employer geo from D-3). This is real code under P3 and is subject to web/native parity + no-logic-regression gates.

---

## 7. Ops gate (ingest)

Mirror the Contour B model in `VGS_OPERATIONAL_RUNNERS.md`, adapted to D-2:

- source = **Udir NLR API** (primary) / **Vilbli relay** (fallback) / **manual seed** — all from VIGO; **no scraping** of private SPA APIs;
- ingest (`scripts/ingest-larebedrift.mjs`) is **source-agnostic**: source → resolve fag → optional Brønnøysund verify → upsert → soft-retire;
- ingest is **manual or scheduled**, **never** on page load / deploy;
- expansion-gate analog: a `(lærefag, county)` cell is only "live" after **dry-run → ingest → product E2E proof**;
- refresh cadence: NLR `endretetter` incremental (or aligned with existing 6-month / Feb–Aug schedule);
- regression smoke (`verify:larebedrift`) after pipeline changes.

---

## 8. Implementation phases

| Phase | Deliverable | Gate |
|-------|-------------|------|
| **P0** | Design gate + owner decisions (§8 RESOLVED) + **this charter** | owner sign-off (§11) |
| **P1** | `larebedrift_truth` table + ingest from **owner Vigo CSV** (carpenter nationwide), orgnr-normalized vs Brønnøysund — spec: `phase-4-verified-larebedrift-employer-layer-p1-ingest-spec.md` | dry-run + DB snapshot; E-1…E-4 |
| **P2** | Identity normalization (orgnr ↔ Brønnøysund) + employer geo (registered kommune + geocode) | audit script |
| **P3** | Route default/order in **veksling/curated-regional** steps; extend transport reachability to employers | parity web/native; no logic regression |
| **P4** | UI: filter shows all verified; name in title + orgnr/opplæringskontor expandable; no LOSA | E2E |
| **P5** | Generalize beyond veksling boundary + multi-fag; scheduled refresh | ops runner + smoke |

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
- Surfacing verified employers in **ordinary** Vilbli apprenticeship tails (deferred past D-1 boundary)

---

## 11. Owner approval

| # | Decision | Status |
|---|----------|--------|
| A-1 | Design-gate §8 decisions (D-1…D-6) | **RESOLVED** — chat 2026-06-25 |
| A-2 | Standalone charter scope (§2) approved | **OK** — chat 2026-06-25 |
| A-3 | **P1** source-agnostic foundation (migration + ingest skeleton + audit) | **OK** — chat 2026-06-25; built behind ops gate, routes do not consume it |
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
