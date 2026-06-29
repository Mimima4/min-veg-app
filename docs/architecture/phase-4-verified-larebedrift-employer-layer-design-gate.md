# Phase 4 — Verified Lærebedrift (Apprenticeship Employer) Layer — Design Gate (DRAFT)

| Field | Value |
|-------|--------|
| **Status** | **DESIGN GATE — DECISIONS RESOLVED (2026-06-25)** (no code yet; §8 decided, P1 may be scoped) |
| **Scope** | Generalize apprenticeship employer selection from a single curated Steigen entry to a **verified-source, all-commune** layer |
| **Supersedes (partially)** | Steigen curated single employer in `src/lib/regional-delivery/steigen-carpenter-veksling-employers.ts` |
| **Parents** | `phase-4-nordland-steigen-carpenter-veksling-pilot-charter.md`, `route-engine-master-spec.md`, `phase-4-route-mobile-api-contract-v1.md` |
| **Ops authority** | `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` (ingest is **not** auto on page load) |

---

## 1. Problem statement

Apprenticeship (`apprenticeship_step`) employer identity is currently either:

- a **generic placeholder** for the Steigen veksling pilot (`Lokal opplæringsbedrift (Steigen)`), held back by the charter §4.1 Tier 2 **stop rule**; or
- the Vilbli **bedrift tail** for ordinary availability-truth routes (structure/outcome only, not a curated verified employer roster).

There is **no general, auditable layer of verified (godkjent) lærebedrifter** that can be:

1. shown in the **selection filter** (constructor list) — **all** verified employers in scope, and
2. **defaulted / ordered** in the proposed route by **our existing route-building rules** (geography-first + travel realism + relocation + transport), server-side.

**Owner direction (2026-06-25):** if this mechanism is applied, it must apply across **all communes**, using **only accepted/verified (godkjent)** employers; the filter shows all verified, the proposed route honors our route rules.

---

## 2. Truth source & identity (auditable)

| Source | Role |
|--------|------|
| **Vigo bedrift** | **System of record** for godkjente lærebedrifter + lærekontrakter; fylkeskommune (NFK et al.) responsible for completeness |
| **Utdanning.no — Finn Lærebedrift** | Public aggregate, refreshed **nightly** from Vigo + Brønnøysundregistrene + NAV Aa-register; per-fag godkjenning + opplæringskontor link |
| **Brønnøysundregistrene (Enhetsregisteret)** | Canonical org identity by **orgnr** (name, type, kommune, address) — open API `data.brreg.no/enhetsregisteret/api/enheter/<orgnr>` |
| **Vilbli oversikt (lærebedrifter/opplæringskontor)** | Secondary confirmation (also imports from Vigo) |

**Identity key:** `orgnr` (canonical). Display name from Brønnøysund/Vigo; verification = **godkjent** for the requested `lærefag` only.

**Exclusions (hard):** "**potensielle** lærebedrifter" (companies with relevant employees but **not** godkjent) MUST NOT enter route truth. Only `godkjent` for the specific fag (and correct fagkode, incl. fagfornyelse old/new) is publishable.

**Worked example (Steigen `1848`, Tømrerfaget):** `ÅLSTADØYA TRELAST AS` (orgnr `995810166`), godkjent for Tømrerfaget, member of `OFOTEN FLERFAGLIGE OPPLÆRINGSKONTOR (OFO)` — currently the only godkjent carpenter lærebedrift registered in Steigen-proper.

---

## 3. Master-spec / contract alignment (binding constraints)

| Rule | Source | Implication for this layer |
|------|--------|----------------------------|
| Runtime reads internal DB only; **no live external source calls** | master spec §4.X | Employers live in **internal DB truth**; Vigo/Utdanning/Brønnøysund accessed only at **ingest** time |
| Geography-first: municipality → fylke → adjacency rings → nationwide | master spec §3 (1–1.2) | Default employer selection follows the same expansion order |
| **Travel realism overrides pure fylke-ring** | master spec §3 (Travel Realism) | Employer default ranked by real travel distance/time, ferry/island constraints — not admin proximity |
| Relocation willingness controls expansion depth (`nei/kanskje/ja`) | master spec §3 (2,4) | Same gate for employer scope |
| Transport sort is **server-only at recompute/create**; mobile must not re-sort / call Entur; effect = default `institution_name` / `options[]` order | mobile contract §«Transport», §8 | Employer **filter = all verified**; **order + default = server truth**; identical JSON for web + native |
| Source-linked, refreshable, timestamped, confidence-aware truth | master spec §4.X (admission realism #9) | Employer rows carry `source_reference_url`, `verification_status`, `updated_at` |
| Ingest is **not** automatic on page load / deploy | `VGS_OPERATIONAL_RUNNERS.md` | New employer ingest is an **ops-gated** manual/scheduled relay |

**Gap found (must be built, not free today):** kommune transport sort + `buildInstitutionReachability` are implemented **only for school institutions** (`programme_selection`, from `AvailabilityTruthRow`, Entur per institution). **Employers are not transport-sorted today.** Applying "transport availability" to employer defaults requires employer **geo** (kommune/coordinates) and an **extension of the reachability model to employers**.

---

## 4. Proposed data model (P1 target — for review)

New dedicated truth table (kept **separate from `programme_school_availability`** to avoid mixing school PSA with employer truth):

```
larebedrift_truth (working name)
  org_number            text  (canonical id)
  legal_name            text
  display_name          text  (nullable; preferred display)
  county_code           text
  municipality_code     text
  latitude / longitude  numeric (nullable; geocoded for travel realism)
  larefag_code          text  (e.g. Tømrerfaget; old + new fagkode aware)
  opplaringskontor_name text  (nullable; contact channel)
  opplaringskontor_org  text  (nullable)
  verification_status   text  ("godkjent" only is publishable)
  source_reference_url  text
  source_system         text  ("vigo" | "utdanning" | "brreg")
  is_active             boolean
  updated_at            timestamptz
```

Route read shape (unchanged contract, filled from truth): `apprenticeship_step.apprenticeship_options[]` with `entity_type: "employer"`, `employer_municipality`, `employer_website`, `employer_source_note` (already in `route-types.ts`).

---

## 5. Route-engine integration (P3 target — for review)

1. **Filter / constructor list:** `apprenticeship_options[]` = **all** `godkjent` employers in the resolved geography scope (per relocation willingness), server-provided.
2. **Default + order:** server applies geography-first + travel realism + transport reachability (extended to employers) at **recompute/create**; default = top-ranked. Identical for web RSC and native API.
3. **Outcome scope unchanged:** NAV fag / profession-branch (master spec NAV/Vilbli boundary) — employer layer changes **who**, not the **outcome**.
4. **Boundary (DECIDED D-1):** verified-employer surfacing applies to **veksling / curated-regional** apprenticeship steps only for now. Ordinary availability-truth (Vilbli-derived) apprenticeship tails are **not** affected until a later phase explicitly opens that boundary.

---

## 6. Ops gate (P-ingest — for review)

Mirror the Contour B model in `VGS_OPERATIONAL_RUNNERS.md`, adapted to the **DECIDED D-2 access path**:

- **Source of record = owner-exported Vigo bedrift list (CSV)** of godkjente lærebedrifter — **no scraping**;
- ingest normalizes each row by **orgnr** against the **Brønnøysund open API** (`data.brreg.no/.../enheter/<orgnr>`) for canonical identity/kommune;
- ingest is **manual or scheduled**, **never** on page load / deploy;
- expansion gate analog: a `(lærefag, county)` pair is only "live" after dry-run → ingest → product E2E proof;
- refresh cadence aligned with owner export availability (e.g. existing 6-month / Feb–Aug schedule);
- regression smoke after pipeline changes.

**Access (DECIDED D-2):** no documented public API for Vigo/Utdanning is required — owner CSV export + Brønnøysund API only. Brønnøysund is an open API (no home-IP relay needed); Vigo data arrives via the owner export, not a live call.

---

## 7. Phasing (proposed)

| Phase | Deliverable | Gate |
|-------|-------------|------|
| **P0** | **This design gate** + owner decisions §8 (**RESOLVED 2026-06-25**) + **charter** `phase-4-verified-larebedrift-employer-layer-charter.md` | owner sign-off |
| **P1** | `larebedrift_truth` table + ingest from **owner Vigo CSV** for **carpenter (Tømrerfaget) nationwide** (D-4), orgnr-normalized vs Brønnøysund (D-2) | dry-run + DB snapshot |
| **P2** | Identity normalization (orgnr ↔ Brønnøysund) + employer geo (**registered kommune + geocode**, D-3) | audit script |
| **P3** | Route-engine default/order in **veksling / curated-regional steps only** (D-1); extend transport reachability to employers | parity web/native; no logic regression |
| **P4** | UI: filter shows all verified; **name in title + orgnr/opplæringskontor in expandable info** (D-5); no LOSA | E2E |
| **P5** | Generalize beyond veksling boundary + multi-fag; scheduled refresh | ops runner + smoke (new **standalone charter**, D-6) |

Steigen stays on the curated single entry **until P1 ingest covers it**, then is migrated (no double truth).

---

## 8. Owner decisions — RESOLVED (2026-06-25)

| # | Decision | **Owner choice** | Consequence |
|---|----------|------------------|-------------|
| D-1 | Boundary §5.4 | **Veksling / curated regional only** | Verified-employer roster is **surfaced/defaulted only in veksling & curated-regional `apprenticeship_step`s** for now. Ordinary Vilbli-derived apprenticeship tails are untouched (no NAV/Vilbli boundary disturbance). |
| D-2 | Source / access | **Finnlærebedrift open API (`api.utdanning.no`) primary, keyless → Vilbli/NLR/manual seed secondary; Brønnøysund for identity** *(amended 2026-06-29)* | Owner Vigo bedrift CSV not viable (portal closed); `data-nlr.udir.no` needs a key (401); but Udir NXR **recommended the open Finnlærebedrift API** — keyless, godkjent-only filter (`bedrifter_godkjente`), per fag/sted, and **complete** (incl. godkjent without a current lærekontrakt, which NLR omits). All trace to **VIGO**; Brønnøysund canonicalizes orgnr. |
| D-3 | Geography basis | **Registered kommune + fylke from the API; coords nullable** *(amended 2026-06-29)* | Finnlærebedrift list returns fylke/kommune (county from kommunenummer); coordinates not in the list response → nullable in P1, enrich later via detail endpoint / Brønnøysund. |
| D-4 | First P1 scope | **Carpenter (Tømrerfaget) nationwide** | Roster ingest covers carpenter across **all counties**, not just `18`. Note: per D-1, route-engine surfacing still only in veksling/curated-regional steps initially. |
| D-5 | UI display | **Name in title; orgnr + opplæringskontor in expandable info/source** | Clean option title; orgnr + opplæringskontor revealed in expandable source panel for transparency/auditability. |
| D-6 | Charter | **New standalone charter for the employer layer** | Scope exceeds Steigen pilot; gets its own charter + ops gates (this design gate is its P0). |

**Reconciliation (D-1 × D-4):** the **roster** (ingest + `larebedrift_truth`) is built **carpenter nationwide** (D-4), but **route-engine integration** (filter/default/order in routes) is initially limited to **veksling / curated-regional** apprenticeship steps (D-1). Ordinary apprenticeship tails remain Vilbli-derived until a later phase explicitly opens that boundary.

---

## 9. Non-goals (this layer)

- Ingesting **potensielle** (non-godkjent) employers into route truth
- Live external calls at runtime (master spec invariant)
- Replacing the NAV/Vilbli **outcome** scope
- Mixing employer truth into `programme_school_availability` (school PSA)
- Auto-ingest on page load / deploy

---

## 10. References

- `route-engine-master-spec.md` — §3 geography/travel realism, §4.X truth contract, NAV/Vilbli boundary
- `phase-4-route-mobile-api-contract-v1.md` — transport server-only, options order, web/native parity
- `phase-4-nordland-steigen-carpenter-veksling-pilot-charter.md` — §4.1 Tier 2 stop rule (now satisfiable)
- `src/server/vgs/VGS_OPERATIONAL_RUNNERS.md` — ops gate model
- Utdanning.no Finn Lærebedrift — `https://utdanning.no/finnlarebedrift/`; bedrift example `https://utdanning.no/finnlarebedrift/bedrift/995810166/`
- Vigo bedrift (NFK) — `https://www.nfk.no/tjenester/skole-og-opplaring/opplaring-i-bedrift/larebedrift/vigo-bedrift/`
- Vilbli oversikt lærebedrifter/opplæringskontor — `https://www.vilbli.no/nb/no/a/oversikt-laerebedrifter-og-samarbeidsorgan-opplaeringskontor-6`
- Brønnøysund Enhetsregisteret API — `https://data.brreg.no/enhetsregisteret/api/enheter/<orgnr>`

---

## 11. Sign-off

_Owner approval to enter P1:_ _____________ Date: _____________
